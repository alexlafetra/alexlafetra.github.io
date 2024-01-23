/*
Idea is to "throw" an image at another image and embed its pixels
Pixels travel based on their velocity, which could be randomly encoded or taken from the RGBA data
*/

let mainCanvas;
let projectileImage;
let targetImage;
let resultImage;
let velScale = 1;

function preload(){
  projectileImage = loadImage('img2.png');
  targetImage = loadImage('img2.png');
}

function getLuminance(c){
  return (0.2126*c[0]/255.0 + 0.7152*c[1]/255.0 + 0.0722*c[2]/255.0);
}

function collide(bullet,target,result){
  const d = pixelDensity();
  bullet.loadPixels();
  target.loadPixels();
  result.loadPixels();
  for(let x = 0; x<bullet.width; x++){
    for(let y = 0; y<bullet.height; y++){
      for(let i = 0; i<d; i++){
        for(let j = 0; j<d; j++){
          let bulletIndex = 4 * ((y * d + j) * bullet.width * d + (x * d + i)); 
          // bulletIndex%=bullet.pixels.length;
          let targetIndex = 4 * ((y * d + j) * target.width * d + (x * d + i)); 
          // targetIndex%=target.pixels.length;
          let c = [bullet.pixels[bulletIndex],bullet.pixels[bulletIndex+1],bullet.pixels[bulletIndex+2],bullet.pixels[bulletIndex+3]];
          let c2 = [target.pixels[targetIndex],target.pixels[targetIndex+1],target.pixels[targetIndex+2],target.pixels[targetIndex+3]];

          let x2 = x+velScale*c[2];
          // let x2 = x+velScale*getLuminance(c);
          let resultIndex = 4 * ((y * d + j) * result.width * d + (x2 * d + i)); 
          result.pixels[resultIndex] = c[0];
          result.pixels[resultIndex+1] = c[1];
          result.pixels[resultIndex+2] = c[2];
          result.pixels[resultIndex+3] = c[3];
          // result.pixels[resultIndex] = (c[0]+c2[0])/2;
          // result.pixels[resultIndex+1] = (c[1]+c2[1])/2;
          // result.pixels[resultIndex+2] = (c[2]+c2[2])/2;
          // result.pixels[resultIndex+2] = (c[3]+c2[3])/2;
        }
      }
    }
  }
  result.updatePixels();
}


function collide_slow(bullet,target,result){
  const d = pixelDensity;
  bullet.loadPixels();
  target.loadPixels();
  result.loadPixels();
  for(let x = 0; x<bullet.width; x++){
    for(let y = 0; y<bullet.height; y++){
      const d = 1;
      let c2 = target.get(x,y);
      let c = bullet.get(x,y);
      let x2 = x+velScale*c[0];
      let y2 = y+velScale*c[1];
      // c = [(c[0]+c2[0])/2,(c[1]+c2[1])/2,(c[2]+c2[2])/2,(c[3]+c2[3])/2];
      result.set(x,y,c2);
      result.set(x2,y2,c);
    }
  }
  result.updatePixels();
}

function setup(){
  // mainCanvas = createCanvas(800,1200,WEBGL);
  mainCanvas = createCanvas(projectileImage.width,projectileImage.height,WEBGL);
  pixelDensity(1);
  resultImage = createImage(400,400);
  collide(projectileImage,targetImage,resultImage);
}

function draw(){
  background(0);
  // velScale = mouseX/width;
  // console.log(velScale);

  // collide_slow(projectileImage,targetImage,resultImage);
  collide(projectileImage,targetImage,resultImage);
  image(targetImage,-width/2,-height/2,width,height);
  image(resultImage,-width/2,-height/2,width,height);
}