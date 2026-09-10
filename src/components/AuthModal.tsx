import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types/auth';
import { X, Check, ShieldCheck, Sparkles, User, Building, Compass, ArrowRight, Lock, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [tab, setTab] = useState<'login' | 'signup' | 'demo'>('demo');
  const [selectedRole, setSelectedRole] = useState<UserRole>('designer');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Pre-configured demo accounts for instantaneous 1-click testing
  const demoAccounts: {
    role: UserRole;
    name: string;
    title: string;
    studio: string;
    location: string;
    description: string;
    tradeDiscount: number;
    badge: string;
  }[] = [
    {
      role: 'designer',
      name: 'Elena Vance',
      title: 'Principal Interior Architect',
      studio: 'Studio Vance Milan',
      location: 'Milan & New York',
      description: 'Specifies custom draperies for residential penthouses and boutique luxury hotels.',
      tradeDiscount: 25,
      badge: 'Trade Specifier (25% Off)',
    },
    {
      role: 'homeowner',
      name: 'Marcus Sterling',
      title: 'Private Residence Owner',
      studio: 'Sterling Penthouse 18B',
      location: 'Tribeca, New York',
      description: 'Designing bespoke window dressings for high-ceiling living room and master suite.',
      tradeDiscount: 0,
      badge: 'Private Client',
    },
    {
      role: 'brand_partner',
      name: 'Sophia Laurent',
      title: 'Aatmi Showroom Director',
      studio: 'Aatmi Haute Drapery Studio',
      location: 'Mayfair, London',
      description: 'Curating seasonal velvet, silk brocade, and tailored linen drapery collections.',
      tradeDiscount: 40,
      badge: 'Brand Showroom Partner',
    },
  ];

  const handleSelectDemo = (demo: typeof demoAccounts[0]) => {
    const user: UserProfile = {
      id: `usr-${demo.role}-${Date.now()}`,
      name: demo.name,
      email: `${demo.name.toLowerCase().replace(/\s+/g, '.')}@aatmi-studio.com`,
      role: demo.role,
      studioName: demo.studio,
      location: demo.location,
      savedProjectsCount: demo.role === 'designer' ? 6 : 2,
      tradeDiscountPercent: demo.tradeDiscount,
    };
    onLogin(user);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (tab === 'signup' && !name.trim()) {
      setError('Please enter your full name or studio name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    const displayName = tab === 'signup' ? name : email.split('@')[0];
    const user: UserProfile = {
      id: `usr-${Date.now()}`,
      name: displayName,
      email: email,
      role: selectedRole,
      studioName: studioName || (selectedRole === 'designer' ? `${displayName} Design Studio` : undefined),
      location: 'Global Atelier',
      savedProjectsCount: 1,
      tradeDiscountPercent: selectedRole === 'designer' ? 25 : selectedRole === 'brand_partner' ? 40 : 0,
    };

    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-stone-800 flex items-center justify-between bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <span className="font-serif font-bold text-stone-950 text-base">A</span>
            </div>
            <div>
              <h3 className="font-serif font-semibold text-stone-100 text-base flex items-center gap-2">
                Aatmi Atelier Studio
                <span className="text-[10px] uppercase font-sans font-semibold tracking-wider bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                  Access
                </span>
              </h3>
              <p className="text-xs text-stone-400 font-sans">
                {currentUser ? 'Manage your studio session & trade account' : 'Sign in or explore with Instant Studio Demo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Already Logged In */}
        {currentUser ? (
          <div className="p-6 space-y-5">
            <div className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-stone-100 truncate">{currentUser.name}</h4>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    {currentUser.role === 'designer' ? 'Architect / Designer' : currentUser.role === 'brand_partner' ? 'Brand Partner' : 'Client'}
                  </span>
                </div>
                <p className="text-xs text-stone-400 truncate">{currentUser.email}</p>
                {currentUser.studioName && (
                  <p className="text-xs text-amber-300/80 font-medium truncate mt-0.5">{currentUser.studioName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-850 p-3 rounded-lg border border-stone-800">
                <span className="text-stone-400 block text-[11px]">Trade Privilege:</span>
                <span className="font-semibold text-amber-300 text-sm">
                  {currentUser.tradeDiscountPercent ? `${currentUser.tradeDiscountPercent}% Wholesale Trade` : 'Direct Showroom'}
                </span>
              </div>
              <div className="bg-stone-850 p-3 rounded-lg border border-stone-800">
                <span className="text-stone-400 block text-[11px]">Saved Portfolios:</span>
                <span className="font-semibold text-stone-200 text-sm">
                  {currentUser.savedProjectsCount} Custom Rooms
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={onLogout}
                className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-100 rounded-lg text-xs font-semibold transition cursor-pointer border border-stone-700"
              >
                Sign Out / Switch Studio Account
              </button>
            </div>
          </div>
        ) : (
          /* Login / Signup / Demo Tabs */
          <div className="p-6 flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800 mb-5">
              <button
                type="button"
                onClick={() => { setTab('demo'); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === 'demo'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Demo</span>
              </button>
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                  tab === 'login'
                    ? 'bg-stone-800 text-stone-100 font-semibold shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                  tab === 'signup'
                    ? 'bg-stone-800 text-stone-100 font-semibold shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300">
                {error}
              </div>
            )}

            {/* TAB 1: 1-Click Instant Demo Profiles */}
            {tab === 'demo' && (
              <div className="space-y-3">
                <p className="text-xs text-stone-400 leading-relaxed">
                  Select a persona below to explore Aatmi with authentic interior designer or private client credentials:
                </p>

                <div className="space-y-2.5">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleSelectDemo(acc)}
                      className="w-full text-left p-3.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 hover:border-amber-500/50 transition cursor-pointer group flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-stone-800 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-stone-700 group-hover:border-amber-500/30">
                          {acc.role === 'designer' ? <Compass className="w-4 h-4" /> : acc.role === 'brand_partner' ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-100 text-xs group-hover:text-amber-300 transition">
                              {acc.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 font-medium">
                              {acc.studio}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                            {acc.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-amber-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition shrink-0 flex items-center gap-1">
                        Enter <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2 & 3: Standard Email Sign In & Sign Up */}
            {(tab === 'login' || tab === 'signup') && (
              <form onSubmit={handleCustomSubmit} className="space-y-3.5">
                {tab === 'signup' && (
                  <>
                    {/* Role Selection */}
                    <div>
                      <label className="block text-xs text-stone-400 font-medium mb-1">
                        I am joining as:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedRole('designer')}
                          className={`py-1.5 px-2 rounded-md text-[11px] font-medium border text-center transition cursor-pointer ${
                            selectedRole === 'designer'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-stone-850 border-stone-750 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          Designer / Trade
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRole('homeowner')}
                          className={`py-1.5 px-2 rounded-md text-[11px] font-medium border text-center transition cursor-pointer ${
                            selectedRole === 'homeowner'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-stone-850 border-stone-750 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          Private Client
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRole('brand_partner')}
                          className={`py-1.5 px-2 rounded-md text-[11px] font-medium border text-center transition cursor-pointer ${
                            selectedRole === 'brand_partner'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-stone-850 border-stone-750 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          Showroom
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-stone-400 font-medium mb-1">
                        Full Name / Principal
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Elena Vance"
                        className="w-full bg-stone-950 border border-stone-750 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {selectedRole === 'designer' && (
                      <div>
                        <label className="block text-xs text-stone-400 font-medium mb-1">
                          Studio / Architecture Firm Name
                        </label>
                        <input
                          type="text"
                          value={studioName}
                          onChange={(e) => setStudioName(e.target.value)}
                          placeholder="e.g. Vance Architectural Interiors"
                          className="w-full bg-stone-950 border border-stone-750 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-xs text-stone-400 font-medium mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="designer@studio.com"
                      className="w-full bg-stone-950 border border-stone-750 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-400 font-medium mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-stone-950 border border-stone-750 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-lg text-xs transition cursor-pointer shadow-md"
                >
                  {tab === 'signup' ? 'Create Studio Account & Enter' : 'Sign In to Atelier'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-stone-950 border-t border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500/80" />
            <span>Encrypted Trade Security</span>
          </span>
          <span className="text-stone-400 font-serif">Aatmi Couture Drapery</span>
        </div>
      </div>
    </div>
  );
};
