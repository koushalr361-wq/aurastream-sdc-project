import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Disc3,
  PlusCircle,
  Trash2,
  RotateCcw,
  Headphones,
  LogOut,
  Music,
  Sparkles,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { getDB, saveDB, resetDB, clearSession } from './store';

const SAMPLE_PRESETS = [
  {
    title: 'Fear Song (Atmos Mix)',
    artist: 'Anirudh Ravichander',
    album: 'Devara: Part 1',
    genre: 'Tollywood',
    duration: '3:15',
    lossless: true,
    cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=85',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
];

export default function Admin() {
  const navigate = useNavigate();
  const [db, setDb] = useState(() => getDB());
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    title: '',
    artist: '',
    album: '',
    genre: 'Tollywood',
    duration: '3:30',
    lossless: true,
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=85',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  });

  useEffect(() => {
    const sync = () => setDb(getDB());
    window.addEventListener('aurastream-db-updated', sync);
    return () => window.removeEventListener('aurastream-db-updated', sync);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.artist.trim()) return;

    const current = getDB();
    const newTrack = {
      id: `trk-${Date.now()}`,
      title: form.title.trim(),
      artist: form.artist.trim(),
      album: form.album.trim() || 'Single Release',
      genre: form.genre.trim() || 'Tollywood',
      duration: form.duration.trim() || '3:30',
      lossless: Boolean(form.lossless),
      cover:
        form.cover.trim() ||
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=85',
      audioUrl:
        form.audioUrl.trim() ||
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      plays: 12500,
    };

    current.tracks = [newTrack, ...current.tracks];
    saveDB(current);
    setDb(current);

    setForm((prev) => ({
      ...prev,
      title: '',
      artist: '',
      album: '',
    }));
    showToast(`Published "${newTrack.title}" live to Listener App.`);
  };

  const handleDelete = (id, title) => {
    const current = getDB();
    current.tracks = current.tracks.filter((t) => t.id !== id);
    current.likedIds = current.likedIds.filter((lid) => lid !== id);
    saveDB(current);
    setDb(current);
    showToast(`Removed "${title}" from catalog.`);
  };

  const handleReset = () => {
    const fresh = resetDB();
    setDb(fresh);
    showToast('Catalog reset to default 8 spatial masters.');
  };

  const fillQuickTrack = () => {
    const preset = SAMPLE_PRESETS[0];
    setForm(preset);
  };

  const tracks = db.tracks || [];
  const totalStreams = tracks.reduce((acc, t) => acc + (t.plays || 0), 0);
  const losslessCount = tracks.filter((t) => t.lossless).length;

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Top Frosted Studio Navbar */}
      <header className="sticky top-0 z-20 bg-[#111113]/85 backdrop-blur-2xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FA243C] flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold tracking-tight">AuraStream</span>
              <span className="ml-2 text-xs text-white/50 font-medium">for Artists</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/user')}
              className="px-3.5 py-2 rounded-xl bg-[#FA243C] hover:bg-[#e11d34] text-xs font-semibold text-white flex items-center gap-2 transition cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Open Listener App</span>
            </button>
            <button
              onClick={handleReset}
              title="Reset Demo Catalog"
              className="px-3 py-2 rounded-xl bg-[#1C1C1E] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-medium text-white/80 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
            <button
              onClick={() => {
                clearSession();
                navigate('/');
              }}
              title="Sign Out"
              className="p-2 rounded-xl bg-[#1C1C1E] hover:bg-white/[0.12] border border-white/[0.08] text-white/70 hover:text-white transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {/* Live Toast Banner */}
        {toast && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-[#1C1C1E] border border-[#FA243C]/40 flex items-center gap-2.5 text-sm text-white">
            <CheckCircle2 className="w-4 h-4 text-[#FA243C] shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Studio Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-[#111113] border border-white/[0.08] p-5">
            <div className="flex items-center justify-between text-white/50 text-xs font-medium mb-2">
              <span>Published Masters</span>
              <Music className="w-4 h-4 text-[#FA243C]" />
            </div>
            <p className="text-3xl font-bold tracking-tight">{tracks.length}</p>
            <p className="text-xs text-white/45 mt-1">Synced live with Listener App</p>
          </div>

          <div className="rounded-2xl bg-[#111113] border border-white/[0.08] p-5">
            <div className="flex items-center justify-between text-white/50 text-xs font-medium mb-2">
              <span>Total Catalog Streams</span>
              <BarChart3 className="w-4 h-4 text-[#FA243C]" />
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {(totalStreams / 1000000).toFixed(2)}M
            </p>
            <p className="text-xs text-white/45 mt-1">+14.2% this week across India</p>
          </div>

          <div className="rounded-2xl bg-[#111113] border border-white/[0.08] p-5">
            <div className="flex items-center justify-between text-white/50 text-xs font-medium mb-2">
              <span>24-Bit Lossless Rate</span>
              <Sparkles className="w-4 h-4 text-[#FA243C]" />
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {tracks.length ? Math.round((losslessCount / tracks.length) * 100) : 0}%
            </p>
            <p className="text-xs text-white/45 mt-1">
              {losslessCount} of {tracks.length} tracks in ALAC / Atmos
            </p>
          </div>
        </div>

        {/* Two-Column Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Publish New Master Form */}
          <section className="lg:col-span-5">
            <div className="rounded-2xl bg-[#111113] border border-white/[0.08] p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Publish New Master</h2>
                  <p className="text-xs text-white/50">Instant catalog deployment</p>
                </div>
                <button
                  type="button"
                  onClick={fillQuickTrack}
                  className="text-xs text-[#FA243C] hover:underline font-medium cursor-pointer"
                >
                  Auto-fill Demo
                </button>
              </div>

              <form onSubmit={handlePublish} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/65 mb-1">Track Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Fear Song (Atmos Mix)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1C1E] border border-white/[0.08] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FA243C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-white/65 mb-1">Artist *</label>
                    <input
                      type="text"
                      required
                      value={form.artist}
                      onChange={(e) => setForm({ ...form, artist: e.target.value })}
                      placeholder="Anirudh"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1C1E] border border-white/[0.08] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FA243C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/65 mb-1">Album</label>
                    <input
                      type="text"
                      value={form.album}
                      onChange={(e) => setForm({ ...form, album: e.target.value })}
                      placeholder="Devara: Part 1"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1C1E] border border-white/[0.08] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FA243C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-white/65 mb-1">Genre</label>
                    <select
                      value={form.genre}
                      onChange={(e) => setForm({ ...form, genre: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1C1E] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#FA243C]"
                    >
                      <option value="Tollywood">Tollywood</option>
                      <option value="Electronic">Electronic</option>
                      <option value="Indie & Synth">Indie & Synth</option>
                      <option value="Acoustic">Acoustic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/65 mb-1">Duration</label>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      placeholder="3:30"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1C1E] border border-white/[0.08] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FA243C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/65 mb-1">Cover Artwork URL</label>
                  <input
                    type="url"
                    value={form.cover}
                    onChange={(e) => setForm({ ...form, cover: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C1C1E] border border-white/[0.08] text-xs text-white/85 focus:outline-none focus:border-[#FA243C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/65 mb-1">Playable MP3 Stream URL</label>
                  <input
                    type="url"
                    value={form.audioUrl}
                    onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C1C1E] border border-white/[0.08] text-xs text-white/85 focus:outline-none focus:border-[#FA243C]"
                  />
                </div>

                <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.lossless}
                    onChange={(e) => setForm({ ...form, lossless: e.target.checked })}
                    className="accent-[#FA243C] w-4 h-4 rounded"
                  />
                  <span className="text-xs text-white/80">
                    Enable 24-Bit/192kHz Lossless & Dolby Atmos Badge
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#FA243C] hover:bg-[#e11d34] text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-[#FA243C]/20 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish to AuraStream</span>
                </button>
              </form>
            </div>
          </section>

          {/* Right: Live Catalog Manager */}
          <section className="lg:col-span-7">
            <div className="rounded-2xl bg-[#111113] border border-white/[0.08] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Live Studio Catalog</h2>
                  <p className="text-xs text-white/50">Changes reflect immediately in /user</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] text-white/70">
                  {tracks.length} Tracks
                </span>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={track.cover}
                        alt={track.title}
                        className="w-11 h-11 rounded-lg object-cover bg-[#1C1C1E] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{track.title}</p>
                          {track.lossless && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/[0.08] text-white/60 shrink-0">
                              Lossless
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50 truncate">
                          {track.artist} • {track.genre} • {track.duration}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(track.id, track.title)}
                      title="Delete Track"
                      className="p-2 rounded-lg text-white/45 hover:text-[#FA243C] hover:bg-[#FA243C]/10 transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}