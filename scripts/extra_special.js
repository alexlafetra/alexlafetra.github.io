let cursorX;
let cursorY;
let extra_special;
let marginX;
let marginY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  
  marginX = windowWidth/6;
  marginY = windowHeight/6;
  
  cursorX = marginX;
  cursorY = 40+marginY;

  extra_special = false;
  running = true;
}

function draw() {
  if(running){
    let r = random(0,100);
    if(r > 98){
      extra_special = true;
    }
    //background(255);
    textSize(60);
    if(extra_special && cursorX<(windowWidth-textWidth("extraspecialextraspecial")-marginX)){
      fill(0);
      text('extraspeci',cursorX,cursorY);
      cursorX+=textWidth("extraspeci");
      fill(255,0,0);
      text('alex',cursorX,cursorY);
      cursorX+=textWidth("alex");
      fill(0);
      text('traspecial',cursorX,cursorY);
      cursorX+=textWidth("traspecial");
      extra_special = false;
    }
    else if(cursorX<(windowWidth-textWidth("extraspecial")-marginX)){
      fill(0);
      text('extraspecial',cursorX,cursorY);
      cursorX+=textWidth("extraspecial");
    }
    else{
      cursorX+=textWidth("extraspecial");
    }
    if(cursorX>=(width-marginX)){
      cursorY+=textAscent();
      if(cursorY>windowHeight-marginY){
        fill(255,0,0);
        text("LaFetra",textWidth("extraspecial")*(int(windowWidth-marginX)/int(textWidth("extraspecial"))),cursorY-textAscent());
        running = false;
      }
      cursorX = marginX;
    }
  }
}
function reset(){
  background(255);
  
  marginX = windowWidth/6;
  marginY = windowHeight/6;
  
  cursorX = marginX;
  cursorY = 40+marginY;

  extra_special = false;
  running = true;
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  reset();
}