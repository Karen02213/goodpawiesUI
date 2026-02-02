import { useState, useEffect } from 'react';
import {
  validateUsername,
  validateFullName,
  validateFullSurname,
  validatePhonePrefix,
  validatePhoneNumber,
  validateEmail
} from '../../utils/validation';
import { useNavigate, useLocation } from 'react-router-dom';


export default function RegisterForm({ registerDataRef }) {
  const location = useLocation();
  const [formData, setFormData] = useState({
    s_username: '',
    s_phone_prefix: '+52', // Default Mexico prefix
    s_phone_number: '',
    s_email: '',
    s_full_name: '',
    s_full_surname: '',
  });
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  // Prefill form if coming back from password step
  useEffect(() => {
    if (location.state) {
      setFormData(prev => ({ ...prev, ...location.state }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContinue = (e) => {
    e.preventDefault();
    // Check if validation is enabled
    let validationEnabled = true;
    try {
      // eslint-disable-next-line no-undef
      validationEnabled = process.env.REACT_APP_VALIDATION_ENABLED !== 'false';
    } catch {}

    if (validationEnabled) {
      const validationErrors = [
        validateUsername(formData.s_username),
        validateFullName(formData.s_full_name),
        validateFullSurname(formData.s_full_surname),
        validatePhonePrefix(formData.s_phone_prefix),
        validatePhoneNumber(formData.s_phone_number),
        validateEmail(formData.s_email)
      ].filter(Boolean);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
    }
    setErrors([]);
    registerDataRef.current = formData;
    navigate('/registrarse/password');
  };

  return (
    <form onSubmit={handleContinue} className="form-container">
      <h2>Registro de Usuario</h2>

      {errors.length > 0 && (
        <div className="invalid-feedback show">
          {errors.map((err, idx) => <div key={idx}>{err}</div>)}
        </div>
      )}


      <div className="form-group">
        <div className="form-floating">
          <input
            type="text"
            name="s_username"
            placeholder="Usuario"
            required
            maxLength={30}
            value={formData.s_username}
            onChange={handleChange}
            className="form-control"
            id="s_username"
          />
          <label htmlFor="s_username">
            <i className="material-icons">person</i>
            Usuario
          </label>
        </div>
      </div>

      <div className="form-group">
        <div className="form-floating">
          <input
            type="text"
            name="s_full_name"
            placeholder="Nombre(s)"
            required
            maxLength={30}
            value={formData.s_full_name}
            onChange={handleChange}
            className="form-control"
            id="s_full_name"
          />
          <label htmlFor="s_full_name">
            <i className="material-icons">badge</i>
            Nombre(s)
          </label>
        </div>
      </div>

      <div className="form-group">
        <div className="form-floating">
          <input
            type="text"
            name="s_full_surname"
            placeholder="Apellidos"
            required
            maxLength={30}
            value={formData.s_full_surname}
            onChange={handleChange}
            className="form-control"
            id="s_full_surname"
          />
          <label htmlFor="s_full_surname">
            <i className="material-icons">family_restroom</i>
            Apellidos
          </label>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="s_phone_number" className="form-label">Teléfono:</label>
        <div className="row">
          <div className="col-4">
            <div className="form-floating">
              <select
                className="form-control"
                id="s_phone_prefix_bootstrap"
                name="s_phone_prefix"
                value={formData.s_phone_prefix}
                onChange={handleChange}
                required
              >
                <option value="+52">🇲🇽 +52</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+34">🇪🇸 +34</option>
                <option value="+57">🇨🇴 +57</option>
                <option value="+55">🇧🇷 +55</option>
                <option value="+91">🇮🇳 +91</option>
                <option value="+81">🇯🇵 +81</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+33">🇫🇷 +33</option>
              </select>
              <label htmlFor="s_phone_prefix_bootstrap">
                <i className="material-icons">flag</i>
                País
              </label>
            </div>
          </div>
          <div className="col-8">
            <div className="form-floating">
              <input
                type="tel"
                id="s_phone_number"
                name="s_phone_number"
                placeholder="Teléfono"
                required
                minLength={10}
                maxLength={10}
                value={formData.s_phone_number}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, "");
                  setFormData(prev => ({ ...prev, s_phone_number: onlyNums }));
                }}
                className="form-control"
              />
              <label htmlFor="s_phone_number">
                <i className="material-icons">phone</i>
                Teléfono
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="form-floating">
          <input
            type="email"
            name="s_email"
            placeholder="Email"
            maxLength={50}
            value={formData.s_email}
            onChange={handleChange}
            className="form-control"
            id="s_email"
          />
          <label htmlFor="s_email">
            <i className="material-icons">email</i>
            Email
          </label>
        </div>
      </div>

  {/* ...existing code... */}
      <div className="text-center">
        <button type="submit" className="btn btn-primary btn-lg">
          <i className="material-icons">arrow_forward</i>
          Siguiente
        </button>
      </div>
    </form>
  );
}
