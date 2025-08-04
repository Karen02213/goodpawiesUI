// client/src/App.js
import { useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QrPage from './pages/QrPage';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';

function App() {
  return (
    <div>
      <nav>
        <div className="nav-wrapper">
          <Link to="/">GoodPawies</Link>
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li><Link to="/QrPage">QR</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/qr" element={<QrPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrarse" element={<RegisterPage />} />
      </Routes>
    </div>
  );
}

export default App;
