import { EventPattern as OriginalEventPattern } from '@nestjs/microservices';
import { ServerConsumerOptions } from '../interfaces/server-consumer-options.interface';

/**
 * Subscribes to incoming events which fulfils chosen pattern.
 */
export const EventPattern = (
  metadata: any,
  transportOrExtras?: ServerConsumerOptions,
) => {
  return OriginalEventPattern(metadata, transportOrExtras);
};
