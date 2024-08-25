let circles = [];
let blobs = [];
let square;
let addButton;
let clearButton;
let addBlobButton;
let targetPositionP;

function setup() {
  let canvas = createCanvas(800, 800);
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);

  addButton = createButton("Add Circle");
  addButton.position(10, 10);
  addButton.mousePressed(addCircle);

  clearButton = createButton("Clear Circles");
  clearButton.position(100, 10);
  clearButton.mousePressed(clearCircles);

  addBlobButton = createButton("Add Blob");
  addBlobButton.position(200, 10);
  addBlobButton.mousePressed(addBlob);

  square = new Square(200, 200, 25);

  // Create a paragraph element to display the target position
  targetPositionP = createP("Target (x, y)");
  targetPositionP.position(300, 0);
}

function draw() {
  background(220);
  for (let circle of circles) {
    circle.update(square.x, square.y, blobs);
    circle.display();
  }
  for (let blob of blobs) {
    for (let circle of circles) {
      blob.display(circle);
    }
  }

  square.updatePosition();
  square.display();

  targetPositionP.html(
    `Target: (${square.x.toFixed(2)}, ${square.y.toFixed(2)})`
  );
}

function addCircle() {
  let x = random(width);
  let y = random(height);
  let circle = new Circle(x, y, random(10, 50));
  circles.push(circle);
  // updateCircleTargets();
}

function clearCircles() {
  circles = [];
}

function addBlob() {
  let x = random(width);
  let y = random(height);
  let blob = new Blob(x, y, random(30, 80));
  blobs.push(blob);
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    square.setTarget(mouseX, mouseY);
    updateCircleTargets();
  }
}

function updateCircleTargets() {
  for (let circle of circles) {
    circle.update(square.x, square.y, blobs);
  }
}

class Circle {
  constructor(x, y, diameter) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.vx = random(-10, 10); // Velocity in the x direction
    this.vy = random(-10, 10); // Velocity in the y direction
    this.target = createVector(0, 0); // Random target position
  }

  update(targetX, targetY, blobs) {
    // console.log("blobs", blobs.length);
    // Update target position
    this.target.set(targetX, targetY);

    // Steering
    let steering = this.seek(this.target);

    let avoidance = this.avoid(blobs);

    this.vx += steering.x + avoidance.x;
    this.vy += steering.y + avoidance.y;

    this.x += this.vx;
    this.y += this.vy;

    // Collision detection and response
    for (let other of circles) {
      if (other !== this) {
        let distance = dist(this.x, this.y, other.x, other.y);
        let minDist = this.diameter + other.diameter / 2;
        if (distance < minDist) {
          let overlap = minDist - distance;
          let direction = createVector(
            this.x - other.x,
            this.y - other.y
          ).normalize();
          this.x += (direction.x * overlap) / 2;
          this.y += (direction.y * overlap) / 2;
          other.x -= (direction.x * overlap) / 2;
          other.y -= (direction.y * overlap) / 2;
        }
      }
    }

    // wrap, instead of bouncing
    if (this.x > width + this.diameter / 2) {
      this.x = -this.diameter / 2;
    } else if (this.x < -this.diameter / 2) {
      this.x = width + this.diameter / 2;
    }
    if (this.y > height + this.diameter / 2) {
      this.y = -this.diameter / 2;
    } else if (this.y < -this.diameter / 2) {
      this.y = height + this.diameter / 2;
    }
  }

  // seek(target) {
  //   let desired = createVector(target.x - this.x, target.y - this.y);
  //   desired.setMag(2); // Set the magnitude of the desired velocity

  //   let steer = createVector(desired.x - this.vx, desired.y - this.vy);
  //   steer.limit(0.5); // Limit the steering force

  //   return steer;
  // }
  seek(target) {
    let desired = createVector(target.x - this.x, target.y - this.y);
    let distance = desired.mag();
    let speed = map(distance, 0, 100, 0, 10); // Map distance to speed
    //let speed = map(log(distance + 1), 0, log(10000 + 1), 0, 10);
    speed = constrain(speed, 0, 20); // Constrain speed to a maximum value
    desired.setMag(speed); // Set the magnitude of the desired velocity

    let steer = createVector(desired.x - this.vx, desired.y - this.vy);
    steer.limit(0.5); // Limit the steering force

    return steer;
  }

  avoid(blobs) {
    let avoidance = createVector(0, 0);
    for (let blob of blobs) {
      let distance = dist(this.x, this.y, blob.x, blob.y);
      if (distance < blob.r + this.diameter / 2 + 200) {
        let diff = createVector(this.x - blob.x, this.y - blob.y);
        diff.normalize();
        diff.div(distance); // Weight by distance
        avoidance.add(diff);
      }
    }
    avoidance.limit(1.0); // Limit the avoidance force
    return avoidance;
  }

  display() {
    fill(105); // Set fill color to dark grey
    ellipse(this.x, this.y, this.diameter, this.diameter);
    this.drawVelocityVector();
  }

  drawVelocityVector() {
    let arrowSize = 10;
    let angle = atan2(this.vy, this.vx);
    stroke(0);
    fill(0);
    line(this.x, this.y, this.x + this.vx * 5, this.y + this.vy * 5);
    push();
    translate(this.x + this.vx * 5, this.y + this.vy * 5);
    rotate(angle);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }
}

class Square {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.targetX = null;
    this.targetY = null;
  }

  updatePosition() {
    if (this.targetX !== null && this.targetY !== null) {
      // Move towards the target position
      let dx = this.targetX - this.x;
      let dy = this.targetY - this.y;
      let distance = sqrt(dx * dy + dy * dy);
      let stepSize = 2; // Adjust step size as needed

      if (distance > stepSize) {
        this.x += (dx / distance) * stepSize;
        this.y += (dy / distance) * stepSize;
      } else {
        // Reached the target
        this.x = this.targetX;
        this.y = this.targetY;
        this.targetX = null;
        this.targetY = null;
      }
    } else {
      // Wander if no target position is set
      this.wander();
    }
  }

  wander() {
    // Randomly change the position within a range
    this.x += random(-2, 2);
    this.y += random(-2, 2);

    // Ensure the square stays within the canvas boundaries
    this.x = constrain(this.x, 0, width - this.size);
    this.y = constrain(this.y, 0, height - this.size);

    // Debugging: Log the new position
    console.log(`New position: (${this.x}, ${this.y})`);
  }

  display() {
    fill(255, 255, 0); // Set fill color to yellow
    rect(this.x, this.y, this.size, this.size);
  }

  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }
}

// class Blob {
//   constructor(x, y, size) {
//     this.x = x;
//     this.y = y;
//     this.size = size;
//   }

//   display() {
//     fill(100, 100, 255);
//     ellipse(this.x, this.y, this.size);
//   }
// }

// Fet Perlin noise!
class Blob {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.offset = random(1000);
  }

  display(circle) {
    if (this.collidesWith(circle)) {
      fill(255, 0, 0);
      stroke(255, 255, 0);
    } else {
      fill(57, 255, 20);
      stroke(0, 100, 0);
    }
    strokeWeight(2);
    // noStroke();
    beginShape();
    for (let angle = 0; angle < TWO_PI; angle += 0.1) {
      let xoff = map(cos(angle), -1, 1, 0, 3); // Increase the frequency
      let yoff = map(sin(angle), -1, 1, 0, 3); // Increase the frequency
      let r =
        this.r +
        map(
          noise(xoff + this.offset, yoff + this.offset),
          0,
          1,
          -this.r,
          this.r // Further increase the amplitude
        );
      let x = this.x + r * cos(angle);
      let y = this.y + r * sin(angle);
      vertex(x, y);
    }
    endShape(CLOSE);
  }

  contains(px, py) {
    let d = dist(px, py, this.x, this.y);
    return d < this.r;
  }

  collidesWith(other) {
    console.log("collidesWithother", other);
    let d = dist(this.x, this.y, other.x, other.y);
    return d < this.r + other.r;
  }
}
