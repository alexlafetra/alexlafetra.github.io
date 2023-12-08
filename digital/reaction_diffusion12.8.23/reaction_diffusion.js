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
let computePasses = 6;

let brushRadius = 0.02;
let stepSize = 0.3;
let dA = 1.1;
let dB = 0.5;
let k = 0.06;
let f = 0.04;
let dT = 1.0;

//post-processing colors
let pallette = [
  1.00, 1.00, 1.00,
  0.0, 0.40, 0.80,
  0.20, 0.00, 0.20,
  1.00, 0.00, 0.00,
  0.50, 0.25, 0.12,     
  0.00, 0.00, 0.00,
  0.00, 0.00, 0.00
];

//Sliders/controls
let stepSlider;
let aSlider;
let bSlider;
let kSlider;
let fSlider;
let tSlider;
let resetButton;
let mouseHeld = false;

let font;

//preload your shader files
function preload(){
  reactionDiffusionShader = loadShader('rxn.vert','rxn.frag');
  beautyShader = loadShader('aesthetic.vert','aesthetic.frag');
  font = loadFont('Inconsolata.otf');
}

//this...ain't working. But it should clear out the graphics buffers
//and reset the sim parameters/sliders
function reset(){
  computeLayer.begin();
  background(0);
  computeLayer.end();
}

//create the input sliders + reset button
function createSliders(){
  stepSlider = createSlider(0.01,10,stepSize,0.01);
  aSlider = createSlider(0,2,dA,0.01);
  bSlider = createSlider(0,2,dB,0.01);
  kSlider = createSlider(0,0.2,k,0.01);
  fSlider = createSlider(0,0.2,f,0.01);
  tSlider = createSlider(0,1,dT,0.01);
  resetButton = createButton("reset");
  resetButton.mousePressed(reset);
}

//grab values from sliders and load into sim
function updateSliders(){
  stepSize = stepSlider.value();
  dA = aSlider.value();
  dB = bSlider.value();
  k = kSlider.value();
  f = fSlider.value();
  dT = tSlider.value();
}

function setup() {

  mainCanvas = createCanvas(1200,600,WEBGL);
  createSliders();

  //create framebuffers
  renderLayer = createFramebuffer(width/2,height,{format:FLOAT});
  computeLayer = createFramebuffer(width/2,height,{format:FLOAT});
  displayLayer = createFramebuffer(width/2,height,{format:FLOAT});

  //Not sure what these do! keeping them around just in case
  // mainCanvas.getTexture(computeLayer).setInterpolation(LINEAR,LINEAR);
  // mainCanvas.getTexture(renderLayer).setInterpolation(LINEAR,LINEAR);
  // mainCanvas.getTexture(displayLayer).setInterpolation(LINEAR,LINEAR);
  textFont(font);
  textSize(40);
  textAlign(CENTER);
  pixelDensity(1);
}

function mousePressed(){
  mouseHeld = true;
}
function mouseReleased(){
  mouseHeld = false;
}

//Cuts mouse position in half so it renders over double-canvas
function getMouseX(){
  let m = mouseX;
  if(m>width/2)
    m-=width/2;
  return 2*m/width;
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
    reactionDiffusionShader.setUniform('uBrushRadius',brushRadius);
    reactionDiffusionShader.setUniform('uFramecount',frameCount);
    reactionDiffusionShader.setUniform('stepSize',[stepSize/(width*pixelDensity()),stepSize/(height*pixelDensity())]);
    reactionDiffusionShader.setUniform('dA',dA);
    reactionDiffusionShader.setUniform('dB',dB);
    reactionDiffusionShader.setUniform('k',k);
    reactionDiffusionShader.setUniform('f',f);
    reactionDiffusionShader.setUniform('dT',dT);
    //drawing geometry
    quad(-1, 1, 1, 1, 1, -1, -1, -1);
    renderLayer.end();
    //swap render and compute layers
    [renderLayer,computeLayer] = [computeLayer,renderLayer];
  }

  displayLayer.begin();
  shader(beautyShader);
  beautyShader.setUniform('uTexture',renderLayer);
  beautyShader.setUniform('uColorPallette',pallette);
  beautyShader.setUniform('uResolution',[width*pixelDensity(),height*pixelDensity()]);
  // quad(-1, 1, 1, 1, 1, -1, -1, -1);
  rect(-width/2,-height/2,width,height);
  displayLayer.end();

  //drawing the render layer to the main canvas
  image(renderLayer, -width/2, -height/2, width/2, height);
  image(displayLayer, 0, -height/2, width/2, height);
}