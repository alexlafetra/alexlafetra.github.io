//This shader samples the flow data and updates the velocity data
//Vectors are stored offset by 0.5, so '-1' is 0.0 and 1 is 1.0

precision highp float;

//texture coordinates received from vert shader
varying vec2 vTexCoord;

uniform sampler2D uFlowTexture;
uniform sampler2D uVelocityTexture;
uniform sampler2D uPositionTexture;
uniform vec2 uMousePos;
uniform float uExitRadius;

// uniform vec2 uResolution;

// uniform vec2 uMouse;
// uniform bool uMouseHeld;
// uniform mediump float uBrushRadius;

uniform float uDampForce;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}


//offsetting the -velocities by 0.5 is causing a lot of weird behavior
//maybe use two textures for vel? one for negative, one for positive? or use the w component?

//velocity is written to textures as 0.0 - 1.0 value, so as soon as it leaves the texture
//space it should be offset by -0.5
//DON'T normalize it before adding 0.5 to it

void main() {
  //get the current position by sampling from the pos texture
  vec4 currentPos = texture2D(uPositionTexture,vTexCoord.xy);

  //use the position to get the force at that position
  vec4 flowForce = texture2D(uFlowTexture,currentPos.xy)-0.5;
  vec4 mouseForce = vec4(currentPos.x + uMousePos.x,-currentPos.y + uMousePos.y,1.0,1.0);
  // vec4 mouseForce = vec4(0.0);

  //force pushing them towards the center of the screen
  vec4 centerForce = vec4(0.0);
  if(distance(currentPos.xy,vec2(0.5,0.5))>uExitRadius){
    centerForce = vec4(0.5)-currentPos;
  }

  vec4 randomForce = vec4(rand(currentPos.xy));

  vec4 force = centerForce+randomForce;
  force = force*uDampForce;

  //get the vel so you can update it
  vec4 currentVel = texture2D(uVelocityTexture,vTexCoord.xy)-0.5;
  //write the new vel
  vec4 newVel = vec4(currentVel+force)+0.5;
  newVel = normalize(newVel);
  gl_FragColor = newVel;
}