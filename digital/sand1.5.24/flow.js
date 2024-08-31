let dataTextureDimension = 800;
let randomShader;
let drawParticlesProgram;
let drawParticlesProgLocs;

/* PRESERVING MY CONFUSION FOR POSTERITY:
//I think my GL context is getting weirdly changed by the other shader draw calls
//I should try doing this in an isolated gl context, but i might have to specifically set it
//For 1 frame it draws the correct data... but then it's all messed up
//it seems to be drawing velocity and age data, depending on which is updated most recently
//The points are also colored correctly according to their ~incorrect~ positions, ie they're colored accurate
//to how they're displayed onscreen.
//This makes me think somehow the call to the position texture is what's getting messed up
//Maybe it's because you're using two different glsl languages? ES 100 and ES 300?
//okay, even weirder: the frag shader seems to be getting the right texture data (when coloring the pixels by texture)

--> basically, yeah. I needed to explicitly bind the new texture to the webGL renderer.
*/

function initGL(){
    drawParticlesProgram = webglUtils.createProgramFromSources(
        gl, [drawParticlesVS, drawParticlesFS]);
    drawParticlesProgLocs = {
        id: gl.getAttribLocation(drawParticlesProgram, 'id'),
        uPositionTexture: gl.getUniformLocation(drawParticlesProgram, 'uPositionTexture'),
        uTextureDimensions: gl.getUniformLocation(drawParticlesProgram, 'uTextureDimensions'),
        uMatrix: gl.getUniformLocation(drawParticlesProgram, 'uMatrix'),
    };
    ids = new Array(dataTextureDimension*dataTextureDimension).fill(0).map((_, i) => i);
    idBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, idBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ids), gl.STATIC_DRAW);
}

function fillFBOwithRandom(fbo,scale,seed){
    fbo.begin();
    shader(randomShader);
    randomShader.setUniform('uScale',scale);
    randomShader.setUniform('uRandomSeed',seed);
    quad(-1,-1,-1,1,1,1,1,-1);
    fbo.end();
}

class FlowField{
    constructor(mask,colors,flowFShader){
        //Parameters
        this.particleCount = 1000000;
        this.trailDecayValue = 1.0;
        this.pointSize = 0.6;
        this.particleAgeLimit = 150;
        this.velDampValue = 0.02;
        this.forceStrength = 0.1;
        this.randomAmount = 0.0;

        // this.particleColor = color(220,180,50);
        // this.backgroundColor = color(10,30,10);
        this.particleColor = color(170,0,0);
        this.backgroundColor = color(255,255,255);

        this.maskParticles = false;
        this.normalizeVelocity = false;
        this.showingData = false;
        this.attraction = true;
        this.repulsion = false;

        //Shaders
        this.updatePositionShader = createShader(updatePositionVert,updatePositionFrag);
        this.updateAgeShader = createShader(ageVert,ageFrag);
        this.updateVelShader = createShader(updateVelVert,updateVelFrag);
        this.pointShader = createShader(drawParticlesVS,drawParticlesFS);
        this.flowShader = flowFShader;

        //Texture Buffers
        this.ageTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.ageTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.uPositionTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.uPositionTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.velTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.velTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.flowFieldTexture = createFramebuffer({width:width,height:height});
        
        this.trailLayer = createFramebuffer({width:width,height:height,format:FLOAT});
        this.trailBuffer = createFramebuffer({width:width,height:height,format:FLOAT});

        this.particleMask = mask;
        if(colors)
            this.colorMap = colors;
        else
            this.colorMap = createFramebuffer({width:width,height:height,format:FLOAT});

        //set up the field
        initGL();

        this.resetParticles();
    }
    updateFlow(){
        this.flowFieldTexture.begin();
        shader(this.flowShader);
        //just a note: attractors and repulsors are FLAT arrays of x,y,strength values
        //Which means they're just a 1x(nx3) flat vector, not an nx3 multidimensional vector
        this.flowShader.setUniform('uAttractors',attractors);
        this.flowShader.setUniform('uRepulsors',repulsors);
        this.flowShader.setUniform('uAttraction',this.attraction);
        this.flowShader.setUniform('uRepulsion',this.repulsion);
        this.flowShader.setUniform('uMouse',[mouseX/width,mouseY/width]);
        rect(-width/2,-height/2,width,height);
        this.flowFieldTexture.end();
    }
    updatePos(){
        this.uPositionTextureBuffer.begin();
        shader(this.updatePositionShader);
        this.updatePositionShader.setUniform('uParticleVelTexture',this.velTexture);
        this.updatePositionShader.setUniform('uParticlePosTexture',this.uPositionTexture);
        this.updatePositionShader.setUniform('uDamp',this.velDampValue);
        this.updatePositionShader.setUniform('uRandomScale',this.randomAmount);
        this.updatePositionShader.setUniform('uTime',millis()%3000);
        this.updatePositionShader.setUniform('uAgeLimit',this.particleAgeLimit/100.0);
        this.updatePositionShader.setUniform('uParticleAgeTexture',this.ageTexture);
        this.updatePositionShader.setUniform('uParticleTrailTexture',this.trailLayer);
        this.updatePositionShader.setUniform('uParticleMask',this.particleMask);
        this.updatePositionShader.setUniform('uUseMaskTexture',this.maskParticles);
        this.updatePositionShader.setUniform('uNormalizeVelocity',this.normalizeVelocity);
        quad(-1,-1,1,-1,1,1,-1,1);//upside down bc the textures get flipped
        this.uPositionTextureBuffer.end();
        [this.uPositionTexture,this.uPositionTextureBuffer] = [this.uPositionTextureBuffer,this.uPositionTexture];
    }
    updateVel(){
        this.velTextureBuffer.begin();
        shader(this.updateVelShader);
        this.updateVelShader.setUniform('uForceStrength',this.forceStrength);
        this.updateVelShader.setUniform('uFriction',this.friction);
        this.updateVelShader.setUniform('uParticleVel',this.velTexture);
        this.updateVelShader.setUniform('uParticlePos',this.uPositionTexture);
        this.updateVelShader.setUniform('uFlowFieldTexture',this.flowFieldTexture);
        quad(-1,-1,1,-1,1,1,-1,1);//upside down bc the textures get flipped
        this.velTextureBuffer.end();
        [this.velTexture,this.velTextureBuffer] = [this.velTextureBuffer,this.velTexture];
    }
    updateAge(){
        this.ageTextureBuffer.begin();
        shader(this.updateAgeShader);
        this.updateAgeShader.setUniform('uAgeLimit',this.particleAgeLimit/100.0);
        this.updateAgeShader.setUniform('uAgeTexture',this.ageTexture);
        quad(-1,-1,1,-1,1,1,-1,1);//upside down bc the textures get flipped
        this.ageTextureBuffer.end();
        [this.ageTexture,this.ageTextureBuffer] = [this.ageTextureBuffer,this.ageTexture];
    }
    resetParticles(){
        let r = random();
        fillFBOwithRandom(this.uPositionTexture,1.0,r);
        fillFBOwithRandom(this.uPositionTextureBuffer,1.0,r);
        let r1 = random();
        fillFBOwithRandom(this.ageTexture,this.particleAgeLimit/100.0,r1);
        fillFBOwithRandom(this.ageTextureBuffer,this.particleAgeLimit/100.0,r1);
        let r2 = random();
        fillFBOwithRandom(this.velTexture,1.0,r2);
        fillFBOwithRandom(this.velTextureBuffer,1.0,r2);
    }
    renderGL(){
        //set the trail layer to the active framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.trailLayer.aaFramebuffer);
        this.trailLayer.begin();
        //fade the trails
        background(red(this.backgroundColor),green(this.backgroundColor),blue(this.backgroundColor));
        //setting ID attributes (or trying to at least)
        gl.bindBuffer(gl.ARRAY_BUFFER, idBuffer);
        gl.enableVertexAttribArray(drawParticlesProgLocs.id);
        gl.vertexAttribPointer(
            drawParticlesProgLocs.id,
            1,         // size (num components)
            gl.FLOAT,  // type of data in buffer
            false,     // normalize
            0,         // stride (0 = auto)
            0,         // offset
        );

        //setting the texture samples (this was what was fucked up! you need to set the active texture, then bind it)
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.uPositionTexture.colorTexture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.colorMap.colorTexture);
        // gl.bindTexture(gl.TEXTURE_2D, this.velTexture.colorTexture);

        rotateZ(PI);

        shader(this.pointShader);
        this.pointShader.setUniform('uVelocityTexture',this.velTexture);
        this.pointShader.setUniform('uPositionTexture',this.uPositionTexture);
        this.pointShader.setUniform('uParticleColor',[red(this.particleColor)/255.0,green(this.particleColor)/255.0,blue(this.particleColor)/255.0]);
        this.pointShader.setUniform('uTextureDimensions',[dataTextureDimension,dataTextureDimension]);
        this.pointShader.setUniform('uParticleSize',this.pointSize);
        gl.drawArrays(gl.POINTS,0,this.particleCount);
        this.trailLayer.end();
        image(this.trailLayer,-width/2,-height/2,width,height);
    }
    renderData(){
        image(this.velTexture,-width/2,-height/2,width/8,height/8);
        image(this.uPositionTexture,-3*width/8,-height/2,width/8,height/8);
        image(this.flowFieldTexture,-width/4,-height/2,width/8,height/8);
    }
    renderFlowMap(){
        image(this.flowFieldTexture,-width/2,-height/2,width,height);
    }
    update(){
        this.updateAge();
        this.updatePos();
        this.updateVel();
    }
}

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
        v.x += maxVal;
    if(v.x>maxVal)
        v.x -= minVal;
    if(v.y<minVal)
        v.y += maxVal;
    if(v.y>maxVal)
        v.y -= minVal;
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
uniform vec2 uTextureDimensions;
uniform mat4 uMatrix;
uniform float uParticleSize;

uniform vec3 uParticleColor;

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
    // vColor  = vec4(vColor.r,vColor.g,vColor.b,1.0 - getValueFrom2DTextureAs1DArray(uVelocityTexture, uTextureDimensions, id).x);
    vColor = vec4(uParticleColor.xyz,1.0-texture2D(uVelocityTexture,position.xy));

    gl_Position = vec4(position.x,position.y,1.0,1.0)-vec4(0.5);
    gl_PointSize = uParticleSize;
}
`;

const drawParticlesFS = glsl`
precision highp float;

uniform vec3 uParticleColor;

varying vec4 vColor;
void main() {
    // gl_FragColor = vec4(uParticleColor.xyz,1.0 - vColor.x);
    gl_FragColor = vColor;
}
`;