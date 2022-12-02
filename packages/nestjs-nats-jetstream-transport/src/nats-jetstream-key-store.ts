import { Injectable } from '@nestjs/common';
import { KV, KvOptions } from 'nats/lib/nats-base-client/types';
import { NatsJetStreamClientProxy } from './client';


@Injectable()
// https://github.com/nats-io/nats.deno/blob/main/jetstream.md#kv
export class NatsJetStreamKeyStore {
  constructor(private client: NatsJetStreamClientProxy) {}
  async assertBucket(bucket: string, options?: Partial<KvOptions>) : Promise<KV> {
    const nc = await this.client.connect();
    return await nc.jetstream().views.kv(bucket, options);
  }

}
