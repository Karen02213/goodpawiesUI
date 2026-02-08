import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePetDropdowns, usePetRegistration } from "../../utils/api";

const AGE_RANGES = [
  "Menos de 1 año",
  "1 año",
  "2 años",
  "3 años",
  "4 años",
  "5 años",
  "6 años",
  "7 años",
  "8 años",
  "9 años",
  "10 años",
  "11 años",
  "12 años",
  "13 años",
  "14 años",
  "15 años",
  "Más de 15 años"
];

function RegisterPage() {
  const { breeds, petTypes, genders, sizes, colors, loading: dropdownLoading, error: dropdownError } = usePetDropdowns();
  const { createPet, loading: registrationLoading, error: registrationError } = usePetRegistration();

  const [petData, setPetData] = useState({
    s_petname: '',
    s_type: '',
    s_breed: '',
    s_description: '',
    s_color: '',
    s_age: '',
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
        ...(petData.s_age && { s_age: petData.s_age }),
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
          s_age: '',
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
        <div className="pet-form-loading-container">
          Cargando datos del formulario...
        </div>
      )}

      {dropdownError && (
        <div className="pet-form-error-container">
          Error cargando datos: {dropdownError}
        </div>
      )}

      {showSuccess ? (
        <div className="form-container pet-form-success-container">
          <h2>¡Mascota registrada exitosamente!</h2>
          <p>Tu mascota ha sido registrada correctamente.</p>
          <p>Puedes crear un código QR personalizado para tu mascota desde tu perfil.</p>
          <Link to="/profile" className="btn btn-primary mt-5">
            Ver Mis Mascotas
          </Link>
        </div>
      ) : (
        !dropdownLoading && !dropdownError && (
          <form onSubmit={handleSubmit} className="form-container">
            <h2>Registrar Nueva Mascota</h2>
            {(error || registrationError) && (
              <div className="invalid-feedback show">
                {error || registrationError}
              </div>
            )}
            <div className="form-group">
              <div className="form-floating">
                <input
                  type="text"
                  name="s_petname"
                  placeholder="Nombre de la mascota"
                  maxLength={30}
                  value={petData.s_petname}
                  onChange={handleChange}
                  required
                  disabled={registrationLoading}
                  className="form-control"
                  id="s_petname"
                />
                <label htmlFor="s_petname">
                  <i className="material-icons">pets</i>
                  Nombre de la mascota
                </label>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <div className="form-floating">
                    <select
                      className="form-control"
                      name="s_type"
                      value={petData.s_type}
                      onChange={handleChange}
                      required
                      disabled={registrationLoading}
                      id="s_type"
                    >
                      <option value="">Selecciona el tipo</option>
                      {petTypes.map((type) => (
                        <option key={type.id} value={type.s_type}>
                          {type.s_type === 'Dog' ? '🐶 Perro' :
                            type.s_type === 'Cat' ? '🐱 Gato' :
                              type.s_type === 'Bird' ? '🐦 Ave' :
                                type.s_type === 'Rabbit' ? '🐰 Conejo' :
                                  type.s_type === 'Fish' ? '🐟 Pez' :
                                    type.s_type === 'Hamster' ? '🐹 Hámster' :
                                      type.s_type}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="s_type">
                      <i className="material-icons">category</i>
                      Tipo de mascota
                    </label>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <div className="form-floating">
                    <select
                      name="s_breed"
                      value={petData.s_breed}
                      onChange={handleChange}
                      className="form-control"
                      id="s_breed"
                    >
                      <option value="">Selecciona una raza</option>
                      {filteredBreeds.map((breed) => (
                        <option key={breed.id} value={breed.s_breed}>
                          {breed.s_breed}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="s_breed">
                      <i className="material-icons">list</i>
                      Raza
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <div className="form-floating">
                    <select
                      name="s_color"
                      value={petData.s_color}
                      onChange={handleChange}
                      className="form-control"
                      id="s_color"
                    >
                      <option value="">Selecciona el color</option>
                      {colors.map((color) => (
                        <option key={color.id} value={color.s_color}>
                          {color.s_color}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="s_color">
                      <i className="material-icons">palette</i>
                      Color
                    </label>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <div className="form-floating">
                    <select
                      name="s_age"
                      value={petData.s_age}
                      onChange={handleChange}
                      className="form-control"
                      id="s_age"
                    >
                      <option value="">Selecciona la edad</option>
                      {AGE_RANGES.map((age) => (
                        <option key={age} value={age}>
                          {age}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="s_age">
                      <i className="material-icons">cake</i>
                      Edad
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <div className="form-floating">
                    <select
                      className="form-control"
                      name="s_gender"
                      value={petData.s_gender}
                      onChange={handleChange}
                      required
                      id="s_gender"
                    >
                      <option value="">Selecciona el género</option>
                      {genders.map((gender) => (
                        <option key={gender.id} value={gender.s_gender}>
                          {gender.s_gender}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="s_gender">
                      <i className="material-icons">wc</i>
                      Género
                    </label>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <div className="form-floating">
                    <select
                      className="form-control"
                      name="s_size"
                      value={petData.s_size}
                      onChange={handleChange}
                      required
                      id="s_size"
                    >
                      <option value="">Selecciona el tamaño</option>
                      {sizes.map((size) => (
                        <option key={size.id} value={size.s_size_code}>
                          {size.s_size}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="s_size">
                      <i className="material-icons">straighten</i>
                      Tamaño
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-floating">
                <textarea
                  name="s_description"
                  value={petData.s_description}
                  onChange={handleChange}
                  className="form-control textarea"
                  rows="4"
                  placeholder="Describe a tu mascota (opcional)"
                  id="s_description"
                  style={{ height: '120px' }}
                />
                <label htmlFor="s_description">
                  <i className="material-icons">description</i>
                  Descripción (opcional)
                </label>
              </div>
            </div>

            <div className="toggle-grid">
              <label className="toggle-card">
                <input
                  type="checkbox"
                  name="b_vaccinated"
                  className="toggle-card-input"
                  checked={petData.b_vaccinated}
                  onChange={handleChange}
                  id="b_vaccinated"
                />
                <div className="toggle-card-content">
                  <i className="material-icons toggle-card-icon">health_and_safety</i>
                  <span className="toggle-card-label">Vacunado</span>
                </div>
              </label>

              <label className="toggle-card">
                <input
                  type="checkbox"
                  name="b_sterilized"
                  className="toggle-card-input"
                  checked={petData.b_sterilized}
                  onChange={handleChange}
                  id="b_sterilized"
                />
                <div className="toggle-card-content">
                  <i className="material-icons toggle-card-icon">medical_services</i>
                  <span className="toggle-card-label">Esterilizado</span>
                </div>
              </label>
            </div>



            <div className="text-center">
              <button type="submit" disabled={registrationLoading} className="btn btn-primary btn-lg">
                <i className="material-icons">pets</i>
                {registrationLoading ? 'Registrando...' : 'Registrar Mascota'}
              </button>
            </div>
          </form>
        )
      )}
    </div>
  );
}

export default RegisterPage;