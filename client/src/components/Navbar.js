import { Link, useLocation } from 'react-router-dom';
import AvatarMenu from './AvatarMenu';
import { useAuth } from './AuthProvider';
import { useState, useEffect, useRef } from 'react';
import { UPLOADS_URL } from '../utils/api';

export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    window.location.href = '/login?logout=true';
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

  // Close sidebar on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Check if route is active
  const isActive = (path) => location.pathname === path;

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
            <Link to={isAuthenticated ? "/home" : "/"}>
              <span className="logo-icon">🐾</span>
              <span className="logo-text">GoodPawies</span>
            </Link>
          </div>
        </div>

        {/* Right Side - Profile */}
        <div className="navbar-right">
          {!loading && isAuthenticated && user && (
            <div className="navbar-profile">
              <AvatarMenu
                imageUrl={user?.avatar ? `${UPLOADS_URL}/uploads/users/${user.avatar}` : null}
                username={user?.username || user?.fullName}
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
            {/* Sidebar Header */}
            <div className="sidebar-header-section">
              <div className="sidebar-user-card">
                <div className="avatar avatar-md">
                  {user?.avatar ? (
                    <img
                      src={`${UPLOADS_URL}/uploads/users/${user.avatar}`}
                      alt={user.username}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                    />
                  ) : (
                    <div className="avatar-initials w-100 h-100 d-flex align-items-center justify-content-center">
                      {(user?.username || user?.fullName || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="sidebar-user-details">
                  <span className="sidebar-username">{user?.fullName || user?.username || 'User'}</span>
                  <span className="sidebar-email">{user?.email || ''}</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <ul className="navbar-menu">
              <li className="menu-section-title">Menú Principal</li>
              <li>
                <Link to="/home" className={isActive('/home') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/chat" className={isActive('/chat') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Chat IA
                </Link>
              </li>

              <li className="menu-section-title">Gestión de Mascotas</li>
              <li>
                <Link to="/register/pet" className={isActive('/register/pet') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Agregar Mascota
                </Link>
              </li>
              <li>
                <Link to="/profile" className={isActive('/profile') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Mi Perfil y Mascotas
                </Link>
              </li>

              <li className="menu-section-title">Más</li>
              <li>
                <Link to="/demo" className={isActive('/demo') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  Demo
                </Link>
              </li>
            </ul>

            {/* Sidebar Footer */}
            <div className="sidebar-footer-section">
              <button className="sidebar-logout-btn" onClick={handleLogout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
          {menuOpen && <div className="navbar-overlay" onClick={() => setMenuOpen(false)}></div>}
        </>
      )}
    </nav>
  );
}
