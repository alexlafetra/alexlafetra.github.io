/*
  This script grabs the lowpoly3D model of the stepchild and 
  rotates it on a transparent canvas
*/

let mod;
let canv
const maxWidth = 800;
let size;

function faceMouse(){
  rotateY((mouseX-width/2)/width);
  rotateX((-mouseY+height/2)/height);
}

function preload() {
  mod = loadModel('assets/stepchild_lowpoly.stl');
}

function setup() {
  size = windowWidth;
  canv = createCanvas(size, windowHeight, WEBGL);
}

function draw() {
  canv.clear();
  scale((size>maxWidth?maxWidth:size)*2/maxWidth);

  rotateX(frameCount*0.01);
  rotateY(frameCount*0.01);

  // rotateX(2*PI/3);
  // faceMouse();

  normalMaterial();

  model(mod);
}

function windowResized(){
  size = windowWidth;
  resizeCanvas(size,windowHeight);
}

function keyPressed(){
  //let obj = {delay:0,units:'frames;'};
  //saveGif("gif",360,obj);
  saveGif('gif',3);
}