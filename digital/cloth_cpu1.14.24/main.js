/*
Demo of a cloth simulation using verlet integration to update the vertices of a mesh
Mesh vertices are constrained by springs
https://pikuma.com/blog/verlet-integration-2d-cloth-physics-simulation
*/

class Vertex{
    constructor(x,y,mass){
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
        this.mass = mass;
        this.fixed = false;
    }
    //verlet integration
    update(){
        if(this.fixed)
            return;
        let force = {x:0.0,y:gravity};
        if(mouse){
            force.y -= 0.01;
            force.x -= 0.01;
        }
        let acceleration = {x:force.x/this.mass,y:force.y/this.mass};
        let lastP = {x:this.x,y:this.y};

        // acceleration.x = clamp(acceleration.x,-maxForce,maxForce);
        // acceleration.y = clamp(acceleration.y,-maxForce,maxForce);

        // deltaT = deltaTime;

        this.x = 2*this.x - this.lastX + damp*(acceleration.x * (deltaT*deltaT));
        this.y = 2*this.y - this.lastY + damp*(acceleration.y * (deltaT*deltaT));

        this.lastX = lastP.x;
        this.lastY = lastP.y;
    }
    render(){
        strokeWeight(this.mass);
        point(this.x,this.y);
    }
}
class Spring{
    constructor(i1,i2,length){
        this.point1 = i1;
        this.point2 = i2;
        this.length = length;
    }
    constrain(){
        if(this.point1 == null || this.point2 == null)
            return;
        let pos1 = {x:vertices[this.point1].x,y:vertices[this.point1].y};
        let pos2 = {x:vertices[this.point2].x,y:vertices[this.point2].y};

        let diff = {x:pos1.x - pos2.x,
                    y:pos1.y - pos2.y};
        let dist = sqrt(diff.x*diff.x+diff.y*diff.y);
        let diffFactor = (this.length - dist)/dist*0.5;
        let offset = {x:diff.x*diffFactor,y:diff.y*diffFactor};
        // offset.x = clamp(offset.x,-maxForce,maxForce);
        // offset.y = clamp(offset.y,-maxForce,maxForce);

        if(!vertices[this.point1].fixed){
            vertices[this.point1].x = (pos1.x+offset.x);
            vertices[this.point2].y = (pos1.y+offset.y);
        }
        if(!vertices[this.point2].fixed){
            vertices[this.point2].x = (pos2.x-offset.x);
            vertices[this.point2].y = (pos2.y-offset.y);
        }
    }
    render(){
        if(this.point1 == null || this.point2 == null)
            return;
        strokeWeight(1);
        line(vertices[this.point1].x,vertices[this.point1].y,vertices[this.point2].x,vertices[this.point2].y);
    }
}

function clamp(t,a,b){
    if(t>b)
        t = b;
    else if(t<a)
        t = a;
    return t;
}

let vertices;
let constraints;
let mainCanvas;

const sideGap = 100;
const mass = 10.0;
let deltaT = 50;
const NUMBER_OF_POINTS_X = 15;
const NUMBER_OF_POINTS_Y = 15;
const gravity = 0.1;
const maxForce = 10;
let length = 2.0;
const damp = 0.1;
const spacing = 1.0;
const clothWidth = 500;
const clothHeight = 500;
const springDamp = 1.0;

let mouse = false;
let mouseForce;
let mouseStart;

function mousePressed(){
    mouse = true;
    mouseStart = {x:mouseX,y:mouseY};
}
function mouseReleased(){
    mouse = false;
    mouseForce = {x:mouseStart.x-mouseX,y:mouseStart.y-mouseY};
}

function setup(){
    mainCanvas = createCanvas(500,1000,WEBGL);
    vertices = [];
    constraints = [];
    frameRate(60);
    length = (width-2*sideGap)/NUMBER_OF_POINTS_X;
    for(let i = 0; i<NUMBER_OF_POINTS_X; i++){
        for(let j = 0; j<NUMBER_OF_POINTS_Y;j++){
            let x = -clothWidth/2 + sideGap + (clothWidth-2*sideGap)*i/NUMBER_OF_POINTS_X;
            let y = -clothHeight/2 + sideGap + (clothHeight-2*sideGap)*j/NUMBER_OF_POINTS_Y;
            let vert = new Vertex(x,y,mass);
            // let vert = new Vertex(x,y,random(1,mass));
            let currentIndex = vertices.length;
            //fix top points
            if(j == 0){
                vert.fixed = true;
            }
            //add side springs
            if(i > 0){
                let leftIndex = currentIndex-NUMBER_OF_POINTS_Y;
                constraints.push(new Spring(currentIndex,leftIndex,length));
            }
            //add bottom springs
            if(j<(NUMBER_OF_POINTS_Y-1)){
                let downIndex = currentIndex+1;
                constraints.push(new Spring(currentIndex,downIndex,length));
            }
            vertices.push(vert);
        }
    }
    stroke(255);
    strokeWeight(2);
}
function keyPressed(){
    if(key == "p"){
        for(let p of vertices){
            p.update();
        }
    }
}
function draw(){
    background(0);
    for(let c of constraints){
        c.constrain();
        c.render();
    }
    for(let p of vertices){
        p.update();
        p.render();
    }
}