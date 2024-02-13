let flowField;
let flowFields = [];
let holcTexture;
let mask;

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

//20 is a good base number
const NUMBER_OF_ATTRACTORS = 200;

const NUMBER_OF_FIELDS = 1;
const forceScale = 100.0;

let showingMap = false;
let showingTractOutlines = false;
let showHOLCTracts = false;
let showParticles = true;
let showFlowMap = false;

let particleLayer;

//controls whether or not the sim will load with prerendered data/choropleths
//or with the full dataset, allowing you to explore/experiment
const devMode = true;
// const devMode = false;

class DemographicVis{
    constructor(title,description,color,data){
        this.title = title;
        this.description = description;
        this.colorStyle = color;
        this.demographicFunction = data;
    }
    setActive(index,ff){
        ff.chartTitle.html(this.title);
        ff.chartEquation.html(this.description);
        ff.presetIndex = index;
        ff.renderMapTexture();
        ff.calculateAttractors(NUMBER_OF_ATTRACTORS,this.demographicFunction);
        ff.updateFlow();
    }
}

class Preset{
    constructor(title,description,map,aPoints,rPoints){
        this.title = title;
        this.description = description;
        this.mapIndex = map;
        this.attractors = aPoints;
        this.repulsors = rPoints;
    }
    setActive(index,ff){
        ff.chartTitle.html(this.title);
        ff.chartEquation.html(this.description);
        ff.presetIndex = index;
        ff.renderImageAsMapTexture(presetChoropleths[presets[index].mapIndex]);
        ff.setPresetAttractors();
        ff.updateFlow();
    }
}
function saveFlowField(){
    saveCanvas(flowField.flowFieldTexture,'flowfield.png','png');
}
function saveChoropleth(){
    saveCanvas(flowFields[0].mapTexture, 'choropleth.png','png');
}
function logAttractors(){
    console.log(JSON.stringify(flowFields[0].attractors));
    console.log(JSON.stringify(flowFields[0].repulsors));
}
function saveMask(){
    saveCanvas(flowField.particleMask, 'flowFieldMask.png','png');
}
function saveTracts(){
    saveJSON(bayTracts,"tracts.json");
}

let preset0Map;
let presetFlowMask;
let presetChoropleths;
function loadPresetMaps(){
    presetChoropleths = [];
    presetChoropleths.push(loadImage('data/Prerendered/preset0.png'));
    presetChoropleths.push(loadImage('data/Prerendered/preset1.png'));
    presetChoropleths.push(loadImage('data/Prerendered/preset2.png'));
    presetFlowMask = loadImage("data/Prerendered/flowFieldMask.png");
    tractOutlines = loadImage("data/Prerendered/tractOutlines.png");
}

function preload(){
    if(devMode)
        loadData();
    else
        loadPresetMaps();
}

//20 is about the limit
function gatherDemographicMaxMins(n){
    let points = getSignificantPoints(n);
    points = points.concat(getLeastSignificantPoints(n));
    return points;
}

let preset0;

function randomColor(){
    return color(random(0,255),random(0,255),random(0,255));
}

function setup_DevMode(){

    //Preset color/flows
    whiteComparisonPreset = new DemographicVis("Change in White Population",
                                            "P<sub>White 2000</sub> / P<sub>White 2020</sub>",colorStyle_whiteComparison2020_2000,whitePeopleComparedTo2000);
    blackComparisonPreset = new DemographicVis("Change in Black Population",
                                            "P<sub>Black 2000</sub> / P<sub>Black 2020</sub>",colorStyle_blackComparison2020_2000,blackPeopleComparedTo2000);
    asianComparisonPreset = new DemographicVis("Change in Asian Population",
                                            "P<sub>Asian 2000</sub> / P<sub>Asian 2020</sub>",colorStyle_asianComparison2020_2000,asianPeopleComparedTo2000);
    whiteProportionComparisonPreset = new DemographicVis("Change In Proportion of White Population",
                                            "P<sub>White 2000</sub> / P<sub>Total 2000</sub> - P<sub>White 2020</sub> / P<sub>Total 2020</sub>",colorStyle_whiteRatioComparison,mostWhiteChange);
    blackProportionComparisonPreset = new DemographicVis("Change In Proportion of Black Population",
                                            "P<sub>Black 2000</sub> / P<sub>Total 2000</sub> - P<sub>Black 2020</sub> / P<sub>Total 2020</sub>",colorStyle_blackRatioComparison,mostBlackChange);
    asianProportionComparisonPreset = new DemographicVis("Change In Proportion of Asian Population",
                                            "P<sub>Asian 2000</sub> / P<sub>Total 2000</sub> - P<sub>Asian 2020</sub> / P<sub>Total 2020</sub>",colorStyle_asianRatioComparison,mostAsianChange);
    presets = [
        whiteComparisonPreset,
        blackComparisonPreset,
        asianComparisonPreset,
        whiteProportionComparisonPreset,
        blackProportionComparisonPreset,
        asianProportionComparisonPreset
    ];

    //parsing data and attaching it to tract geometry
    setupMapData();

    //setting the offsets so that the first point in the first shape is centered
    let samplePoint = bayTracts[0].geometry.coordinates[0][0][0];
    geoOffset = {x:-samplePoint[0],y:-samplePoint[1]};

    //the manual offset
    offset = {x:350,y:400};

    //manually adjusting the scale to taste
    let s = 800;
    // scale = {x:s,y:s*(-1.25)};
    scale = {x:s*1.25,y:s*(-1)};

    //drawing tract outlines to an overlay
    tractOutlines = createFramebuffer();
    tractOutlines.begin();
    strokeWeight(1);
    renderTractOutlines(geoOffset,color(255));
    tractOutlines.end();

    holcTexture.begin();
    renderHOLCTracts(geoOffset,oakHolcTracts);
    renderHOLCTracts(geoOffset,sfHolcTracts);
    renderHOLCTracts(geoOffset,sjHolcTracts);
    holcTexture.end();

    //creating map mask
    mask.begin();
    background(0,255);
    renderTracts(geoOffset,() => {fill(255,255,255)});
    mask.end();

    for(let i = 0; i<NUMBER_OF_FIELDS; i++){
        flowFields.push(new FlowField(mask,0,null,randomColor()));
        flowFields[i].calculateAttractors(NUMBER_OF_ATTRACTORS);
    }
}

function setup_Prerendered(){
    whiteComparisonPreset = new Preset("Change in White Population",
    "White Pop<sub>2000</sub> / White Pop<sub>2020</sub>",0,preset0Attractors,preset0Repulsors);

    presets = [
        whiteComparisonPreset
        //, blackComparisonPreset,
        // asianComparisonPreset,
        // whiteProportionComparisonPreset,
        // blackProportionComparisonPreset,
        // asianProportionComparisonPreset
    ];

    //creating map mask
    mask.begin();
    image(presetFlowMask,-mask.width/2,-mask.height/2,mask.width,mask.height);
    mask.end();

    for(let i = 0; i<NUMBER_OF_FIELDS; i++){
        flowFields.push(new FlowField(mask,i,presetChoropleths[i],randomColor()));
    }
}

function setup(){

    //create canvas and grab webGL context
    // setAttributes('antialias',false);
    // pixelDensity(1);
    mainCanvas = createCanvas(1400,700,WEBGL);
    gl = mainCanvas.GL;

    randomShader = createShader(defaultVert,randomFrag);

    // saveTable(data2000,'CONVERTED_Tracts_by_Race_2000.csv');
    holcTexture = createFramebuffer(width,height);
    mask = createFramebuffer({width:width,height:height});
    particleLayer = createFramebuffer();

    if(devMode)
        setup_DevMode();
    else
        setup_Prerendered();

    initGL();

    presets[0].setActive(0,flowFields[0]);
}

function renderFlowFields(){
    for(let i = 0; i<flowFields.length; i++){
        image(flowFields[i].flowFieldTexture,-width/2+i*width/4,height/2-height/4,width/4,height/4);
    }
}

function draw(){
    noStroke();
    fill(0);
    rect(0,-height/2,width/2,height);
    for(let ff of flowFields){
        ff.updateParametersFromGui();
        if(ff.isActive){
            ff.updateParticles();
            ff.renderGL();
        }
    }
    if(showHOLCTracts){
        image(holcTexture,-width/2,-height/2,width,height);
    }
}