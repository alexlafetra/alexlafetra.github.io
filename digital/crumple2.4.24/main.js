/*
i want to be able to crumple
anything up

what happens to the parts of myself that i neglect and throw away?
*/

function makePointBetween_old(p1,p2){
    let a = createVector(p1.x,p1.y,p1.z);
    let b = createVector(p2.x,p2.y,p2.z);

    //how far along the points will you be
    let d = random(p5.Vector.dist(a,b));

    //system of parametric equations
    let c = p5.Vector.sub(a,b);

    //find bounds of t
    let t = random(1);
    let x = p1.x+c.x*t;
    let y = p1.y+c.y*t;
    let z = p1.z+c.z*t;
    let p = new Point(x,y,z);
    console.log(c);
    console.log(p);
    return p;
}
function makePointBetween(p1,p2){
    let a = createVector(p1.x,p1.y,p1.z);
    let b = createVector(p2.x,p2.y,p2.z);

    //system of parametric equations
    //subtract a from b
    let c = p5.Vector.sub(b,a);

    //t should be between 0 and 1
    let t = random(0,2);
    let x = p1.x+c.x*t;
    let y = p1.y+c.y*t;
    let z = p1.z+c.z*t;
    let p = new Point(x,y,z);
    return p;
}

class Point{
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
class Polygon{
    constructor(points,c){
        this.points = points;
        this.color = c;
    }
}
class Sheet{
    constructor(size){
        this.size = size;
        this.vertices = [new Point(0,0,0),new Point(size,0,0),new Point(size,size,0),new Point(0,size,0)];
        this.polygons = [new Polygon([0,1,2,3,0],randomColor())];
    }
    crumple(){
        let numberOfVertices = this.vertices.length;

        //choose a polygon to subdivide
        let targetPolygonIndex = floor(random(this.polygons.length));
        let targetPolygon = this.polygons[targetPolygonIndex];

        //choose which line you want to divide
        let indexOfNewVertice1 = floor(random(targetPolygon.points.length-1));
        let indexOfNewVertice2 = floor(random(targetPolygon.points.length-1));
        while(indexOfNewVertice1 == indexOfNewVertice2){
            indexOfNewVertice2 = floor(random(targetPolygon.points.length-1));
        }

        let pointsA = [];
        //iterate over p's from start --> first new vert
        for(let i = 0; i<indexOfNewVertice1;i++){
            pointsA.push(targetPolygon.points[i]);
        }
        //add the two new vertices forming the new edge
        pointsA.push(numberOfVertices);
        pointsA.push(numberOfVertices+1);
        //add the end of the old shape
        pointsA.concat(targetPolygon.points.slice(-indexOfNewVertice2));
        pointsA.push(targetPolygon.points[0]);

        //iterate over p's from newVert1 --> newVert2
        let pointsB = [numberOfVertices+1];
        for(let i = indexOfNewVertice1; i<indexOfNewVertice2;i++){
            pointsB.push(targetPolygon.points[i]);
        }
        //close up the shape
        pointsB.push(numberOfVertices);
        pointsB.push(numberOfVertices+1);

        //delete old polygon
        this.polygons.splice(targetPolygonIndex,1);

        //add two new ones
        this.polygons.push(new Polygon(pointsA,randomColor()));
        this.polygons.push(new Polygon(pointsB,randomColor()));

        // console.log(targetPolygon.points[indexOfNewVertice1]);
        // console.log(targetPolygon.points[indexOfNewVertice2]);

        //add the two new points
        this.vertices.push(makePointBetween(this.vertices[targetPolygon.points[indexOfNewVertice1]],this.vertices[targetPolygon.points[indexOfNewVertice1+1]]));
        this.vertices.push(makePointBetween(this.vertices[targetPolygon.points[indexOfNewVertice2]],this.vertices[targetPolygon.points[indexOfNewVertice2+1]]));

        const edgeOffset = random(-10,10);
        this.vertices[this.vertices.length-1].z+=edgeOffset;
        this.vertices[this.vertices.length-1].z+=edgeOffset;

        // console.log(this);
    }
    render(){
        beginShape(TRIANGLE_STRIP);
        for(let shape of this.polygons){
            fill(shape.color);
            for(let p of shape.points){
                vertex(this.vertices[p].x,this.vertices[p].y,this.vertices[p].z);
            }
        }
        endShape();
    }
    getLargestDimension(){
        let largest = 0;
        for(let p of this.vertices){
            if(p.x>largest){
                largest = p.x;
            }
            if(p.y>largest){
                largest = p.y;
            }
            if(p.z>largest){
                largest = p.z;
            }

        }
        return largest;
    }
}

function randomColor(){
    return color(random(100,255),random(100,255),random(100,255));
}

let mainCanvas;
let sheet;

function setup(){
    mainCanvas = createCanvas(800,800,WEBGL);
    sheet = new Sheet(200);

}

function mouseReleased(){
    sheet.crumple();
}
function draw(){
    scale(width/(2*sheet.getLargestDimension()));
    rotateY(frameCount/80);
    rotateX(frameCount/80);
    background(0);
    fill(255);
    translate(-sheet.size/2,-sheet.size/2);
    sheet.render();
}