import { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth';
import { validatePassword } from '../../utils/validation';

export default function PasswordForm({ registerDataRef }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
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
        navigate('/login?success=true&username=' + encodeURIComponent(completeData.username), { replace: true });
      } else {
        switch (result.error) {
          case 'USER_EXISTS':
            setError('El usuario, email o teléfono ya están registrados');
            break;
          case 'NETWORK_ERROR':
            setError('Error de conexión. Por favor, intenta de nuevo.');
            break;
          case 'REGISTRATION_FAILED':
            setError('Registration failed due to invalid data');
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
      

        <div className="form-group">
          <label>Contraseña:</label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña (mínimo 8 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="password-input"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="password-toggle-btn"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>Confirmar Contraseña:</label>
          <div className="password-input-container">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirmar Contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              required
              className="password-input"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm((v) => !v)}
              className="password-toggle-btn"
              aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
            >
              {showConfirm ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          type="button"
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.8 : 1
          }}
          onClick={() => {
            // Pass registration data back to previous form for prefill
            if (registerDataRef.current) {
              navigate('/registrarse', { state: { ...registerDataRef.current } });
            } else {
              navigate('/registrarse');
            }
          }}
        >
          Volver
        </button>
        <button 
          type="submit" 
          disabled={loading}
          style={{
            flex: 2,
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.8 : 1
          }}
        >
          {loading ? 'Registrando...' : 'Finalizar Registro'}
        </button>
      </div>
    </form>
  );
}
