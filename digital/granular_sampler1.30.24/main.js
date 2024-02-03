let flock;
let mapTexture;
let holcTexture;

let gl;
let mainCanvas;
let tractOutlines;
let idBuffer;
let ids;

let showParticles = true;
let showFlowMap = false;
let continouslyRandomizeAttractors = true;


function setup(){
  //create canvas and grab webGL context
  setAttributes('antialias',false);
  pixelDensity(1);
  mainCanvas = createCanvas(1000,1000,WEBGL);
  gl = mainCanvas.GL;

  randomShader = createShader(defaultVert,randomFrag);

  flock = new Flock();
}


function draw(){
  flock.update();
  flock.renderGL();
  flock.renderData();
}