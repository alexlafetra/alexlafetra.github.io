/*

Some inspiration:
https://blog.mapbox.com/how-i-built-a-wind-map-with-webgl-b63022b5537f
https://nullprogram.com/blog/2014/06/29/
https://nullprogram.com/webgl-particles/
https://apps.amandaghassaei.com/gpu-io/examples/fluid/

Future improvements:
get floating point textures working on mobile
combine vel+position processing into one texture+shader pass?

To render tract+mask textures:
set canvas size (mainCanvas) to 1000x1000

Add in something about financial policy

*/

let flowField;
let holcTexture;
let tractOutlines;
let presetFlowMask;

let gl;
let mainCanvas;
let idBuffer;

const dataTextureDimension = 300;
let randomShader;
let drawParticlesProgram;
let drawParticlesProgLocs;

//Presets
let censusDataPresets;

//20 is a good base number
// const NUMBER_OF_ATTRACTORS = 300;
const NUMBER_OF_ATTRACTORS = 5;

//controls whether or not the sim will load with prerendered data/choropleths
//or with the full dataset, allowing you to explore/experiment
// let devMode = true;
let devMode = false;

const defaultSettings = {
    particleCount : 1000000,
    trailDecayValue : 0.5,
    particleSize : 1.4,
    particleAgeLimit : 1.6,//this*100 ::> how many frames particles live for
    particleVelocity : 0.1,
    forceMagnitude : 0.07,
    // randomMagnitude : 2.5,
    randomMagnitude : 0.0,
    repulsionStrength : 0.0,
    attractionStrength : 1.0,
    canvasSize : 700,
    useParticleMask : false, //for preventing particles from entering oceans
    isActive : true,
    renderFlowFieldDataTexture : false,
    renderCensusTracts: false,
    renderAttractors : false,//render attractors
    renderRepulsors : false,//render repulsors
    repulsionColor : [20,0,180],
    attractionColor : [255,0,120],
    mouseInteraction : false,
    rebirthParticlesToInitialPositions : false,
    fieldStrength: 0.37
};

const viewPresets = [
    {
        name: "Entire Bay Area",
        x: 125,
        y: 125,
        scale: 280,
        settings: defaultSettings
    },
    {
        name: "San Francisco",
        x: 2850,
        y: 2000,
        scale: 5000,
        settings: {
            particleVelocity: 0.05,
            particleCount: 40000,
            trailDecayValue: 0.04,
            particleSize: 1.4,
            randomMagnitude: 0.0,
            renderCensusTracts:true,
            attractionStrength:4.0,
            repulsionStrength:4.0
        }
    },
    {
        name: "Marin",
        x: 3000,
        y: 2800,
        scale: 4000,
        settings: {
            particleVelocity: 0.05,
            particleCount: 40000,
            trailDecayValue: 0.04,
            particleSize: 1.4,
            randomMagnitude: 0.0,
            renderCensusTracts:true,
            attractionStrength:4.0,
            repulsionStrength:4.0
        }
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
        settings: {
            particleVelocity: 0.05,
            particleCount: 40000,
            trailDecayValue: 0.04,
            particleSize: 1.4,
            randomMagnitude: 0.0,
            renderCensusTracts:true,
            attractionStrength:3.0,
            repulsionStrength:3.0
        }
    },
    {
        name: "East Bay",
        x: 1200,
        y: 1450,
        scale: 3000,
        settings: {
            particleVelocity: 0.05,
            particleCount: 40000,
            trailDecayValue: 0.02,
            particleSize: 1.4,
            randomMagnitude: 0.0,
            renderCensusTracts:true,
            attractionStrength:3.0,
            repulsionStrength:3.0
        }
    },
    {
        name: "W. Oakland & Berkeley",
        x: 2500,
        y: 2900,
        scale: 6000,
        settings: {
            particleVelocity: 0.05,
            particleCount: 40000,
            trailDecayValue: 0.04,
            particleSize: 1.4,
            randomMagnitude: 0.0,
            renderCensusTracts:true,
            attractionStrength:3.0,
            repulsionStrength:3.0
        }
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

let ids;

function initGL(){
    drawParticlesProgram = webglUtils.createProgramFromSources(
        gl, [drawParticlesVS, drawParticlesFS]);
    drawParticlesProgLocs = {
        id: gl.getAttribLocation(drawParticlesProgram, 'particleID'),
        uPositionTexture: gl.getUniformLocation(drawParticlesProgram, 'uPositionTexture'),
        uColorTexture: gl.getUniformLocation(drawParticlesProgram, 'uColorTexture'),
        uAttractionTexture: gl.getUniformLocation(drawParticlesProgram, 'uAttractionTexture'),
        uRepulsionTexture: gl.getUniformLocation(drawParticlesProgram, 'uRepulsionTexture'),
        uTextureDimensions: gl.getUniformLocation(drawParticlesProgram, 'uTextureDimensions'),
        uMatrix: gl.getUniformLocation(drawParticlesProgram, 'uMatrix'),
    };
    ids = new Array(dataTextureDimension*dataTextureDimension).fill(0).map((_, i) => i);
    idBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, idBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ids), gl.STATIC_DRAW);
}

function fillFBOwithRandom(fbo,scale,seed){
    fbo.begin();
    shader(randomShader);
    randomShader.setUniform('uScale',scale);
    randomShader.setUniform('uRandomSeed',seed);
    quad(-1,-1,-1,1,1,1,1,-1);
    fbo.end();
}


function saveFlowFieldGif(){
    saveGif(flowField.censusDataPreset.title+".gif", Number(flowField.gifLengthTextbox.value()),{units:'frames',delay:10})
}


function randomColor(){
    return color(random(0,255),random(0,255),random(0,255));
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

function setup(){
    //create canvas and grab webGL context
    // mainCanvas = createCanvas(4000,4000,WEBGL);
    mainCanvas = createCanvas(700,700,WEBGL);
    gl = mainCanvas.GL;
    randomShader = createShader(updateParticleDataVert,randomFrag);

    createPremadePresets();
    flowField = new CensusDataFlowField();

    initGL();
}

function mousePressed(){
    flowField.flowField.genRandomNodes(NUMBER_OF_ATTRACTORS);
}

function draw(){
    flowField.run();
}