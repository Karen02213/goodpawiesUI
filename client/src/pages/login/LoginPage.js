import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/auth';

function LoginPage() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
          <input
            name="password"
            type="password"
            value={form.password}
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
