//So first idea is to have video of dance cutting back and forth to different flow simulations
//I want the flow sims to be slow, like blood vessels in water under a microscope? not like wind
//They should also have large particles and not that many of them (but maybe a few of those would be cool)

//I think...
/*
particle rendering should be done on the CPU? So you can do circles?

*/

let NUMBER_OF_ATTRACTORS = 5;
let mainCanvas;
let particleMaskCanvas;
let gl;
const minStrength = 0;
const maxStrength = 0.1;

let backgroundVid;
const gap = 200;

function preload(){
    backgroundVid = createVideo("IMG_4804.MOV");
    backgroundVid.hide();
    backgroundVid.volume(0);
    backgroundVid.loop();
    backgroundVid.play();
}

function genRandomNodes(count){
    let attractors = [];
    let repulsors = [];
    for(let i = 0; i<count; i++){
        attractors.push(random());
        attractors.push(random());
        attractors.push(random(minStrength,maxStrength));
        repulsors.push(random());
        repulsors.push(random());
        repulsors.push(random(minStrength,maxStrength));    }
    let nodes = {attractors:attractors,repulsors:repulsors};
    return nodes;
}

function setup(){
    mainCanvas = createCanvas(600,600,WEBGL);
    gl = mainCanvas.GL;
    particleMaskCanvas = createFramebuffer(600,600);
    particleMaskCanvas.begin();
    background(255);
    particleMaskCanvas.end();
    initGL();
    // field = new NodeField(particleMaskCanvas,genRandomNodes(random(0,5)));
    // field.updateFlow();
    field = new NoiseField(particleMaskCanvas);
    field.updateFlow();
}
function mousePressed(){
    // field.loadNodes(genRandomNodes(random(0,5)));
}

function draw(){
    // background(0,0,255);
    image(backgroundVid,-width/2,-height/2,width,height);
    strokeWeight(2);
    fill(255);
    // rect(-width/2+gap,-height/2+gap,width-2*gap,height-2*gap);
    field.update();
}