import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-page app-container">
      {/* Welcome Section */}
      <section className="hero-section text-center">
        <div className="container">
          <div className="hero-content mx-auto">
            <h1 className="hero-title">
              ¡Bienvenido de vuelta, <span className="highlight">{user?.fullName || user?.username || 'Amante de Mascotas'}</span>!
            </h1>
            <p className="hero-subtitle">
              Tu asistente veterinario impulsado por IA está listo para ayudarte con las preguntas de salud de tu perro o gato.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="section section-bg-light">
        <div className="container">
          <h2 className="section-title">Acciones Rápidas</h2>
          <div className="grid-responsive">
            <Link to="/chat" className="card-action" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <div className="card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>Iniciar Chat IA</h3>
              <p>Obtén orientación veterinaria instantánea para tus mascotas</p>
              <span className="btn-text" style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>Abrir Chat →</span>
            </Link>

            <Link to="/profile" className="card-action" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <div className="card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>Mi Perfil</h3>
              <p>Ver y administrar tu cuenta</p>
              <span className="btn-text" style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>Ver Perfil →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="home-features">
        <div className="home-container">
          <h2 className="section-title">Cómo te Ayuda GoodPawies</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon-circle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h4>Análisis de Síntomas</h4>
              <p>Describe síntomas y obtén un análisis impulsado por IA con posibles causas y acciones recomendadas.</p>
            </div>

            <div className="card-feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h4>Experto en Perros y Gatos</h4>
              <p>IA especializada entrenada en conocimientos veterinarios específicamente para perros y gatos.</p>
            </div>

            <div className="card-feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h4>Disponible 24/7</h4>
              <p>Obtén respuestas inmediatas en cualquier momento del día o de la noche sin esperar citas.</p>
            </div>

            <div className="card-feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h4>Privado y Seguro</h4>
              <p>Tus conversaciones son privadas. Priorizamos la seguridad de tus datos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="section section-bg-light">
        <div className="container">
          <div className="card-tip">
            <div className="tip-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div className="tip-content">
              <h3>Consejo Profesional</h3>
              <p>
                Al describir los síntomas de tu mascota, incluye detalles como: cuánto tiempo han estado presentes los síntomas,
                la edad y raza de tu mascota, cualquier cambio en comportamiento o apetito, y cambios recientes en el ambiente.
                Cuantos más detalles proporciones, mejor orientación podrá ofrecer la IA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="section">
        <div className="container">
          <div className="disclaimer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p>
              <strong>Importante:</strong> GoodPawies proporciona orientación general y no es un sustituto de la atención
              veterinaria profesional. Siempre consulta a un veterinario licenciado para emergencias médicas o problemas de salud graves.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
