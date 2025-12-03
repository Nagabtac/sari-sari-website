import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [cars, setCars] = useState([]); // state to hold fetched data

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { text: "Home", link: "/", icon: "🏠" },
    { text: "Profile", link: "/profile", icon: "👤" },
    { text: "Settings", link: "/settings", icon: "⚙️" },
    { text: "Logout", link: "/logout", icon: "🚪" },
  ];

  // Fetch cars from API on component mount
  useEffect(() => {
    fetch("http://localhost:1000/api/cars")
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(err => console.error("Error fetching cars:", err));
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        menuItems={menuItems}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-transform duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6 overflow-auto">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Welcome to FrozenPOS
          </h2>
          <p className="text-gray-700 mb-4">
            Please select your desired food
          </p>

          {/* Display the car data */}
          {cars.length > 0 ? (
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-4 border">ID</th>
                  <th className="py-2 px-4 border">Body Type</th>
                  <th className="py-2 px-4 border">Color</th>
                  <th className="py-2 px-4 border">Engine Type</th>
                  <th className="py-2 px-4 border">License Plate</th>
                  <th className="py-2 px-4 border">Make</th>
                  <th className="py-2 px-4 border">Model</th>
                  <th className="py-2 px-4 border">Year</th>
                </tr>
              </thead>
              <tbody>
                {cars.map(car => (
                  <tr key={car.id}>
                    <td className="py-2 px-4 border">{car.id}</td>
                    <td className="py-2 px-4 border">{car.body_type}</td>
                    <td className="py-2 px-4 border">{car.color}</td>
                    <td className="py-2 px-4 border">{car.engine_type}</td>
                    <td className="py-2 px-4 border">{car.license_plate}</td>
                    <td className="py-2 px-4 border">{car.make}</td>
                    <td className="py-2 px-4 border">{car.model}</td>
                    <td className="py-2 px-4 border">{car.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">Loading cars...</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
