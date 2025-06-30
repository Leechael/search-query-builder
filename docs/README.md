# Search Query Builder Documentation

This directory contains the documentation and demo page for the Search Query Builder component.

## Live Demo

Visit the live demo at: **[GitHub Pages URL will be available after deployment]**

## Local Development

To run the documentation locally:

1. Open `index.html` in a web browser
2. Or serve with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

## Features Demonstrated

The demo page showcases:

- ✅ **Interactive Search Interface** - Full working search query builder
- ✅ **Keyboard Navigation** - Arrow keys, Tab, Enter, Escape
- ✅ **Autocomplete Dropdown** - Smart filtering with Recent/All tabs
- ✅ **Focus Management** - Proper focus states and outside click handling
- ✅ **Multiple Instances** - Demonstrates single dropdown management
- ✅ **API Documentation** - Complete props and interface reference
- ✅ **Usage Examples** - Basic and advanced implementation patterns

## Documentation Structure

- `index.html` - Main demo page with interactive examples
- `README.md` - This documentation file

## Deployment

The documentation is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the main branch.

### Manual Deployment Setup

If you need to set up GitHub Pages manually:

1. Go to your repository Settings
2. Navigate to "Pages" section
3. Select "GitHub Actions" as the source
4. The workflow will automatically deploy on push to main/master

## Contributing

To improve the documentation:

1. Edit `index.html` for content changes
2. Test locally before committing
3. Submit a pull request
4. Documentation will be automatically deployed after merge

## Browser Compatibility

The demo page works in all modern browsers:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

The actual React components support:
- React 16.8+ (hooks)
- TypeScript 4.0+
- Modern ES6+ environments