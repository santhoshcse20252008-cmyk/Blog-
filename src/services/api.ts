import { User, Post, Comment, PostFilters } from '../types/blog';
import { INITIAL_USERS, INITIAL_POSTS, INITIAL_COMMENTS } from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'chronicle_blog_users',
  POSTS: 'chronicle_blog_posts',
  COMMENTS: 'chronicle_blog_comments',
  CURRENT_USER: 'chronicle_blog_current_user',
};

// Helper to initialize local storage
function initializeStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Default to Sarah Jenkins for effortless immediate testing
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
  }
}

// Client Storage Accessors
function getStoredUsers(): User[] {
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getStoredPosts(): Post[] {
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    return data ? JSON.parse(data) : INITIAL_POSTS;
  } catch {
    return INITIAL_POSTS;
  }
}

function savePosts(posts: Post[]) {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

function getStoredComments(): Comment[] {
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    return data ? JSON.parse(data) : INITIAL_COMMENTS;
  } catch {
    return INITIAL_COMMENTS;
  }
}

function saveComments(comments: Comment[]) {
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
}

export const api = {
  // Auth Services
  auth: {
    getCurrentUser(): User | null {
      initializeStorage();
      try {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    },

    async register(data: { name: string; email: string; bio?: string; role?: 'author' | 'reader'; avatar?: string }): Promise<User> {
      // Try server endpoint first
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.user) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(json.user));
            const users = getStoredUsers();
            if (!users.some(u => u.id === json.user.id)) {
              saveUsers([...users, json.user]);
            }
            return json.user;
          }
        }
      } catch {
        // Fallback to local storage
      }

      const users = getStoredUsers();
      const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
      if (existing) {
        throw new Error('An account with this email address already exists.');
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=b6e3f4`,
        bio: data.bio || 'Passionate engineer & tech enthusiast.',
        role: data.role || 'author',
        createdAt: new Date().toISOString(),
      };

      saveUsers([...users, newUser]);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
      return newUser;
    },

    async login(email: string): Promise<User> {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.user) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(json.user));
            return json.user;
          }
        }
      } catch {
        // Fallback to local storage
      }

      const users = getStoredUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('No account found with this email. Please register first.');
      }

      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    },

    logout(): void {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },

    switchDemoUser(userId: string): User | null {
      const users = getStoredUsers();
      const user = users.find(u => u.id === userId) || null;
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      }
      return user;
    },

    getAllUsers(): User[] {
      return getStoredUsers();
    }
  },

  // Posts Services
  posts: {
    async getPosts(filters?: PostFilters): Promise<Post[]> {
      try {
        const params = new URLSearchParams();
        if (filters?.category && filters.category !== 'All') params.set('category', filters.category);
        if (filters?.tag) params.set('tag', filters.tag);
        if (filters?.search) params.set('search', filters.search);
        if (filters?.sort) params.set('sort', filters.sort);

        const res = await fetch(`/api/posts?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            return data;
          }
        }
      } catch {
        // Fallback to local storage
      }

      let posts = getStoredPosts();

      if (filters?.category && filters.category !== 'All') {
        posts = posts.filter(p => p.category === filters.category);
      }

      if (filters?.tag) {
        const t = filters.tag.toLowerCase();
        posts = posts.filter(p => p.tags.some(tag => tag.toLowerCase() === t));
      }

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        posts = posts.filter(
          p =>
            p.title.toLowerCase().includes(q) ||
            p.excerpt.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            p.author.name.toLowerCase().includes(q)
        );
      }

      if (filters?.authorId) {
        posts = posts.filter(p => p.author.id === filters.authorId);
      }

      if (filters?.onlyBookmarked && filters.authorId) {
        posts = posts.filter(p => p.bookmarkedBy.includes(filters.authorId!));
      }

      // Sort
      if (filters?.sort === 'popular') {
        posts.sort((a, b) => b.likesCount - a.likesCount);
      } else if (filters?.sort === 'trending') {
        posts.sort((a, b) => (b.viewsCount + b.commentsCount * 5) - (a.viewsCount + a.commentsCount * 5));
      } else {
        // Latest
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return posts;
    },

    async getPostById(id: string): Promise<Post | null> {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (res.ok) {
          const post = await res.json();
          return post;
        }
      } catch {
        // Fallback to local storage
      }

      const posts = getStoredPosts();
      const post = posts.find(p => p.id === id);
      if (post) {
        // Increment view count quietly
        post.viewsCount += 1;
        savePosts(posts);
        return { ...post };
      }
      return null;
    },

    async createPost(data: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'likedBy' | 'bookmarksCount' | 'bookmarkedBy' | 'viewsCount' | 'commentsCount'>): Promise<Post> {
      try {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const newPost = await res.json();
          const posts = getStoredPosts();
          savePosts([newPost, ...posts]);
          return newPost;
        }
      } catch {
        // Fallback
      }

      const newPost: Post = {
        ...data,
        id: `post-${Date.now()}`,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        likedBy: [],
        bookmarksCount: 0,
        bookmarkedBy: [],
        viewsCount: 1,
        commentsCount: 0,
      };

      const posts = getStoredPosts();
      savePosts([newPost, ...posts]);
      return newPost;
    },

    async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
      try {
        const res = await fetch(`/api/posts/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const updated = await res.json();
          const posts = getStoredPosts().map(p => (p.id === id ? updated : p));
          savePosts(posts);
          return updated;
        }
      } catch {
        // Fallback
      }

      const posts = getStoredPosts();
      const index = posts.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Post not found');

      const updated: Post = {
        ...posts[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      posts[index] = updated;
      savePosts(posts);
      return updated;
    },

    async deletePost(id: string): Promise<boolean> {
      try {
        const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
        if (res.ok) {
          const posts = getStoredPosts().filter(p => p.id !== id);
          savePosts(posts);
          return true;
        }
      } catch {
        // Fallback
      }

      const posts = getStoredPosts().filter(p => p.id !== id);
      savePosts(posts);
      return true;
    },

    async toggleLike(postId: string, userId: string): Promise<{ likesCount: number; isLiked: boolean }> {
      try {
        const res = await fetch(`/api/posts/${postId}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        if (res.ok) {
          const result = await res.json();
          const posts = getStoredPosts();
          const p = posts.find(item => item.id === postId);
          if (p) {
            p.likesCount = result.likesCount;
            p.likedBy = result.likedBy;
            savePosts(posts);
          }
          return result;
        }
      } catch {
        // Fallback
      }

      const posts = getStoredPosts();
      const post = posts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');

      const isLiked = post.likedBy.includes(userId);
      if (isLiked) {
        post.likedBy = post.likedBy.filter(id => id !== userId);
        post.likesCount = Math.max(0, post.likesCount - 1);
      } else {
        post.likedBy.push(userId);
        post.likesCount += 1;
      }
      savePosts(posts);
      return { likesCount: post.likesCount, isLiked: !isLiked };
    },

    async toggleBookmark(postId: string, userId: string): Promise<{ isBookmarked: boolean }> {
      const posts = getStoredPosts();
      const post = posts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');

      const isBookmarked = post.bookmarkedBy.includes(userId);
      if (isBookmarked) {
        post.bookmarkedBy = post.bookmarkedBy.filter(id => id !== userId);
        post.bookmarksCount = Math.max(0, post.bookmarksCount - 1);
      } else {
        post.bookmarkedBy.push(userId);
        post.bookmarksCount += 1;
      }
      savePosts(posts);
      return { isBookmarked: !isBookmarked };
    }
  },

  // Comments Services
  comments: {
    async getCommentsForPost(postId: string): Promise<Comment[]> {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`);
        if (res.ok) {
          const list = await res.json();
          return list;
        }
      } catch {
        // Fallback
      }

      const comments = getStoredComments();
      const postComments = comments.filter(c => c.postId === postId);

      // Structure into tree (root comments and replies)
      const roots = postComments.filter(c => !c.parentId);
      const replies = postComments.filter(c => !!c.parentId);

      return roots.map(root => {
        const childReplies = replies.filter(r => r.parentId === root.id);
        return {
          ...root,
          replies: childReplies,
        };
      });
    },

    async addComment(data: { postId: string; parentId?: string | null; author: User; content: string }): Promise<Comment> {
      try {
        const res = await fetch(`/api/posts/${data.postId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const created = await res.json();
          const comments = getStoredComments();
          saveComments([...comments, created]);

          // Update comment count on post
          const posts = getStoredPosts();
          const post = posts.find(p => p.id === data.postId);
          if (post) {
            post.commentsCount += 1;
            savePosts(posts);
          }

          return created;
        }
      } catch {
        // Fallback
      }

      const newComment: Comment = {
        id: `comm-${Date.now()}`,
        postId: data.postId,
        parentId: data.parentId || null,
        author: {
          id: data.author.id,
          name: data.author.name,
          avatar: data.author.avatar,
          email: data.author.email,
        },
        content: data.content,
        createdAt: new Date().toISOString(),
        likes: [],
        replies: [],
      };

      const comments = getStoredComments();
      saveComments([...comments, newComment]);

      // Update post comment count
      const posts = getStoredPosts();
      const post = posts.find(p => p.id === data.postId);
      if (post) {
        post.commentsCount += 1;
        savePosts(posts);
      }

      return newComment;
    },

    async updateComment(commentId: string, content: string): Promise<Comment> {
      try {
        const res = await fetch(`/api/comments/${commentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        if (res.ok) {
          const updated = await res.json();
          const comments = getStoredComments().map(c => (c.id === commentId ? updated : c));
          saveComments(comments);
          return updated;
        }
      } catch {
        // Fallback
      }

      const comments = getStoredComments();
      const target = comments.find(c => c.id === commentId);
      if (!target) throw new Error('Comment not found');

      target.content = content;
      target.updatedAt = new Date().toISOString();
      saveComments(comments);
      return { ...target };
    },

    async deleteComment(commentId: string, postId: string): Promise<boolean> {
      try {
        const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
        if (res.ok) {
          const comments = getStoredComments().filter(c => c.id !== commentId && c.parentId !== commentId);
          saveComments(comments);
          const posts = getStoredPosts();
          const post = posts.find(p => p.id === postId);
          if (post) {
            post.commentsCount = Math.max(0, post.commentsCount - 1);
            savePosts(posts);
          }
          return true;
        }
      } catch {
        // Fallback
      }

      const comments = getStoredComments().filter(c => c.id !== commentId && c.parentId !== commentId);
      saveComments(comments);

      const posts = getStoredPosts();
      const post = posts.find(p => p.id === postId);
      if (post) {
        post.commentsCount = Math.max(0, post.commentsCount - 1);
        savePosts(posts);
      }
      return true;
    },

    async toggleLike(commentId: string, userId: string): Promise<{ likes: string[] }> {
      const comments = getStoredComments();
      const comment = comments.find(c => c.id === commentId);
      if (!comment) throw new Error('Comment not found');

      if (comment.likes.includes(userId)) {
        comment.likes = comment.likes.filter(id => id !== userId);
      } else {
        comment.likes.push(userId);
      }
      saveComments(comments);
      return { likes: comment.likes };
    }
  },

  // Stats & Health
  stats: {
    async getPlatformStats() {
      const posts = getStoredPosts();
      const comments = getStoredComments();
      const users = getStoredUsers();

      return {
        totalPosts: posts.length,
        totalComments: comments.length,
        totalAuthors: users.length,
        totalViews: posts.reduce((acc, p) => acc + p.viewsCount, 0),
        totalLikes: posts.reduce((acc, p) => acc + p.likesCount, 0),
        categories: [
          'Architecture',
          'Full-Stack',
          'Systems',
          'Frontend',
          'Databases',
          'Future Tech'
        ],
      };
    }
  }
};
