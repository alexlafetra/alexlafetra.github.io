let lines = [];
let letters;
let font;
let cursorPos = {x:0,y:0};
let string;

function preload(){
    font = loadFont("Ojuju.ttf");
}

function setup(){
    createCanvas(600,600);
    background(0);
    textSize(100);
    string = "";
    cursorPos.y += textAscent("h");
    // letters = textToMesh(string,cursorPos.x,cursorPos.y);
}

function keyPressed(){
    string+=key;
    // cursorPos.x += textWidth(key);
    letters = textToMesh(string,cursorPos.x,cursorPos.y);
}

function textToMesh(string, x, y){
    let arr = [];
    for(let char of string){
        let letter = {points:font.textToPoints(char,x,y,100,{sampleFactor:0.2,simplifyThreshold:0}),centerPoint:createVector()};
        for(let p of letter.points){
            letter.centerPoint.x += p.x;
            letter.centerPoint.y += p.y;
        }
        letter.centerPoint.div(letter.points.length);
        arr.push(letter);
        x += textWidth(char);
    }
    return arr;
}
function draw(){
    background(0);
    stroke(255);
    if(letters){
        for(let letter of letters){
            beginShape(LINES);
            for(let p of letter.points){
                // curveVertex(p.x+frameCount/2*noise(p.x),p.y+frameCount/2*noise(p.y));
                let v = createVector(p.x+5*noise(p.x),p.y+5*noise(p.y));
                // curveVertex(v.x,v.y);
                vertex(v.x,v.y);
            }
            endShape();
        }
    }
}