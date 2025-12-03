# IOTrix 2025 - Real-time Judging System

Official judging platform for IOTrix 2025 Phase 2 Final Round.

## Features

- ✅ Real-time score updates across all devices
- ✅ Judge scoring panel with rubrics
- ✅ Live ranking display (auto-refresh every 60s)
- ✅ Admin dashboard with CSV import
- ✅ Score history tracking
- ✅ Edit/delete score capability
- ✅ Export results to CSV

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Firebase (Firestore + Authentication)
- **Hosting**: Vercel (recommended)

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "iotrix-2025"
3. Enable Firestore Database (test mode)
4. Enable Email/Password Authentication
5. Copy your Firebase config

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Configure Firebase

Edit `frontend/src/firebase/config.js` with your Firebase credentials.

### 4. Create Initial Accounts

In Firebase Console > Authentication:

**Judge Account:**

- Email: `judge@iotrix.com`
- Password: `iotrix2025`

**Admin Account:**

- Email: `admin1@iotrix.com`
- Password: `admin123`

### 5. Run Development Server

```bash
npm start
```

Visit `http://localhost:3000`

### 6. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## CSV Format for Team Import

```csv
Team Name,University,Project Title,Phase 1 Score
Team Alpha,CUET,Smart IoT Solution,85.5
Team Beta,BUET,Automated System,90.0
```

## Default Credentials

**Judge Login:**

- Password: `iotrix2025`

**Admin Login:**

- Email: `admin1@iotrix.com`
- Password: `admin123`

## Deployment

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

## Support

Contact:  [Avishek Chowdhury](https://linkedin.com/in/avishek-chowdhury-avi)
```


