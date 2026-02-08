// src/pages/QrPage.js
// QR Code Page - Compact responsive layout with minimal scrolling

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import QRCodeStyling from "qr-code-styling";
import { useAuth } from "../components/AuthProvider";
import apiClient, { UPLOADS_URL } from "../utils/api";

// Initialize QR code styling instance
const qrCode = new QRCodeStyling({
  width: 280,
  height: 280,
  image: "/default-avatar.png",
  dotsOptions: {
    color: "#667eea",
    type: "rounded"
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 15
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

function QrPage() {
  const { uid } = useParams();
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const [fileExt, setFileExt] = useState("png");
  const [showCustomization, setShowCustomization] = useState(false);

  const [qrOptions, setQrOptions] = useState({
    dotsColor: "#667eea",
    dotsType: "rounded",
    backgroundColor: "#ffffff",
    cornersSquareType: "extra-rounded",
    cornersDotType: "dot",
    imageMargin: 15
  });

  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (user && user.id === parseInt(uid)) {
        setProfileUser(user);
        setQrUrl(`${window.location.origin}/profile/${user.id}`);
      } else {
        // Fetch public profile
        try {
          const response = await apiClient.getUserProfile(uid);
          if (response.success) {
            setProfileUser(response.data);
            setQrUrl(`${window.location.origin}/profile/${uid}`);
          }
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    };
    fetchUser();
  }, [uid, user]);

  useEffect(() => {
    if (qrUrl) {
      qrCode.update({ data: qrUrl });
    }
  }, [qrUrl]);

  useEffect(() => {
    const avatarUrl = profileUser?.avatar
      ? (profileUser.avatar.startsWith('/') ? profileUser.avatar : `${UPLOADS_URL}/uploads/users/${profileUser.avatar}`)
      : "/default-avatar.png";

    qrCode.update({
      image: avatarUrl,
      dotsOptions: { color: qrOptions.dotsColor, type: qrOptions.dotsType },
      backgroundOptions: { color: qrOptions.backgroundColor },
      cornersSquareOptions: { type: qrOptions.cornersSquareType },
      cornersDotOptions: { type: qrOptions.cornersDotType },
      imageOptions: { crossOrigin: "anonymous", margin: qrOptions.imageMargin }
    });
  }, [qrOptions, profileUser]);

  const onDownloadClick = () => {
    qrCode.download({ extension: fileExt, name: `user-qr-${uid}` });
  };

  const handleOptionChange = (option, value) => {
    setQrOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="qr-page">
      <div className="qr-page-container">
        {/* Header */}
        <header className="qr-header">
          <h1>👤 User QR Code</h1>
          <p>Share your profile with others via this QR code</p>
        </header>

        {/* Main Content */}
        <div className="qr-main-content">
          {/* QR Display Card */}
          <div className="qr-card qr-display-card">
            <div ref={ref} className="qr-code-wrapper" />

            {/* Download Controls */}
            <div className="qr-actions">
              <select
                value={fileExt}
                onChange={(e) => setFileExt(e.target.value)}
                className="qr-select"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="svg">SVG</option>
              </select>
              <button onClick={onDownloadClick} className="btn-download">
                ⬇ Download
              </button>
            </div>

            {/* URL Input */}
            <div className="qr-url-input">
              <label>Profile URL</label>
              <input
                type="url"
                value={qrUrl}
                onChange={(e) => setQrUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Customization Toggle */}
          <button
            className="btn-customize-toggle"
            onClick={() => setShowCustomization(!showCustomization)}
          >
            {showCustomization ? '✕ Hide Options' : '⚙ Customize'}
          </button>

          {/* Customization Panel */}
          {showCustomization && (
            <div className="qr-card qr-customize-card">
              <h3>Customize Style</h3>

              <div className="qr-options-grid">
                <div className="qr-option">
                  <label>Dots Color</label>
                  <input
                    type="color"
                    value={qrOptions.dotsColor}
                    onChange={(e) => handleOptionChange('dotsColor', e.target.value)}
                  />
                </div>

                <div className="qr-option">
                  <label>Background</label>
                  <input
                    type="color"
                    value={qrOptions.backgroundColor}
                    onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                  />
                </div>

                <div className="qr-option">
                  <label>Dots Style</label>
                  <select
                    value={qrOptions.dotsType}
                    onChange={(e) => handleOptionChange('dotsType', e.target.value)}
                  >
                    <option value="rounded">Rounded</option>
                    <option value="dots">Dots</option>
                    <option value="square">Square</option>
                    <option value="classy">Classy</option>
                  </select>
                </div>

                <div className="qr-option">
                  <label>Corners</label>
                  <select
                    value={qrOptions.cornersSquareType}
                    onChange={(e) => handleOptionChange('cornersSquareType', e.target.value)}
                  >
                    <option value="extra-rounded">Extra Rounded</option>
                    <option value="rounded">Rounded</option>
                    <option value="square">Square</option>
                    <option value="dot">Dot</option>
                  </select>
                </div>

                <div className="qr-option qr-option-full">
                  <label>Image Margin: {qrOptions.imageMargin}px</label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={qrOptions.imageMargin}
                    onChange={(e) => handleOptionChange('imageMargin', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <footer className="qr-tips">
          <span>💡 Print on pet tags, collars, or ID cards for quick scanning</span>
        </footer>
      </div>
    </div>
  );
}

export default QrPage;