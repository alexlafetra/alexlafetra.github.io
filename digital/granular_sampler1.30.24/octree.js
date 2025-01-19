/*
    Folllowing along w/ Patt Vira's tutorial: 
    https://www.youtube.com/watch?v=7pxyIC_ZEwA&t=3017s
*/

//re-used routine, followed from:
//https://stackoverflow.com/questions/4578967/cube-sphere-intersection-test
function boxIntersectsSphere(boundingBox,boundingSphere){
    let rSquared = boundingSphere.radius*boundingSphere.radius;
    let dmin = 0;

    if(boundingSphere.x < (boundingBox.x - boundingBox.width/2))
        dmin += sq(boundingSphere.x-(boundingBox.x-boundingBox.width/2));
    else if(boundingSphere.x > (boundingBox.x+boundingBox.width/2))
        dmin += sq(boundingSphere.x - (boundingBox.x+boundingBox.width/2));

    if(boundingSphere.y < (boundingBox.y - boundingBox.height/2))
        dmin += sq(boundingSphere.y-(boundingBox.y-boundingBox.height/2));
    else if(boundingSphere.y > (boundingBox.y+boundingBox.height/2))
        dmin += sq(boundingSphere.y - (boundingBox.y+boundingBox.height/2));

    if(boundingSphere.z < (boundingBox.z - boundingBox.depth/2))
        dmin += sq(boundingSphere.z-(boundingBox.z-boundingBox.depth/2));
    else if(boundingSphere.z > (boundingBox.z+boundingBox.depth/2))
        dmin += sq(boundingSphere.z - (boundingBox.z+boundingBox.depth/2));

    return dmin <= rSquared;
}

class BoundingBox{
    constructor(x,y,z,w,h,d){
        //center coords of the box
        this.x = x;
        this.y = y;
        this.z = z;
        //dimensions
        this.width = w;
        this.height = h;
        this.depth = d;
    }
    render(c){
        const coords = [
            //top back L
            {x: -this.width/2, y: -this.height/2, z: -this.depth/2},
            //top back R
            {x: +this.width/2, y: -this.height/2, z: -this.depth/2},
            //bottom back R
            {x: +this.width/2, y: +this.height/2, z: -this.depth/2},
            //bottom back L
            {x: -this.width/2, y: +this.height/2, z: -this.depth/2},
            //top front L
            {x: -this.width/2, y: -this.height/2, z: +this.depth/2},
            //top front R
            {x: +this.width/2, y: -this.height/2, z: +this.depth/2},
            //bottom front R
            {x: +this.width/2, y: +this.height/2, z: +this.depth/2},
            //bottom front L
            {x: -this.width/2, y: +this.height/2, z: +this.depth/2}
        ];
        strokeWeight(2);
        stroke(c);
        noFill();
        push();
        translate(this.x,this.y,this.z);
        beginShape(LINES);
        //faces
        vertex(coords[0].x,coords[0].y,coords[0].z);
        vertex(coords[1].x,coords[1].y,coords[1].z);
        vertex(coords[1].x,coords[1].y,coords[1].z);
        vertex(coords[2].x,coords[2].y,coords[2].z);
        vertex(coords[2].x,coords[2].y,coords[2].z);
        vertex(coords[3].x,coords[3].y,coords[3].z);
        vertex(coords[0].x,coords[0].y,coords[0].z);
        vertex(coords[3].x,coords[3].y,coords[3].z);
        vertex(coords[4].x,coords[4].y,coords[4].z);
        vertex(coords[5].x,coords[5].y,coords[5].z);
        vertex(coords[5].x,coords[5].y,coords[5].z);
        vertex(coords[6].x,coords[6].y,coords[6].z);
        vertex(coords[6].x,coords[6].y,coords[6].z);
        vertex(coords[7].x,coords[7].y,coords[7].z);
        vertex(coords[4].x,coords[4].y,coords[4].z);
        vertex(coords[7].x,coords[7].y,coords[7].z);

        //edges
        vertex(coords[0].x,coords[0].y,coords[0].z);
        vertex(coords[4].x,coords[4].y,coords[4].z);
        vertex(coords[1].x,coords[1].y,coords[1].z);
        vertex(coords[5].x,coords[5].y,coords[5].z);
        vertex(coords[2].x,coords[2].y,coords[2].z);
        vertex(coords[6].x,coords[6].y,coords[6].z);
        vertex(coords[3].x,coords[3].y,coords[3].z);
        vertex(coords[7].x,coords[7].y,coords[7].z);
        endShape();
        pop();
    }
    contains(point){
        return ((point.x >= this.x - this.width/2) &&
                (point.x < this.x + this.width/2) &&
                (point.y >= this.y - this.height/2) &&
                (point.y < this.y + this.height/2) &&
                (point.z >= this.z - this.depth/2) &&
                (point.z < this.z + this.depth/2));
    }
    intersects(boundary){
        return ((boundary.x+boundary.width/2 > this.x-this.width/2) &&
                (boundary.x-boundary.width/2 < this.x+this.width/2) &&
                (boundary.y+boundary.height/2 > this.y-this.height/2) &&
                (boundary.y-boundary.height/2 < this.y+this.height/2) &&
                (boundary.z+boundary.depth/2 > this.z-this.depth/2) &&
                (boundary.z-boundary.depth/2 < this.z+this.depth/2));
    }
}
class BoundingSphere{
    constructor(x,y,z,r){
        this.x = x;
        this.y = y;
        this.z = z;
        this.radius = r;
    }
    contains(point){
        return (dist(this.x,this.y,this.z,point.x,point.y,point.z)<this.radius/2);
    }
    intersects(boundary){
        return boxIntersectsSphere(boundary,this);
    }
    render(c){
        noFill();
        stroke(c);
        strokeWeight(2);
        push();
        translate(this.x,this.y,this.z);
        ellipse(0,0,this.radius,this.radius);
        pop();
    }
}

class Octree{
    constructor(boundary,capacity){
        this.boundary = boundary;
        this.capacity = capacity;
        //this can be filled w/ birds! anything with a position vector member
        this.points = [];
        this.childBranches = [];
        this.color = color(random(0,255),random(0,255),random(0,255));
    }
    clear(){
        this.points = [];
        this.childBranches = [];
    }
    insert(point){
        //if it's subdivided, insert into its babies
        if(this.childBranches.length){
            for(let ot of this.childBranches){
                if(ot.insert(point)){
                    return true;
                }
            }
            return false;
        }
        //if it hasn't been subdivided yet
        else{
            //check if the point is outside the boundary
            if(!this.boundary.contains(point.position)){
                return false;
            }
            //if the point can fit, add it
            if(this.points.length<this.capacity){
                this.points.push(point);
                return true;
            }
            //if not, then subdivide!
            else{
                this.subdivide();
                this.insert(point);
                return true;
            }
        }
    }
    subdivide(){
        //split into 8 new OT boxes
        let LTB = new Octree(new BoundingBox(this.boundary.x-this.boundary.width/4,this.boundary.y-this.boundary.height/4,this.boundary.z-this.boundary.depth/4,
                                                this.boundary.width/2,this.boundary.height/2,this.boundary.depth/2),this.capacity);
        let RTB = new Octree(new BoundingBox(this.boundary.x+this.boundary.width/4,this.boundary.y-this.boundary.height/4,this.boundary.z-this.boundary.depth/4,
                                                this.boundary.width/2,this.boundary.height/2,this.boundary.depth/2),this.capacity);
        let LBB = new Octree(new BoundingBox(this.boundary.x-this.boundary.width/4,this.boundary.y+this.boundary.height/4,this.boundary.z-this.boundary.depth/4,
                                                    this.boundary.width/2,this.boundary.height/2,this.boundary.depth/2),this.capacity);
        let RBB = new Octree(new BoundingBox(this.boundary.x+this.boundary.width/4,this.boundary.y+this.boundary.height/4,this.boundary.z-this.boundary.depth/4,
                                                     this.boundary.width/2,this.boundary.height/2,this.boundary.depth/2),this.capacity);
        let LTF = new Octree(new BoundingBox(this.boundary.x-this.boundary.width/4,this.boundary.y-this.boundary.height/4,this.boundary.z+this.boundary.depth/4,
                                                        this.boundary.width/2,this.boundary.height/2,this.boundary.depth/2),this.capacity);
        let RTF = new Octree(new BoundingBox(this.boundary.x+this.boundary.width/4,this.boundary.y-this.boundary.height/4,this.boundary.z+this.boundary.depth/4,
                                                        this.boundary.width/2,this.boundary.height/2,this.boundary.depth/2),this.capacity);
        let LBF = new Octree(new BoundingBox(this.boundary.x-this.boundary.width/4,this.boundary.y+this.boundary.height/4,this.boundary.z+this.boundary.depth/4,
                                                             this.boundary.width/2,this.boundary.height/2,this.boundary.depth/2),this.capacity);
        let RBF = new Octree(new BoundingBox(this.boundary.x+this.boundary.width/4,this.boundary.y+this.boundary.height/4,this.boundary.z+this.boundary.depth/4,
                                                              this.boundary.width/2,this.boundary.height/2,this.boundary.depth/2),this.capacity);
        
        //Adding new OT's to the list
        this.childBranches.push(LTB);
        this.childBranches.push(RTB);
        this.childBranches.push(LBB);
        this.childBranches.push(RBB);

        this.childBranches.push(LTF);
        this.childBranches.push(RTF);
        this.childBranches.push(LBF);
        this.childBranches.push(RBF);

        //add in points to the new child octrees
        for(let p of this.points){
            for(let ot of this.childBranches){
                if(ot.insert(p)){
                    break;
                }
            }
        }
        //clear out old points!
        this.points = [];
    }
    query(range,found){
        //if there's no intersection, return (we know it doesn't have any of those points)
        if(!range.intersects(this.boundary)){
            return false;
        }
        if(this.childBranches.length){
            for(let ot of this.childBranches){
                ot.query(range,found);
            }
            return found;
        }
        for(let p of this.points){
            //check if the range contains any of the points
            if(range.contains(p.position)){
                found.push(p);
            }
        }
        return found;
    }
    render(){
        if(this.childBranches.length){
            for(let ot of this.childBranches){
                ot.render();
            }
            return;
        }
        //Rainbow
        // colorMode(HSL,100);
        // let c = color(map(this.points.length,0,this.capacity,0,100),100,50);
        // this.boundary.render(c);
        // colorMode(RGB);
        if(this.points.length >= this.capacity/2){
            let c = color(0,255,255,map(this.points.length,0,this.capacity,0,255));
            this.boundary.render(c);
        }
    }
}