"use strict"

var homeImgSrc = "images/drawings/IMG_4029.jpeg";
getHomePiece(homeImgSrc);

function getHomePiece(){
    //this should load images into an array, then pick 3 at random
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
    if(theme.getAttribute("href") == "styles/styles.css"){
        theme.setAttribute("href","styles/styles-less-cool.css");
        document.getElementById("style-change").innerText = 'Make it unprofessional';
    }
    else{
        theme.setAttribute("href","styles/styles.css");
        document.getElementById("style-change").innerText = 'Make it professional';
    }
}