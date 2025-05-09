/*
  Idea for stitching:
  you could write the 'over/under' information to a shader and use it to set the blend mode/opacity of the two images as they're drawn over one another
  like: horizontal stitches + vert stitches --> shader ( shader pulls over/under info from texture ) --> pixels from just one of the images OR the other
*/

class ClothThread{
  constructor(x,y,c,seed,d){
    this.direction = d;
    this.seed = seed;
    this.start = {x:x,y:y};
    this.color = c;
    this.points = [];
    this.points.push(this.start);
    this.maxLength = 10.8;
    this.age = 0;
    this.done = false;
    this.thickness = 5;
    // this.thickness = threadDensity;
    this.noiseAmplitude = 0.01;
  }
  grow(){
    if(this.points[this.points.length-1].y>height/2 || this.points[this.points.length-1].x>width/2){
      this.done = true;
      return false;
    }
    noiseSeed(this.seed);
    let len = this.maxLength*noise(this.age/10);
    let newPoint 
    if(this.direction == DOWN){
      newPoint = {x:this.points[this.points.length-1].x+this.noiseAmplitude*(noise(this.age/0.1)-0.5),y:this.points[this.points.length-1].y+len};
    }
    else if(this.direction == RIGHT){
      newPoint = {x:this.points[this.points.length-1].x+len,y:this.points[this.points.length-1].y+this.noiseAmplitude*(noise(this.age/0.1)-0.5)};
    }
    this.points.push(newPoint);
    if(this.points.length>2){
      this.points = this.points.slice(-2);
    }
    this.age++;
    return true;
  }
  render(){
    noiseSeed(this.seed);
    noFill();
    stroke(this.color);
    strokeWeight(map(noise(this.age/6),0,1,1,this.thickness));
    line(this.points[this.points.length-1].x,this.points[this.points.length-1].y,this.points[this.points.length-2].x,this.points[this.points.length-2].y);
  }
  growAcrossScreen(){
    while(this.grow()){
      this.render();
    }
    return;
  }
  checkOffscreen(bound){
    if(points[0].y<bound){
      this.age = 0;
      this.done = false;
      points[0] = {x:0,y:height/2};
      points[1] = {x:this.maxLength*noise(this.age/10),y:height/2};
    }
  }
}

class AnniLine{
  constructor(x,y,theta,w,c,seed){
    this.seed = seed;
    this.width = w;//max L-R boundaries of the curve
    this.color = c;//line hue
    this.start = {x:x,y:y};//start point
    this.theta = theta;//start angle
    this.points = [];//array holding the two current points
    this.points.push(this.start);
    this.direction = UPRIGHT;//direction the curve is currently moving in
    this.count = 0;//how many steps the curve has taken in the current direction
    this.len = 2;//length multiplier of each step (randomized so this doesn't matter)
    this.threadGap = 5;
    this.thickness = 5;
    this.vertAngleChange = PI/40;//amount the curve bends by (larger vals ==> tighter turns)
    this.numberOfTurnSteps = 20;
    this.age = 0;//age of the line (better than using frameCount for noise values since this one is performance-independent)
    this.done = false;//set to tru when the line runs offscreen

    this.bendChance = (1/this.numberOfTurnSteps);
    this.justBent = false;
    this.justSplit = false;

    this.dropShadow = {x:0,y:-5};

    this.onTop = true;
  }
  grow(){
    if(this.done)
      return false;
    let theta = this.theta;
    switch(this.direction){
      case UPRIGHT:
        // theta -= this.vertAngleChange;
        theta -= PI/this.numberOfTurnSteps;
        if(theta>=PI/2 && theta<PI && !this.justBent){
          if(random(1)<this.bendChance){
            this.theta = PI/2;
            this.direction = UPLEFT;
            this.onTop = true;
            this.justBent = true;
            break;
          }
        }
        if(theta<=0){
          this.theta = 0;
          this.direction = RIGHT;
          this.count = 0;
          this.len = random(5,20);
          this.justBent = false;
          this.justSplit = false;
          this.onTop = !this.onTop;
          // return;
        }
        break;
      case LEFT:
        theta = PI+0.1*noise(this.age/10);
        if((random([0,0,0,0,3]) == 3 || this.count>maxLength) || this.points[this.points.length-1].x<(this.start.x-this.width)){
          this.direction = UPRIGHT;
          this.len = min(this.numberOfTurnSteps/5,2);
        }
        break;
      case UPLEFT:
        // theta += this.vertAngleChange;
        theta += PI/this.numberOfTurnSteps;
        if(theta<=PI/2 && theta>0 && !this.justBent){
          if(random(1)<this.bendChance){
            this.theta = PI/2;
            this.direction = UPRIGHT;
            this.onTop = true;
            this.justBent = true;
            break;
          }
        }
        if(theta>=PI){
          this.theta = PI;
          this.direction = LEFT;
          this.count = 0;
          this.len = random(5,20);
          this.justBent = false;
          this.justSplit = false;
          this.onTop = !this.onTop;
        }
        break;
      case RIGHT:
        theta = 0.1*noise(this.age/10);
        if((random([0,0,0,0,3]) == 3 || this.count>maxLength) || this.points[this.points.length-1].x>(this.start.x+this.width)){
          this.direction = UPLEFT;
          this.len = min(this.numberOfTurnSteps/5,2);
        }
        break;
    }
    let newPoint = {x:this.points[this.points.length-1].x+this.len*cos(theta),y:this.points[this.points.length-1].y+this.len*sin(theta)};
    this.points.push(newPoint);
    if(this.points.length>2){
      this.points = this.points.slice(-2);
    }
    this.theta = theta;
    this.count++;
    this.age++;
    if(this.direction != UPRIGHT && this.direction != UPLEFT){
      this.onTop = !this.onTop;
    }
    return true;
  }
  checkBounds(){
    if(this.points[this.points.length-1].y>height/2){
      this.done = true;
      return false;
    }
    else
      return true;
  }
  checkOtherCombine(other){
    //check if the other line is still growing
    if(other.done || this.justSplit || other.justSplit){
      return;
    }
    const threshold = 20;
    //check to see if any of your points are close enough
    for(let point of this.points){
      for(let otherPoint of other.points){
        if(p5.Vector.dist(createVector(point.x,point.y),createVector(otherPoint.x,otherPoint.y))<threshold && point.y<otherPoint.y){
          this.points[this.points.length - 1] = other.points[other.points.length-1];
          this.render();
          this.done = true;
        }
      }
    }
  }
  //split
  checkOtherSplit(other){
    //check if other has stopped
    if(!other.done)
      return;
    const chance = 0.01;
    if(random(1)<chance){
      other.points = this.points;
      other.hue = this.hue;
      other.done = false;
      other.justSplit = true;
    }
  }
  render(){
    if(this.done)
      return;

    let gap = this.threadGap*noise(2+this.age/10);

    //color
    noFill();
    noiseSeed(this.seed);

    //shadows
    colorMode(RGB);
    stroke(0,0,0,200);
    strokeWeight(this.thickness*noise(this.age/100));
    line(this.points[this.points.length-1].x-this.dropShadow.x,this.points[this.points.length-1].y-this.dropShadow.y,this.points[this.points.length-2].x-this.dropShadow.x,this.points[this.points.length-2].y-this.dropShadow.y);
    strokeWeight(this.thickness*noise(this.age/200));
    line(this.points[this.points.length-1].x+gap-this.dropShadow.x,this.points[this.points.length-1].y+gap-this.dropShadow.y,this.points[this.points.length-2].x+gap-this.dropShadow.x,this.points[this.points.length-2].y+gap-this.dropShadow.y);
    strokeWeight(this.thickness*noise(this.age/10));
    line(this.points[this.points.length-1].x-gap-this.dropShadow.x,this.points[this.points.length-1].y-gap-this.dropShadow.y,this.points[this.points.length-2].x-gap-this.dropShadow.x,this.points[this.points.length-2].y-gap-this.dropShadow.y);
    
    colorMode(HSB,100);
    let n = 20*noise(this.points[this.points.length-1].y/50);
    stroke(n+hue(this.color),saturation(this.color),brightness(this.color));
    strokeWeight(this.thickness*noise(this.age/100));
    line(this.points[this.points.length-1].x,this.points[this.points.length-1].y,this.points[this.points.length-2].x,this.points[this.points.length-2].y);

    strokeWeight(this.thickness*noise(this.age/200));
    line(this.points[this.points.length-1].x+gap,this.points[this.points.length-1].y+gap,this.points[this.points.length-2].x+gap,this.points[this.points.length-2].y+gap);
    
    strokeWeight(this.thickness*noise(this.age/10));
    line(this.points[this.points.length-1].x-gap,this.points[this.points.length-1].y-gap,this.points[this.points.length-2].x-gap,this.points[this.points.length-2].y-gap);
    colorMode(RGB);
  }
  renderStitchBuffer(){
    if(this.done)
      return;
    let gap = this.threadGap*noise(2+this.age/10);
    stitchPatternBuffer2.begin();
    noiseSeed(this.seed);
    noFill();

    //Shadows
    stroke(this.onTop?color(0,0,255,5):color(255,0,0,5));
    strokeWeight(this.thickness*noise(this.age/100));
    line(this.points[this.points.length-1].x-this.dropShadow.x,this.points[this.points.length-1].y-this.dropShadow.y,this.points[this.points.length-2].x-this.dropShadow.x,this.points[this.points.length-2].y-this.dropShadow.y);
    strokeWeight(this.thickness*noise(this.age/200));
    line(this.points[this.points.length-1].x+gap-this.dropShadow.x,this.points[this.points.length-1].y+gap-this.dropShadow.x,this.points[this.points.length-2].x+gap-this.dropShadow.x,this.points[this.points.length-2].y+gap-this.dropShadow.x);
    strokeWeight(this.thickness*noise(this.age/10));
    line(this.points[this.points.length-1].x-gap-this.dropShadow.x,this.points[this.points.length-1].y-gap-this.dropShadow.x,this.points[this.points.length-2].x-gap-this.dropShadow.x,this.points[this.points.length-2].y-gap-this.dropShadow.x);

    //Strokes
    stroke(this.onTop?'blue':'red');
    strokeWeight(this.thickness*noise(this.age/100));
    line(this.points[this.points.length-1].x,this.points[this.points.length-1].y,this.points[this.points.length-2].x,this.points[this.points.length-2].y);
    strokeWeight(this.thickness*noise(this.age/200));
    line(this.points[this.points.length-1].x+gap,this.points[this.points.length-1].y+gap,this.points[this.points.length-2].x+gap,this.points[this.points.length-2].y+gap);
    strokeWeight(this.thickness*noise(this.age/10));
    line(this.points[this.points.length-1].x-gap,this.points[this.points.length-1].y-gap,this.points[this.points.length-2].x-gap,this.points[this.points.length-2].y-gap);
    stitchPatternBuffer2.end();
  }
  growAcrossScreen(){
    while(this.grow()){
      this.render();
    }
    return;
  }
}

function randomColor(){
  // return color(255,255,100);
  return color(random(0,255),random(0,255),random(0,255));
}

class WeaveColor{
  constructor(colors){
    this.colors = colors;
  }
  getColor(index,thickness){
    let which = floor(index/thickness)%this.colors.length;
    return this.colors[which];
  }
}

let weavePallettes;
let anniPallettes;


let vertThreads = [];
let horThreads = [];
let NUMBER_OF_VERTICAL_THREADS;
let NUMBER_OF_HORIZONTAL_THREADS;

let anniLine;
let anniLine2;
let anniLine3;
let anniLine4;
let anniLines;

const maxLength = 8;
const gap = 100;
const UPRIGHT = 0;
const LEFT = 1;
const UPLEFT = 2;
const RIGHT = 3;
const DOWN = 0;
const UP = 2;
let threadDensity = 4;
const stitchErrorChance = 0.01;

let vStripeWidth = 6;
let hStripeWidth = 12;

let stitchShader;
let grainShader;

let mainCanvas;
let frameBuffer;
let frameBuffer2;
let grainBuffer;
let stitchPatternBuffer;
let stitchPatternBuffer2;

let hThreadCanvas;
let vThreadCanvas;
let aThreadCanvas;

let currentPalette;
let currentBg;

let screenStart

function reset(){
  hThreadCanvas = createFramebuffer();
  vThreadCanvas = createFramebuffer();
  aThreadCanvas = createFramebuffer();
  frameBuffer = createFramebuffer();
  frameBuffer2 = createFramebuffer();
  grainBuffer = createFramebuffer();
  stitchPatternBuffer = createFramebuffer();
  stitchPatternBuffer2 = createFramebuffer();

  vStripeWidth = floor(random(1,20));
  hStripeWidth = floor(random(1,20));

  threadDensity = floor(random(4,8));
  NUMBER_OF_HORIZONTAL_THREADS = floor(width/threadDensity);
  NUMBER_OF_VERTICAL_THREADS = floor(height/threadDensity);

  // anniLines = [new AnniLine(-width/6,-height/2,PI,50,0,0),new AnniLine(width/6,-height/2,0,50,0,1),new AnniLine(width/3,-height/2,PI,50,0,2),new AnniLine(-width/3,-height/2,0,50,0,3)];
  // anniLines = [new AnniLine(-width/6,-height/2,PI,width/10,10,0),new AnniLine(width/6,-height/2,0,width/10,0,1)];
  anniLines = [new AnniLine(-width/6,-height/2,PI,random(1,width/2),random(anniPallettes),0),new AnniLine(width/6,-height/2,0,random(1,width/2),randomColor(),0)];
    // anniLines = [new AnniLine(-width/6,-height/2,PI,width/10,50,0),new AnniLine(width/6,-height/2,0,width/10,50,1)];

  horThreads = [];
  vertThreads = [];

  let pal1 = random(weavePallettes);
  let pal2 = random(weavePallettes);
  pal1 = new WeaveColor(randomPallette());
  pal2 = new WeaveColor(randomPallette());
  for(let i = 0; i<NUMBER_OF_HORIZONTAL_THREADS; i++){
    horThreads.push(new ClothThread(-width/2+i*width/NUMBER_OF_HORIZONTAL_THREADS+width/(NUMBER_OF_HORIZONTAL_THREADS*2),-height/2,pal1.getColor(i,vStripeWidth),i,DOWN));
  }
  for(let i = 0; i<NUMBER_OF_VERTICAL_THREADS; i++){
    vertThreads.push(new ClothThread(-width/2,-height/2+i*height/NUMBER_OF_VERTICAL_THREADS+height/(NUMBER_OF_VERTICAL_THREADS*2),pal2.getColor(i,hStripeWidth),i,RIGHT));
  }

  // currentBg = randomBackground();
  currentBg = randomColor();

  //creating stitch pattern
  stitchPatternBuffer.begin();
  clear();
  let count = 0;
  noStroke();
  for(let i = 0; i<NUMBER_OF_HORIZONTAL_THREADS;i++){
    for(let j = 0; j<NUMBER_OF_VERTICAL_THREADS;j++){
      fill(((count%2)||(random(1)<stitchErrorChance))?'red':'blue');
      rect(i*width/NUMBER_OF_HORIZONTAL_THREADS-width/2,j*height/NUMBER_OF_VERTICAL_THREADS-height/2,threadDensity,threadDensity);
      count++;
    }
    count++;
  }
  stitchPatternBuffer.end();
}

function randomBackground(){
  return random([color(255,80,50),color(150,200,255),color(250,200,180),color(80,80,80),color(0),color(255)]);
}

function randomPallette(){
  let number = floor(random(1,10));
  let colors = [];
  for(let i = 0; i<number; i++){
    colors.push(randomColor());
  }
  return colors;
}

function setup() {
  setAttributes('antialias',false);
  mainCanvas = createCanvas(800,800,WEBGL);
  grainShader = createShader(grainShaderVert,grainShaderFrag);
  stitchShader = createShader(stitchShaderVert,stitchShaderFrag);
  // pixelDensity(1);

  weavePallettes = [new WeaveColor([color(50,50,100),color(255,0,0),color(255,200,250),color(255,0,0)]), 
                    new WeaveColor([color(100,150,255),color(255),color(100,100,255),color(100,50,50)]), 
                    new WeaveColor([color(70,20,20),color(150,180,200),color(250,220,200),color(150,180,200)]),
                    new WeaveColor([color(50,50,100),color(255,0,0),color(255,200,250),color(255,0,0),color(255,150,150),color(255,0,0),color(255,200,250),color(255,0,0)]),
                    new WeaveColor([color(0,200,255),color(255,200,250),color(55,100,150),color(255,200,250)])];
  anniPallettes = [
    90,50,0,10,30,77
  ];
  reset();
}

//empty arrays when all the objects in them are done growing/rendering
function checkForDone(){
  let done = true;
  for(let l of horThreads){
    if(!l.done){
      return;
    }
  }
  horThreads = [];
  for(let l of vertThreads){
    if(!l.done){
      return;
    }
  }
  vertThreads = [];
}

function mouseReleased(){
  reset();
}

function draw() {
  aThreadCanvas.begin();
  for(let i = 0; i<anniLines.length; i++){
    const aLine = anniLines[i];
    aLine.grow();
    let next = (i == anniLines.length-1)?0:i+1;
    aLine.checkOtherCombine(anniLines[next]);
    aLine.checkOtherSplit(anniLines[next]);
    aLine.render();
    aLine.renderStitchBuffer();
  }
  aThreadCanvas.end();

  hThreadCanvas.begin();
  for(let l of horThreads){
    l.grow();
    l.render();
  }
  hThreadCanvas.end();
  vThreadCanvas.begin();
  for(let l of vertThreads){
    l.grow();
    l.render();
  }
  vThreadCanvas.end();

  checkForDone();

  frameBuffer.begin();
  noStroke();
  shader(stitchShader);
  stitchShader.setUniform('uStitchPattern',stitchPatternBuffer);
  stitchShader.setUniform('uVertStitches',vThreadCanvas);
  stitchShader.setUniform('uHorzStitches',hThreadCanvas);
  quad(1,-1,-1,-1,-1,1,1,1);
  frameBuffer.end();

  frameBuffer2.begin();

  background(currentBg);

  noStroke();
  shader(stitchShader);
  stitchShader.setUniform('uStitchPattern',stitchPatternBuffer2);
  stitchShader.setUniform('uVertStitches',aThreadCanvas);
  stitchShader.setUniform('uHorzStitches',frameBuffer);
  quad(1,-1,-1,-1,-1,1,1,1);
  frameBuffer2.end();

  grainBuffer.begin();
  clear();
  // noStroke();
  shader(grainShader);
  grainShader.setUniform('uSourceImage',frameBuffer2);
  grainShader.setUniform('uNoiseSeed',frameCount/100.1);
  grainShader.setUniform('uNoiseAmplitude',0.1);
  quad(1,-1,-1,-1,-1,1,1,1);
  grainBuffer.end();

  image(grainBuffer,-width/2,-height/2,width,height);
  // tint(255,100);
  // image(stitchPatternBuffer,-width/2,-height/2,width,height);
}

const glsl = x => x;

const grainShaderVert = glsl`
precision mediump float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main(void) {
  gl_Position = vec4(aPosition,1.0);
  vTexCoord = aTexCoord;
}
`;

const grainShaderFrag = glsl`
precision mediump float;
varying vec2 vTexCoord;

uniform sampler2D uSourceImage;
uniform float uNoiseSeed;
uniform float uNoiseAmplitude;

// Noise functions
// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float rand(vec2 n) { 
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void main() {
  // GorillaSun's grain algorithm
  vec4 inColor = texture2D(uSourceImage, vTexCoord);
  if(inColor.y >= 1.0 && inColor.x >= 1.0 && inColor.z >= 1.0){
    gl_FragColor = inColor;
    return;
  }
  gl_FragColor = clamp(inColor + vec4(
    mix(-uNoiseAmplitude, uNoiseAmplitude, fract(uNoiseSeed + rand(vTexCoord * 1234.5678))),
    mix(-uNoiseAmplitude, uNoiseAmplitude, fract(uNoiseSeed + rand(vTexCoord * 876.54321))),
    mix(-uNoiseAmplitude, uNoiseAmplitude, fract(uNoiseSeed + rand(vTexCoord * 3214.5678))),
    0.
  ), 0., 1.);
}
`;

const stitchShaderVert = glsl`
precision mediump float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main(void) {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = positionVec4;
  vTexCoord = aTexCoord;
}
`;

const stitchShaderFrag = glsl`
precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uStitchPattern;
uniform sampler2D uVertStitches;
uniform sampler2D uHorzStitches;

void main(){
  vec4 stitch = texture2D(uStitchPattern,vTexCoord);
  vec4 color = vec4(1.0,0.0,0.0,1.0);

  //if this pixel is transparent on either buffer, dw about overlapping
  vec4 vertColor = texture2D(uVertStitches,vTexCoord);
  vec4 horzColor = texture2D(uHorzStitches,vTexCoord);

  //if the stitch is blue, and vertColor isn't transparent, use vertColor as the pixel color
  if(vertColor.a == 1.0 && stitch.b>=1.0){
    color = vertColor;
  }
  //if the stitch is red, and horzColor isn't transparent, use it as the pixel color
  else if(horzColor.a == 1.0 && stitch.r>=1.0){
    color = horzColor;
  }
  //shadows
  else if(vertColor.a > 0.0 && vertColor.a<1.0 && stitch.b > 0.0){
    color = vec4(horzColor.r - 0.4, horzColor.g - 0.4, horzColor.b - 0.4, 1.0);
  }
  //if both aren't the dominant stitch, combine 'em
  else{
    color = vertColor+horzColor;
  }
  gl_FragColor = color;
}
`;