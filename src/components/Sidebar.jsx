import React from "react";
import { useNavigate } from "react-router-dom";

function Sidebar({ menuItems, isOpen, toggleSidebar, onLogout }) {
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    if (item.link === "/logout" && onLogout) {
      onLogout();
    } else {
      navigate(item.link);
    }
    toggleSidebar(); // Close sidebar after navigation
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-black shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-2xl font-bold text-white">Sari-Sari Senpai</h2>
        </div>

        <nav className="p-5 space-y-4 ">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleItemClick(item)}
              className="w-full flex items-center space-x-3 text-white hover:bg-gray-500 rounded-lg p-2 transition-colors text-left text-white"
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
