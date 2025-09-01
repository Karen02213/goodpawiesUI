import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils/auth";
import apiClient from "../../utils/api";

// Add CSS for hover effects
const hoverStyles = `
  .pet-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
    border-color: #007bff;
  }
  
  .add-pet-card:hover {
    transform: translateY(-5px);
    color: #007bff;
    border-color: #007bff;
  }
  
  .first-pet-button:hover {
    background-color: #0056b3;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = hoverStyles;
  document.head.appendChild(styleElement);
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserPets = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getUserPets(user.id);
        
        console.log('API Response:', response); // Debug log
        
        if (response.success) {
          setPets(response.data?.items || []);
        } else {
          setError("Error loading pets");
        }
      } catch (err) {
        console.error("Error fetching pets:", err);
        setError("Error loading pets");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPets();
  }, [user]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={"/default-avatar.png"} alt="Avatar" style={styles.avatar} />
        <h2>{user?.username}</h2>
        <p>{user?.fullName}  {user?.fullSurname}</p>
        <p>{user?.email}</p>
      </div>
      
      <div style={styles.section}>
        <h3>🐾 Mis Mascotas</h3>
        
        {loading && <p>Loading pets...</p>}
        
        {error && <p style={{color: 'red'}}>{error}</p>}
        
        {!loading && !error && pets.length === 0 && (
          <div style={styles.noPetsContainer}>
            <p style={styles.noPetsText}>No tienes mascotas registradas.</p>
            <Link to="/register/pet" style={styles.firstPetButton} className="first-pet-button">
              ¡Registra tu primera mascota! 🐾
            </Link>
          </div>
        )}
        
        {!loading && !error && pets.length > 0 && (
          <div style={styles.petsGrid}>
            {pets.map((pet) => (
              <Link 
                key={pet.id}
                to={`/profile/${user.id}/pet/${pet.id}`}
                style={styles.petCard}
                className="pet-card"
              >
                <div style={styles.petImageContainer}>
                  <img 
                    src={pet.image_url || "/default-avatar.png"} 
                    alt={pet.name}
                    style={styles.petImage}
                  />
                </div>
                <div style={styles.petName}>{pet.name}</div>
                <div style={styles.petType}>{pet.type}</div>
              </Link>
            ))}
            
            {/* Add Pet Card */}
            <Link to="/register/pet" style={styles.addPetCard} className="add-pet-card">
              <div style={styles.addPetIcon}>+</div>
              <div style={styles.addPetText}>Add Pet</div>
            </Link>
          </div>
        )}
        
        {!loading && !error && pets.length === 0 && (
          <div style={styles.noPetsContainer}>
            <p style={styles.noPetsText}>No tienes mascotas registradas.</p>
            <Link to="/agregar-mascota" style={styles.firstPetButton}>
              ➕ Agregar Primera Mascota
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    textAlign: "center"
  },
  card: {
    marginBottom: "30px"
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #ccc",
    marginBottom: "10px"
  },
  section: {
    marginBottom: "20px"
  },
  petsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "20px",
    padding: "20px 0",
    justifyItems: "center"
  },
  petCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textDecoration: "none",
    color: "#333",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
    padding: "15px",
    borderRadius: "15px",
    backgroundColor: "#f8f9fa",
    border: "2px solid transparent",
    minWidth: "100px"
  },
  petImageContainer: {
    marginBottom: "10px"
  },
  petImage: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #007bff",
    boxShadow: "0 2px 8px rgba(0, 123, 255, 0.3)"
  },
  petName: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "4px",
    textAlign: "center"
  },
  petType: {
    fontSize: "12px",
    color: "#666",
    textAlign: "center"
  },
  addPetCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textDecoration: "none",
    color: "#666",
    transition: "transform 0.3s ease, color 0.3s ease",
    cursor: "pointer",
    padding: "15px",
    borderRadius: "15px",
    backgroundColor: "#f8f9fa",
    border: "2px dashed #ccc",
    minWidth: "100px",
    textAlign: "center"
  },
  addPetIcon: {
    fontSize: "40px",
    marginBottom: "8px",
    color: "#007bff"
  },
  addPetText: {
    fontSize: "12px",
    fontWeight: "500"
  },
  noPetsContainer: {
    padding: "40px 20px",
    textAlign: "center"
  },
  noPetsText: {
    color: "#666",
    marginBottom: "20px",
    fontSize: "16px"
  },
  firstPetButton: {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "white",
    textDecoration: "none",
    borderRadius: "25px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease"
  }
};
