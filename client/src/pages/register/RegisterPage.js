import { useState } from "react";

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  backgroundColor: "#fff", // importante para <select>
  appearance: "none",      // elimina estilos nativos del navegador
};

const selectStyle = {
  width: "100%",
  padding: "0.5rem",
  marginBottom: "0.5rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "1rem"
};

const buttonStyle = {
  display: "block",
  marginLeft: "auto",
  padding: "12px",
  backgroundColor: "#007bff",
  color: "#fff",
  fontSize: "1rem",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

function getPasswordStrengthLevel(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.match(/[A-Z]/)) score++;
  if (password.match(/[0-9]/)) score++;
  if (password.match(/[^A-Za-z0-9]/)) score++;
  return score; // 0 a 4
}

function getPasswordStrength(password) {
  if (password.length < 6) return "Débil";
  if (
    password.match(/[A-Z]/) &&
    password.match(/[0-9]/) &&
    password.length >= 8
  )
    return "Fuerte";
  return "Media";
}

function RegisterPage() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    s_full_surname: "",
    s_full_name: "",
    s_username: "",
    s_phone_prefix: "", // Inicializa el valor
    s_phone_number: "",
    s_email: "",
    s_password_hash: "",
  });

  const [passwordStrength, setPasswordStrength] = useState("");

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    console.log("Usuario registrado:", userData);
    alert("¡Registro exitoso!");
  };

  return (
    <div
      style={{
        maxWidth: "100%",
        padding: "1rem",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "#f9f9f9",
          padding: "2rem",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        {step === 1 && (
          <form onSubmit={handleUserSubmit}>
            <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Registro de Usuario
            </h1>

            <div style={{ marginBottom: "1rem" }}>
              <label>Apellido:</label>
              <input
                type="text"
                name="s_full_surname"
                onChange={handleUserChange}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>Nombre:</label>
              <input
                type="text"
                name="s_full_name"
                onChange={handleUserChange}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>Nombre de usuario:</label>
              <input
                type="text"
                name="s_username"
                onChange={handleUserChange}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>Lada:</label>
              <select
                name="s_phone_prefix"
                value={userData.s_phone_prefix}
                onChange={handleUserChange}
                required
                style={selectStyle}
              >
                <option value="">Selecciona una lada</option>
                <option value="+52">México (+52)</option>
                <option value="+1">USA/Canadá (+1)</option>
                <option value="+34">España (+34)</option>
                <option value="+54">Argentina (+54)</option>
                <option value="+57">Colombia (+57)</option>
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label>Teléfono:</label>
              <input
                type="tel"
                name="s_phone_number"
                onChange={handleUserChange}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>Email:</label>
              <input
                type="email"
                name="s_email"
                value={userData.email}
                onChange={handleUserChange}
                required
                style={inputStyle}
              />
            </div>

            <button type="submit" style={buttonStyle}>
              Siguiente
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister}>
            <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Seguridad de la Cuenta
            </h2>

            <div style={{ marginBottom: "1rem" }}>
              <label>Contraseña:</label>
              <input
                type="password"
                name="s_password_hash"
                value={userData.password}
                onChange={handleUserChange}
                required
                style={inputStyle}
              />
              {userData.password && (
                <>
                  <div
                    style={{
                      fontWeight: "bold",
                      color:
                        passwordStrength === "Fuerte"
                          ? "green"
                          : passwordStrength === "Media"
                          ? "orange"
                          : "red",
                    }}
                  >
                    Seguridad: {passwordStrength}
                  </div>
                  <div
                    style={{
                      height: "10px",
                      backgroundColor: "#ddd",
                      borderRadius: "5px",
                      marginTop: "5px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${
                          (getPasswordStrengthLevel(userData.password) / 4) *
                          100
                        }%`,
                        backgroundColor:
                          passwordStrength === "Fuerte"
                            ? "green"
                            : passwordStrength === "Media"
                            ? "orange"
                            : "red",
                        borderRadius: "5px",
                        transition: "width 0.3s ease",
                      }}
                    ></div>
                  </div>
                </>
              )}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label>Confirmar contraseña:</label>
              <input
                type="password"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleUserChange}
                required
                style={inputStyle}
              />
            </div>

            <button type="submit" style={buttonStyle}>
              Registrar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
