import { Injectable, Inject } from '@nestjs/common';
import {
  Codec,
  JetStreamPublishOptions,
  JSONCodec,
  NatsConnection,
  PubAck,
  connect,
} from 'nats';
import { NATS_JETSTREAM_OPTIONS } from './constants';
import { NatsJetStreamClientOptions } from './interfaces/nats-jetstream-client-options.interface';

@Injectable()
export class NatsJetStreamClient {
  private nc: NatsConnection;
  private codec: Codec<JSON>;

  constructor(
    @Inject(NATS_JETSTREAM_OPTIONS) private options: NatsJetStreamClientOptions,
  ) {
    this.codec = JSONCodec();
  }
  async publish<JSON>(
    pattern: any,
    event: any,
    publishOptions?: Partial<JetStreamPublishOptions>,
  ): Promise<PubAck> {
    const natsConnection = await this.assertConnection();
    const payload = this.codec.encode(event);
    const js = natsConnection.jetstream(this.options.jetStreamOption);
    return js.publish(pattern, payload, publishOptions);
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
