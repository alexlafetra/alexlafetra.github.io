let cellList = [];
let wallThickness = 100;
let pressureMag = 10;
let gravMag = 0;
let mouseMag = 0;
let minDistance = 40;

let showingControls = false;
let light = true;
function setup() {
  createCanvas(windowWidth,windowHeight);
  background(255);
}
function draw() {
  translate(width/2,height/2);
  colorMode(RGB);
  if(light){
    background(255);
    blendMode(MULTIPLY);
  }
  else{
    blendMode(SCREEN);
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
function splatter(){
  let numberOfSplatters = 5;
  wallThickness = random(0,height/2);
  cellList = [];
  for(let i = 0; i<numberOfSplatters; i++){
    let x =  random(mouseX-20,mouseX+20)-width/2;
    let y = random(mouseY-20,mouseY+20)-height/2;
    cellList[i] = new Cell(x,y,random(0,200),i*(400/numberOfSplatters));
  }
}
function mousePressed(){
    splatter();
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
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