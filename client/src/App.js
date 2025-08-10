import { useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QrPage from './pages/QrPage';
import LoginPage from './pages/login/LoginPage';
import RegisterForm from './pages/register/RegisterForm';
import PasswordForm from './pages/register/PasswordForm';
import AvatarMenu from './components/AvatarMenu';
import ProfilePage from "./pages/profile/ProfilePage";
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './utils/auth';

function App() {
  const registerDataRef = useRef({}); // Guarda los datos del registro
  const { user, isAuthenticated, logout } = useAuth();
  const userImageUrl = user?.avatar || '/default-avatar.png'; // URL de la imagen del usuario

  const handleLogout = async () => {
    await logout();
    // Navigation will be handled by auth state change
  };

  return (
    <div>
      <nav>
        <div className="nav-wrapper">
          <Link to="/">GoodPawies</Link>
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            {isAuthenticated ? (
              // Authenticated user navigation
              <>
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/qr">QR</Link></li>
                <li><Link to="/perfil">Perfil</Link></li>
                <li>
                  <AvatarMenu 
                    imageUrl={userImageUrl} 
                    username={user?.username}
                    onLogout={handleLogout}
                  />
                </li>
              </>
            ) : (
              // Guest navigation
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/registrarse">Registrarse</Link></li>
              </>
            )}
          </ul>
        </div>
      </nav>
      <Routes>
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/qr" element={
          <ProtectedRoute>
            <QrPage />
          </ProtectedRoute>
        } />
        
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrarse" element={<RegisterForm registerDataRef={registerDataRef} />} />
        <Route path="/registrarse/password" element={<PasswordForm registerDataRef={registerDataRef} />} />
      </Routes>
    </div>
  );
}

export default App;
