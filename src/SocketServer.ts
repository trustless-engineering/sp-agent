import { WebSocketServer, WebSocket } from 'ws';

type SocketServerOptions = {
  port: number;
}
export default class SocketServer {
  private wss: WebSocketServer;
  private opts: SocketServerOptions;

  constructor(opts: SocketServerOptions = { port: 8910 }) {
    this.opts = opts;
    this.wss = new WebSocketServer({ port: this.opts.port });
  }
  
  public start() {
    this.wss.on("connection", function connection(ws: WebSocket) {
      ws.on("error", console.error);
    });
    console.log(`[SocketServer] Listening on port ${this.opts.port} for websocket connections`);
  }
  public sendMessage = (data: string) => {
    this.wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };
}