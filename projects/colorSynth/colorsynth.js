let font;

let red,blue,green;
let soundEngineStarted = false;

let oscR,oscG,oscB,fft;
let minRed = 0;
let maxRed = 1000;
let minGreen = 0;
let maxGreen = 1000;
let minBlue = 0;
let maxBlue = 1000;

let sliderR,sliderG,sliderB,brightnessSlider,tempoSlider,satSlider;

let textBoxR,textBoxG,textBoxB;

let toggleSoundButton;
let playButton;
let addColorButton;
let eraseButton;
let quantizeButton;
let randomButton;
let getEquivColorButton;

let rainbowBox;
let rainbowShader;

let title;

let colorPickerX,colorPickerY;
let colorPicking = false;
let enteringNumber = false;

let palette;

const rectSize = 50;

const waveStartX = 600;
const waveWidth = 100;
const waveStartY = 70;
const waveHeight = 200;

const rainbowY = 290;

function preload(){
  font = loadFont('data/Lostar.ttf');
}

function setup() {
  let div = createDiv();
  div.id("mainDiv");
  let canv = createCanvas(800,800,WEBGL);
  canv.parent("mainDiv");
  //canv.style("margin","auto");
  //canv.style("display","block");
  
  rainbowBox = createGraphics(250,250,WEBGL);
  rainbowShader = rainbowBox.createShader(rainbowVert,rainbowFrag);
  
  
  palette = new Palette();
  
  colorPickerX = 100;
  colorPickerY = 100;
  
  sliderR = createSlider(0,255,255);
  sliderR.position(80,100);
  sliderG = createSlider(0,255,0);
  sliderG.position(80,160);
  sliderB = createSlider(0,255,0);
  sliderB.position(80,220);
  
  sliderR.parent("mainDiv");
  sliderG.parent("mainDiv");
  sliderB.parent("mainDiv");
  
  brightnessSlider = createSlider(0.0,2.0,1.0,0.01);
  brightnessSlider.position(135,550);
  brightnessSlider.mousePressed(activateBrightnessSlider);
  brightnessSlider.mouseReleased(deactivateBrightnessSlider);
  satSlider = createSlider(0.1,3.0,0.5,0.01);
  satSlider.position(135,570);
  satSlider.mousePressed(activateBrightnessSlider);
  satSlider.mouseReleased(deactivateBrightnessSlider);
  
  tempoSlider = createSlider(1,120,60,1);
  tempoSlider.position(410,360);
  
  brightnessSlider.parent("mainDiv");
  satSlider.parent("mainDiv");
  tempoSlider.parent("mainDiv");
  
  textBoxR = createInput();
  textBoxR.position(300,100);
  textBoxR.value('255');
  textBoxR.mousePressed(enterNumber);
  
  textBoxG = createInput();
  textBoxG.position(300,160);
  textBoxG.value('0');
  textBoxG.mousePressed(enterNumber);
  
  textBoxB = createInput();
  textBoxB.position(300,220);
  textBoxB.value('0');
  textBoxB.mousePressed(enterNumber);
  
  textBoxR.parent("mainDiv");
  textBoxB.parent("mainDiv");
  textBoxG.parent("mainDiv");
  
  toggleSoundButton = createButton('audio on');
  toggleSoundButton.position(20,80);
  toggleSoundButton.mousePressed(toggleSound);
  
  addColorButton = createButton('add');
  addColorButton.position(20,120);
  addColorButton.mousePressed(addColor);

  playButton = createButton('play');
  playButton.position(20,160);
  playButton.mousePressed(playPalette);
  
  eraseButton = createButton('erase');
  eraseButton.position(20,200);
  eraseButton.mousePressed(erasePalette);
  
  quantizeButton = createButton('quantize to TET');
  quantizeButton.position(20,240);
  quantizeButton.mousePressed(quantize);
  
  randomButton = createButton('random');
  randomButton.position(20,280);
  randomButton.mousePressed(addRandom);
  
  getEquivColorButton = createButton('get harmonically equivalent color');
  getEquivColorButton.position(500,40);
  getEquivColorButton.mousePressed(getHarmonicEquivalent);
  
  toggleSoundButton.parent("mainDiv");
  addColorButton.parent("mainDiv");
  playButton.parent("mainDiv");
  eraseButton.parent("mainDiv");
  quantizeButton.parent("mainDiv");
  randomButton.parent("mainDiv");
  getEquivColorButton.parent("mainDiv");
  
  oscR = new p5.TriOsc();
  oscG = new p5.SinOsc();
  oscB = new p5.SinOsc();
  
  oscR.amp(0.5);
  oscG.amp(0.5);
  oscB.amp(0.5);
  
  fft = new p5.FFT();
  
  oscR.start();
  oscG.start();
  oscB.start();
  
  title = createGraphics(700,110,WEBGL);
  title.background(255,255,255,0);
  title.textFont(font);
  title.textSize(66);
  title.textAlign(CENTER);
  title.rotateY(radians(15));
  title.fill(0);
  title.text("Colorsynth",20,20,0);
  
  textFont(font);
  
  //colorMode(RGB);
  blendMode(OVERLAY);
}

function draw() {
  //push();
  translate(-width/2,-height/2);
  background(255);
  if(colorPicking && mouseX>80 && mouseX<330 && mouseY>rainbowY && mouseY<(rainbowY+250)){
    colorPickerX = mouseX - 80;
    colorPickerY = mouseY - rainbowY;
  }
  
  //updateControls();
  if(!palette.isPlaying){
    updateColors();
  }
  palette.update();
  updateOscillators();
  palette.display();
  
  image(title,0,0);
  
  drawOscWaveform();    

  drawColors(); 

  rainbowShader.setUniform('brightness',brightnessSlider.value());
  rainbowShader.setUniform('saturation',satSlider.value());
  rainbowBox.clear();
  rainbowBox.background(255);
  rainbowBox.shader(rainbowShader);
  rainbowBox.noStroke();
  rainbowBox.rect(0,0,rainbowBox.width,rainbowBox.height);
  //rainbowBox.ellipse(rainbowBox.width/2,rainbowBox.height/2,rainbowBox.width/2,rainbowBox.height/2);
  image(rainbowBox,80,rainbowY);
  noFill();
  strokeWeight(1);
  stroke(0);
  rect(80+colorPickerX-5,rainbowY+colorPickerY-5,10,10,2);
}


function keyPressed(){
  if(keyCode == ENTER){
    sliderR.value(textBoxR.value());
    sliderG.value(textBoxG.value());
    sliderB.value(textBoxB.value());
    enteringNumber = false;
  }
}

function getHarmonicEquivalent(){
  
  console.log(oscR.getFreq());
  console.log(oscG.getFreq());
  console.log(oscB.getFreq());
  let r1 = oscR.getFreq()/oscG.getFreq();
  let r2 = oscR.getFreq()/oscB.getFreq();
  let biggest = (r1>r2)?r1:r2;
  
  let c0 = floor(random(100,min(1000/biggest,1000)));
  let c1 = c0*r1;
  let c2 = c0*r2;
  
  console.log(r1);
  console.log(r2);
  
  red = map(c0,0,1000,0,255);
  green = map(c1,0,1000,0,255);
  blue = map(c2,0,1000,0,255);
  
  sliderR.value(red);
  sliderG.value(green);
  sliderB.value(blue);
}

class Palette{
  constructor(){
    this.colors = [];
    this.activeColor = 0;
    this.timer = 60;
    this.isPlaying = false;
    this.isBeingEdited = false;
  }
  display(){
    let x = 360;
    let y = rainbowY+10;
    if(this.isPlaying){
      stroke(0);
      rect(x-10,y-10,250,10+60*ceil(this.colors.length/4),5);
    }
    let i = 0;
    for(let c of this.colors){
      fill(c.levels[0],c.levels[1],c.levels[2]);
      strokeWeight((i==this.activeColor?(this.isBeingEdited?4:2):0));
      rect(x,y,50,50,5);
      x+=60;
      i++;
      if(x>=560){
        x = 360;
        y += 60;
      }
    }
  }
  update(){
    if(this.isPlaying){
      this.timer--;
      //once timer reaches zero, move to next color
      if(!this.timer){
        this.activeColor++;
        this.timer = tempoSlider.value();
        if(this.activeColor>=this.colors.length){
          this.activeColor = 0;
        }
        red = this.colors[this.activeColor].levels[0];
        green = this.colors[this.activeColor].levels[1];
        blue = this.colors[this.activeColor].levels[2];
        updateTextBoxes();
      }
    }
  }
  addRandom(){
    this.addColor(random(0,256),random(0,256),random(0,256));
  }
  addColor(r,g,b){
    let c = color(r,g,b);
    this.colors.push(c);
    tempoSlider.position(410,300+ceil(this.colors.length/4)*60);
  }
  toggle(){
    if(palette.colors.length>0){
      this.isPlaying = !this.isPlaying;
    }
    else{
      this.isPlaying = false;
    }
  }
  checkForClick(){
    //if you're picking colors, don't disable editing
    if(colorPicking){
      return;
    }
    else{
      let x = 360;
      let y = rainbowY+10;
      let i = 0;
      for(let c of this.colors){
        //if the mouse clicks a square, then it's being edited
        if(mouseX>x && mouseX<(x+50) && mouseY>y && mouseY<(y+50)){
          this.isBeingEdited = true;
          this.activeColor = i;
          red = this.colors[i].levels[0];
          green = this.colors[i].levels[1];
          blue = this.colors[i].levels[2];
          sliderR.value(red);
          sliderG.value(green);
          sliderB.value(blue);
          return;
        }
        x+=60;
        i++;
        if(x>=560){
          x = 360;
          y += 60;
        }
      }
      this.isBeingEdited = false;
    }
  }
}

function addColor(){
  if(palette.isPlaying){
    let newRGB = getColorWheelColor();
    palette.addColor(floor(newRGB[0]),floor(newRGB[1]),floor(newRGB[2]));
  }
  else{
    palette.addColor(red,green,blue);
  }
}

function addRandom(){
  palette.addRandom();
}

function playPalette(){
  palette.toggle();
  playButton.html(palette.isPlaying?"pause":"play");
}

function erasePalette(){
  if(palette.isPlaying){
    playPalette();
  }
  palette.activeColor = 0;
  palette.colors = [];
  tempoSlider.position(410,360);
}

function activateBrightnessSlider(){
  colorPicking = true;
}
function deactivateBrightnessSlider(){
  colorPicking = false;
}
function enterNumber(){
  enteringNumber = true;
}
//got this formula from 
//https://www.rapidtables.com/convert/color/hsv-to-rgb.html
function HSVtoRGB(H,S,V){
  //H is between 0 and 360
  let C = V*S;
  let X = C * (1-abs((H/60)%2-1));
  let m = V - C;
  let primes = [];
  if(H<60){
    primes = [C,X,0];
  }
  else if(H<120){
    primes = [X,C,0];
  }
  else if(H<180){
    primes = [0,C,X];
  }
  else if(H<240){
    primes = [0,X,C];
  }
  else if(H<300){
    primes = [X,0,C];
  }
  else if(H<360){
    primes = [C,0,X];
  }
  let newColor = [(primes[0]+m)*255,(primes[1]+m)*255,(primes[2]+m)*255]
  return newColor;
}

function getColorWheelColor(){
    let x = colorPickerX-rainbowBox.width/2;
    let y = -colorPickerY+rainbowBox.height/2;
    let dist = sqrt(pow(x,2)+pow(y,2))/satSlider.value();
    //let theta = atan(y/x)+(y<0?0:0);
    let theta = atan(y/x)+(x<0?PI:(y<0?TWO_PI:0));
    let b = brightnessSlider.value();
    
    return HSVtoRGB((degrees(theta))%360,dist/(rainbowBox.width),b);
}

function updateColors(){
  if(colorPicking){
    let newRGB = getColorWheelColor();
    
    red = floor(newRGB[0]);
    green = floor(newRGB[1]);
    blue = floor(newRGB[2]);
    
    sliderR.value(red);
    sliderG.value(green);
    sliderB.value(blue);
    textBoxR.value(red);
    textBoxG.value(green);
    textBoxB.value(blue);
  }
  else{
    red = sliderR.value();
    green = sliderG.value();
    blue = sliderB.value();
    updateTextBoxes();
  }
  if(palette.isBeingEdited){
    palette.colors[palette.activeColor].levels[0] = red;
    palette.colors[palette.activeColor].levels[1] = green;
    palette.colors[palette.activeColor].levels[2] = blue;
  }
}

function updateOscillators(){
  //all osc's the same range
  oscR.freq(map(red,0,255,minRed,maxRed));
  oscG.freq(map(green,0,255,minGreen,maxGreen));
  oscB.freq(map(blue,0,255,minBlue,maxBlue));
  
  //osc's on different octaves
  //oscR.freq(map(red,0,255,65.40639,130.8128));
  //oscG.freq(map(green,0,255,130.8128,261.6256));
  //oscB.freq(map(blue,0,255,261.6256,523.2511));
  
  //osc's all from c2-c5
  //oscR.freq(map(red,0,255,65.40639,523.2511));
  //oscG.freq(map(green,0,255,65.40639,523.2511));
  //oscB.freq(map(blue,0,255,65.40639,523.2511));
}

function updateTextBoxes(){
  if(!enteringNumber){
    textBoxR.value(red);
    textBoxG.value(green);
    textBoxB.value(blue);
  }
}

function drawOscWaveform(){
  noStroke();
  fill(red,green,blue);
  push();
  translate(400,70);
  rect(0,0,200,200);
  pop();
  let waveform = fft.waveform();
  noFill();
  stroke(red,green,blue);
  beginShape();
  strokeWeight(5);
  for (let i = 0; i < waveform.length; i++) {
    let y = map(i, 0, waveform.length, waveStartY, waveStartY + waveHeight);
    let x = map(waveform[i], -1, 1, waveStartX, waveStartX + waveWidth);
    vertex(x, y);
  }
  endShape();
}

function drawColors(){
  for(let i = 0; i<3; i++){
    push();
    translate(250,110+i*60);
    rectMode(CENTER);
    noStroke();
    switch(i){
      case 0:
        fill(red,0,0);
        break;
      case 1:
        fill(0,green,0);
        break;
      case 2:
        fill(0,0,blue);
        break;
    }
    rect(0,0,rectSize,rectSize,rectSize/4);
    pop();
  }
}


function log2_12(val){
  const t12 = pow(2.0,1.0/12.0);
  return Math.log(val)/Math.log(t12);
}

function quantize(){
  if(palette.isPlaying){
    quantizePaletteToTET();
  }
  else{
    red = map(quantizeFreqToTET(oscR.getFreq()),minRed,maxRed,0,255);
    green = map(quantizeFreqToTET(oscG.getFreq()),minGreen,maxGreen,0,255);
    blue = map(quantizeFreqToTET(oscB.getFreq()),minBlue,maxBlue,0,255);
    sliderR.value(red);
    sliderG.value(green);
    sliderB.value(blue);
  }
}
function quantizeFreqToTET(frequency){
  const twelfthRoot = pow(2,1/12);
  //quantized number of times you need to multiply a base freq by 12r2
  const f = log(frequency/440)/log(twelfthRoot);
  let keyNumber = 12*log(frequency/440)/log(2)+49;
  //let numberOfHalfSteps = (f-floor(f))>=0.5?ceil(f):floor(f);
  if(keyNumber - floor(keyNumber)>0.5){
    keyNumber = ceil(keyNumber);
  }
  else{
    keyNumber = floor(keyNumber);
  }
  //let newFreq = 440*pow(twelfthRoot,numberOfHalfSteps);
  
  let newFreq = pow(twelfthRoot,keyNumber-49)*440;
  console.log(frequency);
  console.log(newFreq);
  return newFreq;
}
function quantizePaletteToTET(){
  for(let c of palette.colors){
    let f1 = map(c.levels[0],0,255,0,1000);
    let f2 = map(c.levels[1],0,255,0,1000);
    let f3 = map(c.levels[2],0,255,0,1000);
    
    c.levels[0] = map(quantizeFreqToTET(f1),0,1000,0,255);
    c.levels[1] = map(quantizeFreqToTET(f2),0,1000,0,255);
    c.levels[2] = map(quantizeFreqToTET(f3),0,1000,0,255);
  }
}

function mouseReleased(){
  if(!enteringNumber){
    textBoxR.value(red);
    textBoxG.value(green);
    textBoxB.value(blue);
  }
  colorPicking = false;
}

function toggleSound(){
  //starting audio if it hasn't been yet
  if(!soundEngineStarted){
    userStartAudio();
    soundEngineStarted = true;
  }
  else{
    getAudioContext().suspend();
    soundEngineStarted = false;
  }
  toggleSoundButton.html(soundEngineStarted?"audio off":"audio on");
}

function mousePressed(){
  if(mouseX>80 && mouseX<330 && mouseY>rainbowY && mouseY<(rainbowY+250)){
    colorPicking = true;
    colorPickerX = mouseX - 80;
    colorPickerY = mouseY - rainbowY;
  }
  palette.checkForClick();
}
