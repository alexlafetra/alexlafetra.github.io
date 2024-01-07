//Using an example taken from: https://mits003.github.io/studio_null/2021/11/geojson-with-p5js/
/*

    To do:
        get missing county data
        get data for 2010 for all counties+tracts
        build tract conversion tool to convert data from 2000 --> 2020 (or 2000-->2010)

    creating normal maps using:
        https://cpetry.github.io/NormalMap-Online/

*/
/*
    Bay Area county codes
    taken from: https://www.weather.gov/hnx/cafips

    Alameda = 001
    Contra Costa = 013
    Marin = 041
    Napa = 055
    SF = 075
    San Mateo = 081
    Santa Clara = 085
    Solano = 095
    Sonoma = 097
*/
/*
    The tract .geojson file was created using the US Census Tract shapefiles from census.gov
    and converting them using QGIS
*/


let bayTracts;//Object with all the tract geo+data 

//CA geometry from https://github.com/arcee123/GIS_GEOJSON_CENSUS_TRACTS/tree/master
let tractGeometry;

//Data from my census work (make a way for this to be raw from the US census site)
let data2000;
let data2020;

//conversion forms
let substantiallyChanged2000;
let substantiallyChanged2010;
let conversions2000to2010;
let conversions2010to2020;

//Parameters for viewing the map
let offset;
let scale;
let geoOffset;

//HOLC tract shapes taken from https://dsl.richmond.edu/panorama/redlining/data
let oakHolcTracts;
let sfHolcTracts;
let sjHolcTracts;

let threshold = 0.1;
let mapTexture;
let holcTexture;

function cleanCensusData(){
    //parsing tract/county codes into 'Tract' and 'County' columns respectively
    getTractAndCountyCodes(data2000);
    getTractAndCountyCodes(data2020);
    //filtering data so it's faster to process
    data2000 = filterNonBayAreaCounties(data2000);
    data2020 = filterNonBayAreaCounties(data2020);

    //Converting 2000's data into 2020 data
    // data2000 = convertTracts(data2000,conversions2000to2010,substantiallyChanged2000,'GEOID00','GEOID10','2000',false);//GEOID's are stored under this name
    // data2000 = convertTracts(data2000,conversions2010to2020,substantiallyChanged2010,'GEOID_TRACT_10','GEOID_TRACT_20','Converted 2010',true);//GEOID's are stored in column 8, here (0 indexed)
}

function filterNonBayAreaCounties(data){
    let convertedData = new p5.Table();
    convertedData.columns = data.columns;
    let rowID = 0;
    for(let row of data.getRows()){
        let countyID = row.get('County');
        if(isItInTheBayTho(countyID)){
            convertedData.addRow(row);
        }
        rowID++;
    }
    return convertedData;
}

let TRACT_COLUMN_ID;
let COUNTY_COLUMN_ID;

function getTractAndCountyCodes(data){
    //adding 6-digit tract id's for 2000
    data.addColumn('Tract');
    TRACT_COLUMN_ID = data.getColumnCount()-1;
    data.addColumn('County');
    COUNTY_COLUMN_ID = data.getColumnCount()-1;

    let rows = data.getRows();
    for(let row of rows){
        let GEOID = row.get("GEOID");
        row.set('Tract',GEOID.slice(-6));
        row.set('County',GEOID.slice(-9,-6));
    }
} 

function search(tractID,column){
    let tract2000 = data2000.findRows(tractID,column);
    console.log("2000:");
    console.log(tract2000);
    let tract2020 = data2020.findRows(tractID,column);
    console.log("2020:");
    console.log(tract2020);
}

function convertTracts(dataIn,conversionSheet,substantiallyChangedTracts,oldGeoIDColumnName,newGeoIDColumnName,whichYear,silently){
    //New array of p5.TableRow objects to store the data in
    let convertedData = new p5.Table();
    convertedData.columns = dataIn.columns;
    // convertedData.clearRows();
    //iterate over every row in the dataset
    for(let i = 0; i<min(dataIn.getRowCount(),1000000000); i++){
        let originalTract = dataIn.getRow(i);

        //get the full GEOID
        let idToConvert = originalTract.get('GEOID').slice(-11);

        let tractID = idToConvert.slice(-6);//6 digit id

        //get each instance of the geoid occuring in the conversion sheet
        let equivalents = conversionSheet.findRows(idToConvert,oldGeoIDColumnName);
        let numberOfEquivalents = equivalents.length;

        if(!silently){
            console.log("converting tract "+idToConvert+":");
            console.log(originalTract)
            console.log("Into "+numberOfEquivalents+" new tracts.");
        }
        //if there are no equivalents, then you don't need to convert it
        if(numberOfEquivalents == 0){
            convertedData.addRow(originalTract);
            continue;
        }
        //creating the new data (or adding to existing data)
        for(let equivalentIndex = 0; equivalentIndex<numberOfEquivalents; equivalentIndex++){
            let newGeoID = equivalents[equivalentIndex].get(newGeoIDColumnName);
            if(!silently){
                console.log("conversion #"+equivalentIndex+":");
                console.log(tractID+"-->"+newGeoID);
            }
            //Check and see if a tract has already been created in the new data with this geoid
            let newTract = convertedData.findRow(newGeoID.slice(-6),'Tract');
            //if you find one that already exists
            if(newTract){
                if(!silently){
                    console.log("A tract has already been converted to a tract with this new GeoID. Adding weighted data to it...");
                    console.log("start:");
                    console.log(newTract.get('Total'));
                }
                
                // console.log("A tract with ID "+newGeoID+" already exists. Adding weighted data to it.");
                //Add the weighted data to it
                for(let j = 0; j<dataIn.getColumnCount(); j++){
                    let newValue = parseFloat(newTract.get(j))+parseFloat(originalTract.get(j))/numberOfEquivalents;
                    // newTract.set(j,String(newValue));
                    newTract.set(j,newValue);
                }
            }
            //if the new tract hasn't already been created, make one
            else{
                newTract = convertedData.addRow();
                if(!silently){
                    console.log("Creating a new tract...");
                    console.log("start:");
                    console.log(newTract.get('Total'));
                }
                // console.log("Creating a new tract with ID "+newGeoID);
                //copy in each data point, and weight it
                for(let j = 0; j<dataIn.getColumnCount(); j++){
                    let newValue = parseFloat(originalTract.get(j))/numberOfEquivalents;
                    // newTract.set(j,String(newValue));
                    newTract.set(j,newValue);
                }
            }
            newTract.set('GEOID','1400000US'+newGeoID);
            newTract.set('Label for GEO_ID',"Census Tract "+newGeoID.slice(-6));
            newTract.set('County',newGeoID.slice(-9,-6));
            newTract.set('Tract',newGeoID.slice(-6));
            newTract.convertedFrom = whichYear;
            //make sure to put the newly added-to tract back into the array
            convertedData.addRow(newTract);
            if(!silently){
                console.log("end:");
                console.log(newTract.get('Total'));
            }
        }
    }
    return convertedData;
}

function clearHighlight(){
    indexOfClickedTract = -1;
}

function highlight(tractID){
    let i = 0;
    for(let tract of bayTracts){
        if(tract.properties.TRACTCE == tractID){
            indexOfClickedTract = i;
            return;
        }
        i++;
    }
}

//calculate the arithmetic mean (centroid) of each shape
function calculateGeographicCenters(){
    let tracts = bayTracts;
    for(let tract of tracts){
        let geom = tract.geometry;
        let polygons = geom.coordinates;
        let coords = polygons[0][0];
        let centroid = {x:0,y:0};
        for (let j = 0; j < coords.length; j++) {
            centroid.x += coords[j][0];
            centroid.y += coords[j][1];
        }
        centroid.x /= coords.length;
        centroid.y /= coords.length;
        tract.centroid = centroid;
    }
}

//checks if a county code is within the 9 bay area counties
function isItInTheBayTho(countyCode){
    switch(countyCode){
        //AC county
        case '001':
            return true;
        case '013':
            return true;
        case '041':
            return true;
        case '055':
            return true;
        case '075':
            return true;
        case '081':
            return true;
        case '085':
            return true;
        case '095':
            return true;
        case '097':
            return true;
    }
    return false;
}

function alignGeoAndData(features){
    bayTracts = [];
    missingTracts = [];
    for(let tract of features){
        let countyFIPSCode = tract.properties.COUNTYFP;
        if(isItInTheBayTho(countyFIPSCode)){
            // get tract id from the geojson file
            let tractID = tract.properties.TRACTCE;
            // use that id to lookup the racial demographic data from 2000
            // let row2000 = data2000.findRow(tractID,'Tract Number');
            let row2000 = data2000.findRow(tractID,'Tract');
            if(!row2000){
                tract.hasData2000 = false;
                missingTracts.push(tractID+" -- 2000");
            }
            let row2020 = data2020.findRow(tractID,'Tract');
            if(!row2020){
                missingTracts.push(tractID+" -- 2020");
            }
            //add that data to the tract object, if you found some data
            if(row2000 && row2020){
                //if there are people in the tract
                if(row2000.get('Total') > 0 && row2020.get('Total') > 0){
                    tract.data2000 = row2000;
                    tract.data2020 = row2020;
                    tract.hasData = true;
                }
            }
            else{
                tract.hasData = false;
            }
            bayTracts.push(tract);
        }
    }
    console.log("Missing tracts:");
    for(let i of missingTracts){
        console.log(i);
    }
}

//Storing some overall totals in the "totalStats" object
let totalStats;
function getTotalStats(){
    totalStats = {'2000':{total:0,
                          white:0,
                          black:0,
                          asian:0},
                  '2020':{total:0,
                          white:0,
                          black:0,
                          asian:0}};

    for(let tract of bayTracts){
        if(!tract.hasData)
            continue;
        totalStats[2000].white += tract.data2000.obj['White'];
        totalStats[2020].white += tract.data2020.obj['White'];

        totalStats[2000].black += tract.data2000.obj['Black'];
        totalStats[2020].black += tract.data2020.obj['Black'];

        totalStats[2000].asian += tract.data2000.obj['Asian'];
        totalStats[2020].asian += tract.data2020.obj['Asian'];

        totalStats[2000].total += tract.data2000.obj['Total'];
        totalStats[2020].total += tract.data2020.obj['Total'];
    }
}

let pointsAndWeights = [];

function renderCentroids(geometryOffset){
    //rendering each tract
    for(let tract of bayTracts){
        if(!tract.hasData)
            continue;
        // let whitePopulation2000 = parseFloat(tract.data2000.obj['White'].replace(/,/g, ''));
        // let whitePopulation2020 = parseFloat(tract.data2020.obj['White'].replace(/,/g, ''));

        // let blackPopulation2000 = parseFloat(tract.data2000.obj['Black'].replace(/,/g, ''));
        // let blackPopulation2020 = parseFloat(tract.data2020.obj['Black'].replace(/,/g, ''));

        // let asianPopulation2000 = parseFloat(tract.data2000.obj['Asian'].replace(/,/g, ''));
        // let asianPopulation2020 = parseFloat(tract.data2020.obj['Asian'].replace(/,/g, ''));

        // let totalPopulation2000 = parseFloat(tract.data2000.obj['Total'].replace(/,/g, ''));
        // let totalPopulation2020 = parseFloat(tract.data2020.obj['Total'].replace(/,/g, ''));

        // let value = ((whitePopulation2020/totalPopulation2020)-(whitePopulation2000/totalPopulation2000));
        // if(value>threshold){
        // }
        stroke(0,255,0);
        if(tract.isClicked){
            fill(255);
        }
        else{
            noFill();
        }
        let x = (tract.centroid.x+geometryOffset.x)*scale.x+offset.x;
        let y = (tract.centroid.y+geometryOffset.y)*scale.y+offset.y;
        ellipse(x,y,10,10);
    }
}

function drawTract(geometry,geometryOffset){
    let polygons = geometry.coordinates[0];
    let coords = polygons[0];
    beginShape();
    for (let j = 0; j < coords.length; j++) {
        let x = (coords[j][0]+geometryOffset.x)*scale.x+offset.x;
        let y = (coords[j][1]+geometryOffset.y)*scale.y+offset.y;
        vertex(x,y);
    }
    endShape(CLOSE);
}


function temp_style(tract){
          let whitePopulation2000 = tract.data2000.obj['White'];
          let whitePopulation2020 = tract.data2020.obj['White'];

          let blackPopulation2000 = tract.data2000.obj['Black'];
          let blackPopulation2020 = tract.data2020.obj['Black'];

          let asianPopulation2000 = tract.data2000.obj['Asian'];
          let asianPopulation2020 = tract.data2020.obj['Asian'];

          let totalPopulation2000 = tract.data2000.obj['Total'];
          let totalPopulation2020 = tract.data2020.obj['Total'];

          //Black population comparison
          let changeInBlackPopulation = totalStats[2020].black/totalStats[2000].black - 1;
          let changeInTotalOverallPopulation = totalStats[2020].total/totalStats[2000].total - 1;

          let r = 0;
          let b = 0
          if(changeInBlackPopulation > changeInTotalOverallPopulation)
              b = 255;
          else
              r = 255;

          //blue are areas where black people have increased more than other groups, red are areas where black people have decreased more than other groups
        //   fill(r,0,b);

          //White population comparison (blue are areas where white percentage has decreased more than the total population, red are areas where it's increased more than the total population)
          let changeInWhitePopulation = whitePopulation2020/whitePopulation2000 - 1;
          r = 0;
          b = 0;
          if(changeInWhitePopulation > changeInTotalOverallPopulation)
              r = abs(255*changeInWhitePopulation);
          else
              b = abs(255*changeInWhitePopulation);

          //blue are areas where black people have increased more than other groups, red are areas where black people have decreased more than other groups
        //   fill(r,0,b);

          //color by 2000 demographics (red is white, green is black, blue is asian)
        //   fill(255*whitePopulation2000/totalPopulation2000,255*blackPopulation2000/totalPopulation2000,255*asianPopulation2000/totalPopulation2000);
          //2020 demographics
          // fill(255*whitePopulation2020/totalPopulation2020,255*blackPopulation2020/totalPopulation2020,255*asianPopulation2020/totalPopulation2020);
          // fill(455*pow(whitePopulation2020/totalPopulation2020,2));

          //color by percentage of white people (red is where white people became more siginificant,blue is where they became less, and purple is where they stayed the same)
        //   fill(pow(whitePopulation2020/totalPopulation2020,4)*255,100,pow(whitePopulation2000/totalPopulation2000,4)*255);
        //   colorMode(HSB,100);

          let val1 = whitePopulation2020/totalPopulation2020 - whitePopulation2000/totalPopulation2000;
          let val2 = blackPopulation2020/totalPopulation2020 - blackPopulation2000/totalPopulation2000;
          let val3 = asianPopulation2020/totalPopulation2020 - asianPopulation2000/totalPopulation2000;
          fill(map(val1,-0.1,0.3,0,255),0.0,map(val2,-0.1,0.3,0,255));
        //   fill(map(val1,-0.5,0.5,0,255),map(val3,-0.5,0.5,0,255),map(val2,-0.5,0.5,0,255));

          // fill(map(val,1,-1,0,100),100,map(val,-1,1,0,100));
          // fill(255-255*((whitePopulation2020/totalPopulation2020)-(whitePopulation2000/totalPopulation2000)),0,0);

          //same, but for black people (green is where population has risen, red is where population has fallen)
          // fill(blackPopulation2000/totalPopulation2000*255,blackPopulation2020/totalPopulation2020*255,0);

          // fill(0,255*(blackPopulation2020/totalPopulation2020)/(blackPopulation2000/totalPopulation2000),0);

          // fill(0,255*blackPopulation2000/totalPopulation2000,0);
          // fill(0,0,255*asianPopulation2000/totalPopulation2000);
          // fill(255*whitePopulation2000/totalPopulation2000,0,0);

          // fill(totalPopulation2020/totalPopulation2000*50);
}

function style_4(tract){
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
    // fill(map(val1,-0.5,0.5,0,255),map(val3,-0.5,0.5,0,255),map(val2,-0.5,0.5,0,255));
    fill(map(val1,-0.5,0.5,0,255),map(val3,-0.5,0.5,0,255),map(val2,-0.5,0.5,0,255));
}
function whiteProportion(tract){
    let whitePopulation2000 = tract.data2000.obj['White'];
    let whitePopulation2020 = tract.data2020.obj['White'];

    let blackPopulation2000 = tract.data2000.obj['Black'];
    let blackPopulation2020 = tract.data2020.obj['Black'];

    let asianPopulation2000 = tract.data2000.obj['Asian'];
    let asianPopulation2020 = tract.data2020.obj['Asian'];

    let totalPopulation2000 = tract.data2000.obj['Total'];
    let totalPopulation2020 = tract.data2020.obj['Total'];

    let changeInProportion = whitePopulation2020/totalPopulation2020 - whitePopulation2000/totalPopulation2000;
    let r = map(changeInProportion,-0.3,0.3,0,255);
    let b = map(changeInProportion,0.3,-0.3,0,255);
    fill(r,r,r);
}
function style_1(tract){
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
    // fill(map(val1,-0.5,0.5,0,255),map(val3,-0.5,0.5,0,255),map(val2,-0.5,0.5,0,255));
    fill(map(val1,-0.5,0.5,0,255),0,0);
}
function style_2(tract){
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
    // fill(map(val1,-0.5,0.5,0,255),map(val3,-0.5,0.5,0,255),map(val2,-0.5,0.5,0,255));
    fill(0,map(val3,-0.5,0.5,0,255),0);
}
function style_3(tract){
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
    // fill(map(val1,-0.5,0.5,0,255),map(val3,-0.5,0.5,0,255),map(val2,-0.5,0.5,0,255));
    fill(0,0,map(val2,-0.5,0.5,0,255));
}

//Draws tract geometry, can be filled for different data visualizations
function renderTracts(geometryOffset,colorstyle){
    //rendering each tract
    for(let tract of bayTracts){
        if(tract.hasData){
            colorstyle(tract);
        }
        else{
            continue;
        }
        noStroke();
        drawTract(tract.geometry,geometryOffset);
    }
}

function renderTractOutlines(geometryOffset,color){
    //rendering each tract
    stroke(color);
    noFill();
    for(let tract of bayTracts){
        drawTract(tract.geometry,geometryOffset);
    }
}

let indexOfClickedTract = -1;

function printDemographics(tract){
    console.log("-------- Demographics --------");
    console.log("Total | 2000 | 2020")
    console.log("      "+round(tract.data2000.get('Total'))+"|"+round(tract.data2020.get('Total')));
    console.log("White | 2000 | 2020")
    console.log("      "+round(tract.data2000.get('White'))+"|"+round(tract.data2020.get('White')));
    console.log("Black | 2000 | 2020")
    console.log("      "+round(tract.data2000.get('Black'))+"|"+round(tract.data2020.get('Black')));
    console.log("Asian | 2000 | 2020")
    console.log("      "+round(tract.data2000.get('Asian'))+"|"+round(tract.data2020.get('Asian')));
}

function fillPointsAndWeightsWithRandom(){
    pointsAndWeights = [];
    for(let i = 0; i<13; i+=3){
        pointsAndWeights.push(random(1));
        pointsAndWeights.push(random(1));
        pointsAndWeights.push(random(1.3));
    }
}

function clickClosestCentroid(coord){
    let closestDistance = null;
    let closestIndex = 0;
    let i = 0;
    let foundAtLeastOne = false;
    for(let tract of bayTracts){
        let x = (tract.centroid.x+geoOffset.x)*scale.x+offset.x;
        let y = (tract.centroid.y+geoOffset.y)*scale.y+offset.y;
        let v = createVector(x,y);
        let d = p5.Vector.dist(v,coord);
        if(d<closestDistance || closestDistance == null){
            closestDistance = d;
            closestIndex = i;
            foundAtLeastOne = true;
        }
        i++;
        tract.isClicked = false;
    }
    if(!foundAtLeastOne)
        return;
    let tract = bayTracts[closestIndex];
    bayTracts[closestIndex].isClicked = true;
    indexOfClickedTract = closestIndex;
    stroke(255);
}

function click(tract){
    bayTracts[tract].isClicked = true;
}


//draws HOLC tracts as line drawings
function renderHOLCTracts(geometryOffset,holcTracts){
    //rendering each tract
    for(let tract of holcTracts.features){
        let polygons = tract.geometry.coordinates;
        let grade = tract.properties.grade;
        if(grade != "D")
            continue;
        let color = tract.properties.fill;
        let industrial = tract.properties.industrial;
        stroke(255);
        noFill();

        //these are multipolygons, so you need to iterate over each one
        for(let shape of polygons){
            beginShape();
            let coords = shape[0];
            for (let j = 0; j < coords.length; j++) {
                let x = (coords[j][0]+geometryOffset.x)*scale.x+offset.x;
                let y = (coords[j][1]+geometryOffset.y)*scale.y+offset.y;
                vertex(x,y);
            }
            endShape(CLOSE);
        }
    }
}

function renderMap(){
    mapTexture.begin();
    renderTracts(geoOffset,temp_style);

    // drawing points
    // let sigPoints = getSignificantPoints(mostWhiteChange,5);
    // for(let i = 0; i<sigPoints.length; i++){
    //     push();
    //     strokeWeight(5);
    //     stroke(255,0,0);
    //     let x = (sigPoints[i].x+geoOffset.x)*scale.x+offset.x;
    //     let y = (sigPoints[i].y+geoOffset.y)*scale.y+offset.y;
    //     translate(x,y);
    //     point(0,0);
    //     pop();
    // }
    mapTexture.end();
}

function renderMapOutline(c){

    mapTexture.begin();
    renderTractOutlines(geoOffset,c);

    let sigPoints = getSignificantPoints(mostWhiteChange,5);
    for(let i = 0; i<sigPoints.length; i++){
        push();
        strokeWeight(5);
        stroke(255,0,0);
        let x = (sigPoints[i].x+geoOffset.x)*scale.x+offset.x;
        let y = (sigPoints[i].y+geoOffset.y)*scale.y+offset.y;
        translate(x,y);
        point(0,0);
        pop();
    }
    mapTexture.end();

}

//get the average distance to all centroids * the weight of those centroids
function calculateAvgWeightedDistance(x,y){
    let pointA = createVector(x,y);
    let distance = 0;
    for(let point of pointsAndWeights){
        let pointB = createVector(point.x,point.y);
        distance+=p5.Vector.dist(pointA,pointB)*point.weight;
    }
    distance/=pointsAndWeights.length;
    return 1-distance;
}



function mostWhitePeople(a,b){
    if(a.whitePopulation2000>b.whitePopulation2000)
        return 1;
    else
        return -1;
}

function mostWhiteChange(a,b){
    if(!a.hasData || !b.hasData)
        return 0;

    let changeA = a.data2020.obj.White/a.data2020.obj.Total - a.data2000.obj.White/a.data2000.obj.Total;
    let changeB = b.data2020.obj.White/b.data2020.obj.Total - b.data2000.obj.White/b.data2000.obj.Total;
    // console.log(a);

    if(changeA>changeB)
        return -1;
    else if(changeB>changeA)
        return 1;
    else
        return 0;
}

function getTopNTracts(testFunction,n){
    let vals = bayTracts.toSorted(testFunction);
    return vals.slice(0,n);
}

function getSignificantPoints(testFunction,n){
    let tracts = getTopNTracts(testFunction,n);
    let coordinates = [];
    for(let i = 0; i<n; i++){
        coordinates.push(tracts[i].centroid);
    }
    return coordinates;
}

function loadData(){
    tractGeometry = loadJSON("data/geographic/CA_Tracts.geojson");
    oakHolcTracts = loadJSON("data/geographic/oakland_HOLC.json");
    sfHolcTracts = loadJSON("data/geographic/SF_HOLC.json");
    sjHolcTracts = loadJSON("data/geographic/SJ_HOLC.json");

    // data2000 = loadTable('data/Census/Tracts_by_Race_2000.csv','csv','header');
    data2000 = loadTable('data/Census/CONVERTED_Tracts_by_Race_2000.csv','csv','header');
    data2020 = loadTable('data/Census/Tracts_by_Race_2020.csv','csv','header');

    //Only need these for converting
    // substantiallyChanged2000 = loadTable('data/Census/Substantially_Changed_2000.csv');
    // substantiallyChanged2010 = loadTable('data/Census/Substantially_Changed_2010.csv');
    // conversions2000to2010 = loadTable('data/Census/2010_to_2000.csv','csv','header');
    // conversions2010to2020 = loadTable('data/Census/2020_to_2010.csv','csv','header');
}

function setupMapTexture(){
    let features = tractGeometry.features;
    bayTracts = features;

    cleanCensusData();
    alignGeoAndData(features);
    getTotalStats();
    calculateGeographicCenters();

    // saveTable(data2000,'CONVERTED_Tracts_by_Race_2000.csv');

    mapTexture = createFramebuffer(width,height);
    holcTexture = createFramebuffer(width,height);

    //the manual offset
    offset = {x:250,y:300};

    //manually adjusting the scale to taste
    let s = 700;
    scale = {x:s,y:s*(-1.25)};

    //setting the offsets so that the first point in the first shape is centered
    let samplePoint = bayTracts[0].geometry.coordinates[0][0][0];
    geoOffset = {x:-samplePoint[0],y:-samplePoint[1]};
}