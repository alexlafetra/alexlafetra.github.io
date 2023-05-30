"use strict"

//gallery object stores the images
var gallery;
var text;

//activeGalleryName stores the name of the gallery
var activeGalleryName = "default";
var activeImageIndex;

var isActive = 0;

//hides intro text, displays img, text, and arrow buttons
function loadGallery(name){

    //when a gallery is already active, hide the previous image
    if(activeGalleryName != name){
        if(isActive){
            gallery[activeImageIndex].style.visibility = "hidden";
            gallery[activeImageIndex].style.opacity = "0.0"
        }
        // //hiding artist statement...i kind of like it better messy doe
        // let artist_statement = document.getElementsByClassName("artist_statement");
        // if(artist_statement[0].style.visibility != "hidden"){
        //     // artist_statement[0].style.visibility = "hidden";
        // }
        gallery = document.getElementsByClassName(name);

        activeGalleryName = name;
        activeImageIndex = 0;

        gallery[activeImageIndex].style.opacity = "1"
        gallery[activeImageIndex].style.visibility = "visible";

        isActive = 1;
        loadTitle();
    }
}

//hides image, shows next image
function nextImage(){
    gallery[activeImageIndex].style.visibility = "hidden";
    gallery[activeImageIndex].style.opacity = "0.0"
    activeImageIndex += 1;
    //making sure the images wrap around
    if(activeImageIndex >= gallery.length){
        activeImageIndex = 0;
    }
    gallery[activeImageIndex].style.opacity = "1"
    gallery[activeImageIndex].style.visibility = "visible";
    loadTitle();
}

function previousImage(){
    gallery[activeImageIndex].style.visibility = "hidden";
    gallery[activeImageIndex].style.opacity = "0.0"
    activeImageIndex -= 1;
    //making sure the images wrap around
    if(activeImageIndex < 0){
        activeImageIndex = gallery.length-1;
    }
    gallery[activeImageIndex].style.opacity = "1"
    gallery[activeImageIndex].style.visibility = "visible";
    loadTitle();
}

//loads a single image
function loadSingle(name){
    if(isActive){
        gallery[activeImageIndex].style.visibility = "hidden";
        gallery[activeImageIndex].style.opacity = "0";
    }
    isActive = 1;
    gallery = document.getElementsByClassName(name);
    text = document.getElementsByClassName(name+"_Text");

    activeGalleryName = name;
    activeImageIndex = 0;

    loadTitle();

    gallery[activeImageIndex].style.opacity = "1";
    gallery[activeImageIndex].style.visibility = "visible";
    text[0].style.visibility = "visible";
    text[0].style.visibility = "1";
}

//changes the title, material, and 1/1 html text
function loadTitle(){
    let currentName = document.getElementById("title");
    currentName.innerHTML = gallery[activeImageIndex].id;
    let currentMaterial = document.getElementById("material");
    currentMaterial.innerHTML = gallery[activeImageIndex].getAttribute('data-material');
    let seriesNumber = document.getElementById("series");
    seriesNumber.innerHTML = gallery[activeImageIndex].getAttribute('data-series');
}