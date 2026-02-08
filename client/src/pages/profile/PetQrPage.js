import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../components/AuthProvider";
import apiClient, { UPLOADS_URL } from "../../utils/api";
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
    imageMargin: 20
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
      const petImage = pet.image_url
        ? (pet.image_url.startsWith('/') ? pet.image_url : `${UPLOADS_URL}/uploads/pets/${pet.image_url}`)
        : (pet.images?.[0] ? `${UPLOADS_URL}/uploads/pets/${pet.images[0]}` : "/default-avatar.png");

      qrCode.update({
        image: petImage,
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
      <div className="pet-qr-page">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem', alignItems: 'center', flexDirection: 'column' }}>
          <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: '1rem', color: '#718096' }}>Generating QR Code...</p>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="pet-qr-page">
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error || "Pet not found"}</h2>
          <Link to={`/profile/${uid}/pet/${petid}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', background: '#667eea', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
            Back to Pet Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pet-qr-page">
      <div className="container">
        <div className="qr-header">
          <Link to={`/profile/${uid}/pet/${petid}`} className="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to {pet.name}
          </Link>
          <h1>QR Code for {pet.name}</h1>
          <p>Scan this code to instantly view {pet.name}'s medical profile and emergency contact info.</p>
        </div>

        <div className="qr-content">
          {/* QR Code Display */}
          <div className="qr-display">
            <div ref={ref} className="qr-code-container" />

            <div className="qr-info">
              <h3>Scan to visit {pet.name}'s profile</h3>
              <p className="qr-url">{qrUrl}</p>
            </div>

            {/* Download Options */}
            <div className="download-section">
              <div className="download-controls">
                <select
                  onChange={onExtensionChange}
                  value={fileExt}
                  className="form-control"
                >
                  <option value="png">Format: PNG</option>
                  <option value="jpeg">Format: JPEG</option>
                  <option value="webp">Format: WEBP</option>
                  <option value="svg">Format: SVG</option>
                </select>
                <button onClick={onDownloadClick} className="btn btn-primary" style={{ background: '#667eea', color: 'white', border: 'none', cursor: 'pointer' }}>
                  Download QR Code
                </button>
              </div>
            </div>
          </div>

          {/* Customization Panel - Only show for owners */}
          <div>
            {isOwner ? (
              <div className="customization-panel">
                <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '8px' }}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Customize Appearance</h3>

                {/* Dots Color */}
                <div className="form-group">
                  <label htmlFor="dots-color">QR Color</label>
                  <input
                    id="dots-color"
                    type="color"
                    value={qrOptions.dotsColor}
                    onChange={(e) => handleOptionChange('dotsColor', e.target.value)}
                    className="form-control color-input"
                  />
                </div>

                {/* Background Color */}
                <div className="form-group">
                  <label htmlFor="bg-color">Background Color</label>
                  <input
                    id="bg-color"
                    type="color"
                    value={qrOptions.backgroundColor}
                    onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                    className="form-control color-input"
                  />
                </div>

                {/* Dots Style */}
                <div className="form-group">
                  <label htmlFor="dots-type">Pattern Style</label>
                  <select
                    id="dots-type"
                    value={qrOptions.dotsType}
                    onChange={(e) => handleOptionChange('dotsType', e.target.value)}
                    className="form-control"
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
                <div className="form-group">
                  <label htmlFor="corners-square">Corner Style</label>
                  <select
                    id="corners-square"
                    value={qrOptions.cornersSquareType}
                    onChange={(e) => handleOptionChange('cornersSquareType', e.target.value)}
                    className="form-control"
                  >
                    <option value="square">Square</option>
                    <option value="dot">Dot</option>
                    <option value="extra-rounded">Rounded</option>
                  </select>
                </div>

                {/* Image Margin */}
                <div className="form-group">
                  <label htmlFor="image-margin">Center Logo Size</label>
                  <input
                    id="image-margin"
                    type="range"
                    min="0"
                    max="50"
                    value={qrOptions.imageMargin}
                    onChange={(e) => handleOptionChange('imageMargin', parseInt(e.target.value))}
                    className="form-control range-input"
                  />
                </div>
              </div>
            ) : (
              <div className="info-section">
                <h3>How it works:</h3>
                <ul>
                  <li>This QR code links directly to {pet.name}'s public profile</li>
                  <li>Anyone can scan it to see {pet.name}'s information</li>
                  <li>No login is required to view the pet's profile</li>
                </ul>
              </div>
            )}

            {isOwner && (
              <div className="info-section" style={{ marginTop: '2rem' }}>
                <h3>Usage Tips:</h3>
                <ul>
                  <li>Print this QR code for your pet's collar tag.</li>
                  <li>Save it to your phone for quick sharing.</li>
                  <li>The link works even if you update the pet's photo later.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
