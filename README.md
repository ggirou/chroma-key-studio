# Chroma Key Studio

A high-performance green screen (Chroma Key) web application running entirely in the browser, without any backend or JavaScript framework.

This project is directly inspired by James Fisher's excellent article:
🔗 **[Production-ready green screen in the browser](https://jameshfisher.com/2020/08/11/production-ready-green-screen-in-the-browser/)**

## ✨ Features

- **WebGL Performance**: The Chroma Key algorithm runs in real-time on the GPU, ensuring an optimal framerate (60 FPS) and high-quality keying based on the YUV color space distance.
- **0 Dependencies**: 100% Vanilla JS, HTML, and CSS. No Node.js, Webpack, React, or any other bundler is required.
- **Integrated Eyedropper**: Click directly on the video to pick the exact color you want to key out (supports all modern browsers with a Canvas-based fallback).
- **Custom Backgrounds**: Upload your own background images or capture the empty room from your camera to use as the background.
- **Persistent Settings**: Your parameters (key color, similarity, smoothness) are saved between sessions using `localStorage`.
- **Modern UI**: Clean and modern "Glassmorphism" design with Fullscreen support.

## 🚀 How to run?

This project requires **no installation**.

**Option 1: Direct Hosting**
You can simply upload the `index.html`, `style.css`, and `app.js` files to any static hosting service (like GitHub Pages, Vercel, or Netlify) and it will work immediately.

**Option 2: Locally**
For security reasons, most web browsers require the page to be served via `localhost` (or HTTPS) to allow access to the webcam.
1. Open a terminal in the project folder.
2. Start a local web server (for example with Node.js, Python, or PHP):
   - Via npm: `npx serve`
   - Via python: `python -m http.server 8000`
   - Via php: `php -S localhost:8000`
3. Open your browser at the provided address (e.g. `http://localhost:3000` or `http://localhost:8000`).

## 🛠️ Parameters

- **Similarity**: Sets the color tolerance. The higher it is, the wider the range of colors removed around the key color.
- **Smoothness**: Softens the transition between the subject and the background to avoid aliased edges.
- **Spill Reduction**: Desaturates pixels that have reflected light from the green screen, helping to remove the green halo effect.

---

## License

This project is licensed under the [MIT License](LICENSE).

---
*Created with the assistance of Gemini / Antigravity.*
