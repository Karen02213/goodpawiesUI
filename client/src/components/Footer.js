import React from 'react';

const Footer = () => {
  return (
    <footer className="custom-footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-main">
            <div className="footer-branding">
              <span className="footer-brand">🐾 GoodPawies</span>
              <p className="footer-tagline">AI veterinary guidance for your pets.</p>
            </div>
            <div className="footer-actions">
              <div className="social-links">
                <button className="social-link" aria-label="Instagram" onClick={() => console.log('Instagram')}>
                  <i className="material-icons">photo_camera</i>
                </button>
                <button className="social-link" aria-label="X" onClick={() => console.log('X')}>
                  <i className="material-icons">alternate_email</i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>© 2026 GoodPawies</p>
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
