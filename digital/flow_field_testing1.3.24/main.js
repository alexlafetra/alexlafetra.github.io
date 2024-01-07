/*
    Just testing out how vector fields look
*/

let canv;
let field;

class VectorField{
    constructor(w,h){
        this.velocities = [];
        this.positions = [];
        for(let x = width/w/2; x<width; x+=width/w){
            for(let y = height/h/2; y<height; y+=height/h){
                this.positions.push(createVector(x,y));
            }
        }
        for(let i = 0; i<this.positions.length; i++){
            let v = createVector(random(-1,1),random(-1,1));
            v.normalize();
            this.velocities.push(v);
        }
    }
    render(){
        strokeWeight(2);
        for(let i = 0; i<this.positions.length; i++){
            push();
            stroke(map(this.velocities[i].x,0,1,0,255),map(this.velocities[i].y,0,1,0,255),255);
            translate(this.positions[i].x,this.positions[i].y);
            line(0,0,10*this.velocities[i].x,10*this.velocities[i].y);
            pop();
        }
    }
    adjust(points){
        for(let i = 0; i<this.velocities.length; i++){
            let v = createVector(0,0);
            for(let p of points){
                v.add(p5.Vector.sub(p,this.positions[i]).setMag(1/p5.Vector.dist(p,this.positions[i])));
            }
            this.velocities[i] = v.normalize();
        }
    }
}
let pointList;
function setup(){
    canv = createCanvas(400,400);
    field = new VectorField(20,20);
    pointList = [];
    for(let i = 0; i<5; i++){
        pointList.push(createVector(random(0,width),random(0,height)));
    }
}
function mousePressed(){
    pointList = [];
    for(let i = 0; i<5; i++){
        pointList.push(createVector(random(0,width),random(0,height)));
    }
}
function draw(){
    background(255,0,0);
    pointList[0] = createVector(mouseX,mouseY);
    field.adjust(pointList);
    field.render();
}