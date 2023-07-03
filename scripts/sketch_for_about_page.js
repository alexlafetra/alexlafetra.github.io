let cell;

function setup() {
  cell = new Cell();
  createCanvas(1000,1000);
  // background(255);
  blendMode(DIFFERENCE);
}


function draw() {
  // translate(windowWidth/2,windowHeight/2);
  scale(0.5);
  // colorMode(RGB);
  // background(0);
  cell.update();
  cell.show();
}

// function windowResized() {
  // resizeCanvas(windowWidth, windowHeight,true);
// }
