//needs: subdivided squares
//and better collision
//and dynamic pressure based on incompressible inner fluid

let cellList = [];
let wallThickness = 100;
let pressureMag = 20;
let gravMag = 0;
let mouseMag = 10;
let minDistance = 20;

let mouseSlider,gravSlider,wallSlider,pressureSlider,minDistanceSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  //cellList[0] = new Cell(0,0,300,millis()%400);
  //createSliders();
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
  //updateSliders();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//toggling things
function mousePressed(){
  let cell = new Cell(-windowWidth/2+mouseX,-windowHeight/2+mouseY,random(40,300),millis()%400);
  cellList[cellList.length] = (cell);
}

function keyPressed(){
  //'space' to clear
  if(key == " "){
    clear();
    cellList = [];
  }
}

//sliders
function createSliders(){
  minDistanceSlider = createSlider(20,1000,20);
  wallSlider = createSlider(0,1000,100);
  mouseSlider = createSlider(0,100,2);
  gravSlider = createSlider(0,100,0);
  pressureSlider = createSlider(0,100,10);
}

function updateSliders(){
  minDistance = minDistanceSlider.value();
  wallThickness = wallSlider.value();
  pressureMag = pressureSlider.value();
  gravMag = gravSlider.value();
  mouseMag = mouseSlider.value();
}
