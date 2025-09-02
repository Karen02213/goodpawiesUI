import { Link } from 'react-router-dom';
import AvatarMenu from './AvatarMenu';
import { useAuth } from '../utils/auth';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const userImageUrl = user?.avatar || '/default-avatar.png';
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login?logout=true&username=' + user?.username;
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && 
          sidebarRef.current && 
          hamburgerRef.current &&
          !sidebarRef.current.contains(event.target) &&
          !hamburgerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Side - Hamburger Button */}
        <div className="navbar-left">
          {isAuthenticated && (
            <button
              ref={hamburgerRef}
              className={`hamburger-btn ${menuOpen ? 'active' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}
        </div>

        {/* Center - Logo */}
        <div className="navbar-center">
          <div className="navbar-logo">
            <Link to="/">GoodPawies</Link>
          </div>
        </div>

        {/* Right Side - Profile */}
        <div className="navbar-right">
          {isAuthenticated && (
            <div className="navbar-profile">
              <AvatarMenu
                imageUrl={userImageUrl}
                username={user?.username}
                onLogout={handleLogout}
              />
            </div>
          )}
        </div>
      </div>

      {/* Side Menu */}
      {isAuthenticated && (
        <>
          <div 
            ref={sidebarRef}
            className={`navbar-sidebar ${menuOpen ? 'open' : ''}`}
          >
            <ul className="navbar-menu">
              <li><Link to="/" onClick={() => setMenuOpen(false)}>HOME</Link></li>
              <li><Link to="/qr" onClick={() => setMenuOpen(false)}>QR</Link></li>
              <li><Link to="/demo" onClick={() => setMenuOpen(false)}>DEMO</Link></li>
            </ul>
          </div>
          {menuOpen && <div className="navbar-overlay" onClick={() => setMenuOpen(false)}></div>}
        </>
      )}
    </nav>
  );
}
