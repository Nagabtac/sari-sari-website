import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/constants";

const getHeaders = (token) => {
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

function Inventory() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open
    const navigate = useNavigate();
    const { logout, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    console.log("Rendering Inventory Component");
    console.log("Token:", token);
    console.log("API_URL:", API_URL);

    // Form State
    const initialFormState = {
        productName: "", sellingPrice: "", basePrice: "", quantityInStock: 0, description: "", unit: ""
    };
    const [formData, setFormData] = useState(initialFormState);

    // API URL Setup
    let baseUrl = API_URL || "http://localhost:8080"; // Fallback to prevent crash
    if (baseUrl && baseUrl.includes('/api/')) baseUrl = baseUrl.split('/api')[0];
    if (baseUrl) baseUrl = baseUrl.replace(/\/+$/, '');
    const PRODUCTS_API = `${baseUrl}/api/products`;

    useEffect(() => {
        if (token) {
            fetchProducts();
        }
    }, [token]);

    const fetchProducts = async () => {
        try {
            const res = await fetch(PRODUCTS_API, { headers: getHeaders(token) });
            if (res.ok) {
                const data = await res.json();
                const list = (data && Array.isArray(data)) ? data : (data?.products || []);
                setProducts(Array.isArray(list) ? list : []);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errorMessage) setErrorMessage(""); // Clear error on type
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        // Check for duplicate
        const isDuplicate = products.some(p =>
            p.productName.toLowerCase() === formData.productName.trim().toLowerCase() &&
            (p.unit || "").toLowerCase() === (formData.unit || "").trim().toLowerCase()
        );

        if (isDuplicate) {
            setErrorMessage("A product with this name and unit already exists.");
            return;
        }

        setLoading(true);

        try {
            const requestData = {
                productName: formData.productName,
                sellingPrice: parseFloat(formData.sellingPrice || 0),
                basePrice: parseFloat(formData.basePrice || 0),
                quantityInStock: parseInt(formData.quantityInStock || 0),
                description: formData.description || "",
                unit: formData.unit || ""
            };

            console.log("Saving product:", requestData);

            const res = await fetch(PRODUCTS_API, {
                method: "POST",
                headers: getHeaders(token),
                body: JSON.stringify(requestData),
            });

            if (res.ok) {
                // alert("Product added successfully!");
                setFormData(initialFormState); // Reset form
                fetchProducts(); // Refresh list to include new product
            } else if (res.status === 401) {
                alert("Unauthorized. Please log in again.");
                logout();
                navigate("/login");
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Failed to save product: ${errorData.message || res.statusText}`);
            }
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { text: "Home", link: "/", icon: "🏠" },
        { text: "Products", link: "/products", icon: "📦" },
        { text: "New Product", link: "/new-product", icon: "➕" },
        { text: "Stock", link: "/stock", icon: "🔢" },
        { text: "Transactions", link: "/transactions", icon: "🧾" },
        { text: "New Transaction", link: "/new-transaction", icon: "💰" },
        { text: "Store Credit List", link: "/store-credit-list", icon: "📋" },
        { text: "Reports", link: "/reports", icon: "📊" },
        { text: "Archive", link: "/archive", icon: "🗄️" },
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
                    onLogout={handleLogout}
                />

                <main className="flex-1 p-6 overflow-auto">
                    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">New Product</h2>
                        <p className="text-gray-600 mb-8">Enter details to add a new item.</p>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    name="productName"
                                    placeholder="Enter product name"
                                    value={formData.productName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₱)</label>
                                    <input
                                        name="sellingPrice"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.sellingPrice}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₱)</label>
                                    <input
                                        name="basePrice"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.basePrice}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity in Stock</label>
                                    <input
                                        name="quantityInStock"
                                        type="number"
                                        placeholder="0"
                                        value={formData.quantityInStock}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                    <input
                                        name="unit"
                                        placeholder="e.g. Small, 1L"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Enter product description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all h-32 resize-none"
                                />
                            </div>

                            {errorMessage && (
                                <div className="text-red-500 text-sm font-semibold bg-red-50 p-3 rounded-lg border border-red-200">
                                    {errorMessage}
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || errorMessage}
                                    className={`px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 ${loading || errorMessage ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Saving...' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Inventory;
