function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  drawMesh(20, 20, 20);
}

function drawMesh(rows, cols, cellSize) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let x = j * cellSize;
      let y = i * cellSize;

      // Set random fill color
      fill(random(255), random(255), random(255));

      // Optionally set stroke color
      stroke(0);

      beginShape();
      vertex(x, y);
      vertex(x + cellSize, y);
      vertex(x + cellSize, y + cellSize);
      vertex(x, y + cellSize);
      endShape(CLOSE);
    }
  }
}
