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

let dampValueSlider;
let particleSlider;
let decaySlider;
let randomSlider;
let imageOpacitySlider;
let particleSizeSlider;

const guiSliders = [];
function initGui(){
    let gui = createDiv();
    gui.id("gui");
    dampValueSlider = new GuiSlider(0.001,0.02,dampValue,0.001,"Damping",'dampValue');
    particleSlider = new GuiSlider(1,dataTextureDimension*dataTextureDimension,NUMBER_OF_PARTICLES,1,"Particles",'NUMBER_OF_PARTICLES');
    decaySlider = new GuiSlider(0.01,0.3,decayValue,0.01,"decay",'decayValue');
    randomSlider = new GuiSlider(0,2.0,randomScale,0.01,"random",'randomScale');
    imageOpacitySlider = new GuiSlider(0,255,imageOpacity,1.0,"Opacity",'imageOpacity');
    particleLifespanSlider = new GuiSlider(0,2.0,particleAgeLimit,0.1,"Age",'imageOpacity');
    particleSizeSlider = new GuiSlider(0,2.0,0.6,0.1,"Size",'imageOpacity');
    new GuiButton("Reset",()=>{flowField.reset()});
    new GuiButton("Show Map",()=>{showingMap = !showingMap});
    new GuiButton("Show Data",()=>{flowField.showDataTextures = !flowField.showDataTextures});
    new GuiButton("Randomize Points",()=>{flowField.createFlowFieldFromPoints(genRandomPoints(5));});
}

function updateSliders(){
    decayValue = decaySlider.value();
    dampValue = dampValueSlider.value();
    NUMBER_OF_PARTICLES = particleSlider.value();
    randomScale = randomSlider.value();
    imageOpacity = imageOpacitySlider.value();
    particleAgeLimit = particleLifespanSlider.value();
    flowField.pointSize = particleSizeSlider.value();
}