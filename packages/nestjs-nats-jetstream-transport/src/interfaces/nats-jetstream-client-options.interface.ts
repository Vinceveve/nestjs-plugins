import { ModuleMetadata } from '@nestjs/common';
import { ConnectionOptions, JetStreamOptions } from 'nats';

export interface NatsJetStreamClientOptions {
  connectionOptions: Partial<ConnectionOptions>;
  jetStreamOption?: JetStreamOptions;
}

// noinspection JSUnusedGlobalSymbols
export interface NatsJetStreamClientAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: any[]
  ) => Promise<NatsJetStreamClientOptions> | NatsJetStreamClientOptions;
  inject?: any[];
}
