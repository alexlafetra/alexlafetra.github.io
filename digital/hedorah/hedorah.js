let img;
let stretch = 0;
let start,end;
let imgWidth;
let mainBuffer;
let grainBuffer;
let grainShader;

let xSlider,ySlider;
let resetButton;

function preload(){
  //img = loadImage("josie_lowres.jpeg");
  //img = loadImage("lili.jpg");
  //img = loadImage("me.jpg");
  img = loadImage("hedorah.png");
}

function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
}

function gltch(graphics){
  //loading pixels
  graphic.loadPixels();
  //storing pixels in px
  let px = graphic.pixels;
  let d = pixelDensity();
  //let stretch = frameCount/10;
  let imgWidth = img.width*d*img.height*d*16;
  for(let i = 0; i<imgWidth; i+=1){
    px[i] = px[i-10*stretch];
  }
  graphic.updatePixels();
}

function keyPressed(){
  switch(key){
    case '.':
      stretch++;
      break;
    case ',':
      stretch--;
      break;
    case 's':
      img.save('pic','png');
      break;
  }
  console.log(stretch);
}

function ThreeD(graphic){
  //loading pixels
  graphic.loadPixels();
  //storing pixels in px
  let px = graphic.pixels;
  let d = pixelDensity();
  stretch = 3;
  let imgWidth = img.width*d*img.height*d*16;
  for(let i = 0; i<imgWidth; i+=4){
    px[i] = px[i-10*stretch];
  }
  graphic.updatePixels();
}

function applyGrain() {
  grainBuffer.clear();
  grainBuffer.reset();
  grainBuffer.push();
  //grainBuffer.translate(-width/2,-height/2);
  grainBuffer.shader(grainShader);
  grainShader.setUniform('noiseSeed', 0); // to make the grain change each frame
  grainShader.setUniform('source', mainBuffer);
  grainShader.setUniform('noiseAmount', 0.1);
  grainBuffer.rectMode(CENTER);
  grainBuffer.noStroke();
  grainBuffer.rect(0, 0, width, height);
  grainBuffer.pop();
  
  clear();
  push();
  image(grainBuffer, -width/2, -height/2);
  pop();
}

function mangle(graphic,startX,startY,w,h){
  let xOffset = xSlider.value();
  let yOffset = ySlider.value();
  //loading pixels
  graphic.loadPixels();
  //storing pixels in px
  let px = graphic.pixels;
  let d = pixelDensity();
  //let stretch = frameCount/10;
  //for(let i = 0; i<imgWidth; i+3){
  //  px[i] = px[i+stretch];
  //}
  for(let Y = startY; Y<startY+h; Y+=yOffset){
    for(let y = 0; y<h; y+=1){
      for(let x = startX; x<(startX+w)*2*d; x+=xOffset){
        let i = (x)+(y+Y)*img.width*2*d;
        px[i] = px[i+stretch];
      }
    }
  }
  graphic.updatePixels();
}

class Glitch{
  constructor(startX,startY,w,h){
    this.startX = startX;
    this.startY = startY;
    this.w = w;
    this.h = h;
  }
  mangle(graphic){
    //loading pixels
    graphic.loadPixels();
    //storing pixels in px
    let px = graphic.pixels;
    let d = pixelDensity();
    
    //let xOffset = xSlider.value();
    //let yOffset = ySlider.value();
    
    let xOffset = 1;
    let yOffset = 1;
    //for(let y = this.startY; y<(this.startY+this.h)*2*d; y+=this.yOffset){
    //  for(let x = this.startX; x<(this.startX+this.w)*2*d; x+=this.xOffset){
    //    let i = (x)+(y)*graphic.width*2*d;
    //    px[i] = px[i+stretch];
    //  }
    //}
    for(let Y = this.startY; Y<this.startY+this.h; Y+=yOffset){
      for(let y = 0; y<this.h; y+=1){
        for(let x = this.startX; x<(this.startX+this.w)*2*d; x+=xOffset){
          let i = (x)+(y+Y)*graphic.width*2*d;
          px[i] = px[i+stretch];
        }
      }
    }
    graphic.updatePixels();
  }
}

let glitchList = [];
const numberOfGlitches = 1;

function setup() {
   mainBuffer = createCanvas(windowWidth,windowHeight,WEBGL);
   stretch = 1;
   let d = pixelDensity();
   imgWidth = img.width*d*img.height*d*16;
   
   //buffer for the shader overlay
   grainBuffer = createGraphics(width, height, WEBGL);
   grainShader = grainBuffer.createShader(grain_vert, grain_frag);
   
   xSlider =  createSlider(2,100,1,1);
   xSlider.position(0,0);
   ySlider =  createSlider(1,100,1,1);
   ySlider.position(0,17);
   resetButton = createButton("reset");
   resetButton.mousePressed(preload);
   resetButton.position(40,36);
   
   for(let i = 0; i<numberOfGlitches; i++){
     let xStart = random(0, img.width);
     let yStart = random(0, img.height);
     let w = random(0,img.width-xStart);
     let h = random(0,img.height-yStart);
     let newGlitch = new Glitch(xStart,yStart,w,h);
     glitchList.push(newGlitch);
   }
   //console.log(glitchList);

}

function draw() {
  //scale(1);
  background(255);
  let img2 = img;
  for(let glitch of glitchList){
    mangle(img2,glitch.startX,glitch.startY,glitch.w,glitch.h);
    //glitch.mangle(img2);
  }
  //glitchList[0].mangle(img2);
  //mangle(img2,0,0,random(0,img2.width),random(0,img2.height));
  //mangleArea(img2,random(0,img2.width),random(0,img2.height),random(100,img2.width),random(100,img2.height));
  image(img2,-img2.width/2,-img2.height/2);
  applyGrain();
}
