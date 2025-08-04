import { useState } from "react";

function RegisterPage() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [petData, setPetData] = useState({
    name: "",
    species: "",
    age: ""
  });

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePetChange = (e) => {
    setPetData({ ...petData, [e.target.name]: e.target.value });
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes guardar el usuario (llamar API, etc)
    console.log("Usuario registrado:", userData);
    setStep(2);
  };

  const handlePetSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes guardar la mascota (llamar API, etc)
    console.log("Mascota registrada:", petData);
    alert("¡Usuario y mascota registrados con éxito!");
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", padding: 20, border: "1px solid #ccc", borderRadius: 10 }}>
      {step === 1 && (
        <form onSubmit={handleUserSubmit}>
          <h1>Registro de Usuario</h1>
          <div>
            <label>Apellido:</label>
            <input type="text" name="username" value={userData.username} onChange={handleUserChange} required />
          </div>
          <div>
            <label>Nombre:</label>
            <input type="text" name="username" value={userData.username} onChange={handleUserChange} required />
          </div>
          <div>
            <label>Telefono:</label>
            <input type="text" name="username" value={userData.username} onChange={handleUserChange} required />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" name="email" value={userData.email} onChange={handleUserChange} required />
          </div>
          <div>
            <label>Contraseña:</label>
            <input type="password" name="password" value={userData.password} onChange={handleUserChange} required />
          </div>
          <button type="submit">Siguiente</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handlePetSubmit}>
          <h2>Registro de Mascota</h2>
          <div>
            <label>Nombre de la mascota:</label>
            <input type="text" name="name" value={petData.name} onChange={handlePetChange} required />
          </div>
          <div>
            <label>Especie:</label>
            <input type="text" name="species" value={petData.species} onChange={handlePetChange} required />
          </div>
          <div>
            <label>Edad:</label>
            <input type="number" name="age" value={petData.age} onChange={handlePetChange} required />
          </div>
          <button type="submit">Registrar</button>
        </form>
      )}
    </div>
  );
}

export default RegisterPage;
