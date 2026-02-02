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

  // Redirect to /chat after login (or intended page if specified)
  const from = location.state?.from?.pathname || '/chat';

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
    <div className="form-container">
      <h2>Inicio de sesión</h2>

      {/* Success message after registration */}
      {showSuccess && (
        <div className="valid-feedback" style={{ display: 'block', marginBottom: '1rem' }}>
          ¡Usuario creado exitosamente! Ahora puedes iniciar sesión.
        </div>
      )}

      {error && (
        <div className="invalid-feedback" style={{ display: 'block', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="form-floating">
            <input
              name="identifier"
              type="text"
              value={form.identifier}
              onChange={handleChange}
              disabled={loading}
              className="form-control"
              placeholder="Usuario/Email/Teléfono"
              id="identifier"
            />
            <label htmlFor="identifier">
              <i className="material-icons">person</i>
              Usuario/Email/Teléfono
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Contraseña:</label>
          <div className="form-floating">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              required
              className="form-control"
              placeholder="Contraseña"
            />
            <label htmlFor="password">
              <i className="material-icons">lock</i>
              Contraseña
            </label>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="btn btn-link password-toggle"
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
          <div className="form-text text-end">
            <Link to="" style={{ fontSize: '14px', color: 'var(--color-primary)' }}>
              ¿Se te olvidó la contraseña?
            </Link>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg waves-effect"
          >
            <i className="material-icons">login</i>
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </div>
      </form>
      <div className="form-text text-center" style={{ marginTop: '1rem' }}>
        <span>¿No tienes cuenta? </span>
        <Link to="/registrarse" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
            Regístrate aquí
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
