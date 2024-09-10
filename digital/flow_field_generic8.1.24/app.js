//this is a wrapper for the flow field that feeds it census data and handles the gui
const defaultPresetIndex = 1;
class CensusDataFlowField{
    constructor(){
        this.flowField = new FlowField(defaultSettings);
        console.log(this.flowField);
        this.initGui();
        this.updateParametersFromGui();
    }
    initGui(){
        let gui = document.getElementById("gui");
        if(!gui){
            gui = createDiv();
            gui.id("gui");
        }
        gui.textContent = '';//clear it out;

        this.controlPanel = createDiv();
        this.controlPanel.addClass("flowfield_controls");

        this.dampValueSlider = new GuiSlider(0.001,0.2, this.flowField.settings.particleVelocity,0.001,"Speed",this.controlPanel);
        this.randomValueSlider = new GuiSlider(0,10, this.flowField.settings.randomMagnitude,0.01,"Drift",this.controlPanel);

        this.attractionColorPicker = createColorPicker(this.flowField.settings.attractionColor);
        this.attractionColorPicker.parent(this.controlPanel);
        this.attractionStrengthSlider = new GuiSlider(0,10.0,this.flowField.settings.attractionStrength,0.001,"Attraction",this.controlPanel);
        this.repulsionColorPicker = createColorPicker(this.flowField.settings.repulsionColor);
        this.repulsionColorPicker.parent(this.controlPanel);
        this.repulsionStrengthSlider = new GuiSlider(0,10.0,this.flowField.settings.repulsionStrength,0.001,"Repulsion",this.controlPanel);

        this.particleSlider = new GuiSlider(1,dataTextureDimension*dataTextureDimension,this.flowField.settings.particleCount,1,"Particles",this.controlPanel);
        this.decaySlider = new GuiSlider(0.0,0.5,this.flowField.settings.trailDecayValue,0.001,"Decay",this.controlPanel);
        this.particleSizeSlider = new GuiSlider(0,10.0,this.flowField.settings.particleSize,0.1,"Size",this.controlPanel);
        this.fieldStrengthSlider = new GuiSlider(0,1.0,this.flowField.settings.fieldStrength,0.01,"Strength",this.controlPanel);
        this.activeCheckbox = new GuiCheckbox("Run Simulation",this.flowField.settings.isActive,this.controlPanel);
        this.mouseInteractionCheckbox = new GuiCheckbox("Mouse Interaction",this.flowField.settings.mouseInteraction,this.controlPanel);
        this.showAttractorsCheckbox = new GuiCheckbox("Show Attractors",this.flowField.settings.renderAttractors,this.controlPanel);
        this.showRepulsorsCheckbox = new GuiCheckbox("Show Repulsors",this.flowField.settings.renderRepulsors,this.controlPanel);
        this.useParticleMaskCheckbox = new GuiCheckbox("Mask Off Oceans",this.flowField.settings.useParticleMask,this.controlPanel);
        this.showDataCheckbox = new GuiCheckbox("Overlay Data Textures",this.flowField.settings.renderFlowFieldDataTexture,this.controlPanel);
       
        //save gif button
        this.saveGifButton = new GuiButton("Save GIF", saveFlowFieldGif,this.controlPanel);
        this.gifLengthTextbox = new GuiTextbox("30",this.controlPanel);

        this.controlPanel.parent(gui);
    }
    updateParametersFromGui(){
        this.flowField.settings.repulsionColor = color(this.repulsionColorPicker.value());
        this.flowField.settings.attractionColor = color(this.attractionColorPicker.value());
        this.flowField.settings.particleVelocity = this.dampValueSlider.value();
        this.flowField.settings.particleCount = this.particleSlider.value();
        this.flowField.settings.trailDecayValue = this.decaySlider.value();
        this.flowField.settings.particleSize = this.particleSizeSlider.value();
        this.flowField.settings.useParticleMask = this.useParticleMaskCheckbox.value();
        this.flowField.settings.isActive = this.activeCheckbox.value();
        this.flowField.settings.randomMagnitude = this.randomValueSlider.value();
        this.flowField.settings.renderFlowFieldDataTexture = this.showDataCheckbox.value();
        this.flowField.settings.renderAttractors = this.showAttractorsCheckbox.value();
        this.flowField.settings.renderRepulsors = this.showRepulsorsCheckbox.value();
        this.flowField.settings.mouseInteraction = this.mouseInteractionCheckbox.value();
        this.flowField.settings.fieldStrength = this.fieldStrengthSlider.value();

        //updating repulsion/attraction strengths
        let needToUpdateFF = false;
        if(this.flowField.settings.repulsionStrength != this.repulsionStrengthSlider.value() && !mouseIsPressed){
            this.flowField.settings.repulsionStrength = this.repulsionStrengthSlider.value();
            needToUpdateFF = true;
        }
        if(this.flowField.settings.attractionStrength != this.attractionStrengthSlider.value() && !mouseIsPressed){
            this.flowField.settings.attractionStrength = this.attractionStrengthSlider.value();
            needToUpdateFF = true;
        }
        if(needToUpdateFF){//only update ONCE, even if both are changed
            this.flowField.updateFlowField();
        }
    }
    logFlowFieldData(presetName){
        let a = getSignificantPoints(NUMBER_OF_ATTRACTORS,this.censusDataPreset.demographicFunction);
        let r = getLeastSignificantPoints(NUMBER_OF_ATTRACTORS,this.censusDataPreset.demographicFunction);
        let string = presetName + "Attractors = "+JSON.stringify(a)+"\n"+presetName+"Repulsors = "+JSON.stringify(r)+";\n";
        console.log(string);
        return string;
    }
    normalizeNodesAndPushToFlowField(a,r){
        //clear out old nodes
        this.flowField.attractorArray = [];
        this.flowField.repulsorArray = [];

        let minR = r[0].strength;
        let maxR = r[r.length-1].strength;

        let maxA = a[0].strength;
        let i = 0;
        while(maxA == Infinity){
            maxA = a[i].strength;
            i++;
            if(i >= a.length)
                maxA = this.flowField.forceStrength;
        }
        let minA = a[a.length-1].strength;

        const overallMax = max([maxA,maxR,minA,minR]);
        const overallMin = min([maxA,maxR,minA,minR]);

        for(let point of a){
            //filter out glitched attractors
            if(point.strength == Infinity)
                point.strength = maxA;
            //ignore attractors that are really repulsors
            if(point.strength<0.0)
                point.strength = 0;
            this.flowField.attractorArray.push(point.x);
            this.flowField.attractorArray.push(point.y);

            //normalize data, the biggest attractors/repulsors are = 1.0
            // let s = map(point.strength,overallMin,overallMax,0,1.0);
            let s = map(point.strength,minA,maxA,0,1.0);
            this.flowField.attractorArray.push(s);
        }
        for(let point of r){
            //ignore repulsors which are really attractors
            if(point.strength>0.0)
                point.strength = 0;
            this.flowField.repulsorArray.push(point.x);
            this.flowField.repulsorArray.push(point.y);

            // let s = map(point.strength,overallMax,overallMin,0,1.0);
            let s = map(point.strength,minR,maxR,0,1.0);
            this.flowField.repulsorArray.push(s);
        }
    }
    setFlowFieldNodesFromData(n){
        //you need to make sure these don't return any points with infinite strength!
        //This can happen where there are '0' people in a tract and you're dividing by that pop number
        //And it messes up the relative scaling (will crash the calculation bc /0 error can happen)
        const attractorObjects = getSignificantPoints(n,this.censusDataPreset.demographicFunction);
        const repulsorObjects = getLeastSignificantPoints(n,this.censusDataPreset.demographicFunction);
        this.normalizeNodesAndPushToFlowField(attractorObjects,repulsorObjects);
    }
    setFlowFieldNodesFromPreset(){
        console.log(this.censusDataPreset);
        const attractorObjects = this.censusDataPreset.attractors;
        const repulsorObjects = this.censusDataPreset.repulsors;
        this.normalizeNodesAndPushToFlowField(attractorObjects,repulsorObjects);
    }
    setFlowFieldNodes(){
        if(devMode)
            this.setFlowFieldNodesFromData(NUMBER_OF_ATTRACTORS);
        else
            this.setFlowFieldNodesFromPreset();
    }
    loadCensusPreset(preset){
        this.chartTitle.html(preset.title);
        this.chartEquation.html(preset.chartEquation);
        this.setFlowFieldNodes();
        this.flowField.updateFlowField();
    }
    run(){
        this.updateParametersFromGui();
        this.flowField.run();
    }
    saveFFImage(){
        saveCanvas(this.flowField.flowFieldTexture,"flowField.png","png");
    }
    loadSimulationSettingsIntoGUI(){
        this.dampValueSlider.set(this.flowField.settings.particleVelocity);
        this.particleSlider.set(this.flowField.settings.particleCount);
        this.decaySlider.set(this.flowField.settings.trailDecayValue);
        this.particleSizeSlider.set(this.flowField.settings.particleSize);
        this.randomValueSlider.set(this.flowField.settings.randomMagnitude);
        this.attractionStrengthSlider.set(this.flowField.settings.attractionStrength);
        this.repulsionStrengthSlider.set(this.flowField.settings.repulsionStrength);
    }
}