import React, { useState, useEffect } from "react";
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

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalUtang, setTotalUtang] = useState(0);
  const [calculatorValue, setCalculatorValue] = useState("0");
  const [calculatorHistory, setCalculatorHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout, token } = useAuth();

  // Ensure API_URL doesn't already include /api path
  let baseUrl = API_URL;
  if (baseUrl.includes('/api/')) {
    baseUrl = baseUrl.split('/api')[0];
  }
  baseUrl = baseUrl.replace(/\/+$/, '');
  const PRODUCTS_API = `${baseUrl}/api/products`;
  const SALES_API = `${baseUrl}/api/sales`;
  const UTANG_API = `${baseUrl}/api/store-credit-list`;

  useEffect(() => {
    if (token) {
      fetchTotalProducts();
      loadCalculatorHistory();
      fetchSales();
      fetchUtang();
    }
  }, [token]);

  // Return local ISO string format (YYYY-MM-DDTHH:mm:ss) without 'Z' to match backend LocalDateTime
  const nowIso = () => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    const localTime = new Date(now.getTime() - offsetMs);
    return localTime.toISOString().slice(0, 19);
  };

  const fetchTotalProducts = async () => {
    try {
      const res = await fetch(PRODUCTS_API, {
        headers: getHeaders(token)
      });

      if (res.ok) {
        const data = await res.json();
        const productsArray = Array.isArray(data)
          ? data
          : (data.products || data.data || []);
        setTotalProducts(productsArray.length);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };


  const fetchUtang = async () => {
    try {
      const res = await fetch(UTANG_API, { headers: getHeaders(token) });
      if (res.ok) {
        const data = await res.json();
        // Assuming data is an array of maps/payments
        const list = Array.isArray(data) ? data : (data.payments || []);
        setTotalUtang(list.length);
      }
    } catch (err) {
      console.error("Error fetching utang:", err);
    }
  };

  const loadCalculatorHistory = () => {
    const saved = localStorage.getItem('calculatorHistory');
    if (saved) {
      setCalculatorHistory(JSON.parse(saved));
    }
  };

  const fetchSales = async () => {
    try {
      const res = await fetch(SALES_API, {
        headers: getHeaders(token)
      });

      if (res.ok) {
        const data = await res.json();
        const salesArray = Array.isArray(data)
          ? data
          : (data.sales || data.data || []);

        // Calculate total sales from all sales records
        const total = salesArray.reduce((sum, sale) => {
          const amount = parseFloat(sale.amount || 0);
          return sum + amount;
        }, 0);

        setTotalSales(total);
      } else {
        console.error("Error fetching sales:", res.status, res.statusText);
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
    }
  };

  const saveCalculatorHistory = (history) => {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCalculatorInput = (value) => {
    if (value === "C") {
      setCalculatorValue("0");
    } else if (value === "=") {
      try {
        const result = eval(calculatorValue.replace(/×/g, '*').replace(/÷/g, '/'));
        const calculation = `${calculatorValue} = ${result}`;
        const newHistory = [...calculatorHistory, {
          calculation,
          result,
          timestamp: new Date().toLocaleString()
        }];
        setCalculatorHistory(newHistory);
        saveCalculatorHistory(newHistory);
        setCalculatorValue(result.toString());
      } catch (error) {
        setCalculatorValue("Error");
      }
    } else if (value === "←") {
      setCalculatorValue(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
    } else {
      setCalculatorValue(prev => prev === "0" ? value : prev + value);
    }
  };

  const addToSales = async (result) => {
    const amount = parseFloat(result);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount. Please enter a valid positive number.");
      return;
    }

    try {
      const timestamp = nowIso();
      const requestData = {
        amount: amount,
        sale_date: timestamp, // for backend expecting snake_case
        saleDate: timestamp   // for backend expecting camelCase
      };

      console.log("Saving sale to API:", requestData);

      const res = await fetch(SALES_API, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(requestData),
      });

      if (res.ok) {
        const newSale = await res.json();
        console.log("Sale saved successfully:", newSale);

        // Refresh sales to get updated total
        await fetchSales();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to save sale: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error saving sale:", error);
      alert("Failed to save sale. Please try again.");
    }
  };

  const saveTotalSales = async () => {
    if (totalSales <= 0) {
      alert("Total sales is zero. Nothing to save.");
      return;
    }

    try {
      const timestamp = nowIso();
      const requestData = {
        amount: totalSales,
        sale_date: timestamp, // for backend expecting snake_case
        saleDate: timestamp   // for backend expecting camelCase
      };

      console.log("Saving total sales to API:", requestData);

      const res = await fetch(SALES_API, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(requestData),
      });

      if (res.ok) {
        const newSale = await res.json();
        console.log("Sale saved successfully:", newSale);
        alert(`Total sales of ₱${totalSales.toFixed(2)} has been saved to the database.`);

        // Don't refresh here - the total already includes all sales from database
        // Refreshing would double-count since we just saved the total as a new sale
        // If you want to see the updated list, manually refresh the page
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to save sale: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error saving sale:", error);
      alert("Failed to save sale. Please try again.");
    }
  };

  const clearHistory = () => {
    setCalculatorHistory([]);
    saveCalculatorHistory([]);
  };

  const clearSales = async () => {
    if (!window.confirm("Are you sure you want to clear all sales? This will delete all sales records from the database.")) {
      return;
    }

    try {
      // Fetch all sales first
      const res = await fetch(SALES_API, {
        headers: getHeaders(token)
      });

      if (res.ok) {
        const data = await res.json();
        const salesArray = Array.isArray(data)
          ? data
          : (data.sales || data.data || []);

        // Delete each sale record
        const deletePromises = salesArray.map(sale => {
          const saleId = sale.sale_id || sale.saleId || sale.id;
          return fetch(`${SALES_API}/${saleId}`, {
            method: "DELETE",
            headers: getHeaders(token)
          });
        });

        await Promise.all(deletePromises);
        setTotalSales(0);
        alert("All sales have been cleared.");
      }
    } catch (error) {
      console.error("Error clearing sales:", error);
      alert("Failed to clear sales. Please try again.");
    }
  };

  const menuItems = [
    { text: "Home", link: "/", icon: "🏠" },
    { text: "Products", link: "/products", icon: "📦" },
    { text: "Store Credit List", link: "/store-credit-list", icon: "📋" },
    { text: "Logout", link: "/logout", icon: "🚪" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">

      <Sidebar
        menuItems={menuItems}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onLogout={handleLogout}
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
          }`}
      >
        <Header
          toggleSidebar={toggleSidebar}
          searchValue=""
          onSearchChange={() => { }}
        />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Welcome to Sari-Sari Senpai</h2>
              <p className="text-gray-600 mt-1">Your dashboard</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => navigate("/products")}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-3">📦</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Products</h3>
                <p className="text-gray-600">Manage your product inventory</p>
              </div>

              <div
                onClick={() => navigate("/store-credit-list")}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Store Credit List</h3>
                <p className="text-gray-600">View all payment records</p>
              </div>
            </div>

            {/* Total Products & Total Utang */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Total Products</h3>
                <p className="text-3xl font-bold text-blue-600">{loading ? "..." : totalProducts}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Total Utang</h3>
                <p className="text-3xl font-bold text-red-600">{loading ? "..." : totalUtang}</p>
              </div>
            </div>

            {/* Calculator and Sales Section */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calculator */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Calculator</h3>
                <div className="mb-4">
                  <div className="bg-gray-100 p-4 rounded-lg text-right text-2xl font-mono min-h-[60px] flex items-center justify-end">
                    {calculatorValue}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["C", "←", "÷", "×"].map((btn) => (
                    <button
                      key={btn}
                      onClick={() => handleCalculatorInput(btn)}
                      className="bg-gray-200 hover:bg-gray-300 p-4 rounded-lg font-semibold text-lg"
                    >
                      {btn}
                    </button>
                  ))}
                  {[7, 8, 9, "-"].map((btn) => (
                    <button
                      key={btn}
                      onClick={() => handleCalculatorInput(btn.toString())}
                      className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg font-semibold text-lg"
                    >
                      {btn}
                    </button>
                  ))}
                  {[4, 5, 6, "+"].map((btn) => (
                    <button
                      key={btn}
                      onClick={() => handleCalculatorInput(btn.toString())}
                      className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg font-semibold text-lg"
                    >
                      {btn}
                    </button>
                  ))}
                  {[1, 2, 3, "="].map((btn) => (
                    <button
                      key={btn}
                      onClick={() => handleCalculatorInput(btn.toString())}
                      className={`p-4 rounded-lg font-semibold text-lg ${btn === "="
                        ? "bg-blue-600 hover:bg-blue-700 text-white col-span-1"
                        : "bg-gray-100 hover:bg-gray-200"
                        }`}
                    >
                      {btn}
                    </button>
                  ))}
                  {[0, "."].map((btn) => (
                    <button
                      key={btn}
                      onClick={() => handleCalculatorInput(btn.toString())}
                      className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg font-semibold text-lg"
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculator History and Total Sales */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Calculator History</h3>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                </div>
                <div className="mb-6 max-h-64 overflow-y-auto space-y-2">
                  {calculatorHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm">No calculations yet</p>
                  ) : (
                    calculatorHistory.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.calculation}</p>
                          <p className="text-xs text-gray-500">{item.timestamp}</p>
                        </div>
                        <button
                          onClick={() => addToSales(item.result)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Add to Sales
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Total Sales</h3>
                      <p className="text-xs text-gray-500">Current date/time: {new Date().toLocaleString()}</p>
                    </div>
                    <button
                      onClick={clearSales}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Reset
                    </button>
                  </div>
                  <p className="text-3xl font-bold text-green-600 mb-4">₱{totalSales.toFixed(2)}</p>
                  <button
                    onClick={saveTotalSales}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Save Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

