import React from 'react';
import { PenSquare, LogIn, User as UserIcon } from 'lucide-react';
import { User } from '../types/blog';

interface NavbarProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenWrite: () => void;
  onOpenProfile: () => void;
  onOpenApiInspector: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onSelectCategory: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onOpenWrite,
  onOpenProfile,
  onOpenApiInspector,
  activeNav,
  setActiveNav,
  onSelectCategory,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single element brand wordmark */}
        <button
          onClick={() => {
            setActiveNav('stories');
            onSelectCategory('All');
          }}
          className="flex items-center gap-2 text-left group cursor-pointer shrink-0"
        >
          <span className="text-xl font-bold font-serif tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors whitespace-nowrap">
            Chronicle <span className="font-sans font-light text-stone-400">/</span> Blog
          </span>
        </button>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <button
            onClick={() => {
              setActiveNav('stories');
              onSelectCategory('All');
            }}
            className={`whitespace-nowrap transition-colors cursor-pointer hover:text-stone-900 ${
              activeNav === 'stories' ? 'text-stone-950 font-semibold underline underline-offset-8 decoration-stone-900' : ''
            }`}
          >
            Stories
          </button>
          <button
            onClick={() => {
              setActiveNav('architecture');
              onSelectCategory('Architecture');
            }}
            className={`whitespace-nowrap transition-colors cursor-pointer hover:text-stone-900 ${
              activeNav === 'architecture' ? 'text-stone-950 font-semibold underline underline-offset-8 decoration-stone-900' : ''
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => {
              setActiveNav('fullstack');
              onSelectCategory('Full-Stack');
            }}
            className={`whitespace-nowrap transition-colors cursor-pointer hover:text-stone-900 ${
              activeNav === 'fullstack' ? 'text-stone-950 font-semibold underline underline-offset-8 decoration-stone-900' : ''
            }`}
          >
            Full-Stack
          </button>
          <button
            onClick={onOpenApiInspector}
            className="whitespace-nowrap transition-colors cursor-pointer hover:text-stone-900"
          >
            API Explorer
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenWrite}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-all shadow-xs cursor-pointer whitespace-nowrap"
                title="Create new blog post"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Write Story</span>
              </button>

              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-md hover:bg-stone-100 transition-colors border border-stone-200 cursor-pointer"
                title="View user profile & authored articles"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover bg-stone-200"
                />
                <span className="text-xs font-medium text-stone-700 hidden lg:inline max-w-[110px] truncate">
                  {currentUser.name}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Demo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
