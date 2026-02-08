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
        <p className="qr-loading-text">Generating QR Code...</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="qr-error-container">
        <h2 className="qr-error-title">{error || "Pet not found"}</h2>
        <Link to={`/profile/${uid}/pet/${petid}`} className="btn">
          Back to Pet Details
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
            Back to {pet.name}
          </Link>
          <h1>QR Code for {pet.name}</h1>
          <p>Scan this code to instantly view {pet.name}'s medical profile and emergency contact info.</p>
        </div>

        <div className="qr-main-content">
          {/* QR Display Card */}
          <div className="qr-card qr-display-card">
            <div ref={ref} className="qr-code-wrapper" />

            <div className="qr-info">
              <p className="qr-url-display">{qrUrl}</p>
            </div>

            {/* Download Controls */}
            <div className="qr-actions">
              <select
                onChange={onExtensionChange}
                value={fileExt}
                className="qr-select form-select"
              >
                <option value="png">Format: PNG</option>
                <option value="jpeg">Format: JPEG</option>
                <option value="webp">Format: WEBP</option>
                <option value="svg">Format: SVG</option>
              </select>
              <button onClick={onDownloadClick} className="btn-download">
                Download QR Code
              </button>
            </div>
          </div>

          {/* Customization Panel - Only show for owners */}
          {isOwner ? (
            <div className="qr-card qr-customize-card">
              <h3>Customize Appearance</h3>
              <div className="qr-options-grid">
                {/* Dots Color */}
                <div className="qr-option">
                  <label htmlFor="dots-color">QR Color</label>
                  <input
                    id="dots-color"
                    type="color"
                    value={qrOptions.dotsColor}
                    onChange={(e) => handleOptionChange('dotsColor', e.target.value)}
                  />
                </div>

                {/* Background Color */}
                <div className="qr-option">
                  <label htmlFor="bg-color">Background Color</label>
                  <input
                    id="bg-color"
                    type="color"
                    value={qrOptions.backgroundColor}
                    onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                  />
                </div>

                {/* Dots Style */}
                <div className="qr-option">
                  <label htmlFor="dots-type">Pattern Style</label>
                  <select
                    id="dots-type"
                    value={qrOptions.dotsType}
                    onChange={(e) => handleOptionChange('dotsType', e.target.value)}
                    className="form-select"
                  >
                    <option value="square">Square</option>
                    <option value="rounded">Rounded</option>
                    <option value="dots">Dots</option>
                    <option value="classy">Classy</option>
                    <option value="classy-rounded">Soft</option>
                    <option value="extra-rounded">Extra Rounded</option>
                  </select>
                </div>

                {/* Corner Styles */}
                <div className="qr-option">
                  <label htmlFor="corners-square">Corner Style</label>
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
                  <label htmlFor="image-size">Center Logo Size</label>
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
                <h3>How it works:</h3>
                <ul>
                  <li>This QR code links directly to {pet.name}'s public profile</li>
                  <li>Anyone can scan it to see {pet.name}'s information</li>
                  <li>No login is required to view the pet's profile</li>
                </ul>
              </div>
            </div>
          )}

          {isOwner && (
            <footer className="qr-tips">
              <span>💡 Print on pet tags, collars, or ID cards for quick scanning</span>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
