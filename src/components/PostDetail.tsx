import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Bookmark, Share2, Clock, Edit3, Trash2, Check, Copy } from 'lucide-react';
import { Post, User } from '../types/blog';
import { ArtisticCover } from './ArtisticCover';
import { CommentSection } from './CommentSection';

interface PostDetailProps {
  post: Post;
  currentUser: User | null;
  onBack: () => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
  onToggleLike: (post: Post) => void;
  onToggleBookmark: (post: Post) => void;
  onRequireAuth: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  currentUser,
  onBack,
  onEdit,
  onDelete,
  onToggleLike,
  onToggleBookmark,
  onRequireAuth,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const isLiked = currentUser ? post.likedBy.includes(currentUser.id) : false;
  const isBookmarked = currentUser ? post.bookmarkedBy.includes(currentUser.id) : false;
  const isAuthor = currentUser?.id === post.author.id;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post.id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Render markdown-like content cleanly
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // Close code block
          elements.push(
            <div key={`code-${index}`} className="my-6 rounded-lg overflow-hidden border border-stone-800 bg-stone-950 text-stone-200">
              <div className="px-4 py-2 text-[11px] font-mono text-stone-400 bg-stone-900 border-b border-stone-800 flex justify-between">
                <span>TERMINAL / CODE</span>
                <span>UTF-8</span>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                <code>{codeBuffer.join('\n')}</code>
              </pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h2 key={index} className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 mt-10 mb-4 [text-wrap:balance]">
            {line.replace('# ', '')}
          </h2>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h3 key={index} className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-8 mb-3 [text-wrap:balance]">
            {line.replace('## ', '')}
          </h3>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h4 key={index} className="text-lg font-serif font-semibold text-stone-850 mt-6 mb-2">
            {line.replace('### ', '')}
          </h4>
        );
      } else if (line.startsWith('> ')) {
        // Pullquote
        elements.push(
          <blockquote
            key={index}
            className="my-6 py-4 px-6 border-y border-stone-200 font-serif italic text-lg text-stone-800 leading-relaxed text-center"
          >
            "{line.replace('> ', '')}"
          </blockquote>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-5 list-disc text-stone-700 my-1.5 leading-relaxed text-base">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
      } else if (/^\d+\.\s/.test(line)) {
        elements.push(
          <li key={index} className="ml-5 list-decimal text-stone-700 my-1.5 leading-relaxed text-base">
            {line.replace(/^\d+\.\s+/, '')}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-4" />);
      } else {
        // Normal paragraph with drop-cap on first body paragraph
        const isFirstPara = elements.filter(el => React.isValidElement(el) && el.type === 'p').length === 0 && !line.startsWith('#');
        elements.push(
          <p
            key={index}
            className={`text-base sm:text-lg text-stone-700 leading-relaxed mb-4 ${
              isFirstPara ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-stone-900' : ''
            }`}
          >
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <article className="min-h-screen pb-24">
      {/* Reading Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50 pointer-events-none">
        <div
          className="h-full bg-stone-900 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Navigation & Action Ribbon */}
      <div className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-16 z-30 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stories</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleLike(post)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md border border-stone-200 transition-colors cursor-pointer hover:border-rose-300 hover:text-rose-600 ${
                isLiked ? 'text-rose-600 border-rose-200 bg-rose-50 font-semibold' : 'text-stone-700 bg-white'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span className="font-mono tabular-nums">{post.likesCount}</span>
            </button>

            <button
              onClick={() => onToggleBookmark(post)}
              className={`p-1.5 rounded-md border border-stone-200 transition-colors cursor-pointer hover:border-stone-400 ${
                isBookmarked ? 'bg-stone-900 text-white' : 'text-stone-600 bg-white'
              }`}
              title="Bookmark story"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-md border border-stone-200 text-stone-600 bg-white hover:border-stone-400 transition-colors cursor-pointer"
              title="Copy story link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            {isAuthor && (
              <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
                <button
                  onClick={() => onEdit(post)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-md hover:bg-stone-50 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(post)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 bg-white border border-rose-200 rounded-md hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Header Presentation */}
      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-8 text-center sm:text-left">
        {/* Zero-Pill Unboxed Metadata */}
        <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2 text-xs font-medium text-stone-500 mb-4">
          <span className="text-stone-900 font-semibold uppercase tracking-wider">
            {post.category}
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>{formattedDate}</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{post.readTimeMinutes} min read</span>
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>{post.viewsCount} views</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-950 tracking-tight leading-tight mb-4 [text-wrap:balance]">
          {post.title}
        </h1>

        {post.subtitle && (
          <p className="text-lg sm:text-xl font-serif text-stone-600 leading-relaxed mb-6 [text-wrap:balance]">
            {post.subtitle}
          </p>
        )}

        {/* Author Byline */}
        <div className="flex items-center justify-center sm:justify-start gap-3 pt-4 border-t border-stone-200">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover bg-stone-200"
          />
          <div className="text-left">
            <p className="text-sm font-semibold text-stone-900">{post.author.name}</p>
            <p className="text-xs text-stone-500">{post.author.bio || 'Author & Contributor'}</p>
          </div>
        </div>
      </header>

      {/* Visual Focal Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-10">
        <div className="overflow-hidden rounded-lg border border-stone-200 shadow-xs">
          <ArtisticCover
            theme={post.coverStyle.theme}
            pattern={post.coverStyle.pattern}
            customUrl={post.coverStyle.customUrl}
            category={post.category}
            title={post.title}
            aspect="16:9"
          />
        </div>
      </div>

      {/* Reading Canvas: Strictly 65-75ch Measure */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 font-sans">
        <div className="prose prose-stone max-w-none">
          {renderFormattedContent(post.content)}
        </div>

        {/* Tags */}
        <div className="mt-10 pt-6 border-t border-stone-200 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono text-stone-600 bg-stone-100 px-2.5 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author Bio Box */}
        <section className="mt-10 p-6 bg-stone-100 rounded-lg border border-stone-200 flex items-start gap-4">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-12 h-12 rounded-full object-cover bg-stone-200 shrink-0"
          />
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-1">Written by {post.author.name}</h4>
            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              {post.author.bio ||
                'Contributing author and researcher, sharing insights on software engineering, system architecture, and modern full-stack workflows.'}
            </p>
            <span className="text-[11px] font-mono text-stone-400">
              STAFF TECHNICAL AUTHOR
            </span>
          </div>
        </section>

        {/* Comments Section */}
        <CommentSection
          postId={post.id}
          currentUser={currentUser}
          onRequireAuth={onRequireAuth}
        />
      </main>
    </article>
  );
};
