import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc3, Headphones, ShieldCheck, ArrowRight, Sparkles, Radio } from 'lucide-react';
import { getDB, saveDB, setSession } from './store';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin'); // 'signin' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('kaushal@aura.com');
  const [password, setPassword] = useState('user123');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const db = getDB();

    if (mode === 'signin') {
      const found = db.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );
      if (!found) {
        setError('Invalid Apple ID or password. Use demo credentials or instant access below.');
        return;
      }
      setSession(found);
      navigate(found.role === 'admin' ? '/admin' : '/user');
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please complete all fields to create your AuraStream ID.');
        return;
      }
      const exists = db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (exists) {
        setError('An account with this email already exists.');
        return;
      }
      const newUser = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'user',
      };
      db.users.push(newUser);
      saveDB(db);
      setSession(newUser);
      navigate('/user');
    }
  };

  const quickEnter = (role) => {
    const db = getDB();
    const target =
      db.users.find((u) => u.role === role) ||
      (role === 'admin'
        ? { id: 'usr-admin', name: 'Aura Studio Admin', email: 'admin@aura.com', role: 'admin' }
        : { id: 'usr-1', name: 'Kaushal', email: 'kaushal@aura.com', role: 'user' });
    setSession(target);
    navigate(role === 'admin' ? '/admin' : '/user');
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col lg:flex-row selection:bg-[#FA243C] selection:text-white">
      {/* Left Editorial Showcase */}
      <div className="relative lg:w-[54%] p-8 lg:p-14 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-white/[0.08]">
        {/* Ambient blurred album glow */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full opacity-30 blur-[130px]"
          style={{ background: 'radial-gradient(circle, #FA243C 0%, #581c87 60%, transparent 100%)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }}
        />

        {/* Brand Mark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FA243C] flex items-center justify-center shadow-lg shadow-[#FA243C]/25">
            <Disc3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-semibold tracking-tight">AuraStream</span>
            <span className="ml-2 text-[11px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/[0.08] text-white/70 font-medium">
              Lossless
            </span>
          </div>
        </div>

        {/* Hero Copy & Floating Album Mosaic */}
        <div className="relative z-10 my-12 lg:my-0 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs text-white/80 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#FA243C]" />
            <span>Spatial Audio with Dolby Atmos • 24-bit/192kHz</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.06] mb-5">
            Sound that moves around you.
          </h1>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-8">
            Stream curated Tollywood spatial masters, lossless studio sessions, and editorial playlists—with zero ads and instant studio publishing.
          </p>

          {/* Compact Featured Album Strip */}
          <div className="grid grid-cols-3 gap-3.5 max-w-md">
            {[
              {
                title: 'Devara: Part 1',
                sub: 'Anirudh Ravichander',
                img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80',
              },
              {
                title: 'Pushpa 2',
                sub: 'Devi Sri Prasad',
                img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
              },
              {
                title: 'Cupertino Sessions',
                sub: 'Lossless Master',
                img: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-xl bg-[#111113]/90 border border-white/[0.08] p-2.5 transition hover:border-white/20"
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-[#1C1C1E]">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <p className="text-xs font-medium text-white truncate">{item.title}</p>
                <p className="text-[11px] text-white/50 truncate">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/45">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#FA243C]" />
            AuraStream Live Studio Engine
          </span>
          <span>Apple Music Design Language</span>
        </div>
      </div>

      {/* Right Auth Column */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#000000]">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-1.5">
              {mode === 'signin' ? 'Sign in to AuraStream' : 'Create your Aura ID'}
            </h2>
            <p className="text-sm text-white/55">
              {mode === 'signin'
                ? 'Enter your credentials to sync your library and queue.'
                : 'Start listening in lossless quality in seconds.'}
            </p>
          </div>

          {/* Segmented Control */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#111113] border border-white/[0.08] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                mode === 'signin' ? 'bg-[#1C1C1E] text-white shadow-sm' : 'text-white/55 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                mode === 'register' ? 'bg-[#1C1C1E] text-white shadow-sm' : 'text-white/55 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-white/65 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kaushal"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111113] border border-white/[0.1] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FA243C]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/65 mb-1.5">Aura ID (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kaushal@aura.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111113] border border-white/[0.1] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FA243C]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-white/65">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@aura.com');
                      setPassword('admin123');
                    }}
                    className="text-[11px] text-[#FA243C] hover:underline"
                  >
                    Fill Admin Demo
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111113] border border-white/[0.1] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FA243C]"
              />
            </div>

            {error && (
              <div className="px-3.5 py-2.5 rounded-xl bg-[#FA243C]/12 border border-[#FA243C]/30 text-xs text-[#ff6b7d]">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#FA243C] hover:bg-[#e11d34] active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-[#FA243C]/20 cursor-pointer"
            >
              <span>{mode === 'signin' ? 'Continue' : 'Create Aura ID'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Discreet Instant-Access Switcher */}
          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <p className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-3">
              Instant Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => quickEnter('user')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#111113] hover:bg-[#1C1C1E] border border-white/[0.08] text-xs font-medium text-white/90 transition cursor-pointer"
              >
                <Headphones className="w-3.5 h-3.5 text-[#FA243C]" />
                <span>Listener App</span>
              </button>
              <button
                type="button"
                onClick={() => quickEnter('admin')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#111113] hover:bg-[#1C1C1E] border border-white/[0.08] text-xs font-medium text-white/90 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FA243C]" />
                <span>Admin Studio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}