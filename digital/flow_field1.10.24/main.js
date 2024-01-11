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
        document.getElementById("chart_description").innerHTML = this.description;
        activePreset = index;
        renderMap(mapTexture,color(0),presets[activePreset].colorStyle);
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

function preload(){
    loadData();
}

//20 is about the limit
function gatherDemographicMaxMins(n){
    let points = getSignificantPoints(n);
    points = points.concat(getLeastSignificantPoints(n));
    return points;
}

function setup(){

    //create canvas and grab webGL context
    setAttributes('antialias',false);
    // pixelDensity(1);
    mainCanvas = createCanvas(1200,1200,WEBGL);
    gl = mainCanvas.GL;

    flowFieldShader = createShader(flowMapVert,flowMapFrag);
    randomShader = createShader(defaultVert,randomFrag);

    //Preset color/flows
    whiteComparisonPreset = new DemographicVis("Change in White Population",
                                            "White Population<sub>2000</sub> / White Population<sub>2020</sub>",colorStyle_whiteComparison2020_2000,whitePeopleComparedTo2000);
    blackComparisonPreset = new DemographicVis("Change in Black Population",
                                            "Black Population<sub>2000</sub> / Black Population<sub>2020</sub>",colorStyle_blackComparison2020_2000,blackPeopleComparedTo2000);
    asianComparisonPreset = new DemographicVis("Change in Asian Population",
                                            "Asian Population<sub>2000</sub> / Asian Population<sub>2020</sub>",colorStyle_asianComparison2020_2000,asianPeopleComparedTo2000);
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
    setupMapData();
    
    // console.log("Loaded and parsed Census Data:");
    // console.log(bayTracts);

    //drawing tract outlines to an overlay
    tractOutlines = createFramebuffer();
    tractOutlines.begin();
    strokeWeight(2);
    renderTractOutlines(geoOffset,color(255,4));
    tractOutlines.end();

    //setting up the flow texture and drawing the map colors
    // calculateAttractors(NUMBER_OF_ATTRACTORS);
    // renderMap(mapTexture,color(0),presets[activePreset].colorStyle);

    //creating map mask
    let mask = createFramebuffer({width:width,height:height,format:FLOAT});
    mask.begin();
    background(0);
    renderTracts(geoOffset,() => {fill(255)});
    mask.end();

    flowField = new FlowField(mask,mapTexture,flowFieldShader);

    initGui();

    flowField.update();

    holcTexture.begin();
    renderHOLCTracts(geoOffset,oakHolcTracts);
    renderHOLCTracts(geoOffset,sfHolcTracts);
    renderHOLCTracts(geoOffset,sjHolcTracts);
    holcTexture.end();

    presets[activePreset].setActive(activePreset);
}


function draw(){
    updateSliders();
    calculateAttractors(NUMBER_OF_ATTRACTORS);
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

const flowMapFrag = glsl`
precision mediump float;

varying vec2 vTexCoord;

uniform vec3 uAttractors[`+NUMBER_OF_ATTRACTORS+glsl`];
uniform vec3 uRepulsors[`+NUMBER_OF_ATTRACTORS+glsl`];

uniform float uStrengthEffect;

void main(){
    vec2 c = vec2(0.0);
    //calculate attractors/repulsors
    for(int i = 0; i<`+NUMBER_OF_ATTRACTORS+glsl`; i++){
        //add a vector pointing toward the attractor from this pixel
        //scaled by the inverse square of the distance AND the scale factor
        float dA = distance(uAttractors[i].xy,vTexCoord);
        c+=uAttractors[i].z*(uAttractors[i].xy-vTexCoord)/(dA*dA);
        // c+=(uAttractors[i].xy-vTexCoord)/(dA*dA);

        float dR = distance(uRepulsors[i].xy,vTexCoord);
        c+=uRepulsors[i].z*(-uRepulsors[i].xy+vTexCoord)/(dR*dR);
        // c+=(-uRepulsors[i].xy+vTexCoord)/(dR*dR);
    }
    c = normalize(c);

    gl_FragColor = vec4(c.x,c.y,1.0,1.0);
}
`;

const flowMapVert = glsl`
precision mediump float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vTexCoord;

void main(){
    // //passing aTexCoord into the frag shader
    vTexCoord = aTexCoord;
    vec2 positionVec2 = aPosition.xy * 2.0 - 1.0;
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(positionVec2,aPosition.z,1.0);
}
`;