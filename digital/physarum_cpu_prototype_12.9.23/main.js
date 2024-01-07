"use strict"
//Emulating physarum transport networks

//Nice blog post:
//https://cargocollective.com/sagejenson/physarum
//And a scientific paper (need 2 read this)
//https://uwe-repository.worktribe.com/output/980579

//each particle:
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
let renderParticles = false;
let renderGrid = true;
let diffuseGrid = false;
let diffusionStrength = 1.0;

//Our particle class
class MoldCell{
    constructor(x,y){
        this.velocity = p5.Vector.random2D();
        this.position = createVector(x,y);
    }
    //returns the x,y position of 3 sensors as an array of vectors
    getSensorPositions(){
        //find the 3 squares that we're sensing
        angleMode(DEGREES);
        let currentAngle = degrees(this.velocity.heading());
        let senseVectors = [createVector(lookAheadDistance*cos(-sensorAngle+currentAngle),lookAheadDistance*sin(-sensorAngle+currentAngle)),
                            createVector(lookAheadDistance*cos(currentAngle),lookAheadDistance*sin(currentAngle)),
                            createVector(lookAheadDistance*cos(sensorAngle+currentAngle),lookAheadDistance*sin(sensorAngle+currentAngle))];
        for(let i = 0; i<senseVectors.length; i++){
            senseVectors[i] = senseVectors[i].add(this.position);
        }
        return senseVectors;
    }
    senseAndRotate(trailData){

        //sense coordinates are these vectors + the position vector
        const senseVectors = this.getSensorPositions();

        let samplePoints = [];

        //turn your sensor positions into grid coordinates
        for(let i = 0; i<3; i++){
            let coords = {x:round(senseVectors[i].x),y:round(senseVectors[i].y)};
            if(coords.x>=trailData.length-1)
                coords.x-=trailData.length-1;
            if(coords.x<0)
                coords.x+=trailData.length-1;
            if(coords.y>=trailData[0].length-1)
                coords.y-=trailData[0].length-1;
            if(coords.y<0)
                coords.y+=trailData[0].length-1;
            samplePoints[i] = trailData[coords.x][coords.y];
        }

        //handling sample cases
        let turnForce = p5.Vector.add(this.velocity,this.position);

        //continue moving straight -- don't rotate
        if(samplePoints[1]>samplePoints[0] && samplePoints[1]> samplePoints[2]){
        }
        //rotate left
        else if(samplePoints[0]>samplePoints[1] && samplePoints[0]>samplePoints[2]){
            turnForce = senseVectors[0];
        }
        //move right
        else if(samplePoints[2]>samplePoints[0] && samplePoints[2]>samplePoints[1]){
            turnForce = senseVectors[2];
        }
        //if the two side samplePoints are equal (and greater than the middle)
        else if(samplePoints[0] == samplePoints[2] && samplePoints[0] != samplePoints[1]){
            
            turnForce = senseVectors[random([0,2])];
        }
        //if they're all equal
        else{
            turnForce = random(senseVectors);
        }

        turnForce.sub(this.position);
        this.velocity.add(turnForce.setMag(SENSE_INFLUENCE));
        this.velocity.limit(MAXVEL);
    }

    updatePosition(w,h){
        this.position.add(this.velocity);
        if(this.position.x>w-1)
            this.position.x -= (w-1);
        if(this.position.x<0)
            this.position.x += w-1;
        if(this.position.y>h-1)
            this.position.y -= (h-1);
        if(this.position.y<0)
            this.position.y += h-1;
    }

    render(scaleX,scaleY){
        if(renderParticles){
            stroke(255);
            point(this.position.x*scaleX,this.position.y*scaleY);
        }
        if(renderSensors){
            stroke(255,0,0);
            let sensors = this.getSensorPositions();
            for(let i = 0; i<3; i++){
                point(scaleX*sensors[i].x,scaleY*sensors[i].y);
                line(this.position.x*scaleX,this.position.y*scaleY,sensors[i].x*scaleX,sensors[i].y*scaleY);
            }
        }
        if(renderVectors){
            stroke(0,255,0);
            line(this.position.x*scaleX,this.position.y*scaleY,this.position.x*scaleX+this.velocity.x*scaleX,this.position.y*scaleY+this.velocity.y*scaleY);
        }
    }
};

function convolve(data,x,y,w,h){
    //Gaussian blur
    const kernel3x3 = [[1.0/16.0, 1.0/8.0, 1.0/16.0],
                        [1.0/8.0,  1.0/4.0, 1.0/8.0],
                        [1.0/16.0, 1.0/8.0, 1.0/16.0]];
    let total = 0.0;

    //making sure all the bounds are ok, but this is super inefficient
    for(let i = 0; i<3; i++){
        for(let j = 0; j<3; j++){
            //wrapping bounds
            let indexX = i+x-1;
            let indexY = j+y-1;
            if(indexX < 0)
                indexX += w-1;
            else if(indexX>(w-1))
                indexX-=w-1;
            if(indexY < 0)
                indexY += h-1;
            else if(indexY>(h-1))
                indexY-=h-1;
            total += data[indexX][indexY] * kernel3x3[i][j] * diffusionStrength;
        }
    }
    return total;
}

function convolution(data){
    for(let x = 0; x<data.length; x++){
        for(let y = 0; y<data[x].length; y++){
            data[x][y] = convolve(data,x,y,data.length,data[x].length);
        }
    }
    return data;
}

//Our 'canvas'/grid that stores the trail information
class PetriDish{
    constructor(w,h){
        this.width = w;
        this.height = h;
        this.scaleX = width/w;
        this.scaleY = height/h;
        this.trailData = [];
        //filling the trail data
        for(let i = 0; i<w; i++){
            this.trailData[i] = [];
            for(let j = 0; j<h; j++){
                this.trailData[i][j] = 0.0;
            }
        }
        //creating the cells
        this.cells = [];
        for(let i = 0; i<NUMBER_OF_PARTICLES; i++){
            this.cells.push(new MoldCell(random(0,w),random(0,h)));
        }
    }
    deposit(){
        for(let cell of this.cells){
            this.trailData[round(cell.position.x)][round(cell.position.y)]+=DEPOSIT_AMOUNT;
        }
    }
    diffuse(){
        this.trailData = convolution(this.trailData);
    }
    decay(){
        //decrementing each square
        for(let i = 0; i<this.width; i++){
            for(let j = 0; j<this.height; j++){
                this.trailData[i][j] *= decayValue;
            }
        }
    }
    pourMold(x,y){
        this.trailData[floor(map(x,0,width,0,this.width))][floor(map(y,0,height,0,this.height))] = 255;
    }
    update(){
        for(let particle of this.cells){
            particle.senseAndRotate(this.trailData);
            particle.updatePosition(this.width,this.height);
        }
        this.deposit();
        if(diffuseGrid)
            this.diffuse();
        this.decay();
    }
    render(){
        if(renderGrid){
            noStroke();
            for(let i = 0; i<this.width; i++){
                for(let j = 0; j<this.height; j++){
                    fill(this.trailData[i][j]);
                    push();
                    translate(i*this.scaleX,j*this.scaleY);
                    rect(0,0,this.scaleX,this.scaleY);
                    pop();
                }
            }
        }
        stroke(255);
        for(let particle of this.cells){
            particle.render(this.scaleX,this.scaleY);
        }
    }
};

let mainCanvas;
let dish;
function setup(){
    mainCanvas = createCanvas(400,400);
    dish = new PetriDish(GRID_W,GRID_H);
    initGui();
    angleMode(DEGREES);
}
function draw(){
    updateSliders();
    background(0);
    dish.update();
    if(mouseHeld){
        dish.pourMold(mouseX,mouseY);
    }
    dish.render();
}
let mouseHeld = false;
function mousePressed(){
    if(mouseX<windowWidth/2+width/2 
    && mouseX>windowWidth/2-width/2 
    && mouseY<windowHeight/2+height/2
    && mouseY>windowHeight/2-height/2){
    // mouseHeld = true;
    }
}
function mouseReleased(){
    mouseHeld = false;
}