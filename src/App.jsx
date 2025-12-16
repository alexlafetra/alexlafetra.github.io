import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <img id = "mouse_image"/>
    <main></main>
    <div id = "page_container">
        <img id = "center_image" className = "collisionElement" src = "images/me.jpeg"/>
        <div id = "project_links">
            <div className = "link_title">
                work
            </div>
            <a className = "site_link" href = "alexlafetra.github.io/tamo">nonperformance tamagotchis</a>
        </div>
    </div>
    </>
  )
}

export default App
