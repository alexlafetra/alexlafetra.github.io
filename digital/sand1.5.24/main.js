let flowField;
let mapTexture;
let holcTexture;

let attractors = [];
let repulsors = [];
let gl;
let mainCanvas;
let tractOutlines;
let idBuffer;
let ids;

const NUMBER_OF_ATTRACTORS = 5;

let showParticles = true;
let showFlowMap = false;
let continouslyRandomizeAttractors = true;

function calculateRandomAttractors(n){
    attractors = [];
    repulsors = [];
    for(let point = 0; point<n; point++){
        attractors.push(random(1));
        attractors.push(random(1));
        attractors.push(1.0);
        repulsors.push(random(1));
        repulsors.push(random(1));
        repulsors.push(1.0);
    }
}

function preload(){
}

function setup(){

    //create canvas and grab webGL context
    setAttributes('antialias',false);
    pixelDensity(1);
    mainCanvas = createCanvas(1000,1000,WEBGL);
    gl = mainCanvas.GL;

    flowFieldShader = createShader(flowMapVert,flowMapFrag);
    randomShader = createShader(defaultVert,randomFrag);

    //creating map mask
    let mask = createFramebuffer({width:width,height:height,format:FLOAT});
    mask.begin();
    background(255);
    mask.end();
    mapTexture = createFramebuffer({width:width,height:height});

    calculateRandomAttractors(NUMBER_OF_ATTRACTORS);

    flowField = new FlowField(mask,mapTexture,flowFieldShader);

    initGui();

    flowField.update();
    setTimeout(randomizeFlow,3000);
}

function randomizeFlow(){
    if(continouslyRandomizeAttractors)
        calculateRandomAttractors(NUMBER_OF_ATTRACTORS);
    setTimeout(randomizeFlow,3000);
}


function draw(){
    updateSliders();
    flowField.forceStrength = 0.2*noise(frameCount/100);
    flowField.randomAmount = 0.1*noise(frameCount/100);
    flowField.updateFlow();
    flowField.update();

    if(showFlowMap){
        flowField.renderFlowMap();
    }
    if(showParticles){
        flowField.renderGL();
    }
    if(flowField.showingData){
        flowField.renderData();
    }
}

const flowMapFrag = glsl`
precision mediump float;

varying vec2 vTexCoord;

uniform vec3 uAttractors[`+NUMBER_OF_ATTRACTORS+glsl`];
uniform vec3 uRepulsors[`+NUMBER_OF_ATTRACTORS+glsl`];
uniform vec2 uMouse;
uniform bool uAttraction;
uniform bool uRepulsion;

void main(){
    vec2 c = vec2(0.0);
    //calculate attractors/repulsors
    for(int i = 0; i<`+NUMBER_OF_ATTRACTORS+glsl`; i++){
        //add a vector pointing toward the attractor from this pixel
        //scaled by the inverse square of the distance AND the scale factor
        if(uAttraction){
            float dA = distance(uAttractors[i].xy,vTexCoord);
            c+=(uAttractors[i].xy-vTexCoord)/(dA*dA);
        }
        if(uRepulsion){
            float dR = distance(uRepulsors[i].xy,vTexCoord);
            c+=uRepulsors[i].z*(-uRepulsors[i].xy+vTexCoord)/(dR*dR);
        }
    }
    float d = distance(uMouse,vTexCoord);
    c+=(uMouse-vTexCoord)/(d*d);

    c = normalize(c);

    gl_FragColor = vec4(c.x,c.y,1.0,1.0);
}
`;

const flowMapVert = glsl`
precision mediump float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vTexCoord;

void main(){
    // //passing aTexCoord into the frag shader
    vTexCoord = aTexCoord;
    vec2 positionVec2 = aPosition.xy * 2.0 - 1.0;
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(positionVec2,aPosition.z,1.0);
}
`;