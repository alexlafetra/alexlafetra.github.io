class FlowField{
    constructor(){

        //settings
        this.settings = JSON.parse(JSON.stringify(defaultSettings));
        
        //data
        this.attractorArray = [];
        this.repulsorArray = [];

        //Shaders
        this.updateParticleDataShader = createShader(updateParticleDataVert,updateParticleDataFrag);
        this.updateParticleAgeShader = createShader(updateParticleAgeVert,updateParticleAgeFrag);
        this.drawParticlesShader = createShader(drawParticlesVS,drawParticlesFS);
        this.calcFlowFieldShader = createShader(calculateFlowFieldVert,calculateFlowFieldFrag);
        this.fadeParticleCanvasShader = createShader(fadeToTransparentVert,fadeToTransparentFrag);

        //Texture Buffers
        this.particleAgeTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST,depth:false});//holds age data
        this.particleAgeTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST,depth:false});
        this.particleDataTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST,depth:false});//holds velocity and position data
        this.particleDataTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST,depth:false});
        this.flowFieldTexture = createFramebuffer({width:this.settings.canvasSize,height:this.settings.canvasSize,format:FLOAT,textureFiltering:NEAREST,depth:false});//holds the flowfield data attraction = (r,g) ; repulsion = (b,a)
        this.particleMask = createFramebuffer({width:mainCanvas.width,height:mainCanvas.height,depth:false});//holds the particle mask data (white is tracts w/people in them, black is empty tracts)
        this.nodeCanvas = createFramebuffer({width:mainCanvas.width,height:mainCanvas.height,depth:false});
        //not super necessary, but makes it so particles return to their starting position (lets you make seamless looping gifs)
        this.initialStartingPositions = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST,depth:false});
        fillFBOwithRandom(this.initialStartingPositions,1.0,1.1);

        //canvases for drawing to
        this.particleCanvas = createFramebuffer({width:this.settings.canvasSize,height:this.settings.canvasSize,format:FLOAT,depth:false});
        this.renderFBO = createFramebuffer({width:this.settings.canvasSize,height:this.settings.canvasSize,format:FLOAT,depth:false});

        //Initialize particle vel/positions w/ random noise
        this.resetParticles();
    }
    updateSettings(settings){
        this.settings = settings;
    }
    renderAttractors(canvas){
        canvas.begin();
        if(!(frameCount%300)){
            clear();
        }
        for(let i = 0; i<this.attractorArray.length; i+=3){
            const x = canvas.width*(this.attractorArray[i])-canvas.width/2;
            const y = canvas.height*(this.attractorArray[i+1])-canvas.height/2;
            const force = this.attractorArray[i+2];
            let size = map(force,0,1,1,12);//scaling size based on the min/max size of attractors
            const alpha = map(size,1,10,0,255);
            fill(this.settings.attractionColor,alpha);
            noStroke();
            ellipse(x,y,size,size);
        }
        canvas.end();
    }
    renderRepulsors(canvas){
        canvas.begin();
        for(let i = 0; i<this.repulsorArray.length; i+=3){
            const x = canvas.width*(this.repulsorArray[i])-canvas.width/2;
            const y = canvas.height*(this.repulsorArray[i+1])-canvas.height/2;
            const size = map(this.repulsorArray[i+2],0,1,10,1);//scaling size
            const alpha = map(size,1,10,0,255);
            fill(this.settings.repulsionColor,alpha);
            noStroke();
            ellipse(x,y,size,size);
        }
        canvas.end();
    }
    updateFlowField(){
        //ANY drawing to this texture will affect the flow field data
        //Flow field data is stored as attractors(x,y) => r,g; repulsors(x,y) => b,a;
        this.flowFieldTexture.begin();
        //so you need to clear all the color data each frame
        clear();
        shader(this.calcFlowFieldShader);
        //just a note: attractors and repulsors are FLAT arrays of x,y,strength values
        //Which means they're just a 1x(nx3) flat vector, not an nx3 multidimensional vector
        this.calcFlowFieldShader.setUniform('uCoordinateOffset',[0.0,0.0]);//adjusting coordinate so they're between 0,1 (instead of -width/2,+width/2)
        this.calcFlowFieldShader.setUniform('uScale',1.0);
        this.calcFlowFieldShader.setUniform('uDimensions',mainCanvas.width);
        this.calcFlowFieldShader.setUniform('uAttractors',this.attractorArray);
        this.calcFlowFieldShader.setUniform('uRepulsors',this.repulsorArray);
        this.calcFlowFieldShader.setUniform('uAttractionStrength',this.settings.attractionStrength);
        this.calcFlowFieldShader.setUniform('uRepulsionStrength',this.settings.repulsionStrength);
        rect(-this.flowFieldTexture.width/2,-this.flowFieldTexture.height/2,this.flowFieldTexture.width,this.flowFieldTexture.height);
        this.flowFieldTexture.end();
    }
    updateParticleData(){
        this.particleDataTextureBuffer.begin();
        clear();
        shader(this.updateParticleDataShader);
        this.updateParticleDataShader.setUniform('uFlowFieldTexture',this.flowFieldTexture);
        this.updateParticleDataShader.setUniform('uParticleDataTexture',this.particleDataTexture);
        this.updateParticleDataShader.setUniform('uDamp',this.settings.particleVelocity/10.0);
        this.updateParticleDataShader.setUniform('uFieldStrength',this.settings.fieldStrength);
        this.updateParticleDataShader.setUniform('uRandomScale',this.settings.randomMagnitude);
        this.updateParticleDataShader.setUniform('uMouseInteraction',this.settings.mouseInteraction);
        this.updateParticleDataShader.setUniform('uMousePosition',[mouseX/width,mouseY/height]);
        this.updateParticleDataShader.setUniform('uTime',(frameCount%120));//this is also the amount of time the sim will take to loop
        this.updateParticleDataShader.setUniform('uInitialData',this.initialStartingPositions);
        this.updateParticleDataShader.setUniform('uResetToInitialData',this.settings.rebirthParticlesToInitialPositions);
        this.updateParticleDataShader.setUniform('uAgeLimit',this.settings.particleAgeLimit);
        this.updateParticleDataShader.setUniform('uParticleAgeTexture',this.particleAgeTexture);
        this.updateParticleDataShader.setUniform('uParticleTrailTexture',this.particleCanvas);
        this.updateParticleDataShader.setUniform('uParticleMask',this.particleMask);
        this.updateParticleDataShader.setUniform('uUseMaskTexture',this.settings.useParticleMask);
        quad(-1,-1,1,-1,1,1,-1,1);
        this.particleDataTextureBuffer.end();
        [this.particleDataTexture,this.particleDataTextureBuffer] = [this.particleDataTextureBuffer,this.particleDataTexture];
    }
    updateAge(){
        this.particleAgeTextureBuffer.begin();
        shader(this.updateParticleAgeShader);
        this.updateParticleAgeShader.setUniform('uAgeLimit',this.settings.particleAgeLimit);
        this.updateParticleAgeShader.setUniform('uAgeTexture',this.particleAgeTexture);
        quad(-1,-1,1,-1,1,1,-1,1);
        this.particleAgeTextureBuffer.end();
        [this.particleAgeTexture,this.particleAgeTextureBuffer] = [this.particleAgeTextureBuffer,this.particleAgeTexture];
    }
    resetParticles(){
        let r = 1.1;
        fillFBOwithRandom(this.particleDataTexture,1.0,r);
        fillFBOwithRandom(this.particleDataTextureBuffer,1.0,r);
        let r1 = 1;
        fillFBOwithRandom(this.particleAgeTexture,this.settings.particleAgeLimit,r1);
        fillFBOwithRandom(this.particleAgeTextureBuffer,this.settings.particleAgeLimit,r1);
    }
    renderGL(){
        //using webGL to draw each particle as a point
        this.particleCanvas.begin();
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
        gl.bindTexture(gl.TEXTURE_2D, this.particleDataTexture.colorTexture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.flowFieldTexture.colorTexture);
        //running the particle-drawing shader
        shader(this.drawParticlesShader);
        this.drawParticlesShader.setUniform('uPositionTexture',this.particleDataTexture);
        this.drawParticlesShader.setUniform('uColorTexture',this.flowFieldTexture);
        this.drawParticlesShader.setUniform('uRepulsionColor',[this.settings.repulsionColor._array[0],this.settings.repulsionColor._array[1],this.settings.repulsionColor._array[2],1.0]);
        this.drawParticlesShader.setUniform('uAttractionColor',[this.settings.attractionColor._array[0],this.settings.attractionColor._array[1],this.settings.attractionColor._array[2],1.0]);
        this.drawParticlesShader.setUniform('uTextureDimensions',[dataTextureDimension,dataTextureDimension]);
        this.drawParticlesShader.setUniform('uParticleSize',this.settings.particleSize);
        gl.drawArrays(gl.POINTS,0,this.settings.particleCount);
        this.particleCanvas.end();

        noStroke();

        //rendering the particles
        this.renderFBO.begin();
        clear();//clear out the old image (bc you're about to read from the other canvas)
        shader(this.fadeParticleCanvasShader);
        this.fadeParticleCanvasShader.setUniform('uSourceImage',this.particleCanvas);
        this.fadeParticleCanvasShader.setUniform('uFadeAmount',this.settings.trailDecayValue);
        quad(-1,-1,1,-1,1,1,-1,1);
        this.renderFBO.end();

        //swap the particle FBO and the rendering FBO
        [this.particleCanvas,this.renderFBO] = [this.renderFBO,this.particleCanvas];

        //draw the render FBO to the canvas
        image(this.renderFBO,-mainCanvas.width/2,-mainCanvas.height/2,mainCanvas.width,mainCanvas.height);
    }
    renderData(){
        fill(0);
        // noStroke();
        const dataHeight = windowSize.width/8;
        rect(-width/2,height/2,dataHeight,-3*dataHeight);
        image(this.particleDataTexture,-width/2,height/2,dataHeight,-dataHeight);
        image(this.flowFieldTexture,-width/2,height/2-dataHeight,dataHeight,-dataHeight);
        image(this.nodeCanvas,-width/2,height/2-2*dataHeight,dataHeight,-dataHeight);
    }
    render(){
        this.renderGL();
        if(this.settings.renderAttractors)
            this.renderAttractors(this.nodeCanvas);
        if(this.settings.renderRepulsors)
            this.renderRepulsors(this.nodeCanvas);
        if(this.settings.renderFlowFieldDataTexture){
            this.renderData();
        }
    }
    updateParticles(){
        this.updateAge();
        this.updateParticleData();
    }
    genRandomNodes(number){
        this.attractorArray = [];
        this.repulsorArray = [];
        for(let i = 0; i<number; i++){
            this.attractorArray.push(random(1.0));
            this.attractorArray.push(random(1.0));
            this.attractorArray.push(random(1.0));

            this.repulsorArray.push(random(1.0));
            this.repulsorArray.push(random(1.0));
            this.repulsorArray.push(random(1.0));
        }
        this.updateFlowField();
    }
    updateNodes(attractors,repulsors){
        for(let a  = 0; a<attractors.length; a++){
            this.attractorArray[a*3] = attractors[a].x;
            this.attractorArray[a*3+1] = attractors[a].y;
            this.attractorArray[a*3+2] = attractors[a].strength;
        }
        for(let a  = 0; a<repulsors.length; a++){
            this.repulsorArray[a*3] = repulsors[a].x;
            this.repulsorArray[a*3+1] = repulsors[a].y;
            this.repulsorArray[a*3+2] = repulsors[a].strength;
        }
        this.updateFlowField();
    }
    run(){
        if(this.settings.isActive){
            this.updateParticles();
            background(50,15,30);
            this.render();
            image(rabbit,-width/2,-height/2,width,height);
        }
    }
}