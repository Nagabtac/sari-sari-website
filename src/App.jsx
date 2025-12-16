import Sidebar from "./components/Sidebar"
import Header from "./components/Header"

import { useState } from "react"
import "./App.css"

const App = () => {
  const [sidebarToggle, setSidebarToggle] = useState(true)

  function toggleSidebar() {
    setSidebarToggle(!sidebarToggle)
  }

  const mainContentClass = sidebarToggle ? "main-content" : "main-content full-width";

  return (
    <div className="app-container">
      <Sidebar status={sidebarToggle} />

      <div className={mainContentClass}>
        <Header onSidebarToggle={toggleSidebar} />
        <div className="content-area ">
          <h1 style={{ fontSize: '15px' }}>Main Content</h1>
        </div>
      </div>
    </div>
  )
}

export default App;