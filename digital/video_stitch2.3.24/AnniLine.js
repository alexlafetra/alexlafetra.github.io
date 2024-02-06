
class AnniLine{
    constructor(x,y,theta,w,c,seed){
      this.seed = seed;
      this.width = w;//max L-R boundaries of the curve
      this.color = c;//line hue
      this.start = {x:x,y:y};//start point
      this.theta = theta;//start angle
      this.points = [];//array holding the two current points
      this.points.push(this.start);
      this.direction = UPRIGHT;//direction the curve is currently moving in
      this.count = 0;//how many steps the curve has taken in the current direction
      this.len = 2;//length multiplier of each step (randomized so this doesn't matter)
      this.threadGap = 5;
      this.thickness = 5;
      this.vertAngleChange = PI/40;//amount the curve bends by (larger vals ==> tighter turns)
      this.numberOfTurnSteps = 20;
      this.age = 0;//age of the line (better than using frameCount for noise values since this one is performance-independent)
      this.done = false;//set to tru when the line runs offscreen
  
      this.bendChance = (1/this.numberOfTurnSteps);
      this.justBent = false;
      this.justSplit = false;
  
      this.dropShadow = {x:0,y:-5};
  
      this.onTop = true;
    }
    grow(){
      if(this.done)
        return false;
      let theta = this.theta;
      switch(this.direction){
        case UPRIGHT:
          // theta -= this.vertAngleChange;
          theta -= PI/this.numberOfTurnSteps;
          if(theta>=PI/2 && theta<PI && !this.justBent){
            if(random(1)<this.bendChance){
              this.theta = PI/2;
              this.direction = UPLEFT;
              this.onTop = true;
              this.justBent = true;
              break;
            }
          }
          if(theta<=0){
            this.theta = 0;
            this.direction = RIGHT;
            this.count = 0;
            this.len = random(5,20);
            this.justBent = false;
            this.justSplit = false;
            this.onTop = !this.onTop;
            // return;
          }
          break;
        case LEFT:
          theta = PI+0.1*noise(this.age/10);
          if((random([0,0,0,0,3]) == 3 || this.count>maxLength) || this.points[this.points.length-1].x<(this.start.x-this.width)){
            this.direction = UPRIGHT;
            this.len = min(this.numberOfTurnSteps/5,2);
          }
          break;
        case UPLEFT:
          // theta += this.vertAngleChange;
          theta += PI/this.numberOfTurnSteps;
          if(theta<=PI/2 && theta>0 && !this.justBent){
            if(random(1)<this.bendChance){
              this.theta = PI/2;
              this.direction = UPRIGHT;
              this.onTop = true;
              this.justBent = true;
              break;
            }
          }
          if(theta>=PI){
            this.theta = PI;
            this.direction = LEFT;
            this.count = 0;
            this.len = random(5,20);
            this.justBent = false;
            this.justSplit = false;
            this.onTop = !this.onTop;
          }
          break;
        case RIGHT:
          theta = 0.1*noise(this.age/10);
          if((random([0,0,0,0,3]) == 3 || this.count>maxLength) || this.points[this.points.length-1].x>(this.start.x+this.width)){
            this.direction = UPLEFT;
            this.len = min(this.numberOfTurnSteps/5,2);
          }
          break;
      }
      let newPoint = {x:this.points[this.points.length-1].x+this.len*cos(theta),y:this.points[this.points.length-1].y+this.len*sin(theta)};
      this.points.push(newPoint);
      if(this.points.length>2){
        this.points = this.points.slice(-2);
      }
      this.theta = theta;
      this.count++;
      this.age++;
      if(this.direction != UPRIGHT && this.direction != UPLEFT){
        this.onTop = !this.onTop;
      }
      return true;
    }
    checkBounds(){
      if(this.points[this.points.length-1].y>height/2){
        this.done = true;
        return false;
      }
      else
        return true;
    }
    checkOtherCombine(other){
      //check if the other line is still growing
      if(other.done || this.justSplit || other.justSplit){
        return;
      }
      const threshold = 20;
      //check to see if any of your points are close enough
      for(let point of this.points){
        for(let otherPoint of other.points){
          if(p5.Vector.dist(createVector(point.x,point.y),createVector(otherPoint.x,otherPoint.y))<threshold && point.y<otherPoint.y){
            this.points[this.points.length - 1] = other.points[other.points.length-1];
            this.render();
            this.done = true;
          }
        }
      }
    }
    //split
    checkOtherSplit(other){
      //check if other has stopped
      if(!other.done)
        return;
      const chance = 0.01;
      if(random(1)<chance){
        other.points = this.points;
        other.hue = this.hue;
        other.done = false;
        other.justSplit = true;
      }
    }
    render(){
      if(this.done)
        return;
  
      let gap = this.threadGap*noise(2+this.age/10);
  
      //color
      noFill();
      noiseSeed(this.seed);
  
      //shadows
      colorMode(RGB);
      stroke(0,0,0,200);
      strokeWeight(this.thickness*noise(this.age/100));
      line(this.points[this.points.length-1].x-this.dropShadow.x,this.points[this.points.length-1].y-this.dropShadow.y,this.points[this.points.length-2].x-this.dropShadow.x,this.points[this.points.length-2].y-this.dropShadow.y);
      strokeWeight(this.thickness*noise(this.age/200));
      line(this.points[this.points.length-1].x+gap-this.dropShadow.x,this.points[this.points.length-1].y+gap-this.dropShadow.y,this.points[this.points.length-2].x+gap-this.dropShadow.x,this.points[this.points.length-2].y+gap-this.dropShadow.y);
      strokeWeight(this.thickness*noise(this.age/10));
      line(this.points[this.points.length-1].x-gap-this.dropShadow.x,this.points[this.points.length-1].y-gap-this.dropShadow.y,this.points[this.points.length-2].x-gap-this.dropShadow.x,this.points[this.points.length-2].y-gap-this.dropShadow.y);
      
      colorMode(HSB,100);
      let n = 20*noise(this.points[this.points.length-1].y/50);
      stroke(n+hue(this.color),saturation(this.color),brightness(this.color));
      strokeWeight(this.thickness*noise(this.age/100));
      line(this.points[this.points.length-1].x,this.points[this.points.length-1].y,this.points[this.points.length-2].x,this.points[this.points.length-2].y);
  
      strokeWeight(this.thickness*noise(this.age/200));
      line(this.points[this.points.length-1].x+gap,this.points[this.points.length-1].y+gap,this.points[this.points.length-2].x+gap,this.points[this.points.length-2].y+gap);
      
      strokeWeight(this.thickness*noise(this.age/10));
      line(this.points[this.points.length-1].x-gap,this.points[this.points.length-1].y-gap,this.points[this.points.length-2].x-gap,this.points[this.points.length-2].y-gap);
      colorMode(RGB);
    }
    renderStitchBuffer(){
      if(this.done)
        return;
      let gap = this.threadGap*noise(2+this.age/10);
      stitchPatternBuffer2.begin();
      noiseSeed(this.seed);
      noFill();
  
      //Shadows
      stroke(this.onTop?color(0,0,255,5):color(255,0,0,5));
      strokeWeight(this.thickness*noise(this.age/100));
      line(this.points[this.points.length-1].x-this.dropShadow.x,this.points[this.points.length-1].y-this.dropShadow.y,this.points[this.points.length-2].x-this.dropShadow.x,this.points[this.points.length-2].y-this.dropShadow.y);
      strokeWeight(this.thickness*noise(this.age/200));
      line(this.points[this.points.length-1].x+gap-this.dropShadow.x,this.points[this.points.length-1].y+gap-this.dropShadow.x,this.points[this.points.length-2].x+gap-this.dropShadow.x,this.points[this.points.length-2].y+gap-this.dropShadow.x);
      strokeWeight(this.thickness*noise(this.age/10));
      line(this.points[this.points.length-1].x-gap-this.dropShadow.x,this.points[this.points.length-1].y-gap-this.dropShadow.x,this.points[this.points.length-2].x-gap-this.dropShadow.x,this.points[this.points.length-2].y-gap-this.dropShadow.x);
  
      //Strokes
      stroke(this.onTop?'blue':'red');
      strokeWeight(this.thickness*noise(this.age/100));
      line(this.points[this.points.length-1].x,this.points[this.points.length-1].y,this.points[this.points.length-2].x,this.points[this.points.length-2].y);
      strokeWeight(this.thickness*noise(this.age/200));
      line(this.points[this.points.length-1].x+gap,this.points[this.points.length-1].y+gap,this.points[this.points.length-2].x+gap,this.points[this.points.length-2].y+gap);
      strokeWeight(this.thickness*noise(this.age/10));
      line(this.points[this.points.length-1].x-gap,this.points[this.points.length-1].y-gap,this.points[this.points.length-2].x-gap,this.points[this.points.length-2].y-gap);
      stitchPatternBuffer2.end();
    }
    growAcrossScreen(){
      while(this.grow()){
        this.render();
      }
      return;
    }
  }