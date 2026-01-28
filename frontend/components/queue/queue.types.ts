export type QueueStatus = 'open' | 'full' | 'paused' | 'serving';

export interface Queue {
  queueId: string;
  queueName: string;
  location: string;
  counterNumber: number;
  queueLength: number;
  /** Wait time in minutes */
  waitTime: number;
  status: QueueStatus;
  capacity?: number;
  isFull?: boolean;
}

export type Queues = Queue[];

export const defaultQueue: Queue = {
  queueId: 'Q-0000',
  queueName: 'Default',
  location: 'Unknown',
  counterNumber: 0,
  queueLength: 0,
  waitTime: 0,
  status: 'open',
};
