/*
idea is to draw flame curves back to front to fill up the screen
*/

class Flame{
  constructor(p,theta1,theta2,c1,c2){
    this.theta1 = theta1;//angles are in degrees!
    this.theta2 = theta2;
    this.start = p;
    this.size = max(5*abs(theta1-theta2),100);
    this.stepSize = 40;
    this.coef = random([-1,1])*10;
    this.points = [];
    this.gradient =  drawingContext.createLinearGradient(0,0,this.size/2,this.size/2);
    this.gradient.addColorStop(0,c1);
    this.gradient.addColorStop(1,c2);
    this.age = 0;
    this.seed = random();
  }
  genPoints(){
    let side1 = [];
    for(let i = 0; i<3*this.size; i+=this.stepSize){
      let x = i;
      let y = this.coef*sin(360/this.size*i+this.age+this.seed);
      side1.push({x:x*cos(this.theta1)-y*sin(this.theta1),y:x*sin(this.theta1)+y*cos(this.theta1),z:0});
    }
    let side2 = [];
    for(let i = 0; i<3*this.size; i+=this.stepSize){
      let x = i;
      let y = this.coef*sin(360/this.size*i+this.age+this.seed);
      side2.push({x:x*cos(this.theta2)-y*sin(this.theta2),y:x*sin(this.theta2)+y*cos(this.theta2),z:0});
    }
    this.age+=10*this.seed;
    this.points = side1.reverse().slice(0,-1).concat(side2);
  }
  render(index){
    stroke(0);
    // noStroke();
    strokeWeight(1);
    drawingContext.fillStyle = this.gradient;
    push();
    translate(this.start.x,this.start.y);
    beginShape();
    // let lastP = this.points[this.points.length-1];
    for(let p of this.points){
      // point(p.x,p.y);
      // line(p.x,p.y,lastP.x,lastP.y);
      // vertex(p.x,p.y);
      curveVertex(p.x,p.y);
    }
    endShape();
    pop();
    pop();
  }
}

let gradient;

let flames = [];
let mainCanvas;
let mainBuffer;
let mask;
const NUMBER_OF_FLAMES_X = 10;
const NUMBER_OF_FLAMES_Y = 10;
const flameAreaHeight = 320;

function flameColor(){
  return random([color(255,0,0),color(255,120,100),color(255,180,10),color(255,100,0),color(0,150,255)]);
}
function grassColor(){
  return random([color(0,200,150),color(155,255,150),color(0,255,10),color(0,255,100),color(100,150,155)]);
}

function setup(){
  mainCanvas = createCanvas(1000,1000);

  angleMode(DEGREES);

  let count = 0;
  for(let i = 0; i<width; i+=width/NUMBER_OF_FLAMES_X){
    for(let j = 0; j<flameAreaHeight; j+=flameAreaHeight/NUMBER_OF_FLAMES_Y){
      let angle1 = random(80,90);
      let angleBetween = random(10,45);
      flames.push(new Flame({x:i+20*noise(count)+(width/NUMBER_OF_FLAMES_X)/2*(count%2),y:j+20*noise(count)-10},angle1,angle1+angleBetween,flameColor(),flameColor()));
      // flames.push(new Flame({x:i+20*noise(count)+(width/NUMBER_OF_FLAMES_X)/2*(count%2),y:j+20*noise(count)-10},angle1,angle1+angleBetween,grassColor(),grassColor()));
      count++;
    }
  }
  background(0,0,255);
  for(let flame of flames){
    flame.genPoints();
  }
}
function draw(){
  // background(0,150,255,50);
  background(0,150,255);

  // background(0);
  // background(0,10);
  let count = 0;
  translate(30,height-flameAreaHeight);
  for(let flame of flames){
    flame.genPoints();
    flame.render(count);
    count++;
  }
}