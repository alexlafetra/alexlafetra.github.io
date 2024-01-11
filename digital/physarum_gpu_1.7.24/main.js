let flowField;
let showingMap = false;
let p = [];
let gl;
let mainCanvas;
let idBuffer;
let ids;

function genRandomPoints(n){
    let points = [];
    for(let i = 0; i<n; i++){
        points.push({x:random(0,1),y:random(0,1)});
    }
    return points;
}

function preload(){
    flowFieldShader = loadShader('flowMap.vert','flowMap.frag');
    randomShader = createShader(defaultVert,randomFrag);
}

let f = [];


function setup(){
    setAttributes('antialias',false);
    pixelDensity(1);
    //create canvas and grab webGL context
    mainCanvas = createCanvas(1000,1000,WEBGL);
    gl = mainCanvas.GL;

    p = genRandomPoints(10);

    //creating map mask
    let mask = createFramebuffer({width:width,height:height,format:FLOAT});
    mask.begin();
    background(255);
    mask.end();

    flowField = new FlowField(p,mask,null,flowFieldShader);

    initGui();
    flowField.update();
    for(let i = 0; i<p.length; i++){
        f.push(createVector(random(-1,1),random(-1,1)));
    }
}


function draw(){
    p[9].x = mouseX/width;
    p[9].y = mouseY/height;

    updateSliders();
    flowField.renderGL();
    flowField.renderData();
    flowField.updateFlow(p,flowField.flowFieldTexture);
    flowField.update();

}