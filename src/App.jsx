import { useState, useRef, useEffect } from 'react'
import { name } from './ascii';
import './App.css'

function App() {
  const [mouseCoords,setMouseCoords] = useState({x:0,y:0});
  const mouseCoordsRef = useRef(mouseCoords);
  useEffect(()=>{
    mouseCoordsRef.current = mouseCoords;
  },[mouseCoords]);

  const [mouseImage,setMouseImage] = useState({
    shown:false,
    src : null
  });
  useEffect(()=>{window.addEventListener('mousemove',handleMouseMove)},[]);
  function handleMouseMove(e){
    setMouseCoords({
      x: e.clientX,
      y: e.clientY
    });
  }
  const PictureLink = ({imgSrc,link,text})=>{
    return (
      <a className = "site_link collisionElement" href = {link} onMouseEnter={()=>{setMouseImage({shown:true,src:imgSrc})}}>{text}</a>
    )
  }

  const mouseImageStyle = {
    position:'absolute',
    top:mouseCoords.y,
    left:mouseCoords.x,
    maxWidth:'250px',
    minWidth:'200px',
    maxHeight:'250px',
    display:mouseImage.shown?'block':'none',
    imageRendering:'pixelated',
    pointerEvents:'none',
    userSelect:'none'
  }
  
  return (
    <>
    <img id = "mouse_image" className = "collisionElement" src = {mouseImage.src} style = {mouseImageStyle}/>
    <img src = "sneaky-hehe.gif" style = {{position:'fixed',right:'10px',bottom:'10px',width:'50px'}}></img>
    <main></main>
    <div id = "page_container">
      <div id = "photo_id">
        <img style = {{left:'-75px',top:'-60px',width:'400px',position:'absolute',mixBlendMode:'difference'}} src = "/border_animated_white.gif"/>
        <img style = {{width:'250px',height:'250px'}} className = "collisionElement" src = "/me.jpeg"/>
      </div>
        <div id = "project_links">
            <div className = "link_title">work</div>
            <PictureLink text = 'nonperformance tamagotchi' imgSrc = '/tamo_rotating_small.gif' link = "https://github.com/alexlafetra/tamo"></PictureLink>
            <PictureLink text = 'looking very lifelike!!' imgSrc = '/looking_very_lifelike!!.jpeg'></PictureLink>
            {/* <a className = "site_link" href = "alexlafetra.github.io/tamo">nonperformance tamagotchis</a> */}
        </div>
        <div id = "site_links">
            <div className = "link_title">pages</div>
            <PictureLink text = 'liquid.png' imgSrc = '/liquidpng.gif' link = "https://alexlafetra.github.io/liquidpng"></PictureLink>
            <PictureLink text = 'flipbook' imgSrc = '/flipbook.gif' link = "https://alexlafetra.github.io/flipbook"></PictureLink>
            <PictureLink text = 'thermal printer fighter' imgSrc = '/flipbook.gif' link = "https://alexlafetra.github.io/thermalprinterfighter"></PictureLink>
            <PictureLink text = 'contradictions.jpeg' imgSrc = '/flipbook.gif' link = "https://alexlafetra.github.io/contradictions.jpeg"></PictureLink>
            <PictureLink text = 'ascii sketchbook' imgSrc = '/flipbook.gif' link = "https://alexlafetra.github.io/asciisketchbook"></PictureLink>
        </div>
        <div id = "bio">
      </div>    
    </div>
    </>
  )
}

export default App
