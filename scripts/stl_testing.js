//draw a spinning octahedron
let mod;
let canv
const maxWidth = 800;
let size;

function faceMouse(){
  rotateY((mouseX-width/2)/width);
  rotateX((-mouseY+height/2)/height);
}

function preload() {
  mod = loadModel('scripts/assets/stepchild_lowpoly.stl');
}

function setup() {
  // size = windowWidth<maxWidth?windowWidth:maxWidth;
  size = windowWidth;
  canv = createCanvas(size, windowHeight, WEBGL);
}

function draw() {
//   background(0);
  canv.clear();
  scale((size>maxWidth?maxWidth:size)*3/maxWidth);

  rotateX(frameCount*0.01);
  rotateY(frameCount*0.01);
  normalMaterial();

  model(mod);
}

function windowResized(){
  // size = windowWidth<maxWidth?windowWidth:maxWidth;
  size = windowWidth;
  resizeCanvas(size,windowHeight);
}