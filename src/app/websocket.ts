import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { prisma } from "./lib/prisma";

export interface ClientConnection {
  ws: WebSocket;
  userId: string;
  incidentId: string;
  role: "victim" | "responder" | "viewer";
  name: string;
  lat?: number;
  lng?: number;
}

// Global active connections map: roomName -> Set of ClientConnections
export const rooms = new Map<string, Set<ClientConnection>>();

// Keep track of pending inactivity auto-resolve timeouts for each incidentId
const inactivityTimeouts = new Map<string, NodeJS.Timeout>();

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

            // Remove any existing connection for this user in this room to avoid duplicate/stale state
            const existingRoom = rooms.get(incidentId);
            if (existingRoom) {
              for (const conn of existingRoom) {
                if (conn.userId === userId) {
                  existingRoom.delete(conn);
                  try {
                    conn.ws.close();
                  } catch (e) {}
                }
              }
            }

            clientInfo = { ws, userId, incidentId, role, name, lat, lng };

            if (!rooms.has(incidentId)) {
              rooms.set(incidentId, new Set());
            }
            rooms.get(incidentId)!.add(clientInfo);

            console.log(`[WS] User ${name} (${role}) joined SOS incident ${incidentId}`);

            // Cancel any pending inactivity timeout if the victim joins/reconnects
            if (role === "victim") {
              const pendingTimeout = inactivityTimeouts.get(incidentId);
              if (pendingTimeout) {
                clearTimeout(pendingTimeout);
                inactivityTimeouts.delete(incidentId);
                console.log(`[WS] Cancelled auto-resolve timeout for SOS ${incidentId} (Victim reconnected)`);
              }

              // Automatically remove this user as a responder from all other rooms
              for (const [otherIncidentId, otherRoom] of rooms.entries()) {
                if (otherIncidentId !== incidentId) {
                  for (const conn of otherRoom) {
                    if (conn.userId === userId && conn.role === 'responder') {
                      otherRoom.delete(conn);
                      try {
                        conn.ws.close();
                      } catch (e) {}
                      broadcastRoomUpdate(otherIncidentId);
                    }
                  }
                }
              }
            }

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
        const { incidentId, role, name } = clientInfo;
        const room = rooms.get(incidentId);
        if (room) {
          room.delete(clientInfo);
          if (room.size === 0) {
            rooms.delete(incidentId);
          } else {
            broadcastRoomUpdate(incidentId);
          }
        }

        // If the user who disconnected was the victim, set a 5-hour auto-resolve inactivity timer
        if (role === "victim") {
          console.log(`[WS] Victim ${name} disconnected. Scheduling 5-hour auto-resolve timer for SOS ${incidentId}`);
          
          const timeout = setTimeout(async () => {
            try {
              console.log(`[WS] Auto-resolving SOS ${incidentId} due to 5 hours of inactivity`);
              
              const incident = await prisma.incident.findUnique({
                where: { id: incidentId }
              });

              if (incident && incident.status !== "resolved") {
                const suffix = " (This incident stopped due to long time inactivity)";
                const newDesc = incident.description 
                  ? `${incident.description}${suffix}` 
                  : suffix;

                await prisma.incident.update({
                  where: { id: incidentId },
                  data: {
                    status: "resolved",
                    description: newDesc
                  }
                });
              }

              // Close any lingering responder connections in the room
              const activeRoom = rooms.get(incidentId);
              if (activeRoom) {
                const message = JSON.stringify({
                  type: "sos_resolved",
                  data: { incidentId }
                });
                for (const client of activeRoom) {
                  if (client.ws.readyState === WebSocket.OPEN) {
                    client.ws.send(message);
                  }
                  client.ws.close();
                }
                rooms.delete(incidentId);
              }
              inactivityTimeouts.delete(incidentId);
            } catch (err) {
              console.error(`[WS] Failed to auto-resolve SOS ${incidentId}:`, err);
            }
          }, 5 * 60 * 60 * 1000); // 5 hours in milliseconds

          inactivityTimeouts.set(incidentId, timeout);
        }

        console.log(`[WS] User ${name} disconnected from SOS ${incidentId}`);
      }
    });
  });

  console.log("[WS] WebSocket Server initialized on path /ws");
}

export function broadcastRoomUpdate(incidentId: string) {
  const room = rooms.get(incidentId);
  if (!room) return;

  const activeUsers = Array.from(room)
    .filter((c) => c.role !== 'viewer')
    .map((c) => ({
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

export function closeActiveSOSRoom(incidentId: string) {
  const activeRoom = rooms.get(incidentId);
  if (activeRoom) {
    const message = JSON.stringify({
      type: "sos_resolved",
      data: { incidentId }
    });
    for (const client of activeRoom) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
      client.ws.close();
    }
    rooms.delete(incidentId);
  }
  const pendingTimeout = inactivityTimeouts.get(incidentId);
  if (pendingTimeout) {
    clearTimeout(pendingTimeout);
    inactivityTimeouts.delete(incidentId);
  }
}
