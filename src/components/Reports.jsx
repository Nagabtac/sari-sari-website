import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

function Reports() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Custom date range state
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const navigate = useNavigate();
    const { logout, token } = useAuth();

    let baseUrl = API_URL;
    if (baseUrl.includes('/api/')) baseUrl = baseUrl.split('/api')[0];
    baseUrl = baseUrl.replace(/\/+$/, '');
    const TRANSACTIONS_API = `${baseUrl}/api/transactions`;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const handleLogout = () => { logout(); navigate("/login"); };

    const menuItems = [
        { text: "Home", link: "/", icon: "🏠" },
        { text: "Products", link: "/products", icon: "📦" },
        { text: "Inventory", link: "/inventory", icon: "➕" },
        { text: "Transactions", link: "/transactions", icon: "🧾" },
        { text: "New Transaction", link: "/new-transaction", icon: "💰" },
        { text: "Store Credit List", link: "/store-credit-list", icon: "📋" },
        { text: "Reports", link: "/reports", icon: "📊" },
        { text: "Archive", link: "/archive", icon: "🗄️" },
        { text: "Logout", link: "/logout", icon: "🚪" },
    ];

    useEffect(() => {
        if (token) {
            fetchTransactions();
        }
    }, [token]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch(TRANSACTIONS_API, { headers: getHeaders(token) });
            if (!res.ok) throw new Error("Failed to fetch transactions");
            const data = await res.json();
            const salesArray = Array.isArray(data) ? data : (data.sales || data.data || []);
            setTransactions(salesArray);
        } catch (err) {
            console.error(err);
            setError("Failed to load transactions.");
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = (data, title, dateRangeStr) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(33, 150, 83); // Green color
        doc.text("Raven Joy Store", 105, 15, { align: "center" });

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(title, 105, 25, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 32, { align: "center" });
        if (dateRangeStr) {
            doc.text(dateRangeStr, 105, 37, { align: "center" });
        }

        // Table Data
        const tableColumn = ["Date", "Type", "Details", "Method", "Amount"];
        const tableRows = [];

        let totalAmount = 0;

        data.forEach(txn => {
            const date = new Date(txn.transactionDate || txn.transaction_date).toLocaleDateString();
            const type = txn.transactionType || txn.transaction_type || "Sale";
            const customer = txn.customerName || txn.customer_name || "Walk-in";
            const method = txn.paymentMethod || txn.payment_method || "Cash";
            const amount = parseFloat(txn.amount || 0);

            totalAmount += amount;

            tableRows.push([
                date,
                type,
                customer,
                method,
                amount.toFixed(2)
            ]);
        });

        // Add Table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 83] }, // Green header
            styles: { fontSize: 9 },
        });

        // Total
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Profit/Revenue: ${totalAmount.toFixed(2)}`, 14, finalY);

        doc.save("report.pdf");
    };

    const handleGenerateMonthlyReport = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const filtered = transactions.filter(txn => {
            const d = new Date(txn.transactionDate || txn.transaction_date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        if (filtered.length === 0) {
            alert("No transactions found for this month.");
            return;
        }

        const monthName = now.toLocaleString('default', { month: 'long' });
        generatePDF(filtered, `Monthly Report - ${monthName} ${currentYear}`);
    };

    const handleGenerateCustomReport = () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);

        if (start > end) {
            alert("Start date cannot be after end date.");
            return;
        }

        const filtered = transactions.filter(txn => {
            const d = new Date(txn.transactionDate || txn.transaction_date);
            return d >= start && d <= end;
        });

        if (filtered.length === 0) {
            alert("No transactions found for the selected range.");
            return;
        }

        generatePDF(filtered, "Custom Report", `From ${startDate} to ${endDate}`);
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
            <Sidebar menuItems={menuItems} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} onLogout={handleLogout} />

            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                <Header toggleSidebar={toggleSidebar} onLogout={handleLogout} />

                <main className="flex-1 p-6 overflow-auto">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-gray-800">Reports</h2>
                            <p className="text-gray-600 mt-1">Generate financial reports</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Monthly Report Card */}
                            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="text-2xl mr-2">📅</span> Monthly Report
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Generate a complete report of all transactions and profits for the current month.
                                </p>
                                <button
                                    onClick={handleGenerateMonthlyReport}
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? "Loading Data..." : "Generate Monthly PDF"}
                                </button>
                            </div>

                            {/* Custom Report Card */}
                            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="text-2xl mr-2">⚙️</span> Custom Range Report
                                </h3>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerateCustomReport}
                                    disabled={loading}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? "Loading Data..." : "Generate Custom PDF"}
                                </button>
                            </div>
                        </div>

                        {/* Summary Section (Optional but nice) */}
                        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-blue-600 font-medium">Total Transactions (Loaded)</p>
                                    <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-green-600 font-medium">Total Revenue (All Time)</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        ₱{transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}

export default Reports;
