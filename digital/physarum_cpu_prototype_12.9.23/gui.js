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

let sensorDistSlider;
let sensorAngleSlider;
let depositSlider;
let velSlider;
let senseSlider;
let diffuseSlider;
const guiSliders = [];
function initGui(){
    let gui = createDiv();
    gui.id("gui");
    new GuiButton("Show Grid",()=>{renderGrid = !renderGrid});
    new GuiButton("Show Vectors",()=>{renderVectors = !renderVectors});
    new GuiButton("Show Sensors",()=>{renderSensors = !renderSensors});
    new GuiButton("Show Particles",()=>{renderParticles = !renderParticles});
    new GuiButton("Toggle Diffusion",()=>{diffuseGrid = !diffuseGrid});
    sensorDistSlider = new GuiSlider(0.01,10.0,lookAheadDistance,0.01,"Sensor Distance",'lookAheadDistance');
    sensorAngleSlider = new GuiSlider(0.01,180.0,sensorAngle,0.01,"Sensor Angle",'sensorAngle');
    depositSlider = new GuiSlider(0.01,100.0,DEPOSIT_AMOUNT,0.01,"Deposition",'DEPOSIT_AMOUNT');
    velSlider = new GuiSlider(0.01,10.0,MAXVEL,0.1,"Velocity",'MAXVEL');
    senseSlider = new GuiSlider(0.01,10.0,SENSE_INFLUENCE,0.1,"Sense",'SENSE_INFLUENCE');
    diffuseSlider = new GuiSlider(0.01,1.0,diffusionStrength,0.01,"Diffusion Strength",'diffusionStrength');
}

function updateSliders(){
    lookAheadDistance = sensorDistSlider.value();
    sensorAngle = sensorAngleSlider.value();
    DEPOSIT_AMOUNT = depositSlider.value();
    MAXVEL = velSlider.value();
    SENSE_INFLUENCE = senseSlider.value();
    diffusionStrength = diffuseSlider.value();
}
