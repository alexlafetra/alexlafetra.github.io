class LabeledSlider{
    constructor(min, max, init, step, label){
        //create a container for the slider object and the label
        const container = createDiv();
        container.addClass('slider-container');

        //add the label
        container.html(label);
        //use p5js to create a slider, and parent it to the container
        this.slider = createSlider(min,max,init,step).parent(container);

        //parent the container to the "controls" div
        container.parent(document.getElementById("controls"));
    }
    value(){
        return this.slider.value();
    }
};
