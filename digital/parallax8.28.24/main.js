let startMousePosition = {x:0,y:0};
let started = false;
const defaultFontSize = 100;
const border = 100;

const links = [
    {
        title:"test",
        type:"a",
        href:"https://alexlafetra.github.io"
    },
    {
        title:"home",
        type:"a",
        href:"https://alexlafetra.github.io"
    },
    {
        title:"image",
        type:"img",
        src:"star_hires.png",
        width:"200px",
        href:"https://alexlafetra.github.io"
    }
]

function requestAccess(){
    //checking if it's an iphone
    //if there's a device orientation event object, and if requestPermission is a valid function
    if(typeof(DeviceOrientationEvent) !== 'undefined' && typeof(DeviceOrientationEvent.requestPermission) === 'function'){
        DeviceOrientationEvent.requestPermission();
    }
}

function setup(){
    let canvas = createCanvas(windowWidth, windowHeight);
    //every time the canvas is pressed, it'll try and request access
    // canvas.mousePressed(requestAccess);
    canvas.style.display = "absolute";
    // createElements();
    debug();
}

function createElements(){
    for(let link of links){
        let newElement = document.createElement(link.type);

        const x = random(border,windowWidth-border);
        const y = random(border,windowHeight-border);
        const z =  random(10,50);
        const size = pow(defaultFontSize/z,2);
        newElement.innerHTML = link.title;
        
        if(link.href)
            newElement.href = link.href;
        if(link.src)
            newElement.src = link.src;
        if(link.width)
            newElement.style.width = link.width;

        newElement.dataset.x = x;
        newElement.dataset.y = y;
        newElement.dataset.z = z;

        newElement.style.zIndex = round(z);
        newElement.style.left = x+"px";
        newElement.style.top = y+"px";
        newElement.style.position = 'absolute';
        newElement.style.fontSize = size+'px';
        newElement.className = "parallaxObject";
        document.body.appendChild(newElement);
    }

}
function debug(){
    for(let i = 0; i<100; i++){
        let newText = document.createElement("a");

        const x = random(0,windowWidth);
        const y = random(0,windowHeight);
        const z =  random(10,50);
        const size = pow(defaultFontSize/z,2);
        newText.innerHTML = "hey";
        newText.href = "idk";

        newText.dataset.x = x;
        newText.dataset.y = y;
        newText.dataset.z = z;

        newText.style.zIndex = round(z);
        newText.style.left = x+"px";
        newText.style.top = y+"px";
        newText.style.position = 'absolute';
        newText.style.fontSize = size+'px';
        newText.className = "parallaxObject";
        document.body.appendChild(newText);
    }
}
function mouseMoved(){
    if(!started){
        startMousePosition.x = mouseX;
        startMousePosition.y = mouseY;
        started = true;
    }

    const dX = mouseX-startMousePosition.x;
    const dY = mouseY-startMousePosition.y;

    let objects = document.getElementsByClassName("parallaxObject");

    for(let obj of objects){
        const newX = (Number(obj.dataset.x)+dX/obj.dataset.z);
        const newY = (Number(obj.dataset.y)+dY/obj.dataset.z);
        obj.style.left = newX  + 'px';
        obj.style.top = newY + 'px';
    }
}

function draw(){

}

function mousePressed(){
    // requestAccess();
}