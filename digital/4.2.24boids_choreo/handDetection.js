class MLHandPoseDetector{
  //instantiates an ml5.handpose model on the video source
  constructor(imageSource,options){
    this.video = imageSource;
    this.options = options;
    this.handPose = ml5.handpose(this.video, this.options, ()=>{
        console.log("model loaded!");
        this.modelLoaded = true;
        this.handPose.on('predict',results => {
            this.detections = results;
            // console.log(this.detections[0].annotations);
        });
    });
  }
  render(){
    noStroke();
    fill(255,0,0);
  }
  drawBoundingBox(){
    if(!this.detections[0].boundingBox){
      return;
    }
    console.log("found!");
    noFill();
    strokeWeight(6);
    stroke(255,0,0);
    //get BB coordinates
    let x1 = this.detections[0].boundingBox.topLeft[0]-width/2;
    let y1 = this.detections[0].boundingBox.topLeft[1]-height/2;
    let x2 = this.detections[0].boundingBox.bottomRight[0]-width/2;
    let y2 = this.detections[0].boundingBox.bottomRight[1]-height/2;
    rect(x1,y1,x2-x1,y2-y1);
  }
  getIndexFinger(){
    let indexFinger = {x:-this.detections[0].annotations.indexFinger[1][0]+width/2,y:this.detections[0].annotations.indexFinger[1][1]-height/2,z:this.detections[0].annotations.indexFinger[1][2]};
    return indexFinger;
  }
  drawIndexFinger(){
    let indexFinger = this.getIndexFinger();
    ellipse(indexFinger.x,indexFinger.y,10,10);
  }
}

function drawLandmarks(indexArray){
    push();
    strokeWeight(40);
    translate(-width/2,-height/2);
    for(let i=0; i<detections.length; i++){
      for(let j=indexArray[0]; j<indexArray[1]; j++){
        let x = detections[i].landmarks[j][0];
        let y = detections[i].landmarks[j][1];
        let z = detections[i].landmarks[j][2];
        stroke(255, 40, 255);
        point(x, y, z);
      }
    }
    pop();
  }