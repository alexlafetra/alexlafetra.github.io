let loops;
let cam;
let canv;
let numberOfLoops = 10;
let paused = false;

let graphicsBuffer;
let graphics;
let smear = 1.2;

let shader;

let verticalOffset = 0;
let noiseMultiplier = 1;
let offsetSlider;
let noiseSlider;

let gif;

function preload(){
  // gif = loadImage("digitalSketches/O0/assets/explosion.gif");
}
function setup() {
  //creating canvas
  canv = createCanvas(800,800);
  
  //creating buffers for the image and the for the shader
  graphicsBuffer = createGraphics(800,800,WEBGL);
  graphics = createGraphics(800,800,WEBGL);
  
  shader = graphicsBuffer.createShader(vert,frag);
  

  loops = [];
  for(let i = 0; i<numberOfLoops; i++){
    loops[i] = new Loop(random(100.0,120.0),8,numberOfLoops/2-i);
  }
  let bigLoop = new Loop(100.0,12,loops.length)
  bigLoop.thickness = 20;
  bigLoop.noiseAmplitude = 1;
  loops.push(bigLoop);
  graphics.scale(2);
  graphics.rotateX(-radians(30));
  graphics.rotateY(-radians(30));
  graphics.rotateZ(radians(30));

  offsetSlider = createSlider(0,15,0,0.1);
  noiseSlider = createSlider(0,100,0,0.1);
}

function draw() {
  graphics.clear();
  graphicsBuffer.clear();
  for(let loop of loops){
    loop.render();
    loop.update();
  }
  updateShader();
  image(graphicsBuffer,0,0);
  // image(gif,width/2-gif.width/2,height/2-gif.height/2,gif.width,gif.height);

  verticalOffset = -offsetSlider.value();
  noiseMultiplier = noiseSlider.value();
}

function updateShader(){
  graphicsBuffer.shader(shader);
  
  shader.setUniform("tex",graphics);
  shader.setUniform("resolution",[width,height]);
  shader.setUniform("direction",[smear,0]);
  graphicsBuffer.rect(0,0,width,height);
  
  // shader.setUniform("tex",graphicsBuffer);
  // shader.setUniform("direction",[0,-smear]);
  // graphicsBuffer.rect(0,0,width,height);
}

class Loop{
  constructor(radius,numberOfPoints,verticalOffsetMultiplier){
    this.radius = float(radius);
    //stroke thickness
    this.thickness = floor(random(1,4));
    this.color = color(255,255,255);
    //this.color = color(random(200,255),random(200,255),random(200,255));
    this.noiseAmplitude = exp(random(-numberOfPoints,numberOfPoints),1.5);  
    this.jitterAmplitude = min(exp(random(-numberOfPoints,numberOfPoints),1.1),30);
    this.heightAmplitude = random(-numberOfPoints/2,numberOfPoints/2);
    this.angleX = 0;
    this.angleY = random(0,PI/2);
    this.angleZ = 0;
    this.angleIncrementX = floor(random(-1,2));
    this.angleIncrementY = floor(random(-10,10));
    this.angleIncrementZ = 0;

    this.verticalOffsetMultiplier = verticalOffsetMultiplier;
       
    //making points
    this.points = [];
    let theta;
    for(let i = 0; i<numberOfPoints; i++){
      theta = float(TWO_PI/(numberOfPoints)*i);
      let x = cos(theta);
      let y = 0.0;
      let z = sin(theta);
      this.points[i] = new Point(x,y,z);
    }
  }
  update(){
    //update angles
    this.angleX = this.angleIncrementX*radians(8*sin(frameCount/50.0));
    this.angleY += radians(this.angleIncrementY);
    this.angleZ += radians(this.angleIncrementZ);
    
    //wiggle points
    for(let p of this.points){
      p.y = noiseMultiplier*(this.heightAmplitude+this.noiseAmplitude)/10*noise(p.x,frameCount/1000,p.z)+4*sin(frameCount/500.0+this.angleY);
    }

  }
  render(){
    graphics.noFill();
    graphics.stroke(this.color);
    graphics.strokeWeight(this.thickness);
    graphics.push();
    graphics.rotateX(this.angleX);
    graphics.rotateY(this.angleY);
    graphics.rotateZ(this.angleZ);
    const r = random(-this.jitterAmplitude*noiseMultiplier,this.jitterAmplitude*noiseMultiplier)/25;
    graphics.translate(r,r,r);
    graphics.beginShape();
    graphics.curveVertex(this.radius*this.points[0].x,this.points[0].y+this.verticalOffsetMultiplier*verticalOffset,this.radius*this.points[0].z);
    for(let point of this.points){
      graphics.curveVertex(this.radius*point.x,point.y+this.verticalOffsetMultiplier*verticalOffset,this.radius*point.z);
    }
    graphics.curveVertex(this.radius*this.points[0].x,this.points[0].y+this.verticalOffsetMultiplier*verticalOffset,this.radius*this.points[0].z);
    graphics.curveVertex(this.radius*this.points[1].x,this.points[1].y+this.verticalOffsetMultiplier*verticalOffset,this.radius*this.points[1].z);
    graphics.endShape();
    graphics.pop();
  }
  renderPoints(){
    graphics.stroke(255);
    graphics.strokeWeight(10);
    graphics.push();
    graphics.rotateY(this.angleY);
    graphics.rotateZ(this.angleZ);
    for(let i = 0; i<this.points.length; i++){
      graphics.point(this.radius*this.points[i].x,this.points[i].y,this.radius*this.points[i].z);
    }
    graphics.pop();
  }
}

class Point{
  constructor(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
  }
}
  
