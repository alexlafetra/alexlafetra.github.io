let cellList = [];
let wallThickness = 100;
let pressureMag = 10;
let gravMag = 0;
let mouseMag = 2;

let mouseSlider,gravSlider,wallSlider,pressureSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  scale(10);
  background(0);
}

function draw() {
  translate(windowWidth/2,windowHeight/2);
  colorMode(RGB);
  background(255);
  //blendMode(LIGHTEST);
  for(let i = 0; i<cellList.length; i++){
    cellList[i].update();
    cellList[i].showCurve();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed(){
  let cell = new Cell(-windowWidth/2+mouseX,-windowHeight/2+mouseY,random(40,200),millis()%400);
  cellList[cellList.length] = (cell);
}