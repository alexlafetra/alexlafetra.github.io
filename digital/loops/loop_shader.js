let loops;
let cam;
let canv;
let numberOfLoops = 10;
let paused = false;

let graphicsBuffer;
let graphics;
let img;
let smear = 8;

let shader;

let sc = 2;

function setup() {
  canv = createCanvas(800,800);
  canv.style('margin','auto');
  canv.style('display','block');
  
  graphicsBuffer = createGraphics(width,height,WEBGL);
  graphics = createGraphics(width,height,WEBGL);
  
  shader = graphicsBuffer.createShader(vert,frag);
  
  //canv.style('margin-top','20vh');
  //cam = graphics.createEasyCam();
  //document.oncontextmenu = ()=>false;  
  loops = [];
  for(let i = 0; i<numberOfLoops; i++){
    loops[i] = new Loop(random(100.0,120.0),8);
  }
  let bigLoop = new Loop(100.0,12)
  bigLoop.thickness = 20;
  bigLoop.noiseAmplitude = 1;
  loops.push(bigLoop);
  graphics.scale(sc);
  graphics.rotateX(-radians(30));
  graphics.rotateY(-radians(30));
  graphics.rotateZ(radians(30));
}

function draw() {
  graphics.clear();
  graphicsBuffer.clear();
  for(let loop of loops){
    loop.render();
    loop.update();
  }
  smear = 10*mouseX/width;
  //graphics.clear(0,0,0,0);
  updateShader();
  image(graphicsBuffer,0,0);
}

function updateShader(){
  graphicsBuffer.shader(shader);
  
  shader.setUniform("tex",graphics);
  shader.setUniform("resolution",[width,height]);
  shader.setUniform("direction",[smear,smear]);
  graphicsBuffer.rect(0,0,width,height);
  
  //shader.setUniform("tex",graphicsBuffer);
  //shader.setUniform("direction",[-smear,-smear]);
  //graphicsBuffer.rect(0,0,width,height);
}

class Loop{
  constructor(radius,numberOfPoints){
    this.radius = float(radius);
    //stroke thickness
    this.thickness = 2;
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
    this.angleX = this.angleIncrementX*radians(10*sin(frameCount/10.0));
    this.angleY += radians(this.angleIncrementY);
    this.angleZ += radians(this.angleIncrementZ);
    
    //wiggle points
    for(let p of this.points){
      p.y = (this.heightAmplitude+this.noiseAmplitude)/10*noise(p.x,frameCount/60,p.z)+4*sin(frameCount/10.0+this.angleY);
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
    const r = random(-this.jitterAmplitude,this.jitterAmplitude)/25;
    graphics.translate(r,r,r);
    graphics.beginShape();
    // graphics.texture();
    graphics.curveVertex(this.radius*this.points[0].x,this.points[0].y,this.radius*this.points[0].z);
    for(let point of this.points){
      graphics.curveVertex(this.radius*point.x,point.y,this.radius*point.z);
    }
    graphics.curveVertex(this.radius*this.points[0].x,this.points[0].y,this.radius*this.points[0].z);
    graphics.curveVertex(this.radius*this.points[1].x,this.points[1].y,this.radius*this.points[1].z);
    graphics.endShape();
    graphics.pop();
  }
  renderPoints(){
    graphics.stroke(255);
    graphics.strokeWeight(10);
    graphics.push();
    graphics.rotateY(this.angleY);
    graphics.rotateZ(this.angleZ);
    graphics.texture();
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
  
