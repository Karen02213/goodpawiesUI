import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const error = location.state?.error || {};

  const getErrorInfo = () => {
    const status = error.status || 404;

    switch (status) {
      case 400:
        return {
          title: 'Bad Request',
          message: 'La solicitud no pudo ser entendida por el servidor.',
          emoji: '🚫'
        };
      case 401:
        return {
          title: 'Unauthorized',
          message: 'No tienes permiso para acceder a esta página.',
          emoji: '🔐'
        };
      case 403:
        return {
          title: 'Forbidden',
          message: 'No tienes permiso para acceder a este recurso.',
          emoji: '⛔'
        };
      case 404:
        return {
          title: 'Page Not Found',
          message: 'La página que estás buscando no existe.',
          emoji: '🐕‍🦺'
        };
      case 500:
        return {
          title: 'Server Error',
          message: 'Algo salió mal en nuestro servidor. Estamos trabajando para solucionarlo.',
          emoji: '🛠️'
        };
      default:
        return {
          title: 'Something Went Wrong',
          message: 'Un error inesperado ocurrió.',
          emoji: '😿'
        };
    }
  };

  const errorInfo = getErrorInfo();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">
            {errorInfo.emoji}
          </div>

          <h1 className="error-title">
            {errorInfo.title}
          </h1>

          <p className="error-message">
            {error.message || errorInfo.message}
          </p>

          {error.status && (
            <div className="error-code">
              Código de error: {error.status}
            </div>
          )}

          <div className="error-actions">
            <button
              className="btn btn-primary"
              onClick={handleGoHome}
            >
              🏠 Ir al inicio
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleGoBack}
            >
              ← Volver
            </button>

            {(error.status >= 500 || !error.status) && (
              <button
                className="btn btn-outline"
                onClick={handleRetry}
              >
                🔄 Intentar de nuevo
              </button>
            )}
          </div>

          {error.status === 404 && (
            <div className="error-suggestions">
              <h3>¿Qué puedes hacer?</h3>
              <ul>
                <li>Revisa la URL en busca de errores</li>
                <li>Regresa a la página anterior</li>
                <li>Visita nuestra <button className="link-button" onClick={handleGoHome}>página de inicio</button></li>
                <li>Busca lo que estás buscando</li>
              </ul>
            </div>
          )}

          {error.status === 401 && (
            <div className="error-suggestions">
              <p>
                <button
                  className="link-button"
                  onClick={() => navigate('/login')}
                >
                  Haz clic aquí para iniciar sesión
                </button>
              </p>
            </div>
          )}
        </div>

        <div className="error-footer">
          <p>
            ¿Necesitas ayuda? Contacta a nuestro equipo de soporte o revisa nuestra sección de preguntas frecuentes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
