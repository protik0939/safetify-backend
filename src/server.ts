import app from "./app";
import http from "http";
import { initWebSocketServer } from "./app/websocket";

const port = process.env.PORT || 5000;


const bootstrap = () => {
  try {
    const server = http.createServer(app);

    // Initialize WebSockets
    initWebSocketServer(server);

    server.listen(port, () => {
      console.log(`server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to Start Server: ", error);
  }
};

bootstrap();