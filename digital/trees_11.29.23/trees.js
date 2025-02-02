let canvas;
let tree;
let tree2;

const maximumNewBranches = 3;
const maxTotalBranches = 1000;
let angleVariation = 40;
// const lengthVar = 5;
let lengthVar = 5;
//30 is a sweet spot
const colorVar = 30;

//slower, but pretty
const renderWithCurves = false;
let renderTips = true;
let blossomSize = 10;
const makeTreesGrowUpFirst = false;

const floorHeight = 1000000;

//20 is a good sweet spot (for the trees facing one another)
let growthReps = 20;

let scaleFactor = 1/2;
let update = true;

let lightMode = false;

let neighborDetectionDistance = 300;

let growthSlider;
function setup() {
  canvas = createCanvas(windowWidth,windowHeight,WEBGL);
  // growthSlider = createSlider(0,30,growthReps,1);
  newTree();
  noSmooth();
}

function newTree(){
  tree = new Tree(new Point(0,0,600),40,radians(angleVariation),lengthVar,PI);
  tree2 = new Tree(new Point(0,0,-600),-40,radians(angleVariation),lengthVar,-PI);

  smooth();
  scale(scaleFactor);
  // translate(0,-height/2);
  background(lightMode?255:0);
  tree.grow(maximumNewBranches,tree2);
  tree2.grow(maximumNewBranches,tree);
  tree.render();
  tree2.render();


  renderTips = (random(0,1)>0.5);
  blossomSize = random(1,10);
  neighborDetectionDistance = random(10,1000);
  angleVariation = random(10,45);

  setTimeout(newTree,1000);
}

function draw() {
  // growthReps = growthSlider.value();
  rotateY(frameCount/80);
  // rotateY(PI/2);
  if(tree.growthReps<growthReps){
    tree.grow(maximumNewBranches,tree2);
  }
  if(tree2.growthReps<growthReps){
    tree2.grow(maximumNewBranches,tree);
  }
  scale(scaleFactor);
  background(lightMode?255:0);
  tree.render();
  tree2.render();
}

function keyPressed(){
  // setTimeout(newTree,100);
}

function windowResized(){
  canvas = createCanvas(windowWidth,windowHeight);
}

class Tree{
  constructor(p1,branchLength,angleVariation,lengthVariation,angle){
    this.branches = [];
    // let c = color(random(0,255),random(0,255),random(0,255));
    let c = color(random(100,255),random(100,255),random(100,255));

    this.branches.push(new Branch(p1,p1,p1,branchLength,angle,angle,0,c));
    this.angleVariation = angleVariation;
    this.lengthVariation = lengthVariation;
    this.growthReps = 0;
    this.foundOtherTree = false;
  }
  grow(maxNewBranches,t){
    if(this.foundOtherTree)
      return;
    let i = this.branches.length;
    for(let branch = 0; branch<i; branch++){
      if(this.branches.isTouching){
        this.foundOtherTree = true;
        return;
      }
      if(this.branches[branch].isTip && (this.branches[branch].p1.y<floorHeight || this.branches[branch].index<5)){
        this.branches = this.branches.concat(this.branches[branch].divide(this.angleVariation,this.lengthVariation,maxNewBranches,t));
      }
    }
    this.growthReps++;
  }
  growNTimes(n){
    for(let i = 0; i<n; i++){
      this.grow();
    }
  }
  render(){
    for(let branch of this.branches){
      branch.render();
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

    this.isTouching = false;
    this.hasTargetPoint = false;
    this.targetPoint = this.p1;
  }
  //branch grows into a random number of new branches
  divide(angleVariation,lengthVariation,maxNewBranches,t){
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

    //make it so that trees are straighter when their index is shorter
    if(makeTreesGrowUpFirst)
      angleVariation = constrain(this.index*15,0,angleVariation);
    
    //make branches
    for(let i = 0; i<n; i++){

      //if the branch is already moving towards ampther branch, continue its movement
      if(this.hasTargetPoint){
        let point1 = createVector(this.p1.x,this.p1.y,this.p1.z);
        let point2 = createVector(this.targetPoint.x,this.targetPoint.y,this.targetPointz);
        let newLength = constrain(p5.Vector.dist(point1,point2),this.len-lengthVariation,this.len + lengthVariation);
        let directionToOtherTree = p5.Vector.sub(point2,point1);
        directionToOtherTree.normalize();
        let newTheta = constrain(lerp(this.theta, directionToOtherTree.angleBetween(createVector(0, 0, 1)), 0.5), this.theta - angleVariation, this.theta + angleVariation);
        let newPhi = constrain(atan2(directionToOtherTree.y, directionToOtherTree.x), this.phi - angleVariation, this.phi + angleVariation);
        // consider it touching if they're 1 unit apart
        let newBranch = new Branch(this.lastStemEnd, this.p0, this.p1, newLength, newTheta, newPhi, this.index + 1, this.color);
        if (p5.Vector.dist(point1,point2) < 50) {
          newBranch.isTouching = true;
        }
        else{
          newBranch.isTip = true;
        }
        this.isTip = false;
        newBranch.hasTargetPoint = true;
        newBranch.targetPoint = this.targetPoint;
        newBranches.push(newBranch);
        n--;
        if(n == 0)
          return newBranches;
      }
      //if it's not already moving to another branch, check and see if it should
      else{
        if(t == null){
          return newBranches;
        }
        //search for nearby branches on the other tree
        let closestDist = neighborDetectionDistance;
        let closestPoint = this.p1;
        for(let branch of t.branches){
          if(branch.isTip){
            let dist = p5.Vector.dist(createVector(this.p1.x,this.p1.y,this.p1.z),createVector(branch.p1.x,branch.p1.y,branch.p1.z));
            //if it's close enough to detect, make a branch in that direction
            if(dist<closestDist){
              closestDist = dist;
              closestPoint = branch.p1;
            }
          }
        }
        if (abs(closestDist) < neighborDetectionDistance) {
          let point1 = createVector(this.p1.x,this.p1.y,this.p1.z);
          let point2 = createVector(closestPoint.x,closestPoint.y,closestPoint.z);
          let newLength = constrain(p5.Vector.dist(point1,point2),this.len-lengthVariation,this.len + lengthVariation);
          let directionToOtherTree = p5.Vector.sub(point1,point2);
          directionToOtherTree.normalize();
          let newTheta = constrain(lerp(this.theta, directionToOtherTree.angleBetween(createVector(0, 0, 1)), 0.5), this.theta - angleVariation, this.theta + angleVariation);
          let newPhi = constrain(-atan2(directionToOtherTree.y, directionToOtherTree.x), this.phi - angleVariation, this.phi + angleVariation);
      
          // consider it touching if they're 1 unit apart
          let newBranch = new Branch(this.lastStemEnd, this.p0, this.p1, newLength, newTheta, newPhi, this.index + 1, this.color);
          if (closestDist < 50) {
            newBranch.isTouching = true;
          }
          else{
            newBranch.isTip = true;
          }
          newBranch.hasTargetPoint = true;
          newBranch.targetPoint = point2;
          newBranches.push(newBranch);
          n--;
          if(n<=0)
            return newBranches;
        }
      }
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
  render(){
    let colorScale = (lightMode?1:-1)*255/growthReps;
    noFill();
    stroke(red(this.color)+colorScale*this.index,green(this.color)+colorScale*this.index,blue(this.color)+colorScale*this.index);
    // stroke(this.color);
    //setting stroke weight to get thinner as the branches get further out
    strokeWeight(constrain(10/this.index,0.1,4));
    
    if(renderWithCurves){
      //drawing curve
      beginShape();
      curveVertex(this.lastStemStart.x,this.lastStemStart.y,this.lastStemStart.z);
      curveVertex(this.lastStemEnd.x,this.lastStemEnd.y,this.lastStemEnd.z);
      curveVertex(this.p0.x,this.p0.y,this.p0.z);
      curveVertex(this.p1.x,this.p1.y,this.p1.z);
      curveVertex(this.p1.x,this.p1.y,this.p1.z);
      endShape();
    }
    else{
      //drawing line
      line(this.p0.x,this.p0.y,this.p0.z,this.p1.x,this.p1.y,this.p1.z);
    }

    //drawing flowers on the tips
    if(this.isTip && renderTips){
     push();
     translate(this.p1.x,this.p1.y,this.p1.z);
    //  stroke(0,255,100);
     stroke(this.color);
     strokeWeight(blossomSize);
     point(0,0,0);
     pop();
    }
    if(this.isTouching){
      push();
      translate(this.p1.x,this.p1.y,this.p1.z);
      stroke(255,255,255);
      strokeWeight(5);
      point(0,0,0);
      pop();
    }
  }
}
class Point{
  constructor(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
  }
}