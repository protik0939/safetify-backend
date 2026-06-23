import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

export interface ClientConnection {
  ws: WebSocket;
  userId: string;
  incidentId: string;
  role: "victim" | "responder";
  name: string;
  lat?: number;
  lng?: number;
}

// Global active connections map: roomName -> Set of ClientConnections
export const rooms = new Map<string, Set<ClientConnection>>();

export function initWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    let clientInfo: ClientConnection | null = null;

    ws.on("message", async (message: string) => {
      try {
        const payload = JSON.parse(message);
        const { type, data } = payload;

        switch (type) {
          case "join_sos": {
            const { userId, incidentId, role, name, lat, lng } = data;

            clientInfo = { ws, userId, incidentId, role, name, lat, lng };

            if (!rooms.has(incidentId)) {
              rooms.set(incidentId, new Set());
            }
            rooms.get(incidentId)!.add(clientInfo);

            console.log(`[WS] User ${name} (${role}) joined SOS incident ${incidentId}`);

            // Broadcast the room update
            broadcastRoomUpdate(incidentId);
            break;
          }

          case "update_location": {
            if (clientInfo) {
              clientInfo.lat = data.lat;
              clientInfo.lng = data.lng;

              // Broadcast location update to the room
              broadcastRoomUpdate(clientInfo.incidentId);
            }
            break;
          }

          case "ping": {
            ws.send(JSON.stringify({ type: "pong" }));
            break;
          }
        }
      } catch (err) {
        console.error("[WS] Error handling message:", err);
      }
    });

    ws.on("close", () => {
      if (clientInfo) {
        const { incidentId } = clientInfo;
        const room = rooms.get(incidentId);
        if (room) {
          room.delete(clientInfo);
          if (room.size === 0) {
            rooms.delete(incidentId);
          } else {
            broadcastRoomUpdate(incidentId);
          }
        }
        console.log(`[WS] User ${clientInfo.name} disconnected from SOS ${incidentId}`);
      }
    });
  });

  console.log("[WS] WebSocket Server initialized on path /ws");
}

export function broadcastRoomUpdate(incidentId: string) {
  const room = rooms.get(incidentId);
  if (!room) return;

  const activeUsers = Array.from(room).map((c) => ({
    userId: c.userId,
    name: c.name,
    role: c.role,
    lat: c.lat,
    lng: c.lng,
  }));

  const message = JSON.stringify({
    type: "sos_state",
    data: {
      incidentId,
      users: activeUsers,
      totalResponders: activeUsers.filter((u) => u.role === "responder").length,
    },
  });

  for (const client of room) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  }
}
