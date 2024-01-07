/*
    1. Senses. This means it pulls from the trail texture to get 3 (or more?) nearby pixels.
    2. Updates its velocity/rotates towards the nearest trail.
    3. Updates its position (how do i do this?)
    4. Deposits a trail.
    5. Trail Diffuses. This means applying a convolution/gaussian blur to the trail texture.
    6. Trail decays. This is simple, basically every pixel decays evenly (or do they? maybe there are some cool experiments in here)

    My questions are:
    how are particles passed to the shader?
    how does a particle "move"?
    How does a particle deposit a trail?

    This is a prototype for the cpu, just so I can get it working.

    After writing this, I'm thinking:
    particles store position and velocity on two textures, and there's a render layer. 
    Pass all three to the velocityShader:
    1. Vel shader gets position from position texture
    2. then uses that to compute the sensor values
    3. then updates the velocity vector using the sensor outputs

    Pass the vel texture to the positionShader:
    1. get vel from vel texture
    2. add it to the position (making sure to wrap bounds)

    to draw the ... see how do i draw the trails to a texture?
    
*/

const NUMBER_OF_PARTICLES = 100;
const GRID_W = 60;
const GRID_H = 60;
const decayValue = 0.95;
//15deg... we're using degrees for this one
let sensorAngle = 25.0;
let SENSE_INFLUENCE = 1.0;
let MAXVEL = 1.0;
let DEPOSIT_AMOUNT = 200*MAXVEL;
let lookAheadDistance = 2.5;

let renderVectors = false;
let renderSensors = false;
let diffuseGrid = false;
let diffusionStrength = 1.0;

let mainCanvas;
let positionTexture;//storing the positions in rgb values
let positionTexture2;//double buffer
let velTexture;//storing the velocities as rgb values
let trailLayer;//storing the trail data

let randomShader;
let updateVelShader;
let updatePositionShader;
let renderPositionShader;

function preload(){
    randomShader = loadShader('shaders/random.vert','shaders/random.frag');
    updatePositionShader = loadShader('shaders/updatePositions.vert','shaders/updatePositions.frag');
    renderPositionShader = loadShader('shaders/renderPositions.vert','shaders/renderPositions.frag');
}

function initPositions(){
    fillFBOwithRandom(positionTexture);
    fillFBOwithRandom(positionTexture2);
}
function initVelocities(){
    fillFBOwithRandom(velTexture);
}
function fillFBOwithRandom(fbo){
    fbo.begin();
    shader(randomShader);
    randomShader.setUniform('uRandomSeed',random());
    quad(-1,-1,-1,1,1,1,1,-1);
    fbo.end();
}
function renderParticles(){
    trailLayer.begin();
    shader(renderPositionShader);
    renderPositionShader.setUniform('uParticlePos',positionTexture);
    renderPositionShader.setUniform('uVelTexture',velTexture);
    stroke(255);
    // beginShape(POINTS);
    beginShape(TRIANGLE_STRIP);
    // beginShape();
    for(let x = 0.0; x<1.0; x+=0.1){
        for(let y = 0.0; y<1.0; y+=0.1){
            // vertex(x*width-width/2,y*height-height/2);
            vertex(x,y);
        }
    }
    endShape();
    trailLayer.end();
}
function updatePositions(){
    positionTexture.begin();
    shader(updatePositionShader);
    updatePositionShader.setUniform('uParticleVel',velTexture);
    updatePositionShader.setUniform('uParticlePos',positionTexture);
    updatePositionShader.setUniform('uWidth',width);
    updatePositionShader.setUniform('uHeight',height);
    quad(-1,-1,-1,1,1,1,1,-1);
    positionTexture.end();
    // [positionTexture,positionTexture2] = [positionTexture2,positionTexture];
}

let gl;

function setup(){
    mainCanvas = createCanvas(600,300,WEBGL);
    trailLayer = createFramebuffer({width:width,height:height,format:FLOAT});
    //float for data, and texturefiltering:linear so the pixels aren't interpolated when the texture is read
    //i'm not sure if this interpolation would be happening when a shader reads it anyway
    positionTexture = createFramebuffer({width:100,height:100,format:FLOAT,textureFiltering:LINEAR});
    positionTexture2 = createFramebuffer({width:100,height:100,format:FLOAT,textureFiltering:LINEAR});
    velTexture = createFramebuffer({width:100,height:100,format:FLOAT,textureFiltering:LINEAR});
    initPositions();//random positions
    initVelocities();//random velocities
    // pixelDensity(1);
    console.log(p5.RendererGL);
}
function draw(){
    background(0);
    // updatePositions();
    renderParticles();
    image(trailLayer,-width/2,-height/2,width,height);
    image(velTexture,-width/2,-height/2,positionTexture.width,positionTexture.height);
    image(positionTexture,-width/2,-height/2+positionTexture.height,velTexture.width,velTexture.height);
}