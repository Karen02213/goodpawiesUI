import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/FormStyles.css';

export default function PasswordForm({ registerDataRef }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("Debe tener al menos 6 caracteres");
      return;
    }

    const passwordHash = btoa(password); // Simulación de hash

    const completeData = {
      ...registerDataRef.current,
      s_password_hash: passwordHash,
    };

    console.log("Datos completos del registro:", completeData);
    alert("¡Usuario registrado correctamente!");

    navigate('/'); // o a donde quieras redirigir
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Establecer Contraseña</h2>
        <div>
            <label>Contraseña:</label>
            <input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
            <label>Confirmar Contraseña:</label>
            <input type="password" placeholder="Confirmar Contraseña" onChange={(e) => setConfirm(e.target.value)} />
        </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" style={{display:'flex'}}>Finalizar Registro</button>
    </form>
  );
}
