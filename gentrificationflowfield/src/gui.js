class GuiSlider{
    constructor(min, max, init, step, label, container){
        this.label = label;
        this.container = createDiv();
        //create a container for the slider object and the label
        this.container.addClass('slider-container');

        //add the label
        this.textContainer = createDiv();
        this.textContainer.html(label+":"+init);
        this.textContainer.parent(this.container);

        //use p5js to create a slider, and parent it to the container
        this.slider = createSlider(min,max,init,step).parent(this.container);

        //parent the container to the "controls" div
        this.container.parent(container);

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
    constructor(text,clickHandler,container){
        this.button = createButton(text);
        this.button.addClass("gui_button");
        this.button.mouseClicked(clickHandler);
        this.button.parent(container);
    }
}

class GuiTextbox{
    constructor(text,container){
        this.textbox = createInput(text,'number');
        this.textbox.parent(container);
    }
    value(){
        return this.textbox.value();
    }
}

class GuiCheckbox{
    constructor(text,state,container){
        this.checkbox = createCheckbox(text,state);
        this.checkbox.parent(container);
    }
    value(){
        return this.checkbox.checked();
    }
    set(state){
        this.checkbox.checked(state);
    }
}

class GuiDropdown{
    constructor(options,defaultOption,container){
        this.selector = createSelect();
        for(let i = 0; i<options.length;i++){
            this.selector.option(options[i].title,i);
        }
        this.selector.addClass("gui_select");
        this.selector.selected(defaultOption);
        this.selector.parent(container);
    }
    value(){
        return this.selector.value();
    }
    selected(){
        return this.selector.selected();
    }
}

class FlowFieldSelector{
    constructor(options,defaultOption,label,container){
        this.container = createDiv();
        this.container.addClass('flowfield-container');

        //add the label
        this.textContainer = createDiv();
        this.textContainer.html(label);
        this.textContainer.parent(this.container);

        this.selector = createSelect();
        let indexOfDefaultOption = 0;
        for(let i = 0; i<options.length;i++){
            if(options[i].startsWith('<h>')){//check if it's a header
                options[i] = options[i].slice(3);
                this.selector.option(options[i],i);
                this.selector.elt.options[i].disabled = true;//disable it as an option if it is
            }
            else
                this.selector.option(options[i],i);
            if(options[i] === defaultOption)
                indexOfDefaultOption = i;

        }
        console.log(indexOfDefaultOption);
        this.selector.addClass("gui_select");
        this.selector.selected(indexOfDefaultOption);
        this.selector.parent(this.container);

        this.container.parent(container);
    }
    value(){
        return this.selector.value();
    }
    addHeader(label,index){
         // Add a header
        this.selector.option('Select an option', '');
        sel.elt.options[0].disabled = true;
    }
    selected(){
        return this.selector.selected();
    }
    checkboxValue(){
        return this.checkbox.checked();
    }
}