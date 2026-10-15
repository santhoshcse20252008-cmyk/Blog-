import React, { useState, useEffect } from 'react';
import { 
  X, Bold, Italic, Heading2, Heading3, List, ListOrdered, 
  Code, Quote, Sparkles, Eye, Edit3, Image as ImageIcon, Save, Check
} from 'lucide-react';
import { Post, Category, User } from '../types/blog';
import { ArtisticCover } from './ArtisticCover';

interface PostEditorProps {
  initialPost?: Post | null;
  currentUser: User;
  onSave: (postData: Partial<Post>) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES: Category[] = [
  'Architecture',
  'Full-Stack',
  'Systems',
  'Frontend',
  'Databases',
  'Future Tech',
];

const THEMES: Array<'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'bronze'> = [
  'slate',
  'indigo',
  'emerald',
  'amber',
  'rose',
  'bronze',
];

const PATTERNS: Array<'blueprint' | 'mesh' | 'grid' | 'waves' | 'dots'> = [
  'blueprint',
  'mesh',
  'grid',
  'waves',
  'dots',
];

export const PostEditor: React.FC<PostEditorProps> = ({
  initialPost,
  currentUser,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialPost?.title || '');
  const [subtitle, setSubtitle] = useState(initialPost?.subtitle || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [category, setCategory] = useState<Category>(initialPost?.category || 'Full-Stack');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialPost?.tags || ['Architecture', 'API']);
  const [coverTheme, setCoverTheme] = useState<'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'bronze'>(
    initialPost?.coverStyle?.theme || 'slate'
  );
  const [coverPattern, setCoverPattern] = useState<'blueprint' | 'mesh' | 'grid' | 'waves' | 'dots'>(
    initialPost?.coverStyle?.pattern || 'blueprint'
  );
  const [customCoverUrl, setCustomCoverUrl] = useState(initialPost?.coverStyle?.customUrl || '');
  const [isDraft, setIsDraft] = useState(initialPost?.isDraft || false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate estimated reading time
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const insertText = (prefix: string, suffix = '') => {
    const textarea = document.getElementById('post-content-area') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  const handleAiAssist = async (action: 'outline' | 'refine') => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          prompt: title || 'Full stack web development architecture with REST APIs and databases',
          context: content,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.suggestion) {
          if (action === 'outline') {
            setContent((prev) => (prev ? prev + '\n\n' + json.suggestion : json.suggestion));
          } else {
            setExcerpt(json.suggestion);
          }
        }
      }
    } catch (err) {
      console.error('AI assist failed', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (draftState: boolean) => {
    if (!title.trim()) {
      setErrorMsg('Please enter an article title.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Please enter article content.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      await onSave({
        title: title.trim(),
        subtitle: subtitle.trim(),
        excerpt: excerpt.trim() || content.trim().slice(0, 160) + '...',
        content: content.trim(),
        category,
        tags,
        coverStyle: {
          theme: coverTheme,
          pattern: coverPattern,
          customUrl: customCoverUrl.trim() || undefined,
        },
        readTimeMinutes: readTime,
        isDraft: draftState,
        author: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          bio: currentUser.bio,
          role: currentUser.role === 'author' ? 'Staff Writer' : 'Contributor',
        },
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-serif font-bold text-stone-900">
              {initialPost ? 'Edit Post' : 'Create New Post'}
            </h2>
            <span className="text-stone-300">·</span>
            <span className="text-xs font-mono text-stone-500">
              {words} words · ~{readTime} min read
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-stone-200 rounded-lg text-xs font-medium mr-2">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'edit' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'preview' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                Preview
              </button>
            </div>

            <button
              onClick={onCancel}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="bg-rose-50 text-rose-700 px-6 py-2 text-xs border-b border-rose-200 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {viewMode === 'edit' ? (
            <>
              {/* Title & Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Architecting Scalable RESTful Services..."
                  className="w-full text-xl font-serif font-bold p-3 border border-stone-200 rounded-md focus:outline-none focus:border-stone-900 placeholder:text-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Subtitle or Deck (Optional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="A concise one-line summary framing the thesis..."
                  className="w-full text-sm p-2.5 border border-stone-200 rounded-md focus:outline-none focus:border-stone-900 placeholder:text-stone-300"
                />
              </div>

              {/* Category & Tags Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-md bg-white focus:outline-none focus:border-stone-900"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tags (Press Enter or comma)
                  </label>
                  <div className="border border-stone-200 rounded-md p-1.5 flex flex-wrap items-center gap-1.5 bg-white">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-600 text-stone-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder={tags.length === 0 ? 'Type tag and press enter...' : '+ Add tag'}
                      className="text-xs p-1 focus:outline-none flex-1 min-w-[120px]"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Artwork Configuration */}
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-stone-800">
                    Artistic Cover Motif & Palette
                  </span>
                  <span className="text-[11px] font-mono text-stone-500">Zero-Broken-Image Vector</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Theme Palette</label>
                    <div className="flex items-center gap-2">
                      {THEMES.map((th) => (
                        <button
                          key={th}
                          type="button"
                          onClick={() => setCoverTheme(th)}
                          className={`w-7 h-7 rounded-md cursor-pointer border-2 transition-transform ${
                            coverTheme === th ? 'border-stone-900 scale-110' : 'border-transparent'
                          } ${
                            th === 'slate'
                              ? 'bg-stone-800'
                              : th === 'indigo'
                              ? 'bg-indigo-700'
                              : th === 'emerald'
                              ? 'bg-emerald-700'
                              : th === 'amber'
                              ? 'bg-amber-600'
                              : th === 'rose'
                              ? 'bg-rose-700'
                              : 'bg-orange-800'
                          }`}
                          title={th}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Vector Pattern</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {PATTERNS.map((pt) => (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => setCoverPattern(pt)}
                          className={`px-2.5 py-1 text-[11px] rounded capitalize transition-colors cursor-pointer ${
                            coverPattern === pt
                              ? 'bg-stone-900 text-white font-medium'
                              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {pt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-200">
                  <label className="block text-[11px] text-stone-600 mb-1">
                    Or Custom Cover Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={customCoverUrl}
                    onChange={(e) => setCustomCoverUrl(e.target.value)}
                    placeholder="https://example.com/cover-image.jpg"
                    className="w-full text-xs p-2 border border-stone-200 rounded-md bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1 flex-wrap p-1 bg-stone-100 rounded-md border border-stone-200 text-stone-700">
                    <button
                      type="button"
                      onClick={() => insertText('**', '**')}
                      className="p-1.5 hover:bg-white rounded transition-colors cursor-pointer"
                      title="Bold (**text**)"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('*', '*')}
                      className="p-1.5 hover:bg-white rounded transition-colors cursor-pointer"
                      title="Italic (*text*)"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('## ')}
                      className="p-1.5 hover:bg-white rounded transition-colors cursor-pointer"
                      title="Heading 2 (## Title)"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('### ')}
                      className="p-1.5 hover:bg-white rounded transition-colors cursor-pointer"
                      title="Heading 3 (### Title)"
                    >
                      <Heading3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('- ')}
                      className="p-1.5 hover:bg-white rounded transition-colors cursor-pointer"
                      title="Bullet list"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('1. ')}
                      className="p-1.5 hover:bg-white rounded transition-colors cursor-pointer"
                      title="Numbered list"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('```typescript\n', '\n```')}
                      className="p-1.5 hover:bg-white rounded transition-colors cursor-pointer"
                      title="Code Block"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('> ')}
                      className="p-1.5 hover:bg-white rounded transition-colors cursor-pointer"
                      title="Pullquote (> quote)"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* AI Assistant Button */}
                  <button
                    type="button"
                    onClick={() => handleAiAssist('outline')}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-900 text-amber-300 hover:text-amber-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    title="Generate article outline via AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{aiLoading ? 'Thinking...' : 'AI Outline'}</span>
                  </button>
                </div>

                {/* Content Textarea */}
                <textarea
                  id="post-content-area"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article narrative here using markdown or rich text..."
                  rows={14}
                  className="w-full text-sm font-mono leading-relaxed p-4 border border-stone-200 rounded-md focus:outline-none focus:border-stone-900 bg-white placeholder:text-stone-300"
                />
              </div>

              {/* Excerpt */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Summary / Excerpt (Used in story cards)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAiAssist('refine')}
                    className="text-[11px] text-stone-600 hover:text-stone-900 underline cursor-pointer"
                  >
                    Auto-generate excerpt
                  </button>
                </div>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief 1-2 sentence hook for the article..."
                  rows={2}
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-md focus:outline-none focus:border-stone-900"
                />
              </div>
            </>
          ) : (
            /* Live Preview Screen */
            <div className="space-y-6">
              <div className="overflow-hidden rounded-lg border border-stone-200">
                <ArtisticCover
                  theme={coverTheme}
                  pattern={coverPattern}
                  customUrl={customCoverUrl}
                  category={category}
                  title={title || 'Preview Title'}
                  aspect="16:9"
                />
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-2">
                  <span className="font-semibold text-stone-900 uppercase">{category}</span>
                  <span>·</span>
                  <span>{readTime} min read</span>
                </div>

                <h1 className="text-3xl font-serif font-bold text-stone-950 mb-3">
                  {title || 'Untitled Post'}
                </h1>

                {subtitle && (
                  <p className="text-lg font-serif text-stone-600 italic mb-6">
                    {subtitle}
                  </p>
                )}

                <div className="prose prose-stone text-sm leading-relaxed whitespace-pre-wrap">
                  {content || 'No content written yet.'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={saving}
              className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Publishing...' : 'Publish Story'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
