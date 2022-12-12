import { ConnectionOptions, JetStreamOptions, StreamConfig } from 'nats';

export interface NatsJetStreamServerOptions {
  connectionOptions: Partial<ConnectionOptions>;
  jetStreamOptions?: JetStreamOptions;
  assertStreams?: StreamConfig[];
}
