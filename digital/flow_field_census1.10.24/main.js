let flowField;
let mapTexture;
let holcTexture;

let attractors = [];
let repulsors = [];
let gl;
let mainCanvas;
let tractOutlines;
let idBuffer;
let ids;

let whiteComparisonPreset;
let blackComparisonPreset;
let asianComparisonPreset;
let whiteProportionComparisonPreset;
let blackProportionComparisonPreset;
let asianProportionComparisonPreset;

let presets;
let activePreset = 0;

const NUMBER_OF_ATTRACTORS = 20;

let showingMap = false;
let showingTractOutlines = false;
let showHOLCTracts = false;
let showParticles = true;
let showFlowMap = false;

class DemographicVis{
    constructor(title,description,color,data){
        this.title = title;
        this.description = description;
        this.colorStyle = color;
        this.demographicFunction = data;
    }
    setActive(index){
        document.getElementById("chart_title").innerHTML = this.title;
        document.getElementById("chart_attractor_equation").innerHTML = this.description;
        activePreset = index;
        renderMap(mapTexture,color(0),presets[activePreset].colorStyle);
        calculateAttractors(NUMBER_OF_ATTRACTORS);
    }
}

class Preset{
    constructor(title,description,map,aPoints,rPoints){
        this.title = title;
        this.description = description;
        this.mapImage = map;
        this.attractors = aPoints;
        this.repulsors = rPoints;
    }
    setActive(index){
        document.getElementById("chart_title").innerHTML = this.title;
        document.getElementById("chart_attractor_equation").innerHTML = this.description;
        activePreset = index;
        attractors = this.attractors;
        repulsors = this.repulsors;
        mapTexture.begin();
        image(this.mapImage,-width/2,-height/2,width,height);
        mapTexture.end();
        flowField.colorMap = mapTexture;
    }
}

function calculateAttractors(n){
    attractors = [];
    repulsors = [];
    let a = getSignificantPoints(n);
    let r = getLeastSignificantPoints(n);

    let min = r[0].strength;
    let max = a[0].strength;

    for(let point of a){
        attractors.push(point.x);
        attractors.push(point.y);
        // attractors.push(map(point.strength,min,max,0,forceScale));
        attractors.push(1.0);
    }
    for(let point of r){
        repulsors.push(point.x);
        repulsors.push(point.y);
        repulsors.push(1.0);
        // repulsors.push(map(point.strength,max,min,0,forceScale));
    }
}
function saveFlowField(){
    saveCanvas(flowField.flowFieldTexture,'flowfield.png','png');
}
function saveChoropleth(){
    saveCanvas(mapTexture, 'choropleth.png','png');
}
function logAttractors(){
    console.log(JSON.stringify(attractors));
    console.log(JSON.stringify(repulsors));
}

function preload(){
    // loadData();
    loadPresetMaps();
}

//20 is about the limit
function gatherDemographicMaxMins(n){
    let points = getSignificantPoints(n);
    points = points.concat(getLeastSignificantPoints(n));
    return points;
}

let preset0;

function setup(){

    //create canvas and grab webGL context
    setAttributes('antialias',false);
    // pixelDensity(1);
    mainCanvas = createCanvas(min(windowWidth,1000),min(windowHeight,1000),WEBGL);
    gl = mainCanvas.GL;

    flowFieldShader = createShader(flowMapVert,flowMapFrag);
    randomShader = createShader(defaultVert,randomFrag);

    whiteComparisonPreset = new Preset("Change in White Population",
    "White Pop<sub>2000</sub> / White Pop<sub>2020</sub>",preset0Map,preset0Attractors,preset0Repulsors);

    //Preset color/flows
    // whiteComparisonPreset = new DemographicVis("Change in White Population",
    //                                         "White Pop<sub>2000</sub> / White Pop<sub>2020</sub>",colorStyle_whiteComparison2020_2000,whitePeopleComparedTo2000);
    blackComparisonPreset = new DemographicVis("Change in Black Population",
                                            "Population<sub>Black 2000</sub> / Population<sub>Black 2020</sub>",colorStyle_blackComparison2020_2000,blackPeopleComparedTo2000);
    asianComparisonPreset = new DemographicVis("Change in Asian Population",
                                            "Population<sub>Asian 2000</sub> / Population<sub>Asian 2020</sub>",colorStyle_asianComparison2020_2000,asianPeopleComparedTo2000);
    whiteProportionComparisonPreset = new DemographicVis("Change In Proportion of White Population",
                                            "(White2000)/(White2020)",colorStyle_whiteRatioComparison,mostWhiteChange);
    blackProportionComparisonPreset = new DemographicVis("Change In Proportion of Black Population",
                                            "(White2000)/(White2020)",colorStyle_blackRatioComparison,mostBlackChange);
    asianProportionComparisonPreset = new DemographicVis("Change In Proportion of Asian Population",
                                            "(White2000)/(White2020)",colorStyle_asianRatioComparison,mostAsianChange);


    presets = [
        whiteComparisonPreset,
        blackComparisonPreset,
        asianComparisonPreset,
        whiteProportionComparisonPreset,
        blackProportionComparisonPreset,
        asianProportionComparisonPreset
    ];

    //parsing data and attaching it to tract geometry
    // setupMapData();
    // saveTable(data2000,'CONVERTED_Tracts_by_Race_2000.csv');
    mapTexture = createFramebuffer(width,height);
    holcTexture = createFramebuffer(width,height);

    //the manual offset
    offset = {x:350,y:400};

    //manually adjusting the scale to taste
    let s = 800;
    scale = {x:s,y:s*(-1.25)};

    //setting the offsets so that the first point in the first shape is centered
    // let samplePoint = bayTracts[0].geometry.coordinates[0][0][0];
    // geoOffset = {x:-samplePoint[0],y:-samplePoint[1]};
    
    // console.log("Loaded and parsed Census Data:");
    // console.log(bayTracts);

    //drawing tract outlines to an overlay
    tractOutlines = createFramebuffer();
    tractOutlines.begin();
    strokeWeight(2);
    // renderTractOutlines(geoOffset,color(255,4));
    tractOutlines.end();

    //setting up the flow texture and drawing the map colors
    // calculateAttractors(NUMBER_OF_ATTRACTORS);
    // renderMap(mapTexture,color(0),presets[activePreset].colorStyle);

    //creating map mask
    let mask = createFramebuffer({width:width,height:height,format:FLOAT});
    mask.begin();
    // background(0);
    // renderTracts(geoOffset,() => {fill(255)});
    mask.end();

    flowField = new FlowField(mask,mapTexture,flowFieldShader);

    initGui();

    flowField.update();

    // holcTexture.begin();
    // renderHOLCTracts(geoOffset,oakHolcTracts);
    // renderHOLCTracts(geoOffset,sfHolcTracts);
    // renderHOLCTracts(geoOffset,sjHolcTracts);
    // holcTexture.end();

    presets[activePreset].setActive(activePreset);
    // calculateAttractors(NUMBER_OF_ATTRACTORS);
}


function draw(){
    updateSliders();
    flowField.updateFlow(flowField.flowFieldTexture);
    flowField.update();

    if(showingMap){
        tint(255,10);
        image(mapTexture,-width/2,-height/2,width,height);
        tint(255,255);
    }
    if(showingTractOutlines){
        image(tractOutlines,-width/2,-height/2,width,height);
    }
    if(showFlowMap){
        tint(255,100);
        flowField.renderFlowMap();
        tint(255,255);
    }
    if(showParticles)
        flowField.renderGL();

    if(showHOLCTracts){
        image(holcTexture,-width/2,-height/2,width,height);
    }

}