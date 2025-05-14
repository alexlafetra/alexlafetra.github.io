function popIcon(){
    //get rid of all the icons
    let icons = document.getElementsByClassName("random_icon");
    for(let i of icons){
        i.remove();
    }
    let numberOfIcons = 10*Math.random();
    for(let i = 0; i<numberOfIcons; i++){
        const newIcon = document.createElement("img");
        let which = 2*Math.random();
        if(which < 0.5){
            newIcon.src = "images/star_quiet.svg";
        }
        else{
            newIcon.src = "images/star.svg";
        }
        newIcon.style.top = window.innerHeight*Math.random()+"px";
        newIcon.style.left = (window.innerWidth-40)*Math.random()+"px";//-40px so it doesn't run on top of the scroll text
        newIcon.style.width = 100*Math.random()+"px";
        newIcon.style.height = newIcon.style.width;
        newIcon.className = "random_icon";
        document.getElementsByTagName("body")[0].append(newIcon);
    }
}

window.setInterval(popIcon,1500);
window.onload = function(){
    popIcon();
};
