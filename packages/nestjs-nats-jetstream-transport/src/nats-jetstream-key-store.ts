import { Injectable } from '@nestjs/common';
import { KV, KvOptions } from 'nats/lib/nats-base-client/types';import { Observable } from 'rxjs';
import { NatsJetStreamClientProxy } from './client';


@Injectable()
// https://github.com/nats-io/nats.deno/blob/main/jetstream.md#kv
export class NatsJetStreamKeyStore {
  constructor(private client: NatsJetStreamClientProxy) {}
  async assertKeySpace(keySpaceName: string, options?: KvOptions) : Promise<KV> {
    const nc = await this.client.connect();
    return nc.jetstream().views.kv(keySpaceName, options);
  }
}
