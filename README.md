🌳 Chhaya Toru (ছায়া তরু)

Every tree we plant gives shade to tomorrow.

A web platform to track tree plantation across Bangladesh: trees planted by division, district and species, survival rates, estimated CO₂ absorption, and area-wise reports.

Features
Overview: total planted, surviving trees, survival rate gauge, CO₂ absorption, and animated charts
Divisions & Districts: per-district planting data with survival rates and CO₂ estimates
Species: survival rate and CO₂ by tree species
Reports: searchable area-wise plantation report
Admin panel: Google sign-in via Firebase Authentication; only approved admins can edit data
Tech stack
HTML, CSS, vanilla JavaScript (ES modules)
Chart.js for charts
Firebase Authentication (Google) and Cloud Firestore
Hosted on GitHub Pages
Project structure
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
Getting started
Clone the repository:
bash
git clone https://github.com/<your-username>/chhaya-toru.git
cd chhaya-toru
Add your Firebase config to js/firebase-config.js. Never commit real API keys to a public repo; see the security note below.
Open index.html with a local server (ES modules do not load from file://), for example:
bash
npx serve .
Firebase setup
Create a Firebase project and enable Google under Authentication → Sign-in method.
Add your GitHub Pages domain (<your-username>.github.io) under Authorized domains.
In Firestore, create an admins collection. For each admin, add a document whose ID is that person's Google UID.
Publish the Firestore security rules (see firestore.rules).
Security note

Client-side admin checks are for the interface only. Real protection comes from Firestore Security Rules, which must only let listed admins write data. The Firebase web config values are not secret, but keep rules strict.

Deployment (GitHub Pages)
Go to Settings → Pages.
Under Source, choose Deploy from a branch.
Select the main branch and the / (root) folder, then save.
The site will be live at https://<your-username>.github.io/chhaya-toru/.
Data

Current data in the preview is sample data. Replace it with real plantation records before publishing.

Roadmap
[ ] Upazila-level data
[ ] Division map view
[ ] CSV export of reports
[ ] Multilingual (Bangla / English) toggle
Licence

This project is licensed under the MIT Licence. See LICENSE for details.

Made with 💚 for a greener Bangladesh.
