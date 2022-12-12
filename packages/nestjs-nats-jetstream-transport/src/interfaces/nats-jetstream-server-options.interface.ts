import { ConnectionOptions, JetStreamOptions } from 'nats';
import { NatsStreamConfig } from './nats-stream-config.interface';

export interface NatsJetStreamServerOptions {
  connectionOptions: Partial<ConnectionOptions>;
  jetStreamOptions?: JetStreamOptions;
  assertStreams?: NatsStreamConfig[];
}
