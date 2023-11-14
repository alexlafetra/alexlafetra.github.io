let cellList = [];
let wallThickness = 100;
let pressureMag = 10;
let gravMag = 200;
let mouseMag = 10;
let minDistance = 40;

let mouseSlider,gravSlider,wallSlider,pressureSlider,minDistanceSlider;

let canv;
function createSliders(){
  //minDistanceSlider = createSlider(20,1000,20);
  //wallSlider = createSlider(0,1000,100);
  //mouseSlider = createSlider(0,100,2);
  //gravSlider = createSlider(0,100,0);
  //pressureSlider = createSlider(0,100,10);
}

function updateSliders(){
  //minDistance = minDistanceSlider.value();
  //wallThickness = wallSlider.value();
  //pressureMag = pressureSlider.value();
  //gravMag = gravSlider.value();
  //mouseMag = mouseSlider.value();
}

function setup() {
  canv = createCanvas(windowWidth, windowHeight);
  //background(0);
  //background(255);
  createSliders();
}

let light = true;
function draw() {
  translate(windowWidth/2,windowHeight/2);
  colorMode(RGB);
  //background(255,255,255,5);
  if(light){
    background(255);
    blendMode(MULTIPLY);
  }
  else{
    blendMode(LIGHTEST);
    background(0);
  }
  for(let i = 0; i<cellList.length; i++){
    cellList[i].update();
    cellList[i].showCurve();
  }
  updateSliders();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function person(){
  let h = -windowHeight/2+mouseY;
  //0 and 250 work well
  let c1 = random(0,400);
  let c2 = (c1+200)%400;
  let bod = random(50,150);
  let cell1 = new Cell(-windowWidth/2+mouseX,h,bod,c1);
  let cell2 = new Cell(-windowWidth/2+mouseX,h-80,bod/3,c2);
  cellList[cellList.length] = cell1;
  cellList[cellList.length] = cell2;
}
function mouseClicked(){
  person();
}
function keyPressed(){
  if(key == " "){
    clear();
    cellList = [];
  }
  else{
    light = !light;
    clear();
  }
}
