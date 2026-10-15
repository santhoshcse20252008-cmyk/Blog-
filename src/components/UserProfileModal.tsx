import React, { useState } from 'react';
import { X, LogOut, BookOpen, Bookmark, Edit3, Trash2, Plus, Sparkles, UserCheck } from 'lucide-react';
import { User, Post } from '../types/blog';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allPosts: Post[];
  onLogout: () => void;
  onSelectPost: (post: Post) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (post: Post) => void;
  onNewStory: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allPosts,
  onLogout,
  onSelectPost,
  onEditPost,
  onDeletePost,
  onNewStory,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'bookmarks'>('posts');

  if (!isOpen) return null;

  const myPosts = allPosts.filter((p) => p.author.id === currentUser.id);
  const myBookmarks = allPosts.filter((p) => p.bookmarkedBy.includes(currentUser.id));

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-start justify-between bg-stone-50">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-full object-cover bg-stone-200 border-2 border-white shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  {currentUser.name}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-semibold uppercase">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-mono">{currentUser.email}</p>
              <p className="text-xs text-stone-600 mt-1 max-w-md">{currentUser.bio}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors border border-rose-200 cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="px-6 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-6 text-xs font-medium">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'posts'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              My Published Stories ({myPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'bookmarks'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Bookmarked Reading List ({myBookmarks.length})
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onNewStory();
            }}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-stone-900 text-white rounded hover:bg-stone-800 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Story</span>
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'posts' ? (
            myPosts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-stone-200 rounded-lg">
                <BookOpen className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-800 mb-1">No articles authored yet</p>
                <p className="text-xs text-stone-500 mb-4">
                  Share your technical knowledge and architectural insights with the platform.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onNewStory();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors cursor-pointer"
                >
                  Create Your First Story
                </button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {myPosts.map((post) => (
                  <div
                    key={post.id}
                    className="py-3.5 flex items-center justify-between gap-4 group"
                  >
                    <div
                      onClick={() => {
                        onClose();
                        onSelectPost(post);
                      }}
                      className="cursor-pointer flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                        <span className="font-semibold text-stone-900 uppercase text-[10px]">
                          {post.category}
                        </span>
                        <span>·</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>{post.viewsCount} views</span>
                      </div>
                      <h4 className="text-sm font-serif font-bold text-stone-900 group-hover:text-stone-700 truncate">
                        {post.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onClose();
                          onEditPost(post);
                        }}
                        className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
                        title="Edit post"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeletePost(post)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        title="Delete post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Bookmarks tab */
            myBookmarks.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-stone-200 rounded-lg">
                <Bookmark className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-800 mb-1">No bookmarked stories</p>
                <p className="text-xs text-stone-500">
                  Save articles to read later by clicking the bookmark icon on any post card.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {myBookmarks.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      onClose();
                      onSelectPost(post);
                    }}
                    className="py-3.5 cursor-pointer hover:bg-stone-50 -mx-2 px-2 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                      <span className="font-semibold text-stone-900 uppercase text-[10px]">
                        {post.category}
                      </span>
                      <span>·</span>
                      <span>By {post.author.name}</span>
                      <span>·</span>
                      <span>{post.readTimeMinutes} min</span>
                    </div>
                    <h4 className="text-sm font-serif font-bold text-stone-900">
                      {post.title}
                    </h4>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
