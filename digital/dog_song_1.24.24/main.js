/*
    This started off as an error when trying to render particles as points.
    WebGL was treating those points as polygons and texturing them, despite 
*/

let mainCanvas;
let positionTexture;//storing the positions in rgb values
let velTexture;//storing the velocities as rgb values
let trailLayer;//storing the trail data

let randomShader;
let updateVelShader;
let updatePositionShader;
let renderPositionShader;

let img;
let vid;
let backgroundVideo;

let stripes = false;

function preload(){
    img = loadImage("Screen Shot 2021-11-07 at 12.08.38 PM.png");
    randomShader = loadShader('shaders/random.vert','shaders/random.frag');
    updatePositionShader = loadShader('shaders/updatePositions.vert','shaders/updatePositions.frag');
    renderPositionShader = loadShader('shaders/renderPositions.vert','shaders/renderPositions.frag');
}
function initPositions(){
    fillFBOwithRandom(positionTexture);
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
    clear();
    shader(renderPositionShader);
    renderPositionShader.setUniform('uParticlePos',positionTexture);
    renderPositionShader.setUniform('uVelTexture',stripes?velTexture:backgroundVideo);
    stroke(0,0);
    texture(img);
    beginShape(TRIANGLE_STRIP);
    for(let i = 0; i<100; i++){
        vertex(random(0,1),random(0,1));
        // vertex(random(0,1*width/2)-width/4,random(0,1*height/2)-height/4);
    }
    endShape();
    trailLayer.end();
}
let lastFrameCount = 0;
let speed = 1;

function setup(){
    backgroundVideo = createVideo('IMG_4678.MOV')
    backgroundVideo.hide();
    backgroundVideo.volume(0);
    backgroundVideo.play();
    // vid = createCapture(VIDEO);
    // vid.hide();
    mainCanvas = createCanvas(1000,1000,WEBGL);
    trailLayer = createFramebuffer(width,height);
    positionTexture = createFramebuffer({width:100,height:100,format:FLOAT});
    velTexture = createFramebuffer({width:100,height:100,format:FLOAT});
    initVelocities();//random velocities
}
function draw(){
    background(255);
    // lights();
    if(frameCount-lastFrameCount>speed){
        renderParticles();
        initPositions();
        lastFrameCount = frameCount;
    }
    image(backgroundVideo,-backgroundVideo.width/4,-backgroundVideo.height/4,backgroundVideo.width/2,backgroundVideo.height/2);
    image(backgroundVideo,-width/2,-height/2+positionTexture.height+velTexture.height,100,100);
    image(trailLayer,-width/2,-height/2,width,height);
    image(velTexture,-width/2,-height/2,positionTexture.width,positionTexture.height);
    image(positionTexture,-width/2,-height/2+positionTexture.height,velTexture.width,velTexture.height);
}