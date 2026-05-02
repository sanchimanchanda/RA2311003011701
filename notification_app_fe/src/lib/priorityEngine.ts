import {
  Notification,
  EnrichedNotification,
  NotificationType,
  TYPE_WEIGHTS,
} from './types';

const WEIGHT_MULTIPLIER = 10_000_000_000;

interface HeapNode {
  notification: Notification;
  score: number;
}

class MinHeap {
  private heap: HeapNode[] = [];
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get size(): number {
    return this.heap.length;
  }

  peekMin(): HeapNode | undefined {
    return this.heap[0];
  }

  push(node: HeapNode): void {
    if (this.heap.length < this.capacity) {
      this.heap.push(node);
      this.bubbleUp(this.heap.length - 1);
    } else if (node.score > this.heap[0].score) {
      // Replace the minimum with the new higher-priority element
      this.heap[0] = node;
      this.sinkDown(0);
    }
  }

  extractAllSorted(): HeapNode[] {
    const result = [...this.heap];
    result.sort((a, b) => b.score - a.score);
    return result;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].score <= this.heap[index].score) break;
      this.swap(parentIndex, index);
      index = parentIndex;
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.heap[left].score < this.heap[smallest].score) {
        smallest = left;
      }
      if (right < length && this.heap[right].score < this.heap[smallest].score) {
        smallest = right;
      }
      if (smallest === index) break;
      this.swap(smallest, index);
      index = smallest;
    }
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}

export function calculatePriorityScore(notification: Notification): number {
  const typeWeight = TYPE_WEIGHTS[notification.Type] || 1;
  const timestampMs = new Date(notification.Timestamp).getTime();
  return typeWeight * WEIGHT_MULTIPLIER + timestampMs;
}

export function getTopNUnread(
  notifications: Notification[],
  n: number = 10,
  readIds: Set<string> = new Set()
): EnrichedNotification[] {
  const heap = new MinHeap(n);

  for (const notification of notifications) {
    // Skip read notifications
    if (readIds.has(notification.ID)) continue;

    const score = calculatePriorityScore(notification);
    heap.push({ notification, score });
  }

  // Extract sorted results and enrich with metadata
  return heap.extractAllSorted().map(({ notification, score }) => ({
    ...notification,
    priorityScore: score,
    isRead: false,
  }));
}

export function enrichNotifications(
  notifications: Notification[],
  readIds: Set<string> = new Set()
): EnrichedNotification[] {
  return notifications.map((notification) => ({
    ...notification,
    priorityScore: calculatePriorityScore(notification),
    isRead: readIds.has(notification.ID),
  }));
}

export function sortByPriority(
  notifications: EnrichedNotification[]
): EnrichedNotification[] {
  return [...notifications].sort((a, b) => b.priorityScore - a.priorityScore);
}

export function filterByType(
  notifications: Notification[],
  type: NotificationType | null
): Notification[] {
  if (!type) return notifications;
  return notifications.filter((n) => n.Type === type);
}
