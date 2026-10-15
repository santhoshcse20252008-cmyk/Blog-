import React, { useState } from 'react';
import { X, LogIn, UserPlus, Zap, Check, ArrowRight } from 'lucide-react';
import { User } from '../types/blog';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const DEMO_USERS = [
  {
    id: 'user-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@chronicle.dev',
    role: 'Principal Systems Architect',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4',
  },
  {
    id: 'user-2',
    name: 'Alex Rivera',
    email: 'alex.rivera@chronicle.dev',
    role: 'Full-Stack Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede',
  },
  {
    id: 'user-3',
    name: 'Devin Chen',
    email: 'devin.chen@chronicle.dev',
    role: 'Database Systems Researcher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Devin&backgroundColor=d1d4f9',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBio, setRegBio] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('Hero');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDemoLogin = (userId: string) => {
    const user = api.auth.switchDemoUser(userId);
    if (user) {
      onLoginSuccess(user);
      onClose();
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await api.auth.login(loginEmail);
      onLoginSuccess(user);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setError('Please provide your name and email.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        avatarSeed || regName
      )}&backgroundColor=b6e3f4`;

      const newUser = await api.auth.register({
        name: regName.trim(),
        email: regEmail.trim(),
        bio: regBio.trim() || 'Software engineer & technical author.',
        avatar,
        role: 'author',
      });

      onLoginSuccess(newUser);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-base font-serif font-bold text-stone-900">
              {tab === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h3>
            <p className="text-xs text-stone-500">
              Technical Publishing Platform Authentication
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Evaluation Personas */}
        <div className="p-5 bg-stone-50/70 border-b border-stone-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 mb-2.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>1-Click Test Personas (Instant Evaluation)</span>
          </div>

          <div className="space-y-1.5">
            {DEMO_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleDemoLogin(user.id)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200 hover:border-stone-900 hover:shadow-xs transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover bg-stone-200"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-900 group-hover:text-stone-950 truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">{user.role}</p>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-medium text-stone-500 group-hover:text-stone-900 flex items-center gap-1 shrink-0">
                  Select <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 border-b border-stone-200 text-xs font-medium text-center">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`py-2.5 transition-colors cursor-pointer ${
              tab === 'login'
                ? 'border-b-2 border-stone-900 text-stone-900 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`py-2.5 transition-colors cursor-pointer ${
              tab === 'register'
                ? 'border-b-2 border-stone-900 text-stone-900 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            New User Registration
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 px-6 py-2.5 text-xs border-b border-rose-200">
            {error}
          </div>
        )}

        {/* Tab 1: Login */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="sarah.j@chronicle.dev"
                required
                className="w-full text-xs p-2.5 border border-stone-200 rounded-md focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full text-xs p-2.5 border border-stone-200 rounded-md focus:outline-none focus:border-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        ) : (
          /* Tab 2: Register */
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Santhosh Kumar"
                required
                className="w-full text-xs p-2.5 border border-stone-200 rounded-md focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full text-xs p-2.5 border border-stone-200 rounded-md focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-2.5 border border-stone-200 rounded-md focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Author Bio / Headline (Optional)
              </label>
              <input
                type="text"
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                placeholder="Full-Stack Engineer & Cloud Enthusiast"
                className="w-full text-xs p-2.5 border border-stone-200 rounded-md focus:outline-none focus:border-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
