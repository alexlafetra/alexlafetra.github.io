let flowField;
let showingMap = true;

function genRandomPoints(n){
    let points = [];
    for(let i = 0; i<n; i++){
        points.push({x:random(0,1),y:random(0,1)});
    }
    return points;
}

function preload(){
    loadData();
    flowFieldShader = loadShader('flowMap.vert','flowMap.frag');
    randomShader = createShader(defaultVert,randomFrag);
}

function setup(){
    mainCanvas = createCanvas(1000,1000,WEBGL);

    setupMapTexture();
    renderMapOutline(color(0));
    fillPointsAndWeightsWithRandom();

    simplexLayer = createFramebuffer({width:width,height:height,format:FLOAT});
    renderLayer = createFramebuffer({width:width,height:height,format:FLOAT});
    normalMapTexture = createFramebuffer({width:width,height:height,format:FLOAT});
    let points = getSignificantPoints(mostWhiteChange,10);
    for(let i = 0; i<points.length;i++){
        points[i].x = ((points[i].x+geoOffset.x)*scale.x+offset.x)/width+0.5;
        points[i].y = ((points[i].y+geoOffset.y)*scale.y+offset.y)/height+0.5;
    }

    //creating map mask
    let mask = createFramebuffer({width:width,height:height,format:FLOAT});
    mask.begin();
    background(0);
    renderTracts(geoOffset,() => {fill(255)});
    mask.end();
    flowField = new FlowField(points,mask);

    initGui();

    // holcTexture.begin();
    // renderHOLCTracts(geoOffset,oakHolcTracts);
    // renderHOLCTracts(geoOffset,sfHolcTracts);
    // renderHOLCTracts(geoOffset,sjHolcTracts);
    // holcTexture.end();
}

function draw(){

    // image(holcTexture,-width/2,-height/2,width,height);
    if(indexOfClickedTract != -1){
        stroke(255);
        noFill();
        drawTract(bayTracts[indexOfClickedTract].geometry,geoOffset);
    }

    updateSliders();
    // background(0);
    if(showingMap){
        image(mapTexture,-width/2,-height/2,width,height);
    }
    flowField.update();
    flowField.render();
}