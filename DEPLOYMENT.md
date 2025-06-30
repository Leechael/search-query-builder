# Deployment Guide

This guide explains how to deploy the Search Query Builder documentation to GitHub Pages.

## Automatic Deployment (Recommended)

The project is configured with GitHub Actions for automatic deployment.

### Setup Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add documentation and demo page"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **"GitHub Actions"**
   - The workflow will automatically trigger on push to main/master

3. **Access Your Demo**
   - After deployment completes (usually 1-2 minutes)
   - Visit: `https://your-username.github.io/search-query-builder/`
   - Replace `your-username` with your actual GitHub username

### What Gets Deployed

The GitHub Action deploys the `docs/` directory which contains:
- `index.html` - Interactive demo page
- `README.md` - Documentation guide

## Manual Deployment

If you prefer manual deployment or need to troubleshoot:

### Option 1: GitHub Pages Settings

1. Go to **Settings** → **Pages**
2. Select **"Deploy from a branch"**
3. Choose **"main"** branch and **"/ (root)"** folder
4. Click **Save**
5. GitHub will deploy the entire repository
6. Access demo at: `https://your-username.github.io/search-query-builder/docs/`

### Option 2: Local Testing

Test the documentation locally before deployment:

```bash
# Method 1: Python
cd docs
python -m http.server 8000
# Visit: http://localhost:8000

# Method 2: Node.js serve
npm run docs:serve
# Visit: http://localhost:3000

# Method 3: PHP
cd docs
php -S localhost:8000
# Visit: http://localhost:8000
```

## Deployment Status

You can check deployment status in several ways:

### GitHub Actions Tab
- Go to your repository
- Click **"Actions"** tab
- View deployment workflow status

### Repository Settings
- **Settings** → **Pages**
- Shows current deployment status and URL

### Commit Status
- Green checkmark ✅ = Successfully deployed
- Red X ❌ = Deployment failed
- Yellow circle 🟡 = Deployment in progress

## Troubleshooting

### Common Issues

1. **404 Error on Demo Page**
   ```
   Solution: Ensure GitHub Pages is configured correctly
   - Settings → Pages → Source: "GitHub Actions"
   - Wait 2-3 minutes after deployment
   ```

2. **Workflow Permission Error**
   ```
   Solution: Enable workflow permissions
   - Settings → Actions → General
   - Workflow permissions: "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"
   ```

3. **Demo Not Loading**
   ```
   Solution: Check browser console for errors
   - Ensure all external CDN links are working
   - Verify React/Babel/Tailwind CDN URLs
   ```

4. **Changes Not Reflected**
   ```
   Solution: Clear cache and wait
   - Hard refresh: Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
   - Wait 5-10 minutes for CDN cache to clear
   ```

### Debug Steps

1. **Check workflow logs**
   ```bash
   # In GitHub Actions tab, click on failed workflow
   # Expand steps to see detailed error messages
   ```

2. **Validate HTML locally**
   ```bash
   # Test docs/index.html in browser locally
   # Check browser console for JavaScript errors
   ```

3. **Verify file structure**
   ```
   docs/
   ├── index.html      ✅ Main demo page
   ├── README.md       ✅ Documentation
   └── (no other files needed)
   ```

## Custom Domain (Optional)

To use a custom domain:

1. **Add CNAME file**
   ```bash
   echo "your-domain.com" > docs/CNAME
   ```

2. **Configure DNS**
   - Add CNAME record pointing to: `your-username.github.io`

3. **Update repository settings**
   - Settings → Pages → Custom domain
   - Enter your domain name
   - Check "Enforce HTTPS"

## Update Process

To update the documentation:

1. **Edit files**
   ```bash
   # Modify docs/index.html or docs/README.md
   ```

2. **Test locally**
   ```bash
   npm run docs:dev
   ```

3. **Deploy**
   ```bash
   git add docs/
   git commit -m "Update documentation"
   git push origin main
   ```

4. **Verify**
   - Wait 1-2 minutes
   - Visit your GitHub Pages URL
   - Hard refresh to clear cache

## Performance Tips

- The demo page loads quickly using CDN resources
- All React components are rendered client-side
- No build process required for the demo
- Lightweight HTML/CSS/JS approach

## Security Notes

- Demo page uses CDN resources (React, Babel, Tailwind)
- No sensitive data is transmitted
- All interactions are client-side only
- Safe to deploy on public GitHub Pages

---

## Quick Deployment Checklist

- [ ] Push code to GitHub
- [ ] Enable GitHub Pages (Settings → Pages → GitHub Actions)
- [ ] Wait for deployment (check Actions tab)
- [ ] Test demo URL: `https://your-username.github.io/search-query-builder/`
- [ ] Update README.md with correct demo URL
- [ ] Share the demo link! 🎉