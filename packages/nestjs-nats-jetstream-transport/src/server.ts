import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import {
  Codec,
  connect,
  NatsConnection,
  SubscriptionOptions,
  JSONCodec,
  JetStreamManager,
  JetStreamSubscription,
} from 'nats';
import { httpTransport, emitterFor, CloudEvent } from 'cloudevents';
import { NatsContext, NatsJetStreamContext } from './nats-jetstream.context';
import { serverConsumerOptionsBuilder } from './utils/server-consumer-options-builder';
import { from } from 'rxjs';
import { NatsJetStreamServerOptions } from './interfaces/nats-jetstream-server-options.interface';
import { ServerConsumerOptions } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

export class NatsJetStreamServer
  extends Server
  implements CustomTransportStrategy
{
  private nc: NatsConnection;
  private codec: Codec<JSON>;
  private jsm: JetStreamManager;

  constructor(private options: NatsJetStreamServerOptions) {
    super();
    this.codec = JSONCodec();
  }

  async listen(callback: () => null) {
    if (!this.nc) {
      this.nc = await connect(this.options.connectionOptions);
      if (this.options.connectionOptions.connectedHook) {
        this.options.connectionOptions.connectedHook(this.nc);
      }
    }
    this.jsm = await this.nc.jetstreamManager(this.options.jetStreamOptions);
    if (this.options.streamConfig) {
      await this.setupStream();
    }

    await this.bindEventHandlers();
    this.bindMessageHandlers();
    callback();
  }

  async close() {
    await this.nc.drain();
    await this.nc.close();
    this.nc = undefined;
  }
  private async bindEventHandlers() {
    const eventHandlers = [...this.messageHandlers.entries()].filter(
      ([, handler]) => handler.isEventHandler,
    );

    const js = this.nc.jetstream(this.options.jetStreamOptions);
    for (const [consumerName, eventHandler] of eventHandlers) {
      let subject: string;
      subject = eventHandler.extras?.subject;
      if (!subject) {
        subject = consumerName;
        this.logger.log(
          `No extra config set for EventPattern(${consumerName}) use transcient push consumer`,
        );
      }
      const consumerOptions = serverConsumerOptionsBuilder(
        eventHandler.extras as ServerConsumerOptions,
      );

      // https://docs.nats.io/nats-concepts/jetstream/consumers
      // Error: consumer info specifies deliver_subject - pull consumers cannot have deliver_subject set
      // No extras or deliverTo = pull subscription
      const subscription = eventHandler.extras?.deliverTo
        ? await js.subscribe(subject, consumerOptions)
        : await js.pullSubscribe(subject, consumerOptions);

      this.logger.log(
        `Subscribed to ${subject} events for ${consumerName} consumer `,
      );
      const done = (async () => {
        for await (const msg of subscription) {
          try {
            const data = this.codec.decode(msg.data);
            const context = new NatsJetStreamContext([msg]);
            this.send(from(eventHandler(data, context)), () => null);
          } catch (err) {
            this.logger.error(err.message, err.stack);
            // specifies that you failed to process the server and instructs
            // the server to not send it again (to any consumer)
            msg.term();
          }
        }
      })();
      done.then(() => {
        subscription.destroy();
        this.logger.log(`Unsubscribed ${subject} for consumer ${consumerName}`);
      });
    }
    // });
  }
  // For classic nats message
  private bindMessageHandlers() {
    // const messageHandlers = [...this.messageHandlers.entries()].filter(
    //   ([, handler]) => !handler.isEventHandler,
    // );
    // // FIXME Beurk !
    // this.options.consumers.forEach(async (options: ServerConsumerOptions) => {
    //   const subject = options.subject;
    //   const consumerOptions = serverConsumerOptionsBuilder(options, subject);
    //   // Maps event handler with consumer name
    //   for (const [mappedKey, messageHandler] of messageHandlers) {
    //     const subscriptionOptions: SubscriptionOptions = {
    //       queue: options.deliverTo,
    //       callback: async (err, msg) => {
    //         if (err) {
    //           return this.logger.error(err.message, err.stack);
    //         }
    //         const payload = this.codec.decode(msg.data);
    //         const context = new NatsContext([msg]);
    //         const response$ = this.transformToObservable(
    //           messageHandler(payload, context),
    //         );
    //         this.send(response$, (response) =>
    //           msg.respond(this.codec.encode(response as JSON)),
    //         );
    //       },
    //     };
    //     this.nc.subscribe(subject, subscriptionOptions);
    //     this.logger.log(`Subscribed to ${subject} messages`);
    //   }
    // });
  }

  private async setupStream() {
    const { streamConfig } = this.options;
    const streams = await this.jsm.streams.list().next();
    const stream = streams.find(
      (stream) => stream.config.name === streamConfig.name,
    );

    if (stream) {
      const streamInfo = await this.jsm.streams.update(stream.config.name, {
        ...stream.config,
        ...streamConfig,
      });
      this.logger.log(`Stream ${streamInfo.config.name} updated`);
    } else {
      const streamInfo = await this.jsm.streams.add(streamConfig);
      this.logger.log(`Stream ${streamInfo.config.name} created`);
      console.log(streamInfo.config);
    }
  }
}
