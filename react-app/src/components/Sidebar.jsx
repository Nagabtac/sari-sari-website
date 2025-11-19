// src/components/Sidebar.jsx

function Sidebar({ status }) { // <-- 1. Receiving the 'status' prop
    const menuItems = [
      {icon: "🏠", text: "Home", link: "/"},
      {icon: "💼", text: "Products", link: "/product"},
      {icon: "⚙️", text: "Settings", link: "/settings"}
    ]
  
    return status && (
      <div>
        <div>
          <h2>App Name</h2>
        </div>
        <nav>
          <ul>
            {/* Menu mapping */}
            {menuItems.map((item, index) => (
              <li key={index}><i className="icon">{item.icon}</i><span className="text">{item.text}</span></li>
            ))}
          </ul>
        </nav>
  
        {/* 2. Conditional rendering based on status */}
        <h1>{status ? "Open" : "Closed"}</h1> 
      </div>
    )
  }
  
  export default Sidebar;