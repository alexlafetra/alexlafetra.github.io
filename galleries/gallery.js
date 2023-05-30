let lastScrollPos;
//clear out old image
function hideImage(){
    let div = document.getElementById('imageDiv');
    div.innerHTML = "";
    document.getElementById('images').style.visibility = "visible";
    // enable scrolling
    document.body.style.overflow = "auto";
    // scroll to last location
    window.scrollTo(0,lastScrollPos);
    removeArtText();
}
//show next image in sequence
function showNextImage(){
    //clear out old info
    let div = document.getElementById('imageDiv');
    div.innerHTML = "";
    removeArtText();

    //find the current file
}
//injecting a big image element in the 'imageDiv' div
//which can be removed when it's clicked
function displayBigImage(src){
    //clear out all the other images first
    let div = document.getElementById('imageDiv');
    div.innerHTML = "";

    let newImage = document.createElement('img');
    newImage.src = src;

    //attach onclick listener
    newImage.addEventListener('click',hideImage);
    // document.body.addEventListener('click',hideImage);
    //add child to div
    div.appendChild(newImage);
    //hide other pics
    let otherImages = document.getElementById('images');
    otherImages.style.visibility = "hidden";
    //stop scrolling
    document.body.style.overflow = "hidden";
    lastScrollPos = window.scrollY;
    window.scrollTo(0,0);
    
}
//adding art text
function setArtText(which){
    let titleDiv = document.getElementById("titleDiv");
    let textDiv = document.getElementById("descriptionDiv");
    let text;
    let title;
    switch(which){
        case 0:
            title = "Minivan";
            text = "Oil pastel and ink on paper, 2020";
            break;
        case 1:
            title = "Minivan";
            text = "Oil pastel and ink on paper, 2020";
            break;
        case 2:
            title = "Minivan";
            text = "Oil pastel and ink on paper, 2020";
            break;
    }
    titleDiv.append(title);
    textDiv.append(text);
}
//removing text
function removeArtText(){
    let title = document.getElementById("titleDiv");
    let text = document.getElementById("descriptionDiv");
    title.innerHTML = "";
    text.innerHTML = "";
}
