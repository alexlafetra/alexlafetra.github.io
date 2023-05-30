let m1;
let m2;
let m3;
let m4;

function faceMouse(){
  rotateY((mouseX-windowWidth/2)/windowWidth);
  rotateX((-mouseY+windowHeight/2)/windowHeight);
}

function preload() {
  //m1 = loadModel('assets/topv0.16.stl');
  //m2 = loadModel('assets/Back_Shell_V0.4.stl');
  //m3 = loadModel('assets/zella_test2.stl');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  m4 = loadModel('3d_models/test.stl');
}

function draw() {
  background(0);
  faceMouse();
  scale(5);
  rotateX(PI/2);
  // rotateY(PI/2);
  // rotateZ(PI/3);
  // rotateX(frameCount*0.001);
  // rotateY(frameCount*0.001);
  normalMaterial();
  // ambientLight(255,0,0);
  // ambientMaterial(200,200,200);
  //model(m1);
  //model(m2);
  //model(m3);
  model(m4);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}