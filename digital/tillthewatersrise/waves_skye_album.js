let mainCanvas;
let grainBuffer;
let grainShader;

let curves;
let backgroundGradient;

let numberOfPoints = 10;
const numberOfWiggles = 20;
const offsetScale = 50;
let increment = 2;

let marin;
let sky;

function preload(){
  marin = loadImage("assets/marin.png");
  sky = loadImage("assets/night_sky.jpeg");
}
function windowResized(){
  mainCanvas.style('left',100*(windowWidth/2-width/2)/windowWidth+'vw');
}
function setup() {
  mainCanvas = createCanvas(500, 500); 
  //'centering' (not really centering) the canvas
  //mainCanvas.style('display','block');
  mainCanvas.style('position','fixed');
  mainCanvas.style('left',100*(windowWidth/2-width/2)/windowWidth+'vw');
  mainCanvas.style('top','20vh');
  
  //buffer for the shader overlay
  grainBuffer = createGraphics(width, height, WEBGL);
  grainShader = grainBuffer.createShader(vert, frag);
  
  //make wiggle objects
  makeCurves();
  
  //sky gradient
  let c1 = color(random(200,255),random(0,155),random(0,155));
  let c2 = color(random(100,155),random(0,55),random(0,55));
  backgroundGradient = drawingContext.createLinearGradient(0,0,width,height);
  backgroundGradient.addColorStop(0,c1.toString());
  backgroundGradient.addColorStop(1,c2.toString());

  //shadows
  drawingContext.shadowOffsetX = 5;
  drawingContext.shadowOffsetY = -5;
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'black';
  noStroke();
}

function shadow(){
  drawingContext.reset();
  if(shadows){
    //shadows
    drawingContext.shadowOffsetX = 5;
    drawingContext.shadowOffsetY = -5;
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = 'black';
  }
  else{
    strokeWeight(10);
  }
}

function makeCurves(){
  curves = [];
  let points = [];
  for(let i = 0; i<numberOfPoints; i++){
    points[i] = new Point(i*width/(numberOfPoints-1),0,0);
    //points[i] = new Point(i*2000/(numberOfPoints-1),0,0);
  }
  for(let i = 0; i<numberOfWiggles; i++){
    curves[i] = new Wiggle(points,200+i*(height-200)/(numberOfWiggles));
  }
}

class Wiggle{
  constructor(points,h){
    //points to be drawn
    this.points = points;
    //starting height
    this.height = h;
    //colors for gradient
    let r = random(100,255);
    let c1 = color(r,r,random(200,255));
    let c2 = color(r,r,random(200,255));
    //the gradient
    this.gradient = drawingContext.createLinearGradient(0,0,width,height);
    this.gradient.addColorStop(0,c1.toString());
    this.gradient.addColorStop(1,c2.toString());
    
    this.offset = random(0,1000);
  }
  offsetPoints(){
    for(let point of this.points){
      let off = offsetScale*noise(point.x)+offsetScale*(sin((point.x-this.offset)/230)+sin((point.x-this.offset)/370)+sin((point.x-this.offset)/130));
      point.y = this.height+off;
    }
  }
  //render curve
  render(){
    drawingContext.fillStyle = this.gradient;
    beginShape();
    curveVertex(this.points[0].x,this.points[1].y);
    for(let point of this.points){
      curveVertex(point.x,point.y);
    }
    curveVertex(this.points[numberOfPoints-1].x,this.points[numberOfPoints-1].y);
    curveVertex(width,height+20);
    curveVertex(0,height+20);
    curveVertex(this.points[0].x,this.points[0].y);
    endShape();
  }
}
class Point{
  constructor(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
  }
}
let shadows = true;
function keyPressed(){
  if(key == " "){
    shadows = !shadows;
    shadow();
  }
}
function applyGrain() {
  grainBuffer.clear();
  grainBuffer.reset();
  grainBuffer.push();
  grainBuffer.shader(grainShader);
  grainShader.setUniform('noiseSeed', 0); // to make the grain change each frame
  grainShader.setUniform('source', mainCanvas);
  grainShader.setUniform('noiseAmount', 0.1);
  grainBuffer.rectMode(CENTER);
  grainBuffer.noStroke();
  grainBuffer.rect(0, 0, width, height);
  grainBuffer.pop();
  
  clear();
  push();
  image(grainBuffer, 0, 0);
  pop();
}

function draw() {
  //drawing backgound
  drawingContext.fillStyle = backgroundGradient;
  noStroke();
  rect(0,0,width,height);
  stroke(0);
  tint(255,100);
  image(sky,0,0,width,height,0,0,sky.width,sky.height);
  tint(255,255);
  let i = 0;
  for(let curve of curves){
    curve.offsetPoints();
    curve.render();
    if(i == 10){
        //shadows
      drawingContext.shadowOffsetX = 0;
      drawingContext.shadowOffsetY = 0;
      drawingContext.shadowBlur = 0;
      //image(marin,0,150,width,250,0,0,marin.width,marin.height);
      image(marin,0,height-320,width,250,0,0,marin.width,marin.height);
      //shadows
      drawingContext.shadowOffsetX = 5;
      drawingContext.shadowOffsetY = -5;
      drawingContext.shadowBlur = 20;
    }
    i++;
    curve.offset+=increment;
  }
  applyGrain();
  //increment = 30*(sin(frameCount/123)+cos(frameCount/47)+sin(frameCount/249));
}
