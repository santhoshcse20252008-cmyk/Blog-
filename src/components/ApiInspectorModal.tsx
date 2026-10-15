import React, { useState } from 'react';
import { X, Play, Copy, Check, Terminal, Server, Database, ArrowRight } from 'lucide-react';

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EndpointPreset {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  defaultBody?: string;
}

const PRESETS: EndpointPreset[] = [
  {
    name: 'Get All Posts',
    method: 'GET',
    path: '/api/posts?sort=latest',
    description: 'Fetch paginated list of posts with filtering & sorting',
  },
  {
    name: 'Get Single Post',
    method: 'GET',
    path: '/api/posts/post-1',
    description: 'Retrieve post-1 details including view counters',
  },
  {
    name: 'Create New Post',
    method: 'POST',
    path: '/api/posts',
    description: 'Create a new blog post record in database',
    defaultBody: JSON.stringify(
      {
        title: 'Zero-Copy Serialization in High-Throughput Buffers',
        subtitle: 'Eliminating context switching overhead in event streams.',
        excerpt: 'How zero-copy memory mapping improves message serialization.',
        content: '# Zero-Copy Foundations\n\nDirect ring buffer allocation minimizes heap allocations...',
        category: 'Systems',
        tags: ['Performance', 'Memory', 'Go', 'Rust'],
        author: {
          id: 'user-2',
          name: 'Alex Rivera',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede',
          role: 'Senior Engineer',
        },
      },
      null,
      2
    ),
  },
  {
    name: 'Get Post Comments',
    method: 'GET',
    path: '/api/posts/post-1/comments',
    description: 'Retrieve threaded discussion tree with nested replies',
  },
  {
    name: 'Add Comment to Post',
    method: 'POST',
    path: '/api/posts/post-1/comments',
    description: 'Submit a new comment or threaded reply',
    defaultBody: JSON.stringify(
      {
        content: 'Fascinating analysis of idempotent keys! Does this cover network socket timeout envelopes?',
        author: {
          id: 'user-2',
          name: 'Alex Rivera',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede',
          email: 'alex.rivera@thiranex.io',
        },
      },
      null,
      2
    ),
  },
  {
    name: 'Toggle Post Like',
    method: 'POST',
    path: '/api/posts/post-1/like',
    description: 'Toggle upvote state for specified user ID',
    defaultBody: JSON.stringify({ userId: 'user-2' }, null, 2),
  },
  {
    name: 'Platform Database Stats',
    method: 'GET',
    path: '/api/stats',
    description: 'Aggregated analytics: total posts, comments, authors, reads',
  },
  {
    name: 'Service Health Check',
    method: 'GET',
    path: '/api/health',
    description: 'RESTful API catalog and server uptime verification',
  },
];

export const ApiInspectorModal: React.FC<ApiInspectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<EndpointPreset>(PRESETS[0]);
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>(PRESETS[0].method);
  const [path, setPath] = useState(PRESETS[0].path);
  const [body, setBody] = useState(PRESETS[0].defaultBody || '');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (p: EndpointPreset) => {
    setSelectedPreset(p);
    setMethod(p.method);
    setPath(p.path);
    setBody(p.defaultBody || '');
    setResponseData(null);
    setResponseStatus(null);
  };

  const executeRequest = async () => {
    setLoading(true);
    setResponseData(null);
    setResponseStatus(null);
    const start = performance.now();

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (['POST', 'PUT'].includes(method) && body.trim()) {
        options.body = body.trim();
      }

      const res = await fetch(path, options);
      const end = performance.now();
      setResponseTime(Math.round(end - start));
      setResponseStatus(res.status);

      const json = await res.json();
      setResponseData(JSON.stringify(json, null, 2));
    } catch (err: unknown) {
      const end = performance.now();
      setResponseTime(Math.round(end - start));
      setResponseStatus(500);
      setResponseData(
        JSON.stringify(
          {
            error: err instanceof Error ? err.message : 'Request failed',
            note: 'Make sure server is active on port 3000.',
          },
          null,
          2
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (responseData) {
      navigator.clipboard.writeText(responseData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-900 text-white rounded-md">
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                RESTful API Inspector & Tester
              </h3>
              <p className="text-xs text-stone-500">
                Verify backend HTTP verb compliance, JSON serialization, and database persistence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Split */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left: Endpoint Presets List */}
          <div className="lg:col-span-4 border-r border-stone-200 p-4 overflow-y-auto bg-stone-50/50 space-y-1.5">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2 px-1">
              Live Endpoints
            </span>
            {PRESETS.map((p) => {
              const active = selectedPreset.name === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => handleSelectPreset(p)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    active
                      ? 'bg-white border-stone-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white/70'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        p.method === 'GET'
                          ? 'bg-sky-100 text-sky-800'
                          : p.method === 'POST'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.method === 'PUT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.method}
                    </span>
                    <span className="text-xs font-semibold text-stone-900 truncate">
                      {p.name}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-stone-500 truncate">{p.path}</p>
                </button>
              );
            })}
          </div>

          {/* Right: Request Builder & Response Viewer */}
          <div className="lg:col-span-8 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-4">
            {/* Request Bar */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold px-2.5 py-2 rounded-md ${
                  method === 'GET'
                    ? 'bg-sky-100 text-sky-800'
                    : method === 'POST'
                    ? 'bg-emerald-100 text-emerald-800'
                    : method === 'PUT'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {method}
              </span>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="flex-1 text-xs font-mono p-2 border border-stone-200 rounded-md focus:outline-none focus:border-stone-900 bg-stone-50"
              />
              <button
                onClick={executeRequest}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-md transition-colors cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'Executing...' : 'Send'}</span>
              </button>
            </div>

            {/* Request Body (for POST/PUT) */}
            {['POST', 'PUT'].includes(method) && (
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Request Payload (application/json)
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  className="w-full text-xs font-mono p-3 bg-stone-900 text-stone-200 rounded-md border border-stone-800 focus:outline-none"
                />
              </div>
            )}

            {/* Response Area */}
            <div className="flex-1 flex flex-col border border-stone-200 rounded-lg overflow-hidden bg-stone-950 text-stone-200 min-h-[220px]">
              <div className="px-4 py-2 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-stone-400">HTTP RESPONSE</span>
                  {responseStatus !== null && (
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        responseStatus >= 200 && responseStatus < 300
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      Status: {responseStatus}
                    </span>
                  )}
                  {responseTime !== null && (
                    <span className="text-stone-400 text-[11px]">
                      {responseTime}ms latency
                    </span>
                  )}
                </div>

                {responseData && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                )}
              </div>

              <div className="p-4 flex-1 overflow-auto font-mono text-xs text-stone-300 leading-relaxed">
                {loading ? (
                  <div className="text-stone-500 italic">Dispatching HTTP request to backend...</div>
                ) : responseData ? (
                  <pre className="whitespace-pre-wrap">{responseData}</pre>
                ) : (
                  <div className="text-stone-500 italic">
                    Click "Send" above to invoke this REST endpoint and inspect the live JSON database response.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
