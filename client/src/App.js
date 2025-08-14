import { useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QrPage from './pages/QrPage';
import LoginPage from './pages/login/LoginPage';
import RegisterForm from './pages/register/RegisterForm';
import PasswordForm from './pages/register/PasswordForm';
import ProfilePage from "./pages/profile/ProfilePage";
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const registerDataRef = useRef({});

  return (
    <div>
      <Navbar />

      <Routes>
        {/* Rutas protegidas */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/qr" element={<ProtectedRoute><QrPage /></ProtectedRoute>} />
        
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrarse" element={<RegisterForm registerDataRef={registerDataRef} />} />
        <Route path="/registrarse/password" element={<PasswordForm registerDataRef={registerDataRef} />} />
      </Routes>
    </div>
  );
}

export default App;
