let cell;

function setup() {
  cell = new Cell();
  createCanvas(windowWidth, windowHeight);
  //background(0);
  //blendMode(BURN);
  blendMode(DIFFERENCE);
}


function draw() {
  translate(windowWidth/2,windowHeight/2);
  colorMode(RGB);
  //background(255);
  cell.update();
  cell.show();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
