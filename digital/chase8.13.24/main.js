/*
Segment display using open and closed eyes
seven segs, but should be like 7x11 pics rects wide so there's padding
each segment is 3 pics long
*/

let canvas;

let chaser;
let runner;

const boundingBoxWidth = 100;
const dampForce = 1;
const lineWidth = 1;

function drawDot(obj){
    noFill();
    stroke(obj.color);
    strokeWeight(lineWidth);
    // point(obj.position.x,obj.position.y);
    line(obj.position.x,obj.position.y,obj.oldPosition.x,obj.oldPosition.y);
}

function updateChaser(){
    let newVel = p5.Vector.sub(runner.position,chaser.position);
    newVel.setMag(p5.Vector.dist(runner.position,chaser.position));
    newVel.mult(0.1);
    chaser.velocity = newVel;
    chaser.oldPosition.x = chaser.position.x;
    chaser.oldPosition.y = chaser.position.y;
    chaser.position.add(chaser.velocity);
}

function wrapBounds(obj){
    while(obj.position.x > canvas.width/2){
        obj.position.x -= canvas.width;
    }
    while(obj.position.x < -canvas.width/2){
        obj.position.x += canvas.width;
    }
    while(obj.position.y > canvas.height/2){
        obj.position.y -= canvas.height;
    }
    while(obj.position.y < -canvas.height/2){
        obj.position.y += canvas.height;
    }
}

function checkBounds(obj){
    let steering = createVector();
    let boundary;
    if(obj.position.x > (canvas.width/2-boundingBoxWidth)){
        boundary = createVector(canvas.width/2,obj.position.y);
    }
    else if(obj.position.x < (-canvas.width/2+boundingBoxWidth)){
        boundary = createVector(-canvas.width/2,obj.position.y);
    }
    else if(obj.position.y > (canvas.height/2-boundingBoxWidth)){
        boundary = createVector(obj.position.x,canvas.height/2);
    }
    else if(obj.position.y < (-canvas.height/2+boundingBoxWidth)){
        boundary = createVector(obj.position.x,-canvas.height/2);
    }
    else{
        return createVector(0,0);
    }
    steering.add(p5.Vector.sub(obj.position,boundary));
    steering.mult(pow(1/p5.Vector.dist(boundary,obj.position),2));
    steering.setMag(1);
    return steering;
}
function updateRunner(){
    wrapBounds(runner);
    let newVel = runner.velocity;
    newVel.add(checkBounds(runner));
    let runAway = p5.Vector.sub(runner.position,chaser.position);
    runAway.mult(1/pow(p5.Vector.dist(runner.position,chaser.position),2));
    // runAway.setMag(1/pow(p5.Vector.dist(runner.position,chaser.position),2));
    newVel.add(runAway);
    newVel.limit(10);
    runner.velocity = newVel;
    runner.oldPosition.x = runner.position.x;
    runner.oldPosition.y = runner.position.y;
    runner.position.add(runner.velocity);
}

function setup(){
    canvas = createCanvas(500,500,WEBGL);
    chaser = {
        velocity: createVector(random(-10,1),random(-10,1)),
        position: createVector(),
        oldPosition: createVector(),
        color: [0,0,0]
    };
    runner = {
        velocity: createVector(random(-1,1),random(-1,1)),
        position: createVector(),
        oldPosition: createVector(),
        color: [255,0,0]
    }
    background(255);
}

function draw(){
    // background(255);
    updateRunner();
    updateChaser();
    drawDot(chaser);
    drawDot(runner);
}