import React, { useState } from 'react';
import {  BrowserRouter as Router , Routes, Route, Link, useNavigate } from 'react-router-dom';

function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.username === '' || form.password === '') {
      alert('Por favor, completa todos los campos');
      return;
    }

    alert('Inicio de sesión exitoso');
    navigate('/');
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

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nombre de usuario:</label>
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '1rem',
              boxSizing: 'border-box'
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
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '1rem',
              boxSizing: 'border-box'
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
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: '#fff',
            fontSize: '1rem',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Entrar
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
