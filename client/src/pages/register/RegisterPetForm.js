import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth';
import '../../styles/FormStyles.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [breeds, setBreeds] = useState([]);
  const { user } = useAuth();
  const [petData, setPetData] = useState({
    s_petname: '',
    s_type: '',
    s_breed: '',
    s_description: '',
    s_color: '',
    n_age: '',
    s_gender: '',
    s_size: '',
    b_vaccinated: false,
    b_sterilized: false
  });
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pets/breeds');
        const text = await response.text();
        const data = JSON.parse(text);
        setBreeds(data.breeds || []);
      } catch (err) {
        setBreeds([]);
      }
    };
    fetchBreeds();
  }, []);

  const filteredBreeds = petData.s_type
    ? breeds.filter(breed => breed.s_type === petData.s_type)
    : [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPetData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowQR(false);
    setQrUrl('');
    try {
      // Envía los datos al backend para generar el QR
      const params = new URLSearchParams({
        ...petData,
        n_age: petData.n_age.toString(),
        b_vaccinated: petData.b_vaccinated ? 'true' : 'false',
        b_sterilized: petData.b_sterilized ? 'true' : 'false'
      }).toString();

      const res = await fetch(`http://localhost:5000/api/generate-qr-image?${params}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.filename) {
        setQrUrl(`http://localhost:5000/api/generate-qr-image/${data.filename}`);
        setShowQR(true);
      } else {
        setError('No se pudo generar el código QR');
      }
    } catch (err) {
      setError('Error al registrar la mascota');
      console.error(err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'codigo_qr_mascota.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {!showQR ? (
        <form onSubmit={handleSubmit} className="form-container">
          <h2>Registrar Nueva Mascota</h2>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <div className="form-group">
            <label>Nombre de la mascota:</label>
            <input
              type="text"
              name="s_petname"
              placeholder="Mascota"
              maxLength={30}
              value={petData.s_petname}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "2rem" }}>
            <div className="form-group">
              <label>Tipo de mascota:</label>
              <select
                className="form-select"
                id="s_phone_prefix_bootstrap"
                name="s_type"
                value={petData.s_type}
                onChange={handleChange}
                required
                style={{ maxWidth: "170px", minWidth: "90px" }}
              >
                <option value="">Selecciona el tipo</option>
                <option value="Perro">🐶 Perro</option>
                <option value="Gato">🐱 Gato</option>
              </select>
            </div>

            <div className="form-group">
              <label>Raza:</label>
              <select
                name="s_breed"
                value={petData.s_breed}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Selecciona una raza</option>
                {filteredBreeds.map((breed) => (
                  <option key={breed.id} value={breed.s_breed}>
                    {breed.s_breed}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Color:</label>
            <input
              type="text"
              name="s_color"
              placeholder="Color de la mascota"
              value={petData.s_color}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Edad (años):</label>
            <input
              type="number"
              name="n_age"
              value={petData.n_age}
              onChange={handleChange}
              required
              min="0"
              max="30"
            />
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div className="form-group">
              <label>Género:</label>
              <select
                className="form-select"
                id="s_gender_bootstrap"
                name="s_gender"
                value={petData.s_gender}
                onChange={handleChange}
                required
                style={{ maxWidth: '195px', minWidth: '90px' }}
              >
                <option value="">Selecciona el género</option>
                <option value="Macho"> Macho</option>
                <option value="Hembra"> Hembra</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tamaño:</label>
              <select
                className="form-select"
                id="s_size_bootstrap"
                name="s_size"
                value={petData.s_size}
                onChange={handleChange}
                required
                style={{ maxWidth: '195px', minWidth: '90px' }}
              >
                <option value="">Selecciona el tamaño</option>
                <option value="small">Pequeño</option>
                <option value="medium">Mediano</option>
                <option value="large">Grande</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label style={{ paddingBottom: "12px" }}>Descripción:</label>
            <textarea
              name="s_description"
              value={petData.s_description}
              onChange={handleChange}
              className="textarea"
              rows="3"
            />
          </div>

          <div style={{ display: "flex", gap: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
              <input
                type="checkbox"
                name="b_vaccinated"
                style={{
                  opacity: 1,
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#2196f3"
                }}
                checked={petData.b_vaccinated}
                onChange={handleChange}
                id="b_vaccinated"
              />
                <label htmlFor="b_vaccinated" style={{ cursor: "pointer",  marginTop: "22px"  }}>Vacunado</label>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
              <input
                type="checkbox"
                name="b_sterilized"
                style={{
                  opacity: 1,
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#2196f3",
                }}
                checked={petData.b_sterilized}
                onChange={handleChange}
                id="b_sterilized"
              />
              <label htmlFor="b_sterilized" style={{ cursor: "pointer",  marginTop: "23px"  }}>Esterilizado</label>
            </div>
          </div>

          

          <button type="submit">
            Registrar Mascota
          </button>
        </form>
      ) : (
        <div className="form-container" style={{ textAlign: 'center' }}>
          <h2>¡Mascota registrada!</h2>
          <p>Escanea o descarga el código QR de tu mascota:</p>
          {qrUrl && (
            <img
              src={qrUrl}
              alt="QR Mascota"
              style={{ margin: '20px auto', width: 220, height: 220, background: '#fff', border: '1px solid #ccc' }}
            />
          )}
          <button onClick={handleDownloadQR} style={{ marginTop: 10 }}>
            Descargar QR
          </button>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;