let mainString = "";
const scale = 5;
const cursiveFont = {charWidth:6,charHeight:12,fontMap:null,getCoords:getCursiveCoords};
const italicFont = {charWidth:7,charHeight:7,fontMap:null,getCoords:getItalicCoords};
let font = cursiveFont;
let lines = 1;
let invert = false;
let textBox;
let longestLength = 0;
let longestHeight = 0;
let allowInvert = true;

function preload(){
    cursiveFont.fontMap = loadImage("fonts/cursive_fontsheet.bmp");
    italicFont.fontMap = loadImage("fonts/italic_fontsheet.bmp");
}
function setup(){
    textBox = createInput();
    toggleInvert();
    textBox.size(windowWidth);
    createCanvas(0,scale*font.charHeight);
    background(0,0);
    noSmooth();
}
function draw(){
    allowInvert = (windowWidth>windowHeight);
    resizeCanvas(longestLength,longestHeight+font.charHeight*scale);
    textBox.innerHTML = "";
    background(0,0);
    renderText();
}
function windowResized(){
    textBox.size(windowWidth);
}
function toggleInvert(){
    if(!allowInvert)
        return;
    invert = !invert;
    //black text on white bg
    if(invert){
        document.body.style.backgroundColor = "white";
    }
    //white text on black bg
    else{
        document.body.style.backgroundColor = "black";
    }
}
function mousePressed(){
    if(mouseButton == LEFT)
        toggleInvert();
}
function renderText(){
    longestLength = 0;
    longestHeight = 0;
    let cursor = {x:0,y:0};
    for(let letter of mainString){
        if(letter == " "){
            cursor.x += font.charWidth*scale;
            continue;
        }
        else if(letter == "\n"){
            cursor.y += (font.charHeight*scale);
            cursor.x = 0;
            continue;
        }
        else if(letter == "\t"){
            cursor.x += 2*font.charWidth*scale;
            continue;
        }

        let coords = font.getCoords(letter);
        let sX = coords.x*font.charWidth;
        let sY = coords.y*font.charHeight;
        let img = createImage(font.charWidth,font.charHeight);
        img.copy(font.fontMap,sX,sY,font.charWidth,font.charHeight,0,0,font.charWidth,font.charHeight);
        if(invert)
            img.filter(INVERT);
        image(img,cursor.x,cursor.y,font.charWidth*scale,font.charHeight*scale);
        cursor.x += font.charWidth*scale;
        if(cursor.x > windowWidth){
            cursor.x = 0;
            cursor.y += (font.charHeight)*scale;
            longestLength = windowWidth;
        }
        if(cursor.x>longestLength){
            longestLength = cursor.x;
        }
        if(cursor.y>longestHeight){
            longestHeight = cursor.y;
            // console.log(longestHeight);
        }
    }

}

function keyPressed(){
    if(keyCode == BACKSPACE){
        mainString = mainString.substring(0,mainString.length-1);
    }
    else if(keyCode == ENTER){
        mainString += "\n";
    }
    else if(keyCode == TAB){
        mainString += "\t";
    }
    else if(keyCode == ESCAPE){
        mainString = "";
    }
    else if(keyCode == SHIFT){

    }
    else
        mainString += key;
}
function getItalicCoords(char){
    let coords = {x:0,y:0};
    switch(char){
        case 'a':{
            coords.x = 0;
            coords.y = 0;
            break;
        }
        case 'b':{
            coords.x = 1;
            coords.y = 0;
            break;
        }
        case 'c':{
            coords.x = 2;
            coords.y = 0;
            break;
        }
        case 'd':{
            coords.x = 3;
            coords.y = 0;
            break;
        }
        case 'e':{
            coords.x = 4;
            coords.y = 0;
            break;
        }
        case 'f':{
            coords.x = 5;
            coords.y = 0;
            break;
        }
        case 'g':{
            coords.x = 6;
            coords.y = 0;
            break;
        }
        case 'h':{
            coords.x = 7;
            coords.y = 0;
            break;
        }
        case 'i':{
            coords.x = 8;
            coords.y = 0;
            break;
        }
        case 'j':{
            coords.x = 0;
            coords.y = 1;
            break;
        }
        case 'k':{
            coords.x = 1;
            coords.y = 1;
            break;
        }
        case 'l':{
            coords.x = 2;
            coords.y = 1;
            break;
        }
        case 'm':{
            coords.x = 3;
            coords.y = 1;
            break;
        }
        case 'n':{
            coords.x = 4;
            coords.y = 1;
            break;
        }
        case 'o':{
            coords.x = 5;
            coords.y = 1;
            break;
        }
        case 'p':{
            coords.x = 6;
            coords.y = 1;
            break;
        }
        case 'q':{
            coords.x = 7;
            coords.y = 1;
            break;
        }
        case 'r':{
            coords.x = 8;
            coords.y = 1;
            break;
        }
        case 's':{
            coords.x = 0;
            coords.y = 2;
            break;
        }
        case 't':{
            coords.x = 1;
            coords.y = 2;
            break;
        }
        case 'u':{
            coords.x = 2;
            coords.y = 2;
            break;
        }
        case 'v':{
            coords.x = 3;
            coords.y = 2;
            break;
        }
        case 'w':{
            coords.x = 4;
            coords.y = 2;
            break;
        }
        case 'x':{
            coords.x = 5;
            coords.y = 2;
            break;
        }
        case 'y':{
            coords.x = 6;
            coords.y = 2;
            break;
        }
        case 'z':{
            coords.x = 7;
            coords.y = 2;
            break;
        }
    }
    return coords;
}
function getCursiveCoords(char){
    let coords = {x:0,y:0};
    switch(char){
        case 'a':{
            coords.x = 0;
            coords.y = 0;
            break;
        }
        case 'b':{
            coords.x = 1;
            coords.y = 0;
            break;
        }
        case 'c':{
            coords.x = 2;
            coords.y = 0;
            break;
        }
        case 'd':{
            coords.x = 3;
            coords.y = 0;
            break;
        }
        case 'e':{
            coords.x = 4;
            coords.y = 0;
            break;
        }
        case 'f':{
            coords.x = 5;
            coords.y = 0;
            break;
        }
        case 'g':{
            coords.x = 6;
            coords.y = 0;
            break;
        }
        case 'h':{
            coords.x = 7;
            coords.y = 0;
            break;
        }
        case 'i':{
            coords.x = 8;
            coords.y = 0;
            break;
        }
        case 'j':{
            coords.x = 9;
            coords.y = 0;
            break;
        }
        case 'k':{
            coords.x = 0;
            coords.y = 1;
            break;
        }
        case 'l':{
            coords.x = 1;
            coords.y = 1;
            break;
        }
        case 'm':{
            coords.x = 2;
            coords.y = 1;
            break;
        }
        case 'n':{
            coords.x = 3;
            coords.y = 1;
            break;
        }
        case 'o':{
            coords.x = 4;
            coords.y = 1;
            break;
        }
        case 'p':{
            coords.x = 5;
            coords.y = 1;
            break;
        }
        case 'q':{
            coords.x = 6;
            coords.y = 1;
            break;
        }
        case 'r':{
            coords.x = 7;
            coords.y = 1;
            break;
        }
        case 's':{
            coords.x = 8;
            coords.y = 1;
            break;
        }
        case 't':{
            coords.x = 9;
            coords.y = 1;
            break;
        }
        case 'u':{
            coords.x = 0;
            coords.y = 2;
            break;
        }
        case 'v':{
            coords.x = 1;
            coords.y = 2;
            break;
        }
        case 'w':{
            coords.x = 2;
            coords.y = 2;
            break;
        }
        case 'x':{
            coords.x = 3;
            coords.y = 2;
            break;
        }
        case 'y':{
            coords.x = 4;
            coords.y = 2;
            break;
        }
        case 'z':{
            coords.x = 5;
            coords.y = 2;
            break;
        }
        case '1':{
            coords.x = 6;
            coords.y = 2;
            break;
        }
        case '2':{
            coords.x = 7;
            coords.y = 2;
            break;
        }
        case '3':{
            coords.x = 8;
            coords.y = 2;
            break;
        }
        case '4':{
            coords.x = 9;
            coords.y = 2;
            break;
        }
        case '5':{
            coords.x = 0;
            coords.y = 3;
            break;
        }
        case '6':{
            coords.x = 1;
            coords.y = 3;
            break;
        }
        case '7':{
            coords.x = 2;
            coords.y = 3;
            break;
        }
        case '8':{
            coords.x = 3;
            coords.y = 3;
            break;
        }
        case '9':{
            coords.x = 4;
            coords.y = 3;
            break;
        }
        case '0':{
            coords.x = 5;
            coords.y = 3;
            break;
        }
        case '\'':{
            coords.x = 6;
            coords.y = 3;
            break;
        }
        case '!':{
            coords.x = 7;
            coords.y = 3;
            break;
        }
        case '?':{
            coords.x = 8;
            coords.y = 3;
            break;
        }
    }
    return coords;
}