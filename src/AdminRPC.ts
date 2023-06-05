import net from 'net';
import split2 from 'split2';


export default class AdminRPC {
  private client: net.Socket;
  private nonce: number = 0;
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
      const response = {
        type: "admin",
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
      this.requestStartStatus();
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

  public requestStartStatus() {
    this.request('startStatus')
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
    const request = {
      jsonrpc: "2.0",
      method: method,
      params: params,
      id: this.nonce++,
    };
    this.client.write(`${JSON.stringify(request)}\r\n`);
  }
}

