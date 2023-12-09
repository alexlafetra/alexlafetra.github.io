//Sliders/controls
let stepSlider;
let aSlider;
let bSlider;
let kSlider;
let fSlider;
let tSlider;
let computeSlider;
let brightSlider;
let mouseHeld = false;
let lastMousePos;

function mousePressed(){
    mouseHeld = true;
  }
function mouseReleased(){
    mouseHeld = false;
}
  
  //measures the distance between two mouse positions
function getMouseSpeed(){
    //turning it into a vector bc i'm lazy and don't want to write a distance function
    let currentMousePos = createVector(mouseX,mouseY);
    const distance = p5.Vector.dist(currentMousePos,lastMousePos);
    lastMousePos = currentMousePos;
    return distance/width;
}
  
  //Cuts mouse position in half so it renders over double-canvas
function getMouseX(){
    // let m = mouseX;
    // if(m>width/2)
    //   m-=width/2;
    // return 2*m/width;
    return mouseX/width;
}

//create the input sliders + reset button
function createSliders(){
    const controls = createDiv();
    controls.id("controls");
  
    stepSlider = new LabeledSlider(0.01,10,stepSize,0.01,"Radius");
    aSlider = new LabeledSlider(0,1.5,dA,0.01,"dA");
    bSlider = new LabeledSlider(0,1.5,dB,0.01,"dB");
    kSlider = new LabeledSlider(0,0.06,k,0.0001,"kill");
    fSlider = new LabeledSlider(0,0.12,f,0.0001,"feed");
    tSlider = new LabeledSlider(0,1,dT,0.01,"dT");
    computeSlider = new LabeledSlider(1,15,computePasses,1,"Cycles");
    brightSlider = new LabeledSlider(1,40,shineScale,0.1,"Shine");

  
    const swapPalletteButton = createButton("Swap Color");
    swapPalletteButton.mousePressed(swapPallette);
    swapPalletteButton.parent(controls);
  
    const randomColorButton = createButton("Randomize Pallette");
    randomColorButton.mousePressed(randPallette);
    randomColorButton.parent(controls);

    const embossButton = createButton("de/emboss");
    embossButton.mousePressed(() =>{embossed = !embossed});
    embossButton.parent(controls);

    const bwButton = createButton("color on/off");
    bwButton.mousePressed(() => {blackAndWhite = !blackAndWhite});
    bwButton.parent(controls);
  
    const petriButton = createButton("Put it in a dish");
    petriButton.mousePressed(() => {petriDish = !petriDish;});
    petriButton.parent(controls);

    const fillButton = createButton("Clear");
    fillButton.mousePressed(clearScreen);
    fillButton.parent(controls);
  
    const debugButton = createButton("Show Texture Data");
    debugButton.mousePressed(() => {showRenderLayer = !showRenderLayer;});
    debugButton.parent(controls);

    const logButton = createButton("Log Parameters");
    logButton.mousePressed(logParameters);
    logButton.parent(controls);

    const resetButton = createButton("Reset Parameters");
    resetButton.mousePressed(reset);
    resetButton.parent(controls);
}
  
const CLOSEHEIGHT = '-220px';
const OPENHEIGHT = '0px';
  
  //grab values from sliders and load into sim
function updateSliders(){
    stepSize = stepSlider.value();
    dA = aSlider.value();
    dB = bSlider.value();
    k = kSlider.value();
    f = fSlider.value();
    dT = tSlider.value();
    computePasses = computeSlider.value();
    shineScale = brightSlider.value();
}

function logParameters(){
    console.log("params = {stepSize:"+stepSize
                              +",dA:"+dA
                              +",dB:"+dB
                              +",k:"+k
                              +",f:"+f
                              +",dT:"+dT
                              +",computePasses:"+computePasses+"};");
}

function loadParameters(params){
    stepSlider.set(params.stepSize);
    aSlider.set(params.dA);
    bSlider.set(params.dB);
    kSlider.set(params.k);
    fSlider.set(params.f);
    tSlider.set(params.dT);
    computeSlider.set(params.computePasses);
    console.log(params);
}

function loadPreset(which){
    switch(which){
        case "INTRICATE":
            break;
    }
}
    