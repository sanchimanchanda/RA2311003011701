/**
 * Priority Engine — Stage 1 Core Logic
 * 
 * Implements efficient Top-N priority notification retrieval
 * using a Min-Heap data structure.
 * 
 * Priority is determined by:
 * 1. Type Weight: Placement (3) > Result (2) > Event (1)
 * 2. Recency: Newer notifications rank higher within the same type
 * 
 * Complexity:
 * - Time:  O(N × log K) where N = total notifications, K = top count
 * - Space: O(K)
 */

import {
  Notification,
  EnrichedNotification,
  NotificationType,
  TYPE_WEIGHTS,
} from './types';

/**
 * Weight multiplier to ensure type always dominates over recency.
 * 10 billion ensures no timestamp can bridge the gap between types.
 */
const WEIGHT_MULTIPLIER = 10_000_000_000;

/**
 * Min-Heap node containing a notification and its priority score.
 */
interface HeapNode {
  notification: Notification;
  score: number;
}

/**
 * Min-Heap implementation for efficient Top-N extraction.
 * 
 * The heap maintains the K highest-priority items seen so far.
 * The root is always the minimum element, so we can efficiently
 * check if a new element should replace it.
 */
class MinHeap {
  private heap: HeapNode[] = [];
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  /** Current number of elements in the heap */
  get size(): number {
    return this.heap.length;
  }

  /** Peek at the minimum element without removing it */
  peekMin(): HeapNode | undefined {
    return this.heap[0];
  }

  /** Insert a new element into the heap */
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

  /** Extract all elements sorted by descending priority */
  extractAllSorted(): HeapNode[] {
    const result = [...this.heap];
    result.sort((a, b) => b.score - a.score);
    return result;
  }

  /** Bubble up element at index to restore heap property */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].score <= this.heap[index].score) break;
      this.swap(parentIndex, index);
      index = parentIndex;
    }
  }

  /** Sink down element at index to restore heap property */
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

  /** Swap two elements in the heap */
  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}

/**
 * Calculate the priority score for a notification.
 * 
 * Score = TypeWeight × WEIGHT_MULTIPLIER + TimestampMs
 * 
 * This ensures strict type ordering (Placement > Result > Event)
 * with recency as the tiebreaker within the same type.
 * 
 * @param notification - The notification to score
 * @returns Priority score (higher = more important)
 */
export function calculatePriorityScore(notification: Notification): number {
  const typeWeight = TYPE_WEIGHTS[notification.Type] || 1;
  const timestampMs = new Date(notification.Timestamp).getTime();
  return typeWeight * WEIGHT_MULTIPLIER + timestampMs;
}

/**
 * Get the Top N highest-priority unread notifications.
 * 
 * Uses a Min-Heap for O(N log K) performance.
 * 
 * @param notifications - All notifications from the API
 * @param n - Number of top notifications to return (default: 10)
 * @param readIds - Set of notification IDs that have been read
 * @returns Top N unread notifications sorted by priority (descending)
 */
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

/**
 * Enrich all notifications with priority scores and read status.
 * 
 * @param notifications - Raw notifications from API
 * @param readIds - Set of read notification IDs
 * @returns Enriched notifications with priority scores
 */
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

/**
 * Sort notifications by priority (descending).
 * 
 * @param notifications - Enriched notifications
 * @returns Sorted notifications
 */
export function sortByPriority(
  notifications: EnrichedNotification[]
): EnrichedNotification[] {
  return [...notifications].sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Filter notifications by type.
 * 
 * @param notifications - Notifications to filter
 * @param type - Type to filter by (or null for all)
 * @returns Filtered notifications
 */
export function filterByType(
  notifications: Notification[],
  type: NotificationType | null
): Notification[] {
  if (!type) return notifications;
  return notifications.filter((n) => n.Type === type);
}
