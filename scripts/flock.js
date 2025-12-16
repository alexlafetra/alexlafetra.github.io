let flock = []; 
let permissionGranted = false;
let maxBoids = 250;
let pallette;
let zAngle;
let canvas;

const flockSettings = {
  mouseMultiplier:      2,
  cohesionMultiplier:   1.3,
  tiltMultiplier:       1.5,
  separationMultiplier: 1.8,
  alignmentMultiplier:  1,
  avoidanceMultiplier:  10,
  maxBirds : 250,
  averageSize: 32
};

const bgColor = [255,255,255,0];

function setup(){
  canvas = createCanvas(windowWidth+flockSettings.averageSize*2, windowHeight+flockSettings.averageSize*2);
  //every time the canvas is pressed, it'll try and request access
  canvas.mousePressed(requestAccess);
  canvas.style('left',String(-flockSettings.averageSize)+'px');
  canvas.style('top',String(-flockSettings.averageSize)+'px');
  pallette = floor(random(0,5));
  // pallette = 3;
  background(bgColor); //for giving em trails
  initFlock();
  textSize(150);
  fill(255);
  zAngle = 0;
  noSmooth();
}

//fills the flock with a specific number of boids
function initFlock(){
  //getting number of boids relative to window size
  let number = min(windowWidth/10,maxBoids);
  number = 200;
  //if you need to ADD birds
  if(number>flock.length){
    while(number > flock.length){
      flock.push(new Boid());
    }
  }
  //if you need to take birds AWAY
  else{
    let newFlock = [];
    for(let b = 0; b<number; b++){
      newFlock.push(flock[b]);
    }
    flock = newFlock;
  }
}

//resizes canvas when the window is changed
function windowResized() {
  resizeCanvas(windowWidth+flockSettings.averageSize*2, windowHeight+flockSettings.averageSize*2);
  background(bgColor);
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
  // background(bgColor);
  
  for(let boid of flock){
    boid.edges();
    boid.flock(flock);
    boid.update();
    boid.show();
  }
  // faceMouse();
  // setDivToMouse();
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
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2,4));
    this.acceleration = createVector();
    this.size = random(flockSettings.averageSize - 5,flockSettings.averageSize + 5);
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
    while(this.position.x > windowWidth){
      this.position.x-=(canvas.width);
    }
    while(this.position.x < 0){
      this.position.x+=(canvas.width);
    }
  
    while(this.position.y > windowHeight){
      this.position.y-=(canvas.height);
    }
    while(this.position.y < 0){
      this.position.y+=(canvas.height);
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
    let collisionMargin = this.size/2;
    let total = 0;
    const canvasOffset = document.getElementById("defaultCanvas0").getBoundingClientRect();
    //avoid element if it's within a certain distance
    for(let element of elements){
      //get element size and position
      let loc = element.getBoundingClientRect();
      loc.x -= canvasOffset.x;
      loc.y -= canvasOffset.y;
      let centerPos = {y:loc.y+loc.height/2,x:loc.x+loc.width/2};
      if(isWithinRect(this.position,loc,collisionMargin)){
        let d = dist(
          this.position.x,
          this.position.y,
          centerPos.x,
          centerPos.y);
        steering.add(p5.Vector.sub(this.position,createVector(centerPos.x,centerPos.y)));
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

    separation.mult(flockSettings.separationMultiplier);
    cohesion.mult(flockSettings.cohesionMultiplier);
    alignment.mult(flockSettings.alignmentMultiplier);
    tilt.mult(flockSettings.tiltMultiplier);
    avoidance.mult(flockSettings.avoidanceMultiplier);
    
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(tilt);
    if(windowWidth>500)//don't do this if the screen is too small! makes it so you can't rlly see the flocking behavior
      this.acceleration.add(avoidance);

    // if(mouseX<width && mouseY<height){
    //   this.acceleration.add(mouse.mult(flockSettings.mouseMultiplier));
    // }
  }
  update(){
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(maxSpeed);
  }
  show(){
    strokeWeight(this.size);
    stroke(this.color);
    point(this.position.x,this.position.y);
    // noStroke();
    // fill(this.color);
    // circle(this.position.x,this.position.y,this.size);
  }
}