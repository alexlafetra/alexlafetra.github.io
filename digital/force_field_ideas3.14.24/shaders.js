
//Shaders!

//Identity function so I can tag string literals with the glsl marker
const glsl = x => x;

const updateVelVert = glsl`
precision highp float;
precision highp sampler2D;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vParticleCoord;

void main(){
    // //passing aTexCoord into the frag shader
    vParticleCoord = aTexCoord;
    vec2 positionVec2 = aPosition.xy;
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(positionVec2,aPosition.z,1.0);
}
`;

const updateVelFrag = glsl`

precision highp float;
precision highp sampler2D;

uniform sampler2D uParticleVel;
uniform sampler2D uParticlePos;
uniform sampler2D uFlowFieldTexture;

uniform float uForceStrength;

varying vec2 vParticleCoord;

void main(){
    //Get position in clip space
    vec4 screenPosition = texture2D(uParticlePos,vParticleCoord);
    //Get current velocity
    vec4 oldVel = texture2D(uParticleVel,vParticleCoord);
    //Get the acceleration/force from the flow field texture
    vec4 flowForce = texture2D(uFlowFieldTexture,screenPosition.xy);
    //Recombine the attractor/repulsor forces
    vec2 newVel = vec2(flowForce.x+flowForce.z,flowForce.y+flowForce.w);

    gl_FragColor = vec4(newVel,1.0,1.0);
}
`;

const randomFrag = glsl`

precision highp float;
precision highp sampler2D;

varying vec2 vParticleCoord;
uniform float uRandomSeed;
uniform float uScale;

//taken from the lovely https://thebookofshaders.com/10/
float random(vec2 coord, float seed){
    return fract(sin(dot(coord.xy,vec2(22.9898-seed,78.233+seed)))*43758.5453123*seed);
}

void main(){
    gl_FragColor = vec4(random(vParticleCoord,1.0+uRandomSeed)*uScale,random(vParticleCoord,2.0+uRandomSeed)*uScale,random(vParticleCoord,0.0+uRandomSeed)*uScale,1.0);
}
`;

const defaultVert = glsl`
precision highp float;
precision highp sampler2D;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vParticleCoord;

void main(){
    // //passing aTexCoord into the frag shader
    vParticleCoord = aTexCoord;
    vec2 positionVec2 = aPosition.xy * 2.0 - 1.0;
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(positionVec2,aPosition.z,1.0);
}
`;

const ageVert = glsl`
precision highp float;
precision highp sampler2D;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vTexCoord;

void main(){
    //passing aTexCoord into the frag shader
    vTexCoord = aTexCoord;
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(aPosition,1.0);
}
`;

const ageFrag = glsl`
precision highp float;
precision highp sampler2D;

uniform vec2 uDimensions;
uniform float uAgeLimit;
varying vec2 vTexCoord;

uniform sampler2D uAgeTexture;
void main(){
    float increment = 0.01;
    vec4 currentAge = texture2D(uAgeTexture,vTexCoord);
    // //if you're too old, set age to 0 (at this point, the position should be reset by the pos shader)
    if(currentAge.x > uAgeLimit)
        gl_FragColor = vec4(0.0,0.0,0.0,1.0);
    else
        gl_FragColor = vec4(currentAge.x+increment,currentAge.x+increment,currentAge.x+increment,1.0);
}
`;

const updatePositionVert = glsl`
precision highp float;
precision highp sampler2D;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform vec2 uResolution;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vParticleCoord;

void main(){
    //passing aTexCoord into the frag shader
    vParticleCoord = vec2(aTexCoord.x,aTexCoord.y);
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(aPosition,1.0);
}
`;

const updatePositionFrag = glsl`
precision highp float;
precision highp sampler2D;

uniform sampler2D uParticleVelTexture;
uniform sampler2D uParticlePosTexture;
uniform sampler2D uParticleAgeTexture;
uniform sampler2D uParticleMask;

uniform float uDamp;
uniform float uRandomScale;
uniform float uTime;
uniform float uAgeLimit;
uniform bool uUseMaskTexture;

varying vec2 vParticleCoord;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

float wrap(float val){
    if(val>1.0){
        return val-1.0;
    }
    if(val<0.0){
        return val+1.0;
    }
    return val;
}

void main(){
    //getting the particle position
    vec4 texturePosition = texture2D(uParticlePosTexture,vParticleCoord);

    //checking the age of the particle
    vec4 textureAge = texture2D(uParticleAgeTexture,vParticleCoord);
    bool died = false;
    //if it's too old, put it somewhere random (within the mask) and return
    if(textureAge.x > uAgeLimit){
        texturePosition.x = random(texturePosition.xy);
        texturePosition.y = random(texturePosition.xy);
        died = true;
    }

    //getting the velocity
    vec4 textureVelocity = texture2D(uParticleVelTexture,vParticleCoord);
    //getting the random vel
    if(uRandomScale>0.0){
        textureVelocity += uRandomScale*vec4(random(texturePosition.xx)-0.5,random(texturePosition.yy)-0.5,1.0,1.0);
    }

    //creating the new position (for some reason, you gotta do it like this)
    vec4 newPos = vec4(texturePosition.x+uDamp*(textureVelocity.x),texturePosition.y+uDamp*(textureVelocity.y),1.0,1.0);
    //checking to see if it's within the mask
    if(uUseMaskTexture){
        float val = texture2D(uParticleMask,newPos.xy).x;
        if(val<0.5){
            //try to place the particle 100 times
            for(int i = 0; i<100; i++){
                vec2 replacementPos = vec2(random(vParticleCoord*uTime),random(vParticleCoord/uTime));
                // val = texture2D(uParticleMask,replacementPos).x;
                val = texture2D(uParticleMask,replacementPos).x;
                if(val>0.5){
                    gl_FragColor = vec4(replacementPos.xy,1.0,1.0);
                    return;
                }
            }
            return;
        }
    }
    //wrapping bounds
    newPos.x = wrap(newPos.x);
    newPos.y = wrap(newPos.y);
    newPos.z = wrap(newPos.z);
    newPos.w = wrap(newPos.w);
    gl_FragColor = newPos;
}
`;

const drawParticlesVS = glsl`
//attribute that we pass in using an array, to tell the shader which particle we're drawing
attribute float id;
uniform sampler2D uPositionTexture;
uniform sampler2D uColorTexture;

uniform vec2 uTextureDimensions;
uniform mat4 uMatrix;
uniform float uParticleSize;

varying vec4 vColor;

vec4 getValueFrom2DTextureAs1DArray(sampler2D tex, vec2 dimensions, float index) {
  float y = floor(index / dimensions.x);
  float x = mod(index, dimensions.x);
  vec2 texcoord = (vec2(x, y) + 0.5) / dimensions;
  return texture2D(tex, texcoord);
}

void main() {
    // pull the position from the texture
    vec4 position = getValueFrom2DTextureAs1DArray(uPositionTexture, uTextureDimensions, id);
    //use the position to get the flow value
    vColor = texture2D(uColorTexture,position.xy);
    gl_Position = vec4(position.x,position.y,1.0,1.0)-vec4(0.5);
    gl_PointSize = uParticleSize;
}
`;

const drawParticlesFS = glsl`
precision highp float;
varying vec4 vColor;

uniform vec4 uRepulsionColor;
uniform vec4 uAttractionColor;
void main() {
    float valA = length(vec2(vColor.x,vColor.y));
    float valR = length(vec2(vColor.z,vColor.w));
    float val = (valA-valR)+valR/2.0;
    // gl_FragColor = mix(uRepulsionColor,uAttractionColor,val);
    gl_FragColor = uAttractionColor;
}
`;

//Creating the flow field from a series of points
const repulsorDistanceFrag = glsl`
precision mediump float;

varying vec2 vTexCoord;

uniform vec3 uRepulsors[`+NUMBER_OF_ATTRACTORS+glsl`];

// uniform float uThreshold;

void main(){
    float repulsion = 0.0;
    float threshold = 80.0;
    //calculate attractors/repulsors
    for(int i = 0; i<`+NUMBER_OF_ATTRACTORS+glsl`; i++){
        float dR = distance(uRepulsors[i].xy,vTexCoord);
        // repulsion+=uRepulsors[i].z/(dR*dR);
        repulsion+=1.0/(dR*dR);
    }
    repulsion/=`+NUMBER_OF_ATTRACTORS+glsl`.0;
    if(repulsion > threshold)
        gl_FragColor = vec4(1.0);
    else
        gl_FragColor = vec4(0.0,0.0,0.0,1.0);
}
`;

//Creating the flow field from a series of points
const flowMapFrag = glsl`
precision mediump float;

varying vec2 vTexCoord;

uniform vec3 uAttractors[`+NUMBER_OF_ATTRACTORS+glsl`];
uniform vec3 uRepulsors[`+NUMBER_OF_ATTRACTORS+glsl`];

uniform float uAttractionStrength;
uniform float uRepulsionStrength;

void main(){
    vec2 attraction = vec2(0.0);
    vec2 repulsion = vec2(0.0);
    //calculate attractors/repulsors
    for(int i = 0; i<`+NUMBER_OF_ATTRACTORS+glsl`; i++){
        //add a vector pointing toward the attractor from this pixel
        //scaled by the inverse square of the distance AND the scale factor
        float dA = distance(uAttractors[i].xy,vTexCoord);
        attraction+=uAttractionStrength*(uAttractors[i].z)*(uAttractors[i].xy-vTexCoord)/(dA*dA);

        //the reuplsion force points AWAY from the repulsor point
        float dR = distance(uRepulsors[i].xy,vTexCoord);
        repulsion+=uRepulsionStrength*(uRepulsors[i].z)*(vTexCoord-uRepulsors[i].xy)/(dR*dR);
    }
    attraction/=`+NUMBER_OF_ATTRACTORS+glsl`.0;
    repulsion/=`+NUMBER_OF_ATTRACTORS+glsl`.0;
    //Storing both attraction and repulsion in the same texture
    gl_FragColor = vec4(attraction.x,attraction.y,repulsion.x,repulsion.y);

    // gl_FragColor = vec4(attraction.x,attraction.y,repulsion.x,0.5*(repulsion.y+2.0));
    //^^ use this one if you want to render it to a texture! prevents alpha channnel from clipping
}
`;

const flowMapVert = glsl`
precision mediump float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vTexCoord;

void main(){
    // //passing aTexCoord into the frag shader
    vTexCoord = aTexCoord;
    vec2 positionVec2 = aPosition.xy * 2.0 - 1.0;
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(positionVec2,aPosition.z,1.0);
}
`;

const noiseFieldVert = glsl`
precision mediump float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vTexCoord;

void main(){
    // //passing aTexCoord into the frag shader
    vTexCoord = aTexCoord;
    vec2 positionVec2 = aPosition.xy * 2.0 - 1.0;
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(positionVec2,aPosition.z,1.0);
}
`;


const noiseFieldFrag = glsl`
precision mediump float;

varying vec2 vTexCoord;

uniform float uTime;
//
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/stegu/webgl-noise
//

vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
//   return mod289(((x*34.0)+10.0)*x);
return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec3 P)
{
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

void main(){
    gl_FragColor = vec4(cnoise(vec3(vTexCoord.xy,uTime*100.0)));
    gl_FragColor.z = 0.0;
    gl_FragColor.w = 0.0;
    // gl_FragColor = vec4(1.0);
}
`;