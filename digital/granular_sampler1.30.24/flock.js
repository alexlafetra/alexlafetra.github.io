let dataTextureDimension = 100;
let randomShader;
let drawParticlesProgram;
let drawParticlesProgLocs;

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

class Flock{
    constructor(){
        //Parameters
        this.particleCount = 10000;
        this.trailDecayValue = 1.0;
        this.randomAmount = 0.0;

        this.particleColor = color(220,180,50);
        this.backgroundColor = color(10,30,10);

        this.viewDistance = 0.5;
        this.cohesionStrength = 0.01;
        this.alignmentStrength = 0.01;
        this.avoidanceStrength = 0.01;

        //Shaders
        this.updatePositionShader = createShader(updatePositionVert,updatePositionFrag);
        this.updateVelShader = createShader(updateVelVert,updateVelFrag);
        this.pointShader = createShader(drawParticlesVS,drawParticlesFS);

        //Texture Buffers
        this.posTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.posTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.velTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.velTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        
        this.trailLayer = createFramebuffer({width:width,height:height,format:FLOAT});
        this.trailBuffer = createFramebuffer({width:width,height:height,format:FLOAT});

        //set up the field
        initGL();

        this.resetParticles();
    }
    updatePos(){
        this.posTextureBuffer.begin();
        shader(this.updatePositionShader);
        this.updatePositionShader.setUniform('uParticleVelTexture',this.velTexture);
        this.updatePositionShader.setUniform('uParticlePosTexture',this.posTexture);
        this.updatePositionShader.setUniform('uDamp',this.velDampValue);
        this.updatePositionShader.setUniform('uRandomScale',this.randomAmount);
        this.updatePositionShader.setUniform('uParticleTrailTexture',this.trailLayer);
        this.updatePositionShader.setUniform('uNormalizeVelocity',this.normalizeVelocity);
        quad(-1,-1,1,-1,1,1,-1,1);//upside down bc the textures get flipped
        this.posTextureBuffer.end();
        [this.posTexture,this.posTextureBuffer] = [this.posTextureBuffer,this.posTexture];
    }
    updateVel(){
        this.velTextureBuffer.begin();
        shader(this.updateVelShader);
        this.updateVelShader.setUniform('uParticleVel',this.velTexture);
        this.updateVelShader.setUniform('uParticlePos',this.posTexture);

        this.updateVelShader.setUniform('uResolution',dataTextureDimension);
        this.updateVelShader.setUniform('uViewDistance',this.viewDistance);
        this.updateVelShader.setUniform('uAlignmentStrength',this.alignmentStrength);
        this.updateVelShader.setUniform('uCohesionStrength',this.cohesionStrength);
        this.updateVelShader.setUniform('uAvoidanceStrength',this.avoidanceStrength);

        quad(-1,-1,1,-1,1,1,-1,1);//upside down bc the textures get flipped
        this.velTextureBuffer.end();
        [this.velTexture,this.velTextureBuffer] = [this.velTextureBuffer,this.velTexture];
    }
    resetParticles(){
        let r = random();
        fillFBOwithRandom(this.posTexture,1.0,r);
        fillFBOwithRandom(this.posTextureBuffer,1.0,r);
        let r1 = random();
        fillFBOwithRandom(this.velTexture,1.0,r1);
        fillFBOwithRandom(this.velTextureBuffer,1.0,r1);
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
        gl.bindTexture(gl.TEXTURE_2D, this.posTexture.colorTexture);
        gl.activeTexture(gl.TEXTURE1);
        // gl.bindTexture(gl.TEXTURE_2D, this.colorMap.colorTexture);
        gl.bindTexture(gl.TEXTURE_2D, this.velTexture.colorTexture);

        rotateZ(PI);

        shader(this.pointShader);
        this.pointShader.setUniform('uVelocityTexture',this.velTexture);
        this.pointShader.setUniform('uPositionTexture',this.posTexture);
        this.pointShader.setUniform('uParticleColor',[red(this.particleColor)/255.0,green(this.particleColor)/255.0,blue(this.particleColor)/255.0]);
        this.pointShader.setUniform('uTextureDimensions',[dataTextureDimension,dataTextureDimension]);
        this.pointShader.setUniform('uParticleSize',1.0);
        gl.drawArrays(gl.POINTS,0,this.particleCount);
        this.trailLayer.end();
        image(this.trailLayer,-width/2,-height/2,width,height);
    }
    renderData(){
        image(this.velTexture,-width/2,-height/2,width/4,height/4);
        image(this.posTexture,-width/2,-height/4,width/4,height/4);

    }
    update(){
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

uniform float uResolution;
uniform float uViewDistance;
uniform float uCohesionStrength;
uniform float uAlignmentStrength;
uniform float uAvoidanceStrength;

varying vec2 vParticleCoord;

void main(){
    vec3 thisPosition = texture2D(uParticlePos,vParticleCoord).xyz;
    vec3 thisVelocity = texture2D(uParticleVel,vParticleCoord).xyz;

    vec3 cohesionForce = vec3(0.0);
    vec3 alignmentForce = vec3(0.0);
    vec3 avoidanceForce = vec3(0.0);
    float boidCount = 0.0;

    //cycle over all the boids
    for(float x = 0.0; x<1.0; x += 0.01){
        for(float y = 0.0; y<1.0; y+= 0.01){
            if(x != vParticleCoord.x && y != vParticleCoord.y){
                vec3 otherPosition = texture2D(uParticlePos,vec2(x,y)).xyz;
                //if the other boid is within range
                if(distance(thisPosition,otherPosition)<uViewDistance){
                    boidCount++;
                    //cohesion
                    cohesionForce += thisPosition - otherPosition;
                    //alignment
                    vec3 otherVelocity = texture2D(uParticleVel,vec2(x,y)).xyz;
                    alignmentForce += thisVelocity - otherVelocity;
                    //avoidance
                    avoidanceForce += otherPosition-thisPosition;
                }
            }
        }
    }
    vec3 finalForce = vec3(uCohesionStrength*cohesionForce+uAlignmentStrength*alignmentForce+uAvoidanceStrength*avoidanceForce)/boidCount;
    gl_FragColor = vec4(thisVelocity+0.001*finalForce,1.0);
    // gl_FragColor = vec4(1.0);
    // gl_FragColor = vec4(thisVelocity.xyz,1.0);
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
    // gl_FragColor = vColor;
    gl_FragColor = vec4(1.0);
}
`;