let stl;
let currentScale;
const maxScale = 2;

function setup() {
  createCanvas(475,450, WEBGL);
  stl = loadModel('../3d_models/test.stl');
  currentScale = windowWidth/300;
}

function draw() {
  background(255);
  scale(currentScale>maxScale?maxScale:currentScale);
  rotateX(PI/2);
  rotateX(frameCount*0.01);
  rotateY(frameCount*0.01);
  normalMaterial();
  model(stl);
}
function windowResized(){
    currentScale = windowWidth/300;
}