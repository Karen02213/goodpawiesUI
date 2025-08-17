import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/auth';


function LoginPage() {
  const location = useLocation();
  // Get username and success from query params
  const searchParams = new URLSearchParams(location.search);
  const usernameFromRegister = searchParams.get('username') || '';
  const showSuccess = searchParams.get('success') === 'true';
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: usernameFromRegister, password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to intended page after login
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.identifier === '' || form.password === '') {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(form.identifier, form.password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        switch (result.error) {
          case 'INVALID_CREDENTIALS':
            setError('Usuario/email o contraseña incorrectos');
            break;
          case 'ACCOUNT_LOCKED':
            setError('Cuenta bloqueada temporalmente por demasiados intentos fallidos');
            break;
          case 'ACCOUNT_TIME_OUT':
            setError('Cuenta bloqueada por 5 min. Por favor, intenta de nuevo más tarde.');
            break;
          case 'NETWORK_ERROR':
            setError('Error de conexión. Por favor, intenta de nuevo.');
            break;
          default:
            setError(result.message || 'Error al iniciar sesión');
        }
      }
    } catch (err) {
      setError('Error inesperado. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '90%',
      maxWidth: '400px',
      margin: '80px auto',
      padding: '30px',
      border: '1px solid #ccc',
      borderRadius: '10px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Inicio de sesión</h1>

      {/* Success message after registration */}
      {showSuccess && (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          color: '#155724',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          ¡Usuario creado exitosamente! Ahora puedes iniciar sesión.
        </div>
      )}

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

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Usuario/Email/Teléfono:</label>
          <input
            name="identifier"
            type="text"
            value={form.identifier}
            onChange={handleChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              opacity: loading ? 0.6 : 1
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <div className="password-input-container">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
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
          <div style={{ textAlign: 'right', marginTop: '8px' }}>
            <Link to="" style={{ fontSize: '14px', color: '#007bff' }}>
              ¿Se te olvidó la contraseña?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: '#fff',
            fontSize: '1rem',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.8 : 1
          }}
        >
          {loading ? 'Iniciando sesión...' : 'Entrar'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <span>¿No tienes cuenta? </span>
        <Link to="/registrarse" style={{ color: '#007bff', fontWeight: 'bold' }}>
            Regístrate aquí
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
