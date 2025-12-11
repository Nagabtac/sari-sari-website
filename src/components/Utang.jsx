import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/constants";

// Helper function to get headers with authentication
const getHeaders = (token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

function Utang() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { logout, token } = useAuth();

  // Ensure API_URL doesn't already include /api path
  let baseUrl = API_URL;
  if (baseUrl.includes('/api/')) {
    baseUrl = baseUrl.split('/api')[0];
  }
  baseUrl = baseUrl.replace(/\/+$/, '');
  const UTANG_API = `${baseUrl}/api/new`;

  const [formData, setFormData] = useState({
    customer_name: "",
    amount: "",
    balance: "",
    method: "",
    status: "full_balance"
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { text: "Home", link: "/", icon: "🏠" },
    { text: "Products", link: "/products", icon: "📦" },
    { text: "Utang", link: "/utang", icon: "💳" },
    { text: "Store Credit List", link: "/store-credit-list", icon: "📋" },
    { text: "Profile", link: "/profile", icon: "👤" },
    { text: "Settings", link: "/settings", icon: "⚙️" },
    { text: "Logout", link: "/logout", icon: "🚪" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const amount = parseFloat(formData.amount) || 0;
      const balance = parseFloat(formData.balance) || amount; // Default balance to amount if not specified
      
      const requestData = {
        customer_name: formData.customer_name,
        amount: amount,
        balance: balance,
        method: formData.method || "",
        status: formData.status || "full_balance"
      };

      console.log("Sending Utang request to:", UTANG_API);
      console.log("Request data:", requestData);
      console.log("This should create:");
      console.log("1. A new customer in the 'customers' table (if not exists)");
      console.log("2. A new payment record in the 'payments' table with customer_id");

      const res = await fetch(UTANG_API, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(requestData),
      });

      // Check content type before parsing
      const contentType = res.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        
        let errorMessage = `Failed to create Utang: ${res.status} ${res.statusText}`;
        
        if (isJson) {
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (parseErr) {
            console.error("Error parsing error response:", parseErr);
          }
        } else {
          // If response is HTML (like an error page), provide a helpful message
          if (res.status === 404) {
            errorMessage = "API endpoint not found. Please check if the backend server is running and the endpoint '/api/new' exists.";
          } else {
            errorMessage = `Server error (${res.status}). The server returned an HTML response instead of JSON. Please check if the backend endpoint is correctly configured.`;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Parse response only if it's JSON
      if (isJson) {
        const data = await res.json();
        console.log("Utang created successfully:", data);
        setSuccess(true);
        setFormData({ customer_name: "", amount: "", balance: "", method: "", status: "full_balance" });
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        // If response is not JSON but status is OK, still show success
        console.log("Utang created successfully (non-JSON response)");
        setSuccess(true);
        setFormData({ customer_name: "", amount: "", balance: "", method: "", status: "full_balance" });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error creating Utang:", err);
      setError(err.message || "Failed to create Utang. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <Sidebar
        menuItems={menuItems}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onLogout={handleLogout}
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header
          toggleSidebar={toggleSidebar}
          searchValue=""
          onSearchChange={() => {}}
        />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800">New Utang</h2>
              <p className="text-gray-600 mt-1">Create a new credit record for a customer</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                Utang created successfully!
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    name="customer_name"
                    type="text"
                    placeholder="Enter customer name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₱)
                  </label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Balance (₱)
                  </label>
                  <input
                    name="balance"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Leave empty to use amount"
                    value={formData.balance}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">If left empty, balance will be set to the amount</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Method
                  </label>
                  <input
                    name="method"
                    type="text"
                    placeholder="Enter payment method (e.g., Cash, Credit, etc.)"
                    value={formData.method}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="full_balance">Full Balance</option>
                    <option value="partialy">Partially Paid</option>
                    <option value="fully_paid">Fully Paid</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Utang"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Utang;

