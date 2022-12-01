import { Injectable } from '@nestjs/common';
import { JetStreamPublishOptions, NatsConnection, PubAck } from 'nats';
import { Observable } from 'rxjs';
import { NatsJetStreamClientProxy } from './client';
import { JetStreamEvent } from './interfaces/nats-event-options.interface';

@Injectable()
export class NatsJetStreamClient {
  constructor(private client: NatsJetStreamClientProxy) {}
  emit<TInput>(pattern: any, event: TInput, options?: JetStreamPublishOptions): Observable<PubAck> {
    // TODO see if possible to keep same syntax with ClientProxy
    return this.client.emit<PubAck, JetStreamEvent>(pattern, {event, options});
  }
  send<TInput>(pattern: any, data: TInput): Observable<PubAck> {
    return this.client.send<PubAck, TInput>(pattern, data);
  }
  async connect(): Promise<NatsConnection> {
    return this.client.connect();
  }
  async close(): Promise<void> {
    return this.client.close();
  }
}
