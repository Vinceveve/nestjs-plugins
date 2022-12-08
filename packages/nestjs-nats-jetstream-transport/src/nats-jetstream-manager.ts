import { Injectable, Inject } from '@nestjs/common';
import {
  Codec,
  JetStreamPublishOptions,
  JSONCodec,
  NatsConnection,
  PubAck,
  connect,
} from 'nats';
import {
  ConsumerInfo,
  JetStreamManager,
  Lister,
  MsgRequest,
  PurgeOpts,
  StoredMsg,
} from 'nats/lib/nats-base-client/types';
import { NATS_JETSTREAM_OPTIONS } from './constants';
import { NatsJetStreamClientOptions } from './interfaces/nats-jetstream-client-options.interface';

@Injectable()
export class NatsJetStreamManager {
  private connection: NatsConnection;
  private manager: JetStreamManager;

  constructor(
    @Inject(NATS_JETSTREAM_OPTIONS) private options: NatsJetStreamClientOptions,
  ) {}
  async purge(stream: string, opts: PurgeOpts) {
    const jsm = await this.assertConnectionManager();
    return jsm.streams.purge(stream, opts);
  }
  async find(subject: string) {
    const jsm = await this.assertConnectionManager();
    return jsm.streams.find(subject);
  }
  async getMessage(stream: string, opts: MsgRequest): Promise<StoredMsg> {
    const jsm = await this.assertConnectionManager();
    return jsm.streams.getMessage(stream, opts);
  }
  async deleteMessage<JSON>(
    stream: string,
    seq: number,
    erase?: boolean,
  ): Promise<boolean> {
    const jsm = await this.assertConnectionManager();
    return jsm.streams.deleteMessage(stream, seq, erase);
  }
  async listConsumer(stream: string): Promise<Lister<ConsumerInfo>> {
    const jsm = await this.assertConnectionManager();
    return jsm.consumers.list(stream);
  }
  async consumerInfo(
    stream: string,
    consumerName: string,
  ): Promise<ConsumerInfo> {
    const jsm = await this.assertConnectionManager();
    return jsm.consumers.info(stream, consumerName);
  }
  async deleteConsumer(stream: string, consumerName: string): Promise<boolean> {
    const jsm = await this.assertConnectionManager();
    return jsm.consumers.delete(stream, consumerName);
  }
  private async assertConnectionManager(): Promise<JetStreamManager> {
    if (!this.manager) {
      this.connection = await connect(this.options.connectionOptions);
      this.manager = await this.connection.jetstreamManager(
        this.options.jetStreamOption,
      );
    }

    return this.manager;
  }
  private async close(): Promise<void> {
    await this.connection.drain();
    await this.connection.close();
    this.connection = undefined;
  }
}
