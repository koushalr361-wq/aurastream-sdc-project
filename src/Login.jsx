import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DB_KEY = 'aura_react_db';
const SESSION_KEY = 'aura_react_session';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem(DB_KEY)) {
      localStorage.setItem(DB_KEY, JSON.stringify({
        users: [{ name: 'Admin', email: 'admin@aura.com', pass: 'admin123', role: 'admin' }],
        songs: [
            { id: 1, title: 'Naatu Naatu', artist: 'Kaala Bhairava', album: 'RRR', genre: 'Mass', duration: '3:34', cover: 'https://images.unsplash.com/photo-1533174000255-70362f6b8e39?w=500&q=80' },
            { id: 2, title: 'Butta Bomma', artist: 'Armaan Malik', album: 'AVPL', genre: 'Melody', duration: '3:17', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80' },
            { id: 3, title: 'Samajavaragamana', artist: 'Sid Sriram', album: 'AVPL', genre: 'Melody', duration: '3:42', cover: 'https://images.unsplash.com/photo-1493225457224-b1eb21f5756c?w=500&q=80' },
            { id: 4, title: 'Aaya sher', artist: 'Anirudh', album: 'The paradise', genre: 'Dance', duration: '3:43', cover: 'https://images.unsplash.com/photo-1546367564-ade1880f8921?w=500&q=80' },
            { id: 5, title: 'Srivalli', artist: 'Sid Sriram', album: 'Pushpa', genre: 'Melody', duration: '3:44', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
            { id: 6, title: 'Dum Masala', artist: 'Sanjith Hegde', album: 'Guntur Kaaram', genre: 'Mass', duration: '3:22', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
            { id: 7, title: 'Kurchi Madathapetti', artist: 'Sri Krishna', album: 'Guntur Kaaram', genre: 'Dance', duration: '3:35', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80' },
            { id: 8, title: 'Ramuloo Ramulaa', artist: 'Anurag Kulkarni', album: 'AVPL', genre: 'Mass', duration: '4:02', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' },
            { id: 9, title: 'Inkem Inkem', artist: 'Sid Sriram', album: 'Geetha Govindam', genre: 'Melody', duration: '4:28', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80' },
            { id: 10, title: 'Hukum', artist: 'Anirudh', album: 'Jailer', genre: 'BGM', duration: '3:27', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80' }
        ]
      }));
    }
  }, []);

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const db = JSON.parse(localStorage.getItem(DB_KEY));

    if (!isLogin) {
      if (db.users.find(u => u.email === email)) return showToast('Aura ID already exists', true);
      db.users.push({ name, email, pass: password, role: 'user' });
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      showToast('Aura ID Created');
      setTimeout(() => setIsLogin(true), 1000);
    } else {
      const user = db.users.find(u => u.email === email && u.pass === password);
      if (!user) return showToast('Incorrect email or password', true);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      navigate(user.role === 'admin' ? '/admin' : '/user');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="ambient-bg"><div className="blob blob-1"></div><div className="blob blob-2"></div></div>
      
      {toast && (
        <div id="toast" style={{ transform: 'translate(-50%, 20px)', color: toast.isErr ? '#ff453a' : '#fff' }}>
          {toast.msg}
        </div>
      )}

      <div className="auth-card pop-in">
        <div className="logo"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg></div>
        <h1 className="text-center">Aura ID</h1>
        <p className="subtitle text-center">Sign in to access your music.</p>

        <div className="segmented-control">
          <div className="seg-indicator" style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }}></div>
          <button className={`seg-btn ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Sign In</button>
          <button className={`seg-btn ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Create ID</button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <input type="text" className="apple-input" placeholder="First & Last Name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="input-group">
            <input type="email" className="apple-input" placeholder="Email (Aura ID)" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <input type="password" className="apple-input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="apple-btn">{isLogin ? 'Sign In' : 'Create Aura ID'}</button>
        </form>
      </div>
    </div>
  );
}