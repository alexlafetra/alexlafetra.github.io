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

class GuiColorPicker{
    constructor(defaultColor){
        this.colorPicker = createColorPicker(defaultColor);
        this.colorPicker.parent(document.getElementById("gui"));
    }
    value(){
        return this.colorPicker.color();
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
let showDataCheckbox;
let repulsionCheckbox;
let attractionCheckbox;
let continuousCheckbox;

let particleColorPicker;
let backgroundColorPicker;

let presetSelector;

const guiSliders = [];
function initGui(){
    let gui = document.getElementById("gui");
    if(!gui){
        gui = createDiv();
        gui.id("gui");
    }
    dampValueSlider = new GuiSlider(0.001,0.02, flowField.velDampValue,0.001,"Damping",'dampValue');
    particleSlider = new GuiSlider(1,dataTextureDimension*dataTextureDimension,flowField.particleCount,1,"Particles",'NUMBER_OF_PARTICLES');
    decaySlider = new GuiSlider(0.01,1.0,flowField.trailDecayValue,0.01,"decay",'decayValue');
    // randomSlider = new GuiSlider(0,2.0,flowField.randomAmount,0.01,"Random Amount",'randomScale');
    // particleLifespanSlider = new GuiSlider(1,200,flowField.particleAgeLimit,1,"Age",'imageOpacity');
    particleSizeSlider = new GuiSlider(0,20.0,flowField.pointSize,0.1,"Size",'imageOpacity');
    forceStrengthSlider = new GuiSlider(0,1.0,flowField.forceStrength,0.001,"Force",'imageOpacity');

    attractionCheckbox = new GuiCheckbox("Attractors",flowField.attraction);
    repulsionCheckbox = new GuiCheckbox("Repulsors",flowField.repulsion);
    // flowMapCheckbox = new GuiCheckbox("Flow Map",showFlowMap);
    showDataCheckbox = new GuiCheckbox("Show Data",flowField.showingData);
    continuousCheckbox = new GuiCheckbox("Cycle Thru Attractors",continouslyRandomizeAttractors);

    particleColorPicker = new GuiColorPicker(flowField.particleColor);
    backgroundColorPicker = new GuiColorPicker(flowField.backgroundColor);

    new GuiButton("Randomize Flow Field",()=>{calculateRandomAttractors(NUMBER_OF_ATTRACTORS);});
    new GuiButton("Reset Particles",()=>{flowField.resetParticles()});
}

function updateSliders(){
    flowField.velDampValue = dampValueSlider.value();
    flowField.particleCount = particleSlider.value();
    // flowField.randomAmount = randomSlider.value();
    flowField.trailDecayValue = decaySlider.value();
    // flowField.particleAgeLimit = particleLifespanSlider.value();
    flowField.pointSize = particleSizeSlider.value();
    flowField.forceStrength = forceStrengthSlider.value();

    // showFlowMap = flowMapCheckbox.value();
    flowField.showingData = showDataCheckbox.value();
    flowField.attraction = attractionCheckbox.value();
    flowField.repulsion = repulsionCheckbox.value();
    continouslyRandomizeAttractors = continuousCheckbox.value();

    flowField.backgroundColor = backgroundColorPicker.value();
    flowField.particleColor = particleColorPicker.value();
}
