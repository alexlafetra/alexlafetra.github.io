//this has some 'behavior' implemented to approximate root behavior
/*
crowding -- don't split if you're close to other roots
*/

let mainCanvas;
let tree;
let tree2;
let forest;
let cam;

const maximumNewBranches = 3;
const maxTotalBranches = 2000;
const angleVariation = 20;
const lengthVar = 5;
//30 is a sweet spot
const colorVar = 30;

//slow, but pretty
const renderWithCurves = true;

//25 is a pretty good sweet spot
let growthReps = 25;

let scaleFactor = 1/2;
let update = false;
function setup() {
  mainCanvas = createCanvas(800,800,WEBGL);
  
  let startingPoint = new Point(0,0,0);
  //tree = new Tree(startingPoint,50,radians(angleVariation),lengthVar,PI/2);
  
  //cam = createEasyCam();
  //document.oncontextmenu = ()=>false;
  
  smooth();
  translate(-width/2,-height/2);
  background(0,0,0);
  const gap = 10;
  const numberOfColumns = 1;
  const numberOfRows = 1;
  const w = min((width-gap*(numberOfColumns+1))/numberOfColumns,(height-gap*(numberOfRows+1))/numberOfRows);
  let canv = createGraphics(w,w,WEBGL);
  for(let i = 0; i<numberOfColumns; i++){
    for(let j = 0; j<numberOfRows; j++){
      tree = new Tree(startingPoint,50,radians(angleVariation),lengthVar,PI/2);
      tree.growNTimes(growthReps);
      canv.smooth();
      canv.background(0);
      canv.push();
      canv.translate(0,-canv.width/3);
      canv.scale(1/min(2*numberOfColumns,2*numberOfRows));
      tree.render(canv);
      canv.pop();
      image(canv,gap+i*(w+gap),gap+j*(w+gap));
      stroke(255,255,255);
      strokeWeight(2);
      noFill();
      // rect(gap+i*(w+gap),gap+j*(w+gap),w,w,5);
      canv.clear();
    }
  }
}

let n = 0;
function draw() {
  if(update){
    scale(scaleFactor);
    translate(0,-height/2);
    background(0);
    tree.render();
    update = false;
  }
}

function keyPressed(){
  //tree.grow();
  //update = true;
}

class Tree{
  constructor(p1,branchLength,angleVariation,lengthVariation,angle){
    this.branches = [];
    let c = color(random(0,255),random(0,255),random(0,255));
    this.branches.push(new Branch(p1,p1,p1,branchLength,angle,angle,0,c));
    this.angleVariation = angleVariation;
    this.lengthVariation = lengthVariation;
  }
  grow(){
    let i = this.branches.length;
    for(let branch = 0; branch<i; branch++){
      if(this.branches[branch].isTip){
        this.branches = this.branches.concat(this.branches[branch].divide(this.angleVariation,this.lengthVariation,maximumNewBranches));
      }
    }
    //growthReps++;
  }
  growNTimes(n){
    for(let i = 0; i<n; i++){
      this.grow();
    }
  }
  render(canvas){
    for(let branch of this.branches){
      branch.render(canvas);
    }
  }
}

class Branch{
  constructor(p0,p1,p2,len,theta,phi,index,c){
    this.color = color(constrain(red(c)+random(-colorVar,colorVar),0,255),constrain(green(c)+random(-colorVar,colorVar),0,255),constrain(blue(c)+random(-colorVar,colorVar),0,255));
    
    this.index = index;
    this.isTip = true;
    
    this.len = len;
    this.theta = theta;
    this.phi = phi;
    
    this.lastStemStart = p0;
    this.lastStemEnd = p1;
    this.p0 = p2;
    this.p1 = new Point(this.p0.x+len*sin(theta)*cos(phi),this.p0.y+len*sin(theta)*sin(phi),this.p0.z+len*cos(theta));
  }
  //branch grows into a random number of new branches
  divide(angleVariation,lengthVariation,maxNewBranches){
    
    //grab the number of branches to grow;
    let n = floor(random(0,maxNewBranches));
    let newBranches = [];

    //if you're not growing any, return rn;
    if(n == 0){
      return newBranches;
    }
    //if you are growing some, set this node as no longer a 'tip'
    else{
      this.isTip = false;
    }
    
    //make branches
    for(let i = 0; i<n; i++){
      //get new angles and length
      let newPhi = this.phi+random(-angleVariation,angleVariation);
      let newTheta = this.theta+random(-angleVariation,angleVariation);
      let newLength = this.len+random(-lengthVariation,lengthVariation)-1;//new branches should be a lil shorter
      
      //add it to the list of branches
      newBranches.push(new Branch(this.lastStemEnd,this.p0,this.p1,newLength,newTheta,newPhi,this.index+1,this.color));
    }
    //return all the new branches
    return newBranches;
  }
  render(canvas){
    
    canvas.noFill();
    canvas.stroke(red(this.color)-255/growthReps*this.index,green(this.color)-255/growthReps*this.index,blue(this.color)-255/growthReps*this.index);
    //canvas.stroke(red(this.color)+255/growthReps*this.index,green(this.color)+255/growthReps*this.index,blue(this.color)+255/growthReps*this.index);
    //getting darker as the branches grow out
    //stroke(255-pow(this.index,1.5));
    //setting stroke weight to get thinner as the branches get further out
    //strokeWeight(map(this.index,0.0,growthReps,5.0,0.1));
    canvas.strokeWeight(constrain(10/this.index,0.1,4));
    
    if(renderWithCurves){
      //drawing curve
      canvas.beginShape();
      canvas.curveVertex(this.lastStemStart.x,this.lastStemStart.y,this.lastStemStart.z);
      canvas.curveVertex(this.lastStemEnd.x,this.lastStemEnd.y,this.lastStemEnd.z);
      canvas.curveVertex(this.p0.x,this.p0.y,this.p0.z);
      canvas.curveVertex(this.p1.x,this.p1.y,this.p1.z);
      canvas.curveVertex(this.p1.x,this.p1.y,this.p1.z);
      canvas.endShape();
    }
    else{
      //drawing line
      canvas.line(this.p0.x,this.p0.y,this.p0.z,this.p1.x,this.p1.y,this.p1.z);
    }

    //drawing flowers on the tips
    //if(this.isTip){
    //  push();
    //  translate(this.p1.x,this.p1.y,this.p1.z);
    //  stroke(0,255,100);
    //  strokeWeight(5);
    //  point(0,0,0);
    //  pop();
    //}
  }
}
class Point{
  constructor(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

function distance3D(p1,p2){
  return sqrt(sq(p1.x-p2.x)+sq(p1.y-p2.y)+sq(p1.z-p2.z));
}

function getPhi(p1,p2){
  return atan(abs(p1.y-p2.y)/abs(p1.x-p2.x));
}

function getTheta(p1,p2){
  return atan(sqrt(sq(p1.x-p2.x)+sq(p1.y-p2.y))/abs(p1.z-p2.z));
}
