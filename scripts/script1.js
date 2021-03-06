"use strict"


function get3Pieces(){
    //this should load images into an array, then pick 3 at random
    let imgElements = document.getElementsByClassName("img").getAttribute("src");
    let img_src_array = Array.from(imgElements);
    let i;
    for( i = 0; i<img_src_array.length; i++){
        show_image(imgArray[i]);
    }
}

function show_image(src){
    var img = document.createElement("img");
    img.src = src;
    document.body.appendChild(img);
    alert("displaying image!");
}