import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../components/AuthProvider";
import apiClient from "../../utils/api";
import QRCodeStyling from "qr-code-styling";

// Initialize QR code styling instance
const qrCode = new QRCodeStyling({
  width: 300,
  height: 300,
  image: "/default-avatar.png", // Will be replaced with pet image
  dotsOptions: {
    color: "#4267b2",
    type: "rounded"
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 20
  },
  backgroundOptions: {
    color: "#ffffff"
  },
  cornersSquareOptions: {
    type: "extra-rounded"
  },
  cornersDotOptions: {
    type: "dot"
  },
  qrOptions: {
    errorCorrectionLevel: 'H'
  }
});

export default function PetQrPage() {
  const { uid, petid } = useParams();
  const { user } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileExt, setFileExt] = useState("png");

  // QR URL will be the pet's public profile
  const qrUrl = `${window.location.origin}/pet/${petid}`;

  // Customization options
  const [qrOptions, setQrOptions] = useState({
    dotsColor: "#4267b2",
    dotsType: "rounded",
    backgroundColor: "#ffffff",
    cornersSquareType: "extra-rounded",
    cornersDotType: "dot",
    imageSize: 0.4,
    imageMargin: 0
  });

  const ref = useRef(null);
  const isOwner = user && user.id === parseInt(uid);

  useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getPet(petid);

        if (response.success) {
          setPet(response.data);
        } else {
          setError("Pet not found");
        }
      } catch (err) {
        console.error("Error fetching pet details:", err);
        setError("Error loading pet details");
      } finally {
        setLoading(false);
      }
    };

    fetchPetDetails();
  }, [petid]);

  // Initialize QR code display
  useEffect(() => {
    if (ref.current && pet) {
      // Clear any existing content
      ref.current.innerHTML = '';
      qrCode.append(ref.current);
    }
  }, [pet]);

  // Update QR code data
  useEffect(() => {
    if (pet) {
      qrCode.update({
        data: qrUrl
      });
    }
  }, [qrUrl, pet]);

  // Update QR code styling when options change
  useEffect(() => {
    if (pet) {


      qrCode.update({
        image: "/paw-icon-black.svg",
        dotsOptions: {
          color: qrOptions.dotsColor,
          type: qrOptions.dotsType
        },
        backgroundOptions: {
          color: qrOptions.backgroundColor
        },
        cornersSquareOptions: {
          type: qrOptions.cornersSquareType
        },
        cornersDotOptions: {
          type: qrOptions.cornersDotType
        },
        imageOptions: {
          crossOrigin: "anonymous",
          imageSize: qrOptions.imageSize,
          margin: qrOptions.imageMargin
        }
      });
    }
  }, [qrOptions, pet]);

  const onExtensionChange = (event) => {
    setFileExt(event.target.value);
  };

  const onDownloadClick = () => {
    qrCode.download({
      extension: fileExt,
      name: `${pet?.name || 'pet'}-qr-code`
    });
  };

  const handleOptionChange = (option, value) => {
    setQrOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  if (loading) {
    return (
      <div className="qr-loading-container">
        <div className="qr-loading-spinner"></div>
        <p className="qr-loading-text">Generando código QR...</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="qr-error-container">
        <h2 className="qr-error-title">{error || "Mascota no encontrada"}</h2>
        <Link to={`/profile/${uid}/pet/${petid}`} className="btn">
          Volver a los detalles de la mascota
        </Link>
      </div>
    );
  }

  return (

    <div className="qr-page">
      <div className="qr-page-container">
        <div className="qr-header">
          <Link to={`/profile/${uid}/pet/${petid}`} className="qr-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Volver a {pet.name}
          </Link>
          <h1>Código QR para {pet.name}</h1>
          <p>Escanea este código para ver instantáneamente el perfil médico y la información de contacto de emergencia de {pet.name}.</p>
        </div>

        <div className="qr-main-content">
          {/* QR Display Card */}
          <div className="qr-card qr-display-card">
            <div ref={ref} className="qr-code-wrapper" />

            <div className="qr-info">
              <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="qr-url-display">
                {qrUrl}
              </a>
            </div>

            {/* Download Controls */}
            <div className="qr-actions">
              <select
                onChange={onExtensionChange}
                value={fileExt}
                className="qr-select form-select"
              >
                <option value="png">Formato: PNG</option>
                <option value="jpeg">Formato: JPEG</option>
                <option value="webp">Formato: WEBP</option>
                <option value="svg">Formato: SVG</option>
              </select>
              <button onClick={onDownloadClick} className="btn-download">
                Descargar QR Code
              </button>
            </div>
          </div>

          {/* Customization Panel - Only show for owners */}
          {isOwner ? (
            <div className="qr-card qr-customize-card">
              <h3>Personaliza la apariencia</h3>
              <div className="qr-options-grid">
                {/* Dots Color */}
                <div className="qr-option">
                  <label htmlFor="dots-color">Color del QR</label>
                  <input
                    id="dots-color"
                    type="color"
                    value={qrOptions.dotsColor}
                    onChange={(e) => handleOptionChange('dotsColor', e.target.value)}
                  />
                </div>

                {/* Background Color */}
                <div className="qr-option">
                  <label htmlFor="bg-color">Color de fondo</label>
                  <input
                    id="bg-color"
                    type="color"
                    value={qrOptions.backgroundColor}
                    onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                  />
                </div>

                {/* Dots Style */}
                <div className="qr-option">
                  <label htmlFor="dots-type">Estilo de patrón</label>
                  <select
                    id="dots-type"
                    value={qrOptions.dotsType}
                    onChange={(e) => handleOptionChange('dotsType', e.target.value)}
                    className="form-select"
                  >
                    <option value="square">Cuadrado</option>
                    <option value="rounded">Redondeado</option>
                    <option value="dots">Puntos</option>
                    <option value="classy">Clasico</option>
                    <option value="classy-rounded">Suave</option>
                    <option value="extra-rounded">Extra Redondeado</option>
                  </select>
                </div>

                {/* Corner Styles */}
                <div className="qr-option">
                  <label htmlFor="corners-square">Estilo de esquina</label>
                  <select
                    id="corners-square"
                    value={qrOptions.cornersSquareType}
                    onChange={(e) => handleOptionChange('cornersSquareType', e.target.value)}
                    className="form-select"
                  >
                    <option value="square">Square</option>
                    <option value="dot">Dot</option>
                    <option value="extra-rounded">Rounded</option>
                  </select>
                </div>

                {/* Image Size */}
                <div className="qr-option qr-option-full">
                  <label htmlFor="image-size">Tamaño del logo central</label>
                  <input
                    id="image-size"
                    type="range"
                    max="0.6"
                    min="0.2"
                    step="0.01"
                    value={qrOptions.imageSize}
                    onChange={(e) => handleOptionChange('imageSize', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="qr-card">
              <div className="info-section">
                <h3>¿Cómo funciona?:</h3>
                <ul>
                  <li>Este código QR enlaza directamente al perfil público de {pet.name}</li>
                  <li>Cualquier persona puede escanearlo para ver la información de {pet.name}</li>
                  <li>No se requiere iniciar sesión para ver el perfil de la mascota</li>
                </ul>
              </div>
            </div>
          )}

          {isOwner && (
            <footer className="qr-tips">
              <span>💡 Imprímelo en etiquetas, collares o tarjetas de identificación para un escaneo rápido</span>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
