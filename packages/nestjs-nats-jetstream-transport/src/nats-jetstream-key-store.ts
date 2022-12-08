import {
  NatsJetStreamClient,
  NatsJetStreamClientOptions,
} from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Injectable, Inject } from '@nestjs/common';
import { Codec, connect, JSONCodec } from 'nats';
import { KV, KvOptions, NatsConnection } from 'nats/lib/nats-base-client/types';
import { NATS_JETSTREAM_OPTIONS } from './constants';

@Injectable()
// https://github.com/nats-io/nats.deno/blob/main/jetstream.md#kv
export class NatsJetStreamKeyStore {
  private nc: NatsConnection;
  private codec: Codec<JSON>;

  constructor(
    @Inject(NATS_JETSTREAM_OPTIONS) private options: NatsJetStreamClientOptions,
  ) {
    this.codec = JSONCodec();
  }
  async assertBucket(
    bucket: string,
    options?: Partial<KvOptions>,
  ): Promise<KV> {
    const nc = await this.assertConnection();
    return await nc.jetstream().views.kv(bucket, options);
  }
  private async assertConnection(): Promise<NatsConnection> {
    if (!this.nc) {
      this.nc = await connect(this.options.connectionOptions);
    }

    return this.nc;
  }
  private async close(): Promise<void> {
    await this.nc.drain();
    await this.nc.close();
    this.nc = undefined;
  }
}
