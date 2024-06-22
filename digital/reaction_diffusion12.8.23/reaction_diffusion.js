/*
  Experiments with the reaction-diffusion equation
*/

//Main canvas
let mainCanvas;

//main shader, and the post processing shader
let reactionDiffusionShader;
let beautyShader;
let embossShader;

//Used to store the renderable data
let renderLayer;
//Used to compute the render layer
let computeLayer;
//Used to render the pretty graphics
let displayLayer;
let embossLayer;

//simulation controls
let computePasses = 4;

let brushRadius;
let stepSize;
let dA;
let dB;
let k;
let f;
let dT;

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

// R     G      B    A
let bwPallette = [
  0.00, 0.00, 0.00, 1.0,
  0.00, 0.00, 0.00, 1.0,
  0.60, 0.60, 0.60, 1.0,
  0.70, 0.70, 0.70, 1.0,
  0.90, 0.90, 0.90, 1.0,
  1.00, 1.00, 1.00, 1.0,
  1.0, 1.0, 1.0, 1.0
];
let bwPallette1 = [
  0.80, 0.80, 0.80, 1.0,
  0.40, 0.40, 0.40, 1.0,
  0.30, 0.30, 0.30, 1.0,
  0.20, 0.20, 0.20, 1.0,
  0.10, 0.10, 0.10, 1.0,
  0.00, 0.00, 0.00, 1.0,
  0.00, 0.00, 0.00, 1.0
];

let shineScale = 13.0;

let blackAndWhite = false;
let showRenderLayer = false;
let petriDish = false;
let embossed = false;

let font;
let img;

// const defaultParams = {stepSize:1.0,dA:1,dB:0.2,k:0.06,f:0.04,dT:1,computePasses:4};
const defaultParams = {stepSize:2.72,dA:0.45,dB:0.4,k:0.0431,f:0.12,dT:1,computePasses:4};
//preload your shader files
function preload(){
  reactionDiffusionShader = loadShader('rxn.vert','rxn.frag');
  beautyShader = loadShader('aesthetic.vert','aesthetic.frag');
  embossShader = loadShader('aesthetic.vert','emboss.frag');
  font = loadFont('SourceSansPro-Regular.otf');
}

//should clear out the graphics buffers
//and reset the sim parameters/sliders
function reset(){
  loadParameters(defaultParams);
}

function clearScreen(){
  computeLayer.begin();
  background(0);
  computeLayer.end();
}

const MAXWIDTH = 1000;
const MAXHEIGHT = 1000;
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

function fillScreen(){
  computeLayer.begin();
  background(0,255,0);
  fill(255,0,0);
  const rnd = random(0,20);
  for(let i = 0; i<rnd; i++){
    ellipse(random(-width/2,width/2),random(-width/2,width/2),random(1,100),random(1,100));
  }
  computeLayer.end();
}

function setup() {

  mainCanvas = createCanvas(min(windowWidth,MAXWIDTH),min(windowHeight,MAXHEIGHT),WEBGL);
  createSliders();
  loadParameters(defaultParams);

  //create framebuffers
  renderLayer = createFramebuffer(width,height,{format:FLOAT});
  computeLayer = createFramebuffer(width,height,{format:FLOAT});
  displayLayer = createFramebuffer(width,height,{format:FLOAT});
  embossLayer = createFramebuffer(width,height,{format:FLOAT});


  //Not sure what these do! keeping them around just in case
  // mainCanvas.getTexture(computeLayer).setInterpolation(LINEAR,LINEAR);
  // mainCanvas.getTexture(renderLayer).setInterpolation(LINEAR,LINEAR);
  // mainCanvas.getTexture(displayLayer).setInterpolation(LINEAR,LINEAR);

  textFont(font);
  textSize(200);
  textAlign(CENTER);
  pixelDensity(1);

  lastMousePos = createVector(mouseX,mouseY);
  initializeComputeLayer("rxn");
}

function keyPressed(){
  initializeComputeLayer(key);
}

//creating some initial geometry to diffuse from
function initializeComputeLayer(string){
  computeLayer.begin();
  background(0,255,0);
  fill(255,0,0);
  strokeWeight(200);
  stroke(255,0,0);
  text(string,0,75);
  // image(img,-width/2,-height/2,width,height);
  computeLayer.end();
}

function drawToDummyLayer(string){
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
    reactionDiffusionShader.setUniform('uBrushRadius',max(getMouseSpeed(),0.01));
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
  beautyShader.setUniform('uColorPallette',blackAndWhite?bwPallette:pallette);
  beautyShader.setUniform('uPetriDish',petriDish);
  beautyShader.setUniform('uResolution',[width*pixelDensity(),height*pixelDensity()]);
  rect(-width/2,-height/2,width,height);
  displayLayer.end();

  image(displayLayer, -width/2, -height/2, width, height);



  if(embossed){
    embossLayer.begin();
    clear();
    shader(embossShader);
    embossShader.setUniform('uTexture',renderLayer);
    embossShader.setUniform('uShineScale',shineScale);
    embossShader.setUniform('uResolution',width);

    rect(-width/2,-height/2,width,height);
    embossLayer.end();
    image(embossLayer, -width/2, -height/2, width, height);
  }

  //drawing the render layer to the main canvas
  if(showRenderLayer)
    image(renderLayer, -width/2, -height/2, width/4, height/4);
}