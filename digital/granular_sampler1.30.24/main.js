let flock;
let gl;
let mainCanvas;
let idBuffer;
let ids;
let granularSynth;

const depth = 1000;

let globalSettings = {
  paused : false
};

function transferStatisticsToGranularSynth(){
  const stats = flock.gatherStatistics();
  granularSynth.setParamsFromStats(globalSettings,stats);
}

function mouseClicked(){
  flock.explode();
}

function setup(){
  //create canvas and grab webGL context
  setAttributes('antialias',false);
  pixelDensity(1);
  mainCanvas = createCanvas(1000,1000,WEBGL);
  flock = new Flock();
  granularSynth = new MurmurSynth();
}


function draw(){
  orbitControl();
  background(color(10,30,10));
  flock.update();
  transferStatisticsToGranularSynth();
  flock.render();
  // console.log("Framerate: "+frameRate());
}