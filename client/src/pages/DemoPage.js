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
    { id: 'navigation', icon: 'menu', label: 'Navigation' },
    { id: 'avatars', icon: 'account_circle', label: 'Avatars' },
    { id: 'badges', icon: 'verified', label: 'Badges' },
    { id: 'loaders', icon: 'hourglass_empty', label: 'Loaders' },
    { id: 'alerts', icon: 'notifications', label: 'Alerts' },
    { id: 'states', icon: 'feedback', label: 'States' },
    { id: 'home', icon: 'home', label: 'Home Components' },
    { id: 'pet-profile', icon: 'pets', label: 'Pet Profile' },
    { id: 'chat', icon: 'chat', label: 'Chat Interface' },
    { id: 'modals', icon: 'window', label: 'Modals' },
    { id: 'layout', icon: 'grid_view', label: 'Layout & Grid' },
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
                  if (isMobile) toggleSidebar();
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
// --- Navigation Section ---
const NavigationSection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">🧭 Navigation & Sidebar</h2>
    <p className="section-desc">standard sidebar navigation component.</p>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Sidebar Component</h3></div>
      <div className="card-body bg-light p-0" style={{ height: '600px', position: 'relative', overflow: 'hidden' }}>

        {/* Sidebar Demo Container - Overriding fixed position for demo */}
        <div className="navbar-sidebar open" style={{ position: 'absolute', height: '100%', boxShadow: 'none', borderRight: '1px solid #e1e4e8' }}>
          <div className="sidebar-header-section">
            <div className="sidebar-user-card">
              <div className="avatar avatar-md avatar-bordered">
                <img src="/default-avatar.png" alt="User" />
              </div>
              <div className="sidebar-user-details">
                <span className="sidebar-username">UserName</span>
                <span className="sidebar-email text-xs text-muted">UserEmail@mail.com</span>
              </div>
            </div>
          </div>

          <ul className="navbar-menu">
            <li className="menu-section-title">Main Menu</li>
            <li>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a className="active" href="#demo" onClick={(e) => e.preventDefault()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                Home
              </a>
            </li>
            <li>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#demo" onClick={(e) => e.preventDefault()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                AI Chat
              </a>
            </li>

            <li className="menu-section-title">Pet Management</li>
            <li>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#demo" onClick={(e) => e.preventDefault()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                Add New Pet
              </a>
            </li>
            <li>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#demo" onClick={(e) => e.preventDefault()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                My Profile & Pets
              </a>
            </li>

            <li className="menu-section-title">More</li>
            <li>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#demo" onClick={(e) => e.preventDefault()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                Demo
              </a>
            </li>
          </ul>

          <div className="sidebar-footer-section">
            <button className="sidebar-logout-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Log Out
            </button>
          </div>
        </div>

        {/* Mock Content Background */}
        <div style={{ marginLeft: '280px', padding: '2rem' }}>
          <h2 className="text-2xl font-bold text-gray-800">Page Content Area</h2>
          <p className="text-gray-500 mt-2">The sidebar pushes content or overlays it depending on the viewport.</p>
        </div>
      </div>
    </div>
  </div>
);

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
      case 'avatars': return <AvatarsSection />;
      case 'badges': return <BadgesSection />;
      case 'loaders': return <LoadersSection />;
      case 'alerts': return <AlertsSection />;
      case 'states': return <StatesSection />;
      case 'home': return <HomeComponentsSection />;
      case 'pet-profile': return <PetProfileComponentsSection />;
      case 'chat': return <ChatComponentsSection />;
      case 'modals': return <ModalsSection showToast={showToast} />;
      case 'layout': return <LayoutSection />;
      case 'utilities': return <UtilitiesSection />;
      case 'animations': return <AnimationsSection />;
      case 'navigation': return <NavigationSection />;
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
              <div className="form-floating mb-3">
                <input type="password" className="form-control" id="float4" placeholder="Password with Toggle" defaultValue="secret123" />
                <label htmlFor="float4">Password with Toggle</label>
                <button type="button" className="btn btn-link password-toggle" aria-label="Show password">
                  <i className="material-icons">visibility</i>
                </button>
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

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Card Variants</h3></div>
      <div className="card-body bg-light">
        <h4 className="text-sm font-semibold mb-3">Action Cards</h4>
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card-action">
              <div className="card-icon">🚀</div>
              <h3 className="card-title text-lg">Launch</h3>
              <p className="card-text">Start a new project</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card-action card-primary">
              <div className="card-icon">⭐</div>
              <h3 className="card-title text-lg text-white">Upgrade</h3>
              <p className="card-text text-white opacity-90">Get more features</p>
            </div>
          </div>
        </div>

        <h4 className="text-sm font-semibold mb-3">Feature Cards</h4>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card-feature">
              <div className="feature-icon">🛡️</div>
              <h3 className="card-title text-lg">Secure</h3>
              <p className="card-text">Enterprise grade security</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stats-card card h-100 p-4 d-flex flex-column justify-content-center text-center">
              <p className="stats-number">85%</p>
              <p className="stats-label">Growth</p>
            </div>
          </div>
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


// --- Avatars Section ---
const AvatarsSection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">👤 Avatars</h2>
    <p className="section-desc">Avatar components for user and pet profile images with multiple sizes and styles.</p>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Sizes</h3></div>
      <div className="card-body d-flex flex-wrap gap-4 align-items-end">
        <div className="text-center">
          <div className="avatar avatar-xs avatar-initials">XS</div>
          <code className="d-block mt-2 text-xs">24px</code>
        </div>
        <div className="text-center">
          <div className="avatar avatar-sm avatar-initials">SM</div>
          <code className="d-block mt-2 text-xs">32px</code>
        </div>
        <div className="text-center">
          <div className="avatar avatar-md avatar-initials">MD</div>
          <code className="d-block mt-2 text-xs">40px</code>
        </div>
        <div className="text-center">
          <div className="avatar avatar-lg avatar-initials">LG</div>
          <code className="d-block mt-2 text-xs">64px</code>
        </div>
        <div className="text-center">
          <div className="avatar avatar-xl avatar-initials">XL</div>
          <code className="d-block mt-2 text-xs">120px</code>
        </div>
        <div className="text-center">
          <div className="avatar avatar-2xl avatar-initials">2XL</div>
          <code className="d-block mt-2 text-xs">150px</code>
        </div>
      </div>
    </div>

    <div className="row">
      <div className="col-md-6 mb-4">
        <div className="card h-100">
          <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Bordered Variants</h3></div>
          <div className="card-body d-flex gap-4 align-items-center">
            <div className="text-center">
              <div className="avatar avatar-lg avatar-initials avatar-bordered">A</div>
              <p className="text-xs mt-2 mb-0">.avatar-bordered</p>
            </div>
            <div className="text-center">
              <div className="avatar avatar-lg avatar-initials avatar-bordered-thick">B</div>
              <p className="text-xs mt-2 mb-0">.avatar-bordered-thick</p>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-4">
        <div className="card h-100">
          <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Avatar Group</h3></div>
          <div className="card-body">
            <div className="avatar-group">
              <div className="avatar avatar-md avatar-initials">A</div>
              <div className="avatar avatar-md avatar-initials" style={{ background: 'var(--color-primary)' }}>B</div>
              <div className="avatar avatar-md avatar-initials" style={{ background: 'var(--color-secondary)' }}>C</div>
              <div className="avatar avatar-md avatar-initials" style={{ background: 'var(--color-success)' }}>D</div>
            </div>
            <code className="d-block mt-3">.avatar-group</code>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Badges Section ---
const BadgesSection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">🏷️ Badges</h2>
    <p className="section-desc">Inline status indicators, tags, and labels.</p>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Status Badges</h3></div>
      <div className="card-body d-flex flex-wrap gap-3">
        <span className="badge badge-status badge-success">Success</span>
        <span className="badge badge-status badge-warning">Warning</span>
        <span className="badge badge-status badge-danger">Danger</span>
        <span className="badge badge-status badge-info">Info</span>
      </div>
    </div>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Pill & Base Badges</h3></div>
      <div className="card-body d-flex flex-wrap gap-3 align-items-center">
        <span className="badge">Default</span>
        <span className="badge badge-pill">Pill Badge</span>
        <span className="badge badge-pill">
          <i className="material-icons" style={{ fontSize: '14px', marginRight: '4px' }}>pets</i>
          With Icon
        </span>
      </div>
    </div>
  </div>
);

// --- Loaders Section ---
const LoadersSection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">⏳ Loaders</h2>
    <p className="section-desc">Loading indicators for async operations and page loads.</p>

    <div className="row">
      <div className="col-md-4 mb-4">
        <div className="card h-100">
          <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Spinner Custom</h3></div>
          <div className="card-body d-flex justify-content-center align-items-center" style={{ minHeight: '120px' }}>
            <div className="spinner-custom">
              <div></div><div></div><div></div><div></div>
            </div>
          </div>
          <div className="card-footer text-center">
            <code>.spinner-custom</code>
          </div>
        </div>
      </div>
      <div className="col-md-4 mb-4">
        <div className="card h-100">
          <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Pulse Loader</h3></div>
          <div className="card-body d-flex justify-content-center align-items-center" style={{ minHeight: '120px' }}>
            <div className="pulse-loader">
              <span className="pulse-dot"></span>
              <span className="pulse-dot"></span>
              <span className="pulse-dot"></span>
            </div>
          </div>
          <div className="card-footer text-center">
            <code>.pulse-loader</code>
          </div>
        </div>
      </div>
      <div className="col-md-4 mb-4">
        <div className="card h-100">
          <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Loading Spinner</h3></div>
          <div className="card-body d-flex justify-content-center align-items-center" style={{ minHeight: '120px' }}>
            <div className="loading-spinner"></div>
          </div>
          <div className="card-footer text-center">
            <code>.loading-spinner</code>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Alerts Section ---
const AlertsSection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">🔔 Alerts</h2>
    <p className="section-desc">Notification and feedback components for user communication.</p>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Alert Variants</h3></div>
      <div className="card-body">
        <div className="alert alert-success">
          <i className="material-icons">check_circle</i>
          <span>Success! Your changes have been saved.</span>
        </div>
        <div className="alert alert-warning">
          <i className="material-icons">warning</i>
          <span>Warning: Please review before continuing.</span>
        </div>
        <div className="alert alert-danger">
          <i className="material-icons">error</i>
          <span>Error: Something went wrong. Please try again.</span>
        </div>
        <div className="alert alert-info">
          <i className="material-icons">info</i>
          <span>Info: This is an informational message.</span>
        </div>
      </div>
    </div>
  </div>
);

// --- States Section ---
const StatesSection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">📊 States</h2>
    <p className="section-desc">Content states for loading, error, empty, and success scenarios.</p>

    <div className="row">
      <div className="col-md-6 mb-4">
        <div className="card h-100">
          <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Empty State</h3></div>
          <div className="card-body">
            <div className="empty-state">
              <i className="material-icons text-4xl text-muted mb-3">inbox</i>
              <h3>No items found</h3>
              <p>There's nothing here yet. Add your first item to get started.</p>
              <button className="btn btn-primary btn-sm">Add Item</button>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-4">
        <div className="card h-100">
          <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Status Boxes</h3></div>
          <div className="card-body">
            <div className="success-state mb-3">
              <i className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px' }}>check_circle</i>
              Operation completed successfully!
            </div>
            <div className="warning-state mb-3">
              <i className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px' }}>warning</i>
              Proceed with caution.
            </div>
            <div className="info-state">
              <i className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px' }}>info</i>
              Here's some helpful info.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Form Feedback</h3></div>
      <div className="card-body">
        <div className="valid-feedback show mb-3">This field is valid!</div>
        <div className="invalid-feedback show">Please enter a valid value.</div>
      </div>
    </div>
  </div>
);

// --- Layout Section ---
const LayoutSection = () => (
  <div className="animate-fade-in">
    <h2 className="section-title">📐 Layout & Grid</h2>
    <p className="section-desc">Grid system, flexbox utilities, and spacing helpers.</p>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Grid System</h3></div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-6"><div className="p-3 bg-primary text-white rounded text-center">col-6</div></div>
          <div className="col-6"><div className="p-3 bg-secondary text-white rounded text-center">col-6</div></div>
        </div>
        <div className="row mb-3">
          <div className="col-md-4"><div className="p-3 bg-primary text-white rounded text-center">col-md-4</div></div>
          <div className="col-md-4"><div className="p-3 bg-secondary text-white rounded text-center">col-md-4</div></div>
          <div className="col-md-4"><div className="p-3 bg-primary text-white rounded text-center">col-md-4</div></div>
        </div>
      </div>
    </div>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Flexbox Utilities</h3></div>
      <div className="card-body">
        <div className="d-flex justify-content-between p-3 bg-light rounded mb-3">
          <span className="badge badge-pill">Start</span>
          <span className="badge badge-pill">Between</span>
          <span className="badge badge-pill">End</span>
        </div>
        <code>.d-flex .justify-content-between</code>

        <div className="d-flex flex-column gap-2 p-3 bg-light rounded mt-4">
          <span className="badge badge-pill">Item 1</span>
          <span className="badge badge-pill">Item 2</span>
          <span className="badge badge-pill">Item 3</span>
        </div>
        <code>.d-flex .flex-column .gap-2</code>
      </div>
    </div>

    <div className="card mb-5">
      <div className="card-header bg-white"><h3 className="text-lg font-bold m-0">Spacing Utilities</h3></div>
      <div className="card-body bg-light">
        <div className="row">
          <div className="col-4">
            <h4 className="text-sm font-semibold mb-2">Margin (m-*)</h4>
            <div className="bg-white p-2 mb-1"><code>.m-0</code></div>
            <div className="bg-white p-2 mb-1"><code>.m-1</code> (4px)</div>
            <div className="bg-white p-2 mb-1"><code>.m-2</code> (8px)</div>
            <div className="bg-white p-2 mb-1"><code>.m-3</code> (16px)</div>
            <div className="bg-white p-2 mb-1"><code>.m-4</code> (24px)</div>
            <div className="bg-white p-2"><code>.m-5</code> (32px)</div>
          </div>
          <div className="col-4">
            <h4 className="text-sm font-semibold mb-2">Gap (gap-*)</h4>
            <div className="bg-white p-2 mb-1"><code>.gap-1</code> (4px)</div>
            <div className="bg-white p-2 mb-1"><code>.gap-2</code> (8px)</div>
            <div className="bg-white p-2 mb-1"><code>.gap-3</code> (16px)</div>
            <div className="bg-white p-2 mb-1"><code>.gap-4</code> (24px)</div>
            <div className="bg-white p-2 mb-1"><code>.gap-5</code> (32px)</div>
            <div className="bg-white p-2"><code>.gap-6</code> (48px)</div>
          </div>
          <div className="col-4">
            <h4 className="text-sm font-semibold mb-2">Grid Gutters (g-*)</h4>
            <div className="bg-white p-2 mb-1"><code>.g-0</code> (0px)</div>
            <div className="bg-white p-2 mb-1"><code>.g-1</code> (4px)</div>
            <div className="bg-white p-2 mb-1"><code>.g-2</code> (8px)</div>
            <div className="bg-white p-2 mb-1"><code>.g-3</code> (16px)</div>
            <div className="bg-white p-2 mb-1"><code>.g-4</code> (24px)</div>
            <div className="bg-white p-2"><code>.g-5</code> (48px)</div>
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
                className={`btn ${activeModal === 'danger' ? 'btn-danger' : 'btn-primary'} `}
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
