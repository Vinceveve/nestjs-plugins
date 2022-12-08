import { DynamicModule } from '@nestjs/common';
import { NATS_JETSTREAM_OPTIONS } from './constants';
import { NatsJetStreamClientOptions } from './interfaces/nats-jetstream-client-options.interface';
import { NatsJetStreamClient } from './nats-jetstream-client';
import { NatsJetStreamKeyStore } from './nats-jetstream-key-store';
import { NatsJetStreamManager } from './nats-jetstream-manager';

// noinspection JSUnusedGlobalSymbols
export class NatsJetStreamTransport {
  static register(options: NatsJetStreamClientOptions): DynamicModule {
    const providers = [
      {
        provide: NATS_JETSTREAM_OPTIONS,
        useValue: options,
      },
      NatsJetStreamClient,
      NatsJetStreamKeyStore,
      NatsJetStreamManager,
    ];

    return {
      providers,
      exports: providers,
      module: NatsJetStreamTransport,
    };
  }
}
