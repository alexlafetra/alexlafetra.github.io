//moving menu to face mouse
function faceMouse(){
    let xAngle = map((mouseY-height/2),-height/2,height/2,-90,90)*(0.6)+360;
    let yAngle = map((mouseX-width/2),-width/2,width/2,-90,90)*(-0.6)+360;
    let dist = p5.Vector.dist(createVector(mouseX,mouseY),createVector(windowWidth/2,windowHeight/2));
    let scale = 250;
    if(windowWidth<250*2.5){
        scale = windowWidth/2.5
    }
    let txt;
    //so it doesn't rotate when you're within the text
    if(dist>300){
        zAngle+=0.5;
    }
    txt = "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg) rotateZ("+zAngle+"deg) scale("+scale+"%)";

    let element = document.getElementById("text_svg");
    element.style.transform = txt;
}