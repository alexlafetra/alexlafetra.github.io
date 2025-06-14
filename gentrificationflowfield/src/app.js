//this is a wrapper for the flow field that feeds it census data and handles the gui
class CensusDataFlowField{
    constructor(preset){
        this.censusDataPreset = preset;
        console.log(this.censusDataPreset);
        this.activeViewPreset = viewPresets[0];
        this.simulationParameterPreset = defaultSettings;
        this.flowField = new FlowField(defaultSettings);
        this.initGui();
        console.log(this.censusDataPreset);
        this.updateParametersFromGui();
        console.log(this.censusDataPreset);
        this.loadCensusPreset(this.censusDataPreset);
    }
    initGui(){
        let gui = document.getElementById("gui");
        if(!gui){
            gui = createDiv();
            gui.id("gui");
        }
        // gui.textContent = '';//clear it out;

        this.controlPanel = createDiv();
        this.controlPanel.addClass("flowfield_controls");

        this.chartTitle = createDiv();
        this.chartTitle.addClass('chart_title_small');
        this.chartTitle.parent(this.controlPanel);

        this.chartEquation = createDiv();
        this.chartEquation.addClass('chart_equation_small');
        this.chartEquation.parent(this.controlPanel);

        //preset data selector
        let options = [];
        for(let preset of censusDataPresets){
            options.push(preset.title);
        }
        this.presetSelector = new FlowFieldSelector(options,this.censusDataPreset.title,"Demographic Data",this.controlPanel);
        // this.presetSelector.

        //preset view selector
        const geoOptionNames = [];
        for(let view of viewPresets){
            geoOptionNames.push(view.name);
        }
        this.geoScaleSelector = new FlowFieldSelector(geoOptionNames,this.activeViewPreset.name,"View",this.controlPanel);

        this.dampValueSlider = new GuiSlider(0.001,0.1, this.flowField.settings.particleVelocity,0.001,"Speed",this.controlPanel);
        this.randomValueSlider = new GuiSlider(0,10, this.flowField.settings.randomMagnitude,0.01,"Drift",this.controlPanel);

        this.attractionColorPicker = createColorPicker(this.flowField.settings.attractionColor);
        this.attractionColorPicker.parent(this.controlPanel);
        this.attractionStrengthSlider = new GuiSlider(0,10.0,this.flowField.settings.attractionStrength,0.001,"Attraction",this.controlPanel);
        this.repulsionColorPicker = createColorPicker(this.flowField.settings.repulsionColor);
        this.repulsionColorPicker.parent(this.controlPanel);
        this.repulsionStrengthSlider = new GuiSlider(0,10.0,this.flowField.settings.repulsionStrength,0.001,"Repulsion",this.controlPanel);

        this.particleSlider = new GuiSlider(1,dataTextureDimension*dataTextureDimension,this.flowField.settings.particleCount,1,"Particles",this.controlPanel);
        this.decaySlider = new GuiSlider(0.0,0.1,this.flowField.settings.trailDecayValue,0.001,"Decay",this.controlPanel);
        this.particleSizeSlider = new GuiSlider(0,10.0,this.flowField.settings.particleSize,0.1,"Size",this.controlPanel);
        this.colorWeightSlider = new GuiSlider(0.0,3.0, this.flowField.settings.colorWeight,0.01,"Color Balance",this.controlPanel);

        this.activeCheckbox = new GuiCheckbox("Run Simulation",this.flowField.settings.isActive,this.controlPanel);
        this.drawParticlesCheckbox = new GuiCheckbox("Show Particles",this.flowField.settings.renderParticles,this.controlPanel);
        this.mouseInteractionCheckbox = new GuiCheckbox("Mouse Interaction",this.flowField.settings.mouseInteraction,this.controlPanel);
        this.showTractsCheckbox = new GuiCheckbox("Overlay Census Tract Boundaries",this.flowField.settings.renderCensusTracts,this.controlPanel);
        this.showHOLCCheckbox = new GuiCheckbox("Overlay HOLC Redlining Tracts",this.flowField.settings.renderHOLCTracts,this.controlPanel);
        this.showNodesCheckbox = new GuiCheckbox("Show Nodes",this.flowField.settings.renderNodes,this.controlPanel);
        this.useParticleMaskCheckbox = new GuiCheckbox("Keep Particles From Moving Over Water",this.flowField.settings.useParticleMask,this.controlPanel);
        this.showDataCheckbox = new GuiCheckbox("Overlay Data Textures",this.flowField.settings.renderFlowFieldDataTexture,this.controlPanel);
        this.renderBigFlowFieldCheckbox = new GuiCheckbox("Overlay Flow Field",this.flowField.settings.renderBigFlowField,this.controlPanel);
        
        //save settings buttons
        this.logSettingsButton = new GuiButton("Log Settings To Console", logSettingsToConsole,this.controlPanel);
        
        //save gif button
        this.saveGifButton = new GuiButton("Save GIF", saveFlowFieldGif,this.controlPanel);
        this.gifLengthTextbox = new GuiTextbox("30",this.controlPanel);

        this.rerenderNodesButton = new GuiButton("Rerender Nodes",rerenderNodes,this.controlPanel);
        //save presets button
        if(devMode)
            this.savePresetsButton = new GuiButton("Save Presets to JSON", savePresetsToJSON,this.controlPanel);

        this.controlPanel.parent(gui);
    }
    updateParametersFromGui(){
        this.flowField.settings.repulsionColor = color(this.repulsionColorPicker.value());
        this.flowField.settings.attractionColor = color(this.attractionColorPicker.value());
        this.flowField.settings.particleVelocity = this.dampValueSlider.value();
        this.flowField.settings.colorWeight = this.colorWeightSlider.value();
        this.flowField.settings.particleCount = this.particleSlider.value();
        this.flowField.settings.trailDecayValue = this.decaySlider.value();
        this.flowField.settings.particleSize = this.particleSizeSlider.value();
        this.flowField.settings.useParticleMask = this.useParticleMaskCheckbox.value();
        this.flowField.settings.isActive = this.activeCheckbox.value();
        this.flowField.settings.randomMagnitude = this.randomValueSlider.value();
        this.flowField.settings.renderFlowFieldDataTexture = this.showDataCheckbox.value();
        this.flowField.settings.renderNodes = this.showNodesCheckbox.value();
        this.flowField.settings.mouseInteraction = this.mouseInteractionCheckbox.value();
        this.flowField.settings.renderCensusTracts = this.showTractsCheckbox.value();
        this.flowField.settings.renderHOLCTracts = this.showHOLCCheckbox.value();
        this.flowField.settings.renderParticles = this.drawParticlesCheckbox.value();
        this.flowField.settings.renderBigFlowField = this.renderBigFlowFieldCheckbox.value();


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
            this.flowField.updateFlow();
        }

        //check to see if the flowfield selector has been changed, and if it has, set the new preset
        if(this.censusDataPreset != censusDataPresets[this.presetSelector.selected()]){
            this.censusDataPreset = censusDataPresets[this.presetSelector.selected()];
            this.loadCensusPreset(this.censusDataPreset);
        }
        //same as above, but with the view presets
        if(this.activeViewPreset != viewPresets[this.geoScaleSelector.selected()]){
            this.activeViewPreset = viewPresets[this.geoScaleSelector.selected()];
            if(this.activeViewPreset.settings)
                this.loadSimulationSettingsIntoGUI(this.activeViewPreset.settings);
            offset = {x:this.activeViewPreset.x,y:this.activeViewPreset.y};
            scale = {x:this.activeViewPreset.scale,y:-this.activeViewPreset.scale};
            this.flowField.updateParticleMask();
            this.flowField.updateFlow();
            this.flowField.resetParticles();
            this.flowField.renderNodes();
        }
    }
    logFlowFieldData(presetName){
        let nodes = createNodesFromTracts(this.censusDataPreset.demographicFunction);
        let string = presetName + "Nodes = "+JSON.stringify(nodes);
        console.log(string);
        return string;
    }
    setFlowFieldNodesFromData(){
        //you need to make sure these don't return any points with infinite strength!
        //This can happen where there are '0' people in a tract and you're dividing by that pop number
        //And it messes up the relative scaling (will crash the calculation bc /0 error can happen)
        let nodes = createNodesFromTracts(this.censusDataPreset.demographicFunction);
        this.flowField.loadNodes(nodes);
    }
    setFlowFieldNodesFromPreset(){
        this.flowField.loadNodes(this.censusDataPreset.nodes);
    }
    setFlowFieldNodes(){
        if(devMode)
            this.setFlowFieldNodesFromData();
        else
            this.setFlowFieldNodesFromPreset();
    }
    loadCensusPreset(preset){
        this.chartTitle.html("Title:"+preset.title);
        this.chartEquation.html("Equation:"+preset.chartEquation);
        document.getElementById("chartTitle").innerHTML = preset.title;
        document.getElementById("chartEquation").innerHTML = preset.chartEquation;
        this.setFlowFieldNodes();
    }
    run(){
        this.updateParametersFromGui();
        this.flowField.run();
    }
    loadSimulationSettingsIntoGUI(settings){
        this.dampValueSlider.set(settings.particleVelocity);
        this.particleSlider.set(settings.particleCount);
        this.decaySlider.set(settings.trailDecayValue);
        this.particleSizeSlider.set(settings.particleSize);
        this.randomValueSlider.set(settings.randomMagnitude);
        this.showTractsCheckbox.set(settings.renderCensusTracts);
        this.attractionStrengthSlider.set(settings.attractionStrength);
        this.repulsionStrengthSlider.set(settings.repulsionStrength);
    }
}