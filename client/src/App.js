import { useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import QrPage from './pages/QrPage';
import LoginPage from './pages/login/LoginPage';
import RegisterForm from './pages/register/RegisterForm';
import PasswordForm from './pages/register/PasswordForm';
import ProfilePage from "./pages/profile/ProfilePage";
import PetDetailPage from "./pages/profile/PetDetailPage";
import PetQrPage from "./pages/profile/PetQrPage";
import PetProfilePage from "./pages/PetProfilePage";
import DemoPage from "./pages/DemoPage";
import ErrorPage from "./pages/ErrorPage";
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPetForm from './pages/register/RegisterPetForm';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ModalContainer from './components/ModalContainer';
import { ErrorProvider, useError } from './contexts/ErrorContext';

function AppContent() {
  const registerDataRef = useRef({});
  const { modals, hideModal } = useError();

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Protected routes */}
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/:uid" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/:uid/qr" element={<ProtectedRoute><QrPage /></ProtectedRoute>} />
          <Route path="/profile/:uid/pet/:petid" element={<ProtectedRoute><PetDetailPage /></ProtectedRoute>} />
          <Route path="/profile/:uid/pet/:petid/qr" element={<ProtectedRoute><PetQrPage /></ProtectedRoute>} />
          <Route path="/agregar-mascota" element={<ProtectedRoute><RegisterPetForm /></ProtectedRoute>} />
          <Route path="/register/pet" element={<ProtectedRoute><RegisterPetForm /></ProtectedRoute>} />
          
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registrarse" element={<RegisterForm registerDataRef={registerDataRef} />} />
          <Route path="/registrarse/password" element={<PasswordForm registerDataRef={registerDataRef} />} />
          <Route path="/pet/:petid" element={<PetProfilePage />} />
          <Route path="/demo" element={<DemoPage />} />
          
          {/* Error routes */}
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>

      <Footer />
      
      {/* Modal Container for global modals */}
      <ModalContainer modals={modals} onHideModal={hideModal} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <AppContent />
      </ErrorProvider>
    </ErrorBoundary>
  );
}

export default App;
