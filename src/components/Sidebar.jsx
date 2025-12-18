import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Sidebar({ menuItems, isOpen, toggleSidebar, onLogout }) {
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    if (item.link === "/logout" && onLogout) {
      onLogout();
    } else {
      navigate(item.link);
    }
    toggleSidebar();
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-green-700 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col items-center justify-center p-5 border-b border-green-600">
          <img src={logo} alt="Logo" className="w-16 h-16 object-contain mb-3 bg-white rounded-full p-1" />
          <h2 className="text-2xl font-bold text-white text-center">Raven Joy Store</h2>
        </div>

        <nav className="p-5 space-y-4 ">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleItemClick(item)}
              className="w-full flex items-center space-x-3 text-white hover:bg-blue-700 rounded-lg p-2 transition-colors text-left text-white"
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.text}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
