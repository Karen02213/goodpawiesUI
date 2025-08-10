import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth';
import '../../styles/FormStyles.css';

export default function PasswordForm({ registerDataRef }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!registerDataRef.current || !registerDataRef.current.s_username) {
      setError("Datos de registro no encontrados. Por favor, regresa al formulario anterior.");
      return;
    }

    setLoading(true);

    try {
      const completeData = {
        username: registerDataRef.current.s_username,
        email: registerDataRef.current.s_email,
        phonePrefix: registerDataRef.current.s_phone_prefix || '+52', // Default Mexico
        phoneNumber: registerDataRef.current.s_phone_number,
        fullName: registerDataRef.current.s_full_name,
        fullSurname: registerDataRef.current.s_full_surname,
        password: password
      };

      const result = await register(completeData);

      if (result.success) {
        navigate('/', { replace: true });
      } else {
        switch (result.error) {
          case 'USER_EXISTS':
            setError('El usuario, email o teléfono ya están registrados');
            break;
          case 'NETWORK_ERROR':
            setError('Error de conexión. Por favor, intenta de nuevo.');
            break;
          default:
            setError(result.message || 'Error al registrar usuario');
        }
      }
    } catch (err) {
      setError('Error inesperado. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Establecer Contraseña</h2>
      
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      
        <div>
            <label>Contraseña:</label>
            <input 
              type="password" 
              placeholder="Contraseña (mínimo 6 caracteres)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
        </div>
        <div>
            <label>Confirmar Contraseña:</label>
            <input 
              type="password" 
              placeholder="Confirmar Contraseña" 
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              required
            />
        </div>

      <button 
        type="submit" 
        disabled={loading}
        style={{
          display: 'flex',
          opacity: loading ? 0.8 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Registrando...' : 'Finalizar Registro'}
      </button>
    </form>
  );
}
