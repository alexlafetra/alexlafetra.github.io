let flowField;

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
let font;

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

function calcAttractorsFromText(text){
    let points = font.textToPoints(text, 0, 0, 100, { sampleFactor:  0.01 });
    repulsors = [];
    attractors = [];
    for(let point of points){
        attractors.push(map(point.x,-width/2,width/2,0,1));
        attractors.push(map(point.y,-height/2,height/2,0,1));
        // attractors.push(map(point.alpha,0,255,0,1));
        attractors.push(1);
    }
    console.log(attractors);
}

function preload(){
    font = loadFont("Batang.ttf");
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
        // calcAttractorsFromText("heylllllloooo");
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

// void main(){
//     vec2 c = vec2(0.0);
//     //calculate attractors/repulsors
//     for(int i = 0; i<`+NUMBER_OF_ATTRACTORS+glsl`; i++){
//         //add a vector pointing toward the attractor from this pixel
//         //scaled by the inverse square of the distance AND the scale factor
//         if(uAttraction){
//             float dA = distance(uAttractors[i].xy,vTexCoord);
//             c+=(uAttractors[i].xy-vTexCoord)/(dA*dA);
//         }
//         if(uRepulsion){
//             float dR = distance(uRepulsors[i].xy,vTexCoord);
//             c+=uRepulsors[i].z*(-uRepulsors[i].xy+vTexCoord)/(dR*dR);
//         }
//     }
//     float d = distance(uMouse,vTexCoord);
//     c+=(uMouse-vTexCoord)/(d*d);

//     c = normalize(c);

//     gl_FragColor = vec4(c.x,c.y,1.0,1.0);
// }

void main(){
    vec2 attraction = vec2(0.0);
    vec2 repulsion = vec2(0.0);
    //calculate attractors/repulsors
    for(int i = 0; i<`+NUMBER_OF_ATTRACTORS+glsl`; i++){
        vec2 attractorCoord = vec2(uAttractors[i].x,uAttractors[i].y);
        vec2 repulsorCoord = vec2(uRepulsors[i].x,uRepulsors[i].y);
        //add a vector pointing toward the attractor from this pixel
        //scaled by the inverse square of the distance AND the scale factor
        float dA = distance(attractorCoord,vTexCoord);
        attraction += (uAttractors[i].z) * (attractorCoord-vTexCoord) / (dA*dA);
        //the repulsion force points AWAY from the repulsor point
        float dR = distance(uRepulsors[i].xy,vTexCoord);
        repulsion += (uRepulsors[i].z) * (vTexCoord-uRepulsors[i].xy) / (dR*dR);
    }
    attraction /= `+NUMBER_OF_ATTRACTORS+glsl`.0;
    repulsion /= `+NUMBER_OF_ATTRACTORS+glsl`.0;
    //Storing both attraction and repulsion in the same texture
    gl_FragColor = vec4(attraction,repulsion);

    // gl_FragColor = vec4(attraction,repulsion.x,0.5*(repulsion.y+2.0));
    //^^ Prevents alpha channel from clipping -- use this if you want to save the flow field to a texture!
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