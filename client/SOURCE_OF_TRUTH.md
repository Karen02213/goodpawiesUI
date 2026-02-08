# GoodPawies Client - Source of Truth

> **Last Updated:** February 7, 2026 (Backend Refactor & Settings Page)
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
2. **Framework** → `base/_framework-integration.css` *(REMOVED)*
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
| `/profile` | ProfilePage | User profile |
| `/profile/settings` | SettingsPage | User settings (NEW) |
| `/profile/:uid` | ProfilePage | Profile by user ID |
| `/profile/:uid/qr` | QrPage | User QR code |
| `/profile/:uid/pet/:petid` | PetDetailPage | Pet details |
| `/profile/:uid/pet/:petid/edit` | EditPetPage | Pet editing |
| `/profile/:uid/pet/:petid/qr` | PetQrPage | Pet QR code |
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
- [x] QrPage & PetProfilePage UI/UX redesign (completed Feb 7, 2026)

### Medium Priority  
- [ ] Fix test environment dependency issue (`react-router-dom` not found in jest)

### Low Priority
- [x] Update SOURCE_OF_TRUTH.md after UI/UX tasks
---

## 📱 Recent Changes (Feb 7, 2026)

### Settings Page & Auth Fixes
- **NEW** `SettingsPage.js` - User profile editing, password change, avatar upload
- **Route rename** `/perfil` → `/profile` across 7 files
- **Auth fixes** - Token refresh, change-password session handling
- **CSS** - Added `_profile.css` settings styles

### Database Consolidation
- **Merged** 5 SQL files → single `database/setup.sql`
- **Removed** social media tables (posts, comments, likes)

### Image Storage Refactor (Feb 7, 2026)
- **File-based storage** implemented for user avatars and pet images
- **Routes updated**:
  - `PUT /users/profile` handles `image_data` (base64) → saves to `server/uploads/users/`
  - `PUT /pets/:petid` handles `image_data` (base64) → saves to `server/uploads/pets/`
  - `GET` routes return filenames; frontend prepends `/uploads/users/` or `/uploads/pets/`
- **Database** `image_id` column changed to `VARCHAR(255)` to store filenames

### Profile & Pet Page Fixes (Feb 7, 2026)
- **ProfilePage**: Fixed loading race condition, added "Register your first pet" banner logic
- **PetProfilePage**: Fixed duplicate contact buttons, added owner avatar/details
- **HomePage**: Replaced "Add Pet" quick action with "My Pets"
- **SettingsPage**: Fixed city field population and added live user profile refresh on update
- **Added** 12 Mexican users, 20 diverse pets sample data
- **Fixed** `image_id` → VARCHAR for filename storage (not base64)
- **Fixed** `utils/auth.js` normalized user object in login/register responses to ensure `id` property exists (mapped from `userId`).

### Pet Form Refactor (Feb 7, 2026)
- **Database**:
    - Added `pets_color` table for standard color options.
    - Changed `pets.n_age` (int) to `pets.s_age` (varchar) to support strings like "<1 año".
- **Backend**:
    - Added `GET /api/pets/colors` endpoint.
    - Updated `POST /api/pets` and `PUT /api/pets/:id` to handle `s_age` and `s_color`.
- **Frontend**:
    - **RegisterPetForm & EditPetPage**:
        - Replaced Text Inputs for `Color` and `Age` with **Dropdowns**.
        - Implemented **Toggle Cards** for "Vaccinated" and "Sterilized" checkboxes.
        - Improved `Description` textarea styling.

### Image Storage Refactor (Feb 7, 2026)
- **UPLOADS_URL**: Implemented constant in `client/src/utils/api.js` to handle full URL construction (base URL without `/api`).
- **User Avatars**: Stored in `server/uploads/users/`.
  - API `GET /users/:userid` returns `avatar` filename.
  - Frontend uses `${UPLOADS_URL}/uploads/users/` to display.
  - `SettingsPage.js` handles upload via `PUT /users/profile`.
  - **Note**: No resizing or compression is applied to uploaded images. `body-parser` limit set to 10MB.
- **Pet Images**: Stored in `server/uploads/pets/`.
  - API `GET /pets/:petid` returns `image_url` filename and `images` array.
  - Frontend uses `${UPLOADS_URL}/uploads/pets/` to display.
  - `EditPetPage.js` handles upload via `PUT /pets/:petid`.
- **Profile & Pages Fixes**:
  - **Global Fix**: **Updated ALL pages** to use `UPLOADS_URL` to prevent proxy/404 issues with static assets.
  - `ChatPage.js`: Fixed user avatar paths.
  - `PetQrPage.js`: Fixed pet image logic for QR code.
  - `QrPage.js`: Implemented User QR code with avatar.
  - `PetDetailPage.js`, `EditPetPage.js`, `ProfilePage.js`, `PetProfilePage.js`: Fixed image path logic.
  - `SettingsPage.js`: Verified image preview and upload logic.
- **User Profile Fix (Feb 7, 2026)**:
  - **Backend Fix**: Updated `GET /api/auth/me` and `authQueries.getUserProfileData` to include `city` and `avatar`.
  - **Issue Resolved**: User profile picture and city field were not persisting on reload because the refresh endpoint was missing these fields in the response.

### Image Storage Refactor
- **File-based** - Images saved to `server/uploads/pets/`
- **Filename stored** in DB, served via `/uploads/pets/filename.jpg`
- **Added** `uuid` dependency for unique filenames

### UI/UX Updates
- `QrPage.js`: Compact viewport-fit layout, glassmorphism styling
- `PetProfilePage.js`: Enhanced owner section with phone/city
- `_qr-pages.css`, `_pet-profile.css`: Responsive design


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
