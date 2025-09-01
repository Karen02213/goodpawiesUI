import { useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QrPage from './pages/QrPage';
import LoginPage from './pages/login/LoginPage';
import RegisterForm from './pages/register/RegisterForm';
import PasswordForm from './pages/register/PasswordForm';
import ProfilePage from "./pages/profile/ProfilePage";
import PetDetailPage from "./pages/profile/PetDetailPage";
import PetQrPage from "./pages/profile/PetQrPage";
import PetProfilePage from "./pages/PetProfilePage";
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPetForm from './pages/register/RegisterPetForm';
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
        <Route path="/profile/:uid" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:uid/qr" element={<ProtectedRoute><QrPage /></ProtectedRoute>} />
        <Route path="/profile/:uid/pet/:petid" element={<ProtectedRoute><PetDetailPage /></ProtectedRoute>} />
        <Route path="/profile/:uid/pet/:petid/qr" element={<ProtectedRoute><PetQrPage /></ProtectedRoute>} />
        <Route path="/agregar-mascota" element={<ProtectedRoute><RegisterPetForm /></ProtectedRoute>} />
        <Route path="/register/pet" element={<ProtectedRoute><RegisterPetForm /></ProtectedRoute>} />
        
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrarse" element={<RegisterForm registerDataRef={registerDataRef} />} />
        <Route path="/registrarse/password" element={<PasswordForm registerDataRef={registerDataRef} />} />
        <Route path="/pet/:petid" element={<PetProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
