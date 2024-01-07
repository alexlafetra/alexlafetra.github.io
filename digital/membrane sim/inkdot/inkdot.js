let resolution = 1;
let img;

class DotLayer{
  constructor(x,y,r,channel){
    this.offsetX = x;
    this.offsetY = y;
    this.rotation = r;
    this.color = channel;
  }
  render(){
    push();
    rotate(this.rotation);
    translate(this.offsetX,this.offsetY);
    for(let x = 0; x<img.width/resolution; x+=resolution){
      for(let y = 0; y<img.height/resolution; y+=resolution){
        
      }
    }
    pop();
  }
}

function setup() {

}


function draw() {

}
