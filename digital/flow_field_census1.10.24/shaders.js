
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
uniform float uFriction;

varying vec2 vParticleCoord;

void main(){
    //Get position in clip space
    vec4 screenPosition = texture2D(uParticlePos,vParticleCoord);
    //Get current velocity
    vec4 oldVel = texture2D(uParticleVel,vParticleCoord);
    //Get the acceleration/force from the flow field texture
    vec4 flowForce = texture2D(uFlowFieldTexture,screenPosition.xy);
    //Add the force to the current vel
    vec2 newVel = uForceStrength*vec2(flowForce.x,flowForce.y)+(1.0-uForceStrength)*vec2(oldVel.x,oldVel.y);
    // vec2 newVel = uForceStrength*vec2(flowForce.x,flowForce.y)+(1.0-uFriction)*vec2(oldVel.x,oldVel.y);

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
    gl_Position = vec4(aPosition.xyz,1.0);
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
uniform bool uNormalizeVelocity;

varying vec2 vParticleCoord;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

vec4 wrap(vec4 v, float minVal, float maxVal){
    if(v.x<minVal)
        v.x = maxVal;
    if(v.x>maxVal)
        v.x = minVal;
    if(v.y<minVal)
        v.y = maxVal;
    if(v.y>maxVal)
        v.y = minVal;
    return v;
}

void main(){
    //getting the particle position
    vec4 texturePosition = texture2D(uParticlePosTexture,vParticleCoord);

    //checking the age of the particle
    vec4 textureAge = texture2D(uParticleAgeTexture,vParticleCoord);
    //if it's too old, put it somewhere random (within the mask) and return
    if(textureAge.x > uAgeLimit){
        texturePosition.x = random(texturePosition.xy);
        texturePosition.y = random(texturePosition.xy);
    }

    //getting the velocity
    vec4 textureVelocity = texture2D(uParticleVelTexture,vParticleCoord);
    //getting the random vel
    if(uRandomScale>0.0){
        // vec4 randomForce = vec4(sin(random(texturePosition.xx)),cos(random(texturePosition.yy)),1.0,1.0);
        textureVelocity += uRandomScale*vec4(sin(random(texturePosition.xx)),cos(random(texturePosition.yy)),1.0,1.0);
    }
    //creating the new position
    vec4 newPos = vec4(0.0);
    if(uNormalizeVelocity){
        newPos = texturePosition + uDamp*(normalize(textureVelocity));
    } 
    else{
        newPos = texturePosition + uDamp*(textureVelocity);
    }
    //checking to see if it's within the mask
    if(uUseMaskTexture){
        float val = texture2D(uParticleMask,newPos.xy).x;
        if(val<0.5){
            //try to place the particle 100 times
            for(int i = 0; i<100; i++){
                vec2 replacementPos = vec2(random(vParticleCoord*uTime),random(vParticleCoord/uTime));
                val = texture2D(uParticleMask,replacementPos).x;
                if(val>0.5){
                    gl_FragColor = vec4(replacementPos.xy,1.0,1.0);
                    return;
                }
            }
            return;
        }
    }

    gl_FragColor = wrap(newPos,0.0,1.0);    //wrapping bounds
}
`;


// NOTE: These two are written in 300 es GLSL!
//Read this: https://webgl2fundamentals.org/webgl/lessons/webgl1-to-webgl2.html

const renderPointsVert = glsl`#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uParticlePositionTextureture;
uniform int uTextureWidth;
uniform float uCanvasWidth;
uniform float uParticleSize;

out vec4 vData;
out vec4 vIndex;
out vec2 vTexCoords;

void main(){
    //get x,y coord of the data for this point, using the gl_VertexID
    int indexX = gl_VertexID%uTextureWidth;
    int indexY = gl_VertexID/uTextureWidth;

    vec2 coord = vec2(float(indexX)/float(uTextureWidth),float(indexY)/float(uTextureWidth));
    vTexCoords = coord;
    // vec2 coord = vec2(0.0,0.0);
    vec4 screenPosition = texture(uParticlePositionTextureture,coord);

    vData = screenPosition;
    vIndex = vec4(coord.x,coord.y,1.0,1.0);

    gl_Position = screenPosition;
    gl_PointSize = uParticleSize;
}
`;

const renderPointsFrag = glsl`#version 300 es

precision highp float;

out vec4 pixelColor;
in vec4 vData;
in vec4 vIndex;
in vec2 vTexCoords;

uniform sampler2D uPositionTestTexture;

void main(){
    // pixelColor = vec4(1.0);
    // pixelColor = vec4(vData.x,vData.y,vIndex.x,1.0);
    // pixelColor = vec4(vIndex.x,vIndex.y,1.0,1.0);
    pixelColor = texture(uPositionTestTexture,vTexCoords);
}
`;

const drawParticlesVS = glsl`
//attribute that we pass in using an array, to tell the shader which particle we're drawing
attribute float id;
uniform sampler2D uPositionTexture;
uniform sampler2D uVelocityTexture;
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
    // vColor  = getValueFrom2DTextureAs1DArray(uColorTexture, uTextureDimensions, id);
    vColor = texture2D(uColorTexture,position.xy);

    gl_Position = vec4(position.x,position.y,1.0,1.0)-vec4(0.5);
    gl_PointSize = uParticleSize;
}
`;

const drawParticlesFS = glsl`
precision highp float;
varying vec4 vColor;
void main() {
    // gl_FragColor = vec4(1.0);
    // gl_FragColor = vec4(1.0, 0.55, 0.0,1.0-vColor.x);
    // gl_FragColor = vec4(0.3)+vColor;
    gl_FragColor = vec4(vColor.xyz,1.0);
}
`;

//Creating the flow field from a series of points
const flowMapFrag = glsl`
precision mediump float;

varying vec2 vTexCoord;

uniform vec3 uAttractors[`+NUMBER_OF_ATTRACTORS+glsl`];
uniform vec3 uRepulsors[`+NUMBER_OF_ATTRACTORS+glsl`];

uniform float uStrengthEffect;

void main(){
    vec2 c = vec2(0.0);
    //calculate attractors/repulsors
    for(int i = 0; i<`+NUMBER_OF_ATTRACTORS+glsl`; i++){
        //add a vector pointing toward the attractor from this pixel
        //scaled by the inverse square of the distance AND the scale factor
        float dA = distance(uAttractors[i].xy,vTexCoord);
        c+=uAttractors[i].z*(uAttractors[i].xy-vTexCoord)/(dA*dA);
        // c+=(uAttractors[i].xy-vTexCoord)/(dA*dA);

        float dR = distance(uRepulsors[i].xy,vTexCoord);
        c+=uRepulsors[i].z*(-uRepulsors[i].xy+vTexCoord)/(dR*dR);
        // c+=(-uRepulsors[i].xy+vTexCoord)/(dR*dR);
    }
    c = normalize(c);

    gl_FragColor = vec4(c.x,c.y,1.0,1.0);
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