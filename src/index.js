"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AdminRPC_1 = require("./AdminRPC");
var SocketServer_1 = require("./SocketServer");
var SourceSink_1 = require("./SourceSink");
var fs_1 = require("fs");
var yaml_1 = require("yaml");
var file = fs_1.default.readFileSync('./config.yml', 'utf8');
var config = (0, yaml_1.parse)(file);
var server = new SocketServer_1.default({ port: config.server.port });
server.start();
// Connect to the Admin RPC socket
var admin = new AdminRPC_1.default({ onData: server.sendMessage });
admin.start();
// Start all sources
var sources = config.sources.map(function (source) {
    return new SourceSink_1.default({
        name: source.name,
        file: source.file,
        filters: source.filters || [],
        onData: server.sendMessage,
    });
});
sources.forEach(function (source) {
    source.start();
});
