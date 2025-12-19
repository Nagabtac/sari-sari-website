import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, token } = useAuth();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [archivedProducts, setArchivedProducts] = useState([]);
    const [archivedPayments, setArchivedPayments] = useState([]);
    const [archivedTransactions, setArchivedTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || "products");



    // Ensure API_URL doesn't already include /api path
    let baseUrl = API_URL;
    if (baseUrl.includes('/api/')) {
        baseUrl = baseUrl.split('/api')[0];
    }
    baseUrl = baseUrl.replace(/\/+$/, '');

    const ARCHIVE_PRODUCTS_API = `${baseUrl}/api/products/archive`;
    const ARCHIVE_PAYMENTS_API = `${baseUrl}/api/archive/payments`;
    const ARCHIVE_TRANSACTIONS_API = `${baseUrl}/api/transactions/archived`;
    const TRANSACTIONS_API = `${baseUrl}/api/transactions`;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        logout();
        navigate("/login");
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

    useEffect(() => {
        if (token) {
            if (activeTab === "products") {
                fetchArchivedProducts();
            } else if (activeTab === "payments") {
                fetchArchivedPayments();
            } else if (activeTab === "transactions") {
                fetchArchivedTransactions();
            }
        }
    }, [token, activeTab]);

    const fetchArchivedProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(ARCHIVE_PRODUCTS_API, {
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

    const fetchArchivedPayments = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(ARCHIVE_PAYMENTS_API, { headers: getHeaders(token) });
            if (!res.ok) throw new Error("Failed to fetch archived payments");
            const data = await res.json();
            setArchivedPayments(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchArchivedTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(ARCHIVE_TRANSACTIONS_API, { headers: getHeaders(token) });
            if (!res.ok) throw new Error("Failed to fetch archived transactions");
            const data = await res.json();
            const salesArray = Array.isArray(data) ? data : (data.sales || data.data || []);
            // Sort by date desc
            salesArray.sort((a, b) => new Date(b.transactionDate || b.transaction_date) - new Date(a.transactionDate || a.transaction_date));
            setArchivedTransactions(salesArray);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUnarchive = async (id) => {
        if (!window.confirm("Are you sure you want to restore this product?")) return;

        try {
            const res = await fetch(`${ARCHIVE_PRODUCTS_API}/${id}/restore`, {
                method: "POST",
                headers: getHeaders(token)
            });

            if (res.ok) {
                setArchivedProducts(prev => prev.filter(p => p.productId !== id));
                alert("Product restored successfully!");
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Failed to restore product: ${errorData.message || res.statusText}`);
            }
        } catch (err) {
            console.error("Error restoring product:", err);
        }
    };

    const handleProductDelete = async (id) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this product? This acton cannot be undone.")) return;

        try {
            const res = await fetch(`${ARCHIVE_PRODUCTS_API}/${id}`, {
                method: "DELETE",
                headers: getHeaders(token)
            });

            if (res.ok) {
                setArchivedProducts(prev => prev.filter(p => p.productId !== id));
                alert("Product permanently deleted.");
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Failed to delete product: ${errorData.message || res.statusText}`);
            }
        } catch (err) {
            console.error("Error deleting product:", err);
            alert("Failed to delete product.");
        }
    };

    const handlePaymentUnarchive = async (id) => {
        if (!window.confirm("Restore this payment record?")) return;
        try {
            const res = await fetch(`${ARCHIVE_PAYMENTS_API}/${id}/restore`, {
                method: "POST",
                headers: getHeaders(token)
            });
            if (res.ok) {
                setArchivedPayments(prev => prev.filter(p => p.paymentId !== id));
                alert("Payment restored successfully!");
            } else {
                const text = await res.text();
                let errorMessage;
                try {
                    const errorData = JSON.parse(text);
                    errorMessage = errorData.message || res.statusText;
                } catch (e) {
                    errorMessage = text || res.statusText;
                }
                alert(`Failed to restore payment: ${errorMessage}`);
            }
        } catch (err) {
            alert(`Failed to restore payment: ${err.message || err}`);
        }
    };

    const handlePaymentDelete = async (id) => {
        if (!window.confirm("PERMANENTLY delete this payment record? This cannot be undone.")) return;
        try {
            const res = await fetch(`${ARCHIVE_PAYMENTS_API}/${id}`, {
                method: "DELETE",
                headers: getHeaders(token)
            });
            if (res.ok) {
                setArchivedPayments(prev => prev.filter(p => p.paymentId !== id));
                alert("Payment permanently deleted.");
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Failed to delete payment: ${errorData.message}`);
            }
        } catch (err) {
            alert("Failed to delete payment.");
        }
    };

    const handleTransactionUnarchive = async (archiveId) => {
        if (!window.confirm("Are you sure you want to restore this transaction?")) return;

        try {
            const res = await fetch(`${TRANSACTIONS_API}/${archiveId}/unarchive`, {
                method: "POST",
                headers: getHeaders(token)
            });

            if (!res.ok) throw new Error("Failed to restore transaction");

            // Remove from UI
            setArchivedTransactions(prev => prev.filter(txn => {
                const id = txn.archiveId || txn.archive_id;
                return id !== archiveId;
            }));
            alert("Transaction restored.");
        } catch (err) {
            console.error(err);
            alert("Failed to restore transaction.");
        }
    };

    const handleTransactionDelete = async (archiveId) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this transaction? This action cannot be undone.")) return;

        try {
            const res = await fetch(`${TRANSACTIONS_API}/archived/${archiveId}`, {
                method: "DELETE",
                headers: getHeaders(token)
            });

            if (!res.ok) throw new Error("Failed to delete transaction");

            setArchivedTransactions(prev => prev.filter(txn => {
                const id = txn.archiveId || txn.archive_id;
                return id !== archiveId;
            }));
            alert("Transaction deleted permanently.");
        } catch (err) {
            console.error(err);
            alert("Failed to delete transaction.");
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
                            <h2 className="text-3xl font-bold text-gray-800">Archive</h2>
                            <p className="text-gray-600 mt-1">View previously deleted records</p>
                        </div>
                        <button
                            onClick={() => navigate("/products")}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all"
                        >
                            Back to Products
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-4 mb-6 border-b border-gray-200">
                        <button
                            className={`pb-2 px-4 ${activeTab === "products" ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-500"}`}
                            onClick={() => setActiveTab("products")}
                        >
                            Archived Products
                        </button>
                        <button
                            className={`pb-2 px-4 ${activeTab === "payments" ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-500"}`}
                            onClick={() => setActiveTab("payments")}
                        >
                            Archived Payments
                        </button>
                        <button
                            className={`pb-2 px-4 ${activeTab === "transactions" ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-500"}`}
                            onClick={() => setActiveTab("transactions")}
                        >
                            Archived Transactions
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
                    ) : (activeTab === "products" ? (
                        archivedProducts.length > 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Product Name</th>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Selling Price</th>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Unit</th>
                                            <th className="py-4 px-6 text-center font-semibold text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {archivedProducts.map((product) => (
                                            <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-6 text-sm text-gray-900 font-medium">{product.productId}</td>
                                                <td className="py-4 px-6 text-sm text-gray-700 font-medium">{product.productName}</td>
                                                <td className="py-4 px-6 text-sm text-gray-700">₱{parseFloat(product.sellingPrice || 0).toFixed(2)}</td>
                                                <td className="py-4 px-6 text-sm text-gray-700">{product.unit || "-"}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <button
                                                        onClick={() => handleUnarchive(product.productId)}
                                                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded shadow transition-colors"
                                                    >
                                                        Unarchive
                                                    </button>
                                                    <button
                                                        onClick={() => handleProductDelete(product.productId)}
                                                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded shadow transition-colors ml-2"
                                                    >
                                                        Delete Permanently
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
                        )
                    ) : activeTab === "transactions" ? (
                        archivedTransactions.length > 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-4 px-6 text-center font-semibold text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {archivedTransactions.map((txn) => (
                                            <tr key={txn.archiveId || txn.archive_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-6 text-sm text-gray-900 font-medium">#{txn.transactionId || txn.transaction_id}</td>
                                                <td className="py-4 px-6 text-sm text-gray-800 font-medium">
                                                    {txn.customerName || txn.customer_name || (txn.customerId ? `Customer #${txn.customerId}` : "Walk-in/Guest")}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-700">
                                                    {new Date(txn.transactionDate || txn.transaction_date).toLocaleString()}
                                                </td>
                                                <td className="py-4 px-6 text-sm font-bold text-green-600">
                                                    ₱{parseFloat(txn.amount).toFixed(2)}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(txn.status || 'PENDING') === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                        (txn.status || 'PENDING') === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {txn.status || "PENDING"}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <button
                                                        onClick={() => handleTransactionUnarchive(txn.archiveId || txn.archive_id)}
                                                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded shadow transition-colors"
                                                    >
                                                        Restore
                                                    </button>
                                                    <button
                                                        onClick={() => handleTransactionDelete(txn.archiveId || txn.archive_id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded shadow transition-colors ml-2"
                                                    >
                                                        Delete Permanently
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
                                <p className="text-gray-500 text-lg font-medium">No archived transactions found.</p>
                            </div>
                        )
                    ) : (
                        // Payments Table
                        archivedPayments.length > 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Balance</th>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Pay Date</th>
                                            <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-4 px-6 text-center font-semibold text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {archivedPayments.map((p) => (
                                            <tr key={p.paymentId} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-6 text-sm text-gray-900 font-medium">{p.paymentId}</td>
                                                <td className="py-4 px-6 text-sm text-gray-700 font-medium">{p.customerName || "-"}</td>
                                                <td className="py-4 px-6 text-sm text-gray-700">₱{parseFloat(p.amount || 0).toFixed(2)}</td>
                                                <td className="py-4 px-6 text-sm text-gray-700">₱{parseFloat(p.balance || 0).toFixed(2)}</td>
                                                <td className="py-4 px-6 text-sm text-gray-700">{p.payDate ? new Date(p.payDate).toLocaleString() : "-"}</td>
                                                <td className="py-4 px-6 text-sm text-gray-700">{p.status}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <button
                                                        onClick={() => handlePaymentUnarchive(p.paymentId)}
                                                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded shadow transition-colors"
                                                    >
                                                        Unarchive
                                                    </button>
                                                    <button
                                                        onClick={() => handlePaymentDelete(p.paymentId)}
                                                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded shadow transition-colors ml-2"
                                                    >
                                                        Delete Permanently
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
                                <p className="text-gray-500 text-lg font-medium">No archived payments found.</p>
                            </div>
                        )
                    ))}
                </main>
            </div>
        </div>
    );
}

export default Archive;
