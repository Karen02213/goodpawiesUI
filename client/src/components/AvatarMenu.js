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
    <div ref={menuRef} className="profile-avatar-menu">
      {/* Profile Photo */}
      <img
        src={imageUrl || "/default-avatar.png"}
        alt="Perfil"
        onClick={() => setOpen(!open)}
        className="profile-avatar-image"
      />

      {/* Dropdown Menu */}
      {open && (
        <div className="profile-dropdown-menu">
          {username && (
            <div className="profile-user-greeting">
              Hola, {username}
            </div>
          )}
          <Link 
            to="/perfil" 
            className="profile-dropdown-link" 
            onClick={() => setOpen(false)}
          >
            👤 Ver Perfil
          </Link>
          <Link 
            to="/configuracion" 
            className="profile-dropdown-link"
            onClick={() => setOpen(false)}
          >
            ⚙️ Configuración
          </Link>
          <button 
            onClick={handleLogout} 
            className="profile-logout-button"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}