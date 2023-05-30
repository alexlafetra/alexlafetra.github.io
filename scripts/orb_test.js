let img;
let vid1;
let vid2;
let shape = true;

const vidList = ["vid1.mp4","vid2.MOV","vid3.MOV","vid4.MOV","vid5.MOV"];

function preload(){
  let video1 = random(vidList);
  let video2 = random(vidList);
  // img = loadImage('images/goblin.jpg');
  vid1 = createVideo('orb/images/'+video1);
  vid1.elt.muted = true;
  vid1.loop();
  vid1.hide();
  // vid2 = createVideo('orb/images/'+video2);
  // vid2.elt.muted = true;
  // vid2.loop();
  // vid2.hide();
}

function setup() {
  createCanvas(250,250, WEBGL);
  pixelDensity(1);
  preload();
  noStroke();
}

function draw() {
  clear();
  line(-100,100,100,100);
  line(100,-100,100,100);
  line(100,-100,100,-100);
  line(100,-100,-100,-100);

  push();
  rotateX(frameCount/250);
  rotateZ(frameCount/250);
  texture(vid1);
  sphere(100);
  pop();

  // push();
  // rotateX(-frameCount/250);
  // rotateZ(-frameCount/250);
  // texture(vid2);
  // // box(120,120,120);
  // pop();

  if(shape){
    sphere(85);
    box(120,120,120);
  }
  if(!shape){
    texture(vid2);
    box(100,100,100);
  }
}

function toggleBox(){
  shape = !shape;
}

offset = 0;

function moveText(){
  offset += .1;
  let path = document.getElementById('curve');
  let rotation = 'rotate('+offset+' 100 100)';
  path.setAttribute('transform', rotation);
  if(offset > 360){
    offset = 0;
  }
}
// window.setInterval(moveText, 10);
