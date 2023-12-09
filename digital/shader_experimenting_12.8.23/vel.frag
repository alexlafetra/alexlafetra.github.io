//This shader samples the flow data and updates the velocity data
//Vectors are stored offset by 0.5, so '-1' is 0.0 and 1 is 1.0

precision highp float;

//texture coordinates received from vert shader
varying vec2 vTexCoord;

uniform sampler2D uFlowTexture;
uniform sampler2D uVelocityTexture;
uniform sampler2D uPositionTexture;

// uniform vec2 uResolution;

// uniform vec2 uMouse;
// uniform bool uMouseHeld;
// uniform mediump float uBrushRadius;

uniform mediump float uDampForce;

void main() {
  //get the current position by sampling from the pos texture
  vec4 currentPos = texture2D(uPositionTexture,vTexCoord.xy);
  //use the position to get the force at that position
  vec4 force = texture2D(uFlowTexture,currentPos.xy);
  //get the vel so you can update it
  vec4 currentVel = texture2D(uVelocityTexture,vTexCoord.xy);
  //write the new vel
  vec4 newVel = vec4(currentVel.x+uDampForce*(force.x-0.5),currentVel.y+uDampForce*(force.y-0.5),currentVel.z+uDampForce*(force.z-0.5),currentVel.w+uDampForce*(force.w-0.5));
  gl_FragColor = newVel;
  // gl_FragColor = vec4(0.0);
}