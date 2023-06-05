import net from 'net';
import split2 from 'split2';


export default class AdminRPC {
  private client!: net.Socket;
  private nonce: number = 0;
  private nonceMap: Map<number, string> = new Map();
  private interval: NodeJS.Timeout | null = null;
  private onData: (data: any) => void = () => { };
  constructor({ onData }: { onData: (data: any) => void }) {
    this.onData = onData;
    this.start();
  }

  private start(refreshSeconds: number = 10) {

    if (this.client) {
      console.error('[AdminRPC] already started');
      return;
    }

    try {
      this.client = net.createConnection("/mnt/solana-ledger/admin.rpc", () => {
        console.log('[AdminRPC] connected to socket');
        this.requestContactInfo();
      });
    } catch (err: any) {
      console.error('[AdminRPC] error connecting to socket, retrying in 5s...', err);
      setTimeout(() => {
        this.start();
      }, 1000 * 5);
      return;
    }

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
        message,
        ts: new Date().toISOString(),
      }

      this.onData(JSON.stringify(response));
    });

    if (this.interval) {
      console.error('[AdminRPC] already started');
      return;
    }

    this.interval = setInterval(() => {
      this.requestUpdate();
    }, refreshSeconds * 1000);
  }

  private requestUpdate() {
    this.requestContactInfo();
    this.requestStartTime();
    this.requestStartProgress();
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

