# GoodPawies UI Style Guide

> **Source of Truth** for the GoodPawies Design System  
> Last updated: February 2026

---

## Quick Reference

| Category | Variable Pattern | Example |
|----------|-----------------|---------|
| Colors | `--color-{name}` | `--color-primary` |
| Spacing | `--spacing-{size}` | `--spacing-md` |
| Typography | `--font-size-{size}` | `--font-size-lg` |
| Radius | `--border-radius-{size}` | `--border-radius-lg` |
| Shadows | `--shadow-{size}` | `--shadow-md` |
| Transitions | `--transition-{speed}` | `--transition-fast` |

---

## 1. Design Tokens

### Colors

#### Brand
```css
--color-primary: #f1889b      /* Pink - Primary brand */
--color-primary-dark: #e06b85
--color-primary-light: #f5a3b5
--color-secondary: #667eea    /* Purple-blue - Actions */
--color-secondary-dark: #764ba2
--color-accent: #f093fb       /* Magenta - Highlights */
```

#### Status
```css
--color-success: #28a745
--color-warning: #ffc107
--color-danger: #dc3545
--color-info: #17a2b8
```

#### Text
```css
--color-text-primary: #333333
--color-text-secondary: #666666
--color-text-muted: #999999
--color-text-light: #ffffff
```

#### Backgrounds
```css
--color-bg-primary: #ffffff
--color-bg-secondary: #f8f9fa
--color-bg-tertiary: #f8f8f8
--color-bg-dark: #282c34
```

#### Gradients
```css
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
--gradient-tertiary: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)
```

### Spacing Scale
```css
--spacing-xs: 0.25rem   /* 4px */
--spacing-sm: 0.5rem    /* 8px */
--spacing-md: 1rem      /* 16px */
--spacing-lg: 1.5rem    /* 24px */
--spacing-xl: 2rem      /* 32px */
--spacing-2xl: 3rem     /* 48px */
--spacing-3xl: 4rem     /* 64px */
```

### Typography

#### Font Families
```css
--font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...
--font-family-secondary: 'Poppins', sans-serif
--font-family-mono: source-code-pro, Menlo, Monaco, ...
```

#### Font Sizes
```css
--font-size-xs: 0.75rem    /* 12px */
--font-size-sm: 0.875rem   /* 14px */
--font-size-base: 1rem     /* 16px */
--font-size-lg: 1.125rem   /* 18px */
--font-size-xl: 1.25rem    /* 20px */
--font-size-2xl: 1.5rem    /* 24px */
--font-size-3xl: 1.875rem  /* 30px */
--font-size-4xl: 2.25rem   /* 36px */
```

#### Font Weights
```css
--font-weight-light: 300
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

### Border Radius
```css
--border-radius-sm: 0.25rem    /* 4px */
--border-radius-md: 0.375rem   /* 6px */
--border-radius-lg: 0.5rem     /* 8px */
--border-radius-xl: 0.75rem    /* 12px */
--border-radius-2xl: 1rem      /* 16px */
--border-radius-3xl: 1.5rem    /* 24px */
--border-radius-full: 50%
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), ...
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), ...
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), ...
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Transitions
```css
--transition-fast: 0.15s ease-in-out
--transition-base: 0.3s ease-in-out
--transition-slow: 0.5s ease-in-out
```

### Z-Index Scale
```css
--z-index-dropdown: 1000
--z-index-sticky: 1020
--z-index-fixed: 1030
--z-index-modal-backdrop: 1040
--z-index-modal: 1050
--z-index-popover: 1060
--z-index-tooltip: 1070
```

---

## 2. Architecture (ITCSS)

```
styles/
├── base/           → Settings, Reset, Typography, Layout, Animations
├── components/     → Buttons, Cards, Forms, Modals, Navigation, etc.
├── pages/          → Landing, Chat, Pet Profile, QR Pages, etc.
├── utils/          → Utilities, Responsive helpers
├── main.css        → Entry point (imports all layers)
├── build.css       → Build entry (imports main.css)
└── critical.css    → Critical CSS for inlining
```

**Import Order:**
1. Settings (`_variables.css`)
2. Generic (`_reset.css`)
3. Elements (`_typography.css`)
4. Objects (`_layout.css`, `_animations.css`)
5. Components (buttons, forms, cards, etc.)
6. Pages (page-specific styles)
7. Utilities (helper classes - highest specificity)

---

## 3. Components

### Buttons
| Class | Description |
|-------|-------------|
| `.btn` | Base button styles |
| `.btn-primary` | Primary action (gradient) |
| `.btn-secondary` | Secondary action |
| `.btn-outline` | Outlined button |
| `.btn-sm`, `.btn-lg` | Size variants |

### Cards
| Class | Description |
|-------|-------------|
| `.card` | Base card container |
| `.card-header` | Card header section |
| `.card-body` | Card content area |
| `.card-footer` | Card footer section |
| `.card-interactive` | Hoverable card |
| `.card-action` | Interactive card for main actions |
| `.profile-card` | Profile style with top border |
| `.card-feature` | Feature item with icon |
| `.stats-card` | Gradient background stat box |

### Forms
| Class | Description |
|-------|-------------|
| `.form-group` | Form field wrapper |
| `.form-control` | Input/textarea base |
| `.form-select` | Dropdown select |
| `.form-label` | Field label |
| `.valid-feedback` | Success message |
| `.invalid-feedback` | Error message |

### Avatars
| Class | Size | Description |
|-------|------|-------------|
| `.avatar` | - | Base avatar container |
| `.avatar-xs` | 24px | Extra small |
| `.avatar-sm` | 32px | Small |
| `.avatar-md` | 40px | Medium (default) |
| `.avatar-lg` | 64px | Large |
| `.avatar-xl` | 120px | Extra large |
| `.avatar-2xl` | 150px | 2X large |
| `.avatar-bordered` | - | White border with shadow |
| `.avatar-bordered-thick` | - | Secondary color border |
| `.avatar-shadow` | - | Adds shadow effect |
| `.avatar-hover-zoom` | - | Zoom on hover |
| `.avatar-group` | - | Stacked avatar container |
| `.avatar-initials` | - | Gradient background for initials |

### Badges
| Class | Description |
|-------|-------------|
| `.badge` | Base badge style |
| `.badge-pill` | Rounded pill shape |
| `.badge-status` | Status indicator (success, warning, etc.) |
| `.badge-tag` | Tag style |

### Navigation
| Class | Description |
|-------|-------------|
| `.navbar` | Main navigation bar |
| `.navbar-left` | Left side of navbar (hamburger) |
| `.navbar-center` | Center of navbar (logo) |
| `.navbar-right` | Right side of navbar (profile) |
| `.navbar-sidebar` | Sidebar menu container |
| `.navbar-sidebar.open` | Open state for sidebar |
| `.sidebar-header-section` | Sidebar header with user info |
| `.sidebar-user-card` | User card in sidebar header |
| `.sidebar-user-details` | User name/email container |
| `.sidebar-username` | Username text |
| `.sidebar-email` | Email text |
| `.navbar-menu` | Sidebar menu list |
| `.menu-section-title` | Section title in menu |
| `.sidebar-footer-section` | Sidebar footer |
| `.sidebar-logout-btn` | Logout button |
| `.nav-link` | Navigation links |
| `.nav-menu` | Menu container |
| `.sidebar-item` | Sidebar menu item |
| `.sidebar-item.active` | Active state with accent |

### Loaders
| Class | Description |
|-------|-------------|
| `.spinner-custom` | Animated 4-dot spinner (requires 4 empty divs) |
| `.pulse-loader` | Container for pulsing dots |
| `.pulse-dot` | Individual pulsing dot |
| `.loading-spinner` | Circular border spinner |
| `.loading-dots` | Alternative dot loader |
| `.preloader-wrapper.active` | Materialize-style circular loader |

### Alerts
| Class | Description |
|-------|-------------|
| `.alert` | Base alert container (flexbox) |
| `.alert-success` | Green gradient background |
| `.alert-warning` | Yellow gradient background |
| `.alert-danger` | Red gradient background |
| `.alert-info` | Blue gradient background |

### States
| Class | Description |
|-------|-------------|
| `.loading` | Full-page loading container |
| `.error` | Error state container |
| `.empty-state` | Empty content placeholder |
| `.success-state` | Green success box |
| `.warning-state` | Yellow warning box |
| `.info-state` | Blue information box |
| `.valid-feedback` | Form validation success |
| `.invalid-feedback` | Form validation error |

---

## 4. Utilities

### Display
`.d-none`, `.d-block`, `.d-flex`, `.d-inline-flex`

### Flexbox
`.justify-content-start`, `.justify-content-center`, `.justify-content-end`, `.justify-content-between`  
`.align-items-start`, `.align-items-center`, `.align-items-end`

### Text
`.text-center`, `.text-left`, `.text-right`  
`.text-primary`, `.text-secondary`, `.text-muted`, `.text-danger`, `.text-success`

### Spacing
`.m-0` through `.m-5` (margin)  
`.p-0` through `.p-5` (padding)  
`.mt-*`, `.mb-*`, `.ms-*`, `.me-*` (directional)

### Font
`.font-normal`, `.font-medium`, `.font-semibold`, `.font-bold`  
`.text-xs`, `.text-sm`, `.text-base`, `.text-lg`, `.text-xl`

---

## 5. Responsive System

### Breakpoints
```css
--breakpoint-sm: 576px
--breakpoint-md: 768px
--breakpoint-lg: 992px
--breakpoint-xl: 1200px
--breakpoint-2xl: 1400px
```

### Container Max Widths
```css
--container-sm: 540px
--container-md: 720px
--container-lg: 960px
--container-xl: 1140px
--container-2xl: 1320px
```

### Grid Classes
`.container`, `.container-fluid`  
`.row`, `.col`, `.col-*`, `.col-md-*`, `.col-lg-*`

---

## 6. Framework Roadmap

> Goal: Convert this design system into a standalone HTML/CSS/JS framework

### Phase 1: Current State ✅
- ITCSS architecture implemented
- CSS custom properties for all tokens
- Component classes defined
- Responsive utilities

### Phase 2: Framework Extraction
- [ ] Extract `_variables.css` as standalone `tokens.css`
- [ ] Create documentation site with live examples
- [ ] Add JavaScript for interactive components (modals, dropdowns)
- [ ] Create NPM package

### Phase 3: Distribution
- [ ] Publish to NPM as `@goodpawies/ui`
- [ ] Create CDN distribution
- [ ] Build CLI for scaffolding new projects

---

## Files Reference

| File | Purpose |
|------|---------|
| `base/_variables.css` | All design tokens |
| `base/_reset.css` | CSS reset/normalize |
| `base/_typography.css` | Type scale and fonts |
| `base/_layout.css` | Grid and layout |
| `base/_animations.css` | Keyframe animations |
| `components/_buttons.css` | Button styles |
| `components/_forms.css` | Form controls |
| `components/_cards.css` | Card components |
| `components/_modals.css` | Modal dialogs |
| `components/_notifications.css` | Toast notifications |
| `components/_avatars.css` | Avatar components |
| `components/_badges.css` | Badge components |
| `components/_chat.css` | Chat interface |
| `components/_navigation.css` | Navbar and menus |
| `utils/_utilities.css` | Helper classes |
| `utils/_responsive.css` | Media query utilities |
| `pages/_demo.css` | Demo page specific styles |

### Cards
```css
/* Base Card */
.card { ... }

/* Interactive Cards */
.card-interactive { ... }
.profile-card { ... } /* New: Profile style with top border */
.stats-card { ... }   /* New: Gradient background stat box */
.action-card { ... } 
.tips-card { ... }   
```

/* Feature Items */
.feature-item { ... } /* Vertically stacked icon + text */
```

### Forms & Input
```css
/* Toggle Cards (Checkbox/Radio) */
.toggle-card { ... }
.toggle-card-content { ... } /* Box with icon and label */

/* Floating Inputs */
.form-floating { ... }
```

### Loaders
```css
.spinner-custom { ... } /* Animated spinner */
.pulse-loader { ... }   /* Pulsing dots */
```

### Alerts
```css
.alert { ... }           /* Base alert config */
.alert-success { ... }   /* Success state */
.alert-warning { ... }   /* Warning state */
```

### Utilities
```css
/* Shadows */
.shadow-sm, .shadow-md, .shadow-lg ...

/* Borders */
.rounded, .rounded-lg, .rounded-circle ...
```

### Landing & Hero
```css
/* Hero Section */
.hero-section { ... } /* Premium gradient, 80vh height */
.hero-title { ... }   /* Clamp font size, text shadow */
.hero-icon { ... }    /* Glassmorphic icon container */

/* Landing Page */
.features-grid { ... } /* CSS Grid auto-fit */
.feature-card { ... }  /* Hover lift effect */
.disclaimer { ... }    /* Warning styled alert box */
```

### Pet Profile
```css
/* Avatars */
.avatar { ... }       /* Base avatar class */
.avatar-xl { ... }    /* 150px size */
```
