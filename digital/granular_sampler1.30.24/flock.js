class Bird{
    constructor(motherFlock){
        this.motherFlock = motherFlock;
        this.velocity = createVector(random(-1,1),random(-1,1),random(-1,1));
        this.velocity.setMag(this.motherFlock.settings.maxVelocity);
        this.position = createVector(random(-width/2,width/2),random(-height/2,height/2),random(-depth/2,depth/2));
        this.acceleration = createVector(0,0,0);
        this.color = color(random(100,255),random(100,255),random(100,255));
    }
    floorForce(){
        let distanceToFloor = this.position.y - this.motherFlock.settings.floorHeight;
        if(distanceToFloor >= 0){
            let floorF = p5.Vector.sub(createVector(this.position.x,this.motherFlock.settings.floorHeight,this.position.z),this.position);
            floorF.mult(distanceToFloor);
            floorF.limit(this.motherFlock.settings.maxVelocity);
            return floorF;
        }
        else
            return createVector(0,0,0);
    }
    randomForce(mag){
        return createVector(random(-1,1),random(-1,1),random(-1,1)).setMag(mag);
    }
    orbitForce(){
        let orbit = p5.Vector.sub(this.position,createVector(mouseX-width/2,mouseY-height/2,-200));
        orbit.setMag(1-orbit.mag()/this.motherFlock.settings.orbitRadius);
        orbit.limit(this.motherFlock.settings.maxAcceleration);
        return orbit;
    }
    updatePhysics(settings){
        let averageOrientation = createVector(0,0,0);
        let averageLocation = createVector(0,0,0);
        let avoidanceForce = createVector(0,0,0);

        let totalContributingBirds = 0;
        let totalDistance = 0;

        let boundingSphere = new BoundingSphere(this.position.x,this.position.y,this.position.z,settings.viewDistance);
        let neighbors = [];
        this.motherFlock.octree.query(boundingSphere,neighbors);
        // console.log(neighbors);
        for(let b of neighbors){
            //don't compare to urself!
            if(b != this){
                let distance = p5.Vector.dist(this.position,b.position);
                if(distance < settings.viewDistance){
                    //should this only count up the birds that can see eachother?
                    totalDistance += distance;
                    averageLocation.add(b.position);
                    averageOrientation.add(b.velocity);
                    //should this be divided by d^2?
                    avoidanceForce.add(p5.Vector.sub(this.position,b.position).div(distance));
                    totalContributingBirds++;
                }
            }
        }

        this.motherFlock.stats.averageDifferenceInBirdPositions += totalDistance;
        if(totalContributingBirds){
            this.motherFlock.stats.averageGroupSize += totalContributingBirds;
            this.motherFlock.stats.numberOfGroups++;
        }


        if(totalContributingBirds){
            averageOrientation.div(totalContributingBirds);
            averageLocation.div(totalContributingBirds);
            avoidanceForce.div(totalContributingBirds);
            
            /*
            maybe take this (avgOrientation.setMag) out? the magnitude of this vec
            could be used to represent how aligned/misaligned the birds are
            */
            averageOrientation.setMag(settings.maxVelocity);
            averageOrientation.sub(this.velocity);
            averageOrientation.limit(settings.maxAcceleration);

            averageLocation.sub(this.position);
            averageLocation.setMag(settings.maxVelocity);
            averageLocation.limit(settings.maxAcceleration);

            avoidanceForce.setMag(settings.maxVelocity);
            avoidanceForce.sub(this.velocity);
            avoidanceForce.limit(settings.maxAcceleration);
        }
        this.acceleration = createVector(0,0,0);
        this.acceleration.add(averageOrientation.mult(settings.alignmentStrength));
        this.acceleration.add(averageLocation.mult(settings.cohesionStrength));
        this.acceleration.add(avoidanceForce.mult(settings.avoidanceStrength));
        this.acceleration.add(this.floorForce());
        this.acceleration.add(this.randomForce(this.motherFlock.settings.randomAmount));
        this.acceleration.add(this.orbitForce().mult(settings.orbitStrength))

    }
    update(){
        this.velocity.add(this.acceleration);
        this.velocity.mult(0.99);
        this.position.add(this.velocity);
    }
    render(c){
        noStroke();
        fill(c?c:this.color);
        push();
        translate(this.position.x,this.position.y,this.position.z);
        ellipse(0,0,10,10);
        pop();
    }
    renderPolygon(){
        noStroke();
        fill(this.color);
        const boidSize = 10;

        push();
        translate(this.position.x,this.position.y,this.position.z);
        beginShape(TRIANGLES);
        vertex(-boidSize/2,0,0);
        vertex(boidSize/2,0,0);
        vertex(this.velocity.x*4,this.velocity.y*4,this.velocity.z*4);
        vertex(0,0,boidSize*3);
        vertex(-boidSize/2,0,0);
        endShape();
        pop();
    }
}
class Flock{
    constructor(){
        //holds settings for the sim
        this.settings = {
            birdCount : 1000,
            randomAmount : 0.6,
            viewDistance : 80,
            cohesionStrength : 1.1,
            alignmentStrength : 1.2,
            avoidanceStrength : 1.5,
            orbitStrength : 0.7,
            orbitRadius : 300,
            maxAcceleration : 0.5,
            maxVelocity : 10,
            floorHeight : 800,
            octreeCapacity : 10
        };
        this.stats = {
            averageDifferenceInBirdPositions : 0,
            averageGroupSize: 0,
            numberOfGroups  : 0
        };
        this.birds = [];
        for(let i = 0; i<this.settings.birdCount; i++){
            this.birds.push(new Bird(this));
        }
        this.backgroundColor = color(10,30,10);
        let bB = new BoundingBox(0,0,0,height,width,depth);
        this.octree = new Octree(bB,this.settings.octreeCapacity);
        console.log(this.octree);
    }
    updateBirds(){
        for(let b of this.birds){
            this.stats = {
                averageDifferenceInBirdPositions : 0,
                averageGroupSize: 0,
                numberOfGroups  : 0
            };
            b.updatePhysics(this.settings);
            this.stats.averageDifferenceInBirdPositions/=this.birds.length;
            this.stats.averageGroupSize/=this.birds.length;
            b.update();
        }
    }
    explode(){
        for(let b of this.birds){
            this.stats.averageDifferenceInBirdPositions = 0;
            b.updatePhysics(this.settings);
            let force = p5.Vector.sub(b.position,createVector(mouseX-width/2,mouseY-height/2,-200));
            force.mult(0.03);
            b.acceleration.add(force);
            b.update();
            this.stats.averageDifferenceInBirdPositions/=this.birds.length;
        }
    }
    gatherStatistics(){
        let averagePosition = createVector(0,0,0);
        let averageVelocity = createVector(0,0,0);
        for(let b of this.birds){
            averagePosition.add(b.position);
            averageVelocity.add(b.velocity);
        }
        averagePosition.div(this.birds.length);
        averageVelocity.div(this.birds.length);

        //calculating variance
        let velocityVariance = createVector(0,0,0);
        for(let b of this.birds){
            velocityVariance.x += sq(b.velocity.x - averageVelocity.x);
            velocityVariance.y += sq(b.velocity.y - averageVelocity.y);
            velocityVariance.z += sq(b.velocity.z - averageVelocity.z);
        }
        velocityVariance.div(this.birds.length);

        return {
            averagePosition : averagePosition,
            averageVelocity : averageVelocity,
            velocityVariance: velocityVariance,
            averageDifferenceInBirdPositions : this.stats.averageDifferenceInBirdPositions,
            birdPopulation  : this.birds.length,
            averageFlockSize: this.stats.averageGroupSize,
            numberOfFlocks  : this.stats.numberOfGroups
        };
    }
    update(){
        //empty and then recreate octree
        this.octree.clear();
        for(let b of this.birds){
            this.octree.insert(b);
        }
        this.updateBirds();
    }
    render(){
        for(let b of this.birds){
            // b.renderPolygon();
            b.render();
        }
        // this.renderOrbitPoint();
        this.octree.render();
    }
    renderOrbitPoint(){
        noStroke();
        fill(255,255,0);
        push();
        translate(mouseX-width/2,mouseY-height/2,-depth/2);
        ellipse(0,0,this.settings.orbitRadius,this.settings.orbitRadius);
        pop();
    }
}