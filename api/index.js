import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

const serverIp = "91.107.251.214";
const serverPort = 443;
const serverPath = "/"; // همان path که در inbound تعریف کردی

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws, request) => {
  const target = `ws://${serverIp}:${serverPort}${serverPath}`;
  const tunnel = new WebSocket(target, {
    rejectUnauthorized: false // برای تست
  });

  tunnel.on("open", () => {
    ws.on("message", msg => tunnel.send(msg));
    tunnel.on("message", msg => ws.send(msg));
  });

  tunnel.on("error", e => ws.close());
  ws.on("error", () => tunnel.close());
});

createServer((req, res) => {
  if (req.headers.upgrade?.toLowerCase() === "websocket") {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), ws => {
      wss.emit("connection", ws, req);
    });
  } else {
    res.writeHead(200);
    res.end("VLESS WS proxy active on Vercel (WebSocket version).");
  }
}).listen();
