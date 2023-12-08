/*
  Experiments with the reaction-diffusion equation
*/

//Main canvas
let mainCanvas;

//main shader, and the post processing shader
let reactionDiffusionShader;
let beautyShader;

//Used to store the renderable data
let renderLayer;
//Used to compute the render layer
let computeLayer;
//Used to render the pretty graphics
let displayLayer;

//simulation controls
let computePasses = 4;

let brushRadius = 0.02;
let stepSize = 0.9;
let dA = 1.1;
let dB = 0.5;
let k = 0.06;
let f = 0.04;
let dT = 1.0;

//post-processing colors

//Oil goes cyan/turqoise --> purple -->orange/yellow --> red
// R     G      B    A
let pallette3 = [
  1.00, 1.00, 1.00, 1.0,
  0.20, 0.80, 0.20, 1.0,
  0.20, 0.80, 1.00, 1.0,
  0.80, 0.80, 0.20, 1.0,    
  0.80, 0.25, 0.00, 1.0,    
  0.00, 0.00, 0.00, 0.5,
  0.00, 0.00, 0.00, 0.1
];
let pallette = [
  0.00, 0.00, 0.00, 1.0,
  0.20, 0.00, 0.00, 1.0,
  0.20, 0.80, 1.00, 1.0,
  0.80, 0.80, 0.20, 1.0,    
  0.80, 0.25, 0.00, 1.0,    
  1.00, 1.00, 1.00, 1.0,
  1.00, 1.00, 1.00, 1.0
];
let pallette2 = [
  0.00, 0.00, 0.00, 1.0,
  0.10, 0.00, 0.10, 1.0,
  0.20, 0.60, 0.20, 1.0,
  0.00, 0.00, 1.00, 1.0,
  0.80, 0.25, 0.20, 1.0,    
  1.00, 1.00, 1.00, 1.0,
  1.00, 1.00, 1.00, 1.0
];
// R     G      B    A
let pallette1 = [
  1.00, 1.00, 1.00, 1.0,
  0.00, 0.40, 0.80, 1.0,
  0.20, 0.00, 0.20, 1.0,
  1.00, 0.00, 0.00, 1.0,
  0.50, 0.25, 0.12, 1.0,    
  0.00, 0.00, 0.00, 1.0,
  0.00, 0.00, 0.00, 1.0
];

//Sliders/controls
let stepSlider;
let aSlider;
let bSlider;
let kSlider;
let fSlider;
let tSlider;
let computeSlider;
let resetButton;
let swapPalletteButton;
let randomColorButton;
let mouseHeld = false;
let lastMousePos;

let showRenderLayer = false;
let petriDish = false;

let font;
let img;

//preload your shader files
function preload(){
  reactionDiffusionShader = loadShader('rxn.vert','rxn.frag');
  beautyShader = loadShader('aesthetic.vert','aesthetic.frag');
  font = loadFont('SourceSansPro-Regular.otf');
  img = loadImage('test.png');
}

//should clear out the graphics buffers
//and reset the sim parameters/sliders
function reset(){
  computeLayer.begin();
  background(0);
  computeLayer.end();
}

const MAXWIDTH = 600;
const MAXHEIGHT = 600;
function windowResized(){
  resizeCanvas(min(windowWidth,MAXWIDTH),min(windowHeight,MAXHEIGHT));
  //recreate framebuffers
  renderLayer = createFramebuffer(width,height,{format:FLOAT});
  computeLayer = createFramebuffer(width,height,{format:FLOAT});
  displayLayer = createFramebuffer(width,height,{format:FLOAT});
}

function randPallette(){
  let newPallette = [];
  for(let i = 0; i<pallette.length; i++){
    newPallette.push(random(0.0,1.0));
  }
  pallette = newPallette;
}

function swapPallette(){
  [pallette,pallette3] = [pallette3,pallette];
}

//create the input sliders + reset button
function createSliders(){
  const controls = createDiv();
  controls.id("controls");

  stepSlider = new LabeledSlider(0.01,10,stepSize,0.01,"Diffusion Radius");
  aSlider = new LabeledSlider(0,2,dA,0.01,"dA");
  bSlider = new LabeledSlider(0,2,dB,0.01,"dB");
  kSlider = new LabeledSlider(0,0.2,k,0.001,"kill");
  fSlider = new LabeledSlider(0,0.2,f,0.001,"feed");
  tSlider = new LabeledSlider(0,1,dT,0.01,"dT");
  computeSlider = new LabeledSlider(1,15,computePasses,1,"Compute Passes");

  resetButton = createButton("Clear");
  resetButton.mousePressed(reset);
  resetButton.parent(controls);

  swapPalletteButton = createButton("Swap Color");
  swapPalletteButton.mousePressed(swapPallette);
  swapPalletteButton.parent(controls);

  randomColorButton = createButton("Randomize Pallette");
  randomColorButton.mousePressed(randPallette);
  randomColorButton.parent(controls);

  petriButton = createButton("Put it in a dish");
  petriButton.mousePressed(() => {petriDish = !petriDish;});
  petriButton.parent(controls);

}

const CLOSEHEIGHT = '-220px';
const OPENHEIGHT = '0px';


function keyPressed(){
  const panel = document.getElementById("controls");
  if(panel.style.top == CLOSEHEIGHT){
    panel.style.top = OPENHEIGHT;
  }
  else{
    panel.style.top = CLOSEHEIGHT;
  }
}
//grab values from sliders and load into sim
function updateSliders(){
  stepSize = stepSlider.value();
  dA = aSlider.value();
  dB = bSlider.value();
  k = kSlider.value();
  f = fSlider.value();
  dT = tSlider.value();
  computePasses = computeSlider.value();
}

function setup() {

  mainCanvas = createCanvas(min(windowWidth,MAXWIDTH),min(windowHeight,MAXHEIGHT),WEBGL);
  createSliders();

  //create framebuffers
  renderLayer = createFramebuffer(width,height,{format:FLOAT});
  computeLayer = createFramebuffer(width,height,{format:FLOAT});
  displayLayer = createFramebuffer(width,height,{format:FLOAT});

  //Not sure what these do! keeping them around just in case
  // mainCanvas.getTexture(computeLayer).setInterpolation(LINEAR,LINEAR);
  // mainCanvas.getTexture(renderLayer).setInterpolation(LINEAR,LINEAR);
  // mainCanvas.getTexture(displayLayer).setInterpolation(LINEAR,LINEAR);

  textFont(font);
  textSize(200);
  textAlign(CENTER);
  pixelDensity(1);

  lastMousePos = createVector(mouseX,mouseY);
  initializeComputeLayer();
}

//creating some initial geometry to diffuse from
function initializeComputeLayer(){
  computeLayer.begin();
  background(0,255,0);
  fill(255,0,0);
  strokeWeight(200);
  stroke(255,0,0);
  text("rxn",0,75);
  // image(img,-width/2,-height/2,width,height);
  computeLayer.end();
}

function mousePressed(){
  mouseHeld = true;
}
function mouseReleased(){
  mouseHeld = false;
}

//measures the distance between two mouse positions
function getMouseSpeed(){
  //turning it into a vector bc i'm lazy and don't want to write a distance function
  let currentMousePos = createVector(mouseX,mouseY);
  const distance = p5.Vector.dist(currentMousePos,lastMousePos);
  lastMousePos = currentMousePos;
  return distance/width;
}

//Cuts mouse position in half so it renders over double-canvas
function getMouseX(){
  // let m = mouseX;
  // if(m>width/2)
  //   m-=width/2;
  // return 2*m/width;
  return mouseX/width;
}

function draw() {
  updateSliders();

  //running the computation in multiple passes to speed up reaction
  for(let i = 0; i<computePasses; i++){
    //rendering onto the render layer
    renderLayer.begin();
    shader(reactionDiffusionShader);
    reactionDiffusionShader.setUniform('uComputeTexture',computeLayer);
    reactionDiffusionShader.setUniform('uResolution',[width*pixelDensity(),height*pixelDensity()]);
    reactionDiffusionShader.setUniform('uMouse',[getMouseX(),mouseY/(height)]);
    reactionDiffusionShader.setUniform('uMouseHeld',mouseHeld);
    reactionDiffusionShader.setUniform('uBrushRadius',mouseHeld?getMouseSpeed():max(getMouseSpeed(),0.01));
    reactionDiffusionShader.setUniform('uFramecount',frameCount);
    reactionDiffusionShader.setUniform('uPetriDish',petriDish);
    reactionDiffusionShader.setUniform('stepSize',[stepSize/(width*pixelDensity()),stepSize/(height*pixelDensity())]);
    reactionDiffusionShader.setUniform('dA',dA);
    reactionDiffusionShader.setUniform('dB',dB);
    reactionDiffusionShader.setUniform('k',k);
    reactionDiffusionShader.setUniform('f',f);
    reactionDiffusionShader.setUniform('dT',dT);
    //drawing geometry
    rect(-renderLayer.width/2,-renderLayer.height/2,renderLayer.width,renderLayer.height);
    renderLayer.end();
    //swap render and compute layers
    [renderLayer,computeLayer] = [computeLayer,renderLayer];
  }

  displayLayer.begin();
  shader(beautyShader);
  beautyShader.setUniform('uTexture',renderLayer);
  beautyShader.setUniform('uComputeTexture',computeLayer);
  beautyShader.setUniform('uColorPallette',pallette);
  beautyShader.setUniform('uPetriDish',petriDish);
  beautyShader.setUniform('uResolution',[width*pixelDensity(),height*pixelDensity()]);
  rect(-width/2,-height/2,width,height);
  displayLayer.end();

  image(displayLayer, -width/2, -height/2, width, height);

  //drawing the render layer to the main canvas
  if(showRenderLayer)
    image(renderLayer, -width/2, -height/2, width/4, height/4);

  //For testing:
  // image(computeLayer, -width/2, -height/2, width/2, height);
}