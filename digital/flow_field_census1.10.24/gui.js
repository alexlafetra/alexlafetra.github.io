class GuiSlider{
    constructor(min, max, init, step, label, boundVariable){
        this.label = label;
        this.container = createDiv();
        //create a container for the slider object and the label
        this.container.addClass('slider-container');

        this.boundVariable = boundVariable;

        //add the label
        this.textContainer = createDiv();
        this.textContainer.html(label+":"+init);
        this.textContainer.parent(this.container);

        //use p5js to create a slider, and parent it to the container
        this.slider = createSlider(min,max,init,step).parent(this.container);

        //parent the container to the "controls" div
        this.container.parent(document.getElementById("gui"));

    }
    //this...isn't working
    update(){
        window[this.boundVariable] = this.value();
    }
    value(){
        this.textContainer.html(this.label+":"+this.slider.value());
        return this.slider.value();
    }
    set(val){
        this.slider.value(val);
    }
};

class GuiButton{
    constructor(text,clickHandler){
        this.button = createButton(text);
        this.button.addClass("gui_button");
        this.button.mouseClicked(clickHandler);
        this.button.parent(document.getElementById("gui"));
    }
}

class GuiCheckbox{
    constructor(text,state){
        this.checkbox = createCheckbox(text,state);
        this.checkbox.parent(document.getElementById("gui"));
    }
    value(){
        return this.checkbox.checked();
    }
}

class GuiDropdown{
    constructor(options,defaultOption){
        this.selector = createSelect();
        for(let i = 0; i<options.length;i++){
            this.selector.option(options[i].title,i);
        }
        this.selector.addClass("gui_select");
        this.selector.selected(defaultOption);
        this.selector.parent(document.getElementById("gui"));
    }
    value(){
        return this.selector.value();
    }
    selected(){
        return this.selector.selected();
    }
}

class FlowFieldSelector{
    constructor(options,defaultOption,label,state){
        this.container = createDiv();
        this.container.addClass('flowfield-container');

        //add the label
        this.textContainer = createDiv();
        this.textContainer.html(label);
        this.checkbox = createCheckbox("Active",state).parent(this.textContainer);
        this.textContainer.parent(this.container);

        this.selector = createSelect();
        for(let i = 0; i<options.length;i++){
            this.selector.option(options[i].title,i);
        }
        this.selector.addClass("gui_select");
        this.selector.selected(defaultOption);
        this.selector.parent(this.container);

        this.container.parent(document.getElementById("gui"));
    }
    value(){
        return this.selector.value();
    }
    selected(){
        return this.selector.selected();
    }
    checkboxValue(){
        return this.checkbox.checked();
    }
}

let dampValueSlider;
let particleSlider;
let decaySlider;
let randomSlider;
let particleSizeSlider;
let particleLifespanSlider;
let forceStrengthSlider;
let fieldStrengthSlider;

let showHOLCcheckbox;
let maskParticlesCheckbox;
let tractOutlinesCheckbox;
let flowMapCheckbox;
let mainMapCheckbox;
let particlesCheckbox;
let normalizeVelocityCheckbox;

let flowField1Selector;
let flowField2Selector;
let flowField3Selector;


const guiSliders = [];
function initGui(){
    let gui = document.getElementById("gui");
    if(!gui){
        gui = createDiv();
        gui.id("gui");
    }
    dampValueSlider = new GuiSlider(0.001,0.02, flowFields[0].velDampValue,0.001,"Damping",'dampValue');
    particleSlider = new GuiSlider(1,dataTextureDimension*dataTextureDimension,flowFields[0].particleCount,1,"Particles",'NUMBER_OF_PARTICLES');
    decaySlider = new GuiSlider(0.0001,0.3,flowFields[0].trailDecayValue,0.0001,"decay",'decayValue');
    randomSlider = new GuiSlider(0,2.0,flowFields[0].randomAmount,0.01,"Random Amount",'randomScale');
    particleLifespanSlider = new GuiSlider(1,200,flowFields[0].particleAgeLimit,1,"Age",'imageOpacity');
    particleSizeSlider = new GuiSlider(0,20.0,flowFields[0].pointSize,0.1,"Size",'imageOpacity');
    forceStrengthSlider = new GuiSlider(0,1.0,flowFields[0].forceStrength,0.001,"Force",'imageOpacity');

    showHOLCcheckbox = new GuiCheckbox("Show HOLC Tracts",showHOLCTracts);
    maskParticlesCheckbox = new GuiCheckbox("Mask Off Oceans",flowFields[0].maskParticles);
    tractOutlinesCheckbox = new GuiCheckbox("Tract Outlines",showingTractOutlines);
    flowMapCheckbox = new GuiCheckbox("Flow Map",showFlowMap);
    mainMapCheckbox = new GuiCheckbox("Choropleth (Heat Map)",showingMap);
    particlesCheckbox = new GuiCheckbox("Particles",showParticles);
    normalizeVelocityCheckbox = new GuiCheckbox("Normalize Velocity",flowFields[0].normalizeVelocity);

    flowField1Selector = new FlowFieldSelector(presets,0,"Flow Field 1",true);
    flowField2Selector = new FlowFieldSelector(presets,1,"Flow Field 2",true);
    flowField3Selector = new FlowFieldSelector(presets,2,"Flow Field 3",true);


    new GuiButton("Reset Particles",()=>{for(let ff of flowFields){ff.resetParticles()}});
    new GuiButton("Save FF and Choro.",()=>{saveFlowField();saveChoropleth();});
    new GuiButton("Log Attractors/Repulsors",()=>{logAttractors();});
    new GuiButton("Save GIF",()=>{saveGif('flowfield_'+presets[flowFields[0].presetIndex].text+'.gif',2);});
}

function updateSliders(){
    for(let ff of flowFields){
        ff.velDampValue = dampValueSlider.value();
        ff.particleCount = particleSlider.value();
        ff.randomAmount = randomSlider.value();
        ff.trailDecayValue = decaySlider.value();
        ff.particleAgeLimit = particleLifespanSlider.value();
        ff.pointSize = particleSizeSlider.value();
        ff.forceStrength = forceStrengthSlider.value();
        ff.normalizeVelocity = normalizeVelocityCheckbox.value();
        ff.maskParticles = maskParticlesCheckbox.value();
    }
    flowFields[0].isActive = flowField1Selector.checkboxValue();
    flowFields[1].isActive = flowField2Selector.checkboxValue();
    flowFields[2].isActive = flowField3Selector.checkboxValue();


    showHOLCTracts = showHOLCcheckbox.value();
    showingTractOutlines = tractOutlinesCheckbox.value();
    showFlowMap = flowMapCheckbox.value();
    showingMap = mainMapCheckbox.value();
    showParticles = particlesCheckbox.value();
    if(flowFields[0].presetIndex != flowField1Selector.selected()){
        presets[flowField1Selector.selected()].setActive(flowField1Selector.selected(),flowFields[0]);
    }
    if(flowFields[1].presetIndex != flowField2Selector.selected()){
        presets[flowField2Selector.selected()].setActive(flowField2Selector.selected(),flowFields[1]);
    }
    if(flowFields[2].presetIndex != flowField3Selector.selected()){
        presets[flowField3Selector.selected()].setActive(flowField3Selector.selected(),flowFields[2]);
    }
}
