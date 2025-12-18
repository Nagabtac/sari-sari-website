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

function NewTransaction() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Data States
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    // Search States
    const [customerSearch, setCustomerSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Selection States
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [cart, setCart] = useState([]);

    // Transaction State
    const [transactionType, setTransactionType] = useState("cash"); // cash (Sale) or credit (Utang)
    // Additional states for Credit (Utang) manual entry if no selectedCustomer
    const [creditForm, setCreditForm] = useState({
        fname: "",
        lname: "",
        payDate: new Date().toISOString().split('T')[0], // Default to current date
        method: "Cash",
        status: "COMPLETED"
    });

    // Payment Amount for Change Calculation
    const [customerPayment, setCustomerPayment] = useState("");

    const navigate = useNavigate();
    const { logout, token } = useAuth();
    const [loading, setLoading] = useState(false);

    // API Config
    let baseUrl = API_URL;
    if (baseUrl.includes('/api/')) baseUrl = baseUrl.split('/api')[0];
    baseUrl = baseUrl.replace(/\/+$/, '');
    const SALES_API = `${baseUrl}/api/transactions`;
    const STORE_CREDIT_API = `${baseUrl}/api/store-credit-list`;
    const PRODUCTS_API = `${baseUrl}/api/products`;

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
            fetchCustomers();
            fetchProducts();
        }
    }, [token]);

    // --- Filtering Effects ---
    useEffect(() => {
        if (!customerSearch) {
            setFilteredCustomers([]);
            return;
        }
        const lower = customerSearch.toLowerCase();
        const filtered = customers.filter(c => c.name.toLowerCase().includes(lower));
        setFilteredCustomers(filtered);
    }, [customerSearch, customers]);

    useEffect(() => {
        if (!productSearch) {
            setFilteredProducts([]);
            return;
        }
        const lower = productSearch.toLowerCase();
        const filtered = products.filter(p => p.productName.toLowerCase().includes(lower));
        // Limit to 5 results for cleaner UI
        setFilteredProducts(filtered.slice(0, 5));
    }, [productSearch, products]);

    // --- Fetching Data ---
    const fetchProducts = async () => {
        try {
            const res = await fetch(PRODUCTS_API, { headers: getHeaders(token) });
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : (data.products || []);
                setProducts(list);
            }
        } catch (err) { console.error(err); }
    };

    const fetchCustomers = async () => {
        try {
            // Fetching unique customers from existing store credits
            // Ideally this should be a dedicated Customers API
            const res = await fetch(STORE_CREDIT_API, { headers: getHeaders(token) });
            if (res.ok) {
                const data = await res.json();
                const payments = Array.isArray(data) ? data : (data.payments || []);
                const unique = new Map();
                payments.forEach(p => {
                    if (p.customerName && !unique.has(p.customerName)) {
                        unique.set(p.customerName, {
                            name: p.customerName,
                            fname: p.fname,
                            lname: p.lname,
                            id: p.customerId // Check if API returns this
                        });
                    }
                });
                setCustomers(Array.from(unique.values()));
            }
        } catch (err) { console.error(err); }
    };

    // --- Handlers ---
    const handleAddToCart = (product) => {
        const existing = cart.find(item => item.productId === product.productId);
        if (existing) {
            setCart(cart.map(item =>
                item.productId === product.productId
                    ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.sellingPrice }
                    : item
            ));
        } else {
            setCart([...cart, {
                ...product,
                qty: 1,
                subtotal: product.sellingPrice
            }]);
        }
        setProductSearch(""); // Clear search to allow continuous scanning/typing
    };

    const updateCartQty = (productId, newQty) => {
        if (newQty < 1) {
            setCart(cart.filter(item => item.productId !== productId));
            return;
        }
        setCart(cart.map(item =>
            item.productId === productId
                ? { ...item, qty: newQty, subtotal: newQty * item.sellingPrice }
                : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const handleUseCustomer = (customer) => {
        setSelectedCustomer(customer);
        setCustomerSearch(customer.name);
        // Auto-fill credit form fields if they exist
        setCreditForm(prev => ({
            ...prev,
            fname: customer.fname || "",
            lname: customer.lname || ""
        }));
        setFilteredCustomers([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0 && transactionType === 'cash') {
            alert("Please add items to the cart.");
            return;
        }

        setLoading(true);
        const totalAmount = calculateTotal();
        const now = new Date();
        // Adjust to local ISO string and remove 'Z' for LocalDateTime
        const offsetMs = now.getTimezoneOffset() * 60 * 1000;
        const localTime = new Date(now.getTime() - offsetMs).toISOString().slice(0, 19);

        try {
            if (transactionType === "cash") {
                // New Transaction Schema
                const payload = {
                    customer_id: selectedCustomer ? selectedCustomer.id : null,
                    fname: creditForm.fname,
                    lname: creditForm.lname,
                    transaction_date: localTime,
                    transaction_type: "Sale", // Or derive from type
                    amount: totalAmount,
                    payment_method: creditForm.method || "Cash",
                    status: creditForm.status || "COMPLETED",
                    pay_date: creditForm.payDate ? `${creditForm.payDate}T00:00:00` : null,
                    remarks: cart.map(i => `${i.productName} x${i.qty}`).join(", ")
                };

                console.log("Sending Transaction Payload:", JSON.stringify(payload, null, 2));

                // Note: Use /api/transactions endpoint
                const res = await fetch(SALES_API, {
                    method: "POST",
                    headers: getHeaders(token),
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const errText = await res.text();
                    console.error("Transaction Error Response:", res.status, errText);
                    throw new Error(`Failed to save transaction: ${res.status} ${errText}`);
                }

                // alert("Transaction saved!");
                navigate("/transactions");
            } else {
                // Store Credit Logic (Utang)
                // Need to construct payload for existing 'payments' table/API

                let fname = creditForm.fname;
                let lname = creditForm.lname;

                // If user typed a name but didn't select, try to parsing it
                if (!selectedCustomer && !fname && customerSearch) {
                    const parts = customerSearch.trim().split(" ");
                    if (parts.length > 0) fname = parts[0];
                    if (parts.length > 1) lname = parts.slice(1).join(" ");
                }

                const payload = {
                    fname: fname || "Guest",
                    lname: lname || "Customer",
                    customer_name: (fname && lname) ? `${fname} ${lname}` : customerSearch,
                    amount: totalAmount,
                    balance: totalAmount, // Initial balance = amount
                    pay_date: creditForm.payDate ? `${creditForm.payDate}T00:00:00` : null,
                    method: "Credit",
                    status: creditForm.status
                };

                const res = await fetch(`${baseUrl}/api/new`, {
                    method: "POST",
                    headers: getHeaders(token),
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error("Failed to create store credit record");

                // alert("Store credit record created!");
                navigate("/store-credit-list");
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
            <Sidebar menuItems={menuItems} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} onLogout={handleLogout} />

            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                <Header toggleSidebar={toggleSidebar} onLogout={handleLogout} />

                <main className="flex-1 p-6 overflow-auto">
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 h-full">

                        {/* LEFT COLUMN: Product Selection */}
                        <div className="lg:w-2/3 flex flex-col gap-6">

                            {/* Search Bar */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Add Products</h2>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Scan barcode or type product name..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                                        autoFocus
                                    />

                                    {/* Dropdown for direct selection */}
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500 mb-1">Or select directly:</p>
                                        <select
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-lg bg-white"
                                            onChange={(e) => {
                                                const pid = parseInt(e.target.value);
                                                const product = products.find(p => p.productId === pid);
                                                if (product) {
                                                    handleAddToCart(product);
                                                    e.target.value = ""; // Reset
                                                }
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>-- Select a Product --</option>
                                            {products
                                                .sort((a, b) => a.productName.localeCompare(b.productName))
                                                .map(p => (
                                                    <option key={p.productId} value={p.productId}>
                                                        {p.productName} (Qty: {p.quantityInStock}) - ₱{p.sellingPrice}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    {filteredProducts.length > 0 && productSearch && (
                                        <div className="absolute z-20 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                            {filteredProducts.map(product => (
                                                <div
                                                    key={product.productId}
                                                    onClick={() => handleAddToCart(product)}
                                                    className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 flex justify-between items-center"
                                                >
                                                    <div>
                                                        <p className="font-bold text-gray-800">{product.productName}</p>
                                                        <p className="text-sm text-gray-500">Stock: {product.quantityInStock} {product.unit}</p>
                                                    </div>
                                                    <p className="font-bold text-blue-600">₱{product.sellingPrice}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cart Table */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Current Order</h2>
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50 border-b sticky top-0">
                                            <tr>
                                                <th className="py-2 px-4 text-left">Product</th>
                                                <th className="py-2 px-4 text-center">Price</th>
                                                <th className="py-2 px-4 text-center">Qty</th>
                                                <th className="py-2 px-4 text-right">Subtotal</th>
                                                <th className="py-2 px-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {cart.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="py-8 text-center text-gray-400">Cart is empty</td>
                                                </tr>
                                            ) : (
                                                cart.map(item => (
                                                    <tr key={item.productId} className="hover:bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            <p className="font-semibold">{item.productName}</p>
                                                            {item.unit && <span className="text-xs text-gray-500">{item.unit}</span>}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">₱{item.sellingPrice}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button onClick={() => updateCartQty(item.productId, item.qty - 1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">-</button>
                                                                <span className="w-8 text-center">{item.qty}</span>
                                                                <button onClick={() => updateCartQty(item.productId, item.qty + 1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">+</button>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-medium">₱{item.subtotal.toFixed(2)}</td>
                                                        <td className="py-3 px-4 text-right">
                                                            <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:text-red-700">×</button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Total Footer */}
                                <div className="border-t pt-4 mt-4 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                    <span className="text-lg text-gray-600">Total Amount</span>
                                    <span className="text-3xl font-bold text-gray-900">₱{calculateTotal().toFixed(2)}</span>
                                </div>

                                {/* Payment & Change Calculator */}
                                <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-700 font-medium">Payment Amount</span>
                                        <input
                                            type="number"
                                            value={customerPayment}
                                            onChange={(e) => setCustomerPayment(e.target.value)}
                                            className="w-32 px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                                        <span className="text-lg font-bold text-gray-800">Change</span>
                                        <span className={`text-xl font-bold ${(parseFloat(customerPayment) || 0) - calculateTotal() < 0 ? "text-red-500" : "text-green-600"
                                            }`}>
                                            ₱{((parseFloat(customerPayment) || 0) - calculateTotal()).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Customer & Payment */}
                        <div className="lg:w-1/3 flex flex-col gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Details</h2>

                                <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">

                                    {/* Transaction Type Toggle */}
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTransactionType('cash');
                                                if (creditForm.method === 'Credit') {
                                                    setCreditForm(prev => ({ ...prev, method: 'Cash' }));
                                                }
                                            }}
                                            className={`py-2 rounded-md font-medium transition-all ${transactionType === 'cash' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            Cash / Sale
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTransactionType('credit')}
                                            className={`py-2 rounded-md font-medium transition-all ${transactionType === 'credit' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            Store Credit
                                        </button>
                                    </div>

                                    {/* Unified Customer & Payment Fields */}
                                    <div className="space-y-4 animate-fadeIn">
                                        {/* Name Inputs - Always show if no existing customer selected (or to edit for new) */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">First Name</label>
                                                <input
                                                    type="text"
                                                    value={creditForm.fname}
                                                    onChange={e => {
                                                        setCreditForm({ ...creditForm, fname: e.target.value });
                                                        // Clear selected customer if manually typing name to force new/lookup
                                                        if (selectedCustomer && e.target.value !== selectedCustomer.fname) {
                                                            setSelectedCustomer(null);
                                                        }
                                                    }}
                                                    className="w-full border-b-2 border-gray-200 focus:border-blue-500 outline-none py-1"
                                                    placeholder="First Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={creditForm.lname}
                                                    onChange={e => {
                                                        setCreditForm({ ...creditForm, lname: e.target.value });
                                                        if (selectedCustomer && e.target.value !== selectedCustomer.lname) {
                                                            setSelectedCustomer(null);
                                                        }
                                                    }}
                                                    className="w-full border-b-2 border-gray-200 focus:border-blue-500 outline-none py-1"
                                                    placeholder="Last Name"
                                                />
                                            </div>
                                        </div>

                                        {/* Customer Search Overlay (renamed/repurposed to Search helper) */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={customerSearch}
                                                onChange={(e) => {
                                                    setCustomerSearch(e.target.value);
                                                    // Also try to fill fname/lname from simple typing if needed, but separate fields are better
                                                }}
                                                placeholder="Search to autofill..."
                                                className="w-full text-sm text-gray-400 border-b border-gray-100 focus:border-blue-300 outline-none py-1"
                                            />
                                            {customerSearch && !selectedCustomer && filteredCustomers.length > 0 && (
                                                <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                    {filteredCustomers.map((c, i) => (
                                                        <div
                                                            key={i}
                                                            onClick={() => handleUseCustomer(c)}
                                                            className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                                                        >
                                                            <p className="font-semibold text-gray-800">{c.name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Date</label>
                                            <input
                                                type="date"
                                                value={creditForm.payDate}
                                                onChange={e => setCreditForm({ ...creditForm, payDate: e.target.value })}
                                                className="w-full border-b-2 border-gray-200 focus:border-blue-500 outline-none py-1"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</label>
                                                <select
                                                    value={creditForm.method || 'Cash'}
                                                    onChange={e => setCreditForm({ ...creditForm, method: e.target.value })}
                                                    className="w-full border-b-2 border-gray-200 focus:border-blue-500 outline-none py-1 bg-transparent"
                                                >
                                                    <option value="Cash">Cash</option>
                                                    <option value="Gcash">Gcash</option>
                                                    <option value="Credit">Credit</option>
                                                </select>
                                            </div>
                                            <div className="text-right">
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Status</label>
                                                <select
                                                    value={transactionType === 'cash' ? 'COMPLETED' : (creditForm.status || 'FULL_BALANCE')}
                                                    onChange={e => setCreditForm({ ...creditForm, status: e.target.value })}
                                                    className="w-full border-b-2 border-gray-200 focus:border-blue-500 outline-none py-1 bg-transparent text-right"
                                                    disabled={transactionType === 'cash'} // Cash is always completed
                                                >
                                                    <option value="COMPLETED">Completed</option>
                                                    <option value="PENDING">Pending</option>
                                                    <option value="FULL_BALANCE">Full Balance</option>
                                                    <option value="PARTIALLY_PAID">Partially Paid</option>
                                                    <option value="FULLY_PAID">Fully Paid</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all hover:-translate-y-1 ${transactionType === 'cash'
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                                                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
                                                }`}
                                        >
                                            {loading
                                                ? "Processing..."
                                                : `Complete ${transactionType === 'cash' ? 'Sale' : 'Utang'} - ₱${calculateTotal().toFixed(2)}`
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}

export default NewTransaction;
