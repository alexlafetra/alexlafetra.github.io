let predictions = [];
let webCam;//webCam object for the webcam
let font;
const options = {flipHorizontal: false,maxContinuousChecks: 5,detectionConfidence: 0.9, maxFaces: 10, scoreThreshold: 0.75,iouThreshold: 0.3 };

let canvas;
let tree;
let tree2;

const maximumNewBranches = 4;
const maxTotalBranches = 1000;
let angleVariation = 40;
// const lengthVar = 5;
let lengthVar = 1;
//30 is a sweet spot
const colorVar = 30;
//slower, but pretty
const renderWithCurves = false;
let renderTips = true;
let blossomSize = 10;
const makeTreesGrowUpFirst = false;
//20 is a good sweet spot (for the trees facing one another)
let growthReps = 32;
let neighborDetectionDistance = 300;
//Offsetting the trees for their growth logic
//so that they simulate having a distance between them, even tho their actual geometry starts at [0,0,0]
let treeOffset = {x:500,y:0,z:0};
let LEyeOffset = {x:0,y:0,z:0};
let REyeOffset = {x:0,y:0,z:0};
let rotationAngleL = {x:0,y:0};
let rotationAngleR = {x:0,y:0};

//framebuffers for rendering the two trees to
let leftEyeBuffer;
let rightEyeBuffer;

function drawKeypoints(){
  for(let i = 0; i<predictions.length; i++){
    const keypoints = predictions[i].scaledMesh;
    for(let j = 0; j<keypoints.length; j++){
      const [x,y] = keypoints[j];
      strokeWeight(4);
      stroke(0,255,0);
      point(x-webCam.width/2,y-webCam.height/2);
    }
  }
}

function preload(){
  font = loadFont("data/EBGaramond-Italic-VariableFont_wght.ttf");
}

function setup() {
  canvas = createCanvas(windowWidth,windowHeight,WEBGL);
  newTree();
  noSmooth();
  webCam = createCapture();
  //hiding webCam bc you're using it as a texture
  webCam.hide();
  webCam.volume(0);
  //loading facemesh
  const facemesh = ml5.facemesh(webCam,options,()=>{console.log("loaded face detection model");});
  //setting prediction pipeline
  facemesh.on('face',results =>{
    predictions = results;
  });
  leftEyeBuffer = createFramebuffer();
  rightEyeBuffer = createFramebuffer();

  treeLoop();
}

function newTree(){
  tree = new Tree(new Point(0,0,0),-40,radians(angleVariation),lengthVar,PI);
  tree2 = new Tree(new Point(0,0,0),-40,radians(angleVariation),lengthVar,PI);

  tree.grow(maximumNewBranches,tree2,treeOffset);
  tree2.grow(maximumNewBranches,tree,{x:-treeOffset.x,y:-treeOffset.y,z:-treeOffset.z});
  tree.render();
  tree2.render();


  renderTips = (random(0,1)>0.5);
  blossomSize = random(1,10);
  neighborDetectionDistance = random(10,1000);
  angleVariation = random(10,45);
}

function treeLoop(){
  newTree();
  setTimeout(treeLoop,2000);
}

function renderEyes(){
  //arrays of points of each feature 
  //picking features by their keyword (console.log(predictions))
  //reversing the upper arrays to the polygons connect in the right order
  let LEyeCoords = predictions[0].annotations.leftEyeLower0.concat(predictions[0].annotations.leftEyeUpper0.toReversed());
  let REyeCoords = predictions[0].annotations.rightEyeLower0.concat(predictions[0].annotations.rightEyeUpper0.toReversed());
  let mouthCoords = predictions[0].annotations.lipsLowerInner.concat(predictions[0].annotations.lipsUpperInner);
    
  fill(255,0,100);
  stroke(255,0,100);
  // texture(webCam);
  // textureMode(NORMAL);
  beginShape();
  for(let i = 0; i<LEyeCoords.length; i++){
    //mapping uv coords
    vertex(LEyeCoords[i][0]-webCam.width/2,LEyeCoords[i][1]-webCam.height/2,0,map(LEyeCoords[i][0],0,webCam.width,0,1),map(LEyeCoords[i][1],0,webCam.height,0,1));
  }
  endShape();
  beginShape();
  for(let i = 0; i<REyeCoords.length; i++){
    vertex(REyeCoords[i][0]-webCam.width/2,LEyeCoords[i][1]-webCam.height/2,0,map(LEyeCoords[i][0],0,webCam.width,0,1),map(REyeCoords[i][1],0,webCam.height,0,1));
  }
  endShape();
  
  beginShape();
  for(let i = 0; i<mouthCoords.length; i++){
    vertex(mouthCoords[i][0]-webCam.width/2,mouthCoords[i][1]-webCam.height/2,0,map(mouthCoords[i][0],0,webCam.width,0,1),map(mouthCoords[i][1],0,webCam.height,0,1));
  }
  endShape();
}

function rotateToEye(){
  let LEyeCoords = predictions[0].annotations.leftEyeLower0;
  let REyeCoords = predictions[0].annotations.rightEyeLower0;

  //get average loc 
  let newLEyeOffset = {x:0,y:0,z:0};
  for(let coord of LEyeCoords){
    newLEyeOffset.x+=coord[0];
    newLEyeOffset.y+=coord[1];
    newLEyeOffset.z+=coord[2];
  }
  LEyeOffset.x = ((newLEyeOffset.x/LEyeCoords.length)+LEyeOffset.x)/2;
  LEyeOffset.y = ((newLEyeOffset.y/LEyeCoords.length)+LEyeOffset.y)/2;
  LEyeOffset.z = ((newLEyeOffset.z/LEyeCoords.length)+LEyeOffset.z)/2;

  let newREyeOffset = {x:0,y:0,z:0};
  for(let coord of REyeCoords){
    newREyeOffset.x+=coord[0];
    newREyeOffset.y+=coord[1];
    newREyeOffset.z+=coord[2];
  }
  REyeOffset.x = ((newREyeOffset.x/REyeCoords.length)+REyeOffset.x)/2;
  REyeOffset.y = ((newREyeOffset.y/REyeCoords.length)+REyeOffset.y)/2;
  REyeOffset.z = ((newREyeOffset.z/REyeCoords.length)+REyeOffset.z)/2;

  //you really don't need to do this twice, since the distance between human eyes
  //is so small
  let normalVectorL = calcNormalVectorFromPlane(createVector(LEyeCoords[0][0],LEyeCoords[0][1],LEyeCoords[0][2]),
                                              createVector(LEyeCoords[floor(LEyeCoords.length/2)][0],LEyeCoords[floor(LEyeCoords.length/2)][1],LEyeCoords[floor(LEyeCoords.length/2)][2]),
                                              createVector(LEyeCoords[floor(LEyeCoords.length-1)][0],LEyeCoords[floor(LEyeCoords.length-1)][1],LEyeCoords[floor(LEyeCoords.length-1)][2]));
  normalVectorL.normalize();
  let newRotationAngleL = {y:atan2(normalVectorL.y, normalVectorL.x),x:atan2(normalVectorL.y, normalVectorL.z)};
  rotationAngleL.y = (newRotationAngleL.y+rotationAngleL.y)/2;
  rotationAngleL.x = (newRotationAngleL.x+rotationAngleL.x)/2;

  let normalVectorR = calcNormalVectorFromPlane(createVector(REyeCoords[0][0],REyeCoords[0][1],REyeCoords[0][2]),
                                           createVector(REyeCoords[floor(REyeCoords.length/2)][0],REyeCoords[floor(REyeCoords.length/2)][1],REyeCoords[floor(REyeCoords.length/2)][2]),
                                           createVector(REyeCoords[floor(REyeCoords.length-1)][0],REyeCoords[floor(REyeCoords.length-1)][1],REyeCoords[floor(REyeCoords.length-1)][2]));
  normalVectorR.normalize();
  let newRotationAngleR = {y:atan2(normalVectorR.y, normalVectorR.x),x:atan2(normalVectorR.y, normalVectorR.z)};
  rotationAngleR.y = (newRotationAngleR.y+rotationAngleR.y)/2;
  rotationAngleR.x = (newRotationAngleR.x+rotationAngleR.x)/2;
}

function calcNormalVectorFromPlane(p1,p2,p3){
  //p1, p2, and p3
  let v1 = p5.Vector.sub(p1,p2);
  let v2 = p5.Vector.sub(p3,p2);

  return p5.Vector.cross(v1,v2);
}
function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
}

function mouseReleased(){
  // newTree();
}

let angleBetweenEyes;
function draw() {
  angleBetweenEyes = PI/16;

  if(tree.growthReps<growthReps){
    tree.grow(maximumNewBranches,tree2,treeOffset);
  }
  if(tree2.growthReps<growthReps){
    tree2.grow(maximumNewBranches,tree,{x:-treeOffset.x,y:-treeOffset.y,z:-treeOffset.z});
  }

  background(0);
  // background(255);

  //drawing webcam vid
  push();
  noStroke();
  texture(webCam);
  plane(webCam.width, webCam.height)
  stroke(255,0,100);
  noFill();
  rect(-webCam.width/2,-webCam.height/2,webCam.width,webCam.height);
  pop();
  
  const face = predictions[0];

  //it actually looks p good with no rotation
  //bc the z depth 'fakes' the way the lines should move with your head
  //(you can tell it's fake by moving your face away from the center of the camera,
  //even tho the plane of ur head stays parallel to the screen, the lines rotate)

  if(face){
    rotateToEye();
  }

  push();
  leftEyeBuffer.begin();
  clear();
  rotateY(rotationAngleL.y-PI/2+angleBetweenEyes);
  rotateX(-rotationAngleL.x+PI/4);
  tree.render();
  // tree2.render();
  leftEyeBuffer.end();
  pop();
  push();
  translate(LEyeOffset.x-webCam.width/2,LEyeOffset.y-webCam.height/2);
  image(leftEyeBuffer,-width/2,-height/2,width,height);
  pop();

  resetMatrix();
  rightEyeBuffer.begin();
  clear();
  rotateY(rotationAngleR.y-PI/2-angleBetweenEyes);
  rotateX(rotationAngleR.x-PI/4);
  tree2.render();
  rightEyeBuffer.end();
  push();
  translate(REyeOffset.x-webCam.width/2,REyeOffset.y-webCam.height/2);
  image(rightEyeBuffer,-width/2,-height/2,width,height);
  pop();
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
  grow(maxNewBranches,t,offset){
    if(this.foundOtherTree)
      return;
    let i = this.branches.length;
    for(let branch = 0; branch<i; branch++){
      if(this.branches.isTouching){
        this.foundOtherTree = true;
        return;
      }
      if(this.branches[branch].isTip && this.branches[branch].index<5){
        this.branches = this.branches.concat(this.branches[branch].divide(this.angleVariation,this.lengthVariation,maxNewBranches,t,offset));
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
  divide(angleVariation,lengthVariation,maxNewBranches,t,offset){
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
        let point2 = createVector(this.targetPoint.x+offset.x,this.targetPoint.y+offset.y,this.targetPoint.z+offset.z);
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
            let dist = p5.Vector.dist(createVector(this.p1.x,this.p1.y,this.p1.z),createVector(branch.p1.x+offset.x,branch.p1.y+offset.y,branch.p1.z+offset.z));
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
    let colorScale = -255/growthReps;
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