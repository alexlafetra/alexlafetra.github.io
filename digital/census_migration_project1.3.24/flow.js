let decayValue = 0.1;
let lookAheadDistance = 2.5;

let dataTextureDimension = 150;

let NUMBER_OF_PARTICLES = 1000;

let dampValue = 0.002;
let flowScale = 3.0;
let randomScale = 0.0;
let particleAgeLimit = 0.8;
let diffusionStrength = 1.0;
let imageOpacity = 0;

let randomShader;

function fillFBOwithRandom(fbo,scale,seed){
    fbo.begin();
    shader(randomShader);
    randomShader.setUniform('uScale',scale);
    randomShader.setUniform('uRandomSeed',seed);
    quad(-1,-1,-1,1,1,1,1,-1);
    fbo.end();
}

class FlowField{
    constructor(points,mask){
        //Parameters
        this.particleCount = 1000;
        this.trailDecayValue = 0.1;
        this.pointSize = 0.6;
        this.opacity = 200;
        this.particleAgeLimit = 0.8;
        this.velDampValue = 0.002;

        this.showDataTextures = true;

        //Shaders
        this.updatePositionShader = createShader(updatePositionVert,updatePositionFrag);
        this.updateAgeShader = createShader(ageVert,ageFrag);
        this.updateVelShader = createShader(updateVelVert,updateVelFrag);

        //Texture Buffers
        this.ageTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.ageTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.positionTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.positionTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.velTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.velTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.flowFieldTexture = this.createFlowFieldFromPoints(points);
        this.trailLayer = createFramebuffer({width:width,height:height});
        this.trailBuffer = createFramebuffer({width:width,height:height,format:FLOAT});
        this.particleMask = mask;

        //set up the field
        this.reset();
    }
    createFlowFieldFromPoints(points){
        flowFieldBuffer.begin();
        shader(flowFieldShader);
        flowFieldShader.setUniform('uPoint1',[points[0].x,points[0].y]);
        flowFieldShader.setUniform('uPoint2',[points[1].x,points[1].y]);
        flowFieldShader.setUniform('uPoint3',[points[2].x,points[2].y]);
        flowFieldShader.setUniform('uPoint4',[points[3].x,points[3].y]);
        flowFieldShader.setUniform('uPoint5',[points[4].x,points[4].y]);
        rect(-width/2,-height/2,width,height);
        flowFieldBuffer.end();
        return flowFieldBuffer;
    }
    updatePos(){
        this.positionTextureBuffer.begin();
        shader(this.updatePositionShader);
        this.updatePositionShader.setUniform('uParticleVelTexture',this.velTexture);
        this.updatePositionShader.setUniform('uParticlePosTexture',this.positionTexture);
        this.updatePositionShader.setUniform('uDamp',dampValue);
        this.updatePositionShader.setUniform('uRandomScale',randomScale);
        this.updatePositionShader.setUniform('uTime',millis()%3000);
        this.updatePositionShader.setUniform('uAgeLimit',particleAgeLimit);
        this.updatePositionShader.setUniform('uParticleAgeTexture',this.ageTexture);
        this.updatePositionShader.setUniform('uParticleTrailTexture',this.trailLayer);
        this.updatePositionShader.setUniform('uParticleMask',this.particleMask);
        quad(-1,-1,1,-1,1,1,-1,1);//upside down bc the textures get flipped
        this.positionTextureBuffer.end();
        [this.positionTexture,this.positionTextureBuffer] = [this.positionTextureBuffer,this.positionTexture];
    }
    updateVel(){
        this.velTextureBuffer.begin();
        shader(this.updateVelShader);
        this.updateVelShader.setUniform('uParticleVel',this.velTexture);
        this.updateVelShader.setUniform('uParticlePos',this.positionTexture);
        this.updateVelShader.setUniform('uFlowFieldTexture',this.flowFieldTexture);
        quad(-1,-1,1,-1,1,1,-1,1);//upside down bc the textures get flipped
        this.velTextureBuffer.end();
        [this.velTexture,this.velTextureBuffer] = [this.velTextureBuffer,this.velTexture];

    }
    updateAge(){
        this.ageTextureBuffer.begin();
        shader(this.updateAgeShader);
        this.updateAgeShader.setUniform('uAgeLimit',particleAgeLimit);
        this.updateAgeShader.setUniform('uAgeTexture',this.ageTexture);
        quad(-1,-1,1,-1,1,1,-1,1);//upside down bc the textures get flipped
        this.ageTextureBuffer.end();
        [this.ageTexture,this.ageTextureBuffer] = [this.ageTextureBuffer,this.ageTexture];
    }
    reset(){
        let r = random();
        fillFBOwithRandom(this.positionTexture,1.0,r);
        fillFBOwithRandom(this.positionTextureBuffer,1.0,r);
        let r1 = random();
        fillFBOwithRandom(this.ageTexture,particleAgeLimit,r1);
        fillFBOwithRandom(this.ageTextureBuffer,particleAgeLimit,r1);
        let r2 = random();
        fillFBOwithRandom(this.velTexture,1.0,r2);
        fillFBOwithRandom(this.velTextureBuffer,1.0,r2);
    }
    render(){
        //swap buffers
        [this.trailBuffer,this.trailLayer] = [this.trailLayer,this.trailBuffer];


        this.trailLayer.begin();
        //clear the buffer and draw the previous trails
        clear();
        image(this.trailBuffer,-width/2,-height/2,width,height);
        //fade the trails
        background(255,decayValue*255);

        //draw points
        this.positionTexture.loadPixels();
        strokeWeight(this.pointSize);
        stroke(0);
        for(let i = 0; i<min(NUMBER_OF_PARTICLES,this.positionTexture.pixels.length/4); i++){
            let x = this.positionTexture.pixels[i*4];
            let y = this.positionTexture.pixels[i*4+1];
            point(x*width-width/2,y*height-height/2);
        }
        this.trailLayer.end();
        //draw the trail layer to the main canvas
        image(this.trailLayer,-width/2,-height/2,width,height);
        if(this.showDataTextures){
            image(this.flowFieldTexture,-width/2,-height/2,width/8,height/8);
            image(this.velTexture,-3*width/8,-height/2,width/8,height/8);
            image(this.positionTexture,-width/4,-height/2,width/8,height/8);
            image(this.particleMask,-width/8,-height/2,width/8,height/8);
        }
    }
    update(){
        this.updatePos();
        this.updateVel();
        this.updateAge();
    }
}
const updateVelVert = `
precision highp float;

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
const updateVelFrag =`
precision highp float;
precision highp sampler2D;

uniform sampler2D uParticleVel;
uniform sampler2D uParticlePos;
uniform sampler2D uFlowFieldTexture;

varying vec2 vParticleCoord;

void main(){
    vec4 screenPosition = texture2D(uParticlePos,vParticleCoord);
    vec4 oldVel = texture2D(uParticleVel,vParticleCoord);
    vec4 theta = texture2D(uFlowFieldTexture,screenPosition.xy);
    vec2 vel = 0.5*vec2(theta.x,theta.y)+0.5*vec2(oldVel.x,oldVel.y);
    gl_FragColor = vec4(vel,1.0,1.0);
}
`;
const randomFrag = `
precision mediump float;

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

const defaultVert = `
precision highp float;

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

const ageVert = `
precision highp float;

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

const ageFrag = `
precision highp float;
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

const updatePositionVert = `
precision highp float;

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

const updatePositionFrag = `
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

varying vec2 vParticleCoord;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

vec4 wrap(vec4 v, float minVal, float maxVal){
    if(v.x<minVal)
        v.x = maxVal;
    if(v.x>=maxVal)
        v.x = minVal;
    if(v.y<minVal)
        v.y = maxVal;
    if(v.y>=maxVal)
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
        // vec2 newPos = vec2(random(vParticleCoord*uTime),random(vParticleCoord/uTime));
        // gl_FragColor = vec4(newPos.xy,1.0,1.0);
        texturePosition.x = random(vParticleCoord*uTime);
        texturePosition.y = random(vParticleCoord/uTime);
        // return;
    }

    //getting the velocity
    vec4 textureVelocity = texture2D(uParticleVelTexture,vParticleCoord);
    //getting the random vel
    vec4 randomForce = vec4(sin(random(texturePosition.xx)),cos(random(texturePosition.yy)),1.0,1.0);
    //creating the new position
    vec4 newPos = texturePosition + uDamp*(normalize(textureVelocity) + randomForce*uRandomScale);
    
    //checking to see if it's within the mask
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
    }
    gl_FragColor = wrap(newPos,0.0,1.0);    //wrapping bounds
}
`;