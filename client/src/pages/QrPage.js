import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";

// Temporary pet image for testing (will be replaced with API call)
const TEMP_PET_IMAGE = "/default-avatar.png";

// Initialize QR code styling instance
const qrCode = new QRCodeStyling({
  width: 300,
  height: 300,
  image: TEMP_PET_IMAGE,
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

function QrPage() {
  // QR Code data and customization states
  const [petId] = useState("123"); // TODO: Get from user context/params
  const [qrUrl, setQrUrl] = useState(`${window.location.origin}/profile/${petId}`);
  const [fileExt, setFileExt] = useState("png");
  
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

  // Initialize QR code display
  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }
  }, []);

  // Update QR code data when URL changes
  useEffect(() => {
    qrCode.update({
      data: qrUrl
    });
  }, [qrUrl]);

  // Update QR code styling when options change
  useEffect(() => {
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
  }, [qrOptions]);

  const onUrlChange = (event) => {
    setQrUrl(event.target.value);
  };

  const onExtensionChange = (event) => {
    setFileExt(event.target.value);
  };

  const onDownloadClick = () => {
    qrCode.download({
      extension: fileExt,
      name: `pet-qr-${petId}`
    });
  };

  const handleOptionChange = (option, value) => {
    setQrOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  // TODO: Fetch pet image from backend
  // const fetchPetImage = async () => {
  //   try {
  //     // const response = await apiClient.getPetById(petId);
  //     // const petImageUrl = response.data.image;
  //     // qrCode.update({
  //     //   image: petImageUrl
  //     // });
  //     console.log("Pet image fetch will be implemented here");
  //   } catch (error) {
  //     console.error("Error fetching pet image:", error);
  //   }
  // };

  return (
    <div className="qr-page">
      <div className="container">
        <h2>Create Your Pet's QR Code</h2>
        <p>Create a customizable QR code for your pet that links to their profile page.</p>
        
        <div className="qr-content">
          {/* QR Code Display */}
          <div className="qr-display">
            <div ref={ref} className="qr-code-container" />
            
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

          {/* Customization Panel */}
          <div className="customization-panel">
            <h3>Customize Your QR Code</h3>
            
            {/* URL Input */}
            <div className="form-group">
              <label htmlFor="qr-url">QR Code URL:</label>
              <input
                id="qr-url"
                type="url"
                value={qrUrl}
                onChange={onUrlChange}
                className="form-control"
                placeholder="https://your-pet-profile-url.com"
              />
              <small className="form-text">This URL will open when someone scans the QR code</small>
            </div>

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
        </div>

        <div className="info-section">
          <h3>How it works:</h3>
          <ul>
            <li>Your pet's image is automatically included in the center of the QR code</li>
            <li>When someone scans the QR code, they'll be taken to your pet's profile page</li>
            <li>No login is required to view the pet's information</li>
            <li>Customize colors and styles to match your pet's personality</li>
            <li>Download in multiple formats for printing or sharing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default QrPage;