import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Admin from './Admin.jsx';
import User from './User.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/user" element={<User />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;