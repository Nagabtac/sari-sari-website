import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import { useState } from "react"
import "./App.css"

const App = () => {
  const [sidebarToggle, setSidebarToggle] = useState(true)

  function toggleSidebar() {
    setSidebarToggle(!sidebarToggle)
  }
  
  // Conditionally set the class for the main content area
  // If sidebarToggle is false (off), add the 'full-width' class.
  const mainContentClass = sidebarToggle ? "main-content" : "main-content full-width";
  
  return (
    <div className="app-container">
      {/* Pass the status to Sidebar component */}
      <Sidebar status={sidebarToggle} /> 
      
      <div className={mainContentClass}>
        <Header onSidebarToggle={toggleSidebar} />
        <div className="content-area">
          <div className="content-placeholder">Contents here</div>
        </div>
      </div>
    </div>
  )
}

export default App;