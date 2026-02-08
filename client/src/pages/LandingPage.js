import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to /home if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="landing-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="hero-title">GoodPawies: Tu Asistente Veterinario con IA</h1>
          <p className="hero-subtitle">Orientación médica instantánea para tus Perros y Gatos.</p>

          {/* Call to Action Buttons */}
          <div className="cta-buttons">
            <Link to="/login" className="btn btn-primary btn-lg cta-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Iniciar Sesión
            </Link>
            <Link to="/registrarse" className="btn btn-secondary btn-lg cta-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Registrarse
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="hero-decoration">
          <div className="decoration-circle decoration-circle-1"></div>
          <div className="decoration-circle decoration-circle-2"></div>
          <div className="decoration-circle decoration-circle-3"></div>
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <div className="info-container">
          <h2 className="info-title">Orientación de Salud para Mascotas con IA</h2>
          <p className="info-description">
            GoodPawies utiliza inteligencia artificial avanzada para proporcionar orientación
            médica instantánea y confiable diseñada específicamente para perros y gatos.
            Obtén respuestas a tus preguntas de salud las 24 horas, comprende los síntomas
            y sabe cuándo es momento de visitar al veterinario.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 className="feature-title">Análisis de Síntomas</h3>
              <p className="feature-text">
                Describe los síntomas de tu mascota y obtén análisis instantáneo con IA
                con posibles causas y acciones recomendadas.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="feature-title">Especializado en Perros y Gatos</h3>
              <p className="feature-text">
                Nuestra IA está específicamente entrenada en conocimiento veterinario para perros
                y gatos, asegurando orientación precisa y relevante.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="feature-title">Disponibilidad 24/7</h3>
              <p className="feature-text">
                Obtén respuestas inmediatas a cualquier hora del día o la noche. Sin esperar
                citas cuando necesitas orientación rápida.
              </p>
            </div>
          </div>

          <div className="disclaimer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>
              <strong>Importante:</strong> GoodPawies proporciona orientación general y no es un
              sustituto de la atención veterinaria profesional. Siempre consulta a un veterinario
              licenciado para emergencias médicas o problemas de salud graves.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
