let cell;

function setup() {
  cell = new Cell();
  createCanvas(windowWidth, windowHeight);
  background(255);
  blendMode(DIFFERENCE);
}


function draw() {
  translate(windowWidth/2,windowHeight/2);
  // colorMode(RGB);
  // background(0);
  cell.update();
  cell.show();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight,true);
  // colorMode(RGB);
  // background(0,0,0,200);
}
