/*
Some inspiration:
https://blog.mapbox.com/how-i-built-a-wind-map-with-webgl-b63022b5537f
https://nullprogram.com/blog/2014/06/29/
https://nullprogram.com/webgl-particles/
https://apps.amandaghassaei.com/gpu-io/examples/fluid/

Future improvements:
get floating point textures working on mobile

To render tract+mask textures:
set canvas size (mainCanvas) to 1000x1000

*/

let flowField,flowField2;
let holcTexture;
let tractOutlines;
let presetFlowMask;

let gl;
let mainCanvas;
const dataTextureDimension = 200;

//Presets
let censusDataPresets;

//controls whether or not the sim will load with prerendered data/choropleths
//or with the full dataset, allowing you to explore/experiment
// let devMode = true;
let devMode = false;

const defaultSettings = {
    backgroundColor: [255,255,255],
    particleCount : 40000,
    trailDecayValue : 0.02,
    particleSize :0,
    particleAgeLimit : 1,//this*100 ==> how many frames particles live for
    framesBeforeLoop : 60,
    particleVelocity : 0.01,
    flowInfluence : 1.0,
    randomMagnitude : 0.0,
    repulsionStrength : 1.6,
    attractionStrength : 1,
    canvasSize : 600,//big canvas
    dataCanvasSize : 400,
    useParticleMask : true, //for preventing particles from entering oceans
    isActive : true,
    renderFlowFieldDataTexture : false,
    renderCensusTracts: true,
    renderNodes : true,
    renderParticles:true,
    renderBigFlowField:false,
    repulsionColor : [20,0,180],
    attractionColor : [255,0,120],
    mouseInteraction : false,
    colorWeight: 2.22
};

// const defaultSettings = {backgroundColor:[255,0,0],particleCount:40000,trailDecayValue:0.017,particleSize:1,particleAgeLimit:1,framesBeforeLoop:60,particleVelocity:0.024,flowInfluence:1,randomMagnitude:1.11,repulsionStrength:0.411,attractionStrength:0.306,canvasSize:1080,dataSize:200,useParticleMask:true,isActive:true,renderFlowFieldDataTexture:true,renderCensusTracts:false,renderNodes:true,renderParticles:true,renderBigFlowField:false,repulsionColor:[0,64,255,255],attractionColor:[0,255,30,255],mouseInteraction:false,colorWeight:2.05,renderHOLCTracts:false};
// const defaultSettings = {backgroundColor:[0,0,0],particleCount:40000,trailDecayValue:0.046,particleSize:2.3,particleAgeLimit:1,framesBeforeLoop:60,particleVelocity:0.054,flowInfluence:1,randomMagnitude:0.49,repulsionStrength:0.411,attractionStrength:0.306,canvasSize:1080,dataSize:200,useParticleMask:true,isActive:true,renderFlowFieldDataTexture:true,renderCensusTracts:false,renderNodes:true,renderParticles:true,renderBigFlowField:false,repulsionColor:[255,0,0,255],attractionColor:[0,85,255,255],mouseInteraction:false,colorWeight:2.05,renderHOLCTracts:false};

const viewPresets = [
    {
        name: "Entire Bay Area",
        x: 125,
        y: 125,
        scale: 280,
    },
    {
        name: "Zoom on East Bay/SF/South Bay",
        x: 250,
        y: 225,
        scale: 700,
    },
    {
        name: "SF & Alameda County",
        x: 800,
        y: 800,
        scale: 1700,
    },
    {
        name: "San Francisco",
        x: 2850,
        y: 2000,
        scale: 5000,
    },
    {
        name: "Marin",
        x: 3000,
        y: 2800,
        scale: 4000,
    },
    {
        name: "South Bay",
        x: 32,
        y: 125,
        scale: 500
    },
    {
        name: "San Jose",
        x: 100,
        y: 0,
        scale: 2500,
    },
    {
        name: "East Bay",
        x: 1200,
        y: 1450,
        scale: 3000,
    },
    {
        name: "W. Oakland & Berkeley",
        x: 2500,
        y: 2900,
        scale: 6000,
    },
    {
        name: "Richmond",
        x: 1400,
        y: 1850,
        scale: 3000
    },
    {
        name: "Antioch",
        x: -100,
        y: 700,
        scale: 1000
    }
];

function logSettingsToConsole(){
    console.log("const settings = "+JSON.stringify(flowField.flowField.settings));
}
function rerenderNodes(){
    flowField.flowField.renderNodes();
}

//All this freakin mess because you can't write a floating pt texture to png right now
function saveFlowMagTexture(){
    const flowFieldTexture = createFramebuffer({width:2000,height:2000,textureFiltering:NEAREST});
    const newShader = createFlowMagnitudeShader(flowField.flowField.NUMBER_OF_ATTRACTORS,flowField.flowField.NUMBER_OF_REPULSORS);
    let calcFlowFieldShader = createShader(newShader.vertexShader,newShader.fragmentShader);
    flowFieldTexture.begin();
    clear();
    shader(calcFlowFieldShader);
    calcFlowFieldShader.setUniform('uCoordinateOffset',[offset.x/mainCanvas.width+0.5,offset.y/mainCanvas.height+0.5]);//adjusting coordinate so they're between 0,1 (instead of -width/2,+width/2)
    calcFlowFieldShader.setUniform('uScale',scale.x);
    calcFlowFieldShader.setUniform('uDimensions',mainCanvas.width);
    calcFlowFieldShader.setUniform('uAttractors',flowField.flowField.attractorArray);
    calcFlowFieldShader.setUniform('uRepulsors',flowField.flowField.repulsorArray);
    calcFlowFieldShader.setUniform('uAttractionStrength',flowField.flowField.settings.attractionStrength/10.0);
    calcFlowFieldShader.setUniform('uRepulsionStrength',flowField.flowField.settings.repulsionStrength/10.0);
    rect(-flowFieldTexture.width/2,-flowFieldTexture.height/2,flowFieldTexture.width,flowFieldTexture.height);
    flowFieldTexture.end();
    saveCanvas(flowFieldTexture,"flowMagTexture.png","png");
}

//All this freakin mess because you can't write a floating pt texture to png right now
function saveFlowFieldTexture(){
    const flowFieldTexture = createFramebuffer({width:2000,height:2000,textureFiltering:NEAREST});
    const newShader = createFlowFieldShader(flowField.flowField.NUMBER_OF_ATTRACTORS,flowField.flowField.NUMBER_OF_REPULSORS);
    let calcFlowFieldShader = createShader(newShader.vertexShader,newShader.fragmentShader);
    flowFieldTexture.begin();
    clear();
    shader(calcFlowFieldShader);
    calcFlowFieldShader.setUniform('uCoordinateOffset',[offset.x/mainCanvas.width+0.5,offset.y/mainCanvas.height+0.5]);//adjusting coordinate so they're between 0,1 (instead of -width/2,+width/2)
    calcFlowFieldShader.setUniform('uScale',scale.x);
    calcFlowFieldShader.setUniform('uDimensions',mainCanvas.width);
    calcFlowFieldShader.setUniform('uAttractors',flowField.flowField.attractorArray);
    calcFlowFieldShader.setUniform('uRepulsors',flowField.flowField.repulsorArray);
    calcFlowFieldShader.setUniform('uAttractionStrength',flowField.flowField.settings.attractionStrength);
    calcFlowFieldShader.setUniform('uRepulsionStrength',flowField.flowField.settings.repulsionStrength);
    calcFlowFieldShader.setUniform('uClipAlphaChannel',true);
    rect(-flowFieldTexture.width/2,-flowFieldTexture.height/2,flowFieldTexture.width,flowFieldTexture.height);
    flowFieldTexture.end();
    saveCanvas(flowFieldTexture,"flowFieldTexture.png","png");
}
function saveFlowFieldGif(){
    saveGif(flowField.censusDataPreset.title+".gif", Number(flowField.gifLengthTextbox.value()),{units:'frames',delay:10})
}

function loadPresetMaps(){
    presetFlowMask = loadImage("data/prerendered/flowFieldMask.png");
    tractOutlines = loadImage("data/prerendered/censusTractOutlines.png");
    holcTexture = loadImage("data/prerendered/HOLCTractOutlines.png");
}

function preload(){
    if(devMode)
        loadCensusCSVData();
    loadPresetMaps();
}

function renderTransformedImage(img,sf = mainCanvas.width*2/5){
    const rS = (scale.x/sf);//relative scale, bc the png is scaled already
    const dx = -3*mainCanvas.width/4*rS+offset.x;
    const dy = -3*mainCanvas.height/4*rS+offset.y;
    /*
        these ^^ are the condensed versions of: -mainCanvas.width/2*rS+offset.x-mainCanvas.width/4*rS
        Which is basically centering the image on the webGL canvas, scaling that centering by the image scale
        Adding the offset, then subtracting the starting offset (bc the png is already offset)
    */
    const dw = (mainCanvas.width)*rS;
    const dh = (mainCanvas.height)*rS;
    const sx = 0;
    const sy = 0;
    const sw = img.width;
    const sh = img.height;
    image(img,dx,dy,dw,dh,
            sx,sy,sw,sh);
}

function renderTractsAndMask(){
    //Resize canvas to 2000,2000 if you want to create a prerendered background
    resizeCanvas(2000,2000);

    //drawing tract outlines

    tractOutlines = createFramebuffer({width:width,height:height});
    tractOutlines.begin();
    strokeWeight(1);
    renderTractOutlines(geoOffset,color(100));
    tractOutlines.end();
    saveCanvas(tractOutlines, 'censusTractOutlines.png','png');

    // drawing HOLC outlines

    tractOutlines = createFramebuffer({width:width,height:height});
    tractOutlines.begin();
    strokeWeight(1);
    renderHOLCTracts(geoOffset,oakHolcTracts);
    renderHOLCTracts(geoOffset,sfHolcTracts);
    renderHOLCTracts(geoOffset,sjHolcTracts);
    tractOutlines.end();
    saveCanvas(tractOutlines, 'HOLCTractOutlines.png','png');
}


function getPresetsJSON(){
    let i = 0;
    let bigString = "";
    for(let preset of censusDataPresets){
        let nodes = createNodesFromTracts(preset.demographicFunction);
        bigString += "const preset"+i+"Nodes = "+JSON.stringify(nodes)+";\n";
        i++;
    }
    return bigString;
}
function logPresets(){
    console.log(getPresetsJSON());
}

function savePresetsToJSON(){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([getPresetsJSON()], {
    type: "text/plain"
  }));
  a.setAttribute("download", "presetData.js");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

let zip;
let frameData = [];

function setup(){
    //create canvas and grab webGL context
    mainCanvas = createCanvas(defaultSettings.canvasSize,defaultSettings.canvasSize,WEBGL);
    gl = mainCanvas.GL;

    if(devMode){
        console.log("creating presets...");
        createPresets();
        //parsing data and attaching it to tract geometry
        setupMapData();
        //setting the offsets so that the first point in the first shape is centered
        let samplePoint = bayTracts[0].geometry.coordinates[0][0][0];
        geoOffset = {x:-samplePoint[0],y:-samplePoint[1]};
    }
    else{
        createPremadePresets();
    }
    //the manual offset
    offset = {x:mainCanvas.width/4,y:mainCanvas.height/4};
    let s = mainCanvas.width*2/5;
    scale = {x:s,y:s*(-1)};//manually adjusting the scale to taste

    //build the flow field
    console.log(censusDataPresets);
    flowField = new CensusDataFlowField(censusDataPresets[4]);
    // zip = new JSZip();
}

function exportVideo(e) {
    console.log("stopping!");
    var blob = new Blob(chunks, { 'type' : 'video/webm' });

    // Draw video to screen
    var videoElement = document.createElement('video');
    videoElement.setAttribute("id", Date.now());
    videoElement.controls = true;
    document.body.appendChild(videoElement);
    videoElement.src = window.URL.createObjectURL(blob);

    // Download the video 
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'newVid.webm';
    a.click();
    window.URL.revokeObjectURL(url);
}

let chunks = [];
const fr = 60;
let recording = false;
let frame = 0;

function record() {
    recording = true;
    chunks.length = 0;
    let stream = document.querySelector('canvas').captureStream(fr);
        recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
        if (e.data.size) {
        chunks.push(e.data);
        }
    };
    recorder.onstop = exportVideo;
    recorder.start();
}

function captureFrame() {
    const domCanvas = mainCanvas.elt;

    domCanvas.toBlob((blob) => {
        console.log(frame);
        const filename = 'frame_'+String(frame)+'.png';
        zip.file(filename, blob);
        if (frame >= 60 && recording) {
            recording = false;
            // noLoop();
            downloadZip();
        }
    }, 'image/png');
}

function keyPressed(){
    if(key == 'r'){
        if(!recording){
            frameRate(2);
            recording = true;
        }
        else
            recording = false;
    }
}
function downloadZip() {
  zip.generateAsync({ type: 'blob' }).then((content) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'webgl_frames.zip';
    a.click();
  });
}

function draw(){
    flowField.run();
    if(recording){
        captureFrame();
        frame++;
    }
}