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
import '../../styles/FormStyles.css';


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
        <div className="form-errors" style={{ color: 'red', marginBottom: 10 }}>
          {errors.map((err, idx) => <div key={idx}>{err}</div>)}
        </div>
      )}


      <div className="form-group">
        <label>Usuario:</label>
        <input
          type="text"
          name="s_username"
          placeholder="Usuario"
          required
          maxLength={30}
          value={formData.s_username}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Nombre(s):</label>
        <input
          type="text"
          name="s_full_name"
          placeholder="Nombre(s)"
          required
          maxLength={30}
          value={formData.s_full_name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Apellidos:</label>
        <input
          type="text"
          name="s_full_surname"
          placeholder="Apellidos"
          required
          maxLength={30}
          value={formData.s_full_surname}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="s_phone_number">Teléfono:</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label htmlFor="s_phone_prefix" style={{ fontSize: '0.95rem', marginBottom: '2px' }}>Prefijo</label>
            <select
              id="s_phone_prefix"
              name="s_phone_prefix"
              value={formData.s_phone_prefix}
              onChange={handleChange}
              style={{ padding: '10px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', background: '#fff', minWidth: '80px' }}
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
              {/* Add more as needed */}
            </select>
          </div>
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
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          name="s_email"
          placeholder="Email"
          maxLength={50}
          value={formData.s_email}
          onChange={handleChange}
        />  
      </div>

  {/* ...existing code... */}
      <div>
        <button type="submit" style={{display:'flex'}}>Siguiente</button>
      </div>
    </form>
  );
}
