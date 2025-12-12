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

function Archive() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [archivedProducts, setArchivedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { logout, token } = useAuth();

    // Ensure API_URL doesn't already include /api path
    let baseUrl = API_URL;
    if (baseUrl.includes('/api/')) {
        baseUrl = baseUrl.split('/api')[0];
    }
    baseUrl = baseUrl.replace(/\/+$/, '');
    const ARCHIVE_API = `${baseUrl}/api/products/archive`;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const menuItems = [
        { text: "Home", link: "/", icon: "🏠" },
        { text: "Products", link: "/products", icon: "📦" },
        { text: "Store Credit List", link: "/store-credit-list", icon: "📋" },
        { text: "Archive", link: "/archive", icon: "🗄️" },
        { text: "Logout", link: "/logout", icon: "🚪" },
    ];

    useEffect(() => {
        if (token) {
            fetchArchivedProducts();
        }
    }, [token]);

    const fetchArchivedProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(ARCHIVE_API, {
                headers: getHeaders(token)
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch archived products: ${res.status}`);
            }

            const data = await res.json();
            setArchivedProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching archive:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUnarchive = async (id) => {
        if (!window.confirm("Are you sure you want to restore this product?")) return;

        try {
            const res = await fetch(`${ARCHIVE_API}/${id}/restore`, {
                method: "POST",
                headers: getHeaders(token)
            });

            if (res.ok) {
                setArchivedProducts(prev => prev.filter(p => p.productId !== id));
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Failed to restore product: ${errorData.message || res.statusText}`);
            }
        } catch (err) {
            console.error("Error restoring product:", err);
            alert("Failed to restore product.");
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
                className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
                    }`}
            >
                <Header
                    toggleSidebar={toggleSidebar}
                    searchValue=""
                    onSearchChange={() => { }}
                    onLogout={handleLogout}
                />

                <main className="flex-1 p-6 overflow-auto">
                    {/* Title Section */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Product Archive</h2>
                            <p className="text-gray-600 mt-1">View previously deleted products</p>
                        </div>
                        <button
                            onClick={() => navigate("/products")}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all"
                        >
                            Back to Products
                        </button>
                    </div>

                    {/* Table Section */}
                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="text-4xl mb-4 animate-spin">⏳</div>
                            <p className="text-gray-500 text-lg font-medium">Loading archive...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="text-6xl mb-4">⚠️</div>
                            <p className="text-red-500 text-lg font-medium mb-2">Error loading archive</p>
                            <p className="text-gray-500 text-sm">{error}</p>
                        </div>
                    ) : archivedProducts.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Product Name</th>
                                        <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Selling Price</th>
                                        <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Size</th>
                                        <th className="py-4 px-6 text-center font-semibold text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {archivedProducts.map((product) => (
                                        <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6 text-sm text-gray-900 font-medium">{product.productId}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700 font-medium">{product.productName}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">₱{parseFloat(product.sellingPrice || 0).toFixed(2)}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{product.size || "-"}</td>
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => handleUnarchive(product.productId)}
                                                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded shadow transition-colors"
                                                >
                                                    Unarchive
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="text-6xl mb-4">🗄️</div>
                            <p className="text-gray-500 text-lg font-medium">No archived products found.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Archive;
