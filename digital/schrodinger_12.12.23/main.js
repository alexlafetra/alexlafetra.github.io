let canvas;
let waveShader;
let noiseOpacity = 0;
let noiseScale = 0.3;

function preload(){
    waveShader = loadShader('wave.vert','wave.frag');
}

function setup(){
    canvas = createCanvas(400,400,WEBGL);
    initGui();
}

function draw(){
    updateSliders();
    // background(0,255,255);
    shader(waveShader);
    waveShader.setUniform('uRandomSeed',1.0);
    waveShader.setUniform('uScale',noiseScale);
    waveShader.setUniform('uOpacity', noiseOpacity);
    waveShader.setUniform('uTime',frameCount);
    quad(-1,-1,-1,1,1,1,1,-1);
}