import { User, Post, Comment } from '../types/blog';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@chronicle.dev',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4',
    bio: 'Principal Systems Architect & Technical Writer. Passionate about distributed primitives and low-latency engines.',
    role: 'author',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Alex Rivera',
    email: 'alex.rivera@chronicle.dev',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede',
    bio: 'Full-Stack Developer crafting resilient web applications, GraphQL schemas, and offline-first interfaces.',
    role: 'author',
    createdAt: '2026-02-15T11:20:00Z',
  },
  {
    id: 'user-3',
    name: 'Devin Chen',
    email: 'devin.chen@chronicle.dev',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Devin&backgroundColor=d1d4f9',
    bio: 'Database Systems Researcher specializing in consensus protocols, write amplification, and LSM-tree indexing.',
    role: 'author',
    createdAt: '2026-03-01T14:45:00Z',
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'Architecting Resilient RESTful APIs for High-Concurrency Microservices',
    subtitle: 'From idempotent transaction boundaries to pragmatic hypermedia and cache invalidation.',
    excerpt: 'Building scalable RESTful services requires more than HTTP verb mapping. We dissect transaction semantics, etags, circuit breakers, and rate limiting patterns that survive real production traffic spikes.',
    content: `# The Anatomy of Production RESTful Architectures

Modern web platforms frequently stumble when transitioning from monolithic prototypes to decoupled, high-concurrency architectures. While basic HTTP routing is trivial in modern runtimes, engineering truly resilient APIs requires disciplined attention to idempotency, resource boundary modeling, and cache synchronization.

## 1. Idempotency Keys and Safe Mutation Retries

When a client initiates a sensitive state transition—such as an article publication or transaction ledger entry—network partitions can leave the caller uncertain whether the request executed.

\`\`\`typescript
interface IdempotentRequest<T> {
  idempotencyKey: string;
  timestamp: number;
  payload: T;
}
\`\`\`

By enforcing uniqueness constraints over an \`Idempotency-Key\` HTTP header, backends can store deterministic execution receipts in high-speed key-value stores. Subsequent identical requests yield cached results without duplicating state transitions.

## 2. Resource Boundaries and Compound Payloads

A classic failure pattern is over-fetching: endpoints that return deeply nested relationship graphs without pagination or projection. Consider standardizing pagination envelopes:

\`\`\`json
{
  "data": [ ... ],
  "meta": {
    "totalCount": 1420,
    "limit": 20,
    "cursor": "eyJpZCI6MTQyMCwidHMiOjE3NDIwOH0="
  }
}
\`\`\`

## 3. Graceful Degradation and Circuit Breaking

When downstream analytical stores or recommendation engines degrade, primary CRUD workflows must remain operational. Employing circuit breakers with local cache fallbacks guarantees critical user reads and writes remain unimpeded.`,
    category: 'Architecture',
    tags: ['REST API', 'Architecture', 'Microservices', 'System Design'],
    coverStyle: {
      theme: 'slate',
      pattern: 'blueprint',
    },
    author: {
      id: 'user-1',
      name: 'Sarah Jenkins',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4',
      bio: 'Principal Systems Architect & Technical Writer',
      role: 'Staff Architect',
    },
    createdAt: '2026-04-10T10:30:00Z',
    readTimeMinutes: 6,
    isDraft: false,
    likesCount: 38,
    likedBy: ['user-2'],
    bookmarksCount: 19,
    bookmarkedBy: ['user-2'],
    viewsCount: 1240,
    commentsCount: 3,
  },
  {
    id: 'post-2',
    title: 'State Synchronization & Optimistic UI in Full-Stack Web Applications',
    subtitle: 'Bridging client responsiveness and server authority without visual jitter.',
    excerpt: 'Users expect instant tactile feedback. Explore how optimistic updates, client mutation queues, and deterministic rollback patterns create instantaneous user experiences.',
    content: `# Bridging Latency with Optimistic Interfaces

In the modern web, round-trip network latency is the primary bottleneck distinguishing sluggish software from native-feeling desktop speed. When an author toggles a like button or submits an inline comment, waiting 200ms to 600ms for server affirmation destroys conversational flow.

## The Principle of Optimistic Commit

The core premise is straightforward: assume success by default, render the predicted next state immediately, and dispatch the background mutation asynchronously.

\`\`\`typescript
// Optimistic update cycle
const handleAddComment = async (newComment: Comment) => {
  const previousComments = [...comments];
  
  // 1. Immediately apply mutation to client state
  setComments(prev => [newComment, ...prev]);

  try {
    // 2. Synchronize with backend RESTful endpoint
    await api.comments.create(post.id, newComment);
  } catch (err) {
    // 3. Rollback seamlessly if server rejects
    setComments(previousComments);
    showNotification('Failed to post comment. Reverted changes.');
  }
};
\`\`\`

## Conflict Resolution and Monotonic Clocking

When multiple collaborators interact with the same document or comment thread, server timestamps serve as canonical tie-breakers. By combining local optimistic queues with server-sent change deltas, client views converge cleanly without abrupt re-renders.`,
    category: 'Full-Stack',
    tags: ['Full-Stack', 'React', 'Optimistic UI', 'UX'],
    coverStyle: {
      theme: 'indigo',
      pattern: 'mesh',
    },
    author: {
      id: 'user-2',
      name: 'Alex Rivera',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede',
      bio: 'Full-Stack Developer crafting resilient web applications',
      role: 'Senior Engineer',
    },
    createdAt: '2026-04-12T14:15:00Z',
    readTimeMinutes: 5,
    isDraft: false,
    likesCount: 52,
    likedBy: ['user-1'],
    bookmarksCount: 27,
    bookmarkedBy: [],
    viewsCount: 1890,
    commentsCount: 2,
  },
  {
    id: 'post-3',
    title: 'Log-Structured Merge Trees vs B-Trees: Choosing Storage Engines for High-Write Workloads',
    subtitle: 'An empirical comparison of disk write amplification, sequential I/O, and compaction strategies.',
    excerpt: 'Storage engine selection dictates throughput thresholds. We break down LSM tree write paths, SSTables, Bloom filters, and when traditional B+Tree structures remain superior.',
    content: `# Storage Engines Under the Microscope

At the foundational core of every persistent database lies a data structure tasked with arbitrating random reads and writes against physical non-volatile storage media.

## B+Trees: Read-Optimized In-Place Mutations

Traditional relational engines have long relied on B+Trees. Because nodes map cleanly to operating system disk pages (typically 4KB to 16KB), point lookups require $O(\\log_B N)$ page accesses. However, random updates force in-place overwrites across disparate disk blocks, incurring substantial write amplification.

## LSM Trees: Sequential Append Superiority

Log-Structured Merge (LSM) trees bypass random write penalties by turning all mutations into sequential append operations:

1. **MemTable**: An in-memory concurrent skip list buffers incoming writes.
2. **Write-Ahead Log (WAL)**: Ensures zero data loss across power cycles.
3. **SSTables (Sorted String Tables)**: Flushed immutable disk files ordered by primary key.
4. **Bloom Filters**: In-memory bit arrays that short-circuit negative lookups before disk reads occur.

## When to Choose Which?

If your application workload exhibits a 9:1 write-to-read ratio (such as event telemetry or time-series logging), LSM architectures dramatically outshine B-Trees. Conversely, for workloads with strict read latency tolerances and frequent secondary indexing, B+Trees remain the gold standard.`,
    category: 'Databases',
    tags: ['Databases', 'Storage Engines', 'LSM Trees', 'Performance'],
    coverStyle: {
      theme: 'emerald',
      pattern: 'grid',
    },
    author: {
      id: 'user-3',
      name: 'Devin Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Devin&backgroundColor=d1d4f9',
      bio: 'Database Systems Researcher',
      role: 'Research Fellow',
    },
    createdAt: '2026-04-14T09:00:00Z',
    readTimeMinutes: 7,
    isDraft: false,
    likesCount: 64,
    likedBy: [],
    bookmarksCount: 41,
    bookmarkedBy: ['user-1'],
    viewsCount: 2150,
    commentsCount: 1,
  },
  {
    id: 'post-4',
    title: 'Modern Typography and Spatial Geometry for Long-Form Technical Publishing',
    subtitle: 'Crafting readable editorial layouts with measure constraints, line rhythm, and zero visual clutter.',
    excerpt: 'Technical reading demands focused cognitive clarity. Why restricting reading columns to 65-75 characters, employing authentic type pairings, and eradicating superfluous badges improves reader comprehension.',
    content: `# The Typography of Technical Clarity

Great engineering documentation is not solely determined by technical accuracy; its visual pacing fundamentally governs how effectively complex mental models are absorbed by the reader.

## The 65-75 Character Measure

The human eye experiences fatigue when tracking long text lines across expansive monitors. By strictly bounding body prose width to roughly 65–75 characters (\`max-w-prose\` or ~680px), eye sweeps between line endings and new line starts occur effortlessly without accidental line skipping.

## Eradicating Badge Fatigue

A pervasive habit in modern interfaces is encasing every single date, category, author name, and read time in rounded pill capsules. When everything is enclosed in a border, nothing has emphasis. By returning to editorial typographic dividers (\`·\` and \`/\`), the interface recedes, allowing the narrative content to command center stage.`,
    category: 'Frontend',
    tags: ['Frontend', 'Typography', 'UI Design', 'Web Standards'],
    coverStyle: {
      theme: 'amber',
      pattern: 'waves',
    },
    author: {
      id: 'user-1',
      name: 'Sarah Jenkins',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4',
      bio: 'Principal Systems Architect & Technical Writer',
      role: 'Staff Architect',
    },
    createdAt: '2026-04-15T08:00:00Z',
    readTimeMinutes: 4,
    isDraft: false,
    likesCount: 45,
    likedBy: ['user-2', 'user-3'],
    bookmarksCount: 33,
    bookmarkedBy: [],
    viewsCount: 1580,
    commentsCount: 2,
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    postId: 'post-1',
    parentId: null,
    author: {
      id: 'user-2',
      name: 'Alex Rivera',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede',
      email: 'alex.rivera@chronicle.dev',
    },
    content: 'Thoroughly agree on the Idempotency-Key pattern. We implemented this in our payment microservice using Redis hash sets with 24-hour TTLs, and it virtually eliminated double-charge edge cases during transient gateway timeouts.',
    createdAt: '2026-04-10T12:40:00Z',
    likes: ['user-1'],
    replies: [
      {
        id: 'comm-2',
        postId: 'post-1',
        parentId: 'comm-1',
        author: {
          id: 'user-1',
          name: 'Sarah Jenkins',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4',
          email: 'sarah.j@chronicle.dev',
        },
        content: 'Exactly! The 24-hour TTL window strikes an ideal balance between memory overhead and covering the retry backoff envelope of upstream clients.',
        createdAt: '2026-04-10T14:15:00Z',
        likes: ['user-2'],
      }
    ]
  },
  {
    id: 'comm-3',
    postId: 'post-1',
    parentId: null,
    author: {
      id: 'user-3',
      name: 'Devin Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Devin&backgroundColor=d1d4f9',
      email: 'devin.chen@chronicle.dev',
    },
    content: 'One nuance to consider is cursor pagination with dynamic sort orders. If the ordering key contains ties (e.g. duplicate timestamps), cursor tie-breakers on primary keys become mandatory.',
    createdAt: '2026-04-11T09:20:00Z',
    likes: [],
    replies: []
  },
  {
    id: 'comm-4',
    postId: 'post-2',
    parentId: null,
    author: {
      id: 'user-1',
      name: 'Sarah Jenkins',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4',
      email: 'sarah.j@chronicle.dev',
    },
    content: 'The rollback pattern shown here is clean and concise. Do you recommend toast notifications or subtle inline micro-animations when a revert occurs?',
    createdAt: '2026-04-12T16:05:00Z',
    likes: ['user-2'],
    replies: [
      {
        id: 'comm-5',
        postId: 'post-2',
        parentId: 'comm-4',
        author: {
          id: 'user-2',
          name: 'Alex Rivera',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede',
          email: 'alex.rivera@chronicle.dev',
        },
        content: 'For non-destructive mutations like likes, subtle inline undo animations feel least intrusive. For comment submissions or edits, a discreet toast with a "Retry" CTA is best so user typing is not lost.',
        createdAt: '2026-04-12T17:30:00Z',
        likes: ['user-1'],
      }
    ]
  },
  {
    id: 'comm-6',
    postId: 'post-3',
    parentId: null,
    author: {
      id: 'user-2',
      name: 'Alex Rivera',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede',
      email: 'alex.rivera@chronicle.dev',
    },
    content: 'Fascinating breakdown on the Bloom filter integration with SSTables. It is amazing how a few kilobytes of in-memory bitset can save thousands of mechanical or NVMe reads.',
    createdAt: '2026-04-14T11:45:00Z',
    likes: ['user-3'],
    replies: []
  },
  {
    id: 'comm-7',
    postId: 'post-4',
    parentId: null,
    author: {
      id: 'user-3',
      name: 'Devin Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Devin&backgroundColor=d1d4f9',
      email: 'devin.chen@chronicle.dev',
    },
    content: 'The zero-pill discipline is such a breath of fresh air. Reading technical docs without being bombarded by 12 colored tags per card makes deep work so much easier.',
    createdAt: '2026-04-15T09:12:00Z',
    likes: ['user-1'],
    replies: [
      {
        id: 'comm-8',
        postId: 'post-4',
        parentId: 'comm-7',
        author: {
          id: 'user-1',
          name: 'Sarah Jenkins',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4',
          email: 'sarah.j@chronicle.dev',
        },
        content: 'Completely agree. Good typography is transparent—it carries the idea without waving its arms.',
        createdAt: '2026-04-15T10:00:00Z',
        likes: ['user-3'],
      }
    ]
  }
];
