# EthioTrack — React + Capacitor Android App

Native-feeling **Android** expense tracker with Ethiopian calendar.

This is a **React + Vite + Capacitor** project (not a plain HTML file, not a PWA-only solution).  
Capacitor packages the React web app into a real Android project that you open in Android Studio and build an APK/AAB.

> Note: This uses **React** (web components) + **Capacitor**, which is the standard modern way to ship Android apps from React.  
> It is **not** classic React Native (which uses native UI components). Capacitor gives you a native Android container + plugins while keeping React development.

## Features

- Ethiopian calendar (primary) with full month navigation
- Accounts + transfers
- Income / Expense + custom categories & sub-categories
- Budgets, Savings Goals
- Calendar view, Insights (charts)
- **Loans & Debts** — private section only inside Settings (who you owe / who owes you)
- Local persistence via Capacitor Preferences
- Mobile-first UI with bottom navigation (Android friendly)

## Requirements

- Node.js 18+
- Android Studio (latest)
- Java 17
- Android SDK

## Setup & Build Android APK

```bash
# 1. Install dependencies
npm install

# 2. Build the web assets
npm run build

# 3. Add Android platform (first time only)
npx cap add android

# 4. Sync web code → Android project
npx cap sync android

# 5. Open in Android Studio
npx cap open android
```

In Android Studio:

1. Wait for Gradle sync
2. Select a device/emulator
3. Click **Run** (green play) or **Build → Build Bundle(s) / APK(s) → Build APK(s)**

The APK will be in `android/app/build/outputs/apk/`.

### Useful scripts

```bash
npm run dev          # web development server
npm run build        # production web build
npm run android      # build + sync + open Android Studio
npx cap sync         # after any web change
```

## Project structure

```
ethiotrack-capacitor/
├── src/
│   ├── pages/          # Dashboard, Transactions, Accounts, Budgets, Goals, Calendar, Insights, Settings
│   ├── utils/          # Ethiopian calendar + storage
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── capacitor.config.ts
├── package.json
└── ...
```

## Loans & Debts

Accessible **only from Settings**.  
Never appears on Home / Transactions / Dashboard.  
Supports:
- I owe (borrowed from someone)
- They owe me
- Partial payments
- Mark as paid
- Delete

## License

MIT
