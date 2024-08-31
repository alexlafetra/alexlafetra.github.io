/*
Segment display using open and closed eyes
seven segs, but should be like 7x11 pics rects wide so there's padding
each segment is 3 pics long
*/

const dim = 60;
let canvas;
let onImages = [];
let offImages = [];

function getClockTime(){
    const d = new Date();

    return {
        hr:d.getHours(),
        min:d.getMinutes(),
        sec:d.getSeconds()
    };
}

const onImageLinks = [
    "images/on1.jpg",
    "images/on2.jpg",
    "images/on3.jpg",
    "images/on4.jpg"
]
const offImageLinks = [
    "images/off1.jpg",
    "images/off2.jpg",
    "images/off3.jpg",
    "images/off4.jpg",
    "images/off5.jpg"
]

function preload(){
    for(let url of onImageLinks){
        img = loadImage(url);
        onImages.push(img);
    }
    for(let url of offImageLinks){
        img = loadImage(url);
        offImages.push(img);
    }
}

function setup(){
    canvas = createCanvas(dim*30,dim*9,WEBGL);
}

function draw(){
    background(0);
    // drawNumber(floor(frameCount/10)%10);
    drawTime();
}

function drawTime(){
    let time = getClockTime();
    let x = 0;
    //hours
    for(let i = 0; i<2; i++){
        drawNumber(x,floor(time.hr/10));
        drawNumber(x+1,time.hr%10);
    }
    //minutes
    x+=2;
    for(let i = 0; i<2; i++){
        drawNumber(x,floor(time.min/10));
        drawNumber(x+1,time.min%10);
    }
    //seconds
    x+=2;
    for(let i = 0; i<2; i++){
        drawNumber(x,floor(time.sec/10));
        drawNumber(x+1,time.sec%10);
    }
}


function drawNumber(xStart,number){
    randomSeed(number);
    const segmentData = getSegmentsFromNumber(number);
    for(let i = 0; i<segmentData.length; i++){
        //horizontal pos
        const x = -width/2 + ((i%5) * dim) + (xStart * dim*5);
        const y = -height/2 + floor(i/5) * dim;
        image(random(segmentData[i]?onImages:offImages),x,y,dim,dim);

        // fill(segmentData[i]?0:255);
        // rect(x,y,dim,dim);
    }
}

function getSegmentsFromNumber(number){
    switch(number){
        case 0:
            return [
                0,1,1,1,0,
                1,0,0,0,1,
                1,0,0,0,1,
                1,0,0,0,1,
                0,0,0,0,0,
                1,0,0,0,1,
                1,0,0,0,1,
                1,0,0,0,1,
                0,1,1,1,0
            ];
        case 1:
            return [
                0,0,0,0,0,
                1,0,0,0,0,
                1,0,0,0,0,
                1,0,0,0,0,
                0,0,0,0,0,
                1,0,0,0,0,
                1,0,0,0,0,
                1,0,0,0,0,
                0,0,0,0,0
            ];
        case 2:
            return [
                0,1,1,1,0,
                0,0,0,0,1,
                0,0,0,0,1,
                0,0,0,0,1,
                0,1,1,1,0,
                1,0,0,0,0,
                1,0,0,0,0,
                1,0,0,0,0,
                0,1,1,1,0
            ];
        case 3:
            return [
                0,1,1,1,0,
                0,0,0,0,1,
                0,0,0,0,1,
                0,0,0,0,1,
                0,1,1,1,0,
                0,0,0,0,1,
                0,0,0,0,1,
                0,0,0,0,1,
                0,1,1,1,0
            ];
        case 4:
            return [
                0,0,0,0,0,
                1,0,0,0,1,
                1,0,0,0,1,
                1,0,0,0,1,
                0,1,1,1,0,
                0,0,0,0,1,
                0,0,0,0,1,
                0,0,0,0,1,
                0,0,0,0,0,
            ];
        case 5:
            return [
                0,1,1,1,0,
                1,0,0,0,0,
                1,0,0,0,0,
                1,0,0,0,0,
                0,1,1,1,0,
                0,0,0,0,1,
                0,0,0,0,1,
                0,0,0,0,1,
                0,1,1,1,0
            ];
        case 6:
            return [
                0,1,1,1,0,
                1,0,0,0,0,
                1,0,0,0,0,
                1,0,0,0,0,
                0,1,1,1,0,
                1,0,0,0,1,
                1,0,0,0,1,
                1,0,0,0,1,
                0,1,1,1,0
            ];
        case 7:
            return [
                0,1,1,1,0,
                0,0,0,0,1,
                0,0,0,0,1,
                0,0,0,0,1,
                0,0,0,0,0,
                0,0,0,0,1,
                0,0,0,0,1,
                0,0,0,0,1,
                0,0,0,0,0,
            ];
        case 8:
            return [
                0,1,1,1,0,
                1,0,0,0,1,
                1,0,0,0,1,
                1,0,0,0,1,
                0,1,1,1,0,
                1,0,0,0,1,
                1,0,0,0,1,
                1,0,0,0,1,
                0,1,1,1,0
            ];
        case 9:
            return [
                0,1,1,1,0,
                1,0,0,0,1,
                1,0,0,0,1,
                1,0,0,0,1,
                0,1,1,1,0,
                0,0,0,0,1,
                0,0,0,0,1,
                0,0,0,0,1,
                0,1,1,1,0
            ];
    }
}
