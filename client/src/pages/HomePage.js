import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Welcome Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-title">
            Welcome back, <span className="highlight">{user?.fullName || user?.username || 'Pet Parent'}</span>!
          </h1>
          <p className="home-subtitle">
            Your AI-powered veterinary assistant is ready to help with your dog or cat's health questions.
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="home-actions">
        <div className="home-container">
          <h2 className="section-title">Quick Actions</h2>
          <div className="action-cards">
            <Link to="/chat" className="action-card">
              <div className="action-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>Start AI Chat</h3>
              <p>Get instant veterinary guidance for your pets</p>
              <span className="action-btn">Open Chat →</span>
            </Link>



            <Link to="/profile" className="action-card">
              <div className="action-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>My Profile</h3>
              <p>View and manage your account</p>
              <span className="action-btn">View Profile →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features">
        <div className="home-container">
          <h2 className="section-title">How GoodPawies Helps You</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon-circle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h4>Symptom Analysis</h4>
              <p>Describe symptoms and get AI-powered analysis with possible causes and recommended actions.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-circle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h4>Dogs & Cats Expert</h4>
              <p>Specialized AI trained on veterinary knowledge specifically for dogs and cats.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-circle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h4>24/7 Available</h4>
              <p>Get immediate responses any time of day or night without waiting for appointments.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-circle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h4>Private & Secure</h4>
              <p>Your conversations are private. We prioritize your data security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="home-tips">
        <div className="home-container">
          <div className="tips-card">
            <div className="tips-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div className="tips-content">
              <h3>Pro Tip</h3>
              <p>
                When describing your pet's symptoms, include details like: how long the symptoms have been present,
                your pet's age and breed, any changes in behavior or appetite, and any recent environmental changes.
                The more details you provide, the better guidance the AI can offer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="home-disclaimer">
        <div className="home-container">
          <div className="disclaimer-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p>
              <strong>Important:</strong> GoodPawies provides general guidance and is not a substitute for professional
              veterinary care. Always consult a licensed veterinarian for medical emergencies or serious health concerns.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
