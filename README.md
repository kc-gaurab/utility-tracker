# Päivölänrinne 5 — Utility Tracker

A React + TypeScript app for tracking and splitting utility bills between two houses based on meter readings.

## Features

- **Meter Readings Management**: Track cold water, hot water, and heating meter readings
- **Bill Management**: Record water and heating bills with automatic fair share calculations
- **Settlement Tracking**: Record settlements and track running balances
- **Calculation Transparency**: See exactly how meter readings affect bill splits
- **Firebase Cloud Sync**: Real-time data synchronization across multiple users
- **Multi-User Support**: You and your neighbor can access and edit the same data
- **Charts & Trends**: Visualize consumption and costs over time
- **Offline-First**: Works offline with automatic sync when connection is restored

## How It Works

### Water Bills
- A's total water = A cold + A hot (from sub-meters)
- B's hot water is derived: main water - (A cold + B cold + A hot)
- Bill is split proportionally based on total consumption

### Heating Bills
- Hot water heating MWh = main kaukolämpö - (A kamstrup + B sharky)
- Hot water heating is split based on hot water consumption ratio
- Each house's total = space heating (from sub-meter) + their share of hot water heating
- Bill is split proportionally based on total MWh

### Important
**Meter readings directly affect fair share calculations!** Changing any meter reading will recalculate the consumption for that period and update all associated bill splits.

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Firebase Setup

This app uses Firebase Firestore for real-time data synchronization between multiple users.

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "utility-tracker")
4. Disable Google Analytics (not needed)
5. Click "Create project"

### 2. Set up Firestore Database

1. In your Firebase project, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in **test mode**" (we'll secure it later)
4. Select a location closest to you
5. Click "Enable"

### 3. Register Web App

1. In Project Overview, click the web icon (`</>`) to add a web app
2. Register app with a nickname (e.g., "utility-tracker-web")
3. Don't check "Firebase Hosting"
4. Click "Register app"
5. Copy the `firebaseConfig` object shown

### 4. Add Config to Your App

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder values with your Firebase config:

```bash
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

The `.env` file is already in `.gitignore` and won't be committed to your repository, keeping your Firebase credentials secure.

### 5. Secure Your Database (Important!)

By default, test mode allows anyone to read/write your database. Update your Firestore security rules:

1. Go to Firestore Database → Rules
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to all authenticated users
    // Or customize based on your needs
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note**: For better security, consider adding Firebase Authentication and restricting access to authenticated users only.

### 6. Initial Data Upload

1. Run the app: `npm run dev`
2. Go to Settings tab
3. Click "Upload Local Data to Firebase"
4. Your data is now synced to the cloud!

### 7. Share with Your Neighbor

#### Option A: Share the Deployed App (Easiest)
Deploy to GitHub Pages (see deployment section below) and share the URL with your neighbor. No setup required on their end!

#### Option B: Local Development
Your neighbor can run it locally:
1. Clone/download this project
2. Run `npm install`
3. Create a `.env` file with the **same** Firebase config values as yours
4. Run `npm run dev`
5. They'll see the same data in real-time!

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Zustand** for state management
- **Firebase Firestore** for real-time cloud database
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **date-fns** for date manipulation

## Usage

1. **Add Meter Readings**: Go to the Meter Readings tab and add readings monthly
2. **Add Bills**: Go to the Bills tab and record water/heating bills with their periods
3. **View Dashboard**: See the current balance and recent consumption/costs
4. **Track Settlements**: Go to the Ledger tab to add settlements when you pay each other
5. **Analyze Trends**: View historical consumption and cost trends
6. **Export Data**: Regularly export your data as JSON backup from Settings

## Verifying Calculations

To verify that meter readings affect calculations:

1. Note two consecutive meter readings
2. Find a bill that falls in that period
3. Check the A share and B share in the Bills tab
4. Edit a meter reading and watch the bill splits update immediately!

## Data Management

- **Cloud Sync**: All data is automatically synchronized to Firebase Firestore
- **Real-time Updates**: Changes made by you or your neighbor appear instantly
- **Offline Support**: App works offline; changes sync when connection is restored
- **JSON Backups**: Export your data as JSON for additional backup security
- **Import/Export**: Import data from JSON backups if needed
- **Reset Function**: Available to start fresh with seed data

### How Real-Time Sync Works

When you or your neighbor makes a change:
1. The change is immediately visible in the UI (optimistic update)
2. The change is saved to Firebase in the background
3. Firebase notifies all connected clients
4. Other users see the change instantly

Both users can edit simultaneously - Firebase handles all the synchronization!

## Deploying to GitHub Pages

This app is configured for automatic deployment to GitHub Pages.

### Prerequisites

1. Push your code to a GitHub repository
2. Your Firebase project is set up and Firestore is configured

### Setup GitHub Secrets

In your GitHub repository, go to Settings → Secrets and variables → Actions, and add these secrets:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Copy the values from your `.env` file (without the quotes).

### Enable GitHub Pages

1. Go to your repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. Save the settings

### Deploy

The app will automatically deploy when you push to the `master` branch:

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin master
```

Or manually trigger deployment from the Actions tab.

### Access Your App

After deployment completes, your app will be available at:
- `https://<your-username>.github.io/<repository-name>/`

### Sharing with Your Neighbor

Your neighbor can access the deployed app at the same URL. They don't need to clone the repository or set up anything - just visit the URL and start using it!

The Firebase configuration is baked into the deployed build, so everyone using the deployed app will automatically connect to the same Firebase database.

### Local Development

For local development, use the `.env` file:

```bash
npm run dev
```

The `.env` file is gitignored and won't be committed to the repository.

## License

Private use for Päivölänrinne 5 residents
