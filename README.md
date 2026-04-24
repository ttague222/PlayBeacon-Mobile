# PlayBeacon — Roblox game discovery for families

> Helping parents and kids find great Roblox games together.

The Roblox catalog has millions of games. Finding good ones is hard — especially for parents who want to help their kids without wading through it all themselves. PlayBeacon brings a curated, swipeable discovery experience to families, with personalized recommendations that improve the more you use it.

[![App Store](https://img.shields.io/badge/Download_on_the-App_Store-000000?style=for-the-badge&logo=apple&logoColor=white)](https://apps.apple.com/us/app/playbeacon/id6756545114)
[![Google Play](https://img.shields.io/badge/Get_it_on-Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=com.playbeacon.app)

---

## Architecture

```
PlayBeacon/
├── mobile-app/      # React Native + Expo (iOS & Android)
├── web-admin/       # React admin dashboard (crawler control, analytics)
└── backend/         # Node.js + Firebase (real-time data, recommendations)
```

---

## Tech Stack

![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=flat&logo=expo&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=flat&logo=Firebase&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## Key Features

- **Swipe discovery queue** — like/skip/dislike interface for fast game discovery
- **Personalized recommendations** — improves with every interaction
- **Family-friendly curation** — games filtered for age-appropriate content
- **Game crawler** — automated indexing keeps the catalog fresh
- **Admin dashboard** — real-time crawler status, analytics, and game management
- **Firebase Auth** — secure accounts for parents and kids
- **Cross-platform** — iOS and Android via Expo

---

## Getting Started

```bash
npm install
cp .env.example .env
npx expo start
```

---

Built by [Watchlight Interactive](https://watchlightinteractive.com)
