import { useState } from 'react';
import {
  validateUsername,
  validateFullName,
  validateFullSurname,
  validatePhonePrefix,
  validatePhoneNumber,
  validateEmail
} from '../../utils/validation';
import { useNavigate } from 'react-router-dom';
import '../../styles/FormStyles.css';


export default function RegisterForm({ registerDataRef }) {
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
        <input type="text" name="s_username" placeholder="Usuario" required maxLength={30} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Nombre(s):</label>
        <input type="text" name="s_full_name" placeholder="Nombre(s)" required maxLength={30} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Apellidos:</label>
        <input type="text" name="s_full_surname" placeholder="Apellidos" required maxLength={30} onChange={handleChange} />
      </div>

      <div className="form-group">  
        <label>Teléfono:</label>
        <input type="tel" name="s_phone_number" placeholder="Teléfono" required minLength={10} maxLength={10} value={formData.s_phone_number} onChange={(e) => {
          const onlyNums = e.target.value.replace(/\D/g, "");
          setFormData(prev => ({ ...prev, s_phone_number: onlyNums }));
        }}
        />
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input type="email" name="s_email" placeholder="Email" maxLength={50} onChange={handleChange} />  
      </div>

      {/* <label>Prefijo:</label> */}
      {/* <input type="text" name="s_phone_prefix" placeholder="Prefijo" required maxLength={5} onChange={handleChange} /> */}
      <div>
        <button type="submit" style={{display:'flex'}}>Siguiente</button>
      </div>
    </form>
  );
}
