export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  role: 'author' | 'reader' | 'admin';
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string | null; // For threaded replies
  author: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: string[]; // List of user IDs
  replies?: Comment[];
}

export type Category = 
  | 'Architecture' 
  | 'Full-Stack' 
  | 'Systems' 
  | 'Frontend' 
  | 'Databases' 
  | 'Future Tech';

export interface Post {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  category: Category;
  tags: string[];
  coverStyle: {
    theme: 'slate' | 'amber' | 'emerald' | 'indigo' | 'rose' | 'bronze';
    pattern: 'grid' | 'dots' | 'waves' | 'blueprint' | 'mesh';
    customUrl?: string;
  };
  author: {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt?: string;
  readTimeMinutes: number;
  isDraft: boolean;
  likesCount: number;
  likedBy: string[];
  bookmarksCount: number;
  bookmarkedBy: string[];
  viewsCount: number;
  commentsCount: number;
}

export type SortOption = 'latest' | 'popular' | 'trending';

export interface PostFilters {
  category?: Category | 'All';
  tag?: string;
  search?: string;
  sort: SortOption;
  authorId?: string;
  onlyBookmarked?: boolean;
}
