import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../components/AuthProvider";
import apiClient, { UPLOADS_URL } from "../../utils/api";


export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserPets = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getUserPets(user.id);

      if (response.success) {
        // Handle various data structures
        const petsData = response.data?.items || response.data?.pets || response.data || [];
        if (Array.isArray(petsData)) {
          setPets(petsData);
        } else if (petsData.items && Array.isArray(petsData.items)) {
          setPets(petsData.items);
        } else {
          setPets([]);
        }
      } else {
        // Only set error if it's a real failure
        console.error("Pets fetch failed:", response);
        setError("Error loading pets");
      }
    } catch (err) {
      console.error("Fetch pets error:", err);
      setError("Failed to load pets");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // Wait for auth to complete before trying to fetch pets
    if (authLoading) return;

    if (user?.id) {
      fetchUserPets();
    } else {
      // No user, stop loading
      setLoading(false);
    }
  }, [user?.id, authLoading, fetchUserPets]);

  return (
    <div className="profile-page-container">
      <div className="container">
        <div className="profile-user-card">
          <Link to="/profile/settings" className="profile-settings-btn" title="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
          <div className="profile-user-image">
            <div className="avatar avatar-xl avatar-bordered">
              <img
                src={user?.avatar ? `${UPLOADS_URL}/uploads/users/${user.avatar}` : "/default-avatar.png"}
                alt="Profile"
                onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
              />
            </div>
          </div>

          <div className="profile-user-details">
            <h2 className="profile-user-name">{user?.username || 'User'}</h2>
            <div className="profile-user-info">
              <span className="label">Name:</span>
              <span className="value">{user?.fullName} {user?.fullSurname}</span>
            </div>
            <div className="profile-user-info">
              <span className="label">Email:</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="profile-user-info">
              <span className="label">Member Since:</span>
              <span className="value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-pets-section">
          <h3 className="profile-pets-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58 1.57 3.8.74 5.21 1.05 1.77 1.35 4.3.49 6.22-1.35 2.5-5.55 4.88-9.65 4.54-5.3 0-8.91-4.04-8.91-4.04-.42-1.92.1-4.45 1.15-6.23-.84-1.4-.66-4.62.74-5.21 1.39-.58 4.64.26 6.42 2.26.65-.17 1.33-.26 2-.26z"></path><path d="M12 13h.01"></path><path d="M12 9h.01"></path></svg>
            My Pets
          </h3>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="loading-spinner" style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && (
            <div className="profile-error-container" style={{ textAlign: 'center', color: '#e53e3e', padding: '1rem' }}>
              <p>{error}</p>
              <button onClick={fetchUserPets} className="btn btn-sm btn-outline-primary" style={{ marginTop: '0.5rem', cursor: 'pointer' }}>Try Again</button>
            </div>
          )}

          {!loading && !error && pets.length === 0 && (
            <div className="profile-no-pets-container">
              <p className="profile-no-pets-text">You haven't registered any pets yet.</p>
              <Link
                to="/register/pet"
                className="profile-first-pet-button"
              >
                Register your first pet! 🐾
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
                    <div className="avatar avatar-xl avatar-bordered">
                      <img
                        src={pet.image_url ? (pet.image_url.startsWith('/') ? pet.image_url : `${UPLOADS_URL}/uploads/pets/${pet.image_url}`) : "/default-avatar.png"}
                        alt={pet.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
                      />
                    </div>
                  </div>
                  <div className="profile-pet-name">{pet.name || pet.s_petname}</div>
                  <div className="profile-pet-type">{pet.type || pet.s_type}</div>
                </Link>
              ))}

              {/* Add Pet Card */}
              <Link
                to="/register/pet"
                className="profile-add-pet-card"
              >
                <div className="profile-add-pet-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <div className="profile-add-pet-text">Add Pet</div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
