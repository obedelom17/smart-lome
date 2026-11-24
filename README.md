# Smart Lomé · Simulateur IoT

Tableau de bord pédagogique pour l'exposé « Les villes intelligentes : l'IoT au service de la gouvernance urbaine » (IAI-Togo GLSI 3).
Design : indigo, signaux aux couleurs du drapeau, Bricolage Grotesque + Instrument Sans.
Stack : React, Vite, Tailwind, Leaflet, Recharts, Framer Motion. Données simulées toutes les 2 s.

## Lancer
npm install
npm run dev

## Déployer sur Vercel
1. Pousser le dossier sur GitHub.
2. Vercel > Add New Project > importer le dépôt.
3. Framework : Vite (détecté). Deploy.

## Défense devant le jury
- Données simulées : prototype pédagogique.
- Architecture identique à un vrai déploiement : seule la source change (MQTT réel au lieu du simulateur, fichier src/sim.js).
- Approche Low-Tech : cohérente avec la partie III.C.
- Taux d'économie hors éclairage : hypothèses à sourcer.

## Modules par membre
M1 Vue globale, Comparateur · M2 Pipeline, Signalement · M3 Éclairage, Parking, Déchets, Eau · M4 Smart Grid, Villes · M5 Défis et sécurité
