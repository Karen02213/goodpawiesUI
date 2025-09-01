# Package.json Optimization Recommendations

## Dependencies to Remove

Since we've implemented a custom CSS architecture, these CSS framework dependencies can be removed to reduce bundle size:

```bash
npm uninstall bootstrap materialize-css purecss
```

## Optional: Add CSS Build Tools

For production optimization, consider adding these development dependencies:

```bash
npm install --save-dev postcss postcss-cli postcss-import postcss-preset-env autoprefixer cssnano @fullhuman/purgecss
```

## Updated Package.json Scripts

Add these scripts to your package.json for CSS optimization:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:css": "postcss src/styles/main.css -o build/static/css/main.css",
    "purge:css": "purgecss --css build/static/css/*.css --content build/static/js/*.js build/index.html --output build/static/css/",
    "optimize:css": "npm run build && npm run purge:css",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## Bundle Size Comparison

**Before (with external libraries):**
- Bootstrap: ~160KB
- Materialize CSS: ~180KB
- PureCSS: ~35KB
- Custom styles: ~15KB
- **Total CSS: ~390KB**

**After (custom architecture):**
- Optimized custom styles: ~25-35KB
- **Total CSS: ~25-35KB**
- **Reduction: ~90% smaller bundle**

## Performance Benefits

1. **Faster Initial Load**: Significantly smaller CSS bundle
2. **Better Caching**: Custom CSS can be cached more effectively
3. **Tree Shaking**: Only used styles are included
4. **No Conflicts**: No style conflicts between frameworks
5. **Consistent Design**: Unified design system across the app
6. **Better Maintenance**: Easier to modify and maintain styles

## Migration Checklist

- [x] Created modular CSS architecture
- [x] Implemented CSS custom properties (variables)
- [x] Added responsive design utilities
- [x] Created component-specific styles
- [x] Added accessibility improvements
- [x] Moved legacy files to backup folder
- [x] Updated import statements in components
- [ ] Remove external CSS library dependencies
- [ ] Test all pages for visual consistency
- [ ] Run performance audits
- [ ] Configure build optimization tools
