import React, { useState, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, Plus, PenSquare, Terminal, 
  Compass, ArrowUpDown, X, BookOpen, Layers
} from 'lucide-react';
import { Post, User, Category, SortOption, PostFilters } from './types/blog';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { PostCard } from './components/PostCard';
import { PostDetail } from './components/PostDetail';
import { PostEditor } from './components/PostEditor';
import { AuthModal } from './components/AuthModal';
import { ApiInspectorModal } from './components/ApiInspectorModal';
import { UserProfileModal } from './components/UserProfileModal';

const CATEGORIES: Array<Category | 'All'> = [
  'All',
  'Architecture',
  'Full-Stack',
  'Systems',
  'Frontend',
  'Databases',
  'Future Tech',
];

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [activeNav, setActiveNav] = useState('stories');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isApiInspectorOpen, setIsApiInspectorOpen] = useState(false);

  // Platform Stats
  const [stats, setStats] = useState({
    totalPosts: 4,
    totalComments: 8,
    totalAuthors: 3,
    totalViews: 6860,
  });

  useEffect(() => {
    // Initialize current user
    const user = api.auth.getCurrentUser();
    setCurrentUser(user);

    loadPosts();
    loadStats();
  }, [selectedCategory, selectedTag, searchQuery, sortOption]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const filters: PostFilters = {
        category: selectedCategory,
        tag: selectedTag,
        search: searchQuery,
        sort: sortOption,
      };
      const data = await api.posts.getPosts(filters);
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.stats.getPlatformStats();
      setStats({
        totalPosts: data.totalPosts,
        totalComments: data.totalComments,
        totalAuthors: data.totalAuthors,
        totalViews: data.totalViews,
      });
    } catch {
      // Ignored
    }
  };

  // Like toggler
  const handleToggleLike = async (post: Post, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const result = await api.posts.toggleLike(post.id, currentUser.id);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === post.id) {
            return {
              ...p,
              likesCount: result.likesCount,
              likedBy: result.isLiked
                ? [...p.likedBy, currentUser.id]
                : p.likedBy.filter((id) => id !== currentUser.id),
            };
          }
          return p;
        })
      );

      if (activePost?.id === post.id) {
        setActivePost((prev) =>
          prev
            ? {
                ...prev,
                likesCount: result.likesCount,
                likedBy: result.isLiked
                  ? [...prev.likedBy, currentUser.id]
                  : prev.likedBy.filter((id) => id !== currentUser.id),
              }
            : null
        );
      }
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  // Bookmark toggler
  const handleToggleBookmark = async (post: Post, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const result = await api.posts.toggleBookmark(post.id, currentUser.id);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === post.id) {
            return {
              ...p,
              bookmarkedBy: result.isBookmarked
                ? [...p.bookmarkedBy, currentUser.id]
                : p.bookmarkedBy.filter((id) => id !== currentUser.id),
            };
          }
          return p;
        })
      );

      if (activePost?.id === post.id) {
        setActivePost((prev) =>
          prev
            ? {
                ...prev,
                bookmarkedBy: result.isBookmarked
                  ? [...prev.bookmarkedBy, currentUser.id]
                  : prev.bookmarkedBy.filter((id) => id !== currentUser.id),
              }
            : null
        );
      }
    } catch (err) {
      console.error('Failed to bookmark post', err);
    }
  };

  // Post CRUD actions
  const handleSavePost = async (postData: Partial<Post>) => {
    if (editingPost) {
      // Update
      const updated = await api.posts.updatePost(editingPost.id, postData);
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (activePost?.id === updated.id) {
        setActivePost(updated);
      }
    } else {
      // Create new
      // @ts-expect-error Post creation payload
      const created = await api.posts.createPost(postData);
      setPosts((prev) => [created, ...prev]);
      setActivePost(created);
    }
    setIsEditorOpen(false);
    setEditingPost(null);
    loadStats();
  };

  const handleDeletePost = async (post: Post, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${post.title}"?`)) return;

    try {
      await api.posts.deletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      if (activePost?.id === post.id) {
        setActivePost(null);
      }
      loadStats();
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  const handleEditPost = (post: Post, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingPost(post);
    setIsEditorOpen(true);
  };

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-900 selection:text-white flex flex-col">
      {/* Top Navbar adhering to Top Bar Contract */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenWrite={() => {
          if (!currentUser) {
            setIsAuthOpen(true);
          } else {
            setEditingPost(null);
            setIsEditorOpen(true);
          }
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenApiInspector={() => setIsApiInspectorOpen(true)}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat as Category | 'All');
          setActivePost(null);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {activePost ? (
          <PostDetail
            post={activePost}
            currentUser={currentUser}
            onBack={() => setActivePost(null)}
            onEdit={(p) => handleEditPost(p)}
            onDelete={(p) => handleDeletePost(p)}
            onToggleLike={(p) => handleToggleLike(p)}
            onToggleBookmark={(p) => handleToggleBookmark(p)}
            onRequireAuth={() => setIsAuthOpen(true)}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {/* Editorial Hero Marquee */}
            <div className="mb-10 pb-8 border-b border-stone-200">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <span className="text-xs font-mono font-semibold uppercase tracking-widest text-stone-500 block mb-2">
                    EDITORIAL ARCHIVE // FULL-STACK PUBLISHING
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-950 tracking-tight leading-tight [text-wrap:balance]">
                    Chronicle Technical Journal
                  </h1>
                  <p className="text-base font-serif text-stone-600 mt-2 max-w-2xl leading-relaxed">
                    Peer-reviewed essays on distributed architectures, resilient RESTful microservices, storage engines, and modern user interaction paradigms.
                  </p>
                </div>

                {/* Quantitative Adjacency Metric Strip (Section 1.H) */}
                <div className="flex items-center gap-6 sm:gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-stone-200 text-xs font-mono text-stone-500 shrink-0">
                  <div>
                    <span className="block text-xl font-bold text-stone-900 tabular-nums">
                      {stats.totalPosts}
                    </span>
                    <span>Articles</span>
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-stone-900 tabular-nums">
                      {stats.totalComments}
                    </span>
                    <span>Comments</span>
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-stone-900 tabular-nums">
                      {stats.totalAuthors}
                    </span>
                    <span>Authors</span>
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-stone-900 tabular-nums">
                      {stats.totalViews}
                    </span>
                    <span>Reads</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Filter Strip & Search (Section 1.A Allowed Interactive Control) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              {/* Category Segmented Control */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedTag(undefined);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search & Sort Controls */}
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, tags, concepts..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-stone-200 rounded-md focus:outline-none focus:border-stone-900 placeholder:text-stone-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="text-xs py-1.5 px-2 bg-white border border-stone-200 rounded-md text-stone-700 focus:outline-none focus:border-stone-900 cursor-pointer"
                  >
                    <option value="latest">Sort: Latest</option>
                    <option value="popular">Sort: Most Liked</option>
                    <option value="trending">Sort: Trending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Tag Notice */}
            {selectedTag && (
              <div className="mb-6 flex items-center gap-2 text-xs text-stone-600 bg-stone-100 py-1.5 px-3 rounded-md w-fit">
                <span>Filtering by tag: <strong>#{selectedTag}</strong></span>
                <button
                  onClick={() => setSelectedTag(undefined)}
                  className="text-stone-400 hover:text-stone-800 cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Loading & Empty States */}
            {loading ? (
              <div className="py-20 text-center text-xs font-mono text-stone-400">
                Fetching catalog archives...
              </div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-stone-200 rounded-lg max-w-lg mx-auto p-8">
                <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
                  No articles matched your criteria
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Try adjusting your search terms or select "All" from the category filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setSelectedTag(undefined);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-md hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* Editorial 3-Tier Salience Layout (Pattern C) */
              <div className="space-y-10">
                {/* Tier 1: Lead Featured Story (when viewing 'All' and no search) */}
                {selectedCategory === 'All' && !searchQuery && !selectedTag && posts.length > 0 && (
                  <div>
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-500 block mb-3">
                      LEAD ESSAY // EDITORIAL FOCUS
                    </span>
                    <PostCard
                      post={posts[0]}
                      currentUser={currentUser}
                      onSelect={(p) => setActivePost(p)}
                      onToggleLike={handleToggleLike}
                      onToggleBookmark={handleToggleBookmark}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      featured={true}
                    />
                  </div>
                )}

                {/* Tier 2 & 3: Secondary Features & Grid Layout */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-500">
                      {selectedCategory === 'All' && !searchQuery && !selectedTag
                        ? 'ARCHIVE ENTRIES // RECENT RESEARCH'
                        : `ARTICLES IN ${selectedCategory.toUpperCase()} (${posts.length})`}
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      Showing {posts.length} entries
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(selectedCategory === 'All' && !searchQuery && !selectedTag
                      ? posts.slice(1)
                      : posts
                    ).map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onSelect={(p) => setActivePost(p)}
                        onToggleLike={handleToggleLike}
                        onToggleBookmark={handleToggleBookmark}
                        onEdit={handleEditPost}
                        onDelete={handleDeletePost}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900">Chronicle Journal</span>
            <span>·</span>
            <span>Open Technical Publishing & Discussion Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsApiInspectorOpen(true)}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              RESTful APIs
            </button>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              Top of Page ↑
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          loadPosts();
        }}
      />

      {isEditorOpen && currentUser && (
        <PostEditor
          initialPost={editingPost}
          currentUser={currentUser}
          onSave={handleSavePost}
          onCancel={() => {
            setIsEditorOpen(false);
            setEditingPost(null);
          }}
        />
      )}

      {isProfileOpen && currentUser && (
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          currentUser={currentUser}
          allPosts={posts}
          onLogout={handleLogout}
          onSelectPost={(p) => {
            setActivePost(p);
            setIsProfileOpen(false);
          }}
          onEditPost={(p) => {
            handleEditPost(p);
            setIsProfileOpen(false);
          }}
          onDeletePost={(p) => {
            handleDeletePost(p);
          }}
          onNewStory={() => {
            setEditingPost(null);
            setIsEditorOpen(true);
          }}
        />
      )}

      <ApiInspectorModal
        isOpen={isApiInspectorOpen}
        onClose={() => setIsApiInspectorOpen(false)}
      />
    </div>
  );
}
