// Chroma Key WebGL App

const videoElement = document.getElementById('videoElement');
const canvas = document.getElementById('glcanvas');
const bgLayer = document.getElementById('background-layer');
const loadingOverlay = document.getElementById('loading');

// UI Controls
const colorPicker = document.getElementById('colorPicker');
const pipetteBtn = document.getElementById('pipetteBtn');
const similarityRange = document.getElementById('similarityRange');
const similarityValue = document.getElementById('similarityValue');
const smoothnessRange = document.getElementById('smoothnessRange');
const smoothnessValue = document.getElementById('smoothnessValue');
const spillRange = document.getElementById('spillRange');
const spillValue = document.getElementById('spillValue');
const bgUpload = document.getElementById('bgUpload');
const uploadBtn = document.getElementById('uploadBtn');
const captureBgBtn = document.getElementById('captureBgBtn');
const clearBgBtn = document.getElementById('clearBgBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// WebGL Context
let gl = canvas.getContext('webgl', { premultipliedAlpha: false });
if (!gl) {
    alert("WebGL is not supported by your browser.");
}

// Shader Program
const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texCoord = a_texCoord;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D tex;
    uniform float texWidth;
    uniform float texHeight;
    uniform vec3 keyColor;
    uniform float similarity;
    uniform float smoothness;
    uniform float spill;

    // Convert RGB to YUV for distance calculation
    vec2 RGBtoUV(vec3 rgb) {
        return vec2(
            rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.500 + 0.5,
            rgb.r *  0.500 + rgb.g * -0.419 + rgb.b * -0.081 + 0.5
        );
    }

    vec4 ProcessChromaKey(vec2 texCoord) {
        vec4 rgba = texture2D(tex, texCoord);
        
        // Filtre anti-macroblocs (compression webcam et bruit de 20px)
        // Échantillonnage épars (sparse sampling) sur un grand rayon
        vec2 dx = vec2(1.0 / texWidth, 0.0);
        vec2 dy = vec2(0.0, 1.0 / texHeight);
        
        vec3 blurColor = rgba.rgb * 0.20;
        
        // Rayon 5 pixels
        blurColor += texture2D(tex, texCoord + dx * 5.0).rgb * 0.10;
        blurColor += texture2D(tex, texCoord - dx * 5.0).rgb * 0.10;
        blurColor += texture2D(tex, texCoord + dy * 5.0).rgb * 0.10;
        blurColor += texture2D(tex, texCoord - dy * 5.0).rgb * 0.10;
        
        // Rayon 10 pixels (diagonales)
        blurColor += texture2D(tex, texCoord + dx * 10.0 + dy * 10.0).rgb * 0.05;
        blurColor += texture2D(tex, texCoord - dx * 10.0 + dy * 10.0).rgb * 0.05;
        blurColor += texture2D(tex, texCoord + dx * 10.0 - dy * 10.0).rgb * 0.05;
        blurColor += texture2D(tex, texCoord - dx * 10.0 - dy * 10.0).rgb * 0.05;
        
        // Rayon 15 pixels
        blurColor += texture2D(tex, texCoord + dx * 15.0).rgb * 0.05;
        blurColor += texture2D(tex, texCoord - dx * 15.0).rgb * 0.05;
        blurColor += texture2D(tex, texCoord + dy * 15.0).rgb * 0.05;
        blurColor += texture2D(tex, texCoord - dy * 15.0).rgb * 0.05;

        float chromaDist = distance(RGBtoUV(blurColor), RGBtoUV(keyColor));
        float baseMask = chromaDist - similarity;
        
        // Utilisation de smoothstep pour une transition plus douce et moins bruitée
        float fullMask = smoothstep(0.0, 1.0, clamp(baseMask / smoothness, 0.0, 1.0));
        rgba.a = fullMask;

        float spillVal = smoothstep(0.0, 1.0, clamp(baseMask / spill, 0.0, 1.0));
        float desat = clamp(rgba.r * 0.2126 + rgba.g * 0.7152 + rgba.b * 0.0722, 0., 1.);
        rgba.rgb = mix(vec3(desat, desat, desat), rgba.rgb, spillVal);
        return rgba;
    }

    void main(void) {
        vec2 texCoord = vec2(gl_FragCoord.x / texWidth, 1.0 - (gl_FragCoord.y / texHeight));
        gl_FragColor = ProcessChromaKey(texCoord);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
}

gl.useProgram(program);

// Attributes & Uniforms
const positionLocation = gl.getAttribLocation(program, "a_position");
const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0,  1.0, -1.0,  -1.0,  1.0,
    -1.0,  1.0,  1.0, -1.0,   1.0,  1.0,
]), gl.STATIC_DRAW);

const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0,  1.0,  1.0,  1.0,  0.0,  0.0,
    0.0,  0.0,  1.0,  1.0,  1.0,  0.0,
]), gl.STATIC_DRAW);

// Texture Setup
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

const uniforms = {
    texWidth: gl.getUniformLocation(program, "texWidth"),
    texHeight: gl.getUniformLocation(program, "texHeight"),
    keyColor: gl.getUniformLocation(program, "keyColor"),
    similarity: gl.getUniformLocation(program, "similarity"),
    smoothness: gl.getUniformLocation(program, "smoothness"),
    spill: gl.getUniformLocation(program, "spill"),
};

// Load from localStorage
const savedParams = JSON.parse(localStorage.getItem('chromaParams'));
if (savedParams) {
    colorPicker.value = savedParams.colorHex || '#00ff00';
    similarityRange.value = savedParams.similarity || 0.4;
    smoothnessRange.value = savedParams.smoothness || 0.1;
    spillRange.value = savedParams.spill || 0.1;
    
    similarityValue.textContent = parseFloat(similarityRange.value).toFixed(2);
    smoothnessValue.textContent = parseFloat(smoothnessRange.value).toFixed(2);
    spillValue.textContent = parseFloat(spillRange.value).toFixed(2);
}

// State
let params = {
    keyColor: hexToRgb(colorPicker.value),
    similarity: parseFloat(similarityRange.value),
    smoothness: parseFloat(smoothnessRange.value),
    spill: parseFloat(spillRange.value)
};

function saveParams() {
    localStorage.setItem('chromaParams', JSON.stringify({
        colorHex: colorPicker.value,
        similarity: params.similarity,
        smoothness: params.smoothness,
        spill: params.spill
    }));
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function updateUniforms() {
    gl.uniform3fv(uniforms.keyColor, params.keyColor);
    gl.uniform1f(uniforms.similarity, params.similarity);
    gl.uniform1f(uniforms.smoothness, params.smoothness);
    gl.uniform1f(uniforms.spill, params.spill);
}

// Render Loop
function render() {
    if (videoElement.readyState >= videoElement.HAVE_CURRENT_DATA) {
        if (canvas.width !== videoElement.videoWidth || canvas.height !== videoElement.videoHeight) {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.uniform1f(uniforms.texWidth, gl.canvas.width);
            gl.uniform1f(uniforms.texHeight, gl.canvas.height);
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoElement);

        updateUniforms();

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(texCoordLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    
    if (videoElement.requestVideoFrameCallback) {
        videoElement.requestVideoFrameCallback(render);
    } else {
        requestAnimationFrame(render);
    }
}

// Start Camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
        });
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
            videoElement.play();
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.style.display = 'none', 500);
            
            if (videoElement.requestVideoFrameCallback) {
                videoElement.requestVideoFrameCallback(render);
            } else {
                requestAnimationFrame(render);
            }
        };
    } catch (err) {
        console.error("Camera access error:", err);
        loadingOverlay.innerHTML = "<p>Error: Cannot access the camera. Please allow access.</p>";
    }
}

// UI Event Listeners
colorPicker.addEventListener('input', (e) => {
    params.keyColor = hexToRgb(e.target.value);
    saveParams();
});

similarityRange.addEventListener('input', (e) => {
    params.similarity = parseFloat(e.target.value);
    similarityValue.textContent = params.similarity.toFixed(2);
    saveParams();
});

smoothnessRange.addEventListener('input', (e) => {
    params.smoothness = parseFloat(e.target.value);
    smoothnessValue.textContent = params.smoothness.toFixed(2);
    saveParams();
});

spillRange.addEventListener('input', (e) => {
    params.spill = parseFloat(e.target.value);
    spillValue.textContent = params.spill.toFixed(2);
    saveParams();
});

// Eyedropper & Fallback
let isPickingColor = false;

if (window.EyeDropper) {
    pipetteBtn.addEventListener('click', async () => {
        const eyeDropper = new EyeDropper();
        try {
            const result = await eyeDropper.open();
            colorPicker.value = result.sRGBHex;
            params.keyColor = hexToRgb(result.sRGBHex);
            saveParams();
        } catch (e) {
            console.log("Eyedropper canceled or error", e);
        }
    });
} else {
    // Fallback if unsupported (e.g., Firefox, Safari)
    pipetteBtn.addEventListener('click', () => {
        isPickingColor = !isPickingColor;
        if (isPickingColor) {
            canvas.style.cursor = 'crosshair';
            pipetteBtn.style.background = 'var(--accent-hover)';
            alert("Click on the video to select the color to make transparent.");
        } else {
            canvas.style.cursor = 'default';
            pipetteBtn.style.background = 'var(--input-bg)';
        }
    });

    canvas.addEventListener('click', (e) => {
        if (!isPickingColor) return;
        
        const rect = canvas.getBoundingClientRect();
        
        // Handle object-fit: contain logic to find actual video coordinate
        const canvasAspect = canvas.width / canvas.height;
        const rectAspect = rect.width / rect.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        if (canvasAspect > rectAspect) {
            drawWidth = rect.width;
            drawHeight = rect.width / canvasAspect;
            drawX = 0;
            drawY = (rect.height - drawHeight) / 2;
        } else {
            drawHeight = rect.height;
            drawWidth = rect.height * canvasAspect;
            drawX = (rect.width - drawWidth) / 2;
            drawY = 0;
        }
        
        const clickX = e.clientX - rect.left - drawX;
        const clickY = e.clientY - rect.top - drawY;
        
        if (clickX >= 0 && clickX <= drawWidth && clickY >= 0 && clickY <= drawHeight) {
            const x = Math.floor((clickX / drawWidth) * canvas.width);
            const y = Math.floor((clickY / drawHeight) * canvas.height);
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 1;
            tempCanvas.height = 1;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(videoElement, x, y, 1, 1, 0, 0, 1, 1);
            
            const pixel = ctx.getImageData(0, 0, 1, 1).data;
            const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
            colorPicker.value = hex;
            params.keyColor = [pixel[0]/255, pixel[1]/255, pixel[2]/255];
            saveParams();
        }
        
        isPickingColor = false;
        canvas.style.cursor = 'default';
        pipetteBtn.style.background = 'var(--input-bg)';
    });
}

// Background Image Upload
uploadBtn.addEventListener('click', () => bgUpload.click());
bgUpload.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            bgLayer.style.backgroundImage = `url('${event.target.result}')`;
            bgLayer.classList.remove('checkerboard');
            clearBgBtn.style.display = 'block';
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

// Capture Background from Camera
captureBgBtn.addEventListener('click', () => {
    // We capture the current video frame (without greenscreen effect)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoElement.videoWidth;
    tempCanvas.height = videoElement.videoHeight;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
    const dataUrl = tempCanvas.toDataURL('image/jpeg');
    bgLayer.style.backgroundImage = `url('${dataUrl}')`;
    bgLayer.classList.remove('checkerboard');
    clearBgBtn.style.display = 'block';
});

// Clear Background
clearBgBtn.addEventListener('click', () => {
    bgLayer.style.backgroundImage = '';
    bgLayer.classList.add('checkerboard');
    clearBgBtn.style.display = 'none';
});

// Fullscreen
fullscreenBtn.addEventListener('click', () => {
    const container = document.getElementById('app-container');
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
});

// Initialize
startCamera();
