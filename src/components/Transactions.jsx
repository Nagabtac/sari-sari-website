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

function Transactions() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { logout, token } = useAuth();

    let baseUrl = API_URL;
    if (baseUrl.includes('/api/')) baseUrl = baseUrl.split('/api')[0];
    baseUrl = baseUrl.replace(/\/+$/, '');
    const SALES_API = `${baseUrl}/api/transactions`;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const handleLogout = () => { logout(); navigate("/login"); };

    const menuItems = [
        { text: "Home", link: "/", icon: "🏠" },
        { text: "Products", link: "/products", icon: "📦" },
        { text: "Inventory", link: "/inventory", icon: "➕" },
        { text: "Transactions", link: "/transactions", icon: "🧾" },
        { text: "New Transaction", link: "/new-transaction", icon: "💰" },
        { text: "Store Credit List", link: "/store-credit-list", icon: "📋" },
        { text: "Archive", link: "/archive", icon: "🗄️" },
        { text: "Logout", link: "/logout", icon: "🚪" },
    ];

    useEffect(() => {
        if (token) {
            fetchSales();
        }
    }, [token]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const res = await fetch(SALES_API, { headers: getHeaders(token) });
            if (!res.ok) throw new Error("Failed to fetch transactions");
            const data = await res.json();
            // Supports both array of data or { sales: [] }
            const salesArray = Array.isArray(data) ? data : (data.sales || data.data || []);

            // Sort by date desc
            salesArray.sort((a, b) => new Date(b.transactionDate || b.transaction_date) - new Date(a.transactionDate || a.transaction_date));

            setSales(salesArray);
        } catch (err) {
            console.error(err);
            setError("Failed to load transactions.");
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this transaction?")) return;

        try {
            const res = await fetch(`${SALES_API}/${id}`, {
                method: "DELETE",
                headers: getHeaders(token)
            });

            if (!res.ok) throw new Error("Failed to delete transaction");

            // Remove from UI
            setSales(sales.filter(txn => {
                const txnId = txn.transactionId || txn.transaction_id || txn.id;
                return txnId !== id;
            }));
            alert("Transaction deleted.");
        } catch (err) {
            console.error(err);
            alert("Failed to delete transaction.");
        }
    };

    const handleEdit = (txn) => {
        // Since NewTransaction doesn't support edit mode yet, we'll just alert for now
        // or navigate if you plan to implement it later
        // navigate(`/new-transaction`, { state: { editTransaction: txn } });
        alert("Edit functionality coming soon!");
    };

    const [searchTerm, setSearchTerm] = useState("");

    // --- Filtering ---
    const filteredSales = sales.filter(txn => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        const id = (txn.transactionId || txn.transaction_id || txn.id || "").toString().toLowerCase();
        const customer = (txn.customerName || txn.customer_name || "").toLowerCase();
        const type = (txn.transactionType || txn.transaction_type || "").toLowerCase();
        const method = (txn.paymentMethod || txn.payment_method || "").toLowerCase();

        return id.includes(lowerTerm) ||
            customer.includes(lowerTerm) ||
            type.includes(lowerTerm) ||
            method.includes(lowerTerm);
    });

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
            <Sidebar menuItems={menuItems} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} onLogout={handleLogout} />

            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                <Header toggleSidebar={toggleSidebar} onLogout={handleLogout} />

                <main className="flex-1 p-6 overflow-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Transactions</h2>
                            <p className="text-gray-600 mt-1">History of saved transactions</p>
                        </div>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                                onClick={() => navigate("/new-transaction")}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all hover:shadow-lg"
                            >
                                + New Transaction
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading transactions...</div>
                        ) : error ? (
                            <div className="p-8 text-center text-red-500">{error}</div>
                        ) : filteredSales.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                {searchTerm ? "No transactions found matching your search." : "No transactions found."}
                            </div>
                        ) : (
                            <table className="min-w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="py-4 px-6 text-left font-semibold text-gray-500">ID</th>
                                        <th className="py-4 px-6 text-left font-semibold text-gray-500">Customer</th>
                                        <th className="py-4 px-6 text-left font-semibold text-gray-500">Date</th>
                                        <th className="py-4 px-6 text-left font-semibold text-gray-500">Type</th>
                                        <th className="py-4 px-6 text-left font-semibold text-gray-500">Amount</th>
                                        <th className="py-4 px-6 text-left font-semibold text-gray-500">Method</th>
                                        <th className="py-4 px-6 text-left font-semibold text-gray-500">Status</th>
                                        <th className="py-4 px-6 text-left font-semibold text-gray-500">Remarks</th>
                                        <th className="py-4 px-6 text-center font-semibold text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredSales.map((txn, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="py-4 px-6 text-gray-900 font-mono text-sm">#{txn.transactionId || txn.transaction_id || txn.id}</td>
                                            <td className="py-4 px-6 text-gray-800 font-medium">
                                                {txn.customerName || txn.customer_name || (txn.customerId ? `Customer #${txn.customerId}` : "Walk-in/Guest")}
                                            </td>
                                            <td className="py-4 px-6 text-gray-700 text-sm">
                                                {new Date(txn.transactionDate || txn.transaction_date).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6 text-gray-700">
                                                {txn.transactionType || txn.transaction_type || "Sale"}
                                            </td>
                                            <td className="py-4 px-6 font-bold text-green-600">
                                                ₱{parseFloat(txn.amount).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6 text-gray-700">
                                                {txn.paymentMethod || txn.payment_method || "Cash"}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(txn.status || 'PENDING') === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    (txn.status || 'PENDING') === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {txn.status || "PENDING"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-gray-500 text-sm italic">
                                                {txn.remarks || "-"}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(txn)}
                                                        className="text-blue-500 hover:text-blue-700 font-medium text-sm border border-blue-200 hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(txn.transactionId || txn.transaction_id || txn.id)}
                                                        className="text-red-500 hover:text-red-700 font-medium text-sm border border-red-200 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Transactions;
