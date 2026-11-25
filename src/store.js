const DB_KEY = 'aurastream_apple_db_v3';
const SESSION_KEY = 'aurastream_apple_session_v1';

export const DEFAULT_TRACKS = [
  {
    id: 'trk-1',
    title: 'Devara Thandavam (Spatial Master)',
    artist: 'Anirudh Ravichander',
    album: 'Devara: Part 1 (Original Motion Picture Soundtrack)',
    genre: 'Tollywood',
    duration: '2:31',
    lossless: true,
    cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=85',
    audioUrl: '/songs/Full%20Video%20Devara%20Thandavam%20NTR,%20Saif%20Ali%20Khan,%20Koratala%20Siva%20Anirudh%20In%20cinemas%20now.mp3',
    plays: 482910,
  },
  {
    id: 'trk-2',
    title: 'Kurchi Madathapetti (Club Edit)',
    artist: 'Thaman S, Sri Krishna',
    album: 'Guntur Kaaram',
    genre: 'Tollywood',
    duration: '3:34',
    lossless: true,
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=85',
    audioUrl: '/songs/Kurchi%20Madathapetti%20Full%20Video%20Song%20Guntur%20Kaaram%20Mahesh%20Babu%20Sreeleela%20Trivikram%20Thaman%20S.mp3',
    plays: 619400,
  },
  {
    id: 'trk-3',
    title: 'Sooseki (The Couple Song)',
    artist: 'Devi Sri Prasad, Shreya Ghoshal',
    album: 'Pushpa 2: The Rule',
    genre: 'Tollywood',
    duration: '4:12',
    lossless: true,
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=85',
    audioUrl: '/songs/Full%20Video%20SOOSEKI%20Pushpa%202%20The%20Rule%20Allu%20Arjun%20Rashmika%20Shreya%20Ghoshal%20Sukumar%20DSP.mp3',
    plays: 745120,
  },
  {
    id: 'trk-4',
    title: 'Midnight in Hyderabad',
    artist: 'Vivek Sagar',
    album: 'Deccan Nocturnes',
    genre: 'Indie & Synth',
    duration: '0:18',
    lossless: true,
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=85',
    audioUrl: '/songs/track-4.wav',
    plays: 192340,
  },
  {
    id: 'trk-5',
    title: 'Obsidian Horizon',
    artist: 'Kiasmos & Nils Frahm',
    album: 'Cupertino Sessions',
    genre: 'Electronic',
    duration: '0:18',
    lossless: true,
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=800&q=85',
    audioUrl: '/songs/track-5.wav',
    plays: 310450,
  },
  {
    id: 'trk-6',
    title: 'Naatu Pulse (Dolby Atmos)',
    artist: 'M.M. Keeravaani',
    album: 'RRR: Rise Roar Revolt',
    genre: 'Tollywood',
    duration: '0:18',
    lossless: true,
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=85',
    audioUrl: '/songs/track-6.wav',
    plays: 980200,
  },
  {
    id: 'trk-7',
    title: 'Velvet Rain on Marine Drive',
    artist: 'Prateek Kuhad',
    album: 'Monsoon Acoustic EP',
    genre: 'Acoustic',
    duration: '0:18',
    lossless: false,
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=85',
    audioUrl: '/songs/track-7.wav',
    plays: 254800,
  },
  {
    id: 'trk-8',
    title: 'Starlight Telemetry',
    artist: 'Odesza',
    album: 'The Last Goodbye (Studio Master)',
    genre: 'Electronic',
    duration: '0:18',
    lossless: true,
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=85',
    audioUrl: '/songs/track-8.wav',
    plays: 530910,
  },
];

const DEFAULT_DB = {
  users: [
    { id: 'usr-admin', name: 'Aura Studio Admin', email: 'admin@aura.com', password: 'admin123', role: 'admin' },
    { id: 'usr-1', name: 'Kaushal', email: 'kaushal@aura.com', password: 'user123', role: 'user' },
  ],
  tracks: DEFAULT_TRACKS,
  likedIds: ['trk-1', 'trk-3', 'trk-5'],
};

export function getDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DB));
      return structuredClone(DEFAULT_DB);
    }
    const parsed = JSON.parse(raw);
    if (!parsed.tracks || !Array.isArray(parsed.tracks) || parsed.tracks.length === 0) {
      parsed.tracks = DEFAULT_TRACKS;
    }
    if (!parsed.users) parsed.users = DEFAULT_DB.users;
    if (!parsed.likedIds) parsed.likedIds = [];
    return parsed;
  } catch {
    return structuredClone(DEFAULT_DB);
  }
}

export function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  window.dispatchEvent(new Event('aurastream-db-updated'));
}

export function resetDB() {
  const fresh = structuredClone(DEFAULT_DB);
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  window.dispatchEvent(new Event('aurastream-db-updated'));
  return fresh;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}