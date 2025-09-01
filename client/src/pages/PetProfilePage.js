import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../utils/api";
import "../styles/PetProfilePage.css";

export default function PetProfilePage() {
  const { petid } = useParams();
  
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPetProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getPet(petid);
        
        if (response.success) {
          setPet(response.data);
        } else {
          setError("Pet not found");
        }
      } catch (err) {
        console.error("Error fetching pet profile:", err);
        setError("Error loading pet profile");
      } finally {
        setLoading(false);
      }
    };

    fetchPetProfile();
  }, [petid]);

  if (loading) {
    return (
      <div className="pet-profile-page">
        <div className="loading">Loading pet profile...</div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="pet-profile-page">
        <div className="error">
          <h2>Pet not found</h2>
          <p>The pet you're looking for doesn't exist or isn't available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pet-profile-page">
      <div className="container">
        <div className="pet-profile-header">
          <div className="pet-image-section">
            <img 
              src="/default-avatar.png" 
              alt={pet.name}
              className="pet-profile-image"
            />
          </div>
          <div className="pet-basic-info">
            <h1 className="pet-name">🐾 {pet.name}</h1>
            <div className="pet-type-breed">
              {pet.type} • {pet.breed}
            </div>
          </div>
        </div>

        <div className="pet-details-grid">
          <div className="detail-card">
            <h3>About {pet.name}</h3>
            {pet.description ? (
              <p className="pet-description">{pet.description}</p>
            ) : (
              <p className="no-description">No description available</p>
            )}
          </div>

          <div className="detail-card">
            <h3>Pet Information</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Type:</span>
                <span className="info-value">{pet.type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Breed:</span>
                <span className="info-value">{pet.breed}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Profile Created:</span>
                <span className="info-value">
                  {new Date(pet.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-card owner-card">
            <h3>Owner Information</h3>
            <div className="owner-info">
              <div className="owner-name">
                {pet.owner.fullName} {pet.owner.fullSurname}
              </div>
              <div className="owner-username">
                @{pet.owner.username}
              </div>
            </div>
          </div>
        </div>

        <div className="contact-section">
          <div className="contact-card">
            <h3>Found this pet?</h3>
            <p>
              If you found {pet.name}, please contact their owner. 
              This QR code helps reunite lost pets with their families.
            </p>
            <div className="contact-info">
              <p><strong>Owner:</strong> {pet.owner.fullName} {pet.owner.fullSurname}</p>
              <p className="contact-note">
                Contact information may be available through local animal services 
                or by posting on community boards with this pet's information.
              </p>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <p>
            This profile was created with ❤️ by GoodPawies - 
            helping keep pets and families together.
          </p>
        </div>
      </div>
    </div>
  );
}
