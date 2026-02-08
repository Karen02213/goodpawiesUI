import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../components/AuthProvider";
import apiClient, { UPLOADS_URL } from "../../utils/api";
import { useError } from "../../contexts/ErrorContext";
import ModalContainer from "../../components/ModalContainer";

export default function PetDetailPage() {
  const { uid, petid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    modals,
    hideModal,
    showDeleteConfirm,
    showError,
    wrapApiCall
  } = useError();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if current user owns this pet
  const isOwner = user && user.id === parseInt(uid);

  useEffect(() => {
    const fetchPetDetails = wrapApiCall(async () => {
      if (!petid) return;

      setLoading(true);
      try {
        const response = await apiClient.getPet(petid);

        if (response.success) {
          setPet(response.data);
          setError(null);
        } else {
          // If the API returns success: false, handle it as an error
          setError(response.message || "Mascota no encontrada");
        }
      } catch (err) {
        // This catch block might be redundant if wrapApiCall handles it, 
        // but it gives us a chance to set local error state if needed before rethrowing
        console.error("Error fetching pet:", err);
        setError("Ocurrió un error al cargar los detalles de la mascota");
        throw err; // Re-throw to let wrapApiCall handle it if configured
      } finally {
        setLoading(false);
      }
    }, {
      onError: (processedError) => {
        // specific handling for 404 from the error context processor
        if (processedError.status === 404) {
          setError("Mascota no encontrada");
        } else {
          setError(processedError.message || "Ocurrió un error al cargar los detalles de la mascota");
        }
        setLoading(false);
      }
    });

    fetchPetDetails();
  }, [petid, wrapApiCall]);

  const handleDeletePet = () => {
    showDeleteConfirm(
      `Eliminar ${pet?.name}?`,
      `¿Estás seguro de que quieres eliminar a ${pet?.name}? Esta acción no se puede deshacer.`,
      async () => {
        const deleteApiCall = wrapApiCall(async () => {
          const response = await apiClient.deletePet(petid);

          if (response.success) {
            // Navigate immediately after successful deletion
            navigate('/profile', { replace: true });
          } else {
            showError('Delete Failed', 'No se pudo eliminar la mascota. Por favor, intenta de nuevo.');
          }
        }, {
          onError: () => {
            showError('Delete Failed', 'No se pudo eliminar la mascota. Por favor, intenta de nuevo.');
          }
        });

        deleteApiCall();
      }
    );
  };

  const handleEditPet = () => {
    navigate(`/profile/${uid}/pet/${petid}/edit`);
  };

  if (loading) {
    return (
      <div className="pet-detail-page">
        <div className="loading">Cargando detalles de la mascota...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pet-detail-page">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/profile" className="btn btn-primary">
            Volver al perfil
          </Link>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="pet-detail-page">
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Mascota no encontrada</h2>
          <Link to="/profile" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Volver al perfil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pet-detail-page">
      <div className="container">
        <div className="pet-header">
          <Link to="/profile" className="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Volver al perfil
          </Link>
          <h1>{pet.name}</h1>
        </div>

        <div className="pet-content">
          <div className="pet-info-card">
            <div className="pet-image">
              <div className="avatar avatar-xl avatar-bordered">
                <img
                  src={pet.image_url ? (pet.image_url.startsWith('/') ? pet.image_url : `${UPLOADS_URL}/uploads/pets/${pet.image_url}`) : "/default-avatar.png"}
                  alt={pet.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
                />
              </div>
            </div>

            <div className="pet-details">
              <h2>{pet.name}</h2>
              <div className="detail-item">
                <span className="label">Tipo:</span>
                <span className="value" style={{ textTransform: 'capitalize' }}>{pet.type || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Raza:</span>
                <span className="value">{pet.breed || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Género:</span>
                <span className="value" style={{ textTransform: 'capitalize' }}>{pet.gender || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Edad:</span>
                <span className="value">{pet.age ? `${pet.age}` : 'Unknown'}</span>
              </div>
              {pet.description && (
                <div className="detail-item" style={{ alignItems: 'flex-start' }}>
                  <span className="label" style={{ marginTop: '4px' }}>Acerca de:</span>
                  <span className="value">{pet.description}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="label">Dueño:</span>
                <span className="value">
                  {pet.owner?.fullName ? `${pet.owner.fullName} ${pet.owner.fullSurname || ''}` : (user?.fullName || 'You')}
                </span>
              </div>
            </div>
          </div>

          <div className="action-cards">
            <div className="action-card qr-card">
              <h3>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                Código QR
              </h3>
              <p>Genera y personaliza una tarjeta de identificación digital única para {pet.name}. Escaneable por cualquier persona para ver este perfil.</p>
              <Link
                to={`/profile/${uid}/pet/${petid}/qr`}
                className="btn"
              >
                {isOwner ? "Manage QR Code" : "View QR Code"}
              </Link>
            </div>

            {isOwner && (
              <>
                <div className="action-card edit-card">
                  <h3>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Editar Mascota
                  </h3>
                  <p>Actualiza los detalles médicos, la foto o la información general de {pet.name} para mantener su perfil actualizado.</p>
                  <button
                    className="btn"
                    onClick={handleEditPet}
                  >
                    Editar Mascota
                  </button>
                </div>

                <div className="action-card delete-card">
                  <h3>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    Eliminar Mascota
                  </h3>
                  <p>Eliminar permanentemente {pet.name} de tu cuenta. Esta acción no se puede deshacer.</p>
                  <button
                    className="btn"
                    onClick={handleDeletePet}
                  >
                    Eliminar Mascota
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Container for this page */}
        <ModalContainer modals={modals} onHideModal={hideModal} />
      </div>
    </div>
  );
}
