import React, { useState } from 'react';

const DemoPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dropdown: '',
    textarea: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Show success alert
    alert('¡Formulario enviado exitosamente!');
  };

  const cardData = [
    { id: 1, title: 'Tarjeta Bootstrap', content: 'Esta tarjeta usa clases de Bootstrap con efectos de Materialize' },
    { id: 2, title: 'Tarjeta Material', content: 'Esta tarjeta combina Material Design con Bootstrap' },
    { id: 3, title: 'Tarjeta Interactiva', content: 'Hover para ver efectos de animación personalizados' }
  ];

  return (
    <div className="demo-page">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 mb-3 animate__animated animate__fadeInDown">
            🎨 Demo de Componentes UI
          </h1>
          <p className="lead text-muted animate__animated animate__fadeInUp">
            Demostración de la integración de Bootstrap, Materialize CSS y Pure CSS
          </p>
        </div>

        {/* Navigation Demo - Pure CSS Menu */}
        <section className="mb-5">
          <h2 className="section-title">🧭 Navegación (Pure CSS)</h2>
          <div className="pure-menu pure-menu-horizontal demo-menu">
            <ul className="pure-menu-list">
              <li className="pure-menu-item">
                <button className="pure-menu-link">Inicio</button>
              </li>
              <li className="pure-menu-item pure-menu-has-children pure-menu-allow-hover">
                <button className="pure-menu-link">Servicios</button>
                <ul className="pure-menu-children">
                  <li className="pure-menu-item"><button className="pure-menu-link">Registro</button></li>
                  <li className="pure-menu-item"><button className="pure-menu-link">Perfil</button></li>
                  <li className="pure-menu-item"><button className="pure-menu-link">QR Code</button></li>
                </ul>
              </li>
              <li className="pure-menu-item">
                <button className="pure-menu-link">Contacto</button>
              </li>
            </ul>
          </div>
        </section>

        {/* Buttons Demo - Materialize Style */}
        <section className="mb-5">
          <h2 className="section-title">🔘 Botones (Materialize Colors)</h2>
          <div className="row">
            <div className="col-md-12">
              <div className="demo-buttons">
                <button className="btn btn-primary">Primario</button>
                <button className="btn btn-secondary">Secundario</button>
                <button className="btn btn-success">Éxito</button>
                <button className="btn btn-warning">Advertencia</button>
                <button className="btn btn-danger">Peligro</button>
                <button className="btn btn-info">Info</button>
              </div>
              
              <div className="demo-buttons mt-3">
                <button className="btn btn-outline-primary ripple">Primario Outline</button>
                <button className="btn btn-outline-secondary ripple">Secundario Outline</button>
                <button className="btn btn-floating-action">
                  <i className="material-icons">add</i>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Forms Demo - Bootstrap with Material */}
        <section className="mb-5">
          <h2 className="section-title">📝 Formularios (Bootstrap + Material)</h2>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <form onSubmit={handleSubmit} className="enhanced-form">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Tu nombre"
                  />
                  <label htmlFor="name">
                    <i className="material-icons">person</i>
                    Nombre completo
                  </label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                  />
                  <label htmlFor="email">
                    <i className="material-icons">email</i>
                    Correo electrónico
                  </label>
                </div>

                <div className="form-floating mb-3">
                  <select
                    className="form-control"
                    id="dropdown"
                    name="dropdown"
                    value={formData.dropdown}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="option1">Opción 1</option>
                    <option value="option2">Opción 2</option>
                    <option value="option3">Opción 3</option>
                  </select>
                  <label htmlFor="dropdown">
                    <i className="material-icons">list</i>
                    Categoría
                  </label>
                </div>

                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
                    id="textarea"
                    name="textarea"
                    value={formData.textarea}
                    onChange={handleInputChange}
                    placeholder="Escribe tu mensaje aquí..."
                    style={{ height: '100px' }}
                  />
                  <label htmlFor="textarea">
                    <i className="material-icons">message</i>
                    Mensaje
                  </label>
                </div>

                <div className="text-center">
                  <button type="submit" className="btn btn-primary btn-lg">
                    <i className="material-icons">send</i>
                    Enviar Formulario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Cards Demo - Bootstrap + Materialize */}
        <section className="mb-5">
          <h2 className="section-title">🎴 Tarjetas (Bootstrap + Materialize)</h2>
          <div className="row">
            {cardData.map((card) => (
              <div key={card.id} className="col-md-4 mb-4">
                <div className="card card-interactive">
                  <div className="card-body">
                    <h5 className="card-title">{card.title}</h5>
                    <p className="card-text">{card.content}</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setSelectedCard(card)}
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Card variations */}
          <div className="row mt-4">
            <div className="col-md-6 mb-4">
              <div className="card card-flip">
                <div className="card-front">
                  <div className="card-body text-center">
                    <i className="material-icons" style={{fontSize: '3rem'}}>pets</i>
                    <h5>Tarjeta con Flip</h5>
                    <p>Hover para voltear</p>
                  </div>
                </div>
                <div className="card-back">
                  <div className="card-body text-center">
                    <h5>¡Lado trasero!</h5>
                    <p>Esta tarjeta se voltea con animación 3D</p>
                    <button className="btn btn-accent">Acción</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card card-glassmorphism">
                <div className="card-body">
                  <h5 className="card-title">Glassmorphism</h5>
                  <p className="card-text">Efecto de cristal moderno con blur</p>
                  <button className="btn btn-outline-light">Explorar</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Loading/Spinners Demo - Materialize */}
        <section className="mb-5">
          <h2 className="section-title">⏳ Spinners (Materialize)</h2>
          <div className="row text-center">
            <div className="col-md-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Bootstrap Spinner</p>
            </div>
            <div className="col-md-3">
              <div className="preloader-wrapper active">
                <div className="spinner-layer spinner-blue-only">
                  <div className="circle-clipper left">
                    <div className="circle"></div>
                  </div>
                  <div className="gap-patch">
                    <div className="circle"></div>
                  </div>
                  <div className="circle-clipper right">
                    <div className="circle"></div>
                  </div>
                </div>
              </div>
              <p>Materialize Spinner</p>
            </div>
            <div className="col-md-3">
              <div className="spinner-custom">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p>Spinner Personalizado</p>
            </div>
            <div className="col-md-3">
              <div className="pulse-loader">
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
              </div>
              <p>Pulse Loader</p>
            </div>
          </div>
        </section>

        {/* Modal Demo - Bootstrap */}
        <section className="mb-5">
          <h2 className="section-title">🪟 Modal (Bootstrap + Animaciones)</h2>
          <div className="text-center">
            <button
              className="btn btn-lg btn-primary"
              onClick={() => setShowModal(true)}
            >
              Abrir Modal
            </button>
          </div>
        </section>

        {/* Pagination Demo - Materialize */}
        <section className="mb-5">
          <h2 className="section-title">📄 Paginación (Materialize)</h2>
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className="page-item">
                <button className="page-link" aria-label="Previous">
                  <i className="material-icons">chevron_left</i>
                </button>
              </li>
              <li className="page-item active"><button className="page-link">1</button></li>
              <li className="page-item"><button className="page-link">2</button></li>
              <li className="page-item"><button className="page-link">3</button></li>
              <li className="page-item">
                <button className="page-link" aria-label="Next">
                  <i className="material-icons">chevron_right</i>
                </button>
              </li>
            </ul>
          </nav>
        </section>

        {/* Alerts Demo */}
        <section className="mb-5">
          <h2 className="section-title">⚠️ Alertas y Notificaciones</h2>
          <div className="alert alert-success animate__animated animate__fadeInLeft" role="alert">
            <i className="material-icons">check_circle</i>
            <strong>¡Éxito!</strong> Tu operación se completó correctamente.
          </div>
          <div className="alert alert-warning animate__animated animate__fadeInRight" role="alert">
            <i className="material-icons">warning</i>
            <strong>Advertencia:</strong> Revisa la información antes de continuar.
          </div>
          <div className="alert alert-danger animate__animated animate__fadeInUp" role="alert">
            <i className="material-icons">error</i>
            <strong>Error:</strong> Algo salió mal, por favor intenta de nuevo.
          </div>
        </section>

        {/* Grid Demo - Bootstrap */}
        <section className="mb-5">
          <h2 className="section-title">📐 Sistema de Grid (Bootstrap)</h2>
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="p-3 bg-primary text-white rounded">Col-md-4</div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="p-3 bg-success text-white rounded">Col-md-4</div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="p-3 bg-warning text-dark rounded">Col-md-4</div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="p-3 bg-info text-white rounded">Col-md-6</div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="p-3 bg-danger text-white rounded">Col-md-6</div>
            </div>
          </div>
        </section>

        {/* Floating Action Button */}
        <button className="fab fab-fixed">
          <i className="material-icons">add</i>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content animate__animated animate__zoomIn" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="material-icons">info</i>
                Modal de Demostración
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
              >
                <i className="material-icons">close</i>
              </button>
            </div>
            <div className="modal-body">
              <p>Este es un modal que combina Bootstrap con animaciones personalizadas.</p>
              {selectedCard && (
                <div>
                  <h6>Tarjeta seleccionada:</h6>
                  <p><strong>{selectedCard.title}</strong></p>
                  <p>{selectedCard.content}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  alert('¡Acción confirmada!');
                  setShowModal(false);
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoPage;
