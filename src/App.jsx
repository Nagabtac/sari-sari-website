import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const API_URL = "http://localhost:1000/api/cars";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed
  const [cars, setCars] = useState([]);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormState = {
    id: null, make: "", model: "", year: "", color: "", bodyType: "", engineType: "", licensePlate: ""
  };
  const [formData, setFormData] = useState(initialFormState);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { text: "Home", link: "/", icon: "🏠" },
    { text: "Profile", link: "/profile", icon: "👤" },
    { text: "Settings", link: "/settings", icon: "⚙️" },
    { text: "Logout", link: "/logout", icon: "🚪" },
  ];

  // --- API Effects & Handlers ---
  useEffect(() => { fetchCars(); }, []);

  const fetchCars = () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(err => console.error("Error fetching cars:", err));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddModal = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (car) => {
    setFormData(car);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) setCars(cars.filter((car) => car.id !== id));
    } catch (error) { console.error("Error deleting car:", error); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/${formData.id}` : API_URL;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const savedCar = await res.json();
        isEditing ? setCars(cars.map(c => c.id === savedCar.id ? savedCar : c)) : setCars([...cars, savedCar]);
        setIsModalOpen(false);
      }
    } catch (error) { console.error("Error saving car:", error); }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      <Sidebar
        menuItems={menuItems}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* UPDATED LINE BELOW: 
         1. Added `transition-all duration-300` for smooth animation
         2. Added dynamic margin: `${isSidebarOpen ? "ml-64" : "ml-0"}`
         3. Removed `w-full` to prevent horizontal scrollbar when pushed
      */}
      <div 
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6 overflow-auto">
          {/* Title Section */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Welcome to Sari-Sari Senpai</h2>
              <p className="text-gray-600 mt-1">Manage your vehicle inventory</p>
            </div>
            <button 
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="text-xl leading-none pb-1">+</span> Add New Car
            </button>
          </div>

          {/* Table Section */}
          {cars.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Make</th>
                    <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Model</th>
                    <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Plate</th>
                    <th className="py-4 px-6 text-center font-semibold text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cars.map((car) => (
                    <tr key={car.id} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">{car.id}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{car.make}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{car.model}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{car.year}</td>
                      <td className="py-4 px-6 text-sm text-gray-700 font-mono bg-gray-50 rounded px-2">{car.licensePlate}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center space-x-3">
                          <button onClick={() => openEditModal(car)} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">Edit</button>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => handleDelete(car.id)} className="text-red-600 hover:text-red-900 font-medium text-sm">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-6xl mb-4">🚗</div>
              <p className="text-gray-500 text-lg font-medium">No cars found in inventory.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal Logic (Unchanged) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4">{isEditing ? "Edit Vehicle" : "Add Vehicle"}</h3>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <input name="make" placeholder="Make" value={formData.make} onChange={handleInputChange} className="border p-2 rounded" />
              <input name="model" placeholder="Model" value={formData.model} onChange={handleInputChange} className="border p-2 rounded" />
              <input name="year" type="number" placeholder="Year" value={formData.year} onChange={handleInputChange} className="border p-2 rounded" />
              <input name="licensePlate" placeholder="Plate" value={formData.licensePlate} onChange={handleInputChange} className="border p-2 rounded" />
              <div className="col-span-2 flex justify-end space-x-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;