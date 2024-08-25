class Circle {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.originalX = x;
    this.originalY = y;
    this.k = 1.5; // Spring constant
    this.damping = 0.9; // Damping factor
    this.velocityX = 0;
    this.velocityY = 0;
    this.wind = createVector(3, 0); // Wind force
    this.targetWind = createVector(3, 0); // Target wind force
    this.smoothingFactor = 0.05; // Smoothing factor for wind changes
    this.windGustInterval = random(100, 300); // Random interval for wind gusts
    this.lastWindGustTime = millis(); // Last time a wind gust occurred
  }

  draw() {
    // Draw cone connecting mouse location and circle's starting point when dragging
    if (this.isDragging) {
      fill(this.color); // Set fill color to black
      noStroke(); // Disable stroke

      let angle = atan2(mouseY - this.originalY, mouseX - this.originalX);
      let halfWidth = this.radius / 2;

      beginShape();
      vertex(
        mouseX + cos(angle + HALF_PI) * halfWidth,
        mouseY + sin(angle + HALF_PI) * halfWidth
      );
      vertex(
        mouseX + cos(angle - HALF_PI) * halfWidth,
        mouseY + sin(angle - HALF_PI) * halfWidth
      );
      vertex(this.originalX, this.originalY);
      endShape(CLOSE);

      stroke(0);
    }

    fill(this.color);
    ellipse(this.x, this.y, this.radius, this.radius); // Use ellipse instead of circle
  }

  // Function to calculate and display average wind speed
  static displayAverageWindSpeed(circles) {
    let totalWindX = 0;
    let totalWindY = 0;

    for (let circle of circles) {
      totalWindX += circle.wind.x;
      totalWindY += circle.wind.y;
    }

    let avgWindX = totalWindX / circles.length;
    let avgWindY = totalWindY / circles.length;

    fill(0);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(
      `Average Wind: (${avgWindX.toFixed(2)}, ${avgWindY.toFixed(2)})`,
      width / 2,
      height - 20
    );
  }

  update() {
    if (!this.isDragging) {
      // Hooke's Law: F = -k * x
      let displacementX = this.originalX - this.x;
      let displacementY = this.originalY - this.y;
      let springForceX = this.k * displacementX;
      let springForceY = this.k * displacementY;

      // Apply spring force to velocity
      this.velocityX += springForceX;
      this.velocityY += springForceY;

      // Apply damping to velocity
      this.velocityX *= this.damping;
      this.velocityY *= this.damping;

      // Update position with velocity
      this.x += this.velocityX;
      this.y += this.velocityY;

      // Check if it's time for a new wind gust
      if (millis() - this.lastWindGustTime > this.windGustInterval) {
        // Generate a new wind gust
        this.targetWind.x = random(5, 40); // Stronger wind force in x direction
        this.targetWind.y = random(-8, 8); // Wind force in y direction
        this.windGustInterval = random(500, 2000); // New random interval for next wind gust
        this.lastWindGustTime = millis(); // Update the last wind gust time
      }

      // Smoothly interpolate wind effect towards target wind
      this.wind.x += (this.targetWind.x - this.wind.x) * this.smoothingFactor;
      this.wind.y += (this.targetWind.y - this.wind.y) * this.smoothingFactor;

      // Wind effect
      this.x += this.wind.x;
      this.y += this.wind.y;
    }
  }

  mousePressed(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    if (d < this.radius / 2) {
      this.isDragging = true;
      this.offsetX = this.x - mx;
      this.offsetY = this.y - my;
    }
  }

  mouseDragged(mx, my) {
    if (this.isDragging) {
      this.x = mx + this.offsetX;
      this.y = my + this.offsetY;
    }
  }

  mouseReleased() {
    this.isDragging = false;
  }
}

// Example usage
let circles = [];

function setup() {
  createCanvas(400, 400);
  let radius = 20; // Adjusted radius for smaller circles
  let colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF", // Original colors
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
    "#FFC0CB", // Additional colors
    "#FF1493",
    "#FFD700",
    "#ADFF2F",
    "#4B0082",
    "#FF4500", // New colors
    "#1E90FF",
    "#32CD32",
    "#FF6347",
    "#40E0D0",
    "#EE82EE", // More new colors
    "#8A2BE2",
    "#A52A2A",
    "#5F9EA0",
    "#D2691E",
    "#DC143C", // Even more new colors
    "#00CED1",
    "#FF8C00",
    "#8B0000",
    "#2E8B57",
    "#DAA520", // Final set of new colors
  ]; // Bright colors

  let gridSize = 5;
  let spacing = width / (gridSize + 1); // Calculate spacing based on canvas width and grid size

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = (i + 1) * spacing;
      let y = (j + 1) * spacing;
      let availableColors = [...colors];

      // Check left neighbor
      if (i > 0) {
        let leftNeighbor = circles[(i - 1) * gridSize + j];
        availableColors = availableColors.filter(
          (color) => color !== leftNeighbor.color
        );
      }

      // Check top neighbor
      if (j > 0) {
        let topNeighbor = circles[i * gridSize + (j - 1)];
        availableColors = availableColors.filter(
          (color) => color !== topNeighbor.color
        );
      }

      // Check top-left diagonal neighbor
      if (i > 0 && j > 0) {
        let topLeftNeighbor = circles[(i - 1) * gridSize + (j - 1)];
        availableColors = availableColors.filter(
          (color) => color !== topLeftNeighbor.color
        );
      }

      // Check top-right diagonal neighbor
      if (i > 0 && j < gridSize - 1) {
        let topRightNeighbor = circles[(i - 1) * gridSize + (j + 1)];
        availableColors = availableColors.filter(
          (color) => color !== topRightNeighbor.color
        );
      }

      // Select a random color from the available colors
      let color =
        availableColors[Math.floor(Math.random() * availableColors.length)];
      circles.push(new Circle(x, y, radius, color));
    }
  }
}
function draw() {
  background(220);
  for (let circle of circles) {
    circle.update();
    circle.draw();
  }
}

function mousePressed() {
  for (let circle of circles) {
    circle.mousePressed(mouseX, mouseY);
  }
}

function mouseDragged() {
  for (let circle of circles) {
    circle.mouseDragged(mouseX, mouseY);
  }
}

function mouseReleased() {
  for (let circle of circles) {
    circle.mouseReleased();
  }
}
