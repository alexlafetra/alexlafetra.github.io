/*

Implementing the 3D effect from https://buttermax.net/
Following along with:
https://www.youtube.com/watch?v=yWy_Tr98YDc

*/

let mainShader;
let tex;
let pTex;
let nTex;
let displacementSlider;
let displacementTexCanvas;

function preload(){
  tex = loadImage('render_tileset.png');
  nTex = loadImage('normal.png');
}
function setup(){
  mainShader = createShader(shaderVert,shaderFrag);
  createCanvas(500,500,WEBGL);
  displacementTexCanvas = createFramebuffer({width:1080*2,height:1080*2,format:FLOAT,textureFiltering:NEAREST});
  displacementTexCanvas.begin();
  image(nTex,-displacementTexCanvas.width/2,-displacementTexCanvas.height/2,displacementTexCanvas.width,displacementTexCanvas.height);
  displacementTexCanvas.end();

}

function mousePressed(){
  console.log(tex);
}

function draw(){
  background(255);
  shader(mainShader);
  mainShader.setUniform('uTexture',tex);
  mainShader.setUniform('uPosition',displacementTexCanvas);
  mainShader.setUniform('uDisplacementStrength',mouseY/height);
  mainShader.setUniform('uMouse',1-mouseX/width);
  quad(-1,1,1,1,1,-1,-1,-1);
}

const glsl = x => x;

const shaderVert = glsl`

varying vec2 vTexCoord;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

void main(){
  vTexCoord = aTexCoord;
  gl_Position = vec4(aPosition,1.0);
}

`

const shaderFrag = glsl`
precision mediump float;
precision highp sampler2D;

varying vec2 vTexCoord;

uniform float uMouse;
uniform float uDisplacementStrength;

uniform sampler2D uTexture;
uniform sampler2D uPosition;

vec2 getOffsetCoords(float i){
  i = clamp(i,0.0,15.0);
  return (vTexCoord + vec2(mod(floor(i),4.0),floor(floor(i)/4.0)))/4.0;
}

vec2 getDisplacement(float i){
  vec4 currentPos = texture2D(uPosition,getOffsetCoords(i));
  vec4 nextPos = texture2D(uPosition,getOffsetCoords(i+1.0));
  return uDisplacementStrength*(currentPos.yz-nextPos.yz);
}

vec4 getDisplacementTexture(float i){
  vec4 currentPos = texture2D(uPosition,getOffsetCoords(i));
  vec4 nextPos = texture2D(uPosition,getOffsetCoords(i+1.0));
  vec4 dispTex = uDisplacementStrength*(currentPos-nextPos);

  //don't forget to set the alpha to 1 if u wanna see it!
  dispTex.a = 1.0;
  return dispTex;
}


void main(){
  //int(16.0 * uMouse) = which image in a LINEAR array you should grab
  float index = mix(1.0,15.0,uMouse);
  float blend = fract(index);


  // vec4 texColor = texture2D(uTexture,getOffsetCoords(index)-getDisplacement(index)/16.0*blend);
  // vec4 nextTexColor = texture2D(uTexture,getOffsetCoords(index+1.0)+getDisplacement(index+1.0)/16.0*(1.0-blend));


  vec4 texColor = texture2D(uTexture,getOffsetCoords(index));
  vec4 nextTexColor = texture2D(uTexture,getOffsetCoords(index+1.0));

  gl_FragColor = mix(texColor,nextTexColor,blend);
  // vec4 color = getDisplacementTexture(index);
  // gl_FragColor = texColor;
  // gl_FragColor = displacement;
  // gl_FragColor = texture2D(uPosition,vTexCoord);
}
`;