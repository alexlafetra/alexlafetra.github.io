let canvas;

let chaser;
let runner;

const boundingBoxWidth = 100;
const dampFactor = 0.1;
const lineWidth = 5;
const comfortDistance = 200;

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

function clamp(val,lower,upper){
    if(val<lower){
        return lower;
    }
    else if(val > upper){
        return upper;
    }
    return val;
}

function clampBounds(obj){
    obj.position.x = clamp(obj.position.x,-canvas.width/2,canvas.width/2);
    obj.position.y = clamp(obj.position.y,-canvas.height/2,canvas.height/2);
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

function drawDot(obj){
    noFill();
    if(obj.running){
        stroke(0,0,255);
    }
    else{
        stroke(obj.color);
    }
    strokeWeight(lineWidth);
    // point(obj.position.x,obj.position.y);
    line(obj.position.x,obj.position.y,obj.oldPosition.x,obj.oldPosition.y);
    strokeWeight(1);
    ellipse(obj.position.x,obj.position.y,comfortDistance);
}

function pushTowardsCenter(obj){
    const centerPos = createVector(0,0);
    let newForce = p5.Vector.sub(centerPos,obj.position);
    newForce.normalize();
    newForce.mult(20*pow(obj.position.mag()/(canvas.width/2),2)*noise(obj.position.x,obj.position.y));
    return newForce;
}

function updateChaser(){
    // wrapBounds(chaser);
    clampBounds(chaser);

    let d = p5.Vector.dist(runner.position,chaser.position);
    let newVel = chaser.velocity;

    newVel.add(p5.Vector.sub(runner.position,chaser.position));

    //if you're too close, start running away
    if(d<comfortDistance){
        newVel.setMag(-10);
        chaser.running = true;
    }
    //if you're far away, chase the runner
    else{
        newVel.setMag(9);
        chaser.running = false;
    }
    chaser.velocity.add(newVel);
    // chaser.velocity.add(checkBounds(chaser));
    chaser.velocity.add(pushTowardsCenter(chaser));
    chaser.velocity.mult(dampFactor);
    chaser.oldPosition.x = chaser.position.x;
    chaser.oldPosition.y = chaser.position.y;
    chaser.position.add(chaser.velocity);
}


function updateRunner(){

    clampBounds(runner);

    let d = p5.Vector.dist(runner.position,chaser.position);
    let newVel = runner.velocity;

    newVel.add(p5.Vector.sub(chaser.position,runner.position))
    
    // if you're close, start chasing
    if(d<(comfortDistance+20) && d>(comfortDistance-10)){
        newVel.setMag(9);
        runner.running = false;
    }
    else{
        newVel.setMag(-10);
        runner.running = true;
    }


    runner.velocity.add(newVel);
    // runner.velocity.add(checkBounds(runner));
    runner.velocity.add(pushTowardsCenter(runner));
    runner.velocity.mult(dampFactor);
    runner.oldPosition.x = runner.position.x;
    runner.oldPosition.y = runner.position.y;
    runner.position.add(runner.velocity);
}

function setup(){
    canvas = createCanvas(1000,1000,WEBGL);
    chaser = {
        velocity: createVector(random(-10,1),random(-10,1)),
        position: createVector(random(-width/2,width/2),random(-height/2,height/2)),
        oldPosition: createVector(),
        color: [0,0,0]
    };
    runner = {
        velocity: createVector(random(-1,1),random(-1,1)),
        position: createVector(random(-width/2,width/2),random(-height/2,height/2)),
        oldPosition: createVector(),
        color: [255,0,0]
    }
    background(255);
}

function draw(){
    background(255);
    updateRunner();
    updateChaser();
    drawDot(chaser);
    drawDot(runner);
}