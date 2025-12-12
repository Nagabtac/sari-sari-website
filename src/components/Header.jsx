import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react"; // Added Search icon for cleaner look
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/constants";

function Header({ toggleSidebar, searchValue, onSearchChange, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const isProductsPage = location.pathname === "/products";

  // Local state for global search
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const wrapperRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch and filter products for global search
  useEffect(() => {
    if (isProductsPage || !term.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        let baseUrl = API_URL;
        if (baseUrl.includes('/api/')) baseUrl = baseUrl.split('/api')[0];
        baseUrl = baseUrl.replace(/\/+$/, '');
        const PRODUCTS_API = `${baseUrl}/api/products`;

        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(PRODUCTS_API, { headers });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.products || []);

          const filtered = list.filter(p =>
            (p.productName || "").toLowerCase().includes(term.toLowerCase()) ||
            (p.sku || "").toLowerCase().includes(term.toLowerCase())
          );
          setResults(filtered.slice(0, 5)); // Limit to 5 results
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Global search error:", err);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [term, isProductsPage, token]);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate("/logout");
    }
  };

  const handleInputChange = (val) => {
    if (isProductsPage) {
      if (onSearchChange) onSearchChange(val);
    } else {
      setTerm(val);
      if (!val) setIsOpen(false);
    }
  };

  const handleResultClick = () => {
    // Navigate to products page with the search term pre-filled (if we could pass state)
    // or just navigate to products. 
    // Since Products.jsx uses local state 'searchTerm', passing it via navigation state 
    // requires Products.jsx to check location.state. unfortunately Products.jsx doesn't check it right now.
    // For now, let's just go to products. The user can re-search or we assume they just wanted to find if it exists.
    // Ideally update Products to read from URL query params.
    navigate("/products");
    setIsOpen(false);
    setTerm("");
  };

  const currentSearchValue = isProductsPage ? (searchValue || "") : term;

  return (
    <header className="bg-white shadow-md py-3 flex items-center justify-between px-6 z-20 relative">

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

        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-green-700 transition-colors"
        >
          Raven Joy Store
        </h1>
      </div>

      {/* RIGHT SECTION: Search + Bell + Avatar */}
      <div className="flex items-center space-x-6">

        {/* Search Bar Container */}
        <div className="relative" ref={wrapperRef}>
          <div className="relative">
            <input
              type="text"
              placeholder={isProductsPage ? "Filter products..." : "Global search..."}
              value={currentSearchValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-64 pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-green-700 transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          {/* Dropdown Results */}
          {!isProductsPage && isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-2 border border-gray-100 overflow-hidden z-50">
              {results.map(product => (
                <div
                  key={product.productId}
                  onClick={handleResultClick}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 transition-colors"
                >
                  <p className="font-semibold text-gray-800 text-sm">{product.productName}</p>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{product.size ? product.size : 'No Size'}</span>
                    <span className="font-medium text-green-600">₱{product.sellingPrice}</span>
                  </div>
                </div>
              ))}
              <div
                onClick={() => navigate("/products")}
                className="p-2 text-center text-xs text-blue-600 font-medium bg-gray-50 cursor-pointer hover:bg-gray-100"
              >
                View all results
              </div>
            </div>
          )}

          {!isProductsPage && isOpen && term && results.length === 0 && (
            <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-2 border border-gray-100 p-3 text-center text-sm text-gray-500 z-50">
              No products found
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative cursor-pointer">
          <Bell size={22} className="text-gray-700" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            7
          </span>
        </div>

        {/* Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 transition-all focus:outline-none"
          >
            DFC
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">User Profile</p>
                <p className="text-xs text-gray-500">user@example.com</p>
              </div>
              <button
                onClick={handleLogoutClick}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <span>🚪</span> Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;
