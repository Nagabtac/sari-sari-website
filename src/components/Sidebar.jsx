import React from "react";

function Sidebar({ menuItems, isOpen, toggleSidebar }) {
  return (
    <>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-2xl font-bold text-gray-800">FrozenPOS</h2>
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-800 focus:outline-none"
          >
            ✕
          </button>
        </div>

        <nav className="p-5 space-y-4">
          {menuItems.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.text}</span>
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
