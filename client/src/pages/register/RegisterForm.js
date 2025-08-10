import { useState } from 'react';
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

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContinue = (e) => {
    e.preventDefault();
    registerDataRef.current = formData;
    navigate('/registrarse/password');
  };

  return (
    <form onSubmit={handleContinue} className="form-container">
      <h2>Registro de Usuario</h2>

      <div className="form-group">
        <label>Usuario:</label>
        <input type="text" name="s_username" placeholder="Usuario" required maxLength={30} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Nombre(s):</label>
        <input type="text" name="s_full_name" placeholder="Nombre(s)" maxLength={30} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Apellidos:</label>
        <input type="text" name="s_full_surname" placeholder="Apellidos" maxLength={30} onChange={handleChange} />
      </div>

      <div className="form-group">  
  <label>Teléfono:</label>
  <input type="tel" name="s_phone_number" placeholder="Teléfono" required maxLength={10} value={formData.s_phone_number} onChange={(e) => {
      const onlyNums = e.target.value.replace(/\D/g, ""); // elimina todo lo que no es número
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
