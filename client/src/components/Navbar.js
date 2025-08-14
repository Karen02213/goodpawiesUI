import { Link } from 'react-router-dom';
import AvatarMenu from './AvatarMenu';
import { useAuth } from '../utils/auth';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const userImageUrl = user?.avatar || '/default-avatar.png';
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/" >GoodPawies</Link>
        </div>

        {/* Toggle para móvil */}
        <input
          type="checkbox"
          id="menu-toggle"
          className="menu-toggle"
          checked={menuOpen}
          onChange={() => setMenuOpen(!menuOpen)}
        />
        <label htmlFor="menu-toggle" className="hamburger">☰</label>

        {/* Menú */}
        <ul className="navbar-menu">
          {isAuthenticated && (
            <>
              <li><Link to="/qr" onClick={() => setMenuOpen(false)}>QR</Link></li>
              <li><Link to="/" onClick={() => setMenuOpen(false)}>HOME</Link></li>
              <li className="avatar">
                <AvatarMenu 
                  imageUrl={userImageUrl} 
                  username={user?.username}
                  onLogout={handleLogout}
                />
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
