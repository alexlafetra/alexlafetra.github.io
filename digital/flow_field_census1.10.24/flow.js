let dataTextureDimension = 150;
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
    constructor(mask,presetIndex,map,c){
        //Parameters
        this.particleCount = 40000;
        this.trailDecayValue = 0.02;
        this.pointSize = 1.3;
        this.opacity = 200;
        this.particleAgeLimit = 150;
        this.velDampValue = 0.001;
        this.forceStrength = 0.4;
        this.fieldStrength = 0.01;
        this.randomAmount = 0.5;
        this.friction = 0.0;
        this.particleColor = c;

        this.backgroundColor = {r:0,g:0,b:0};

        this.presetIndex = presetIndex;

        this.maskParticles = true;
        this.normalizeVelocity = false;

        this.isActive = true;

        //data
        this.attractors = attractors;
        this.repulsors = repulsors;

        //Shaders
        this.updatePositionShader = createShader(updatePositionVert,updatePositionFrag);
        this.updateAgeShader = createShader(ageVert,ageFrag);
        this.updateVelShader = createShader(updateVelVert,updateVelFrag);
        this.pointShader = createShader(drawParticlesVS,drawParticlesFS);
        this.flowShader = createShader(flowMapVert,flowMapFrag);

        //Texture Buffers
        this.ageTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.ageTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.uPositionTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.uPositionTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.velTexture = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.velTextureBuffer = createFramebuffer({width:dataTextureDimension,height:dataTextureDimension,format:FLOAT,textureFiltering:NEAREST});
        this.flowFieldTexture = createFramebuffer({width:width,height:height});
        
        this.trailLayer = createFramebuffer({width:width,height:height,format:FLOAT});
        this.trailLayer.begin();
        background(0);
        this.trailLayer.end();
        this.trailBuffer = createFramebuffer({width:width,height:height,format:FLOAT});

        this.particleMask = mask;

        //if the ff isn't passed a map texture, make it's own
        this.mapTexture = createFramebuffer(width,height);
        if(map == null){
            // this.renderMapTexture();
        }
        else{
            this.mapTexture.begin();
            image(map,-this.mapTexture.width/2,-this.mapTexture.height/2,this.mapTexture.width,this.mapTexture.height);
            this.mapTexture.end();
        }

        this.initGui();

        //set up the field
        this.resetParticles();
    }
    initGui(){
        let gui = document.getElementById("gui");
        if(!gui){
            gui = createDiv();
            gui.id("gui");
        }
        this.controlPanel = createDiv();
        this.controlPanel.addClass("flowfield_controls");

        this.chartTitle = createDiv();
        this.chartTitle.addClass('chart_title');
        this.chartTitle.parent(this.controlPanel);

        this.chartEquation = createDiv();
        this.chartEquation.addClass('chart_attractor_equation');
        this.chartEquation.parent(this.controlPanel);

        this.colorPicker = createColorPicker(this.particleColor);
        this.colorPicker.parent(this.controlPanel);

        this.dampValueSlider = new GuiSlider(0.001,0.02, this.velDampValue,0.001,"Damping",this.controlPanel);
        this.particleSlider = new GuiSlider(1,dataTextureDimension*dataTextureDimension,this.particleCount,1,"Particles",this.controlPanel);
        this.decaySlider = new GuiSlider(0.0001,0.2,0.01,0.0001,"decay",this.controlPanel);
        this.particleSizeSlider = new GuiSlider(0,20.0,this.pointSize,0.1,"Size",this.controlPanel);
        this.maskParticlesCheckbox = new GuiCheckbox("Mask Off Oceans",this.maskParticles,this.controlPanel);
        this.activeCheckbox = new GuiCheckbox("Simulate",this.isActive,this.controlPanel);
        this.flowFieldSelector = new FlowFieldSelector(presets,this.presetIndex,"Demographic Data",true,this.controlPanel);

        this.controlPanel.parent(gui);
    }
    updateParametersFromGui(){
        this.particleColor = color(this.colorPicker.value());
        this.velDampValue = this.dampValueSlider.value();
        this.particleCount = this.particleSlider.value();
        this.trailDecayValue = this.decaySlider.value();
        this.pointSize = this.particleSizeSlider.value();
        this.maskParticles = this.maskParticlesCheckbox.value();
        this.isActive = this.activeCheckbox.value();
        if(this.presetIndex != this.flowFieldSelector.selected()){
            presets[this.flowFieldSelector.selected()].setActive(this.flowFieldSelector.selected(),this);
        }
    }
    renderMapTexture(){
        renderMap(this.mapTexture,color(0),presets[this.presetIndex].colorStyle);
    }
    renderImageAsMapTexture(img){
        this.mapTexture.begin();
        image(img,-this.mapTexture.width/2,-this.mapTexture.height/2,this.mapTexture.width,this.mapTexture.height);
        this.mapTexture.end();
    }
    updateFlow(){
        this.flowFieldTexture.begin();
        shader(this.flowShader);
        //just a note: attractors and repulsors are FLAT arrays of x,y,strength values
        //Which means they're just a 1x(nx3) flat vector, not an nx3 multidimensional vector
        this.flowShader.setUniform('uAttractors',this.attractors);
        this.flowShader.setUniform('uRepulsors',this.repulsors);
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
        // gl.bindFramebuffer(gl.FRAMEBUFFER, this.trailLayer.aaFramebuffer);
        this.trailLayer.begin();
        //fade the trails
        background(this.backgroundColor.r,this.backgroundColor.g,this.backgroundColor.b,this.trailDecayValue*255);
        // background(0,this.trailDecayValue*255.0);

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
        gl.bindTexture(gl.TEXTURE_2D, this.mapTexture.colorTexture);
        // gl.bindTexture(gl.TEXTURE_2D, this.velTexture.colorTexture);

        rotateZ(PI);

        shader(this.pointShader);
        this.pointShader.setUniform('uVelocityTexture',this.velTexture);
        this.pointShader.setUniform('uPositionTexture',this.uPositionTexture);
        this.pointShader.setUniform('uColorTexture',this.mapTexture);
        this.pointShader.setUniform('uParticleColor',[this.particleColor._array[0],this.particleColor._array[1],this.particleColor._array[2],1.0]);
        this.pointShader.setUniform('uTextureDimensions',[dataTextureDimension,dataTextureDimension]);
        this.pointShader.setUniform('uParticleSize',this.pointSize);
        gl.drawArrays(gl.POINTS,0,this.particleCount);
        this.trailLayer.end();
        image(this.trailLayer,-width/2,-height/2,width,height);
    }
    renderData(){
        image(this.velTexture,-width/2,-height/2,width/8,height/8);
        image(this.uPositionTexture,-3*width/8,-height/2,width/8,height/8);
    }
    updateParticles(){
        this.updateAge();
        this.updatePos();
        this.updateVel();
    }
    calculateAttractors(n){
        this.attractors = [];
        this.repulsors = [];
        let a = getSignificantPoints(n,presets[this.presetIndex].demographicFunction);
        let r = getLeastSignificantPoints(n,presets[this.presetIndex].demographicFunction);
    
        let min = r[0].strength;
        let max = a[0].strength;
    
        for(let point of a){
            this.attractors.push(point.x);
            this.attractors.push(point.y);
            // attractors.push(map(point.strength,min,max,0,forceScale));
            this.attractors.push(1.0);
        }
        for(let point of r){
            this.repulsors.push(point.x);
            this.repulsors.push(point.y);
            this.repulsors.push(1.0);
            // repulsors.push(map(point.strength,max,min,0,forceScale));
        }
    }
    setPresetAttractors(){
        this.attractors = presets[this.presetIndex].attractors;
        this.repulsors = presets[this.presetIndex].repulsors;
    }
}