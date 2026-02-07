import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../components/AuthProvider";
import apiClient, { usePetDropdowns } from "../../utils/api";

export default function EditPetPage() {
  const { uid, petid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = user && user.id === parseInt(uid, 10);

  const { breeds, petTypes, genders, sizes, loading: dropdownLoading, error: dropdownError } = usePetDropdowns();
  const [petData, setPetData] = useState({
    s_petname: "",
    s_type: "",
    s_breed: "",
    s_description: "",
    s_color: "",
    n_age: "",
    s_gender: "",
    s_size: "",
    b_vaccinated: false,
    b_sterilized: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageData, setImageData] = useState("");

  const filteredBreeds = useMemo(() => (
    petData.s_type ? breeds.filter((breed) => breed.s_type === petData.s_type) : []
  ), [breeds, petData.s_type]);

  useEffect(() => {
    if (!isOwner && user) {
      navigate("/perfil", { replace: true });
    }
  }, [isOwner, user, navigate]);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getPet(petid);
        if (!response.success) {
          setError("No se pudo cargar la mascota");
          return;
        }

        const pet = response.data;
        setPetData({
          s_petname: pet.name || "",
          s_type: pet.type || "",
          s_breed: pet.breed || "",
          s_description: pet.description || "",
          s_color: pet.color || "",
          n_age: pet.age ?? "",
          s_gender: pet.gender || "",
          s_size: pet.size || "",
          b_vaccinated: Boolean(pet.vaccinated),
          b_sterilized: Boolean(pet.sterilized)
        });
        setImagePreview(pet.image_url || "");
      } catch (err) {
        setError("Error al cargar la mascota");
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [petid]);

  useEffect(() => {
    if (petData.s_breed && petData.s_type) {
      const breedStillValid = breeds.some(
        (breed) => breed.s_breed === petData.s_breed && breed.s_type === petData.s_type
      );
      if (!breedStillValid) {
        setPetData((prev) => ({ ...prev, s_breed: "" }));
      }
    }
  }, [petData.s_type, breeds, petData.s_breed]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPetData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setImagePreview(result);
        setImageData(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        s_petname: petData.s_petname,
        s_type: petData.s_type,
        s_breed: petData.s_breed,
        s_gender: petData.s_gender,
        s_size: petData.s_size,
        ...(petData.s_description && { s_description: petData.s_description }),
        ...(petData.s_color && { s_color: petData.s_color }),
        ...(petData.n_age !== "" && { n_age: parseInt(petData.n_age, 10) }),
        b_vaccinated: petData.b_vaccinated,
        b_sterilized: petData.b_sterilized,
        ...(imageData && { image_data: imageData })
      };

      const result = await apiClient.updatePet(petid, payload);
      if (result.success) {
        navigate(`/profile/${uid}/pet/${petid}`, { replace: true });
      } else {
        setError(result.message || "Error al actualizar la mascota");
      }
    } catch (err) {
      setError("Error al actualizar la mascota");
    } finally {
      setSaving(false);
    }
  };

  if (loading || dropdownLoading) {
    return (
      <div className="pet-form-loading-container">
        Cargando datos de la mascota...
      </div>
    );
  }

  if (dropdownError) {
    return (
      <div className="pet-form-error-container">
        Error cargando datos: {dropdownError}
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="form-container">
        <h2>Editar Perfil de Mascota</h2>
        {error && <div className="invalid-feedback show">{error}</div>}

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
              disabled={saving}
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
                  disabled={saving}
                  id="s_type"
                >
                  <option value="">Selecciona el tipo</option>
                  {petTypes.map((type) => (
                    <option key={type.id} value={type.s_type}>
                      {type.s_type === "Dog" ? "🐶 Perro" :
                      type.s_type === "Cat" ? "🐱 Gato" :
                      type.s_type === "Bird" ? "🐦 Ave" :
                      type.s_type === "Rabbit" ? "🐰 Conejo" :
                      type.s_type === "Fish" ? "🐟 Pez" :
                      type.s_type === "Hamster" ? "🐹 Hámster" :
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
                  required
                  disabled={saving || !petData.s_type}
                  className="form-control"
                  id="s_breed"
                >
                  <option value="">Selecciona la raza</option>
                  {filteredBreeds.map((breed) => (
                    <option key={breed.id} value={breed.s_breed}>
                      {breed.s_breed}
                    </option>
                  ))}
                </select>
                <label htmlFor="s_breed">
                  <i className="material-icons">pets</i>
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
                  name="s_gender"
                  value={petData.s_gender}
                  onChange={handleChange}
                  required
                  disabled={saving}
                  className="form-control"
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
                  name="s_size"
                  value={petData.s_size}
                  onChange={handleChange}
                  required
                  disabled={saving}
                  className="form-control"
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

        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <div className="form-floating">
                <input
                  type="number"
                  name="n_age"
                  placeholder="Edad"
                  min="0"
                  max="30"
                  value={petData.n_age}
                  onChange={handleChange}
                  disabled={saving}
                  className="form-control"
                  id="n_age"
                />
                <label htmlFor="n_age">
                  <i className="material-icons">cake</i>
                  Edad (años)
                </label>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <div className="form-floating">
                <input
                  type="text"
                  name="s_color"
                  placeholder="Color"
                  maxLength={50}
                  value={petData.s_color}
                  onChange={handleChange}
                  disabled={saving}
                  className="form-control"
                  id="s_color"
                />
                <label htmlFor="s_color">
                  <i className="material-icons">palette</i>
                  Color
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-floating">
            <textarea
              name="s_description"
              placeholder="Descripción"
              value={petData.s_description}
              onChange={handleChange}
              disabled={saving}
              className="form-control"
              id="s_description"
              rows={4}
              style={{ height: "auto" }}
            />
            <label htmlFor="s_description">
              <i className="material-icons">description</i>
              Descripción
            </label>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="b_vaccinated"
                  checked={petData.b_vaccinated}
                  onChange={handleChange}
                  disabled={saving}
                />{" "}
                Vacunado
              </label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="b_sterilized"
                  checked={petData.b_sterilized}
                  onChange={handleChange}
                  disabled={saving}
                />{" "}
                Esterilizado
              </label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="pet_image">Foto de la mascota</label>
          <input
            id="pet_image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={saving}
            className="form-control"
          />
          {imagePreview && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <img
                src={imagePreview}
                alt="Vista previa"
                style={{ width: "140px", height: "140px", borderRadius: "999px", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        <div className="row" style={{ marginTop: "1.5rem" }}>
          <div className="col-md-6" style={{ marginBottom: "0.5rem" }}>
            <button type="submit" className="btn btn-primary w-100" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
          <div className="col-md-6">
            <Link to={`/profile/${uid}/pet/${petid}`} className="btn btn-outline-primary w-100">
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
