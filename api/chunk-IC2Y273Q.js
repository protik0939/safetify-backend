// src/app/websocket.ts
import { WebSocketServer, WebSocket } from "ws";

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/websocket.ts
var rooms = /* @__PURE__ */ new Map();
var inactivityTimeouts = /* @__PURE__ */ new Map();
function initWebSocketServer(server) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (ws) => {
    let clientInfo = null;
    ws.on("message", async (message) => {
      try {
        const payload = JSON.parse(message);
        const { type, data } = payload;
        switch (type) {
          case "join_sos": {
            const { userId, incidentId, role, name, lat, lng } = data;
            clientInfo = { ws, userId, incidentId, role, name, lat, lng };
            if (!rooms.has(incidentId)) {
              rooms.set(incidentId, /* @__PURE__ */ new Set());
            }
            rooms.get(incidentId).add(clientInfo);
            console.log(`[WS] User ${name} (${role}) joined SOS incident ${incidentId}`);
            if (role === "victim") {
              const pendingTimeout = inactivityTimeouts.get(incidentId);
              if (pendingTimeout) {
                clearTimeout(pendingTimeout);
                inactivityTimeouts.delete(incidentId);
                console.log(`[WS] Cancelled auto-resolve timeout for SOS ${incidentId} (Victim reconnected)`);
              }
            }
            broadcastRoomUpdate(incidentId);
            break;
          }
          case "update_location": {
            if (clientInfo) {
              clientInfo.lat = data.lat;
              clientInfo.lng = data.lng;
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
                const newDesc = incident.description ? `${incident.description}${suffix}` : suffix;
                await prisma.incident.update({
                  where: { id: incidentId },
                  data: {
                    status: "resolved",
                    description: newDesc
                  }
                });
              }
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
          }, 5 * 60 * 60 * 1e3);
          inactivityTimeouts.set(incidentId, timeout);
        }
        console.log(`[WS] User ${name} disconnected from SOS ${incidentId}`);
      }
    });
  });
  console.log("[WS] WebSocket Server initialized on path /ws");
}
function broadcastRoomUpdate(incidentId) {
  const room = rooms.get(incidentId);
  if (!room) return;
  const activeUsers = Array.from(room).map((c) => ({
    userId: c.userId,
    name: c.name,
    role: c.role,
    lat: c.lat,
    lng: c.lng
  }));
  const message = JSON.stringify({
    type: "sos_state",
    data: {
      incidentId,
      users: activeUsers,
      totalResponders: activeUsers.filter((u) => u.role === "responder").length
    }
  });
  for (const client of room) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  }
}
function closeActiveSOSRoom(incidentId) {
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

export {
  prisma,
  rooms,
  initWebSocketServer,
  broadcastRoomUpdate,
  closeActiveSOSRoom
};
