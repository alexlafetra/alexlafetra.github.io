const flock = []; 
let permissionGranted = false;
let mouseMultiplier = 2;
let cohesionMultiplier = 1.3;
let tiltMultiplier = 1.5;
let separationMultiplier = 1.8;
let alignmentMultiplier = 1;
let avoidanceMultiplier = 10;
let maxBoids = 150;
const pointSize = 32;
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
  console.log("hey");
  
  for(let boid of flock){
    boid.edges();
    // boid.flock(flock);
    boid.update();
    boid.show();
  }
  faceMouse();
}

function isWithinRect(p,rect,margin){
  if(p.x>rect.x-margin && p.x<(rect.x+rect.width+margin) && p.y>rect.y-margin && p.y<(rect.y+rect.height+margin)){
    return true;
  }
  return false;
}

const maxForce = 0.2;
const maxSpeed = 10;

class Boid {
  constructor(){
    this.position = createVector(random(width), random(height));
    this.previousPosition = null;
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2,4));
    this.acceleration = createVector();
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
      this.position.x-=width;;
    }
    if (this.position.x < 0){
      this.position.x+=width;
    }
  
    if (this.position.y > height){
      this.position.y-=height;
    }
    if (this.position.y < 0){
      this.position.y+=height;
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
      steering.setMag(maxSpeed);
      steering.sub(this.velocity);
      steering.limit(maxForce);
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
      steering.setMag(maxSpeed);
      steering.sub(this.velocity);
      steering.limit(maxForce);
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
      steering.setMag(maxSpeed);
      steering.sub(this.velocity);
      steering.limit(maxForce);
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
      steering.setMag(maxSpeed);
      steering.sub(this.velocity);
      steering.limit(maxForce);
    }
    return steering;
  }

  //returns a vector containing the x/y acceleration of the device
  tilt(boids){
    let steering = createVector(rotationY,rotationX);
    // steering.setMag(maxSpeed);
    steering.limit(maxForce);
    return steering;
  }

  avoidElements(boids){
    let steering = createVector();
    let elements = document.getElementsByClassName("collisionElement");
    let collisionMargin = pointSize-20;
    let total = 0;
    //avoid element if it's within a certain distance
    for(let element of elements){
      //get element size and position
      let loc = element.getBoundingClientRect();
      let centerPos = {y:loc.y+loc.height/2,x:loc.x+loc.width/2};
      if(isWithinRect(this.position,loc,collisionMargin)){
        let d = dist(
          this.position.x,
          this.position.y,
          centerPos.x,
          centerPos.y);
        steering.add(p5.Vector.sub(this.position,createVector(centerPos.x,centerPos.y)));
        // steering.mult();
        total++;
      }
    }
    if(total>0){
      steering.div(total);
    }
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
    let avoidance = this.avoidElements(boids);

    separation.mult(separationMultiplier);
    cohesion.mult(cohesionMultiplier);
    alignment.mult(alignmentMultiplier);
    tilt.mult(tiltMultiplier);
    avoidance.mult(avoidanceMultiplier);
    
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    // this.acceleration.add(tilt);
    // this.acceleration.add(avoidance);

    if(mouseX<width && mouseY<height){
      // this.acceleration.add(mouse.mult(mouseMultiplier));
    }
  }
  
  update(){
    this.previousPosition = this.position;
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(maxSpeed);
  }
  show(){
    strokeWeight(pointSize);
    stroke(this.color);
    if(this.previousPosition == null)
      point(this.position.x,this.position.y);
    else
      line(this.position.x,this.position.y,this.previousPosition.x,this.previousPosition.y);
  }
}