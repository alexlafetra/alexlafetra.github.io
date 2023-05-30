let cellList = [];
let wallThickness = 100;
let pressureMag = 10;
let gravMag = 200;
let mouseMag = 10;
let minDistance = 40;

let mouseSlider,gravSlider,wallSlider,pressureSlider,minDistanceSlider;

let canv;
function setup() {
  canv = createCanvas(windowWidth, windowHeight);
  //background(0);
  //background(255);
}

let light = true;
let showingControls = false;
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
  if(showingControls){
    drawControls();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function person(){
  let h = -windowHeight/2+mouseY;
  //0 and 250 work well
  let c1 = random(0,400);
  // let c2 = (c1+200)%400;
  let c2 = (c1+random(200,400))%400;
  let bod = random(50,150);
  let cell1 = new Cell(-windowWidth/2+mouseX,h,bod,c1);
  let cell2 = new Cell(-windowWidth/2+mouseX,h-80,bod/3,c2);
  // let arm1 = new Cell(-windowWidth/2+mouseX-bod/3,h+10,20,c1);
  // let arm2 = new Cell(-windowWidth/2+mouseX+bod/3,h+10,20,c1);

  cellList[cellList.length] = cell1;
  cellList[cellList.length] = cell2;
  // cellList[cellList.length] = arm1;
  // cellList[cellList.length] = arm2;
}
function mousePressed(){
  person();
}
function drawControls(){
  textSize(20);
  noStroke();
  if(light){fill(0);}
  else{fill(255);}
  text("click or press!",20-width/2,-height/2+textAscent());
  text("press 'space' to clear the canvas",20-width/2,-height/2+2*textAscent());
  text("press 'i' to swap between light and dark blend modes (this will also clear the canvas!)",20-width/2,-height/2+3*textAscent());
  text("press 'h' to hide/show these instructions (this will also clear the canvas!)",20-width/2,-height/2+4*textAscent());
}
function keyPressed(){
  //'space' to clear
  if(key == " "){
    clear();
    cellList = [];
  }
  //'i' to invert
  else if(key == "i"){
    light = !light;
    clear();
    cellList = [];
  }
  else if(key == "h"){
    showingControls = !showingControls;
    clear();
    cellList = [];
  }
}