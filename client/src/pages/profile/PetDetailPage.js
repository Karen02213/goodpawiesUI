import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/auth";
import apiClient from "../../utils/api";

export default function PetDetailPage() {
  const { uid, petid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Check if current user owns this pet
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

  const handleDeletePet = async () => {
    try {
      setDeleting(true);
      const response = await apiClient.deletePet(petid);
      
      if (response.success) {
        navigate(`/perfil`);
      } else {
        setError("Error deleting pet");
      }
    } catch (err) {
      console.error("Error deleting pet:", err);
      setError("Error deleting pet");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="pet-detail-page">
        <div className="loading">Loading pet details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pet-detail-page">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/perfil" className="btn btn-primary">
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="pet-detail-page">
        <div className="error">
          <h2>Pet not found</h2>
          <Link to="/perfil" className="btn btn-primary">
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pet-detail-page">
      <div className="container">
        <div className="pet-header">
          <Link to="/perfil" className="back-link">
            ← Back to Profile
          </Link>
          <h1>{pet.name}</h1>
        </div>

        <div className="pet-content">
          <div className="pet-info-card">
            <div className="pet-image">
              <img 
                src="/default-avatar.png" 
                alt={pet.name}
                className="pet-avatar"
              />
            </div>
            
            <div className="pet-details">
              <h2>{pet.name}</h2>
              <div className="detail-item">
                <span className="label">Type:</span>
                <span className="value">{pet.type}</span>
              </div>
              <div className="detail-item">
                <span className="label">Breed:</span>
                <span className="value">{pet.breed}</span>
              </div>
              {pet.description && (
                <div className="detail-item">
                  <span className="label">Description:</span>
                  <span className="value">{pet.description}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="label">Owner:</span>
                <span className="value">
                  {pet.owner.fullName} {pet.owner.fullSurname}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Created:</span>
                <span className="value">
                  {new Date(pet.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="action-cards">
            <div className="action-card qr-card">
              <h3>🔗 QR Code</h3>
              <p>Generate and customize a QR code for {pet.name}</p>
              <Link 
                to={`/profile/${uid}/pet/${petid}/qr`} 
                className="btn btn-primary"
              >
                {isOwner ? "Edit QR Code" : "View QR Code"}
              </Link>
            </div>

            {isOwner && (
              <>
                <div className="action-card edit-card">
                  <h3>✏️ Edit Pet</h3>
                  <p>Update {pet.name}'s information</p>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      alert("Edit functionality coming soon!");
                    }}
                  >
                    Edit Pet
                  </button>
                </div>

                <div className="action-card delete-card">
                  <h3>🗑️ Delete Pet</h3>
                  <p>Permanently remove {pet.name} from your profile</p>
                  <button 
                    className="btn btn-danger"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Pet
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Delete {pet.name}?</h3>
              <p>
                Are you sure you want to delete {pet.name}? 
                This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDeletePet}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
