import React from 'react';

const Footer = () => {
  return (
    <footer className="custom-footer">
      <div className="footer-content">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="footer-section">
                <h4 className="footer-brand">🐾 GoodPawies</h4>
                <p>Conectando mascotas y familias con amor y tecnología</p>
                <div className="social-links">
                  <button className="social-link" aria-label="Facebook" onClick={() => console.log('Facebook')}>
                    <i className="material-icons">facebook</i>
                  </button>
                  <button className="social-link" aria-label="Instagram" onClick={() => console.log('Instagram')}>
                    <i className="material-icons">photo_camera</i>
                  </button>
                  <button className="social-link" aria-label="Twitter" onClick={() => console.log('Twitter')}>
                    <i className="material-icons">alternate_email</i>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="footer-section">
                <h4>Enlaces Rápidos</h4>
                <ul className="footer-links">
                  <li><button onClick={() => console.log('Inicio')}>Inicio</button></li>
                  <li><button onClick={() => console.log('Servicios')}>Servicios</button></li>
                  <li><button onClick={() => console.log('Contacto')}>Contacto</button></li>
                  <li><button onClick={() => console.log('Ayuda')}>Ayuda</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>© 2025 GoodPawies. Todos los derechos reservados.</p>
            <div className="footer-bottom-links">
              <button className="footer-bottom-link">Privacidad</button>
              <button className="footer-bottom-link">Términos</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
