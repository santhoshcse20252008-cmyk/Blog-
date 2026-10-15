import React from 'react';
import { Heart, MessageSquare, Bookmark, Clock, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Post, User } from '../types/blog';
import { ArtisticCover } from './ArtisticCover';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onSelect: (post: Post) => void;
  onToggleLike: (post: Post, e: React.MouseEvent) => void;
  onToggleBookmark: (post: Post, e: React.MouseEvent) => void;
  onEdit?: (post: Post, e: React.MouseEvent) => void;
  onDelete?: (post: Post, e: React.MouseEvent) => void;
  featured?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onSelect,
  onToggleLike,
  onToggleBookmark,
  onEdit,
  onDelete,
  featured = false,
}) => {
  const isLiked = currentUser ? post.likedBy.includes(currentUser.id) : false;
  const isBookmarked = currentUser ? post.bookmarkedBy.includes(currentUser.id) : false;
  const isAuthor = currentUser?.id === post.author.id;

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (featured) {
    return (
      <article
        onClick={() => onSelect(post)}
        className="group relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch p-6 md:p-8 bg-white border border-stone-200 rounded-lg hover:border-stone-400 transition-all duration-200 cursor-pointer shadow-xs"
      >
        {/* Visual Cover Column */}
        <div className="lg:col-span-7 overflow-hidden rounded-md bg-stone-900 min-h-[260px] flex items-stretch">
          <ArtisticCover
            theme={post.coverStyle.theme}
            pattern={post.coverStyle.pattern}
            customUrl={post.coverStyle.customUrl}
            category={post.category}
            title={post.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            aspect="16:9"
          />
        </div>

        {/* Narrative Content Column */}
        <div className="lg:col-span-5 flex flex-col justify-between py-1">
          <div>
            {/* Zero-Pill Unboxed Metadata */}
            <div className="flex items-center flex-wrap gap-2 text-xs text-stone-500 font-medium mb-3">
              <span className="text-stone-900 font-semibold uppercase tracking-wider text-[11px]">
                {post.category}
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>{formattedDate}</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>{post.readTimeMinutes} min read</span>
              </span>
            </div>

            {/* Headline with text-wrap: balance */}
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-stone-950 group-hover:text-stone-700 transition-colors leading-tight mb-3 [text-wrap:balance]">
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed mb-6">
              {post.excerpt}
            </p>
          </div>

          {/* Author and Action footer */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-8 h-8 rounded-full object-cover bg-stone-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-900 truncate">{post.author.name}</p>
                <p className="text-[11px] text-stone-500 truncate">{post.author.role || 'Contributor'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-500 shrink-0">
              <button
                onClick={(e) => onToggleLike(post, e)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer hover:text-rose-600 ${
                  isLiked ? 'text-rose-600 font-semibold' : ''
                }`}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                <span className="font-mono tabular-nums">{post.likesCount}</span>
              </button>

              <div className="flex items-center gap-1.5" title="Comments">
                <MessageSquare className="w-4 h-4 text-stone-400" />
                <span className="font-mono tabular-nums">{post.commentsCount}</span>
              </div>

              <button
                onClick={(e) => onToggleBookmark(post, e)}
                className={`p-1 hover:text-stone-900 transition-colors cursor-pointer ${
                  isBookmarked ? 'text-stone-900' : 'text-stone-400'
                }`}
                title={isBookmarked ? 'Saved' : 'Save story'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-stone-900 text-stone-900' : ''}`} />
              </button>

              {isAuthor && onEdit && (
                <button
                  onClick={(e) => onEdit(post, e)}
                  className="p-1 hover:text-stone-900 text-stone-400 transition-colors cursor-pointer"
                  title="Edit post"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={() => onSelect(post)}
      className="group flex flex-col justify-between bg-white border border-stone-200 rounded-lg hover:border-stone-400 transition-all duration-200 cursor-pointer overflow-hidden shadow-xs h-full"
    >
      <div>
        {/* Cover visual */}
        <div className="overflow-hidden bg-stone-900 aspect-[16/9]">
          <ArtisticCover
            theme={post.coverStyle.theme}
            pattern={post.coverStyle.pattern}
            customUrl={post.coverStyle.customUrl}
            category={post.category}
            title={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content body */}
        <div className="p-5">
          {/* Zero-Pill Unboxed Metadata */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-stone-500 font-medium mb-2.5">
            <span className="text-stone-900 font-semibold uppercase tracking-wider text-[11px]">
              {post.category}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{formattedDate}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{post.readTimeMinutes} min</span>
          </div>

          <h3 className="text-lg font-serif font-bold text-stone-950 group-hover:text-stone-700 transition-colors leading-snug mb-2 line-clamp-2 [text-wrap:balance]">
            {post.title}
          </h3>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
            {post.excerpt}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 pb-5 pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-6 h-6 rounded-full object-cover bg-stone-200 shrink-0"
          />
          <span className="text-xs text-stone-700 font-medium truncate">
            {post.author.name}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-stone-500 shrink-0">
          <button
            onClick={(e) => onToggleLike(post, e)}
            className={`flex items-center gap-1 transition-colors cursor-pointer hover:text-rose-600 ${
              isLiked ? 'text-rose-600 font-semibold' : ''
            }`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span className="font-mono tabular-nums text-[11px]">{post.likesCount}</span>
          </button>

          <div className="flex items-center gap-1" title="Comments">
            <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-mono tabular-nums text-[11px]">{post.commentsCount}</span>
          </div>

          <button
            onClick={(e) => onToggleBookmark(post, e)}
            className={`p-1 hover:text-stone-900 transition-colors cursor-pointer ${
              isBookmarked ? 'text-stone-900' : 'text-stone-400'
            }`}
            title={isBookmarked ? 'Saved' : 'Save'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-stone-900 text-stone-900' : ''}`} />
          </button>

          {isAuthor && onEdit && (
            <button
              onClick={(e) => onEdit(post, e)}
              className="p-1 hover:text-stone-900 text-stone-400 transition-colors cursor-pointer"
              title="Edit post"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}

          {isAuthor && onDelete && (
            <button
              onClick={(e) => onDelete(post, e)}
              className="p-1 hover:text-rose-600 text-stone-400 transition-colors cursor-pointer"
              title="Delete post"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
