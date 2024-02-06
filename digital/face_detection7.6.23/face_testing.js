let predictions = [];
let video;//video object for the webcam
let font;
let gif;
const options = {flipHorizontal: false,maxContinuousChecks: 5,detectionConfidence: 0.9, maxFaces: 10, scoreThreshold: 0.75,iouThreshold: 0.3 };

//callback for when the model loads
function modelLoaded(){
  console.log("model loaded!");
}

function drawKeypoints(){
  for(let i = 0; i<predictions.length; i++){
    const keypoints = predictions[i].scaledMesh;
    for(let j = 0; j<keypoints.length; j++){
      const [x,y] = keypoints[j];
      fill(0,255,0);
      ellipse(x-video.width/2,y-video.height/2,5,5);
    }
  }
}

function preload(){
  font = loadFont("data/EBGaramond-Italic-VariableFont_wght.ttf");
  gif = loadImage("data/fire.gif");
}

function setup() {
  createCanvas(windowWidth,windowHeight,WEBGL);
  video = createCapture(VIDEO);
  //hiding video bc you're using it as a texture
  video.hide();
  //loading facemesh
  const facemesh = ml5.facemesh(video,options,modelLoaded);
  //lsetting prediction pipeline
  facemesh.on('face',results =>{
    predictions = results;
    console.log(results);
  });
}


function draw() {
  background(0,0,0,100);
  //drawing webcam vid
  noStroke();
  texture(video);
  //texture(gif);

  plane(video.width, video.height)
  
  const face = predictions[0];
  //if theres a face
  let LEye;
  if(face){
    //drawKeypoints();
    //arrays of points of each feature 
    //picking features by their keyword (console.log(predictions))
    //reversing the upper arrays to the polygons connect in the right order
    let LEyeCoords = predictions[0].annotations.leftEyeLower0.concat(predictions[0].annotations.leftEyeUpper0.toReversed());
    let REyeCoords = predictions[0].annotations.rightEyeLower0.concat(predictions[0].annotations.rightEyeUpper0.toReversed());
    let mouthCoords = predictions[0].annotations.lipsLowerInner.concat(predictions[0].annotations.lipsUpperInner);
     
    //fill(255,0,100);
    //stroke(255,0,100);
    texture(gif);
    //texture(video);
    textureMode(NORMAL);
    beginShape();
    for(let i = 0; i<LEyeCoords.length; i++){
      //mapping uv coords
      vertex(LEyeCoords[i][0]-video.width/2,LEyeCoords[i][1]-video.height/2,0,map(LEyeCoords[i][0],0,video.width,0,1),map(LEyeCoords[i][1],0,video.height,0,1));
    }
    endShape();
    beginShape();
    for(let i = 0; i<REyeCoords.length; i++){
      vertex(REyeCoords[i][0]-video.width/2,LEyeCoords[i][1]-video.height/2,0,map(LEyeCoords[i][0],0,video.width,0,1),map(REyeCoords[i][1],0,video.height,0,1));
    }
    endShape();
    
    beginShape();
    for(let i = 0; i<mouthCoords.length; i++){
      vertex(mouthCoords[i][0]-video.width/2,mouthCoords[i][1]-video.height/2,0,map(mouthCoords[i][0],0,video.width,0,1),map(mouthCoords[i][1],0,video.height,0,1));
    }
    endShape();
  }
}
