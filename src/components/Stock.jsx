import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

function Stock() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, token } = useAuth();
    const [highlightId, setHighlightId] = useState(null);

    // Ensure API_URL doesn't already include /api path
    let baseUrl = API_URL;
    if (baseUrl.includes('/api/')) baseUrl = baseUrl.split('/api')[0];
    baseUrl = baseUrl.replace(/\/+$/, '');
    const PRODUCTS_API = `${baseUrl}/api/products`;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const handleLogout = () => { logout(); navigate("/login"); };

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

    useEffect(() => {
        if (token) {
            fetchProducts();
        }
    }, [token]);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredProducts(products);
            return;
        }
        const lower = searchTerm.toLowerCase();
        const filtered = products.filter(p =>
            p.productName.toLowerCase().includes(lower) ||
            (p.productId && p.productId.toString().includes(lower))
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    // Handle Scrolling to Highlighted Item
    useEffect(() => {
        if (location.state?.highlightId && !loading && filteredProducts.length > 0) {
            const id = location.state.highlightId;
            setHighlightId(id);

            // Allow time for DOM to render
            setTimeout(() => {
                const element = document.getElementById(`row-${id}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

            // Clear highlight after a few seconds
            const timer = setTimeout(() => {
                setHighlightId(null);
                // Clear state to prevent scrolling again on re-render
                navigate(location.pathname, { replace: true, state: {} });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [location.state, loading, filteredProducts, navigate, location.pathname]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(PRODUCTS_API, { headers: getHeaders(token) });
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : (data.products || []);
                setProducts(list);
                setFilteredProducts(list);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            alert("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (id, newQty) => {
        setFilteredProducts(prev => prev.map(p =>
            p.productId === id ? { ...p, quantityInStock: parseInt(newQty) || 0 } : p
        ));
    };

    const handleUpdateStock = async (product) => {
        try {
            const url = `${PRODUCTS_API}/${product.productId}`;
            const res = await fetch(url, {
                method: "PUT",
                headers: getHeaders(token),
                body: JSON.stringify(product)
            });

            if (res.ok) {
                alert(`Stock updated for ${product.productName}`);
                fetchProducts();
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Failed to update stock: ${errorData.message || res.statusText}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error updating stock.");
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
            <Sidebar menuItems={menuItems} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} onLogout={handleLogout} />

            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                <Header toggleSidebar={toggleSidebar} onLogout={handleLogout} />

                <main className="flex-1 p-6 overflow-auto">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">Stock Management</h2>
                                <p className="text-gray-600 mt-1">Adjust product quantities</p>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="py-4 px-6 text-left font-semibold text-gray-500">Product</th>
                                        <th className="py-4 px-6 text-left font-semibold text-gray-500">Current Stock</th>
                                        <th className="py-4 px-6 text-left font-semibold text-gray-500">Status</th>
                                        <th className="py-4 px-6 text-left font-semibold text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="4" className="p-8 text-center">Loading...</td></tr>
                                    ) : filteredProducts.length === 0 ? (
                                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">No products found.</td></tr>
                                    ) : (
                                        filteredProducts.map(p => {
                                            const isLowStock = (p.quantityInStock || 0) <= 10;
                                            const isHighlighted = highlightId === p.productId;
                                            return (
                                                <tr
                                                    key={p.productId}
                                                    id={`row-${p.productId}`}
                                                    className={`hover:bg-gray-50 transition-colors ${isHighlighted ? 'bg-yellow-50' : ''}`}
                                                >
                                                    <td className="py-4 px-6">
                                                        <p className="font-bold text-gray-800">{p.productName}</p>
                                                        <p className="text-sm text-gray-500">ID: {p.productId} | {p.unit}</p>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleQuantityChange(p.productId, (p.quantityInStock || 0) - 1)}
                                                                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 font-bold"
                                                            >-</button>
                                                            <input
                                                                type="number"
                                                                value={p.quantityInStock || 0}
                                                                onChange={(e) => handleQuantityChange(p.productId, e.target.value)}
                                                                className="w-20 text-center border rounded py-1"
                                                            />
                                                            <button
                                                                onClick={() => handleQuantityChange(p.productId, (p.quantityInStock || 0) + 1)}
                                                                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 font-bold"
                                                            >+</button>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {isLowStock && (
                                                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-red-200">
                                                                Low Stock
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <button
                                                            onClick={() => handleUpdateStock(p)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors"
                                                        >
                                                            Update
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Stock;
