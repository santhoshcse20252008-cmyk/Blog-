import React, { useState } from 'react';
import { Layers, Terminal, Database, Code, Compass, Cpu } from 'lucide-react';
import { Category } from '../types/blog';

interface ArtisticCoverProps {
  theme?: 'slate' | 'amber' | 'emerald' | 'indigo' | 'rose' | 'bronze';
  pattern?: 'grid' | 'dots' | 'waves' | 'blueprint' | 'mesh';
  customUrl?: string;
  category?: Category;
  title?: string;
  className?: string;
  aspect?: '16:9' | '4:3' | 'banner';
}

const THEME_STYLES = {
  slate: {
    bg: 'from-stone-900 via-stone-850 to-neutral-900',
    accent: 'text-stone-300',
    border: 'border-stone-800',
    gridColor: 'rgba(255, 255, 255, 0.05)',
  },
  indigo: {
    bg: 'from-slate-900 via-indigo-950 to-slate-900',
    accent: 'text-indigo-200',
    border: 'border-indigo-900/50',
    gridColor: 'rgba(165, 180, 252, 0.08)',
  },
  emerald: {
    bg: 'from-zinc-900 via-emerald-950 to-zinc-900',
    accent: 'text-emerald-200',
    border: 'border-emerald-900/50',
    gridColor: 'rgba(110, 231, 183, 0.08)',
  },
  amber: {
    bg: 'from-stone-900 via-amber-950/80 to-stone-900',
    accent: 'text-amber-200',
    border: 'border-amber-900/50',
    gridColor: 'rgba(252, 211, 77, 0.08)',
  },
  rose: {
    bg: 'from-stone-900 via-rose-950/80 to-stone-900',
    accent: 'text-rose-200',
    border: 'border-rose-900/50',
    gridColor: 'rgba(253, 164, 175, 0.08)',
  },
  bronze: {
    bg: 'from-stone-900 via-amber-950/50 to-neutral-900',
    accent: 'text-orange-200',
    border: 'border-orange-900/40',
    gridColor: 'rgba(249, 115, 22, 0.08)',
  },
};

export const ArtisticCover: React.FC<ArtisticCoverProps> = ({
  theme = 'slate',
  pattern = 'blueprint',
  customUrl,
  category = 'Full-Stack',
  title = '',
  className = '',
  aspect = '16:9',
}) => {
  const [imgError, setImgError] = useState(false);
  const currentTheme = THEME_STYLES[theme] || THEME_STYLES.slate;

  const aspectClass =
    aspect === 'banner'
      ? 'h-48 md:h-72 w-full'
      : aspect === '4:3'
      ? 'aspect-[4/3] w-full'
      : 'aspect-[16/9] w-full';

  const getCategoryIcon = () => {
    switch (category) {
      case 'Architecture':
        return <Layers className="w-8 h-8 opacity-40 text-stone-300" />;
      case 'Full-Stack':
        return <Terminal className="w-8 h-8 opacity-40 text-stone-300" />;
      case 'Databases':
        return <Database className="w-8 h-8 opacity-40 text-stone-300" />;
      case 'Frontend':
        return <Code className="w-8 h-8 opacity-40 text-stone-300" />;
      case 'Systems':
        return <Cpu className="w-8 h-8 opacity-40 text-stone-300" />;
      default:
        return <Compass className="w-8 h-8 opacity-40 text-stone-300" />;
    }
  };

  if (customUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden ${aspectClass} ${className} bg-stone-900`}>
        <img
          src={customUrl}
          alt={title || 'Post cover'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${aspectClass} ${className} bg-gradient-to-br ${currentTheme.bg} border-b ${currentTheme.border} flex flex-col justify-between p-6 select-none`}
    >
      {/* Background Graphic SVG Pattern */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`pattern-${theme}-${pattern}`}
            width={pattern === 'dots' ? '24' : pattern === 'grid' ? '40' : '48'}
            height={pattern === 'dots' ? '24' : pattern === 'grid' ? '40' : '48'}
            patternUnits="userSpaceOnUse"
          >
            {pattern === 'dots' && (
              <circle cx="2" cy="2" r="1.5" fill={currentTheme.gridColor} />
            )}
            {pattern === 'grid' && (
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={currentTheme.gridColor}
                strokeWidth="1"
              />
            )}
            {pattern === 'blueprint' && (
              <>
                <rect width="48" height="48" fill="none" stroke={currentTheme.gridColor} strokeWidth="1" />
                <path d="M 0 24 L 48 24 M 24 0 L 24 48" stroke={currentTheme.gridColor} strokeWidth="0.5" strokeDasharray="2,2" />
              </>
            )}
            {pattern === 'waves' && (
              <path
                d="M 0 24 Q 12 12, 24 24 T 48 24"
                fill="none"
                stroke={currentTheme.gridColor}
                strokeWidth="1.5"
              />
            )}
            {pattern === 'mesh' && (
              <path
                d="M 0 0 L 48 48 M 48 0 L 0 48"
                fill="none"
                stroke={currentTheme.gridColor}
                strokeWidth="0.8"
              />
            )}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pattern-${theme}-${pattern})`} />
      </svg>

      {/* Decorative technical coordinate accents */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono tracking-widest uppercase opacity-60 text-stone-300">
        <span>EDITORIAL // ESSAY</span>
        <span>{category}</span>
      </div>

      {/* Center Motif */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center py-4">
        <div className="p-3 rounded-full bg-white/5 border border-white/10 mb-3 backdrop-blur-xs">
          {getCategoryIcon()}
        </div>
        <p className="text-xs uppercase tracking-widest text-stone-400 font-mono">
          Ref. {category.toUpperCase()} // 2026
        </p>
      </div>

      {/* Bottom Technical Line */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-stone-400 opacity-50 border-t border-white/10 pt-2">
        <span>ARCHIVE-SEC-04</span>
        <span>RESTFUL PROTOCOL</span>
      </div>
    </div>
  );
};
