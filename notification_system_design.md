# Notification System Design

## 1. Problem Definition

Design and implement a **Campus Notifications System** that serves as the primary communication channel for campus-related updates. The system must deliver notifications of varying types (Event, Result, Placement) to students, with intelligent prioritization ensuring the most critical and time-sensitive notifications surface first.

### Core Challenge
- Handling heterogeneous notification types with different urgency levels
- Efficient Top-N retrieval from potentially large datasets
- Real-time delivery with graceful degradation under load
- Maintaining read/unread state across sessions

---

## 2. Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| FR-1 | Fetch notifications from external API | P0 |
| FR-2 | Display all notifications with pagination | P0 |
| FR-3 | Filter notifications by type (Event, Result, Placement) | P0 |
| FR-4 | Calculate priority score based on type weight + recency | P0 |
| FR-5 | Return Top N priority unread notifications | P0 |
| FR-6 | Track read/unread status per notification | P0 |
| FR-7 | Visually distinguish read vs unread notifications | P0 |
| FR-8 | Responsive design for mobile, tablet, desktop | P1 |
| FR-9 | Centralized logging for all operations | P0 |
| FR-10 | Authentication flow (register → auth → token) | P0 |

---

## 3. Non-Functional Requirements

| ID | Requirement | Target |
|----|------------|--------|
| NFR-1 | Page load time | < 2 seconds |
| NFR-2 | Priority computation (Top 10 from 10K items) | < 50ms |
| NFR-3 | UI responsiveness | 60fps animations |
| NFR-4 | Accessibility | WCAG 2.1 AA |
| NFR-5 | Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| NFR-6 | Token refresh | Automatic on 401, transparent to user |
| NFR-7 | Log delivery | Best-effort with retry |
| NFR-8 | Availability | 99.9% uptime target |

---

## 4. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  All Notifs   │  │  Priority     │  │  Layout /    │  │
│  │  Page         │  │  Page         │  │  Navigation  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
│         │                  │                             │
│  ┌──────▼──────────────────▼───────┐                    │
│  │        Custom React Hooks        │                    │
│  │  useNotifications, useReadStatus │                    │
│  └──────────────┬──────────────────┘                    │
│                 │                                        │
│  ┌──────────────▼──────────────────┐                    │
│  │         Service Layer            │                    │
│  │  ┌─────────┐  ┌──────────────┐  │                    │
│  │  │ API      │  │ Priority     │  │                    │
│  │  │ Client   │  │ Engine       │  │                    │
│  │  └────┬────┘  │ (Min-Heap)   │  │                    │
│  │       │       └──────────────┘  │                    │
│  │  ┌────▼────┐                    │                    │
│  │  │ Auth    │                    │                    │
│  │  │ Manager │                    │                    │
│  │  └────┬────┘                    │                    │
│  └───────┼─────────────────────────┘                    │
│          │                                               │
│  ┌───────▼─────────────────────────┐                    │
│  │     Logging Middleware           │                    │
│  │     Log(stack, level, pkg, msg)  │                    │
│  └───────┬─────────────────────────┘                    │
│          │                                               │
└──────────┼───────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│   Evaluation Service API        │
│   http://20.207.122.201         │
│                                  │
│   POST /register                 │
│   POST /auth                     │
│   GET  /notifications            │
│   POST /logs                     │
└─────────────────────────────────┘
```

---

## 5. Notification Priority Strategy

### 5.1 Priority Score Formula

```
PriorityScore = (TypeWeight × WEIGHT_MULTIPLIER) + RecencyScore
```

Where:
- **TypeWeight**: Placement = 3, Result = 2, Event = 1
- **WEIGHT_MULTIPLIER**: 10,000,000,000 (ensures type always dominates)
- **RecencyScore**: Unix timestamp in milliseconds (newer = higher)

### 5.2 Why This Formula Works

The multiplier ensures strict ordering by type first: even the oldest Placement notification scores higher than the newest Result. Within the same type, newer notifications rank higher due to the millisecond timestamp tiebreaker.

### 5.3 Algorithm: Min-Heap for Top-N

```
Algorithm: GetTopNUnread(notifications, N, readSet)
─────────────────────────────────────────────────
1. Initialize MinHeap of capacity N
2. For each notification n in notifications:
   a. If n.ID ∈ readSet → skip
   b. Compute score = priority(n)
   c. If heap.size < N → heap.push(n, score)
   d. Else if score > heap.peekMin().score:
      - heap.popMin()
      - heap.push(n, score)
3. Return heap.extractAll() sorted descending

Time Complexity:  O(N × log K) where K = top count
Space Complexity: O(K)
```

### 5.4 Why Min-Heap Over Full Sort?

| Approach | Time | Space | Best For |
|----------|------|-------|----------|
| Full Sort | O(N log N) | O(N) | Small datasets |
| **Min-Heap** | **O(N log K)** | **O(K)** | **Large N, small K** |
| QuickSelect | O(N) avg | O(N) | Single kth element |

For our use case (Top 10 from potentially thousands), Min-Heap is optimal.

---

## 6. Scalability: Real-Time Updates

### 6.1 Current: Polling

```
Client ──[GET /notifications every 30s]──▶ API Server
```

Simple, works for MVP. Configurable interval.

### 6.2 Next Phase: WebSocket / SSE

```
Client ◄──[WebSocket persistent connection]──▶ Notification Gateway
                                                      │
                                                ┌─────▼─────┐
                                                │  Message    │
                                                │  Broker     │
                                                └─────┬─────┘
                                                      │
                                              ┌───────▼───────┐
                                              │ Notification   │
                                              │ Service        │
                                              └───────────────┘
```

### 6.3 Scaling Strategy

| Component | Strategy |
|-----------|----------|
| API Gateway | Horizontal scaling behind load balancer |
| WebSocket Servers | Sticky sessions + Redis pub/sub for cross-node delivery |
| Notification Storage | Sharded by user ID |
| Read Status | Redis bitmap per user (O(1) lookup) |
| Priority Computation | Edge computation on client; server-side for API consumers |

---

## 7. Queue System

### 7.1 Architecture with Kafka

```
┌──────────────┐     ┌─────────────┐     ┌──────────────────┐
│ Notification  │────▶│   Kafka     │────▶│  Consumer Groups  │
│ Producers     │     │   Cluster   │     │                   │
│               │     │             │     │  ┌─────────────┐  │
│ - Admin Panel │     │ Topics:     │     │  │ Priority    │  │
│ - Placement   │     │ - events    │     │  │ Calculator  │  │
│   Portal      │     │ - results   │     │  └─────────────┘  │
│ - Event Mgr   │     │ - placement │     │  ┌─────────────┐  │
│               │     │             │     │  │ Notification │  │
│               │     │ Partitions: │     │  │ Dispatcher   │  │
│               │     │ By user_id  │     │  └─────────────┘  │
└──────────────┘     └─────────────┘     │  ┌─────────────┐  │
                                          │  │ Log          │  │
                                          │  │ Aggregator   │  │
                                          │  └─────────────┘  │
                                          └──────────────────┘
```

### 7.2 Why Kafka Over RabbitMQ?

| Feature | Kafka | RabbitMQ |
|---------|-------|----------|
| Throughput | ~1M msg/s | ~50K msg/s |
| Ordering | Per-partition guaranteed | Per-queue |
| Replay | ✅ Configurable retention | ❌ Consumed = gone |
| Consumer Groups | ✅ Native | Manual |
| **Best For** | **Event streaming, audit logs** | Point-to-point messaging |

**Decision**: Kafka — notifications are event-driven, need ordering guarantees, and logs benefit from replay capability for debugging.

### 7.3 Topic Design

| Topic | Partition Key | Consumers |
|-------|--------------|-----------|
| `campus.notifications.events` | `user_id` | Priority Calculator, WebSocket Dispatcher |
| `campus.notifications.results` | `user_id` | Priority Calculator, Email Service |
| `campus.notifications.placements` | `user_id` | Priority Calculator, SMS Service (urgent) |
| `campus.logs.frontend` | `session_id` | Log Aggregator, Alerting Service |

---

## 8. Failure Handling

### 8.1 Client-Side

| Failure | Strategy |
|---------|----------|
| API unreachable | Exponential backoff retry (1s, 2s, 4s, 8s, max 60s) |
| 401 Unauthorized | Auto re-register + re-authenticate, retry original request |
| 429 Rate Limited | Respect `Retry-After` header, queue requests |
| Network offline | Cache last-known notifications in localStorage, show stale indicator |
| Log delivery failure | Buffer logs in memory (max 1000), flush on reconnect |

### 8.2 Server-Side (Design)

| Failure | Strategy |
|---------|----------|
| Kafka broker down | Producer retries with idempotency key; consumer offset auto-commit disabled |
| Database failure | Circuit breaker pattern; fallback to read-replica |
| Consumer crash | Consumer group rebalancing; uncommitted messages re-delivered |
| Notification loss | Dead letter queue (DLQ) for failed deliveries; manual retry endpoint |

### 8.3 Circuit Breaker Pattern

```
States: CLOSED ──[failure threshold]──▶ OPEN ──[timeout]──▶ HALF-OPEN
                                                                │
                                          ┌─success─▶ CLOSED    │
                                          │                      │
                                     HALF-OPEN ◄────────────────┘
                                          │
                                          └─failure─▶ OPEN
```

Configuration:
- **Failure threshold**: 5 consecutive failures
- **Open duration**: 30 seconds
- **Half-open probe**: 1 request allowed through

---

## 9. Rate Limiting

### 9.1 Client-Side Rate Limiting

```typescript
// Token bucket algorithm
class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private maxTokens: number = 10,      // Max burst
    private refillRate: number = 2,       // Tokens per second
  ) {}

  canProceed(): boolean {
    this.refill();
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }
}
```

### 9.2 API Rate Limits (Recommended)

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /register` | 5 requests | Per hour per IP |
| `POST /auth` | 10 requests | Per minute per client |
| `GET /notifications` | 60 requests | Per minute per token |
| `POST /logs` | 100 requests | Per minute per token |

### 9.3 Implementation Layers

1. **API Gateway**: Global rate limiting (nginx `limit_req`)
2. **Application**: Per-user token bucket
3. **Client**: Request deduplication + debounce

---

## 10. Data Flow Diagram

```
User Action → React Component → Custom Hook → API Client
                                                    │
                                              [Auth Check]
                                                    │
                                              [API Request]
                                                    │
                                         ┌──────────▼──────────┐
                                         │  Response Handler    │
                                         │  ├─ 200: Parse data │
                                         │  ├─ 401: Re-auth    │
                                         │  ├─ 429: Rate limit │
                                         │  └─ 5xx: Retry      │
                                         └──────────┬──────────┘
                                                    │
                                              [Log via Logger]
                                                    │
                                         ┌──────────▼──────────┐
                                         │  State Update        │
                                         │  └─ Re-render UI    │
                                         └─────────────────────┘
```

---

## 11. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14 (App Router) | SSR, file-based routing, React Server Components |
| UI Library | Material UI v5 | Mandated by requirements; rich component library |
| Language | TypeScript 5.4 | Type safety, better DX, fewer runtime errors |
| State | React hooks + localStorage | No external state library needed for this scope |
| Auth | Custom OAuth 2.0 flow | Client credentials grant type |
| Logging | Custom middleware | Type-safe, centralized, API-backed |
| Build | Next.js built-in (Turbopack) | Fast builds, HMR |

---

## 12. Security Considerations

1. **Token Storage**: In-memory only (not localStorage) to prevent XSS token theft
2. **CORS**: API must whitelist client origin
3. **Input Sanitization**: All notification messages rendered with React's built-in XSS protection
4. **CSP Headers**: Strict Content-Security-Policy in production
5. **Secret Rotation**: Client credentials should be rotatable without downtime
