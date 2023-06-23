let cellList = [];
let wallThickness = 100;
let pressureMag = 10;
let gravMag = 0;
let mouseMag = 10;
let minDistance = 40;

let mouseSlider,gravSlider,wallSlider,pressureSlider,minDistanceSlider;

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
let lastTime;
let light = true;
function setup() {
  createCanvas(windowWidth, windowHeight);
  //background(0);
  createSliders();
  lastTime = millis();
  textAlign(CENTER);
}

function draw() {
  translate(width/2,height/2);
  colorMode(RGB);
  background(0,0,0,4);
  if(light){
    blendMode(BLEND);
  }
  else{
    blendMode(DIFFERENCE);
  }
  if((millis()-lastTime)>500){
    if(cellList.length>4){
      for(let i = 0; i<cellList.length-1; i++){
        cellList[i] = cellList[i+1];
      }
      let cell = new Cell(0,0,random(50,600),random(0,400));
      cellList[4] = cell;
    }
    else{
      let cell = new Cell(0,0,random(50,200),random(0,400));
      cellList[cellList.length] = cell;
    }
    lastTime = millis();
  }
  for(let i = 0; i<cellList.length; i++){
    cellList[i].update();
    cellList[i].showCurve();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed(){
    clear();
    light = !light;
}