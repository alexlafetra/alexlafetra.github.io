let mainFlock;
let mainCanvas;

let renderFBO;
let fadeFBO;

let prevTarget;

let begun = false;

let mlDetector;
let testVid;

//got these from:
//https://editor.p5js.org/fffiloni/sketches/CP_ONAcl_
const options = {
    flipHorizontal: true, // boolean value for if the video should be flipped, defaults to false
    maxContinuousChecks: Infinity, // How many frames to go without running the bounding box detector. Defaults to infinity, but try a lower value if the detector is consistently producing bad predictions.
    detectionConfidence: 0.8, // Threshold for discarding a prediction. Defaults to 0.8.
    scoreThreshold: 0.75, // A threshold for removing multiple (likely duplicate) detections based on a "non-maximum suppression" algorithm. Defaults to 0.75
    iouThreshold: 0.3, // A float representing the threshold for deciding whether boxes overlap too much in non-maximum suppression. Must be between [0, 1]. Defaults to 0.3.
}

function preload(){
    //can't figure out how to do this w/ preloaded vid
    // testVid = createVideo("handML_test.mp4");
    // testVid.play();
    testVid = createCapture();
    testVid.hide();
    // testVid.loop();
    testVid.volume(0);
    mlDetector = new MLHandPoseDetector(testVid,options);
}

function setup(){
    //create some things
    mainCanvas = createCanvas(800,800,WEBGL);
    mainFlock = new Flock(20);
    renderFBO = createFramebuffer({ format: FLOAT });
    fadeFBO = createFramebuffer({ format: FLOAT });
    prevTarget = createVector(0,0,0);

    // imageMode(CENTER);

    //init the ML hand detection stuff
}
function draw(){
    if(mlDetector.modelLoaded){

        
        //swap buffers
        [renderFBO,fadeFBO] = [fadeFBO,renderFBO];
        //fade the previous buffer
        fadeFBO.begin();
            fill(0,20);
            noStroke();
            rect(-width/2,-height/2,width,height);
        fadeFBO.end();
        renderFBO.begin();
            //load finger location
            let targetP = prevTarget;
            if(mlDetector.detections.length){
                let indexFinger = mlDetector.getIndexFinger();
                mlDetector.drawIndexFinger();
                targetP = createVector(indexFinger.x,indexFinger.y,0);
                mlDetector.drawIndexFinger();
            }
            clear();
            //draw the faded previous buffer
            image(fadeFBO, -width/2, -height/2);
            //draw & update the flock
            mainFlock.update(targetP);
            stroke(255);
            line(targetP.x,targetP.y,prevTarget.x,prevTarget.y);

            image(testVid,-width/2,-height/2,testVid.width/3,testVid.height/3);
        renderFBO.end();
        background(0);
        image(renderFBO,-width/2,-height/2);
        prevTarget = targetP;
    }
}