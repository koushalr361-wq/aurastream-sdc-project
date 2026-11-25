import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DB_KEY = 'aura_react_db';
const SESSION_KEY = 'aura_react_session';

export default function User() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [db, setDb] = useState({ songs: [] });
  const [likes, setLikes] = useState(new Set());
  
  const [view, setView] = useState('all');
  const [search, setSearch] = useState('');
  
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const activeSession = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!activeSession) {
      navigate('/');
    } else {
      setSession(activeSession);
      setDb(JSON.parse(localStorage.getItem(DB_KEY)) || { songs: [] });
      const savedLikes = JSON.parse(localStorage.getItem(`aura_react_likes_${activeSession.email}`));
      if (savedLikes) setLikes(new Set(savedLikes));
    }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress(p => {
          if (p >= duration) {
            handleSkip(1);
            return 0;
          }
          return p + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  });

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    navigate('/');
  };

  const toggleLike = (id, e) => {
    if (e) e.stopPropagation();
    const newLikes = new Set(likes);
    if (newLikes.has(id)) newLikes.delete(id);
    else newLikes.add(id);
    setLikes(newLikes);
    localStorage.setItem(`aura_react_likes_${session.email}`, JSON.stringify([...newLikes]));
  };

  const playTrack = (track) => {
    setCurrentTrack(track);
    const timeParts = track.duration.split(':');
    setDuration(parseInt(timeParts[0]) * 60 + parseInt(timeParts[1] || 0));
    setProgress(0);
    setIsPlaying(true);
  };

  const handleSkip = (dir) => {
    if (!currentTrack || displayedSongs.length === 0) return;
    const currentIndex = displayedSongs.findIndex(s => s.id === currentTrack.id);
    let nextIndex = currentIndex + dir;
    if (nextIndex >= displayedSongs.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = displayedSongs.length - 1;
    playTrack(displayedSongs[nextIndex]);
  };

  const formatTime = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;

  let displayedSongs = [...db.songs].reverse();
  if (view === 'recent' && search === '') displayedSongs = displayedSongs.slice(0, 5);
  
  displayedSongs = displayedSongs.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.artist.toLowerCase().includes(search.toLowerCase());
    const matchView = (view !== 'liked') || likes.has(s.id);
    return matchSearch && matchView;
  });

  const viewTitles = { 'all': 'Listen Now', 'browse': 'Browse', 'radio': 'Radio', 'recent': 'Recently Added', 'liked': 'Liked Songs' };

  if (!session) return null;

  return (
    <div className="workspace">
      {currentTrack && <div className="ambient-bg" style={{ backgroundImage: `url(${currentTrack.cover})` }}></div>}
      
      <aside className="sidebar">
        <div className="search-box">
          <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input type="text" placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="nav-label">Apple Music</div>
        <button onClick={() => setView('all')} className={`nav-btn ${view==='all'?'active':''}`}>Listen Now</button>
        <button onClick={() => setView('browse')} className={`nav-btn ${view==='browse'?'active':''}`}>Browse</button>
        <button onClick={() => setView('radio')} className={`nav-btn ${view==='radio'?'active':''}`}>Radio</button>

        <div className="nav-label" style={{marginTop:'20px'}}>Library</div>
        <button onClick={() => setView('recent')} className={`nav-btn ${view==='recent'?'active':''}`}>Recently Added</button>
        <button onClick={() => setView('liked')} className={`nav-btn ${view==='liked'?'active':''}`}>Liked Songs</button>

        <div className="user-box">
          <div className="u-name">{session.name}</div>
          <button onClick={handleLogout} className="logout-btn">Sign Out</button>
        </div>
      </aside>

      <main className="main-area">
        <div className="header"><h2 className="view-title">{viewTitles[view]}</h2></div>
        <div className="grid-wrap custom-scroll">
          <div className="grid-container">
            {displayedSongs.length === 0 ? <div style={{color:'var(--text-muted)'}}>No music found.</div> : 
              displayedSongs.map(s => (
                <div key={s.id} className="card" onClick={() => playTrack(s)}>
                  <div className="cover-wrap">
                    <img src={s.cover} alt="" />
                    <div className="play-overlay"><div className="play-btn-circle"><div className="icon-play" style={{color:'white'}}></div></div></div>
                  </div>
                  <div className="card-title">{s.title}</div>
                  <div className="card-artist">{s.artist}</div>
                </div>
              ))
            }
          </div>
        </div>
      </main>

      <footer className="player-bar">
        <div className="p-info">
          <img src={currentTrack ? currentTrack.cover : ''} className="p-cover" style={{ opacity: currentTrack ? 1 : 0.3 }} alt="" />
          <div>
            <div className="p-title">{currentTrack ? currentTrack.title : 'Not Playing'}</div>
            <div className="p-artist">{currentTrack ? currentTrack.artist : ''}</div>
          </div>
        </div>
        <div className="p-controls">
          <div className="ctrl-btns">
            <button onClick={()=>handleSkip(-1)} className="btn-transport"><div className="icon-skip-b"></div></button>
            <button onClick={()=> currentTrack && setIsPlaying(!isPlaying)} className="btn-transport btn-main">
              {isPlaying ? <div className="icon-pause" style={{color:'black'}}><div></div><div></div></div> : <div className="icon-play" style={{color:'black'}}></div>}
            </button>
            <button onClick={()=>handleSkip(1)} className="btn-transport"><div className="icon-skip-f"></div></button>
          </div>
          <div className="prog-wrap">
            <span>{formatTime(progress)}</span>
            <div className="prog-track"><div className="prog-fill" style={{ width: `${duration ? (progress/duration)*100 : 0}%` }}></div></div>
            <span>{currentTrack ? currentTrack.duration : '-:--'}</span>
          </div>
        </div>
        <div className="p-extra">
          <button onClick={() => currentTrack && toggleLike(currentTrack.id)} className={`btn-like ${currentTrack && likes.has(currentTrack.id) ? 'liked' : ''}`} style={{opacity: currentTrack ? 1 : 0}}>
            <svg className="svg-heart" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>
      </footer>
    </div>
  );
}