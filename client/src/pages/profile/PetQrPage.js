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
      qrCode.update({
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
        <div className="loading">Loading pet QR code...</div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="pet-qr-page">
        <div className="error">
          <h2>Error</h2>
          <p>{error || "Pet not found"}</p>
          <Link to={`/profile/${uid}/pet/${petid}`} className="btn btn-primary">
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
            ← Back to {pet.name}
          </Link>
          <h1>QR Code for {pet.name}</h1>
          <p>Share {pet.name}'s profile with a custom QR code</p>
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
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WEBP</option>
                  <option value="svg">SVG</option>
                </select>
                <button onClick={onDownloadClick} className="btn btn-primary">
                  Download QR Code
                </button>
              </div>
            </div>
          </div>

          {/* Customization Panel - Only show for owners */}
          {isOwner && (
            <div className="customization-panel">
              <h3>Customize QR Code</h3>
              
              {/* Dots Color */}
              <div className="form-group">
                <label htmlFor="dots-color">Dots Color:</label>
                <input
                  id="dots-color"
                  type="color"
                  value={qrOptions.dotsColor}
                  onChange={(e) => handleOptionChange('dotsColor', e.target.value)}
                  className="form-control color-input"
                />
              </div>

              {/* Dots Style */}
              <div className="form-group">
                <label htmlFor="dots-type">Dots Style:</label>
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
                  <option value="classy-rounded">Classy Rounded</option>
                  <option value="extra-rounded">Extra Rounded</option>
                </select>
              </div>

              {/* Background Color */}
              <div className="form-group">
                <label htmlFor="bg-color">Background Color:</label>
                <input
                  id="bg-color"
                  type="color"
                  value={qrOptions.backgroundColor}
                  onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                  className="form-control color-input"
                />
              </div>

              {/* Corners Square Style */}
              <div className="form-group">
                <label htmlFor="corners-square">Corner Squares:</label>
                <select
                  id="corners-square"
                  value={qrOptions.cornersSquareType}
                  onChange={(e) => handleOptionChange('cornersSquareType', e.target.value)}
                  className="form-control"
                >
                  <option value="square">Square</option>
                  <option value="dot">Dot</option>
                  <option value="extra-rounded">Extra Rounded</option>
                  <option value="rounded">Rounded</option>
                  <option value="dots">Dots</option>
                  <option value="classy">Classy</option>
                  <option value="classy-rounded">Classy Rounded</option>
                </select>
              </div>

              {/* Corner Dots Style */}
              <div className="form-group">
                <label htmlFor="corners-dot">Corner Dots:</label>
                <select
                  id="corners-dot"
                  value={qrOptions.cornersDotType}
                  onChange={(e) => handleOptionChange('cornersDotType', e.target.value)}
                  className="form-control"
                >
                  <option value="dot">Dot</option>
                  <option value="square">Square</option>
                  <option value="rounded">Rounded</option>
                  <option value="dots">Dots</option>
                  <option value="classy">Classy</option>
                  <option value="classy-rounded">Classy Rounded</option>
                  <option value="extra-rounded">Extra Rounded</option>
                </select>
              </div>

              {/* Image Margin */}
              <div className="form-group">
                <label htmlFor="image-margin">Pet Image Margin: {qrOptions.imageMargin}px</label>
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
          )}
        </div>

        <div className="info-section">
          <h3>How it works:</h3>
          <ul>
            <li>This QR code links directly to {pet.name}'s public profile</li>
            <li>Anyone can scan it to see {pet.name}'s information</li>
            <li>No login is required to view the pet's profile</li>
            <li>Perfect for pet tags, collars, or sharing with friends</li>
            {isOwner && (
              <li>Only you can customize the QR code appearance</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
