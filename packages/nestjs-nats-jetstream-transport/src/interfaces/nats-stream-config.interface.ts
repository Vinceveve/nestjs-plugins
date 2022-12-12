import { StreamConfig } from 'nats';

export interface NatsStreamConfig extends Partial<StreamConfig> {
  name: string;
  subjects: string[];
}
