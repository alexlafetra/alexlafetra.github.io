/*
Implementing the spacetime camera from: https://www.instructables.com/How-to-Stretch-Images-Through-Time-With-Space-time/
but with a few extra features.

Video demo of the original:
https://www.youtube.com/watch?v=RR1_ZG6Ik-E

I want to add:
different scan line patterns/directions
- circular/radial (scanning with an increasing radius)
- random/jumping around
- horizontal and vertical

I do think you could do this using shaders (and it would be a little faster), but since I think implementing the different
scanline patterns will be kind of tricky i'm going to build it here using the cpu
*/

class Scanline{
    constructor(){
        this.theta = 0;
        this.r = 0;
        this.x = 0;
        this.y = 0;
    }
    updatePosition(type){
        switch(type){
            //vertical
            case 0:
                let scale = canv.width/video.width;
                this.x = mouseX;
                break;
            case 1:
                this.y = mouseY;
                break;
        }
    }
    render(image,type){
        image.begin();
        stroke(255,0,0);
        switch(type){
            //vertical
            case 0:
                line(this.x-image.width/2,-image.height/2,this.x-image.width/2,image.height);
                break;
            case 1:
                line(-image.width/2,this.y-image.height/2,image.width,this.y-image.height/2);
                break;
        }
        image.end();
    }
    getPixels(imageBuffer,type){
        let pix = [];
        imageBuffer.loadPixels();
        switch(type){
            //vertical
            case 0:
                //get a full column
                pix = imageBuffer.get(this.x,0,1,imageBuffer.height);
                break;
            //horizontal
            case 1:
                //get a full row
                pix = imageBuffer.get(0,this.y,imageBuffer.width,1);
                break;
            //radial
            case 2:
                break;
            //angular (like sonar)
            case 3:
                break;

        }
        return pix;
    }
}

let scanner;
let video;
let videoBuffer;
let outputBuffer;
let canv;
let outputX = 0;

let scanType = 0;

function mouseReleased(){
    if(scanType == 0)
        scanType = 1;
    else if(scanType == 1){
        scanType = 0;
    }
}

function setup(){
    // canv = createCanvas(video.width*2,video.height*4,WEBGL);
    canv = createCanvas(800,800,WEBGL);
    scanner = new Scanline();
    // video = createVideo('data/testVid.mov');
    video = createCapture(VIDEO);
    video.hide();
    videoBuffer = createFramebuffer({width:width,height:height});
    outputBuffer = createFramebuffer({width:width,height:height});
}

function keyPressed(){
    switch(key){
        case '0':
            scanType = 0;
            break;
        case '1':
            scanType = 1;
            break;
    }
}
function mousePressed(){
    video.play();
}

function draw(){
    scanner.updatePosition(scanType);
    //each frame you should draw the frame of the video to the frameBuffer
    //Get the pixels from the scanline
    //then draw those output pixels to the canvas
    videoBuffer.begin();
    image(video,-videoBuffer.width/2,-videoBuffer.height/2,videoBuffer.width,videoBuffer.height);
    videoBuffer.end();

    background(0);

    //gets an image slice
    let pix = scanner.getPixels(videoBuffer,scanType);
    //drawing the slice to the canvas
    outputBuffer.begin();
    switch(scanType){
        case 0:
            image(pix,-width/2+outputX,-height/2,1,height);
            break;
        case 1:
            image(pix,-width/2,-height/2+outputX,width,1);
            break;
    }
    outputBuffer.end();

    //draw scanline to video buffer
    scanner.render(videoBuffer,scanType);

    image(outputBuffer,-width/2,-height/2,width,height/2);
    image(videoBuffer,-width/2,0,width,height/2);
    outputX++;
    if(outputX>width)
        outputX = 0;
}