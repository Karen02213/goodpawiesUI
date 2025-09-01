# Production Build Configuration

## PostCSS Configuration

Create a `postcss.config.js` file in the project root:

```javascript
module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      features: {
        'custom-properties': false // Keep CSS variables
      }
    },
    'autoprefixer': {},
    'cssnano': process.env.NODE_ENV === 'production' ? {} : false
  }
}
```

## PurgeCSS Configuration

Create a `purge.config.js` file:

```javascript
module.exports = {
  content: [
    './src/**/*.html',
    './src/**/*.js',
    './src/**/*.jsx',
    './src/**/*.ts',
    './src/**/*.tsx',
  ],
  safelist: [
    // Always keep these classes
    'animate-*',
    'modal-*',
    'btn-*',
    'form-*',
    'loading',
    'error',
    // Dynamic classes that might not be detected
    /^(text|bg|border|shadow|rounded|p|m|gap)-/,
  ],
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
}
```

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build:css": "postcss src/styles/main.css -o build/static/css/main.css",
    "build:css:watch": "postcss src/styles/main.css -o build/static/css/main.css --watch",
    "purge:css": "purgecss --config purge.config.js --output build/static/css/",
    "optimize:css": "npm run build:css && npm run purge:css"
  }
}
```

## Installation

Install the required development dependencies:

```bash
npm install --save-dev postcss postcss-cli postcss-import postcss-preset-env autoprefixer cssnano purgecss
```

## Usage

1. **Development**: CSS is processed automatically by React's build system
2. **Production**: Run `npm run optimize:css` for optimized CSS
3. **Watch mode**: Run `npm run build:css:watch` for development

## Performance Recommendations

1. **Critical CSS**: Extract above-the-fold styles and inline them
2. **CSS Splitting**: Split CSS by routes for code splitting
3. **Compression**: Enable gzip/brotli compression on server
4. **Caching**: Set proper cache headers for CSS files
5. **Preloading**: Preload critical CSS files

## Monitoring

Monitor CSS performance with:
- Lighthouse audits
- WebPageTest
- Chrome DevTools Coverage tab
- Bundle analyzer for CSS size tracking
