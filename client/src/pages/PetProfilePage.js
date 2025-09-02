import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/api";
import { useError } from "../contexts/ErrorContext";

export default function PetProfilePage() {
  const { petid } = useParams();
  const navigate = useNavigate();
  const { 
    wrapApiCall 
  } = useError();
  
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
        // Navigate to error page with specific error
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
      <div className="detail-card container">
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
            <h3>Meet {pet.name} - A Special Story</h3>
            {pet.description ? (
              <p className="pet-description">"{pet.description}"</p>
            ) : (
              <p className="no-description">Every pet has a story waiting to be told...</p>
            )}
          </div>

          <div className="detail-card">
            <h3>What Makes {pet.name} Unique</h3>
            <div className="info-list">
              <div className="pet-description">
                <span className="info-label">Species</span>
                <span className="info">{pet.type}</span>
              </div>
              <div className="pet-description">
                <span className="info-label">Breed</span>
                <span className="info">{pet.breed}</span>
              </div>
              <div className="pet-description">
                <span className="info-label">Member Since</span>
                <span className="info">
                  {new Date(pet.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

        <div className="contact-section">
          <div className="contact-card">
            <h3>Have You Seen {pet.name}?</h3>
            <p>
              <strong>URGENT:</strong> If you found {pet.name}, you can be the hero who reunites them with their loving family! 
              Every minute counts when a beloved pet is missing. 🏠💕
            </p>
            <div className="contact-info">
              <p><strong>🔍 Owner Looking For:</strong> {pet.owner.fullName} {pet.owner.fullSurname}</p>
              <p className="contact-note">
                ⚡ <strong>Quick Action Needed:</strong> Contact local animal services immediately or post on community boards with this pet's information. 
                Your help could make all the difference in bringing {pet.name} home safely!
              </p>
            </div>
          </div>
        </div>
          <div className="detail-card owner-card">
            <h3>Beloved Family Member Of</h3>
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

        <div className="footer-section">
          <p>
            💝 This profile was lovingly created with GoodPawies - 
            where every pet matters and every reunion story begins ✨
          </p>
        </div>
      </div>
    </div>
  );
}
