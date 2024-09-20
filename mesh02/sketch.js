let img;
let angleX = 0;
let angleY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let isDragging = false;
let time = 0; // Add a time variable for animation

// Parameters to control speed and intensity
let waveSpeed = 0.02; // Speed of the waving effect
let noiseScale = 0.1; // Scale of the noise
let waveAmplitude = 20; // Amplitude of the waving effect

// Parameters for gravity variability
let gravityVariability = 0.5; // Adjust this value to control the amount of gravity variability

function preload() {
  img = loadImage(
    "image.jpg",
    () => {
      console.log("Image loaded successfully");
    },
    () => {
      console.error("Failed to load image");
    }
  );
}

function setup() {
  createCanvas(1024, 1024, WEBGL);
  textureMode(NORMAL); // Ensure texture mode is set to NORMAL

  // Get references to the input elements
  const waveSpeedInput = document.getElementById("waveSpeed");
  const noiseScaleInput = document.getElementById("noiseScale");
  const waveAmplitudeInput = document.getElementById("waveAmplitude");

  // Update the parameters when the input values change
  waveSpeedInput.addEventListener("input", () => {
    waveSpeed = parseFloat(waveSpeedInput.value);
  });
  noiseScaleInput.addEventListener("input", () => {
    noiseScale = parseFloat(noiseScaleInput.value);
  });
  waveAmplitudeInput.addEventListener("input", () => {
    waveAmplitude = parseFloat(waveAmplitudeInput.value);
  });
}

function draw() {
  background(220);
  orbitControl(); // Allows mouse control for rotating the view

  // Add lighting
  ambientLight(100); // Base level of light
  directionalLight(255, 255, 255, 0.25, 0.25, -1); // White light from the top-left

  // Apply global translation to move everything up by 200 pixels
  translate(0, -200, 0);

  // Apply rotations
  rotateX(angleX);
  rotateY(angleY);

  let cols = 8; // Reduced number of columns for optimization
  let rows = 8; // Reduced number of rows for optimization
  let cellSize = 40;

  drawFlag(cols, rows, cellSize);
  drawPole(cols, cellSize);

  time += waveSpeed; // Increment time for animation
}

function drawFlag(cols, rows, cellSize) {
  if (!img) {
    console.error("Image not loaded");
    return;
  }

  texture(img); // Apply the image texture
  beginShape(TRIANGLE_STRIP);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i <= cols; i++) {
      let x = i * cellSize - (cols * cellSize) / 2;
      let y1 = j * cellSize - (rows * cellSize) / 2;
      let y2 = (j + 1) * cellSize - (rows * cellSize) / 2;

      // Apply Perlin noise for random waving effect
      let z1 = noise(i * noiseScale, j * noiseScale, time) * waveAmplitude;
      let z2 =
        noise(i * noiseScale, (j + 1) * noiseScale, time) * waveAmplitude;

      // Add drooping effect by adjusting the y-coordinates
      let droopFactor = 0.5; // Adjust this value to control the amount of droop
      y1 += pow(i / cols, 2) * droopFactor * cellSize;
      y2 += pow(i / cols, 2) * droopFactor * cellSize;

      // Add wind effect by adjusting the z-coordinates
      let windStrength = 20; // Adjust this value to control the wind strength
      z1 += noise(i * noiseScale, time) * windStrength;
      z2 += noise(i * noiseScale, time + 0.1) * windStrength;

      // Add random variability to gravity
      let gravityEffect = noise(time + i * 0.1) * gravityVariability * cellSize;
      y1 += gravityEffect;
      y2 += gravityEffect;

      // Map texture coordinates
      let u = i / cols;
      let v1 = j / rows;
      let v2 = (j + 1) / rows;

      vertex(x, y1, z1, u, v1);
      vertex(x, y2, z2, u, v2);
    }
  }
  endShape();
}

function drawPole(cols, cellSize) {
  push();
  // Get the WebGL rendering context
  let gl = this._renderer.GL;
  // Disable depth testing for the pole
  gl.disable(gl.DEPTH_TEST);

  // Define the height of the pole
  const poleHeight = 600;

  // Calculate the final position of the pole
  let poleX = (-cols * cellSize) / 2 - 10;
  let poleY = poleHeight / 2 - 225; // Adjust for pole height

  // Translate to the final position
  translate(poleX, poleY, 0);

  // Set the material properties
  specularMaterial(192, 192, 192); // Set the material color to silver with specular reflection
  shininess(100); // Increase shininess to make it look more metallic

  // Draw the cylinder with the new height
  cylinder(10, poleHeight); // Draw the cylinder (radius, height)

  // Draw the sphere at the top of the pole
  translate(0, -poleHeight / 2, 0); // Move to the top of the cylinder
  sphere(20); // Draw the sphere (radius)

  // Re-enable depth testing
  gl.enable(gl.DEPTH_TEST);
  pop();
}
