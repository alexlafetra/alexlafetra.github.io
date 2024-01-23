//input text --> output a barcode
let bits;
let input = 2568;
const rWidth = 3;
const rHeight = 300;
const max = 100000000000000000;

function drawBarcode(){
  background(0);
  input = floor(random(max));
  bits = [Math.log2(input)];
  let i = 0;
  let temp = input;
  while(temp>=1){
    bits[i] = temp & 1;
    temp/=2;
    i++;
  }
  let txt = "";
  for(let i = 0; i<bits.length;i++){
    if(bits[i]){
      fill(255);
      txt += "1";
    }
    else{
      fill(0);
      txt += "0";
    }

    rect(i*rWidth-rWidth*bits.length/2,0,rWidth,rHeight);
  }
  textAlign(CENTER);
  // text(input,0,-rHeight-20);
  // text(txt,0,+rHeight+20);
}
function mouseClicked(){
  drawBarcode();
}
function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
  drawBarcode();
}
let font;

function setup() {
  frameRate(1);
  pixelDensity(1);
  createCanvas(600,600,WEBGL);
  rectMode(CENTER);
  noStroke();
  drawBarcode();
}

function draw() {
  drawBarcode();
}
