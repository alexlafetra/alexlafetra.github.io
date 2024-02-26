/*

  simulating leaf vascular system patterns?
  from this: https://nph.onlinelibrary.wiley.com/doi/10.1111/nph.17955
  diagram it looks like veins should basically always arc across the largest distance
  possible between two leaf/vein edges

  1. texture containing monochrome diagram of leaf (white == leaf) as a mask
  2. texture containing monochrome diagram of current venation (red == veins)
    - there's always a first-order vein from the petiole to the leaf axis (what about leaves w multiple axes?)
  3. shader that colors leaf tissue by distance to a vein (gradient map from red --> blue)
    - idea here is to color leaf pixels by how "thirsty" they are
  4. areas that are beyond a thirstiness threshold need a vein! soo...
    - 

*/

let canv;
let lastMousePos;
let begun = false;
let thirstShader;

function setup(){
  canv = createCanvas(400,400,WEBGL);
  background(0);
  lastMousePos = {x:mouseX,y:mouseY};
}
function mouseDragged(){
  if(begun){
    stroke(255);
    strokeWeight(4);
    line(mouseX-width/2,mouseY-height/2,lastMousePos.x-width/2,lastMousePos.y-height/2);
  }
  lastMousePos = {x:mouseX,y:mouseY};
  begun = true;
}
function mouseReleased(){
  begun = false;
}
function draw(){

}

//Identity function so I can tag string literals with the glsl marker
const glsl = x => x;