# Chroma Key Studio

Une application web de "Fond Vert" (Chroma Key) ultra-performante fonctionnant entièrement dans le navigateur, sans aucun backend ni framework JavaScript.

Ce projet est directement inspiré de l'excellent article de James Fisher :
🔗 **[Production-ready green screen in the browser](https://jameshfisher.com/2020/08/11/production-ready-green-screen-in-the-browser/)**

## ✨ Fonctionnalités

- **Performances WebGL** : L'algorithme de Chroma Key tourne en temps réel sur la carte graphique, assurant une fréquence d'images optimale (60 FPS) et un détourage d'excellente qualité basé sur l'espace colorimétrique YUV.
- **0 Dépendance** : 100% Vanilla JS, HTML et CSS. Aucun Node.js, Webpack, React ou autre bundler n'est requis.
- **Pipette Intégrée** : Permet de cliquer directement sur la vidéo pour sélectionner la couleur exacte de votre fond à effacer (compatible tous navigateurs via un fallback Canvas).
- **Arrière-plans Personnalisés** : Uploadez vos propres images ou utilisez la caméra pour capturer la pièce vide et vous incruster dedans.
- **Sauvegarde des paramètres** : Vos réglages (couleur, similitude, lissage) sont conservés d'une session à l'autre via le `localStorage`.
- **Interface Moderne** : Design soigné utilisant le "Glassmorphism" et support du mode Plein Écran.

## 🚀 Comment lancer le projet ?

Ce projet ne nécessite **aucune installation**.

**Option 1 : Hébergement direct**
Vous pouvez uploader les fichiers `index.html`, `style.css` et `app.js` sur n'importe quel hébergement statique (comme GitHub Pages, Vercel, ou Netlify) et le code fonctionnera immédiatement.

**Option 2 : En local**
Pour des raisons de sécurité, la plupart des navigateurs requièrent que la page soit servie via `localhost` (ou HTTPS) pour autoriser l'accès à la webcam.
1. Ouvrez un terminal dans le dossier du projet.
2. Lancez un serveur web local (par exemple avec Node.js, Python ou PHP) :
   - Via npm : `npx serve`
   - Via python : `python -m http.server 8000`
   - Via php : `php -S localhost:8000`
3. Ouvrez votre navigateur à l'adresse indiquée (`http://localhost:3000` ou `http://localhost:8000`).

## 🛠️ Réglages

- **Similitude (Similarity)** : Définit la tolérance de couleur. Plus elle est élevée, plus la plage de couleurs supprimée sera large.
- **Lissage (Smoothness)** : Adoucit la transition entre le sujet et le fond pour éviter les contours trop "crénelés" (aliasing).
- **Réduction de reflet (Spill)** : Permet de désaturer les pixels qui ont légèrement pris la couleur du fond vert à cause des reflets de lumière.

---
*Créé avec l'assistance de Gemini / Antigravity.*
