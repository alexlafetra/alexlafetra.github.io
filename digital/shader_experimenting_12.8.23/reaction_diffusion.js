

//vel texture updates from flow (using position) --> position texture updates from vel

let flowTexture;
let velocityTexture;
let positionTexture;
let velocityShader;
let positionShader;
let noiseTex;
let posTex;

let dampForce = 0.003;
let exitRadius = 300;

function preload(){
  //this shader updates velocities, using the flow field
  velocityShader = loadShader('vel.vert','vel.frag');
  //this shader draws positions to the main canvas
  positionShader = loadShader('positionShader.vert','positionShader.frag');

  noiseTex = loadImage("noise.png");
  posTex = loadImage("positions.png");
}

function setup(){
  mainCanvas = createCanvas(600,600,WEBGL);
  flowTexture = createFramebuffer(width,height,{format:FLOAT});
  velocityTexture = createFramebuffer(100,100,{format:FLOAT});
  positionTexture = createFramebuffer(100,100,{format:FLOAT});
  finalTexture = createFramebuffer(width,height,{format:FLOAT});
  pixelDensity(1);
  setupFlowField();
  setupPositions();
  setupVelocity();
}

function draw(){

  //writing to the velocity
  velocityTexture.begin();
  shader(velocityShader);
  velocityShader.setUniform("uFlowTexture",flowTexture);
  velocityShader.setUniform("uVelocityTexture",velocityTexture);
  velocityShader.setUniform("uPositionTexture",positionTexture);
  velocityShader.setUniform("uDampForce",dampForce);
  velocityShader.setUniform("uMousePos",[mouseX/width,mouseY/height]);
  rect(-velocityTexture.width/2,-velocityTexture.height/2,velocityTexture.width,velocityTexture.height);
  velocityTexture.end();
  resetShader();

  //updating positions
  positionTexture.begin();
  shader(positionShader);
  positionShader.setUniform("uVelocityTexture",velocityTexture);
  positionShader.setUniform("uPositionTexture",positionTexture);
  positionShader.setUniform("uExitRadius",exitRadius);
  rect(-positionTexture.width/2,-positionTexture.height/2,positionTexture.width, positionTexture.height);
  positionTexture.end();

  //drawing positions
  finalTexture.begin();
  positionTexture.loadPixels();
  background(255);
  // fill(200,0,0);
  strokeWeight(1);
  for(let x1 = 0; x1 < 100; x1++){
    if(x1>10)
      break;
    for(let y1 = 0; y1 < 100; y1++){

      let index = 4 * ((y1) * width  + (x1));

      let rgb = [positionTexture.pixels[index],positionTexture.pixels[index+1],positionTexture.pixels[index+2]];
      // ellipse(map(rgb[0],0,255,-width/2,width/2),map(rgb[1],0,255,-height/2,height/2),10,10);
      push();
      translate(map(rgb[0],0,255,-width/2,width/2),map(rgb[1],0,255,-height/2,height/2),map(rgb[2],0,255,-height/2,height/2));
      // point(map(rgb[0],0,255,-width/2,width/2),map(rgb[1],0,255,-height/2,height/2));
      ellipse(0,0,5,5);
      pop();
    }
  }
  finalTexture.end();

  image(finalTexture,-width/2,-height/2,width,height);
  image(velocityTexture,-width/2,-height/4,width/4,height/4);
  image(flowTexture,-width/2,-height/2,width/4,height/4);
  image(positionTexture,-width/4,-height/2,width/4,height/4);
}

function setupPositions(){
  positionTexture.begin();
  image(posTex,-positionTexture.width/2,-positionTexture.height/2,positionTexture.width,positionTexture.height);
  positionTexture.end();
}

function setupFlowField(){
  flowTexture.begin();
  image(noiseTex,-flowTexture.width/2,-flowTexture.height/2,flowTexture.width,flowTexture.height);
  flowTexture.end();
}

function setupVelocity(){
  velocityTexture.begin();
  background(127.4);
  velocityTexture.end();
}

function writeNewRandomPositions(){
  loadPixels();
  for(let i = 0; i<pixels.length; i++){
    pixels[i] = random(0,256);
  }
  updatePixels();
}

function writeNewNoiseField(){
  //fill flow field with perlin noise, only in the red channel
  //don't need to call begin() or end() here
  flowTexture.begin();
  for(let x1 = 0; x1<flowTexture.width; x1++){
    for(let y1 = 0; y1<flowTexture.height; y1++){
      noiseSeed(0);
      const r = ceil(255.0 * noise(x1,y1,0));
      noiseSeed(1);
      const g = ceil(255.0 * noise(x1,y1,0));
      noiseSeed(2);
      const b = ceil(255.0 * noise(x1,y1,0));
      stroke(r,g,b);
      point(x1-flowTexture.width/2,y1-flowTexture.height/2);
      count++;
    }
  }
  flowTexture.end();
}