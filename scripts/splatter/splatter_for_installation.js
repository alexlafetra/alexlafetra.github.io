let cellList = [];
let wallThickness = 0;
let pressureMag = 10;
let gravMag = 0;
let mouseMag = 0;
let minDistance = 40;

function setup() {
  createCanvas(600, 600);
  background(255);
  splatter();
}
function draw() {
  translate(width/2,height/2);
  colorMode(RGB);
  background(255);
  blendMode(MULTIPLY);
  for(let i = 0; i<cellList.length; i++){
    cellList[i].update();
    cellList[i].showCurve();
  }
}
function splatter(){
  const numberOfSplatters = 5;
  const minX = 0.8;
  const maxX = 0.9;
  const minY = 0.1;
  const maxY = 0.2;
  cellList = [];
  for(let i = 0; i<numberOfSplatters; i++){
    let x =  random(minX*width,maxX*width);
    let y = random(minY*height,maxY*height);
    cellList[i] = new Cell(-width/2+x,-height/2+y,random(0,100),i*(400/numberOfSplatters));
  }
}
