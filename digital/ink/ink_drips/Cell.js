class Node{
    constructor(clr,x,y){
      this.velocity = createVector(0,0);
      //this.position = createVector(width/2,height/2);
      this.position = createVector(x,y);
      this.acceleration = createVector(0,0);
      this.c = clr;
    }
  }
  
  class Cell{
    constructor(x,y,r,clr){
      this.c = clr;
      let nodeNumber = r/5;
      this.nodes = [];
      this.radius = r;//target radius of cell (what it WANTS to be)
      this.volume = PI*exp(this.radius,2);//current volume of cell
      this.avgVertDistance = (2*PI*this.radius)/nodeNumber;
      let nodeC = 0;
      for(let i = 0; i<nodeNumber; i++){
        let temp = new Node(nodeC,cos(i*2*PI/nodeNumber)+x,sin(i*2*PI/nodeNumber)+y);
        this.nodes.push(temp);
        nodeC+=400/nodeNumber;
      }
    }
    getCenterPoint(){
      let center = createVector();
      for(let i = 0; i<this.nodes.length; i++){
        center.add(this.nodes[i].position);
      }
      center.div(this.nodes.length);
      return center;
    }
    //aligns each node with the one on either side of it
    tension(){
      for(let i = 0; i<this.nodes.length; i++){
        //get neighbor positions
        let neighbor1;
        let neighbor2;
        if(i == 0){
          neighbor2 = this.nodes[i+1].position;
          neighbor1 = this.nodes[this.nodes.length-1].position;
        }
        else if(i == this.nodes.length-1){
          neighbor1 = this.nodes[i-1].position;
          neighbor2 = this.nodes[0].position;
        }      
        else{
          neighbor2 = this.nodes[i+1].position;
          neighbor1 = this.nodes[i-1].position;
        }
        
        let d1 = p5.Vector.dist(this.nodes[i].position,neighbor1);
        let d2 = p5.Vector.dist(this.nodes[i].position,neighbor2);
        
        let force1 = createVector(0,0);
        if(d1>this.avgVertDistance){
          force1 = p5.Vector.sub(neighbor1,this.nodes[i].position);
        }
        
        let force2 = createVector(0,0);
        if(d2>this.avgVertDistance){
          force2 = p5.Vector.sub(neighbor2,this.nodes[i].position);
        }
        
        force1.mult((d1-this.avgVertDistance));
        force2.mult((d2-this.avgVertDistance));
        let finalForce = p5.Vector.add(force1,force2);
        this.nodes[i].acceleration.add(finalForce);
      }
    }
    otherCell(other){
      for(let i = 0; i<this.nodes.length; i++){
        //check dist between each of the two nodes
        let dist;
        for(let j = 0; j<other.nodes.length; j++){
          dist = p5.Vector.dist(this.nodes[i].position,other.nodes[j].position);
          if(dist<minDistance){
            let push = p5.Vector.sub(this.nodes[i].position,other.nodes[j].position);
            push.setMag(100);
            this.nodes[i].acceleration.add(push);
          }
        }
      }
    }
    walls(){
      for(let i = 0; i<this.nodes.length; i++){
        let xForce = createVector(0,0);
        let yForce = createVector(0,0);
        if(this.nodes[i].position.x<-width/2+wallThickness){
          xForce = p5.Vector.sub(createVector(0,this.nodes[i].position.y),this.nodes[i].position);
        }
        else if(this.nodes[i].position.x>width/2-wallThickness){
          xForce = p5.Vector.sub(createVector(0,this.nodes[i].position.y),this.nodes[i].position);
        }
        if(this.nodes[i].position.y<-height/2+wallThickness){
          yForce = p5.Vector.sub(createVector(this.nodes[i].position.x,0),this.nodes[i].position);
        }
        else if(this.nodes[i].position.y>(height/2-wallThickness)){
          yForce = p5.Vector.sub(createVector(this.nodes[i].position.x,0),this.nodes[i].position);
        }
        xForce.setMag(100);
        yForce.setMag(100);
        this.nodes[i].acceleration.add(xForce);
        this.nodes[i].acceleration.add(yForce);
      }
    }
    pressure(){
      //getting vector that pushes out from center point
      let centerPoint = this.getCenterPoint();
      for(let i = 0; i<this.nodes.length; i++){
        //force pointing out from the center
        let centerForce;
        let dist = p5.Vector.dist(centerPoint,this.nodes[i].position);
        //if point is inside radius
        if(dist<this.radius){
          centerForce = p5.Vector.sub(this.nodes[i].position,centerPoint);
          centerForce.setMag(pressureMag);
          //centerForce.mult(exp(this.radius-dist,2));
          //centerForce.setMag(1110);
          //centerForce.mult(1000);
        }
        this.nodes[i].acceleration.add(centerForce);
      }
    }
    mouseAttraction(){
      let mousePoint = createVector(mouseX-width/2,mouseY-height/2);
      let centerPoint = this.getCenterPoint();
      for(let i = 0; i<this.nodes.length; i++){
        let dist = p5.Vector.dist(mousePoint,this.nodes[i].position);
        //if the mouse isn't between the node and the centerpoint
        if(dist>p5.Vector.dist(centerPoint,this.nodes[i].position)){
          let mouseForce = p5.Vector.sub(mousePoint,this.nodes[i].position);
          //let force = p5.Vector.mult(mouseForce,1/dist);
          let force = mouseForce;
          //force.mult(1/dist);
          //force.limit(100);
          force.setMag(mouseMag);
          this.nodes[i].acceleration.add(force);
        }
      }
    }
    gravity(){
      for(let i = 0; i<this.nodes.length; i++){
        let grav = p5.Vector.sub(createVector(this.nodes[i].position.x,height/2-wallThickness),this.nodes[i].position);
        grav.setMag(gravMag);
        this.nodes[i].acceleration.add(grav);
      }
    }
    //updates the position, velocity, and acceleration of all the nodes
    update(){
      this.pressure();
      this.tension();
      this.mouseAttraction();
      this.gravity();
      this.walls();
      for(let i = 0; i<cellList.length; i++){
        this.otherCell(cellList[i]);
      }
      for(let i = 0; i<this.nodes.length; i++){
        this.nodes[i].position.add(this.nodes[i].velocity);
        this.nodes[i].velocity.add(this.nodes[i].acceleration);
        this.nodes[i].velocity.limit(3);
        this.nodes[i].acceleration = createVector(0,0);
      }
    }
    // from http://paulbourke.net/geometry/polygonmesh/
    computeArea() {
      let vertices = this.nodes;
      let area = 0;
      for (let i = 0; i < vertices.length - 1; i++) {
        let v = vertices[i];
        let vn = vertices[i + 1];
        area += (v.x * vn.y - vn.x * v.y) / 2;
      }
  
      return area;
    }
    show(){
      colorMode(HSB,400);
      noFill();
      for(let i = 0; i<this.nodes.length-1; i++){
        strokeWeight(20);
        stroke(this.nodes[i].c,400,400);
        line(this.nodes[i].position.x,this.nodes[i].position.y,this.nodes[i+1].position.x,this.nodes[i+1].position.y);
      }
      strokeWeight(20);
      stroke(this.nodes[this.nodes.length-1].c,400,400);
      line(this.nodes[this.nodes.length-1].position.x,this.nodes[this.nodes.length-1].position.y,this.nodes[0].position.x,this.nodes[0].position.y);
    }
    showCurve(){
      colorMode(HSB,400);
      strokeWeight(2);
      //stroke(0,0,0);
      noStroke();
      fill(this.c,400,400);
      beginShape();
      curveVertex(this.nodes[this.nodes.length-1].position.x,this.nodes[this.nodes.length-1].position.y);
      for(let i = 0; i<this.nodes.length; i++){
        curveVertex(this.nodes[i].position.x,this.nodes[i].position.y);
      }
      curveVertex(this.nodes[0].position.x,this.nodes[0].position.y);
      curveVertex(this.nodes[this.nodes.length-1].position.x,this.nodes[this.nodes.length-1].position.y);
      endShape();
    }
  }