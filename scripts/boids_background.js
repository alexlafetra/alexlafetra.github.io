const flock = []; 
let permissionGranted = false;
let mouseMultiplier = 2;
let cohesionMultiplier = 1.3;
let tiltMultiplier = 1.5;
let separationMultiplier = 1.8;
let alignmentMultiplier = 1;
let maxBoids = 150;
let pallette;
let zAngle;

function setup(){
  let canvas = createCanvas(windowWidth, windowHeight);
  //every time the canvas is pressed, it'll try and request access
  canvas.mousePressed(requestAccess);
  pallette = floor(random(0,5));
  // pallette = 3;
  background(0); //for giving em trails
  initFlock();
  textSize(150);
  fill(255);
  zAngle = 0;
}

//fills the flock with a specific number of boids
function initFlock(){
  //getting number of boids relative to window size
  let number = windowWidth/10;
  if(number>maxBoids){
      number = maxBoids;
  }
  flock.length = 0;
    for(let i = 0; i < number; i++){
        flock.push(new Boid());
    }
}

//resizes canvas when the window is changed
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
  initFlock();
}

//asking for user permission to get access to motion info
function requestAccess(){
  //checking if it's an iphone
  //if there's a device orientation event object, and if requestPermission is a valid function
  if(typeof(DeviceOrientationEvent) !== 'undefined' && typeof(DeviceOrientationEvent.requestPermission) === 'function'){
    DeviceOrientationEvent.requestPermission();
  }
}

function draw(){
  //for giving em trails
  //comment in for no trails
  // background(0);
  
  for(let boid of flock){
    boid.edges();
    boid.flock(flock);
    boid.update();
    boid.show();
  }
  faceMouse();
}

class Boid {
  constructor(){
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2,4));
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 10;
    // this.color =  color(random(0,255),random(0,255),random(0,255));
    switch(pallette){
      //random
      case 0:
        this.color =  color(random(0,255),random(0,255),random(0,255));
        break;
      //mint
      case 1:
        this.color = color(random(0,255),random(200,255),random(100,255));
        break;
      //organs
      case 2:
        this.color = color(random(200,255),random(0,255),random(0,255));
        break;
      //night candy
      case 3:
        this.color = color(random(0,255),random(0,155),random(0,255));
        break;
      //gloss
      case 4:
        this.color = color(random(100,255),random(100,255),random(100,255));
        break;
    }
  }
  
  edges(){
    if (this.position.x > width){
      this.position.x = 0;
    }
    if (this.position.x < 0){
      this.position.x = width;
    }
  
    if (this.position.y > height){
      this.position.y = 0;
    }
    if (this.position.y < 0){
      this.position.y = height;
    }
  }
  
  align(boids){//makes the boids go in the same direction
    let perceptionRadius = 100; //radius the boid can see
    let steering = createVector();
    let total = 0;
    for(let other of boids){
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y);
       
      if( other != this && d < perceptionRadius){
        steering.add(other.velocity);
        total++;
      }
    }
    if(total>0){
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }
  
  cohesion(boids){//makes the boids go towards one another
    let perceptionRadius = 100; //radius the boid can see
    let steering = createVector();
    let total = 0;
    for(let other of boids){
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y);
       
      if(other != this && d < perceptionRadius){
        steering.add(other.position);
        total++;
      }
    }
    if(total>0){
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }
  
  mouse(boids){//makes the boids go towards the mouse
    let perceptionRadius = 100; //radius the boid can see
    let steering = createVector();
    let mouse = createVector(mouseX, mouseY);
    let mouseDistance = p5.Vector.sub(this.position,mouse);
    
    if(mouseDistance.mag() < perceptionRadius){
      steering.add(mouse);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  separation(boids){//keeps the boids from one another
    let perceptionRadius = 100; //radius the boid can see
    let steering = createVector();
    let total = 0;
    for(let other of boids){
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y);
       
      if(other != this && d < perceptionRadius){
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d);
        steering.add(diff);
        total++;
      }
    }
    if(total>0){
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  //returns a vector containing the x/y acceleration of the device
  tilt(boids){
    let steering = createVector(rotationY,rotationX);
    // steering.setMag(this.maxSpeed);
    steering.limit(this.maxForce);
    return steering;
  }

  //adding all the forces
  flock(boids){
    this.acceleration.set(0,0);
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);
    let mouse = this.mouse(boids);
    let tilt  = this.tilt(boids);  

    separation.mult(separationMultiplier);
    cohesion.mult(cohesionMultiplier);
    alignment.mult(alignmentMultiplier);
    tilt.mult(tiltMultiplier);
    
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(tilt);
    if(mouseX<width && mouseY<height){
      this.acceleration.add(mouse.mult(mouseMultiplier));
    }
  }
  
  update(){
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
  }
  show(){
    strokeWeight(32);
    stroke(this.color);
    point(this.position.x,this.position.y);
  }
}
