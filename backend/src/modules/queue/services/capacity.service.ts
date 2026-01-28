import { Queue, IQueue } from "../queue.model.js";
import { Token, TokenStatus } from "../token.model.js";

export interface CapacityState {
  waitingCount: number;
  capacity: number;
  isFull: boolean;
}

export const countWaitingTokens = async (queueId: string): Promise<number> => {
  return Token.countDocuments({
    queue: queueId,
    status: TokenStatus.WAITING,
  });
};

/**
 * Recalculate whether a queue is full based on current waiting tokens.
 * Updates the queue.isFull flag if it is out of sync.
 */
export const syncQueueFullFlag = async (
  queueId: string,
): Promise<CapacityState | null> => {
  const queue = await Queue.findById(queueId);
  if (!queue) return null;

  const capacity = queue.capacity || 50;
  queue.capacity = capacity;

  const waitingCount = await countWaitingTokens(queueId);
  const isFull = waitingCount >= capacity;

  if (queue.isFull !== isFull) {
    queue.isFull = isFull;
    await queue.save();
  } else if (queue.isModified("capacity")) {
    await queue.save();
  }

  return {
    waitingCount,
    capacity,
    isFull,
  };
};

/**
 * Checks capacity without mutating state, but ensures any stale `isFull`
 * flag is corrected when the queue is already at/over capacity.
 */
export const ensureCapacityAvailable = async (
  queueId: string,
): Promise<{ queue: IQueue | null; waitingCount: number; isFull: boolean; capacity: number }> => {
  const queue = await Queue.findById(queueId);
  if (!queue) {
    return { queue: null, waitingCount: 0, isFull: false, capacity: 0 };
  }

  const capacity = queue.capacity || 50;
  queue.capacity = capacity;

  const waitingCount = await countWaitingTokens(queueId);
  const isFull = waitingCount >= capacity;

  if (queue.isFull !== isFull) {
    queue.isFull = isFull;
    await queue.save();
  }

  if (queue.isModified("capacity") && !queue.isNew) {
    await queue.save();
  }

  return { queue, waitingCount, isFull, capacity };
};
