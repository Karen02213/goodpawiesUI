import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient, { UPLOADS_URL } from "../utils/api";
import { useError } from "../contexts/ErrorContext";

export default function PetProfilePage() {
  const { petid } = useParams();
  const navigate = useNavigate();
  const { wrapApiCall } = useError();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPetProfile = wrapApiCall(async () => {
      setLoading(true);
      const response = await apiClient.getPet(petid);

      if (response.success) {
        setPet(response.data);
        setError(null);
      } else {
        setError("Pet not found");
        navigate('/error', {
          state: {
            error: {
              status: 404,
              message: "The pet profile you're looking for doesn't exist."
            }
          }
        });
      }
      setLoading(false);
    }, {
      onError: (processedError) => {
        setError(processedError.message);
        setLoading(false);
      }
    });

    fetchPetProfile();
  }, [petid, navigate, wrapApiCall]);

  if (loading) {
    return (
      <div className="pet-profile-page">
        <div className="pet-profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading pet profile...</p>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="pet-profile-page">
        <div className="pet-profile-error">
          <span className="error-icon">😿</span>
          <h2>Pet not found</h2>
          <p>The pet you're looking for doesn't exist or isn't available.</p>
        </div>
      </div>
    );
  }

  const whatsappLink = pet.owner.phone
    ? `https://wa.me/${pet.owner.phone.replace(/[^0-9]/g, '')}?text=Hola! Vi a ${pet.name} en GoodPawies y me gustaría saber más.`
    : null;

  return (
    <div className="pet-profile-page">
      <div className="pet-profile-container">
        {/* Centered Hero Header */}
        <header className="pet-header-centered">
          <div className="avatar avatar-2xl avatar-bordered-thick mb-1">
            <img
              src={pet.image_url ? (pet.image_url.startsWith('/') ? pet.image_url : `${UPLOADS_URL}/uploads/pets/${pet.image_url}`) : (pet.images?.[0] ? `${UPLOADS_URL}/uploads/pets/${pet.images[0]}` : "/default-avatar.png")}
              alt={pet.name}
              className="pet-image-large" // Keeping specific class for now if needed, but styling comes from avatar
              onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
            />
          </div>
          <h1 className="pet-name-large">{pet.name}</h1>
          <div className="pet-badges">
            <span className="badge badge-pill">{pet.type}</span>
            <span className="badge badge-pill">{pet.breed}</span>
          </div>
        </header>

        {/* Info Grid */}
        <main className="pet-info-grid">
          {/* About Section */}
          <section className="pet-info-card about-card">
            <h2>About {pet.name}</h2>
            <p className={pet.description ? "pet-description" : "pet-description-empty"}>
              {pet.description || "Every pet has a story waiting to be told..."}
            </p>
          </section>

          {/* Key Details */}
          <section className="pet-info-card details-card">
            <div className="detail-row">
              <span className="detail-icon">🎂</span>
              <div className="detail-content">
                <span className="detail-label">Age</span>
                <span className="detail-value">{pet.age ? `${pet.age} years` : 'Unknown'}</span>
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-icon">⚧</span>
              <div className="detail-content">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{pet.gender || 'Unknown'}</span>
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-icon">🎨</span>
              <div className="detail-content">
                <span className="detail-label">Color</span>
                <span className="detail-value">{pet.color || 'Unknown'}</span>
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-icon">📏</span>
              <div className="detail-content">
                <span className="detail-label">Size</span>
                <span className="detail-value">{pet.size || 'Unknown'}</span>
              </div>
            </div>
          </section>

          {/* Health Logic Check */}
          {(pet.vaccinated || pet.sterilized) && (
            <section className="pet-info-card health-card">
              <h2>Health Status</h2>
              <div className="health-badges">
                {pet.vaccinated && <span className="badge badge-status badge-success">💉 Vaccinated</span>}
                {pet.sterilized && <span className="badge badge-status badge-success">⚕️ Sterilized</span>}
              </div>
            </section>
          )}

          {/* Owner & Contact */}
          <section className="pet-info-card owner-card-centered">
            <div className="owner-info-centered">
              <div className="avatar avatar-lg avatar-bordered">
                <img
                  src={pet.owner.avatar ? `${UPLOADS_URL}/uploads/users/${pet.owner.avatar}` : "/default-avatar.png"}
                  alt={pet.owner.fullName || pet.owner.username}
                  onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
                />
              </div>
              <div className="owner-text-centered">
                <span className="owner-label">Owned by</span>
                <span className="owner-name-large">{pet.owner.fullName} {pet.owner.fullSurname}</span>
                {pet.owner.city && <span className="owner-location">📍 {pet.owner.city}</span>}
              </div>
            </div>

            <div className="contact-actions">
              {whatsappLink ? (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                  <i className="fab fa-whatsapp"></i> Chat on WhatsApp
                </a>
              ) : (
                <button disabled className="btn-whatsapp disabled">
                  No Contact Info
                </button>
              )}
            </div>
          </section>
        </main>

        <footer className="pet-profile-footer">
          <p>💝 Created with GoodPawies - where every pet matters ✨</p>
        </footer>
      </div>
    </div>
  );
}
