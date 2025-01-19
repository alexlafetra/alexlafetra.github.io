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

function preload(){
  // tex = loadImage('render_tileset.png');
  // nTex = loadImage('normal.png');
  tex = loadImage('tamo/tamo_scene.png');
  nTex = loadImage('tamo/tamo_vectors_2.png');
}
function setup(){
  mainShader = createShader(shaderVert,shaderFrag);
  createCanvas(500,500,WEBGL);
}

function mousePressed(){
  console.log(tex);
}

function draw(){
  background(255);
  shader(mainShader);
  mainShader.setUniform('uTexture',tex);
  mainShader.setUniform('uVelTexture',nTex);
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
uniform sampler2D uVelTexture;

vec2 getOffsetCoords(float i){
  i = clamp(i,0.0,15.0);
  return (vTexCoord + vec2(mod(floor(i),4.0),floor(floor(i)/4.0)))/4.0;
}


vec2 getDisplacement(float i){
  vec4 color = texture2D(uVelTexture,getOffsetCoords(i));
  return -0.01*(color.xy);
}

void main(){
  //int(16.0 * uMouse) = which image in a LINEAR array you should grab
  float index = mix(1.0,15.0,uMouse);
  //amount to blend between the two images
  float blend = fract(index);
  // vec4 texColor = texture2D(uTexture,getOffsetCoords(index));
  // vec4 nextTexColor = texture2D(uTexture,getOffsetCoords(index+1.0));

  vec4 texColor = texture2D(uTexture,getOffsetCoords(index)-getDisplacement(index).xy*blend);
  vec4 nextTexColor = texture2D(uTexture,getOffsetCoords(index+1.0)+getDisplacement(index+1.0).xy*(1.0-blend));
  gl_FragColor = mix(texColor,nextTexColor,blend);
  // gl_FragColor = texColor;
  // gl_FragColor = nextTexColor;



  // vec4 color = getDisplacementTexture(index);
  // gl_FragColor = getDisplacementTexture(index);
  // gl_FragColor = texColor;
  // gl_FragColor = displacement;
  // gl_FragColor = texture2D(uPosition,vTexCoord);
}
`;