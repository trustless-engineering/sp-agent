# sp-agent
A local daemon for keeping tabs on Solana RPC nodes and reporting to SOL Panel.

## Summary
sp-agent is a local daemon that checks the health of a Solana RPC node. It is designed to be run on the same machine as the RPC node, and runs a websocket server to report to Sol Panel.


# Socket API
The following objec are emitted:
## `log` events
These come from `SourceSink`'s and will emit an object in the following shape:

```json
{
  "type": "log",
  "source": "/path/to/file",
  "line": "log line",
  "ts": "2023-06-05T01:39:47.462Z",
}
```

## `admin.*` events
Events emitted from `AdminRPC` are polled via the `admin.rpc` socket in the Solana ledger. The will emit objects in the following shape:

```json
{
  "type": "admin.example",
  "message": {"arbitrary": true }, // This will be the shape of the original message
  "ts": "2023-06-05T01:39:47.462Z",
}
```

