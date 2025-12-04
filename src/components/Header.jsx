import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

function Header({ toggleSidebar, searchValue, onSearchChange, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate("/logout");
    }
  };

  return (
    <header className="bg-white shadow-md py-3 flex items-center justify-between px-6">

      {/* LEFT: Menu + Title */}
      <div className="flex items-center space-x-4">
        <button
          className="flex flex-col justify-between w-8 h-6 p-1 focus:outline-none"
          onClick={toggleSidebar}
        >
          <span className="block w-full h-1 bg-gray-800 rounded-full"></span>
          <span className="block w-full h-1 bg-gray-800 rounded-full"></span>
          <span className="block w-full h-1 bg-gray-800 rounded-full"></span>
        </button>

        <h1 className="text-2xl font-bold text-gray-800">Sari-Sari Senpai</h1>
      </div>

      {/* RIGHT SECTION: Search + Bell + Avatar + Logout */}
      <div className="flex items-center space-x-6">

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchValue || ""}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="w-64 px-3 py-2 rounded-lg border border-gray-300 shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-sky-400"
        />

        {/* Notification Bell */}
        <div className="relative cursor-pointer">
          <Bell size={22} className="text-gray-700" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            7
          </span>
        </div>

        {/* Avatar Circle */}
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          DFC
        </div>

        {/* Logout */}
        <button
          onClick={handleLogoutClick}
          className="text-gray-700 font-medium hover:text-red-600"
        >
          Logout
        </button>

      </div>
    </header>
  );
}

export default Header;
