import TailFile from '@logdna/tail-file';
import split2 from 'split2';


export type SourceSinkOptions = {
  name: string;
  file: string;
  filters: string[];
  onData?: (data: any) => void;
}

export default class SourceSink {
  public name: string;
  public file: string;
  public filters: string[];
  private onData?: (data: any) => void;
  private tail: TailFile;


  constructor({ name, file, filters, onData }: SourceSinkOptions) {
    this.name = name;
    this.file = file;
    this.filters = filters;
    this.onData = onData;

    this.tail = new TailFile(this.file);

    this.tail.on("tail_error", (err: Error) => {
      console.error("TailFile had an error!", err);
      throw err;
    });

    console.log(`[SourceSink] initialized ${this.file} as ${this.name}`);
  }


  public async start() {
    try {
      await this.tail.start();
    } catch (err: any) {
      if (err.code === "ENOENT") {
        console.error(`[SourceSink] file ${this.file} not found, retrying in 5s...`);
        setTimeout(() => {
          this.start();
        }, 1000 * 5);
        return;
      } else {
        throw err;
      }
    }

    this.tail.pipe(split2()).on("data", (line: string) => {
      if (this.filters.length > 0) {
        const matches = this.filters.filter((filter) => line.includes(filter));
        if (matches.length !== 0) {
          return;
        }
      }
      const response = {
        type: "log",
        source: this.file,
        line: line,
        ts: new Date().toISOString(),
      };
      console.log(response);
      this.onData?.(JSON.stringify(response));
    });
  }
}