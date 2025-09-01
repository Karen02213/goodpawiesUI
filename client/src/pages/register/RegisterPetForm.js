import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePetDropdowns, usePetRegistration } from '../../utils/api';
import '../../styles/FormStyles.css';

function RegisterPage() {
  const { breeds, petTypes, genders, sizes, loading: dropdownLoading, error: dropdownError } = usePetDropdowns();
  const { createPet, loading: registrationLoading, error: registrationError } = usePetRegistration();
  
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const filteredBreeds = petData.s_type
    ? breeds.filter(breed => breed.s_type === petData.s_type)
    : [];

  // Reset breed selection when pet type changes
  useEffect(() => {
    if (petData.s_breed && petData.s_type) {
      const breedStillValid = breeds.some(
        breed => breed.s_breed === petData.s_breed && breed.s_type === petData.s_type
      );
      if (!breedStillValid) {
        setPetData(prev => ({ ...prev, s_breed: '' }));
      }
    }
  }, [petData.s_type, breeds, petData.s_breed]);

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
    
    try {
      // Get authentication token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No estás autenticado. Por favor, inicia sesión.');
        return;
      }

      // Prepare pet data for backend
      const petPayload = {
        s_petname: petData.s_petname,
        s_type: petData.s_type,
        s_breed: petData.s_breed,
        s_gender: petData.s_gender,
        s_size: petData.s_size,
        // Optional fields - only include if they have values
        ...(petData.s_description && { s_description: petData.s_description }),
        ...(petData.s_color && { s_color: petData.s_color }),
        ...(petData.n_age && { n_age: parseInt(petData.n_age) }),
        // Booleans - include even if false
        b_vaccinated: petData.b_vaccinated,
        b_sterilized: petData.b_sterilized
      };

      console.log('Sending pet data:', petPayload);

      // Create pet using API utility
      const result = await createPet(petPayload);
      console.log('Pet creation response:', result);

      if (result.success && result.data.petId) {
        // Pet registered successfully, show success message
        setShowSuccess(true);
        
        // Reset form
        setPetData({
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
      } else {
        setError(result.message || registrationError || 'Error al registrar la mascota');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al registrar la mascota');
    }
  };

  return (
    <div>
      {dropdownLoading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Cargando datos del formulario...
        </div>
      )}
      
      {dropdownError && (
        <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
          Error cargando datos: {dropdownError}
        </div>
      )}
      
      {showSuccess ? (
        <div className="form-container" style={{ textAlign: 'center' }}>
          <h2>¡Mascota registrada exitosamente!</h2>
          <p>Tu mascota ha sido registrada correctamente.</p>
          <p>Puedes crear un código QR personalizado para tu mascota desde tu perfil.</p>
          <Link to="/perfil" style={{ 
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            marginTop: '20px'
          }}>
            Ver Mis Mascotas
          </Link>
        </div>
      ) : (
        !dropdownLoading && !dropdownError && (
          <form onSubmit={handleSubmit} className="form-container">
          <h2>Registrar Nueva Mascota</h2>
          {(error || registrationError) && (
            <div style={{ color: 'red' }}>
              {error || registrationError}
            </div>
          )}
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
              disabled={registrationLoading}
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
                disabled={registrationLoading}
              >
                <option value="">Selecciona el tipo</option>
                {petTypes.map((type) => (
                  <option key={type.id} value={type.s_type}>
                    {type.s_type === 'Dog' ? '🐶 Perro' : 
                     type.s_type === 'Cat' ? '🐱 Gato' :
                     type.s_type === 'Bird' ? '🐦 Ave' :
                     type.s_type === 'Rabbit' ? '🐰 Conejo' :
                     type.s_type === 'Fish' ? '🐟 Pez' :
                     type.s_type === 'Hamster' ? '� Hámster' :
                     type.s_type}
                  </option>
                ))}
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
              placeholder="Color de la mascota (opcional)"
              value={petData.s_color}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Edad (años):</label>
            <input
              type="number"
              name="n_age"
              placeholder="Edad en años (opcional)"
              value={petData.n_age}
              onChange={handleChange}
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
                {genders.map((gender) => (
                  <option key={gender.id} value={gender.s_gender}>
                    {gender.s_gender}
                  </option>
                ))}
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
                {sizes.map((size) => (
                  <option key={size.id} value={size.s_size_code}>
                    {size.s_size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label style={{ paddingBottom: "12px" }}>Descripción (opcional):</label>
            <textarea
              name="s_description"
              value={petData.s_description}
              onChange={handleChange}
              className="textarea"
              rows="3"
              placeholder="Describe a tu mascota (opcional)"
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
                <label htmlFor="b_vaccinated" style={{ cursor: "pointer",  marginTop: "22px"  }}>Vacunado (opcional)</label>
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
              <label htmlFor="b_sterilized" style={{ cursor: "pointer",  marginTop: "23px"  }}>Esterilizado (opcional)</label>
            </div>
          </div>

          

          <button type="submit" disabled={registrationLoading}>
            {registrationLoading ? 'Registrando...' : 'Registrar Mascota'}
          </button>
        </form>
        )
      )}
    </div>
  );
}

export default RegisterPage;