# Deployment Guide - GitHub Pages

Quick reference for deploying this app to GitHub Pages.

## First-Time Setup

### 1. Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/utility-tracker.git
git push -u origin master
```

### 2. Add Firebase Secrets to GitHub

Go to your repository: **Settings → Secrets and variables → Actions → New repository secret**

Add these 6 secrets (copy values from your `.env` file):

| Secret Name | Value |
|-------------|-------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase app ID |

### 3. Enable GitHub Pages

Go to: **Settings → Pages**

- Source: **GitHub Actions**
- Save

### 4. Deploy

Push to master branch:

```bash
git push origin master
```

The GitHub Action will automatically build and deploy your app.

## Subsequent Deployments

Just push to master:

```bash
git add .
git commit -m "Your commit message"
git push origin master
```

## Manual Deployment

You can also trigger deployment manually from the **Actions** tab in your repository.

## View Your App

After deployment (takes ~2-3 minutes), visit:

```
https://YOUR_USERNAME.github.io/utility-tracker/
```

## Troubleshooting

### Build Fails

- Check that all 6 Firebase secrets are added correctly in GitHub
- Check the Actions tab for error logs
- Ensure your code builds locally with `npm run build`

### App Loads but Can't Connect to Firebase

- Verify Firebase secrets match your `.env` values
- Check Firebase Console → Firestore → Security Rules
- Check browser console for errors

### Wrong Base Path

If assets fail to load, update `vite.config.ts`:

```typescript
base: '/your-repo-name/'
```

Then commit and push again.

## Security Note

- Never commit your `.env` file (it's in `.gitignore`)
- GitHub Secrets are encrypted and only available during build
- Firebase API keys in the built app are public but safe (protected by Firebase security rules)
