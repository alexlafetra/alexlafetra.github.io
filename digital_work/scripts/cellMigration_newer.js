let cell = [];
let cellSize = 50;
let cellRad = 20;
let cellSide = 0; 
let odds = 1; //odds of a protrusion, odds = 1/10
let pNumber = 0;
let maxBifurcations = 2;
let maxProtrusionLength = 100;
let chemoattractant=0;
let weight1 = 1;//cell surface tension
let weight2 = 5;//cell pressure
let weight3 = 1;//actin push force
let weight5 = 100;//rate of bifurcation
let traceMode = false;
let isPaused = false;
let showActin = false;
let showCenter = false;
let bifurcated = false;
let c = true;//color or b/w
let modelType = "Bifurcation";

let divisionRate = 0;

let slider1;
let slider2;
let slider3;
let slider4;
let slider5;

function setup() {
  frameRate(30);
  angleMode(DEGREES);
  cellSide = 2*cellRad*(sin(180/cellSize));
  createCanvas(windowWidth,windowHeight);
  background(0);
  
  slider1 = createSlider(0,1,1,0.1);//membrane tension
  slider2 = createSlider(0,10,5,1);//cell pressure
  slider3 = createSlider(0,10,1,1);//actin 'push' force
  slider4 = createSlider(1,300,20,1);//cell radius
  slider5 = createSlider(1,100,30,1);//bifurcation rate
  slider1.position(10,100);
  slider2.position(10,150);
  slider3.position(10,200);
  slider4.position(10,250);
  slider5.position(10,300);  
  
  let pauseButton = createButton('Pause');
  pauseButton.position(10,10);
  pauseButton.mousePressed(pauseSim);

  let traceButton = createButton('Trace');
  traceButton.position(10,40);
  traceButton.mousePressed(changeMode);

  let actinButton = createButton('Show Actin Forces (do it)');
  actinButton.position(70,10);
  actinButton.mousePressed(actinToggle);

  let colorButton = createButton('Color Mode');
  colorButton.position(70,40);
  colorButton.mousePressed(toggleColor);

  let modelButton = createButton('Switch Models');
  modelButton.position(160,40);
  modelButton.mousePressed(toggleModel);
   
  chemoattractant = createVector(mouseX,mouseY);
  for(let i = 0; i<cellSize;i++){//building all the Boids
    cell.push(new Boid());
  }
}

function changeMode(){
  traceMode = !traceMode;
}
function pauseSim(){
  isPaused = !isPaused;
}

function actinToggle(){
  showActin = !showActin;
}

function toggleColor(){
  c = !c;
}

function toggleModel(){
  if(modelType == "Bifurcation")
    modelType = "Compass";
  else
    modelType = "Bifurcation";
}
function drawCell(){
  noFill();
  if(!c)
    stroke(255);
  strokeWeight(5);
  beginShape();
  curveVertex(cell[0].position.x,cell[0].position.y);
  curveVertex(cell[cell.length-1].position.x,cell[cell.length-1].position.y);
  for(let i = 0; i<cell.length; i++){
    curveVertex(cell[i].position.x,cell[i].position.y);
  }
  curveVertex(cell[0].position.x,cell[0].position.y);
  endShape();
}

function draw() {
  if(!isPaused){
    if(!traceMode){
      background(0);
    }
    noStroke();
    fill(255,255,255);
    textSize(20);
    text("Membrane Tension: "+slider1.value(),10,90);
    text("Cell Pressure: "+slider2.value(),10,140);
    text("Actin Force: "+slider3.value(),10,190);
    text("Cell Radius: "+slider4.value(),10,240);
    text("Bifurcation Rate: Every "+divisionRate+" frame(s)",10,290);   
    translate(width/2,height/2);

    stroke(255);
    strokeWeight(20);
    chemoattractant.set(mouseX-width/2,mouseY-height/2);
    point(chemoattractant.x,chemoattractant.y);
    
    weight1 = slider1.value();
    weight2 = slider2.value();
    weight3 = slider3.value();
    cellRad = slider4.value();
    divisionRate = slider5.value();
    
    let center = createVector();
    for(let boid of cell){
      center.add(boid.position);
      // boid.edges();
      if(modelType == "Bifurcation")
        boid.bifurcationModel(cell);
      else{
        boid.compassModel(cell);
        let farthestDist = 10000;
        let farthestPoint;
        //retracting farthest point
        for(let i = 0; i<cell.length; i++){
          let d = p5.Vector.dist(cell[i].position,chemoattractant);
          if(d<farthestDist && cell[i].isProtruding){
            farthestDist = d;
            farthestPoint = i;
          }
        }
        cell[farthestPoint].retract();
      }
      boid.update();
    }
    center.div(cell.length);
    let offset = p5.Vector.dist(center,chemoattractant);
    let c = 0;
    if(offset>80){
      c = color(255-offset,0,0+offset);
    }
    else{
      c = color(255,255-offset*2,255-offset*2);
    }
    stroke(c);
    drawCell();
  }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(0);
    initFlock();
}

class Boid{
    constructor(){
      if(cell.length == 0){//if it's the first boid
        this.partner1 = cellSize-1;//set it to the last boid
        this.partner2 = 1;
      }
      else if(cell.length == cellSize-1){//if it's the last boid
        this.partner1 = cell.length-1;
        this.partner2 = 0;
      }
      else{
        this.partner1 = cell.length-1;
        this.partner2 = cell.length+1;
      }
  
      this.position = createVector(0,cellRad);//holds the x,y coordinate of the boid
      this.position = p5.Vector.rotate(this.position, cell.length*(360/cellSize));
      //this.velocity = createVector(0,0);
      this.velocity = p5.Vector.random2D(); //holds velocity
      this.maxVel = 1;
      this.acceleration = createVector();//holds the force/acceleration
      this.isProtruding = false;//flag for whether or not the boid is a pseudopodium
      this.color =  color(random(0,255),random(0,255),random(0,255));//makes each boid a unique color
      //print("Partner 1: "+this.partner1);
      //print("Partner 2: "+this.partner2);
    }
    
    edges(){//checks, makes boids bump into edges
     if (this.position.x > width/2){
        this.position.x = width/2;
      }
      if (this.position.x < -width/2){
        this.position.x = -width/2;
      }
    
      if (this.position.y > height/2){
        this.position.y = height/2;
      }
      if (this.position.y < -height/2){
        this.position.y = -height/2;
      }
    }
  
    
    partnerDistance(boid){//moves boid closer or farther to partner1 
      let steering = createVector(0,0);
      let p1 = cell[this.partner1];
      let p2 = cell[this.partner2];
      let d1 = p5.Vector.dist(p1.position,this.position);
      let d2 = p5.Vector.dist(p2.position,this.position);
      if(d1!=d2){
        
        let steering1 = p5.Vector.sub(p1.position,this.position);
        let steering2 = p5.Vector.sub(p2.position,this.position);
    
        if(d1 > cellSide){
          steering.add(steering1);
        }
        if(d1 < cellSide){
          steering.add(-steering1);
        }
        if(d2 > cellSide){
          steering.add(steering2);
        }
        if(d2 < cellSide){
          steering.add(-steering2);
        }
      }
      steering.mult(weight1);
      return steering;
    }
    
    center(){//returns a vector to the center
      let center = createVector();
      for(let i = 0; i<cellSize; i++){//checking all the other boids
          center.add(cell[i].position);//add it's position to the common vect
      }
  
      center.div(cellSize);//get average dist
      strokeWeight(20);
      // point(center.x,center.y);
      return center;
    }
    
    centerPoint(boids){//returns a vector that pushes from the center
      let steering = createVector();
      let center = this.center();
      let distance = p5.Vector.sub(this.position,center);
  
      if(distance.mag()<cellRad){
        //line(center.x,center.y,this.position.x,this.position.y);
        steering = p5.Vector.sub(this.position,center);
      }
      steering.mult(weight2);
      return steering;
    }
    
    protrude(boids){//applies a force to a boid, marks it as protruding
      this.isProtruding = true;
      this.maxVel = weight3;
      pNumber++;
      let steering = p5.Vector.sub(this.center(),this.position);
      if(showActin){
        line(this.center().x,this.center().y,this.position.x,this.position.y);
      }
      steering = p5.Vector.rotate(steering,random(0,30));
      steering.mult(-weight3);
      return steering;
    }
    
    bifurcate(boids){//splits a protrusion into two
      let bifurcationAngle = 1;
      let p1 = this.partner1;
      let p2 = this.partner2;
      p1 = cell[p1].partner1;
      p2 = cell[p2].partner2;
      this.isProtruding = false;
  
      pNumber--;
      let steering = this.acceleration;
      if(!cell[p1].isProtruding){
        let steering1 = p5.Vector.rotate(steering, random(-10,-45));
        cell[p1].acceleration.add(steering1.mult(weight3));
        cell[p1].isProtruding = true;
        cell[p1].maxVel = weight3;
        pNumber++;
      }
      if(!cell[p2].isProtruding){
        let steering2 = p5.Vector.rotate(steering, random(10,45));
        cell[p2].acceleration.add(steering2.mult(weight3));
        cell[p2].isProtruding = true;
        cell[p2].maxVel = weight3;
        pNumber++;
  
      }
      this.acceleration.set(0,0);
    }
   
   
    retract(boids){//retracts a protrusion if it's not the closest
      if(this.isProtruding){
        let distance1 = p5.Vector.dist(this.position,chemoattractant);
        for(let i = 0; i<cellSize; i++){
          if(cell[i].isProtruding){
            let distance2 = p5.Vector.dist(cell[i].position,chemoattractant);
            //print(distance2);
            if(distance2<distance1){//if it's not the closest psuedopod, retract it
              this.isProtruding = false;
              bifurcated = false;
              this.maxVel = 1;
              pNumber--;
              this.acceleration.set(0,0);
              //this.acceleration.add(this.centerPoint(boids).mult(5));
              if(showActin){
                line(this.position.x,this.position.y,this.center().x,this.center().y);
              }
            }
          }
        }
      }
    }
    
    retractAll(boids){
      let i = 0;
      while(pNumber>0){
        if(cell[i].isProtruding){
          cell[i].isProtruding = false;
          cell[i].maxVel = 1;
          pNumber--;
        }
        i++;
      }
    }
  
    
    bifurcationModel(boids){
      let wallTension = this.partnerDistance(boids);
      let centerForce = this.centerPoint(boids);
      let distanceCenter = p5.Vector.dist(this.center(),chemoattractant);
      if(distanceCenter>cellRad){//if the chemoattractant is outside the cell    
        if(!this.isProtruding){//if it's not protruding, apply normal forces to it
          this.acceleration.set(0,0);
          this.acceleration.add(centerForce.div(1));
          this.acceleration.add(wallTension.div(1));    
          //print(pNumber);
          if(pNumber == 0){//if there are no protrusions
            let protrusionForce = this.protrude(boids);
            this.acceleration.add(protrusionForce.mult(3000));
          }
        }
        if(frameCount%divisionRate == 0){
          //print(pNumber);
  
          if(pNumber==1 && this.isProtruding && !bifurcated){
            this.bifurcate(boids);
            //this.isProtruding = false;
            //pNumber--;
            bifurcated = true;
          }
          else if(this.isProtruding && bifurcated){
            this.retract(boids);
          }
        }
      }
      else{
        this.retractAll(boids);
        this.acceleration.set(0,0);
        this.acceleration.add(centerForce.div(1));
        this.acceleration.add(wallTension.div(1));    
      }
    }
    
    //old
    compassModel(cell){
      let wallTension = this.partnerDistance(cell);
      let centerForce = this.centerPoint(cell);
      let distanceCenter = p5.Vector.dist(this.center(),chemoattractant);
      if(distanceCenter>cellRad){//if the chemoattractant is outside the cell    
        if(!this.isProtruding){//if it's not protruding, apply normal forces to it
          this.acceleration.set(0,0);
          this.acceleration.add(centerForce.div(1));
          this.acceleration.add(wallTension.div(1));    
          //print(pNumber);
          if(pNumber == 0){//if there are no protrusions
            let protrusionForce = this.protrude(cell);
            this.acceleration.add(protrusionForce.mult(3000));
          }
        }
        if(frameCount%divisionRate == 0){
          //protrude a random point
          let r = random(cell);
          if(r.isProtruding)
            r.retract();
          else  
            r.protrude();
        }
      }
      else{
        this.retractAll(cell);
        this.acceleration.set(0,0);
        this.acceleration.add(centerForce.div(1));
        this.acceleration.add(wallTension.div(1));    
      }
    }
  
    //old getColor();
    getColor(){//colors the segments based on proximity to chemoattractant
      let offset = p5.Vector.dist(this.position,chemoattractant);
      let c = 0;
      if(offset>80){
        c = color(255-offset,0,0+offset);
      }
      else{
        c = color(255,255-offset*2,255-offset*2);
      }
      return c;
    }
    
    show(){
      strokeWeight(5+100/(1+p5.Vector.dist(this.position,chemoattractant)));
      //stroke(this.color);
      stroke(this.getColor());
      point(this.position.x,this.position.y);
      
      let pointA = this.position;
      let pointB = cell[this.partner2].position;
      beginShape();
      vertex(pointA.x,pointA.y);
      vertex(pointB.x,pointB.y);
      endShape();
      if(this.isProtruding && showActin){
        strokeWeight(20);
        point(this.position.x,this.position.y);
      }
    }
    update(){
      this.position.add(this.velocity);
      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxVel);
    }
  }