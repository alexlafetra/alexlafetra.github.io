"use strict"

var gallOn;

//for art
var paintings = [
    "images/paintings/IMG_8092.png",
    "images/paintings/IMG_8143.jpg"
];
var drawings = [
    "images/drawings/IMG_2484.jpeg",
    "images/drawings/IMG_3395 copy.JPG",
    "images/drawings/IMG_3401 copy.jpg",
    "images/drawings/IMG_4029.jpeg"
];
var photos = [
    "images/photos/000000150003.jpg",
    "images/photos/000000150008.jpg",
    "images/photos/000000150012.jpg",
    "images/photos/000000150015.jpg",
    "images/photos/000000150017.jpg",
    "images/photos/000000150023.jpg",
    "images/photos/000000150024.jpg",
    "images/photos/000000150025.jpg",
    "images/photos/000000150026.jpg",
    "images/photos/000000150028.jpg",
];
var galleries = [paintings, drawings, photos]

var galleryID = 0;

//two functions: one two display images, and one to pass the first fn images from an array
function createGallery(index){
    //first, clear gallery space
    clearGallery();
    let artArray = galleries[index]
    //display each img
    for(let i = 0; i< artArray.length; i++){
        displayImage(artArray[i]);
    }
    gallOn = true;
}
function displayImage(src){
    var img = document.createElement("img");
    img.src = src;
    img.onclick = "display()"
    document.getElementById("gallery-images").appendChild(img);
}

function clearGallery(){
//clears gallery
let element = document.getElementById("gallery-images");
element.innerHTML = '';
}

createGallery(galleryID);