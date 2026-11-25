import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  Search,
  Home,
  Compass,
  ListMusic,
  ShieldCheck,
  LogOut,
  Disc3,
  AudioLines,
  Plus,
  X,
} from 'lucide-react';
import { getDB, saveDB, getSession, clearSession } from './store';

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function User() {
  const navigate = useNavigate();
  const session = getSession();

  const [db, setDb] = useState(() => getDB());
  const [activeNav, setActiveNav] = useState('listen'); // 'listen' | 'browse' | 'favorites'
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [queueOpen, setQueueOpen] = useState(false);

  // Audio playback state
  const audioRef = useRef(null);
  const [currentTrackId, setCurrentTrackId] = useState(() => getDB().tracks[0]?.id || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  // Sync live updates if Admin adds/deletes tracks
  useEffect(() => {
    const sync = () => setDb(getDB());
    window.addEventListener('aurastream-db-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('aurastream-db-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const tracks = db.tracks || [];
  const likedIds = db.likedIds || [];

  const currentTrack = useMemo(
    () => tracks.find((t) => t.id === currentTrackId) || tracks[0] || null,
    [tracks, currentTrackId]
  );

  const genres = useMemo(() => {
    const unique = Array.from(new Set(tracks.map((t) => t.genre).filter(Boolean)));
    return ['All', ...unique];
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      if (activeNav === 'favorites' && !likedIds.includes(t.id)) return false;
      if (selectedGenre !== 'All' && t.genre !== selectedGenre) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tracks, activeNav, likedIds, selectedGenre, searchQuery]);

  // Handle track source changes & play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      setCurrentTime(0);
    }
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playTrack = (track) => {
    if (!track) return;
    if (track.id === currentTrack?.id) {
      setIsPlaying((p) => !p);
    } else {
      setCurrentTrackId(track.id);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (!tracks.length) return;
    if (shuffle) {
      const pool = tracks.filter((t) => t.id !== currentTrack?.id);
      const next = pool[Math.floor(Math.random() * pool.length)] || tracks[0];
      setCurrentTrackId(next.id);
      setIsPlaying(true);
      return;
    }
    const idx = tracks.findIndex((t) => t.id === currentTrack?.id);
    const nextTrack = tracks[(idx + 1) % tracks.length];
    setCurrentTrackId(nextTrack.id);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (!tracks.length) return;
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const idx = tracks.findIndex((t) => t.id === currentTrack?.id);
    const prevTrack = tracks[(idx - 1 + tracks.length) % tracks.length];
    setCurrentTrackId(prevTrack.id);
    setIsPlaying(true);
  };

  const toggleLike = (id, e) => {
    if (e) e.stopPropagation();
    const nextDb = getDB();
    const exists = nextDb.likedIds.includes(id);
    nextDb.likedIds = exists
      ? nextDb.likedIds.filter((item) => item !== id)
      : [...nextDb.likedIds, id];
    saveDB(nextDb);
    setDb(nextDb);
  };

  const handleSeek = (e) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const heroTrack = tracks[0];

  return (
    <div className="h-screen bg-[#000000] text-white flex flex-col overflow-hidden select-none">
      {/* Hidden Real HTML5 Audio Element */}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={() => {
          if (repeat && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } else {
            handleNext();
          }
        }}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Frosted Sidebar */}
        <aside className="w-60 shrink-0 bg-[#111113]/85 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col justify-between p-4 hidden md:flex">
          <div>
            {/* Brand Header */}
            <div className="flex items-center gap-2.5 px-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#FA243C] flex items-center justify-center">
                <Disc3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight">AuraStream</span>
            </div>

            {/* Apple Music Style Search Input */}
            <div className="relative mb-5">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs, artists"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1C1C1E] border border-white/[0.08] text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FA243C]"
              />
            </div>

            {/* Primary Navigation */}
            <div className="space-y-1">
              <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/35 mb-1.5">
                Apple Music
              </p>
              {[
                { id: 'listen', label: 'Listen Now', icon: Home },
                { id: 'browse', label: 'Browse', icon: Compass },
                { id: 'favorites', label: 'Favorites', icon: Heart, badge: likedIds.length },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                      active
                        ? 'bg-white/[0.1] text-white'
                        : 'text-white/65 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-[#FA243C]' : 'text-[#FA243C]/80'}`} />
                      {item.label}
                    </span>
                    {typeof item.badge === 'number' && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/[0.08] text-white/60">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom User & Studio Switcher */}
          <div className="space-y-2 pt-4 border-t border-white/[0.08]">
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#1C1C1E]/80 hover:bg-[#1C1C1E] border border-white/[0.08] text-xs font-medium text-white/85 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#FA243C]" />
              <span>Switch to Admin Studio</span>
            </button>

            <div className="flex items-center justify-between px-2 py-1.5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {session?.name || 'Kaushal'}
                </p>
                <p className="text-[11px] text-white/45 truncate">Lossless Plan</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Center Scrollable Content */}
        <main className="flex-1 overflow-y-auto relative pb-28">
          {/* Dynamic Ambient Artwork Glow behind Hero */}
          {currentTrack && (
            <div
              className="pointer-events-none absolute top-0 inset-x-0 h-[360px] opacity-25 blur-[110px] transition-all duration-700"
              style={{
                backgroundImage: `url(${currentTrack.cover})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}

          <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-6">
            {/* Top Mobile Header + Genre Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-white/[0.08]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {activeNav === 'listen'
                    ? 'Listen Now'
                    : activeNav === 'browse'
                    ? 'Browse Catalog'
                    : 'Favorite Songs'}
                </h1>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                      selectedGenre === g
                        ? 'bg-[#FA243C] text-white'
                        : 'bg-[#1C1C1E] text-white/70 hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
                <button
                  onClick={() => navigate('/admin')}
                  className="md:hidden px-3 py-1 rounded-full text-xs font-medium bg-[#1C1C1E] text-[#FA243C] border border-white/[0.08]"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Editorial Hero Feature (Shown on Listen Now) */}
            {activeNav === 'listen' && heroTrack && !searchQuery && selectedGenre === 'All' && (
              <section className="mb-9">
                <div className="rounded-2xl bg-[#111113]/85 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden shrink-0 shadow-2xl bg-[#1C1C1E]">
                    <img
                      src={heroTrack.cover}
                      alt={heroTrack.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#FA243C] mb-1.5">
                      Spatial Audio Premiere
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight truncate mb-1">
                      {heroTrack.title}
                    </h2>
                    <p className="text-sm sm:text-base text-white/65 mb-4">
                      {heroTrack.artist} • {heroTrack.album}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => playTrack(heroTrack)}
                        className="px-5 py-2.5 rounded-full bg-[#FA243C] hover:bg-[#e11d34] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition shadow-lg shadow-[#FA243C]/25 cursor-pointer"
                      >
                        {currentTrack?.id === heroTrack.id && isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 fill-current" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current" />
                            <span>Play Now</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => toggleLike(heroTrack.id, e)}
                        className="px-4 py-2.5 rounded-full bg-[#1C1C1E] hover:bg-white/[0.12] border border-white/[0.08] text-xs sm:text-sm font-medium flex items-center gap-2 transition cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            likedIds.includes(heroTrack.id)
                              ? 'fill-[#FA243C] text-[#FA243C]'
                              : 'text-white/70'
                          }`}
                        />
                        <span>{likedIds.includes(heroTrack.id) ? 'Favorited' : 'Favorite'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Heavy Rotation Album Grid */}
            <section className="mb-9">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-lg font-bold tracking-tight">Heavy Rotation</h3>
                <span className="text-xs text-white/45">{filteredTracks.length} Masters</span>
              </div>

              {filteredTracks.length === 0 ? (
                <div className="rounded-2xl bg-[#111113] border border-white/[0.08] p-10 text-center">
                  <p className="text-sm text-white/60">No tracks match this filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredTracks.map((track) => {
                    const active = currentTrack?.id === track.id;
                    return (
                      <div
                        key={track.id}
                        onClick={() => playTrack(track)}
                        className="group cursor-pointer rounded-xl p-2.5 bg-[#111113]/60 hover:bg-[#1C1C1E]/80 border border-white/[0.06] hover:border-white/[0.14] transition"
                      >
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-[#1C1C1E] mb-2.5">
                          <img
                            src={track.cover}
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div
                            className={`absolute inset-0 bg-black/35 flex items-end justify-between p-2.5 transition-opacity ${
                              active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <span className="w-9 h-9 rounded-full bg-[#FA243C] text-white flex items-center justify-center shadow-lg">
                              {active && isPlaying ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => toggleLike(track.id, e)}
                              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  likedIds.includes(track.id)
                                    ? 'fill-[#FA243C] text-[#FA243C]'
                                    : 'text-white'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <p
                          className={`text-sm font-medium truncate ${
                            active ? 'text-[#FA243C]' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className="text-xs text-white/50 truncate">{track.artist}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Apple Music Tracklist Table */}
            <section>
              <h3 className="text-lg font-bold tracking-tight mb-3">Top Songs</h3>
              <div className="rounded-2xl bg-[#111113]/80 border border-white/[0.08] overflow-hidden">
                {filteredTracks.map((track, index) => {
                  const active = currentTrack?.id === track.id;
                  const liked = likedIds.includes(track.id);
                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className={`flex items-center justify-between px-4 py-2.5 border-b last:border-b-0 border-white/[0.06] hover:bg-white/[0.05] transition cursor-pointer ${
                        active ? 'bg-white/[0.06]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <span className="w-5 text-xs text-white/40 text-right shrink-0">
                          {active && isPlaying ? (
                            <AudioLines className="w-4 h-4 text-[#FA243C] inline animate-pulse" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <img
                          src={track.cover}
                          alt={track.title}
                          className="w-10 h-10 rounded-md object-cover bg-[#1C1C1E] shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-medium truncate ${
                                active ? 'text-[#FA243C]' : 'text-white'
                              }`}
                            >
                              {track.title}
                            </p>
                            {track.lossless && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/[0.08] text-white/60 shrink-0">
                                Lossless
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50 truncate">{track.artist}</p>
                        </div>
                      </div>

                      <div className="hidden md:block text-xs text-white/45 truncate max-w-[220px] px-4">
                        {track.album}
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => toggleLike(track.id, e)}
                          className="text-white/50 hover:text-[#FA243C] transition cursor-pointer"
                        >
                          <Heart
                            className={`w-4 h-4 ${liked ? 'fill-[#FA243C] text-[#FA243C]' : ''}`}
                          />
                        </button>
                        <span className="text-xs text-white/45 w-10 text-right tabular-nums">
                          {track.duration}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </main>

        {/* Slide-Out Up Next Queue Drawer */}
        {queueOpen && (
          <aside className="w-72 shrink-0 bg-[#111113]/95 backdrop-blur-2xl border-l border-white/[0.08] p-4 flex flex-col pb-24">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-semibold">Playing Next</h3>
              <button
                onClick={() => setQueueOpen(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {tracks.map((t) => {
                const active = t.id === currentTrack?.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => playTrack(t)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition cursor-pointer ${
                      active ? 'bg-white/[0.1]' : 'hover:bg-white/[0.05]'
                    }`}
                  >
                    <img
                      src={t.cover}
                      alt={t.title}
                      className="w-9 h-9 rounded object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-medium truncate ${
                          active ? 'text-[#FA243C]' : 'text-white'
                        }`}
                      >
                        {t.title}
                      </p>
                      <p className="text-[11px] text-white/45 truncate">{t.artist}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Frosted Glass Playback Bar */}
      <footer className="fixed bottom-0 inset-x-0 h-20 bg-[#111113]/85 backdrop-blur-2xl border-t border-white/[0.1] px-4 sm:px-6 flex items-center justify-between gap-4 z-30">
        {/* Left: Active Track Metadata */}
        <div className="flex items-center gap-3 min-w-0 w-1/4 sm:w-1/3">
          {currentTrack ? (
            <>
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover bg-[#1C1C1E] border border-white/[0.1] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-white/55 truncate">{currentTrack.artist}</p>
              </div>
              <button
                onClick={(e) => toggleLike(currentTrack.id, e)}
                className="hidden sm:inline-flex p-1.5 text-white/50 hover:text-[#FA243C] transition cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${
                    likedIds.includes(currentTrack.id) ? 'fill-[#FA243C] text-[#FA243C]' : ''
                  }`}
                />
              </button>
            </>
          ) : (
            <span className="text-xs text-white/45">Select a track to play</span>
          )}
        </div>

        {/* Center: Transport Controls + Scrubber */}
        <div className="flex flex-col items-center flex-1 max-w-xl">
          <div className="flex items-center gap-5 mb-1">
            <button
              onClick={() => setShuffle((s) => !s)}
              className={`transition cursor-pointer ${
                shuffle ? 'text-[#FA243C]' : 'text-white/50 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handlePrev}
              className="text-white/80 hover:text-white transition cursor-pointer"
              title="Previous"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="w-9 h-9 rounded-full bg-white text-black hover:scale-105 active:scale-95 flex items-center justify-center transition cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="text-white/80 hover:text-white transition cursor-pointer"
              title="Next"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => setRepeat((r) => !r)}
              className={`transition cursor-pointer ${
                repeat ? 'text-[#FA243C]' : 'text-white/50 hover:text-white'
              }`}
              title="Repeat"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-full flex items-center gap-2.5">
            <span className="text-[10px] text-white/45 w-8 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="apple-scrubber w-full h-1 rounded-lg"
                style={{
                  background: `linear-gradient(to right, #FA243C ${
                    duration ? (currentTime / duration) * 100 : 0
                  }%, rgba(255,255,255,0.16) ${
                    duration ? (currentTime / duration) * 100 : 0
                  }%)`,
                }}
              />
            </div>
            <span className="text-[10px] text-white/45 w-8 tabular-nums">
              {duration ? formatTime(duration) : currentTrack?.duration || '0:00'}
            </span>
          </div>
        </div>

        {/* Right: Volume + Queue Toggle */}
        <div className="flex items-center justify-end gap-3 w-1/4 sm:w-1/3">
          <div className="hidden sm:flex items-center gap-2 w-28">
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="text-white/60 hover:text-white cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setIsMuted(false);
                setVolume(Number(e.target.value));
              }}
              className="apple-scrubber w-full h-1 rounded-lg"
              style={{
                background: `linear-gradient(to right, #ffffff ${
                  (isMuted ? 0 : volume) * 100
                }%, rgba(255,255,255,0.16) ${(isMuted ? 0 : volume) * 100}%)`,
              }}
            />
          </div>

          <button
            onClick={() => setQueueOpen((q) => !q)}
            className={`p-2 rounded-lg transition cursor-pointer ${
              queueOpen
                ? 'bg-[#FA243C] text-white'
                : 'text-white/65 hover:text-white hover:bg-white/[0.08]'
            }`}
            title="Up Next Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}