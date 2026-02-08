import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function AvatarMenu({ imageUrl, username, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div ref={menuRef} className="position-relative">
      {/* Profile Photo */}
      <div className="avatar avatar-md avatar-bordered avatar-hover-zoom" onClick={() => setOpen(!open)} style={{ cursor: 'pointer', marginLeft: '14px' }}>
        <img
          src={imageUrl || "/default-avatar.png"}
          alt="Profile"
        />
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div className="profile-dropdown-menu">
          {username && (
            <div className="profile-user-greeting">
              Hello, {username}
            </div>
          )}
          <Link
            to="/profile"
            className="profile-dropdown-link"
            onClick={() => setOpen(false)}
          >
            👤 View Profile
          </Link>
          <Link
            to="/profile/settings"
            className="profile-dropdown-link"
            onClick={() => setOpen(false)}
          >
            ⚙️ Settings
          </Link>
          <button
            onClick={handleLogout}
            className="profile-logout-button"
          >
            🚪 Log Out
          </button>
        </div>
      )}
    </div>
  );
}