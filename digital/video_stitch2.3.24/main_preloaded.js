/*
  Idea for stitching:
  you could write the 'over/under' information to a shader and use it to set the blend mode/opacity of the two images as they're drawn over one another
  like: horizontal stitches + vert stitches --> shader ( shader pulls over/under info from texture ) --> pixels from just one of the images OR the other
*/

class ClothThread{
    constructor(x,y,c,seed,d){
      this.direction = d;
      this.seed = seed;
      this.start = {x:x,y:y};
      this.color = c;
      this.points = [];
      this.points.push(this.start);
      this.maxLength = 10.8;
      this.age = 0;
      this.done = false;
      this.thickness = 2;
      // this.thickness = threadDensity;
      this.noiseAmplitude = 1.01;
    }
    grow(){
      if(this.points[this.points.length-1].y>(height-2*border)/2 || this.points[this.points.length-1].x>(width-2*border)/2){
        this.done = true;
        return false;
      }
      noiseSeed(this.seed);
      let len = this.maxLength*noise(this.age/10);
      let newPoint 
      if(this.direction == DOWN){
        newPoint = {x:this.points[this.points.length-1].x+this.noiseAmplitude*(noise(this.age/0.1)-0.5),y:this.points[this.points.length-1].y+len};
      }
      else if(this.direction == RIGHT){
        newPoint = {x:this.points[this.points.length-1].x+len,y:this.points[this.points.length-1].y+this.noiseAmplitude*(noise(this.age/0.1)-0.5)};
      }
      this.points.push(newPoint);
      if(this.points.length>2){
        this.points = this.points.slice(-2);
      }
      this.age++;
      return true;
    }
    render(){
      noiseSeed(this.seed);
      noFill();
      stroke(this.color);
      strokeWeight(this.thickness*noise(this.age/10));
      line(this.points[this.points.length-1].x,this.points[this.points.length-1].y,this.points[this.points.length-2].x,this.points[this.points.length-2].y);
    }
    growAcrossScreen(){
      while(this.grow()){
        this.render();
      }
      return;
    }
    checkOffscreen(bound){
      if(points[0].y<bound){
        this.age = 0;
        this.done = false;
        points[0] = {x:0,y:(height-2*border)/2};
        points[1] = {x:this.maxLength*noise(this.age/10),y:(height-2*border)/2};
      }
    }
  }
  
  function randomColor(){
    // return color(255,255,100);
    return color(random(0,255),random(0,255),random(0,255));
  }
  
  class WeaveColor{
    constructor(colors){
      this.colors = colors;
    }
    getColor(index,thickness){
      let which = floor(index/thickness)%this.colors.length;
      return this.colors[which];
    }
  }
  
  let weavePallettes;
  let anniPallettes;
  
  let vertThreads = [];
  let horThreads = [];
  let NUMBER_OF_VERTICAL_THREADS;
  let NUMBER_OF_HORIZONTAL_THREADS;
  
  const maxLength = 8;
  const gap = 100;
  const UPRIGHT = 0;
  const LEFT = 1;
  const UPLEFT = 2;
  const RIGHT = 3;
  const DOWN = 0;
  const UP = 2;
  let threadDensity = 4;
  const stitchErrorChance = 0.01;
  
  let vStripeWidth = 6;
  let hStripeWidth = 12;
  
  let stitchShader;
  let imageShader;
  
  let mainCanvas;
  let frameBuffer;
  let stitchPatternBuffer;
  let stitchPatternBuffer_masked;
  let finalPass;
  
  let hThreadCanvas;
  let vThreadCanvas;
  
  let currentPalette;
  let currentBg;
  
  // const imageArray = ['images/IMG_1749.JPG','images/IMG_1858.jpeg','images/IMG_1749.JPG','images/IMG_1755.jpeg'];
  const imageArray = ['images/IMG_4677.MOV','images/IMG_4678.MOV','images/IMG_4747.MOV','images/IMG_4769.MOV'];
  
  let sourceImages = [];
  
  let webCam;
  let imageThresholdSlider;
  
  const border = 25;

  let preloaded_stitches;
  
  function preload(){
    preloaded_stitches = loadImage('images/stitchPattern.png');
    sourceImages = [];
    for(let path of imageArray){
      if(path.endsWith('MOV'))
        sourceImages.push(loadMovie(path));
      else
        sourceImages.push(loadImage(path));
    }
  }
  
  function saveStitchPattern(){
    saveCanvas(frameBuffer,"stitchPattern.png");
  }
  
  function reset(){
    hThreadCanvas = createFramebuffer();
    vThreadCanvas = createFramebuffer();
    frameBuffer = createFramebuffer();
    frameBuffer.begin();
    image(preloaded_stitches,-frameBuffer.width/2,-frameBuffer.height/2,frameBuffer.width,frameBuffer.height);
    frameBuffer.end();
    stitchPatternBuffer = createFramebuffer();
    stitchPatternBuffer_masked = createFramebuffer();
    finalPass = createFramebuffer();
  
    // vStripeWidth = floor(random(1,20));
    // hStripeWidth = floor(random(1,20));
    vStripeWidth = 40;
    hStripeWidth = 20;
  
    threadDensity = 1;
    NUMBER_OF_HORIZONTAL_THREADS = floor((width-2*border)/threadDensity);
    NUMBER_OF_VERTICAL_THREADS = floor((height-2*border)/threadDensity);
  
    //creating stitch pattern
    stitchPatternBuffer.begin();
    clear();
    let count = 0;
    noStroke();
    for(let i = 0; i<NUMBER_OF_HORIZONTAL_THREADS;i++){
      for(let j = 0; j<NUMBER_OF_VERTICAL_THREADS;j++){
        fill(((count%2)||(random(1)<stitchErrorChance))?'red':'blue');
        rect(i*(width-2*border)/NUMBER_OF_HORIZONTAL_THREADS-(width-2*border)/2,j*(height-2*border)/NUMBER_OF_VERTICAL_THREADS-(height-2*border)/2,threadDensity,threadDensity);
        count++;
      }
      count++;
    }
    stitchPatternBuffer.end();
  }
  
  function updateStitchImageFromWebcam(){
    stitchPatternBuffer_masked.begin();
    clear();
    shader(imageMaskShader);
    imageMaskShader.setUniform('uStitchPattern',stitchPatternBuffer);
    imageMaskShader.setUniform('uImageMask',webCam);
    imageMaskShader.setUniform('uThreshold',imageThresholdSlider.value());
    quad(-1,-1,1,-1,1,1,-1,1);
    stitchPatternBuffer_masked.end();
  }
  
  function loadMovie(path){
    let vid = createVideo(path);
    vid.hide();
    vid.volume(0);
    vid.loop();
    return vid;
  }
  
  function setup() {
    setAttributes('antialias',false);
    mainCanvas = createCanvas(800,800,WEBGL);
    stitchShader = createShader(stitchShaderVert,stitchShaderFrag);
    imageShader = createShader(imageShaderVert,getImageShaderFragCode());
    imageMaskShader = createShader(imageMaskVert,imageMaskFrag);
    imageThresholdSlider = createSlider(0,1,0.5,0.01);
  
    // pixelDensity(1);
  
    webCam = createCapture();
    webCam.volume(0);
    webCam.hide();

    reset();
  }
  
  //empty arrays when all the objects in them are done growing/rendering
  function checkForDone(){
    let done = true;
    for(let l of horThreads){
      if(!l.done){
        return;
      }
    }
    horThreads = [];
    for(let l of vertThreads){
      if(!l.done){
        return;
      }
    }
    vertThreads = [];
  }
  
  function draw() {
  
    updateStitchImageFromWebcam();
    
    //final render pass where each thread is rendered using the images
    finalPass.begin();
    shader(imageShader);
    imageShader.setUniform('uStitchImage',frameBuffer);
    imageShader.setUniform('uSourceImage0', webCam);
    for (let i = 1; i < sourceImages.length; i++) {
      imageShader.setUniform('uSourceImage'+i, sourceImages[i]);
    }
    quad(-1,-1,1,-1,1,1,-1,1);
    finalPass.end();
  
    image(finalPass,-(width-2*border)/2,-(height-2*border)/2,(width-2*border),(height-2*border));
    image(frameBuffer,-3*(width-2*border)/8,-(height-2*border)/2,(width-2*border)/8,(height-2*border)/8);
    image(stitchPatternBuffer_masked,-(width-2*border)/2,-(height-2*border)/2,(width-2*border)/8,(height-2*border)/8);
  }
  
  
  const glsl = x => x;
  
  const imageShaderVert = glsl`
  precision mediump float;
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  varying vec2 vTexCoord;
  
  void main() {
    gl_Position = vec4(aPosition,1.0);
    vTexCoord = aTexCoord;
  }
  `;
  
  //This is kind of a janky workaround because I couldn't get a uniform sampler2D array working
  //Returns shader code adjusted for the amount of images that are currently in the sourceImages array
  function getImageShaderFragCode(){
    let shaderCode = glsl`
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D uStitchImage;
    `;
    for(let i = 0; i<sourceImages.length; i++){
      shaderCode += glsl`uniform sampler2D uSourceImage`+i+`;\n`;
    }
    shaderCode+=glsl`
      void main(){
        vec4 threadID = texture2D(uStitchImage,vTexCoord);
        //if there's no thread there, bounce
        if(threadID.w < 1.0)
          return;
        int index = int(threadID.x * 255.0);
      `;
  
    for(let i = 0; i<sourceImages.length; i++){
      shaderCode += (i?`else if`:`if`)+glsl`(index == `+i+glsl`){
        gl_FragColor = texture2D(uSourceImage`+i+glsl`,vTexCoord);
        return;
      }`
    }
    shaderCode+= `\n}`;
    return shaderCode;
  }
  
  const stitchShaderVert = glsl`
  precision mediump float;
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  
  varying vec2 vTexCoord;
  
  void main(void) {
    vec4 positionVec4 = vec4(aPosition, 1.0);
    gl_Position = positionVec4;
    vTexCoord = aTexCoord;
  }
  `;
  
  const stitchShaderFrag = glsl`
  precision mediump float;
  
  varying vec2 vTexCoord;
  
  uniform sampler2D uStitchPattern;
  uniform sampler2D uVertStitches;
  uniform sampler2D uHorzStitches;
  uniform float uThreshold;
  
  void main(){
    vec4 stitch = texture2D(uStitchPattern,vTexCoord);
    vec4 color = vec4(1.0,0.0,0.0,1.0);
  
    vec4 vertColor = texture2D(uVertStitches,vTexCoord);
    vec4 horzColor = texture2D(uHorzStitches,vTexCoord);
  
    //if the stitch is black, and vertColor isn't transparent, use vertColor as the pixel color
    if(vertColor.a == 1.0 && stitch.r < uThreshold){
      color = vertColor;
    }
    //if the stitch is white, and horzColor isn't transparent, use it as the pixel color
    else if(horzColor.a == 1.0 && stitch.r >= uThreshold){
      color = horzColor;
    }
    //shadows
    else if(vertColor.a > 0.0 && vertColor.a<1.0 && stitch.r > uThreshold){
      color = vec4(horzColor.r - 0.4, horzColor.g - 0.4, horzColor.b - 0.4, 1.0);
    }
    //if both aren't the dominant stitch, combine 'em
    else{
      color = vertColor+horzColor;
    }
    gl_FragColor = color;
  }
  `;
  
  const imageMaskVert = glsl`
  precision mediump float;
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  
  varying vec2 vTexCoord;
  
  void main(void) {
    vec4 positionVec4 = vec4(aPosition, 1.0);
    gl_Position = positionVec4;
    vTexCoord = aTexCoord;
  }
  `;
  
  const imageMaskFrag = glsl`
  precision mediump float;
  
  varying vec2 vTexCoord;
  
  uniform sampler2D uStitchPattern;
  uniform sampler2D uImageMask;
  uniform float uThreshold;
  
  void main(){
    vec4 maskColor = texture2D(uImageMask,vTexCoord);
    //if the image mask is below the threshold
    if(maskColor.r < uThreshold){
      maskColor = texture2D(uStitchPattern,vTexCoord);
    }
    gl_FragColor = maskColor;
  }
  `;