import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DB_KEY = 'aura_react_db';
const SESSION_KEY = 'aura_react_session';

export default function Admin() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [db, setDb] = useState({ users: [], songs: [] });
  
  // Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [cover, setCover] = useState('');

  useEffect(() => {
    const activeSession = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!activeSession || activeSession.role !== 'admin') {
      navigate('/');
    } else {
      setSession(activeSession);
      setDb(JSON.parse(localStorage.getItem(DB_KEY)));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    navigate('/');
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const newDb = { ...db };
    newDb.songs.push({ id: Date.now(), title, artist, album, genre, duration, cover });
    localStorage.setItem(DB_KEY, JSON.stringify(newDb));
    setDb(newDb);
    setTitle(''); setArtist(''); setAlbum(''); setGenre(''); setDuration(''); setCover('');
  };

  const handleDelete = (id) => {
    const newDb = { ...db, songs: db.songs.filter(s => s.id !== id) };
    localStorage.setItem(DB_KEY, JSON.stringify(newDb));
    setDb(newDb);
  };

  if (!session) return null;

  return (
    <div className="admin-body">
      <header className="admin-header">
        <div>
          <h1 style={{fontSize:'28px', fontWeight:700}}>Aura Connect</h1>
          <p style={{fontSize:'14px', color:'var(--text-muted)'}}>Logged in as: {session.name}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">Sign Out</button>
      </header>

      <div className="dashboard">
        <div className="card">
          <div className="stat-grid">
            <div className="stat-box"><div className="stat-val">{db.users.length}</div><div className="stat-label">Listeners</div></div>
            <div class="stat-box"><div className="stat-val">{db.songs.length}</div><div className="stat-label">Tracks</div></div>
          </div>
          <h2 className="card-title">Upload Track</h2>
          <form onSubmit={handleAdd}>
            <input type="text" placeholder="Song Title" className="app-input" value={title} onChange={e=>setTitle(e.target.value)} required />
            <input type="text" placeholder="Artist" className="app-input" value={artist} onChange={e=>setArtist(e.target.value)} required />
            <input type="text" placeholder="Album Name" className="app-input" value={album} onChange={e=>setAlbum(e.target.value)} required />
            <div style={{display:'flex', gap:'15px'}}>
              <select className="app-input" value={genre} onChange={e=>setGenre(e.target.value)} required>
                <option value="" disabled>Genre</option>
                <option>Melody</option><option>Mass</option><option>Dance</option><option>Folk</option><option>BGM</option>
              </select>
              <input type="text" placeholder="3:30" className="app-input" value={duration} onChange={e=>setDuration(e.target.value)} required />
            </div>
            <input type="url" placeholder="Artwork URL" className="app-input" value={cover} onChange={e=>setCover(e.target.value)} required />
            <button type="submit" className="apple-btn">Publish to Library</button>
          </form>
        </div>

        <div className="card">
          <h2 className="card-title">Master Library</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Track Details</th><th>Album</th><th>Genre</th><th style={{textAlign:'right'}}>Action</th></tr></thead>
              <tbody>
                {[...db.songs].reverse().map(s => (
                  <tr key={s.id}>
                    <td style={{display:'flex', alignItems:'center'}}>
                      <img src={s.cover} className="td-cover" alt="" />
                      <div><div className="td-title">{s.title}</div><div className="td-artist">{s.artist}</div></div>
                    </td>
                    <td style={{fontSize:'13px', color:'#ccc'}}>{s.album || 'Single'}</td>
                    <td><span className="badge">{s.genre}</span></td>
                    <td style={{textAlign:'right'}}><button onClick={() => handleDelete(s.id)} className="del-btn">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}