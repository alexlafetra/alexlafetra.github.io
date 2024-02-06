/*
remaking the beat windows project
*/

let windows = [];

let winA;
let winB;

class LittleWindow{
  constructor(w,h,c){
    this.window = window.open("", "", `width=${w}, height=${h}`);
    this.window.document.body.style.backgroundColor = c;
  }
}

function setup(){
  winA = new LittleWindow(400,400,'red');
  winB = new LittleWindow(400,400,'blue');
}
function draw(){
  // console.log(getClosestDistanceBetween(winA,winB));
}

function distBetween(a,b){
  const dX = a.x - b.x;
  const dY = a.y - b.y;
  return Math.sqrt(dX*dX+dY*dY);
}

function isWithinWindow(point,w){
  if(point.x>=w.screenLeft && point.x<=w.screenLeft+w.outerWidth && point.y >= w.screenTop && point.y <= w.screenTop + w.outerHeight){
    return true;
  }
  return false;
}

function getClosestDistanceBetween(wA,wB){
  //figure out the line connecting the centers of the two windows
  let cA = {x:wA.screenLeft+wA.outerWidth/2,y:wA.screenTop+wA.outerHeight/2};
  let cB = {x:wB.screenLeft+wB.outerWidth/2,y:wB.screenTop+wB.outerHeight/2};
  // console.log("A:");
  // console.log(cA);
  // console.log("B:");
  // console.log(cB);

  let m = (cB.y-cA.y)/(cB.x - cA.x);
  //b = y-mx
  let b =  cB.y-m*cB.x;

  // console.log("m:");
  // console.log(m);

  //get the two points on the window border that fall on that line
  //points can be on either of the four sides, but only two of them will still be within the rect
  //I really think there's a better way of doing this! but i'm not sure what it is

  //right side
  let pointsA = [{x:cA.x+wA.outerWidth/2,y:m*(cA.x+wA.outerWidth/2)+b},
                 {x:cA.x-wA.outerWidth/2,y:m*(cA.x-wA.outerWidth/2)+b},
                 {x:((cA.y-wA.outerHeight/2)-b)/m,y:cA.y-wA.outerHeight/2},
                 {x:((cA.y+wA.outerHeight/2)-b)/m,y:cA.y-wA.outerHeight/2}];
  let validPointsA = [];

  let pointsB = [{x:cB.x+wB.outerWidth/2,y:m*(cB.x+wB.outerWidth/2)+b},
                 {x:cB.x-wB.outerWidth/2,y:m*(cB.x-wB.outerWidth/2)+b},
                 {x:((cB.y-wB.outerHeight/2)-b)/m,y:cB.y-wB.outerHeight/2},
                 {x:((cB.y+wB.outerHeight/2)-b)/m,y:cB.y-wB.outerHeight/2}];
  let validPointsB = [];
  
  //figure out which two points are the valid points
  for(let point of pointsA){
    if(isWithinWindow(point,wA)){
      validPointsA.push(point);
    }
  }
  for(let point of pointsB){
    if(isWithinWindow(point,wB)){
      validPointsB.push(point);
    }
  }

  //get the distances between all the points, figure out which is closest
  let distances = [];
  for(let pointA of validPointsA){
    for(let pointB of validPointsB){
      distances.push(distBetween(pointA,pointB));
    }
  }


  distances.sort((a,b) => {
    if(a>b) 
      return 1;
    else if(b>a)
      return -1;
    else return 0;});
  return distances[0];
}