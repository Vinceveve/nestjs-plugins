import { JetStreamPublishOptions } from "nats";

export interface JetStreamEvent {
    options: JetStreamPublishOptions,
    event: any
  }