/*

Usually it's a lot more visually pleasing to have two stats represented as colors, like white pop/another pop
I think this might be a little statistically misleading, but it also looks really nice so idk

*/
function colorStyle_whiteRatioComparison(tract){
    let whitePopulation2000 = tract.data2000.obj['White'];
    let whitePopulation2020 = tract.data2020.obj['White'];

    let blackPopulation2000 = tract.data2000.obj['Black'];
    let blackPopulation2020 = tract.data2020.obj['Black'];

    let asianPopulation2000 = tract.data2000.obj['Asian'];
    let asianPopulation2020 = tract.data2020.obj['Asian'];

    let totalPopulation2000 = tract.data2000.obj['Total'];
    let totalPopulation2020 = tract.data2020.obj['Total'];

    let val1 = whitePopulation2020/totalPopulation2020 - whitePopulation2000/totalPopulation2000;
    let val2 = blackPopulation2020/totalPopulation2020 - blackPopulation2000/totalPopulation2000;
    let val3 = asianPopulation2020/totalPopulation2020 - asianPopulation2000/totalPopulation2000;

    fill(map(val1,-0.4,0.3,0,255),0.0,map(val2,-0.1,0.8,255,0));
}
function colorStyle_blackRatioComparison(tract){
    let whitePopulation2000 = tract.data2000.obj['White'];
    let whitePopulation2020 = tract.data2020.obj['White'];

    let blackPopulation2000 = tract.data2000.obj['Black'];
    let blackPopulation2020 = tract.data2020.obj['Black'];

    let asianPopulation2000 = tract.data2000.obj['Asian'];
    let asianPopulation2020 = tract.data2020.obj['Asian'];

    let totalPopulation2000 = tract.data2000.obj['Total'];
    let totalPopulation2020 = tract.data2020.obj['Total'];

    let val2 = blackPopulation2020/totalPopulation2020 - blackPopulation2000/totalPopulation2000;

    // fill(map(val2,-0.1,0.6,0,255),map(val2,-0.1,0.3,0,255),0);
    let c1 = color(40, 250, 159);
    let c2 = color(250, 103, 40);
    fill(lerpColor(c1,c2,map(5*val2,-0.1,0.1,0,1)));
}
function colorStyle_asianRatioComparison(tract){
    let whitePopulation2000 = tract.data2000.obj['White'];
    let whitePopulation2020 = tract.data2020.obj['White'];

    let blackPopulation2000 = tract.data2000.obj['Black'];
    let blackPopulation2020 = tract.data2020.obj['Black'];

    let asianPopulation2000 = tract.data2000.obj['Asian'];
    let asianPopulation2020 = tract.data2020.obj['Asian'];

    let totalPopulation2000 = tract.data2000.obj['Total'];
    let totalPopulation2020 = tract.data2020.obj['Total'];

    let val1 = whitePopulation2020/totalPopulation2020 - whitePopulation2000/totalPopulation2000;
    let val2 = blackPopulation2020/totalPopulation2020 - blackPopulation2000/totalPopulation2000;
    let val3 = asianPopulation2020/totalPopulation2020 - asianPopulation2000/totalPopulation2000;

    fill(0.0,map(val3,-0.1,0.3,0,255),map(val3,-0.1,0.6,0,255));
}

function colorStyle_whiteComparison2020_2000(tract){
    let whitePopulation2000 = tract.data2000.obj['White'];
    let whitePopulation2020 = tract.data2020.obj['White'];

    let blackPopulation2000 = tract.data2000.obj['Black'];
    let blackPopulation2020 = tract.data2020.obj['Black'];

    let asianPopulation2000 = tract.data2000.obj['Asian'];
    let asianPopulation2020 = tract.data2020.obj['Asian'];

    let whitePplComparison = whitePopulation2020/whitePopulation2000;
    let blackPplComparison = blackPopulation2020/blackPopulation2000;
    let asianPplComparison = asianPopulation2020/asianPopulation2000;

    fill(whitePplComparison*125+50,50,blackPplComparison*125+50);
    // fill(whitePplComparison*125,255-whitePplComparison*125,0);
}
function colorStyle_blackComparison2020_2000(tract){
    let whitePopulation2000 = tract.data2000.obj['White'];
    let whitePopulation2020 = tract.data2020.obj['White'];

    let blackPopulation2000 = tract.data2000.obj['Black'];
    let blackPopulation2020 = tract.data2020.obj['Black'];

    let asianPopulation2000 = tract.data2000.obj['Asian'];
    let asianPopulation2020 = tract.data2020.obj['Asian'];

    let whitePplComparison = whitePopulation2020/whitePopulation2000;
    let blackPplComparison = blackPopulation2020/blackPopulation2000;
    let asianPplComparison = asianPopulation2020/asianPopulation2000;

    fill(whitePplComparison*125,255-blackPplComparison*125,0);
    // fill(0,blackPplComparison*125,blackPplComparison*125);
}
function colorStyle_asianComparison2020_2000(tract){
    let whitePopulation2000 = tract.data2000.obj['White'];
    let whitePopulation2020 = tract.data2020.obj['White'];

    let blackPopulation2000 = tract.data2000.obj['Black'];
    let blackPopulation2020 = tract.data2020.obj['Black'];

    let asianPopulation2000 = tract.data2000.obj['Asian'];
    let asianPopulation2020 = tract.data2020.obj['Asian'];

    let whitePplComparison = whitePopulation2020/whitePopulation2000;
    let blackPplComparison = blackPopulation2020/blackPopulation2000;
    let asianPplComparison = asianPopulation2020/asianPopulation2000;

    // fill(asianPplComparison*125,0,255-asianPplComparison*125);
    // fill(asianPplComparison*125,0,asianPplComparison*125);
    let c1 = color(87, 84, 255);
    let c2 = color(247, 2, 96);
    fill(lerpColor(c1,c2,map(whitePplComparison,0,1,-1,1)));
}

function mostWhiteChange(tract){
    return (tract.data2020.obj.White/tract.data2020.obj.Total)/(tract.data2000.obj.White/tract.data2000.obj.Total);
 }
 function mostBlackChange(tract){
    if(!tract.data2020.obj.Total || !tract.data2000.obj.Black || !tract.data2000.obj.Total){
        return forceScale;
    }
    let val = (tract.data2020.obj.Black/tract.data2020.obj.Total)/(tract.data2000.obj.Black/tract.data2000.obj.Total);
    return val;
 }
 function mostAsianChange(tract){
     return (tract.data2020.obj.Asian/tract.data2020.obj.Total)/(tract.data2000.obj.Asian/tract.data2000.obj.Total);
 }
 function whitePeopleComparedTo2000(tract){
     return tract.data2020.obj.White/tract.data2000.obj.White;
 }
 function blackPeopleComparedTo2000(tract){
    if(tract.data2000.obj.Black == 0){
        return forceScale;
    }
     return tract.data2020.obj.Black/tract.data2000.obj.Black;
 }
 function asianPeopleComparedTo2000(tract){
     return tract.data2020.obj.Asian/tract.data2000.obj.Asian;
 }
 function getTopNTracts(n,func){
     let vals = bayTracts.toSorted((a,b) => {
         if(!a.hasData || !b.hasData)
         return 0;
 
         let A = func(a);
         let B = func(b);
 
         if(A>B)
             return -1;
         else if(B>A)
             return 1;
         else
             return 0;
     });
     return vals.slice(0,n);
 }

 function getBottomNTracts(n,func){
     let vals = bayTracts.toSorted((a,b) => {
         if(!a.hasData || !b.hasData)
         return 0;
 
         let A = func(a);
         let B = func(b);
 
         if(A>B)
             return -1;
         else if(B>A)
             return 1;
         else
             return 0;
     });
     //be careful to skip the tracts that don't have data, which will be at the bottom
     for(let i = vals.length-1; i>=0; i--){
         if(vals[i].hasData){
             return vals.slice((i-n),i);
         }
     }
 }
 
 function getSignificantPoints(n,func){
     let tracts = getTopNTracts(n,func);
     let points = [];
     for(let i = 0; i<min(n,tracts.length); i++){
         let point = {
             x:((tracts[i].centroid.x+geoOffset.x)*scale.x+offset.x)/width+0.5,
             y:((tracts[i].centroid.y+geoOffset.y)*scale.y+offset.y)/height+0.5,
             strength:func(tracts[i])
         }
         points.push(point);
     }
     return points;
 }
 function getLeastSignificantPoints(n,func){
     let tracts = getBottomNTracts(n,func);
     let points = [];
     for(let i = 0; i<n; i++){
         let point = {
             x:((tracts[i].centroid.x+geoOffset.x)*scale.x+offset.x)/width+0.5,
             y:((tracts[i].centroid.y+geoOffset.y)*scale.y+offset.y)/height+0.5,
             strength:func(tracts[i])
         }
         points.push(point);
     }
     return points;
 }
 