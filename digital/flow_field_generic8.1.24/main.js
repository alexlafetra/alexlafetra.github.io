let flowField;

let gl;
let mainCanvas;
let sideCanvas;
let idBuffer;

const dataTextureDimension = 300;
const windowSize = {width:400,height:400};
const margin = 0.2;

let randomShader;
let drawParticlesProgram;
let drawParticlesProgLocs;

//Presets
let censusDataPresets;

const NUMBER_OF_ATTRACTORS = 5;

class Node{
    constructor(){
        this.x = random(margin,1.0-margin);
        this.y = random(margin,1.0-margin);
        this.strength = random(1.0);
        const maxVel = 4/width;
        this.velocity = createVector(random(-maxVel,maxVel),random(-maxVel,maxVel));
    }
    update(){
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        let location = createVector(this.x,this.y);
        const center = createVector(0.5,0.5);

        const distanceToCenter = p5.Vector.dist(location,center);
        if(distanceToCenter > (0.5-margin)){
            let steering = p5.Vector.sub(center,location).setMag(pow(distanceToCenter - (0.5-margin),2)).mult(0.2);
            this.velocity.add(steering);
            // this.velocity.div(2);
        }

        // if((this.x > (1 - margin)) || this.x<margin){
        //     this.velocity.x += -0.5*this.velocity.x;
        // }
        // if((this.y > (1 - margin)) || this.y<margin){
        //     this.velocity.y = -0.5*this.velocity.y;
        // }
    }
};


const defaultSettings = {
    particleCount : 1000000,
    trailDecayValue : 0.5,
    particleSize : 0.0,
    particleAgeLimit : 1.6,//this*100 ::> how many frames particles live for
    particleVelocity : 0.1,
    forceMagnitude : 0.07,
    randomMagnitude : 0.0,
    repulsionStrength : 0.2,
    attractionStrength : 1.0,
    canvasSize : 700,
    useParticleMask : false, //for preventing particles from entering oceans
    isActive : true,
    renderFlowFieldDataTexture : true,
    renderAttractors : true,//render attractors
    renderRepulsors : true,//render repulsors
    repulsionColor : [20,0,180],
    attractionColor : [255,0,120],
    // repulsionColor : [255,0,0],
    // attractionColor : [255,255,255],
    mouseInteraction : false,
    rebirthParticlesToInitialPositions : false,
    fieldStrength: 0.3
};

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

let attractors = [],repulsors = [];

function setup(){
    //create canvas and grab webGL context
    // mainCanvas = createCanvas(4000,4000,WEBGL);
    mainCanvas = createCanvas(windowSize.width,windowSize.height,WEBGL);
    gl = mainCanvas.GL;
    randomShader = createShader(updateParticleDataVert,randomFrag);

    for(let i = 0; i<NUMBER_OF_ATTRACTORS; i++){
        attractors.push(new Node());
        repulsors.push(new Node());
    }
    let previous = attractors[0];
    for(let attractor of attractors){
        if(attractor.strength>previous.strength){
            previous = attractor;
        }
    }
    maxAttractor = previous;

    previous = attractors[0];
    for(let attractor of attractors){
        if(attractor.strength>previous.strength && attractor.strength<maxAttractor.strength){
            previous = attractor;
        }
    }
    nextMaxAttractor = previous;

    flowField = new CensusDataFlowField();

    initGL();
}

let spriteImages = [];
let maxAttractor;
let nextMaxAttractor;
let rabbit;

function preload(){
    rabbit = loadImage("character/test_rabbit_inverse.png");
//     for(let i = 0; i<8; i++){
//         spriteImages[i] = loadImage("character/000"+(i+1)+".png");
//     }
}

function getDirectionOfNode(node,other){
    let pointA = createVector(node.x,node.y);
    let pointB = createVector(other.x,other.y);
    let heading = p5.Vector.sub(pointA,pointB).heading();
    let whichDirection = int(heading/(TWO_PI/8));
    if(whichDirection<0)
        whichDirection+=8;
    return whichDirection;
}

function pulseSettings(){
    flowField.flowField.settings.repulsionStrength = pow(0.5*noise(frameCount/50),2);
    flowField.flowField.settings.particleVelocity = max(0.2*noise(frameCount/301),0.08);
    flowField.loadSimulationSettingsIntoGUI();
}

function drawCharacter(){
    const which = getDirectionOfNode(maxAttractor,nextMaxAttractor);
    image(spriteImages[which],maxAttractor.x*width-width/2,maxAttractor.y*height-height/2,100,100);
}

function regenNodes(){
    attractors = [];
    repulsors = [];
    for(let i = 0; i<NUMBER_OF_ATTRACTORS; i++){
        attractors.push(new Node());
        repulsors.push(new Node());
    }
}

function mousePressed(){
    regenNodes();
}

function draw(){
    pulseSettings();
    flowField.flowField.updateNodes(attractors,repulsors);
    flowField.run();
    if(!(frameCount%60))
        regenNodes();
    // for(let i = 0; i<NUMBER_OF_ATTRACTORS; i++){
    //     attractors[i].update();
    //     repulsors[i].update();
    // }
    // drawCharacter();
}