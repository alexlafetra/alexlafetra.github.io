/*

pass pixel array into shader, draw pixels in shader?
just so it's quicker

*/

let mainCanvas;
let gl;
let warp;
let img;
let srcImage;
let textString = "";
let font;

//gimbal controls!
let noiseWindow = {
  dragStarted : false,
  start : {x:0,y:0},
  end : {x:0,y:0},
  sensitivity : 1,
  offset : {x:0,y:0},
  origin: {x:0,y:0}
};

//gimbal controls!
let viewWindow = {
  dragStarted : false,
  start : {x:0,y:0},
  end : {x:0,y:0},
  sensitivity : 1,
  offset : {x:0,y:0},
  origin: {x:0,y:0}
};

function mouseDragged(){
  if(mouseX < mainCanvas.width && mouseY < mainCanvas.height && mouseX > 0 && mouseY > 0){
    if(keyIsDown(SHIFT)){
      if(!viewWindow.dragStarted){
        viewWindow.dragStarted = true;
        viewWindow.start = {x:mouseX,y:mouseY};
      }
      else{
        viewWindow.end = {x:mouseX,y:mouseY};
        const dX = viewWindow.end.x - viewWindow.start.x;
        const dY = viewWindow.end.y - viewWindow.start.y;
        viewWindow.offset.x = dX + viewWindow.origin.x;
        viewWindow.offset.y = dY+ viewWindow.origin.y;
      }
    }
    else{
      if(!noiseWindow.dragStarted){
        noiseWindow.dragStarted = true;
        noiseWindow.start = {x:mouseX,y:mouseY};
      }
      else{
        noiseWindow.end = {x:mouseX,y:mouseY};
        const dX = noiseWindow.end.x - noiseWindow.start.x;
        const dY = noiseWindow.end.y - noiseWindow.start.y;
        noiseWindow.offset.x = dX + noiseWindow.origin.x;
        noiseWindow.offset.y = dY+ noiseWindow.origin.y;
      }
    }
  }
}
function mouseReleased(){
  if(keyIsDown(SHIFT)){
    if(viewWindow.dragStarted){
      viewWindow.end = {x:mouseX,y:mouseY}
      const dX = viewWindow.end.x - viewWindow.start.x;
      const dY = viewWindow.end.y - viewWindow.start.y;
      viewWindow.origin.x += dX;
      viewWindow.origin.y += dY;
    }
    viewWindow.dragStarted = false;
  }
  else{
    if(noiseWindow.dragStarted){
      noiseWindow.end = {x:mouseX,y:mouseY}
      const dX = noiseWindow.end.x - noiseWindow.start.x;
      const dY = noiseWindow.end.y - noiseWindow.start.y;
      noiseWindow.origin.x += dX;
      noiseWindow.origin.y += dY;
    }
    noiseWindow.dragStarted = false;
  }
}

function keyPressed(){
  if(key == 'Backspace'){
    textString = textString.slice(0,-1);
  }
  else if(key == 'Enter'){
    textString += '\n';
  }
  else if(key == 'Shift'){

  }
  else{
    textString += String(key);
  }
  console.log(textString);
  // setTextImage();
  warp.loadText(textString);
}

function setTextImage(){
  textFont(font);
  // fill(255,0,0);
  fill(255);
  textSize(200);
  textAlign(CENTER);

  const bounds = font.textBounds(textString);
  textCanvas = createFramebuffer({ width: bounds.w*2, height: bounds.h*2, textureFiltering: NEAREST, format: FLOAT});
  textCanvas.begin();
  clear();
  text(textString,0,0);
  textCanvas.end();
  srcImage.begin();
  clear();
  // background(0);
  image(textCanvas,-textCanvas.width/2,-textCanvas.height/2,textCanvas.width,textCanvas.height);
  srcImage.end();
}

function preload(){
  img = loadImage("test2.jpg");
  font = loadFont("times.ttf");
}

function windowResized(){
  // resizeCanvas(windowWidth,windowHeight);
  // warp = new FlowCanvas(512,512 * windowHeight/windowWidth,srcImage,mainCanvas,noiseWindow,viewWindow);
}
function setup(){
  mainCanvas = createCanvas(400,400,WEBGL);
  // mainCanvas = createCanvas(windowWidth,windowHeight,WEBGL);
  srcImage = createFramebuffer({ width: img.width, height: img.height, textureFiltering: NEAREST, format: FLOAT});
  srcImage.begin();
  image(img,-img.width/2,-img.height/2,img.width,img.height);
  srcImage.end();
  warp = new FlowCanvas(512,512 * windowHeight/windowWidth,srcImage,mainCanvas,noiseWindow,viewWindow);
}

function draw(){
  // background(255,255,255);
  warp.render();
  // image(warp.targetImage,-width/2,-height/2,width,height);
}
