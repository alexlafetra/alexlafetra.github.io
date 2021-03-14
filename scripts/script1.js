"use strict"

//For genRandoms()
let x;
let y;
let r;
let g;
let b;
let a;
let radius = 50; //for max distance
let shadows = ""; //to store the shadow values

var homeImgSrc = "images/drawings/IMG_4029.jpeg";
var boringStyle = false;
genRandoms();
getHomePiece(homeImgSrc);


//These two aren't being used
function getHomePiece(){
    var img_array = document.querySelectorAll(".art-img");
    var rand = Math.floor(Math.random()*img_array.length);
    img_array[rand].style.visibility = "visible";
}

function getHomePiece(src){
    var img = document.querySelector("img[src = \""+src+"\"]");
    img.style.visibility = "visible";
}

function swapTheme(){
    let theme = document.getElementsByTagName("link")[0];
    let title = document.getElementById("title");
    if(theme.getAttribute("href") == "styles/styles.css"){
        theme.setAttribute("href","styles/styles-less-cool.css");
        document.getElementById("style-change").innerText = 'Make it unprofessional';
        boringStyle = true;
    }
    else{
        theme.setAttribute("href","styles/styles.css");
        document.getElementById("style-change").innerText = 'Make it professional';
        title.setAttribute("mouseover","setRandomShadows()");
        boringStyle = false;
    }
}

function genRandoms(){
    for(let i = 0; i<4; i++){
        x = Math.trunc(radius*(Math.random()-0.5));
        y = Math.trunc(radius*Math.random());
        r =  Math.floor(255*Math.random());
        g =  Math.floor(255*Math.random());
        b =  Math.floor(255*Math.random());
        a =  Math.random().toFixed(3); //Might want to make this a smaller range
        shadows = shadows+y+"px "+x+"px "+"rgba("+r+","+g+","+b+","+a+")";
        if (i!=3){
            shadows = shadows+", ";
        }
    }   
}

/*function should randomize drop shadows*/
function setRandomShadows(a){
    if(!boringStyle){
        // let words = document.getElementById("title");
        for(let i = 0; i<1; i++){
            a.style.textShadow = shadows;
            let color = "rgba(105, 59, 211, 0.438)";
            a.style.color = color;
        }
    }
}

function clearShadows(a){
    // let words = document.getElementById("title");
    a.style.textShadow = "none";
    a.style.color = "black";

}



