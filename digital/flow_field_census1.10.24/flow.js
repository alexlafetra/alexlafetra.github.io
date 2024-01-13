let dataTextureDimension = 200;
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
        this.particleCount = 40000;
        this.trailDecayValue = 0.05;
        this.pointSize = 1.3;
        this.opacity = 200;
        this.particleAgeLimit = 150;
        this.velDampValue = 0.001;
        this.forceStrength = 0.4;
        this.fieldStrength = 0.01;
        this.randomAmount = 0.5;
        this.friction = 0.0;

        // this.backgroundColor = {r:0.2*255,g:0.2*255,b:0.1*255};
        this.backgroundColor = {r:0,g:0,b:0};

        this.maskParticles = true;
        this.normalizeVelocity = false;

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
    updateFlow(fbo){
        fbo.begin();
        shader(this.flowShader);
        //just a note: attractors and repulsors are FLAT arrays of x,y,strength values
        //Which means they're just a 1x(nx3) flat vector, not an nx3 multidimensional vector
        this.flowShader.setUniform('uAttractors',attractors);
        this.flowShader.setUniform('uRepulsors',repulsors);
        rect(-width/2,-height/2,width,height);
        fbo.end();
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
        // gl.bindFramebuffer(gl.FRAMEBUFFER, this.trailLayer.aaFramebuffer);
        this.trailLayer.begin();
        //fade the trails
        background(this.backgroundColor.r,this.backgroundColor.g,this.backgroundColor.b,this.trailDecayValue*255);
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
        this.pointShader.setUniform('uColorTexture',this.colorMap);
        this.pointShader.setUniform('uTextureDimensions',[dataTextureDimension,dataTextureDimension]);
        this.pointShader.setUniform('uParticleSize',this.pointSize);
        gl.drawArrays(gl.POINTS,0,this.particleCount);
        this.trailLayer.end();
        image(this.trailLayer,-width/2,-height/2,width,height);
    }
    renderCPU(){
        //swap buffers
        [this.trailBuffer,this.trailLayer] = [this.trailLayer,this.trailBuffer];

        this.trailLayer.begin();
        //clear the buffer and draw the previous trails
        clear();
        image(this.trailBuffer,-this.trailLayer.width/2,-this.trailLayer.height/2,this.trailLayer.width,this.trailLayer.height);
        //fade the trails
        background(255,decayValue*255);

        //draw points
        this.uPositionTexture.loadPixels();
        strokeWeight(this.pointSize);
        stroke(0);
        for(let i = 0; i<min(this.particleCount,10000); i++){
            let x = this.uPositionTextureture.pixels[i*4];
            let y = this.uPositionTextureture.pixels[i*4+1];
            point(x*width-width/2,y*height-height/2);
        }
        this.trailLayer.end();

        //draw the trail layer to the main canvas
        fill(255);
        noStroke();
        rect(width/4,-height/2,width/4,height/4);
        image(this.trailLayer,width/4,-height/2,width/4,height/4);
    }
    renderData(){
        image(this.velTexture,-width/2,-height/2,width/8,height/8);
        image(this.uPositionTexture,-3*width/8,-height/2,width/8,height/8);
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