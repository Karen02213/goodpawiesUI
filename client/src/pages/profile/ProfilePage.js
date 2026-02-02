import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../components/AuthProvider";
import apiClient from "../../utils/api";
import { useError } from "../../contexts/ErrorContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const { wrapApiCall } = useError();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchUserPets = wrapApiCall(async () => {
      setLoading(true);
      const response = await apiClient.getUserPets(user.id);
      
      console.log('API Response:', response); // Debug log
      
      if (response.success) {
        setPets(response.data?.items || []);
        setError(null);
      } else {
        setError("Error loading pets");
      }
      setLoading(false);
    }, {
      onError: (processedError) => {
        setError(processedError.message);
        setLoading(false);
      }
    });

    fetchUserPets();
  }, [user, wrapApiCall]);

  return (
    <div className="profile-page-container">
      <div className="container">
        <div className="profile-user-card">
          <div className="profile-user-image">
            <img 
              src={"/default-avatar.png"} 
              alt="Avatar" 
              className="profile-user-avatar" 
            />
          </div>
          
          <div className="profile-user-details">
            <h2 className="profile-user-name">{user?.username}</h2>
            <div className="profile-user-info">
              <span className="label">Nombre:</span>
              <span className="value">{user?.fullName} {user?.fullSurname}</span>
            </div>
            <div className="profile-user-info">
              <span className="label">Email:</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="profile-user-info">
              <span className="label">Miembro desde:</span>
              <span className="value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Fecha no disponible'}
              </span>
            </div>
          </div>
        </div>
      
      <div className="profile-pets-section">
        <h3 className="profile-pets-title">🐾 Mis Mascotas</h3>
        
        {loading && <p className="profile-loading">Loading pets...</p>}
        
        {error && <p className="profile-error">{error}</p>}
        
        {!loading && !error && pets.length === 0 && (
          <div className="profile-no-pets-container">
            <p className="profile-no-pets-text">No tienes mascotas registradas.</p>
            <Link 
              to="/register/pet" 
              className="profile-first-pet-button"
            >
              ¡Registra tu primera mascota! 🐾
            </Link>
          </div>
        )}
        
        {!loading && !error && pets.length > 0 && (
          <div className="profile-pets-grid">
            {pets.map((pet) => (
              <Link 
                key={pet.id}
                to={`/profile/${user.id}/pet/${pet.id}`}
                className="profile-pet-card"
              >
                <div className="profile-pet-image-container">
                  <img 
                    src={pet.image_url || "/default-avatar.png"} 
                    alt={pet.name}
                    className="profile-pet-image"
                  />
                </div>
                <div className="profile-pet-name">{pet.name}</div>
                <div className="profile-pet-type">{pet.type}</div>
              </Link>
            ))}
            
            {/* Add Pet Card */}
            <Link 
              to="/register/pet" 
              className="profile-add-pet-card"
            >
              <div className="profile-add-pet-icon">+</div>
              <div className="profile-add-pet-text">Add Pet</div>
            </Link>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
