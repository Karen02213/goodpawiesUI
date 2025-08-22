import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils/auth";

export default function ProfilePage() {
  const { user } = useAuth();
  const [pets] = useState([]);

  console.log(user);
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
        {pets.length === 0 ? (
          <p>No tienes mascotas registradas.</p>
        ) : (
          <ul style={styles.petList}>
            {pets.map((pet) => (
              <li key={pet.id} style={styles.petItem}>
                <strong>{pet.name}</strong> ({pet.type})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.card}>
          <Link to="/agregar-mascota" style={styles.addButton}>➕</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
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
  petList: {
    listStyle: "none",
    padding: 0
  },
  petItem: {
    backgroundColor: "#f0f0f0",
    padding: "10px",
    margin: "5px 0",
    borderRadius: "5px"
  },
  addButton: {
    display: "inline-block",
    padding: "10px 20px",
    backgroundColor: "#ffb3c1",
    borderRadius: "30px",
    textDecoration: "none",
    fontWeight: "bold"
  }
};
