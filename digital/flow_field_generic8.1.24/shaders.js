
//Shaders!

//Identity function so I can tag string literals with the glsl marker
const glsl = x => x;


/*

Shader that fades the alpha channel of all pixels

*/

const fadeToTransparentVert = glsl`
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
    gl_Position = vec4(aPosition,1.0);//translate it into screen space coords
}
`;
const fadeToTransparentFrag = glsl`
precision highp float;
precision highp sampler2D;

uniform float uFadeAmount; //a percentage/decimal number that the alpha value is multiplied by
uniform sampler2D uSourceImage;

varying vec2 vTexCoord;

void main(){
    vec4 currentColor = texture2D(uSourceImage,vTexCoord);
    currentColor.a -= uFadeAmount;
    if(currentColor.a < 0.01){
        discard;
    }
    gl_FragColor = currentColor;
}
`;


/*

fills a texture with random noise (used for initializing the simulation)

*/

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
    gl_FragColor = vec4(random(vParticleCoord,1.0+uRandomSeed)*uScale,random(vParticleCoord,2.0+uRandomSeed)*uScale,random(vParticleCoord,0.0+uRandomSeed)*uScale,random(vParticleCoord,3.0+uRandomSeed)*uScale);
}
`;

/*

Increases particle age, or resets it if the particle is too old

*/

const updateParticleAgeVert = glsl`
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

const updateParticleAgeFrag = glsl`
precision highp float;
precision highp sampler2D;

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

const updateParticleDataVert = glsl`
precision highp float;
precision highp sampler2D;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vParticleCoord;

void main(){
    //passing aTexCoord into the frag shader
    vParticleCoord = aTexCoord;
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(aPosition,1.0);
}
`;

const updateParticleDataFrag = glsl`
precision highp float;
precision highp sampler2D;

uniform sampler2D uFlowFieldTexture;
uniform sampler2D uParticleDataTexture;
uniform sampler2D uParticleAgeTexture;
uniform sampler2D uParticleMask;
uniform sampler2D uInitialData;

uniform float uDamp;
uniform float uRandomScale;
uniform float uTime;
uniform float uAgeLimit;
uniform float uFieldStrength;
uniform bool uUseMaskTexture;
uniform bool uMouseInteraction;
uniform bool uResetToInitialData;

uniform vec2 uMousePosition;

varying vec2 vParticleCoord;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

void main(){
    //getting the particle data
    vec4 particleData =  texture2D(uParticleDataTexture,vParticleCoord);
    vec2 screenPosition = particleData.xy;//position data is stored in the r,g channels
    vec2 particleVelocity = particleData.zw;//velocity data is stored in the b,a channels
    if(uMouseInteraction){
        float dM = distance(screenPosition,uMousePosition);
        particleVelocity += (screenPosition-uMousePosition)/(20.0*dM*dM);
    }

    //checking the age of the particle
    vec4 textureAge = texture2D(uParticleAgeTexture,vParticleCoord);

    //if it's too old, put it somewhere random (within the mask) and return
    if(textureAge.x > uAgeLimit){
        if(uResetToInitialData){
            vec4 initialData = texture2D(uInitialData,vParticleCoord);//use this for looping
            screenPosition = initialData.xy;
            particleVelocity = initialData.zw;
        }
        else{
            screenPosition = vec2(random(screenPosition.xy),random(screenPosition.yx));
        }
    }
    //getting the random vel
    if(uRandomScale>0.0){
        particleVelocity += uRandomScale*vec2(random(screenPosition.xx)-0.5,random(screenPosition.yy)-0.5);
    }

    vec4 flowForce =  texture2D(uFlowFieldTexture,screenPosition);
    // vec2 newVelocity = vec2(flowForce.x+flowForce.z+particleVelocity.x*(1.0-uFieldStrength),flowForce.y+flowForce.w+particleVelocity.y*(1.0-uFieldStrength));
    // vec2 newVelocity = vec2(flowForce.x+flowForce.z,flowForce.y+flowForce.w);
    vec2 newVelocity = vec2(flowForce.x+flowForce.z+particleVelocity.x*(1.0-uFieldStrength),flowForce.y+flowForce.w+particleVelocity.y*(1.0-uFieldStrength));


    //creating the new position (for some reason, you gotta do it like this)
    vec2 newPos = uDamp*particleVelocity+screenPosition;

    //checking to see if it's within the mask
    if(uUseMaskTexture){
        float val = texture2D(uParticleMask,newPos).x;
        if(val<0.5){
            //try to place the particle 100 times
            for(int i = 0; i<100; i++){
                vec2 replacementPos = vec2(random(vParticleCoord.yx*sin(uTime)),random(vParticleCoord.xy/sin(uTime)));
                val = texture2D(uParticleMask,replacementPos).x;
                if(val>0.5){
                    gl_FragColor = vec4(replacementPos,newVelocity);
                    return;
                }
            }
            return;
        }
    }
    //you actually don't need to wrap bounds b/c of the particle age decay
    gl_FragColor = vec4(newPos,newVelocity);
}
`;

/*

*/
const drawParticlesVS = glsl`
precision highp float;
precision highp sampler2D;
//attribute that we pass in using an array, to tell the shader which particle we're drawing
attribute float particleID;
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
    vec4 position = getValueFrom2DTextureAs1DArray(uPositionTexture, uTextureDimensions, particleID);
    //use the position to get the flow value
    vColor = texture2D(uColorTexture,position.xy);
    gl_Position = vec4(position.xy,1.0,1.0)-vec4(0.5);
    gl_PointSize = uParticleSize;
}
`;

const drawParticlesFS = glsl`
precision highp float;
varying vec4 vColor;
uniform vec4 uRepulsionColor;
uniform vec4 uAttractionColor;

//borrowed from: https://gist.github.com/companje/29408948f1e8be54dd5733a74ca49bb9
float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}
/*

just some thots:
colors look weird bc when a particle is evenly pulled on by attractors, exor repulsors,
the magnitude of the respective force is very small. This means that even tho a particle
might be much closer to and more 'influenced' by a group of attractors, because it's 
being evenly pulled around by them even ONE external rep/attractor can outweigh the big group of
nodes nearby. Not sure how to best deal with this! The good news is that it looks pretty good as-is.

I think ideally you would recalculate the influence of attractors and repulsors by just adding up the magnitude of nodes/d^2,
and not letting opposing forces cancel out, but that's kind of expensive for just an aesthetic difference.
You could also write that data to another texture, but again, kind of expensive.
*/
void main() {
    float valA = abs(length(vec2(vColor.x,vColor.y)));//magnitude of attraction force
    float valR = abs(length(vec2(vColor.z,vColor.w)));//magnitude of repulsion force
    // float val = (valA-valR)+valR/2.0;
    // float val = (valA - 1.5*valR)/2.0+1.0;
    // float val = valA/(valR);
    // float val = map(0.5,valA,-valR,0.0,1.0);
    // float val = map((valA-valR)/2.0,valA,-valR,1.0,0.0);
    float val = valA - valR;
    val = map(val,-1.0,0.5,0.0,1.0);
    // val = val*val/2.0;
    gl_FragColor = mix(uRepulsionColor,uAttractionColor,val);}
`;

//Creating the flow field from a series of points
const calculateFlowFieldFrag = glsl`
precision highp float;

varying vec2 vTexCoord;

uniform vec3 uAttractors[`+NUMBER_OF_ATTRACTORS+glsl`];//array holding all the attractors as [x,y,strength]
uniform vec3 uRepulsors[`+NUMBER_OF_ATTRACTORS+glsl`];//array holding all the repulsors as [x,y,strength]

uniform float uAttractionStrength;//attractor strength
uniform float uRepulsionStrength;//repulsor strength

uniform float uDimensions;//dimensions of mainCanvas

void main(){
    vec2 attraction = vec2(0.0);
    vec2 repulsion = vec2(0.0);
    //calculate attractors/repulsors
    for(int i = 0; i<`+NUMBER_OF_ATTRACTORS+glsl`; i++){
        vec2 attractorCoord = vec2(uAttractors[i].x,uAttractors[i].y);
        vec2 repulsorCoord = vec2(uRepulsors[i].x,uRepulsors[i].y);
        //add a vector pointing toward the attractor from this pixel
        //scaled by the inverse square of the distance AND the scale factor
        float dA = distance(attractorCoord,vTexCoord);
        attraction += uAttractionStrength * uAttractors[i].z * (attractorCoord-vTexCoord) / (dA*dA);
        //the repulsion force points AWAY from the repulsor point
        float dR = distance(repulsorCoord,vTexCoord);
        repulsion += uRepulsionStrength * uRepulsors[i].z * (vTexCoord-repulsorCoord) / (dR*dR);
    }
    attraction /= `+NUMBER_OF_ATTRACTORS+glsl`.0;
    repulsion /= `+NUMBER_OF_ATTRACTORS+glsl`.0;
    //Storing both attraction and repulsion in the same texture
    gl_FragColor = vec4(attraction,repulsion);

    // gl_FragColor = vec4(attraction,repulsion.x,0.5*(repulsion.y+2.0));
    //^^ Prevents alpha channel from clipping -- use this if you want to save the flow field to a texture!
}
`;

const calculateFlowFieldVert = glsl`
precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vTexCoord;

void main(){
    // //passing aTexCoord into the frag shader
    vTexCoord = aTexCoord;
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(aPosition*2.0-1.0,1.0);//translate it into screen space coords
}
`;