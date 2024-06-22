const areaSize = 400;
let targetMultiplier = 1.5;
let cohesionMultiplier = 1.3;
let separationMultiplier = 1.8;
let alignmentMultiplier = 1;

let perceptionRadius = 100;

class Boid{
    constructor(){

        this.maxForce = 0.2;
        this.maxSpeed = 10;

        //centered at 0,0
        this.position = p5.Vector.random3D();
        this.position.mult(width);
        this.oldPosition = null;
        this.velocity = p5.Vector.random3D();
        this.velocity.setMag(random(2,4));
        this.acceleration = createVector(0,0,0);


        //for possibly creating per-boid bounding boxes
        //This should probably just be a bounding box object that you pass into edge checks
        this.areaWidth = width;
        this.areaHeight = height;

        this.perceptionRadius = perceptionRadius;

        this.color = color(random(0,255),random(0,255),random(0,255));
        this.pointSize = 5;
        
    }
    //wraps a boid around
    wrapEdges(){
        if (this.position.x > this.areaWidth){
          this.position.x = 0;
        }
        if (this.position.x < 0){
          this.position.x = this.areaWidth;
        }
        if (this.position.y > this.areaHeight){
            this.position.y = 0;
          }
          if (this.position.y < 0){
            this.position.y = this.areaHeight;
        }
    }
    align(flock){//makes the boids go in the same direction
        let steering = createVector();
        let total = 0;
        for(let other of flock){
          let d = dist(
            this.position.x,
            this.position.y,
            other.position.x,
            other.position.y);
           
          if( other != this && d < this.perceptionRadius){
            steering.add(other.velocity);
            total++;
          }
        }
        if(total>0){
          steering.div(total);
          steering.setMag(this.maxSpeed);
          steering.sub(this.velocity);
          steering.limit(this.maxForce);
        }
        return steering;
    }
    cohesion(flock){//makes the boids go towards one another
        let steering = createVector();
        let total = 0;
        for(let other of flock){
          let d = dist(
            this.position.x,
            this.position.y,
            other.position.x,
            other.position.y);
           
          if(other != this && d < this.perceptionRadius){
            steering.add(other.position);
            total++;
          }
        }
        if(total>0){
          steering.div(total);
          steering.sub(this.position);
          steering.setMag(this.maxSpeed);
          steering.sub(this.velocity);
          steering.limit(this.maxForce);
        }
        return steering;
    }
      
    targetPoint(targetP){//makes the boids go towards the mouse
        let steering = createVector();
        let dToTarget = p5.Vector.sub(this.position,targetP);
        // if(dToTarget.mag() < this.perceptionRadius){
            steering.add(targetP);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed*dToTarget.mag());
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        // }
        return steering;
    }
    
    separation(flock){//keeps the boids from one another
        let steering = createVector();
        let total = 0;
        for(let other of flock){
            let d = dist(
            this.position.x,
            this.position.y,
            other.position.x,
            other.position.y);
            
            if(other != this && d < this.perceptionRadius){
            let diff = p5.Vector.sub(this.position, other.position);
            diff.div(d);
            steering.add(diff);
            total++;
            }
        }
        if(total>0){
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }
    //adding all the forces
    navigate(flock,targetP){
        this.acceleration.set(0,0);
        let alignment = this.align(flock);
        let cohesion = this.cohesion(flock);
        let separation = this.separation(flock);
        let targeting = this.targetPoint(targetP);
        let targeting2 = this.targetPoint(createVector(width/2,height/2,0));


        separation.mult(separationMultiplier);
        cohesion.mult(cohesionMultiplier);
        alignment.mult(alignmentMultiplier);
        targeting.mult(targetMultiplier);
        targeting2.mult(targetMultiplier);

        
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
        this.acceleration.add(targeting);
        this.acceleration.add(targeting2);
    }

    updateLocation(){
        this.oldPosition = createVector(this.position.x,this.position.y,this.position.z);
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
    }
    render(){
        push();
        strokeWeight(this.pointSize);
        stroke(this.color);
        fill(this.color);
        translate(-width/2,-height/2);
        if(this.oldPosition != null){
            line(this.position.x,this.position.y,0,this.oldPosition.x,this.oldPosition.y,0);
        }
        else{
            point(this.position.x,this.position.y);
        }
        pop();
    }
}
class Flock{
    constructor(population){
        this.boids = [];
        for(let i = 0; i<population; i++){
            this.boids.push(new Boid());
        }
    }
    update(targetP){
        for(let boid of this.boids){
            // boid.wrapEdges();
            boid.navigate(this.boids,targetP);
            boid.updateLocation();
            boid.render();
        }
    }
}
