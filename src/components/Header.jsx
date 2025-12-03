import React from "react";

function Header({ toggleSidebar }) {
  return (
    <header className="bg-white shadow-md py-3 relative flex items-center px-6">

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


      <div className="absolute left-1/2 transform -translate-x-1/2">
        <input
          type="text"
          placeholder="Search..."
          className="w-64 px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>
    </header>
  );
}

export default Header;