[README.md](https://github.com/user-attachments/files/35473668/README.md)
# 🌳 Chhaya Toru (ছায়া তরু)

> *Every tree we plant gives shade to tomorrow.*

A web platform to track tree plantation across Bangladesh: trees planted by division, district and species, survival rates, estimated CO₂ absorption, and area-wise reports.

## Features

- **Overview:** total planted, surviving trees, survival rate gauge, CO₂ absorption, and animated charts
- **Divisions & Districts:** per-district planting data with survival rates and CO₂ estimates
- **Species:** survival rate and CO₂ by tree species
- **Reports:** searchable area-wise plantation report
- **Admin panel:** Google sign-in via Firebase Authentication; only approved admins can edit data

## Tech stack

- HTML, CSS, vanilla JavaScript (ES modules)
- [Chart.js](https://www.chartjs.org/) for charts
- [Firebase](https://firebase.google.com/) Authentication (Google) and Cloud Firestore
- Hosted on GitHub Pages

## Project structure

```
chhaya-toru/
├── index.html              # Overview (main page)
├── assets/
│   └── logo.png            # Project logo
├── css/
│   ├── style.css           # Layout, colours, components
│   └── animations.css      # All animations
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   ├── auth.js             # Google sign-in and admin check
│   └── charts.js           # Chart.js setup
├── sections/
│   ├── overview/
│   ├── divisions/
│   ├── species/
│   └── reports/
└── admin/
    ├── admin.html          # Admin sign-in and editor
    └── admin.js
```

## Getting started

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/chhaya-toru.git
   cd chhaya-toru
   ```
2. Add your Firebase config to `js/firebase-config.js`. Never commit real API keys to a public repo; see the security note below.
3. Open `index.html` with a local server (ES modules do not load from `file://`), for example:
   ```bash
   npx serve .
   ```

## Firebase setup

1. Create a Firebase project and enable **Google** under Authentication → Sign-in method.
2. Add your GitHub Pages domain (`<your-username>.github.io`) under Authorized domains.
3. In Firestore, create an `admins` collection. For each admin, add a document whose ID is that person's Google UID.
4. Publish the Firestore security rules (see `firestore.rules`).

## Security note

Client-side admin checks are for the interface only. Real protection comes from Firestore Security Rules, which must only let listed admins write data. The Firebase web config values are not secret, but keep rules strict.

## Deployment (GitHub Pages)

1. Go to **Settings → Pages**.
2. Under **Source**, choose **Deploy from a branch**.
3. Select the `main` branch and the `/ (root)` folder, then save.
4. The site will be live at `https://<your-username>.github.io/chhaya-toru/`.

## Data

Current data in the preview is sample data. Replace it with real plantation records before publishing.

## Roadmap

- [ ] Upazila-level data
- [ ] Division map view
- [ ] CSV export of reports
- [ ] Multilingual (Bangla / English) toggle

## Licence

This project is licensed under the MIT Licence. See `LICENSE` for details.

---

Made with 💚 for a greener Bangladesh.
