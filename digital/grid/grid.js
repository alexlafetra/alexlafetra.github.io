const radius = 80;
let rows;
let columns;
let dots = [];

function setup() {
  createCanvas(windowWidth,windowHeight,WEBGL);
  background(255);
  fill(0);
  noStroke();
  //makeDots();
  //blendMode(BURN);
}

function makeDots(){
  rows = windowHeight/(2*radius);
  columns = windowWidth/(2*radius);
  for (let i = 0; i<rows; i++) {
    for (let j = 0; j<(columns-i%2); j++) {
      let newDot;
      newDot = new Dot(j*2*radius+radius*(i%2),i*2*radius, radius, radius);
      dots.push(newDot);
    }
  }
}

function draw() {
  translate(-windowWidth/2,-windowHeight/2);
  blendMode(BLEND);
  background(255);
  blendMode(MULTIPLY);
  drawDots();
}

function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
  makeDots();
}

class Dot{
  constructor(ex,why){
    this.position = createVector(ex,why);
  }
  render(){
    let mouseVec = createVector(mouseX,mouseY);
    let offset = 1000/(1+(p5.Vector.dist(this.position,mouseVec)));
    if(offset>30){
      offset = 30;
    }
    fill(255,0,0,200);
    ellipse(this.position.x+offset,this.position.y+offset,radius+offset,radius+offset);
    fill(0,255,0,200);
    ellipse(this.position.x-offset,this.position.y+offset,radius+offset,radius+offset);
    fill(0,0,255,200);
    ellipse(this.position.x,this.position.y-offset,radius+offset,radius+offset);
  }
}

function drawDots(){
  rows = windowHeight/(2*radius);
  columns = windowWidth/(2*radius);
  let mouseVec = createVector(mouseX,mouseY);
  let positionVec;
  for (let i = 0; i<rows; i++) {
    for (let j = 0; j<(columns-i%2); j++) {
      positionVec = createVector(radius+j*2*radius+radius*(i%2),radius+i*2*radius);
      let offset = 1000/(1+(p5.Vector.dist(positionVec,mouseVec)));
      if(offset>radius){
        offset = radius;
      }
      fill(255,0,0,200);
      ellipse(positionVec.x+offset,positionVec.y+offset,radius+offset,radius+offset);
      fill(0,255,0,200);
      ellipse(positionVec.x-offset,positionVec.y+offset,radius+offset,radius+offset);
      fill(0,0,255,200);
      ellipse(positionVec.x,positionVec.y-offset,radius+offset,radius+offset);
    }
  }
}
