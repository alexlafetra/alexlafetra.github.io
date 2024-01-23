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

let decayValue = 0.1;
//15deg... we're using degrees for this one
let sensorAngle = 25.0;
let SENSE_INFLUENCE = 1.0;
let MAXVEL = 1.0;
let DEPOSIT_AMOUNT = 200*MAXVEL;
let lookAheadDistance = 2.5;

let dataTextureDimension = 150;

let NUMBER_OF_PARTICLES = 1000;


let dampValue = 0.002;
let flowScale = 3.0;
let randomScale = 0.0;
let particleAgeLimit = 0.8;
// let flowAngleScale = 2*3.141596;
let flowAngleScale = 2.0;
let renderVectors = false;
let renderSensors = false;
let diffuseGrid = false;
let diffusionStrength = 1.0;
let imageOpacity = 0;

let mainCanvas;
let positionTexture;//storing the positions in rgb values
let positionTextureBuffer;//double buffer
let velTexture;//storing the velocities as rgb values
let velTextureBuffer;
let trailLayer;//storing the trail data
let simplexLayer;
let renderLayer;
let ageTexture;
let ageTextureBuffer;
let normalMapTexture;

let randomShader;
let updateVelShader;
let initPositionShader;
let updatePositionShader;
let renderPositionShader;
let simplexShader;
let blurShader;

let normalMap;

function preload(){
    randomShader = loadShader('shaders/random.vert','shaders/random.frag');
    renderPositionShader = loadShader('shaders/renderPositions.vert','shaders/renderPositions.frag');
    updateVelShader = loadShader('shaders/updateVel.vert','shaders/updateVel.frag');
    simplexShader = loadShader('shaders/updateVel.vert','shaders/simplex.frag');
    normalMap = loadImage('testGradient_4.png');
}
function initAge(){
    fillFBOwithRandom(ageTexture,particleAgeLimit,1.0);
}
function initPositions(){
    let r = random();
    fillFBOwithRandom(positionTexture,1.0,r);
    fillFBOwithRandom(positionTextureBuffer,1.0,r);
}
function initVelocities(){
    // fillFBOwithRandom(velTexture,1.0,random());
    simplexBG(velTexture);
    normalMapTexture.begin();
    image(normalMap,-normalMapTexture.width/2,-normalMapTexture.height/2,normalMapTexture.width,normalMapTexture.height);
    normalMapTexture.end();
}
function fillFBOwithRandom(fbo,scale,seed){
    fbo.begin();
    shader(randomShader);
    randomShader.setUniform('uScale',scale);
    randomShader.setUniform('uRandomSeed',seed);
    quad(-1,-1,-1,1,1,1,1,-1);
    fbo.end();
}

function renderParticles(){
    positionTexture.loadPixels();
    trailLayer.begin();
    clear();
    stroke(255,255);
    for(let i = 0; i<NUMBER_OF_PARTICLES; i+=4){
        let x = positionTexture.pixels[i];
        let y = positionTexture.pixels[i+1];
        point(x*width-width/2,y*height-height/2);
    }
    trailLayer.end();
}

function reset(){
    initPositions();//random positions
    initVelocities();//random velocities
    initAge();//random ages
    background(0);
    simplexBG(simplexLayer);
}


function setup(){
    initPositionShader = createShader(initPositionVert,initPositionFrag);
    updatePositionShader = createShader(updatePositionVert,updatePositionFrag);
    blurShader = createShader(ageVert,blurFrag);
    updateAgeShader = createShader(ageVert,ageFrag);
    mainCanvas = createCanvas(600,600,WEBGL);
    trailLayer = createFramebuffer({width:width,height:height,format:FLOAT});
    simplexLayer = createFramebuffer({width:width,height:height,format:FLOAT});
    renderLayer = createFramebuffer({width:width,height:height,format:FLOAT});
    normalMapTexture = createFramebuffer({width:width,height:height,format:FLOAT});
    //float for data, and texturefiltering:NEAREST so the pixels aren't interpolated when the texture is read
    //i'm not sure if this interpolation would be happening when a shader reads it anyway
    ageTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
    ageTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
    positionTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
    positionTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
    velTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
    velTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
    
    initGui();
    reset();
}

function simplexBG(fbo){
    fbo.begin();
    shader(simplexShader);
    simplexShader.setUniform('uScale',flowScale);
    quad(-1,-1,-1,1,1,1,1,-1);
    fbo.end();
}

//so the flickering happens only when you call the 'updatepositions'
//shader. It still happens when you don't make any changes to the position val
//as you write it to the texture, though, so it must be happening when you're
//grabbing the position from the texture.

//Okay so the "flickering" is actually all the particle positions getting reflected about the
//line x = y, super weird but i'm pretty sure it's a bug in my code and NOT a precision issue
function keyPressed(){
    // updatePos();
    blur = !blur;
}

function updatePos(){
    positionTextureBuffer.begin();
    shader(updatePositionShader);
    updatePositionShader.setUniform('uParticleVelTexture',velTexture);
    updatePositionShader.setUniform('uParticlePosTexture',positionTexture);
    updatePositionShader.setUniform('uDamp',dampValue);
    updatePositionShader.setUniform('uRandomScale',randomScale);
    updatePositionShader.setUniform('uTime',millis()%3000);
    updatePositionShader.setUniform('uAgeLimit',particleAgeLimit);
    updatePositionShader.setUniform('uParticleAgeTexture',ageTexture);
    updatePositionShader.setUniform('uParticleTrailTexture',trailLayer);
    quad(-1,-1,1,-1,1,1,-1,1);//upside down bc the textures get flipped
    positionTextureBuffer.end();
    [positionTexture,positionTextureBuffer] = [positionTextureBuffer,positionTexture];
}

//instead of generating the noise values on the fly, you could have the vel's sample a force texture
//that could contain text/whatever
function updateVel(){
    velTextureBuffer.begin();
    shader(updateVelShader);
    updateVelShader.setUniform('uParticleVel',velTexture);
    updateVelShader.setUniform('uParticlePos',positionTexture);
    updateVelShader.setUniform('uFlowFieldTexture',normalMapTexture);
    updateVelShader.setUniform('uScale',flowScale);
    updateVelShader.setUniform('uAngle',flowAngleScale);
    quad(-1,-1,1,-1,1,1,-1,1);//upside down bc the textures get flipped
    velTextureBuffer.end();
    [velTexture,velTextureBuffer] = [velTextureBuffer,velTexture];
}

function updateAge(){
    ageTextureBuffer.begin();
    shader(updateAgeShader);
    updateAgeShader.setUniform('uAgeLimit',particleAgeLimit);
    updateAgeShader.setUniform('uAgeTexture',ageTexture);
    quad(-1,-1,1,-1,1,1,-1,1);//upside down bc the textures get flipped
    ageTextureBuffer.end();
    [ageTexture,ageTextureBuffer] = [ageTextureBuffer,ageTexture];
}

let blur = false;
function draw(){
    updateSliders();
    background(0);
    simplexBG(simplexLayer);
    updatePos();
    updateVel();
    updateAge();


    positionTexture.loadPixels();
    trailLayer.begin();
    fill(0,decayValue*255);
    strokeWeight(1.6);
    rect(-width/2,-height/2,width,height);
    stroke(255,200);
    for(let i = 0; i<min(NUMBER_OF_PARTICLES,positionTexture.pixels.length/4); i++){
        let x = positionTexture.pixels[i*4];
        let y = positionTexture.pixels[i*4+1];
        // stroke(x*255,y*255,255);
        point(x*width-width/2,y*height-height/2);
    }
    trailLayer.end();

    tint(225,255-imageOpacity);
    image(trailLayer,-width/2,-height/2,width,height);

    image(normalMap,-width/2,-height/2,width,height);

    // image(renderLayer,0,-height/2,width/2,height);
    // image(velTexture,-width/2,-height/2,velTexture.width,velTexture.height);
    // image(ageTexture,-width/2,-height/2,dataTextureDimension,dataTextureDimension);
    // image(positionTexture,-width/2,height/2-positionTexture.height,velTexture.width,velTexture.height);
}

//taken from https://www.shadertoy.com/view/Xltfzj
const blurFrag = `
    precision mediump float;
    uniform sampler2D uTexture;
    varying vec2 vTexCoord;
    uniform vec2 uResolution;

    void main(){

        const float pi2 = 6.28318530718;//pix2

        // GAUSSIAN BLUR SETTINGS
            const float directions = 16.0; // BLUR DIRECTIONS (Default 16.0 - More is better but slower)
            const float quality = 3.0; // BLUR QUALITY (Default 4.0 - More is better but slower)
            const float size = 4.0; // BLUR SIZE (Radius)
        
        vec2 radius = size/uResolution.xy;
        vec4 color = texture2D(uTexture,vTexCoord);

        for(float d = 0.0; d<pi2; d+=(pi2/directions)){
            for(float i = 1.0/quality; i<=1.0; i+=1.0/quality){
                color += texture2D(uTexture,vTexCoord+vec2(cos(d),sin(d))*radius*i);
            }
        }
        color /= quality*directions-15.0;
        gl_FragColor = color;
    }
`;


const ageVert = `
precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vTexCoord;

void main(){
    //passing aTexCoord into the frag shader
    vTexCoord = aTexCoord;
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(aPosition.xyz,1.0);
}
`;
const ageFrag = `
precision highp float;
uniform vec2 uDimensions;
uniform float uAgeLimit;
varying vec2 vTexCoord;

uniform sampler2D uAgeTexture;
void main(){
    float increment = 0.01;
    vec4 currentAge = texture2D(uAgeTexture,vTexCoord);
    // //if you're too old, set age to 0 (at this point, the position should be reset by the pos shader)
    if(currentAge.x > uAgeLimit)
        gl_FragColor = vec4(0.0,0.0,0.0,1.0);
    else
        gl_FragColor = vec4(currentAge.x+increment,currentAge.x+increment,currentAge.x+increment,1.0);
}
`;
const initPositionFrag = `
precision highp float;
uniform vec2 uDimensions;
varying vec2 vTexCoord;
void main(){
    gl_FragColor = vec4(vTexCoord.x,vTexCoord.y,1.0,1.0);
}
`;
const initPositionVert = `
precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vTexCoord;

void main(){
    //passing aTexCoord into the frag shader
    vTexCoord = aTexCoord;
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(aPosition.xyz,1.0);
}
`;

const updatePositionVert = `
precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform vec2 uResolution;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vParticleCoord;

void main(){
    //passing aTexCoord into the frag shader
    vParticleCoord = vec2(aTexCoord.x,aTexCoord.y);
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(aPosition,1.0);
}
`;

const updatePositionFrag = `
precision highp float;
precision highp sampler2D;

uniform sampler2D uParticleVelTexture;
uniform sampler2D uParticlePosTexture;
uniform sampler2D uParticleAgeTexture;

uniform float uDamp;
uniform float uRandomScale;
uniform float uTime;
uniform float uAgeLimit;

varying vec2 vParticleCoord;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

vec4 wrap(vec4 v, float minVal, float maxVal){
    if(v.x<minVal)
        v.x = maxVal;
    if(v.x>=maxVal)
        v.x = minVal;
    if(v.y<minVal)
        v.y = maxVal;
    if(v.y>=maxVal)
        v.y = minVal;
    return v;
}
void main(){
    //checking the age of the particle
    vec4 textureAge = texture2D(uParticleAgeTexture,vParticleCoord);

    //if it's too old, put it somewhere random and return
    if(textureAge.x > uAgeLimit){
        gl_FragColor = vec4(random(vParticleCoord*uTime),random(vParticleCoord/uTime),1.0,1.0);
        return;
    }
    else{
        vec4 textureVelocity = texture2D(uParticleVelTexture,vParticleCoord);
        vec4 texturePosition = texture2D(uParticlePosTexture,vParticleCoord);
        vec4 randomForce = vec4(sin(random(texturePosition.xx)),cos(random(texturePosition.yy)),1.0,1.0);
        // vec4 newPos = texturePosition + uDamp*(normalize(textureVelocity) + randomForce*uRandomScale);
        vec4 newPos = texturePosition + uDamp*(textureVelocity + randomForce*uRandomScale);

        gl_FragColor = wrap(newPos,0.0,1.0);    //wrapping bounds
    }
}
`;