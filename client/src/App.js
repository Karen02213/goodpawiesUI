import { useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QrPage from './pages/QrPage';
import LoginPage from './pages/login/LoginPage';
import RegisterForm from './pages/register/RegisterForm';
import PasswordForm from './pages/register/PasswordForm';
import AvatarMenu from './components/AvatarMenu';
import ProfilePage from "./pages/profile/ProfilePage";

function App() {
  const registerDataRef = useRef({}); // Guarda los datos del registro
  const userImageUrl = 'https://example.com/user-avatar.png'; // URL de la imagen del usuario, puede ser dinámica

  return (
    <div>
      <nav>
        <div className="nav-wrapper">
          <Link to="/">GoodPawies</Link>
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li>
                <AvatarMenu imageUrl={userImageUrl} />
              </li>
            <li><Link to="/qr">QR</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/registrarse">Registrarse</Link></li>
          </ul>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/qr" element={<QrPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrarse" element={<RegisterForm registerDataRef={registerDataRef} />} />
        <Route path="/registrarse/password" element={<PasswordForm registerDataRef={registerDataRef} />} />
      </Routes>
    </div>
  );
}

export default App;
