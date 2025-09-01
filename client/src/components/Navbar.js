import { Link } from 'react-router-dom';
import AvatarMenu from './AvatarMenu';
import { useAuth } from '../utils/auth';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  // const { user, isAuthenticated, logout } = useAuthContext();
  const userImageUrl = user?.avatar || '/default-avatar.png';
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login?logout=true&username=' + user?.username;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/" >GoodPawies</Link>
        </div>

        {/* Navigation Links (Center) */}
        {isAuthenticated && (
          <ul className={`navbar-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
            <li><Link to="/" onClick={() => setMenuOpen(false)}>HOME</Link></li>
            <li><Link to="/qr" onClick={() => setMenuOpen(false)}>QR</Link></li>
            <li><Link to="/demo" onClick={() => setMenuOpen(false)}>DEMO</Link></li>
          </ul>
        )}

        {/* Profile Section (Right) */}
        {isAuthenticated && (
          <div className="navbar-profile">
            <AvatarMenu 
              imageUrl={userImageUrl} 
              username={user?.username}
              onLogout={handleLogout}
            />
          </div>
        )}

        {/* Mobile Toggle */}
        <input
          type="checkbox"
          id="menu-toggle"
          className="menu-toggle"
          checked={menuOpen}
          onChange={() => setMenuOpen(!menuOpen)}
        />
        <label htmlFor="menu-toggle" className="hamburger">☰</label>
      </div>
    </nav>
  );
}
