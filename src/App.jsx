import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import { useState } from "react"
import "./App.css"

const App = () => {
  const [sidebarToggle, setSidebarToggle] = useState(true)

  function toggleSidebar() {
    setSidebarToggle(!sidebarToggle)
  }
  
  return (
    <div className="app-container">
      <Sidebar status={sidebarToggle} />
      <div className="main-content">
        <Header onSidebarToggle={toggleSidebar} />
        <div className="content-area">
          <div className="content-placeholder">Contents here</div>
        </div>
      </div>
    </div>
  )
}

export default App