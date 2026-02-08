import React, { useState } from 'react';

// --- Sidebar Navigation Component ---
const SidebarNav = ({ activeSection, setActiveSection, isCollapsed, toggleSidebar, isMobile }) => {
  const sections = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'colors', icon: 'palette', label: 'Colors' },
    { id: 'typography', icon: 'text_fields', label: 'Typography' },
    { id: 'buttons', icon: 'smart_button', label: 'Buttons' },
    { id: 'forms', icon: 'feed', label: 'Forms' },
    { id: 'cards', icon: 'style', label: 'Cards' },
    { id: 'home', icon: 'home', label: 'Home Components' },
    { id: 'pet-profile', icon: 'pets', label: 'Pet Profile' },
    { id: 'chat', icon: 'chat', label: 'Chat Interface' },
    { id: 'modals', icon: 'window', label: 'Modals' },
    { id: 'utilities', icon: 'build', label: 'Utilities' },
    { id: 'animations', icon: 'animation', label: 'Animations' },
  ];

  return (
    <>
      <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile && !isCollapsed ? 'open' : ''}`}>
        <div className="sidebar-header">
          {!isCollapsed && (
            <div className="sidebar-brand">
              <h1 className="brand-title">GoodPawies</h1>
              <p className="brand-subtitle">Design System</p>
            </div>
          )}
          <button
            className="sidebar-toggle btn-icon"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i className="material-icons">{isCollapsed ? 'chevron_right' : 'menu_open'}</i>
          </button>
        </div>

        <nav className="sidebar-content">
          <div className="sidebar-section">
            {!isCollapsed && <h4 className="sidebar-section-title">Components</h4>}
            {sections.map(section => (
              <button
                key={section.id}
                className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(section.id);
                  if (isMobile) toggleSidebar(); // Close on click for mobile
                }}
                title={isCollapsed ? section.label : ''}
              >
                <i className="material-icons">{section.icon}</i>
                {!isCollapsed && <span>{section.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-card">
            <div className="user-avatar-placeholder bg-primary text-white rounded-circle d-flex align-items-center justify-content-center">
              <i className="material-icons">person</i>
            </div>
            {!isCollapsed && (
              <div className="user-details">
                <span className="user-name">Demo User</span>
                <span className="user-role">Administrator</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90
          }}
        />
      )}
    </>
  );
};

// --- Main Content Container ---
const DemoPage = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 992;
      setIsMobile(mobile);
      if (mobile) setIsSidebarCollapsed(true); // Default to collapsed/closed on mobile
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Init

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'colors': return <ColorsSection showToast={showToast} />;
      case 'typography': return <TypographySection />;
      case 'buttons': return <ButtonsSection showToast={showToast} />;
      case 'forms': return <FormsSection showToast={showToast} />;
      case 'cards': return <CardsSection />;
      case 'home': return <HomeComponentsSection />;
      case 'pet-profile': return <PetProfileComponentsSection />;
      case 'chat': return <ChatComponentsSection />;
      case 'modals': return <ModalsSection showToast={showToast} />;
      case 'utilities': return <UtilitiesSection />;
      case 'animations': return <AnimationsSection />;
      default: return <DashboardSection />;
    }
  };

  return (
    <div className="demo-layout">
      <SidebarNav
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      <main
        className="demo-content"
        style={{
          marginLeft: isMobile ? 0 : (isSidebarCollapsed ? '80px' : '280px'),
          transition: 'margin-left 0.3s ease',
          width: 'auto'
        }}
      >
        <div className="content-container">
          {isMobile && (
            <button className="btn btn-icon mb-3 d-lg-none" onClick={toggleSidebar}>
              <i className="material-icons">menu</i>
            </button>
          )}
          {renderContent()}
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`demo-toast toast-${toast.type} animate-slide-in-right`}>
          <i className="material-icons">{toast.type === 'success' ? 'check_circle' : 'info'}</i>
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
};

// --- Placeholder Sections (will populate in next steps) ---
const DashboardSection = () => (
  <div className="animate-fade-in-up">
    <div className="hero-card p-5 rounded-xl bg-white shadow-lg mb-5 text-center">
      <h1 className="text-4xl font-bold mb-3" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Welcome to GoodPawies UI
      </h1>
      <p className="text-lg text-secondary mb-4">
        A comprehensive design system for building beautiful, accessible, and consistent user interfaces.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <div className="stats-item p-3 bg-secondary bg-opacity-10 rounded-lg">
          <h3 className="text-2xl font-bold text-primary">40+</h3>
          <p className="text-sm text-secondary">Components</p>
        </div>
        <div className="stats-item p-3 bg-secondary bg-opacity-10 rounded-lg">
          <h3 className="text-2xl font-bold text-primary">15+</h3>
          <p className="text-sm text-secondary">Utility Classes</p>
        </div>
        <div className="stats-item p-3 bg-secondary bg-opacity-10 rounded-lg">
          <h3 className="text-2xl font-bold text-primary">∞</h3>
          <p className="text-sm text-secondary">Possibilities</p>
        </div>
      </div>
    </div>
  </div>
);

// --- Colors Section ---
const ColorsSection = ({ showToast }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${text} to clipboard!`);
  };

  const ColorCard = ({ name, colorVar, hex }) => (
    <div
      className="color-card hover-lift"
      onClick={() => copyToClipboard(colorVar)}
      title="Click to copy variable"
    >
      <div className="color-swatch" style={{ background: `var(${colorVar})` }}></div>
      <div className="color-info">
        <p className="color-name">{name}</p>
        <code className="color-var">{colorVar}</code>
        <p className="color-hex">{hex}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h2 className="section-title">🎨 Colors</h2>
      <p className="section-desc">The GoodPawies color palette consists of primary brand colors, functional status colors, and neutral grays.</p>

      <h3 className="subsection-title">Brand Colors</h3>
      <div className="grid-colors">
        <ColorCard name="Primary" colorVar="--color-primary" hex="#f1889b" />
        <ColorCard name="Primary Dark" colorVar="--color-primary-dark" hex="#e06b85" />
        <ColorCard name="Primary Light" colorVar="--color-primary-light" hex="#f5a3b5" />
        <ColorCard name="Secondary" colorVar="--color-secondary" hex="#667eea" />
        <ColorCard name="Secondary Dark" colorVar="--color-secondary-dark" hex="#764ba2" />
        <ColorCard name="Accent" colorVar="--color-accent" hex="#f093fb" />
      </div>

      <h3 className="subsection-title mt-5">Status Colors</h3>
      <div className="grid-colors">
        <ColorCard name="Success" colorVar="--color-success" hex="#28a745" />
        <ColorCard name="Warning" colorVar="--color-warning" hex="#ffc107" />
        <ColorCard name="Danger" colorVar="--color-danger" hex="#dc3545" />
        <ColorCard name="Info" colorVar="--color-info" hex="#17a2b8" />
      </div>

      <h3 className="subsection-title mt-5">Gradients</h3>
      <div className="grid-gradients">
        <div className="gradient-card" onClick={() => copyToClipboard('var(--gradient-primary)')} style={{ background: 'var(--gradient-primary)' }}>
          <span>Primary Gradient</span>
        </div>
        <div className="gradient-card" onClick={() => copyToClipboard('var(--gradient-secondary)')} style={{ background: 'var(--gradient-secondary)' }}>
          <span>Secondary Gradient</span>
        </div>
        <div className="gradient-card text-dark" onClick={() => copyToClipboard('var(--gradient-tertiary)')} style={{ background: 'var(--gradient-tertiary)' }}>
          <span className="text-dark">Tertiary Gradient</span>
        </div>
      </div>

    </div>
  );
};

// --- Typography Section ---
const TypographySection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">📝 Typography</h2>
    <p className="section-desc">Typography choices that ensure readability and hierarchy across the application.</p>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Font Families</h3></div>
      <div className="card-body">
        <div className="mb-4">
          <p className="text-sm text-secondary mb-1">Primary Font (System UI)</p>
          <div className="p-4 bg-light rounded border border-light font-sans text-2xl">
            Ag The quick brown fox jumps over the lazy dog
          </div>
          <code className="d-block mt-2 text-xs">var(--font-family-primary)</code>
        </div>
        <div>
          <p className="text-sm text-secondary mb-1">Secondary Font (Poppins)</p>
          <div className="p-4 bg-light rounded border border-light font-serif text-2xl" style={{ fontFamily: 'var(--font-family-secondary)' }}>
            Ag The quick brown fox jumps over the lazy dog
          </div>
          <code className="d-block mt-2 text-xs">var(--font-family-secondary)</code>
        </div>
      </div>
    </div>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Type Scale</h3></div>
      <div className="card-body">
        <div className="type-row">
          <span className="type-label">4xl (36px)</span>
          <p className="type-example text-4xl">H1. The quick brown fox</p>
        </div>
        <div className="type-row">
          <span className="type-label">3xl (30px)</span>
          <p className="type-example text-3xl">H2. The quick brown fox</p>
        </div>
        <div className="type-row">
          <span className="type-label">2xl (24px)</span>
          <p className="type-example text-2xl">H3. The quick brown fox</p>
        </div>
        <div className="type-row">
          <span className="type-label">xl (20px)</span>
          <p className="type-example text-xl">H4. The quick brown fox</p>
        </div>
        <div className="type-row">
          <span className="type-label">lg (18px)</span>
          <p className="type-example text-lg">Large paragraph text</p>
        </div>
        <div className="type-row">
          <span className="type-label">base (16px)</span>
          <p className="type-example text-base">Base paragraph text</p>
        </div>
        <div className="type-row">
          <span className="type-label">sm (14px)</span>
          <p className="type-example text-sm">Small text / captions</p>
        </div>
        <div className="type-row">
          <span className="type-label">xs (12px)</span>
          <p className="type-example text-xs">Extra small text</p>
        </div>
      </div>
    </div>

  </div>
);
// --- Buttons Section ---
const ButtonsSection = ({ showToast }) => (
  <div className="animate-fade-in">
    <h2 className="section-title">🔘 Buttons</h2>
    <p className="section-desc">Interactive elements that trigger actions, with support for multiple sizes, states, and styles.</p>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Solid Buttons</h3></div>
      <div className="card-body">
        <div className="d-flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => showToast('Primary clicked')}>Primary</button>
          <button className="btn btn-secondary" onClick={() => showToast('Secondary clicked')}>Secondary</button>
          <button className="btn btn-success" onClick={() => showToast('Success clicked')}>Success</button>
          <button className="btn btn-warning" onClick={() => showToast('Warning clicked', 'info')}>Warning</button>
          <button className="btn btn-danger" onClick={() => showToast('Danger clicked', 'info')}>Danger</button>
        </div>
      </div>
    </div>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Outline Buttons</h3></div>
      <div className="card-body">
        <div className="d-flex flex-wrap gap-3">
          <button className="btn btn-outline-primary" onClick={() => showToast('Outline Primary')}>Primary</button>
          <button className="btn btn-outline-secondary" onClick={() => showToast('Outline Secondary')}>Secondary</button>
          <button className="btn btn-outline-danger" onClick={() => showToast('Outline Danger')}>Danger</button>
        </div>
      </div>
    </div>

    <div className="row">
      <div className="col-md-6 mb-4">
        <div className="card h-100">
          <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Sizes</h3></div>
          <div className="card-body d-flex flex-column gap-3 align-items-start">
            <button className="btn btn-primary btn-sm">Small Button</button>
            <button className="btn btn-primary">Default Button</button>
            <button className="btn btn-primary btn-lg">Large Button</button>
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-4">
        <div className="card h-100">
          <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Special Buttons</h3></div>
          <div className="card-body d-flex flex-wrap gap-3 align-items-center">
            <button className="btn btn-gradient">Gradient</button>
            <button className="btn btn-ghost">Ghost</button>
            <button className="btn btn-link">Link Button</button>
            <button className="btn btn-primary btn-loading" style={{ width: '120px' }} onClick={(e) => e.preventDefault()}>Loading</button>
            <button className="btn btn-primary" disabled>Disabled</button>
          </div>
        </div>
      </div>
    </div>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Icon & Floating Buttons</h3></div>
      <div className="card-body d-flex flex-wrap gap-4 align-items-center">
        <button className="btn btn-primary"><i className="material-icons">send</i> Send</button>
        <button className="btn btn-outline-primary"><i className="material-icons">delete</i> Delete</button>

        <div className="vr mx-3"></div>

        <button className="btn-icon"><i className="material-icons">favorite</i></button>
        <button className="btn-icon"><i className="material-icons">share</i></button>

        <div className="vr mx-3"></div>

        <button className="btn-floating btn-primary"><i className="material-icons">add</i></button>
        <button className="btn-floating btn-secondary"><i className="material-icons">edit</i></button>
      </div>
    </div>
  </div>
);

// --- Forms Section ---
const FormsSection = ({ showToast }) => {
  const [formData, setFormData] = useState({ name: '', email: '' });

  return (
    <div className="animate-fade-in">
      <h2 className="section-title">📝 Forms</h2>
      <p className="section-desc">Input fields, selects, and controls with validation states.</p>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Basic Inputs</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                <small className="form-text">We'll never share your email.</small>
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-control" rows="3" placeholder="Type your message..."></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Floating Labels</h3></div>
            <div className="card-body">
              <div className="form-floating mb-3">
                <input type="text" className="form-control" id="float1" placeholder="Username" />
                <label htmlFor="float1">Username</label>
              </div>
              <div className="form-floating mb-3">
                <input type="password" className="form-control" id="float2" placeholder="Password" />
                <label htmlFor="float2">Password</label>
              </div>
              <div className="form-floating">
                <select className="form-select" id="float3">
                  <option value="1">Option One</option>
                  <option value="2">Option Two</option>
                </select>
                <label htmlFor="float3">Select Option</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Switches & Checks</h3></div>
        <div className="card-body d-flex flex-wrap gap-5">
          <div>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="check1" defaultChecked />
              <label className="form-check-label" htmlFor="check1">Checked Checkbox</label>
            </div>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="check2" />
              <label className="form-check-label" htmlFor="check2">Unchecked</label>
            </div>
          </div>

          <div>
            <div className="form-check">
              <input type="radio" className="form-check-input" name="radio" id="radio1" defaultChecked />
              <label className="form-check-label" htmlFor="radio1">Radio Option 1</label>
            </div>
            <div className="form-check">
              <input type="radio" className="form-check-input" name="radio" id="radio2" />
              <label className="form-check-label" htmlFor="radio2">Radio Option 2</label>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
            <span>Toggle Switch</span>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Card Inputs</h3></div>
        <div className="card-body">
          <div className="card-input-grid">
            <label className="card-input">
              <input type="checkbox" className="card-input-element" defaultChecked />
              <div className="card-input-content">
                <span className="card-input-icon material-icons">pets</span>
                <span className="card-input-label">Dog</span>
              </div>
            </label>
            <label className="card-input">
              <input type="checkbox" className="card-input-element" />
              <div className="card-input-content">
                <span className="card-input-icon material-icons">cruelty_free</span>
                <span className="card-input-label">Cat</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Cards Section ---
const CardsSection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">🎴 Cards</h2>
    <p className="section-desc">Flexible containers for grouping related content.</p>

    <div className="row">
      <div className="col-md-4 mb-4">
        <div className="card h-100">
          <div className="card-header">Header</div>
          <div className="card-body">
            <h5 className="card-title">Basic Card</h5>
            <p className="card-text">Standard card with header, body content, and footer.</p>
          </div>
          <div className="card-footer text-muted">Footer info</div>
        </div>
      </div>

      <div className="col-md-4 mb-4">
        <div className="card card-interactive h-100">
          <div className="card-body">
            <h5 className="card-title text-primary">Interactive Card</h5>
            <p className="card-text">Hover over me to see the lift effect. Clickable card pattern.</p>
            <button className="btn btn-outline-primary btn-sm mt-2">Action</button>
          </div>
        </div>
      </div>

      <div className="col-md-4 mb-4">
        <div className="stats-card card h-100 d-flex flex-column justify-content-center">
          <p className="stats-number">85%</p>
          <p className="stats-label">Growth</p>
        </div>
      </div>
    </div>

    <div className="row mt-4">
      <div className="col-md-5">
        <div className="profile-card card">
          <div className="bg-white rounded-full p-1 mx-auto mb-3" style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="material-icons text-4xl text-primary">pets</i>
          </div>
          <h5 className="card-title">Pet Profile</h5>
          <p className="card-text">Special card style for profiles</p>
        </div>
      </div>
      <div className="col-md-7">
        <div className="card card-horizontal h-100 d-flex flex-row align-items-center p-4">
          <div className="p-3 bg-secondary bg-opacity-10 rounded-lg mr-4">
            <i className="material-icons text-3xl text-secondary">analytics</i>
          </div>
          <div>
            <h5 className="font-bold text-xl mb-1">Flex Row Layout</h5>
            <p className="text-secondary m-0">Easy to create horizontal card layouts using flex utilities.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);


// --- Home Components Section ---
const HomeComponentsSection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">🏠 Home Components</h2>
    <p className="section-desc">Key sections from the landing page: Hero, Actions, Features, Tips.</p>

    {/* 1. Hero Component */}
    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Hero Section</h3></div>
      <div className="card-body p-0">
        <section className="hero hero-sm">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome back, <span className="highlight">Pet Parent</span>!
            </h1>
            <p className="hero-subtitle">
              Your AI-powered veterinary assistant is ready to help.
            </p>
          </div>
        </section>
      </div>
    </div>

    {/* 2. Quick Actions */}
    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Action Cards</h3></div>
      <div className="card-body bg-light">
        <div className="grid-responsive-sm">
          <div className="card-action">
            <div className="card-icon">
              <span className="material-icons">chat</span>
            </div>
            <h3>Start AI Chat</h3>
            <p>Get instant veterinary guidance for your pets</p>
            <span className="btn-text text-primary font-weight-bold">Open Chat →</span>
          </div>

          <div className="card-action card-primary">
            <div className="card-icon">
              <span className="material-icons">add</span>
            </div>
            <h3>Add New Pet</h3>
            <p>Register a new furry friend to your profile</p>
            <span className="btn-text text-white font-weight-bold">Add Pet →</span>
          </div>
        </div>
      </div>
    </div>

    {/* 3. Features Grid */}
    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Feature Items</h3></div>
      <div className="card-body">
        <div className="grid-responsive-sm">
          <div className="card-feature">
            <div className="feature-icon">
              <span className="material-icons">search</span>
            </div>
            <h4>Symptom Analysis</h4>
            <p>Describe symptoms and get AI-powered analysis.</p>
          </div>

          <div className="card-feature">
            <div className="feature-icon">
              <span className="material-icons">pets</span>
            </div>
            <h4>Dogs & Cats Expert</h4>
            <p>Specialized AI trained on veterinary knowledge.</p>
          </div>

          <div className="card-feature">
            <div className="feature-icon">
              <span className="material-icons">schedule</span>
            </div>
            <h4>24/7 Available</h4>
            <p>Get immediate responses any time of day or night.</p>
          </div>
        </div>
      </div>
    </div>

    {/* 4. Tips Card */}
    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Tips Card</h3></div>
      <div className="card-body">
        <div className="card-tip">
          <div className="tip-icon">
            <span className="material-icons">lightbulb</span>
          </div>
          <div className="tip-content">
            <h3>Pro Tip</h3>
            <p>
              When describing your pet's symptoms, include details like: how long the symptoms have been present,
              your pet's age and breed, any changes in behavior or appetite.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Pet Profile Components Section ---
const PetProfileComponentsSection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">🐾 Pet Profile Components</h2>
    <p className="section-desc">Components specific to pet profiles and management.</p>

    <div className="row g-4 mb-5">
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Pet Avatar</h3></div>
          <div className="card-body d-flex flex-column align-items-center justify-content-center">
            <img
              src="/default-avatar.png"
              alt="Pet Avatar Info"
              className="pet-avatar mb-3"
              style={{ width: '150px', height: '150px' }} // inline for demo only as valid src might be missing
              onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
            />
            <code className="d-block mt-3">.pet-avatar</code>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Toggle Cards</h3></div>
          <div className="card-body">
            <div className="toggle-grid">
              <label className="toggle-card">
                <input type="checkbox" className="toggle-card-input" defaultChecked />
                <div className="toggle-card-content">
                  <i className="material-icons toggle-card-icon">health_and_safety</i>
                  <span className="toggle-card-label">Vaccinated</span>
                </div>
              </label>
              <label className="toggle-card">
                <input type="checkbox" className="toggle-card-input" />
                <div className="toggle-card-content">
                  <i className="material-icons toggle-card-icon">medical_services</i>
                  <span className="toggle-card-label">Sterilized</span>
                </div>
              </label>
            </div>
            <div className="mt-3 text-center">
              <code>.toggle-card</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Chat Components Section ---
const ChatComponentsSection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">💬 Chat Interface</h2>
    <p className="section-desc">Components for the AI veterinary chat experience.</p>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Message Bubbles</h3></div>
      <div className="card-body bg-light p-4">
        <div className="d-flex flex-column gap-3" style={{ maxWidth: '600px', margin: '0 auto' }}>

          {/* AI Message */}
          <div className="message">
            <div className="message-avatar">
              <i className="material-icons" style={{ fontSize: '18px' }}>smart_toy</i>
            </div>
            <div className="message-content">
              <p className="m-0">Hello! I'm your AI veterinary assistant. How can I help your pet today?</p>
              <span className="message-time">10:00 AM</span>
            </div>
          </div>

          {/* User Message */}
          <div className="message message-user">
            <div className="message-avatar">
              <i className="material-icons" style={{ fontSize: '18px' }}>person</i>
            </div>
            <div className="message-content">
              <p className="m-0 text-white">My dog seems to be limping on his left hind leg.</p>
              <span className="message-time text-white-50">10:01 AM</span>
            </div>
          </div>

          {/* Typing Indicator */}
          <div className="message">
            <div className="message-avatar">
              <i className="material-icons" style={{ fontSize: '18px' }}>smart_toy</i>
            </div>
            <div className="message-content bg-transparent shadow-none p-2">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Chat Input</h3></div>
      <div className="card-body p-0">
        <div className="chat-input-form border-0">
          <div className="chat-input-container">
            <input type="text" className="chat-input" placeholder="Type your message..." />
            <button className="chat-send-btn">
              <i className="material-icons">send</i>
            </button>
          </div>
          <p className="chat-disclaimer">
            <i className="material-icons" style={{ fontSize: '14px' }}>info</i>
            AI can make mistakes. Please consult a vet for emergencies.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// --- Modals Section ---
const ModalsSection = ({ showToast }) => {
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="animate-fade-in">
      <h2 className="section-title">🪟 Modals</h2>
      <p className="section-desc">Overlays for critical information or required user actions.</p>

      <div className="card mb-5">
        <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Live Demos</h3></div>
        <div className="card-body d-flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => setActiveModal('default')}>Default Modal</button>
          <button className="btn btn-danger" onClick={() => setActiveModal('danger')}>Danger Modal</button>
          <button className="btn btn-success" onClick={() => setActiveModal('success')}>Success Modal</button>
        </div>
      </div>

      {/* Modal Implementations */}
      {activeModal && (
        <div className="modal-overlay animate-fade-in" onClick={closeModal}>
          <div
            className={`modal-content animate-fade-in-up ${activeModal === 'danger' ? 'border-danger' : activeModal === 'success' ? 'border-success' : ''}`}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '500px', margin: 'auto', borderTopWidth: '4px' }}
          >
            <div className="modal-header">
              <h5 className="modal-title">
                {activeModal === 'default' && 'Confirm Action'}
                {activeModal === 'danger' && '⚠️ Destructive Action'}
                {activeModal === 'success' && '🎉 Success!'}
              </h5>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>
                {activeModal === 'default' && 'Are you sure you want to proceed with this action?'}
                {activeModal === 'danger' && 'This action cannot be undone. Please confirm you want to delete this item.'}
                {activeModal === 'success' && 'The operation completed successfully. You may close this window.'}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
              <button
                className={`btn ${activeModal === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => { closeModal(); showToast('Action confirmed!'); }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Utilities Section ---
const UtilitiesSection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">🛠️ Utilities</h2>
    <p className="section-desc">Helper classes for spacing, layout, shadows, and more.</p>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Shadows</h3></div>
      <div className="card-body d-flex flex-wrap gap-5 bg-light p-5">
        <div className="bg-white p-4 rounded shadow-sm">shadow-sm</div>
        <div className="bg-white p-4 rounded shadow">shadow</div>
        <div className="bg-white p-4 rounded shadow-lg">shadow-lg</div>
        <div className="bg-white p-4 rounded shadow-xl">shadow-xl</div>
      </div>
    </div>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Border Radius</h3></div>
      <div className="card-body d-flex flex-wrap gap-4 align-items-center bg-light p-5">
        <div className="bg-primary text-white p-4 rounded-sm">sm</div>
        <div className="bg-primary text-white p-4 rounded bg-opacity-75">base</div>
        <div className="bg-primary text-white p-4 rounded-lg bg-opacity-50">lg</div>
        <div className="bg-primary text-white p-4 rounded-xl bg-opacity-25">xl</div>
        <div className="bg-primary text-white p-4 rounded-full w-20 h-20 d-flex align-items-center justify-content-center">full</div>
      </div>
    </div>
  </div>
);

// --- Animations Section ---
const AnimationsSection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">✨ Animations</h2>
    <p className="section-desc">Consistent animations for entrances, emphasis, and loading states.</p>

    <div className="grid-animations">
      <div className="animation-demo-card">
        <div className="demo-box animate-fade-in">Fade In</div>
        <code>.animate-fade-in</code>
      </div>
      <div className="animation-demo-card">
        <div className="demo-box animate-fade-in-up">Fade In Up</div>
        <code>.animate-fade-in-up</code>
      </div>
      <div className="animation-demo-card">
        <div className="demo-box animate-pulse">Pulse</div>
        <code>.animate-pulse</code>
      </div>
      <div className="animation-demo-card">
        <div className="demo-box animate-bounce">Bounce</div>
        <code>.animate-bounce</code>
      </div>
      <div className="animation-demo-card">
        <div className="demo-box hover-lift transition-all">Hover Lift</div>
        <code>.hover-lift</code>
      </div>
    </div>
    {/* Removed inline style jsx here, migrated to _demo.css */}
  </div>
);

export default DemoPage;
