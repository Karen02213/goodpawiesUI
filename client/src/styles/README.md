# CSS Architecture Documentation

## Overview
This project follows a production-ready CSS architecture based on ITCSS (Inverted Triangle CSS) methodology, ensuring maintainable, scalable, and efficient stylesheets.

## Directory Structure

```
src/styles/
├── main.css                 # Main entry point (imports all styles)
├── base/                    # Foundation styles
│   ├── _variables.css       # CSS custom properties
│   ├── _reset.css          # CSS reset and normalize
│   ├── _typography.css     # Typography styles
│   ├── _layout.css         # Layout utilities
│   └── _animations.css     # Animation definitions
├── components/              # Component-specific styles
│   ├── _buttons.css        # Button component styles
│   ├── _forms.css          # Form component styles
│   ├── _navigation.css     # Navigation component styles
│   ├── _cards.css          # Card component styles
│   ├── _modals.css         # Modal component styles
│   └── _states.css         # Loading/error state styles
├── pages/                   # Page-specific styles
│   ├── _pet-profile.css    # Pet profile page styles
│   ├── _pet-detail.css     # Pet detail page styles
│   └── _qr-pages.css       # QR code pages styles
└── utils/                   # Utility classes
    ├── _utilities.css      # General utility classes
    └── _responsive.css     # Responsive utilities
```

## CSS Import Order (ITCSS Methodology)

1. **Variables** - CSS custom properties and configuration
2. **Reset** - Normalize and reset styles
3. **Base** - Element defaults (typography, layout, animations)
4. **Components** - UI component styles
5. **Pages** - Page-specific styles
6. **Utilities** - Helper classes and overrides

## Key Features

### 🎨 CSS Custom Properties
- Comprehensive design system with consistent colors, spacing, typography
- Easy theming and maintenance
- Better performance than SCSS variables

### 📱 Mobile-First Responsive Design
- Responsive utilities with consistent breakpoints
- Container queries for modern browsers
- Print styles and accessibility considerations

### ♿ Accessibility
- Focus management and keyboard navigation
- High contrast mode support
- Reduced motion preferences
- Screen reader utilities

### ⚡ Performance Optimizations
- GPU acceleration for transforms
- Layout containment for better rendering
- Optimized animations and transitions
- Critical CSS considerations

### 🧩 Component Architecture
- Modular component styles
- Reusable button, form, and card components
- Consistent state management (loading, error, success)
- Modal system with backdrop effects

## Usage

### Importing Styles
All styles are automatically imported through `index.css` → `main.css`. Individual components no longer need to import their specific CSS files.

### Using CSS Classes
```jsx
// Example usage of the new class structure
<div className="card card-elevated hover-lift">
  <div className="card-body">
    <h3 className="text-xl font-semibold mb-3">Title</h3>
    <p className="text-secondary mb-4">Description</p>
    <button className="btn btn-primary btn-lg">Action</button>
  </div>
</div>
```

### Custom Properties Usage
```css
.custom-component {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
}
```

## Maintenance Guidelines

### Adding New Styles
1. **Variables**: Add new design tokens to `_variables.css`
2. **Components**: Create new component files in `components/` directory
3. **Pages**: Add page-specific styles to `pages/` directory
4. **Utilities**: Add helper classes to `utils/` directory

### Best Practices
- Use CSS custom properties for consistent values
- Follow BEM naming convention for complex components
- Prefer utility classes for simple styling
- Keep component styles modular and reusable
- Test styles across different screen sizes
- Ensure accessibility compliance

### Performance Considerations
- Minimize CSS bundle size
- Use efficient selectors
- Leverage CSS containment where appropriate
- Optimize critical rendering path

## Browser Support
- Modern browsers (Chrome 88+, Firefox 85+, Safari 14+)
- CSS custom properties support required
- Graceful degradation for older browsers

## Migration Notes
- Component imports updated to use centralized styles
- Component imports updated to use centralized styles
- External CSS libraries (Bootstrap, Materialize, PureCSS) removed for better performance
- All styles now use consistent design system
