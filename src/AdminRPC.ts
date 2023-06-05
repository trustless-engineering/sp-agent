import net from 'net';
import split2 from 'split2';


export default class AdminRPC {
  private client: net.Socket;
  private nonce: number = 0;
  private nonceMap: Map<number, string> = new Map();
  private interval: NodeJS.Timeout | null = null;
  constructor({ onData }: { onData: (data: any) => void }) {
    this.client = net.createConnection("/mnt/solana-ledger/admin.rpc", () => {
      console.log('[AdminRPC] connected to socket');
      this.requestContactInfo();
    });

    this.client.on('end', () => {
      console.log('[AdminRPC] disconnected from server');
    });

    this.client.pipe(split2()).on('data', (data) => {
      const message = JSON.parse(data.toString());

      if (message.error) {
        console.error('[AdminRPC] error', message.error);
        return;
      }

      const type = this.nonceMap.get(message.id);
      this.nonceMap.delete(message.id);

      const response = {
        type: `admin.${type}`,
        line: data.toString(),
        ts: new Date().toISOString(),
      }

      console.log(response);
      onData(JSON.stringify(response));
    });
  }

  public start(refreshSeconds: number = 10) {
    if (this.interval) {
      console.error('[AdminRPC] already started');
      return;
    }

    this.interval = setInterval(() => {
      this.requestStartProgress();
      this.requestStartTime();
    }, refreshSeconds * 1000);
  }

  public stop() {
    if (!this.interval) {
      console.error('[AdminRPC] already stopped');
      return;
    }

    clearInterval(this.interval);
    this.interval = null;
  }

  public requestStartProgress() {
    this.request('startProgress')
  }

  public requestStartTime() {
    this.request('startTime')
  }

  public requestContactInfo() {
    this.request('contactInfo')
  }

  public requestSecondaryIndexKeySize(pubKey: string) {
    this.request('secondaryIndexKeySize', [pubKey])
  }

  private request(method: string, params: any[] = []) {
    const requestNonce = this.nonce++;
    const request = {
      jsonrpc: "2.0",
      method: method,
      params: params,
      id: requestNonce,
    };

    this.nonceMap.set(requestNonce, method);
    this.client.write(`${JSON.stringify(request)}\r\n`);
  }
}

