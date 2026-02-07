# GoodPawies Client - Source of Truth

> **Last Updated:** February 7, 2026  
> **React Version:** 19.1.1  
> **Build Tool:** Create React App 5.0.1

---

## 📁 Project Structure

```
client/
├── public/              # Static assets (index.html, favicon, etc.)
├── src/
│   ├── components/      # 8 reusable UI components
│   ├── contexts/        # 1 context (ErrorContext)
│   ├── hooks/           # 1 custom hook (useModal)
│   ├── icons/           # Icon assets
│   ├── pages/           # 16 page components (with subdirs)
│   │   ├── login/       # Login flows (1 file)
│   │   ├── profile/     # Profile-related pages (4 files)
│   │   └── register/    # Registration flows (3 files)
│   ├── styles/          # ITCSS CSS architecture (27 CSS files)
│   │   ├── base/        # Foundation (6 files)
│   │   ├── components/  # Component styles (9 files)
│   │   ├── pages/       # Page-specific (6 files)
│   │   └── utils/       # Utilities (2 files)
│   └── utils/           # 4 utility modules
├── package.json
└── .env                 # Environment configuration
```

---

## 🧩 Architecture Overview

### Component Architecture
| Layer | Files | Purpose |
|-------|-------|---------|
| **App.js** | 1 | Root component with routing, providers |
| **Components** | 8 | Reusable UI: Navbar, Footer, Modal, etc. |
| **Pages** | 16 | Route-specific page components |
| **Contexts** | 1 | ErrorContext for global error/modal handling |
| **Hooks** | 1 | useModal for modal state management |
| **Utils** | 4 | api.js, auth.js, errorHandler.js, validation.js |

### CSS Architecture (ITCSS Methodology)
Import order in `main.css`:
1. **Variables** → `base/_variables.css`
2. **Framework** → `base/_framework-integration.css` *(to be removed)*
3. **Reset** → `base/_reset.css`
4. **Typography** → `base/_typography.css`
5. **Layout** → `base/_layout.css`, `base/_animations.css`
6. **Components** → `components/*.css` (9 files)
7. **Pages** → `pages/*.css` (6 files)
8. **Utilities** → `utils/*.css` (2 files)

### Provider Hierarchy
```jsx
<ErrorBoundary>
  <AuthProvider>
    <ErrorProvider>
      <AppContent />
    </ErrorProvider>
  </AuthProvider>
</ErrorBoundary>
```

---

## 🛣️ Routing Map

### Public Routes
| Path | Component | Notes |
|------|-----------|-------|
| `/` | LandingPage | Marketing page |
| `/login` | LoginPage | Auth login |
| `/registrarse` | RegisterForm | Step 1 of registration |
| `/registrarse/password` | PasswordForm | Step 2 of registration |
| `/pet/:petid` | PetProfilePage | Public pet profile |
| `/demo` | DemoPage | Feature demo page |
| `/error` | ErrorPage | Error display |
| `*` | ErrorPage | 404 catch-all |

### Protected Routes (require auth)
| Path | Component | Notes |
|------|-----------|-------|
| `/home` | HomePage | Main dashboard |
| `/chat` | ChatPage | AI chat feature |
| `/perfil` | ProfilePage | User profile |
| `/profile/:uid` | ProfilePage | Profile by user ID |
| `/profile/:uid/qr` | QrPage | User QR code |
| `/profile/:uid/pet/:petid` | PetDetailPage | Pet details |
| `/profile/:uid/pet/:petid/edit` | EditPetPage | Pet editing |
| `/profile/:uid/pet/:petid/qr` | PetQrPage | Pet QR code |
| `/agregar-mascota` | RegisterPetForm | Legacy route |
| `/register/pet` | RegisterPetForm | Add pet form |

---

## 📦 Dependencies

### Runtime Dependencies
| Package | Version | Status |
|---------|---------|--------|
| react | ^19.1.1 | ✅ Active |
| react-dom | ^19.1.1 | ✅ Active |
| react-router-dom | ^7.7.1 | ✅ Active |
| axios | ^1.11.0 | ✅ Active |
| qr-code-styling | ^1.9.2 | ✅ Active |
| react-markdown | ^10.1.0 | ✅ Active |
| react-markdown | ^10.1.0 | ✅ Active |

---

## ⚠️ Code Duplications

### 1. `normalizeApiBaseUrl` Function
**Location:** Identical implementation in TWO files
- `src/utils/api.js` (Imported from config)
- `src/utils/auth.js` (Imported from config)

```javascript
const normalizeApiBaseUrl = (url) => {
  const fallback = 'http://localhost:5000/api';
  if (!url || typeof url !== 'string') return fallback;
  let normalized = url.trim().replace(/\/+$/, '');
  if (!normalized.endsWith('/api')) {
    normalized = `${normalized}/api`;
  }
  return normalized;
};
```

---

## 🗑️ Unused Code/Files

### Unused Page Component
| File | Reason |
|------|--------|
| `src/pages/ErrorHandlingExample.js` | REMOVED |

### Broken Test File
| File | Issue |
|------|-------|
| `src/App.test.js` | Fixed |

```javascript
// Current broken test:
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
```

### Duplicate Route
| Routes | Component | Issue |
|--------|-----------|-------|
| `/agregar-mascota` and `/register/pet` | Fixed (Consolidated) |

---

## 📝 Outdated Documentation

### Files to Remove
| File | Status | Reason |
|------|--------|--------|
| `client/README.md` | REMOVED | Default CRA boilerplate, not project-specific |

### Files to Update
| File | Issue |
|------|-------|
| `src/styles/README.md` | Updated | References `legacy/` folder that no longer exists |

---

## ✅ TODO

### High Priority
- [x] **Remove unused dependencies:** `npm uninstall bootstrap materialize-css purecss`
- [x] **Extract duplicate code:** Create shared `src/utils/config.js` with `normalizeApiBaseUrl`
- [x] **Fix test file:** Update `App.test.js` with valid tests

### Medium Priority  
- [x] Remove or route `ErrorHandlingExample.js` page
- [x] Consolidate duplicate routes (`/agregar-mascota` → `/register/pet`)
- [x] Update `src/styles/README.md` to remove legacy folder references

### Low Priority
- [ ] Configure build optimization (see `PACKAGE_OPTIMIZATION.md`)
- [ ] Remove `_framework-integration.css` after full migration
- [ ] Remove `*.md` files after full migration except `SOURCE_OF_TRUTH.md`
- [ ] Verify all other tasks are completed
- [ ] **Data Fetching:** Implement `getPetById` in `src/pages/QrPage.js` (line 33, 108)
- [ ] Update TODO list and `SOURCE_OF_TRUTH.md` after all other tasks are completed
---

## 🔧 FIX

### Critical Fixes
1. **Duplicate function** - `normalizeApiBaseUrl` should be in one shared location
2. **Broken tests** - `App.test.js` will fail on any test run

### Recommended Fixes
1. **Unused dependencies inflate bundle** - remove bootstrap/materialize/purecss (~375KB savings)
2. **Dead code** - `ErrorHandlingExample.js` is never used

---

## 🗑️ REMOVE

| Item | Location | Reason |
|------|----------|--------|
| `client/README.md` | Root | Generic CRA readme |
| bootstrap dependency | package.json | Not imported anywhere |
| materialize-css dependency | package.json | Not imported anywhere |
| purecss dependency | package.json | Not imported anywhere |
| Legacy folder reference | `src/styles/README.md` | Folder doesn't exist |

---

## ℹ️ INFO

### Environment Variables
From `.env`:
- `REACT_APP_API_URL` - Backend API base URL

### CSS Variables (Key Design Tokens)
Located in `src/styles/base/_variables.css`:
- Colors: Primary palette, grays, semantic colors
- Spacing: 8-point grid system
- Typography: Font families, sizes, weights
- Shadows: Elevation levels
- Border radius: Consistent roundness values
- Transitions: Animation timing

### Error Handling System
Full documentation in `src/ERROR_HANDLING_README.md`:
- ErrorBoundary for React errors
- ErrorContext for API errors
- Modal system for user notifications
- ErrorPage for HTTP error display

### Authentication Flow
- JWT stored in localStorage
- Auto-refresh on 401
- Protected routes via `<ProtectedRoute>` wrapper

---

## 📊 File Statistics

| Category | Count | Notes |
|----------|-------|-------|
| JS Components | 8 | In src/components/ |
| JS Pages | 16 | In src/pages/ (incl. subdirs) |
| JS Utilities | 4 | api, auth, errorHandler, validation |
| JS Hooks | 1 | useModal |
| JS Contexts | 1 | ErrorContext |
| CSS Files | 27 | ITCSS organized |
| Test Files | 1 | App.test.js (broken) |
| Total JSX/JS | ~31 | Core source files |

---

## 📚 Existing Documentation

| File | Status | Content |
|------|--------|---------|
| `PACKAGE_OPTIMIZATION.md` | ✅ Valid | Bundle optimization instructions |
| `src/styles/README.md` | ⚠️ Outdated | CSS architecture (references legacy/) |
| `src/styles/CSS_AUDIT_REPORT.md` | ✅ Valid | CSS cleanup documentation |
| `src/styles/BUILD_CONFIG.md` | ✅ Valid | CSS build configuration |
| `src/ERROR_HANDLING_README.md` | ✅ Valid | Error handling system docs |
