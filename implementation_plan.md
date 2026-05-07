# Green Screen Web Application

Build a production-ready real-time green screen (chroma key) web application using WebGL, taking inspiration from the provided article. The application will use the device's camera, apply a chroma key fragment shader to make a selected color transparent, and allow placing custom backgrounds behind the subject.

## User Review Required

> [!IMPORTANT]
> - I will use **Vanilla JS, HTML, and CSS** without any build step (no React, no bundler) to keep it as simple as possible. The files will be directly usable and can be hosted on GitHub Pages immediately.
> - For styling, I will use **Vanilla CSS** to create a premium, modern, and dynamic design (dark mode, glassmorphism, smooth animations) as per the system instructions.

## Open Questions

> [!NOTE]
> - Should the captured camera frame (used as a background) be saved locally (e.g., localStorage) or is it just temporary for the session?
> - Do you have any specific preferences for the initial default parameters (e.g., default green color `#00ff00`, similarity `0.4`, smoothness `0.1`, spill `0.1`)?

## Proposed Changes

### 1. Project Initialization
- Clean up any React boilerplate.
- Create simple `index.html`, `style.css`, and `app.js` files.

### 2. Core WebGL Pipeline (`app.js`)
- Implement a class to manage the WebGL context, shaders, and video texture updates.
- Use `requestVideoFrameCallback` to synchronize rendering with camera frames.
- Implement the fragment shader using the YUV color space distance method described in the article for high-quality chroma keying (Similarity, Smoothness, Spill).

### 3. UI Components (`index.html` & `app.js`)
- **Main App Container**: A responsive layout with a premium dark aesthetic.
- **Canvas View**: The main area displaying the processed video stream, with an overlay background.
- **Control Panel (Glassmorphism design)**:
  - **Color Picker**: An input to select the exact key color (`type="color"`). We'll use the EyeDropper API where supported.
  - **Parameter Sliders**: Range inputs for Similarity, Smoothness, and Spill.
  - **Background Controls**:
    - Button to upload an image.
    - Button to capture the current camera frame to use as a background (temporary for the session).
  - **Full Screen Toggle**: Button to enter/exit full screen mode on the canvas container.

### 4. Styling (`style.css`)
- Implement a vibrant dark theme with glassmorphic panels.
- Add micro-animations (hover effects, active states) for interactive elements.
- Ensure modern typography.

## Verification Plan

### Automated Tests
- Run `npm run dev` to ensure the project compiles successfully.

### Manual Verification
- Ask the user to open the application in their browser.
- Verify camera access works.
- Verify the WebGL shader correctly removes the selected color.
- Verify the controls (Similarity, Smoothness, Spill) adjust the shader in real-time.
- Verify background upload and camera capture functionality.
- Verify full-screen mode.
