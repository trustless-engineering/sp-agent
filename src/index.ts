import AdminRPC from './AdminRPC';
import SocketServer from './SocketServer';
import SourceSink from './SourceSink';

import fs from 'fs';
import { parse } from 'yaml';

type Config = {
  server: ServerConfig;
  sources: Array<SourceConfig>;
}

type ServerConfig = {
  port: number;
}

type SourceConfig = {
  name: string;
  file: string;
  filters?: Array<string>;
}

const file = fs.readFileSync('./config.yml', 'utf8')
const config: Config = parse(file);

const server = new SocketServer({ port: config.server.port });
server.start();

// Connect to the Admin RPC socket
const admin = new AdminRPC({ onData: server.sendMessage });
admin.start();


// Start all sources
const sources = config.sources.map((source: any) => {
  return new SourceSink({
    name: source.name,
    file: source.file,
    filters: source.filters || [],
    onData: server.sendMessage,
  })
});

sources.forEach((source) => {
  source.start();
});