import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function AvatarMenu({ imageUrl }) {
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


  return (
    <div ref={menuRef}
      style={{
        position: "relative",
        display: "inline-block",
        // responsive container sizing
        maxWidth: "100%"
      }}
      >
      {/* Foto de perfil */}
      <img
        src={imageUrl || "/default-avatar.png"}
        alt="Perfil"
        onClick={() => setOpen(!open)}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          objectFit: "cover",
          cursor: "pointer",
          border: "2px solid #ccc"
        }}
      />

      {/* Menú desplegable */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "0",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            padding: "10px",
            minWidth: "150px",
            zIndex: 10
          }}
        >
            <Link to="/perfil" style={linkStyle}>👤 Ver Perfil</Link>
            {/* <Link to="/configuracion" style={linkStyle}>⚙️ Configuración</Link> */}
            <button onClick={() => alert("Cerrar sesión")} style={buttonStyle}>
              🚪 Cerrar sesión
            </button>
        </div>
      )}
    </div>
  );
}

const linkStyle = {
  display: "block",
  padding: "8px",
  textDecoration: "none",
  color: "black",
  borderRadius: "5px"
};

const buttonStyle = {
  display: "block",
  padding: "8px",
  width: "100%",
  background: "transparent",
  border: "none",
  textAlign: "left",
  cursor: "pointer",
  color: "black",
  borderRadius: "5px"
};