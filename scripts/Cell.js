class Node{
  constructor(){
    this.velocity = createVector(0,0);
    //this.position = createVector(width/2,height/2);
    this.position = p5.Vector.random2D();
    this.acceleration = createVector(0,0);
    this.nearest = 0;
    this.secondNearest = 0;
    this.nearestNodes = [];
  }
  addNextNearest(node){
    //if there are no nodes, it's automatically one of the closest
    if(this.nearestNodes.length == 0){
      this.nearestNodes.push(node);
      return;
    }
    for(let i = 0; i<this.nearestNodes.length; i++){
      //first, check to see if this node is already in the list
      if(this.nearestNodes[i] == node){
        return;
      }
      else if(this.nearestNodes.length<5){
        this.nearestNodes.push(node);
      }
      //else, if this node is closer
      else{
          let newDist = p5.Vector.dist(cell.nodes[node].position,this.position);
          let oldDist = p5.Vector.dist(cell.nodes[this.nearestNodes[i]].position,this.position);
          if(newDist<oldDist){
            let tempNode = this.nearestNodes[i];
            this.nearestNodes[i] = node;
            this.addNextNearest(tempNode);
            return;
          }
        }
    }
  }
}

class Cell{
  constructor(){
    let nodeNumber = 50;
    this.nodes = [];
    this.radius = 100;//target radius of cell (what it WANTS to be)
    this.volume = 300;//current volume of cell
    for(let i = 0; i<nodeNumber; i++){
      let temp = new Node();
      this.nodes.push(temp);
    }
  }
  getCenterPoint(){
    let center = createVector();
    for(let i = 0; i<this.nodes.length; i++){
      center.add(this.nodes[i].position);
    }
    center.div(this.nodes.length);
    //noStroke(0);
    //fill(255,0,0);
    //ellipse(center.x,center.y,100,100);
    return center;
  }
  //updates the two nearest nodes
  updateNearest_old(){
    let nearest, secondNearest;
    let distance = createVector(width,height);
    let secondDistance = createVector(width,height);
    for(let a = 0; a<this.nodes.length; a++){
      this.nodes[a].nearestNodes = [];
      nearest = this.nodes[a].nearest;
      secondNearest = this.nodes[a].secondNearest;
      for(let i = 0; i<this.nodes.length; i++){
        if(i != a){
          //if the new point is closer than the old closest point, it's the closest
          if(p5.Vector.dist(this.nodes[i].position,this.nodes[a].position) < p5.Vector.dist(this.nodes[this.nodes[a].nearest].position,this.nodes[a].position) && this.nodes[a].secondNearest != i){
            this.nodes[a].nearest = i;
          }
          //if it's not smaller than dist, but smaller than secondDist, it's the second nearest
          else if(p5.Vector.dist(this.nodes[i].position,this.nodes[a].position) < p5.Vector.dist(this.nodes[this.nodes[a].secondNearest].position,this.nodes[a].position) && this.nodes[a].nearest != i){
            this.nodes[a].secondNearest = i;
          }
        }
      }
    }
  }
  updateNearest(){
    for(let i = 0; i<this.nodes.length; i++){
      this.nodes[i].nearestNodes = [];
      for(let j = 0; j<this.nodes.length; j++){
        this.nodes[i].addNextNearest(j);
      }
    }
  }
  updateVolume(){
    
  }
  //force that pushes nodes towards two nearest neighbors
  membraneTension(){
    //getting two nearest nodes
    for(let i = 0; i<this.nodes.length; i++){
      for(let j = 0; j<this.nodes.length; j++){
        if(i != j){
          let dist = p5.Vector.dist(this.nodes[i].position,this.nodes[j].position);
          //if they're closer than 50 away, move them together
          if(dist<50){
            let neighborForce = p5.Vector.sub(this.nodes[i].position,this.nodes[j].position);
            neighborForce.mult(10);
            this.nodes[i].acceleration.add(neighborForce);
          }
        }
      }
      //let neighborForce1 = p5.Vector.sub(this.nodes[this.nodes[i].nearest].position,this.nodes[i].position);
      //let neighborForce2 = p5.Vector.sub(this.nodes[this.nodes[i].secondNearest].position,this.nodes[i].position);
      //this.nodes[i].acceleration.add(neighborForce1);
      //this.nodes[i].acceleration.add(neighborForce2);
    }
  }
  externalPressure(){
    //getting vector that pushes out from center point
    let centerPoint = this.getCenterPoint();
    for(let i = 0; i<this.nodes.length; i++){
      //force pointing out from the center
      let centerForce = p5.Vector.sub(centerPoint,this.nodes[i].position);
      centerForce.setMag(dist-this.radius);
      //centerForce.mult(100);
      this.nodes[i].acceleration.add(centerForce);
    }
  }
  //pushes nodes outwards from the average center of the cell, or pulls them in
  cellPressure(){
    //getting vector that pushes out from center point
    let centerPoint = this.getCenterPoint();
    for(let i = 0; i<this.nodes.length; i++){
      //force pointing out from the center
      let centerForce = p5.Vector.sub(this.nodes[i].position,centerPoint);
      centerForce.setMag(this.radius-dist);
      //centerForce.mult(10);
      this.nodes[i].acceleration.add(centerForce);
    }
  }
  avoidNeighbors(){
    for(let i = 0; i<this.nodes.length; i++){
      let avoidanceForce = p5.Vector.sub(this.nodes[i].position,this.nodes[this.nodes[i].nearest].position);
      let dist = p5.Vector.dist(this.nodes[i].position,this.nodes[this.nodes[i].nearest].position);
      if(dist < 20){
        avoidanceForce.setMag(pow(1/dist,2));
        //avoidanceForce.setMag(0.01);
        //avoidanceForce.setMag(10);
        this.nodes[i].acceleration.add(avoidanceForce);
      }
    }
  }
  mousePressure(){
    let mousePoint = createVector(mouseX-windowWidth/2,mouseY-windowHeight/2);
    let centerPoint = this.getCenterPoint();
    //if the mouse is outside the avg center
    let dist = p5.Vector.dist(mousePoint,centerPoint);
    //if(dist<this.radius){
    //  return;
    //}    
    let mouseForce = p5.Vector.sub(mousePoint,centerPoint);
    mouseForce.mult(0.1);
    for(let i = 0; i<this.nodes.length; i++){
      mouseForce.limit(10);
      this.nodes[i].acceleration.add(mouseForce);
    }
  }
  screenCenterPressure(){
    let screenMidpoint = createVector(0,0);
    let centerPoint = this.getCenterPoint();
    //if the mouse is outside the avg center
    let dist = p5.Vector.dist(screenMidpoint,centerPoint);
    //if(dist<this.radius){
    //  return;
    //}    
    let mouseForce = p5.Vector.sub(screenMidpoint,centerPoint);
    mouseForce.mult(0.1);
    for(let i = 0; i<this.nodes.length; i++){
      mouseForce.limit(10);
      this.nodes[i].acceleration.add(mouseForce);
    }
  }
  //updates the position, velocity, and acceleration of all the nodes
  update(){
    this.updateNearest();
    this.externalPressure();
    this.avoidNeighbors();
    this.membraneTension();
    //this.mousePressure();
    this.screenCenterPressure();
    for(let i = 0; i<this.nodes.length; i++){
      this.nodes[i].position.add(this.nodes[i].velocity);
      this.nodes[i].velocity.add(this.nodes[i].acceleration);
      //this.nodes[i].acceleration.limit(10);
      this.nodes[i].velocity.setMag(10);
      this.nodes[i].acceleration = createVector(0,0);
    }
  }
  show(){
    colorMode(HSB,400);
    //strokeWeight(20);
    strokeWeight(30);
    for(let i = 0; i<this.nodes.length; i++){
      //ellipse(this.nodes[i].position.x,this.nodes[i].position.y,20,20);
      //stroke(frameCount%400,400,400);
      beginShape();
      noFill();
      for(let j = 0; j<this.nodes[i].nearestNodes.length; j++){
        let nearest = this.nodes[i].nearestNodes[j];
        let len = 200+p5.Vector.dist(this.nodes[nearest].position,this.nodes[i].position);
        stroke(map(len,0,600,0,400),200,400);
        curveVertex(this.nodes[nearest].position.x,this.nodes[nearest].position.y);
        //line(this.nodes[nearest].position.x,this.nodes[nearest].position.y,this.nodes[i].position.x,this.nodes[i].position.y); 
      }
      endShape();
    }
  }
}
