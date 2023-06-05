"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var SocketServer = /** @class */ (function () {
    function SocketServer(opts) {
        if (opts === void 0) { opts = { port: 8910 }; }
        var _this = this;
        this.sendMessage = function (data) {
            _this.wss.clients.forEach(function each(client) {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    client.send(data);
                }
            });
        };
        this.opts = opts;
        this.wss = new ws_1.WebSocketServer({ port: this.opts.port });
    }
    SocketServer.prototype.start = function () {
        this.wss.on("connection", function connection(ws) {
            ws.on("error", console.error);
        });
        console.log("[SocketServer] Listening on port ".concat(this.opts.port, " for websocket connections"));
    };
    return SocketServer;
}());
exports.default = SocketServer;
