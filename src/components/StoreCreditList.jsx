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

function StoreCreditList() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout, token } = useAuth();

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initialFormState = {
    paymentId: null,
    fname: "",
    lname: "",
    amount: "",
    balance: "",
    amount_date: "",
    pay_date: "",
    method: "",
    status: "full_balance"
  };
  const [formData, setFormData] = useState(initialFormState);
  const [paymentCust, setPaymentCust] = useState("");

  // Calculator State
  const [products, setProducts] = useState([]);
  const [calcItems, setCalcItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [calcQty, setCalcQty] = useState(1);
  const [productSearch, setProductSearch] = useState("");

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [allPayments, setAllPayments] = useState([]);

  // Ensure API_URL doesn't already include /api path
  let baseUrl = API_URL;
  if (baseUrl.includes('/api/')) baseUrl = baseUrl.split('/api')[0];
  baseUrl = baseUrl.replace(/\/+$/, '');
  const STORE_CREDIT_API = `${baseUrl}/api/store-credit-list`;
  const PRODUCT_API = `${baseUrl}/api/products`;

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
      fetchStoreCredits();
      fetchProducts();
    }
  }, [token]);

  // Search Filter Effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setPayments(allPayments);
      return;
    }

    const filtered = allPayments.filter(p => {
      const search = searchTerm.toLowerCase();
      return (
        (p.customerName || "").toLowerCase().includes(search) ||
        (p.fname || "").toLowerCase().includes(search) ||
        (p.lname || "").toLowerCase().includes(search) ||
        String(p.paymentId || "").includes(search) ||
        String(p.amount || "").includes(search)
      );
    });
    setPayments(filtered);
  }, [searchTerm, allPayments]);

  const fetchStoreCredits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(STORE_CREDIT_API, { headers: getHeaders(token) });
      if (!res.ok) throw new Error("Failed to fetch store credits");
      const data = await res.json();

      const paymentsArray = Array.isArray(data) ? data : data.payments || [];
      setAllPayments(paymentsArray);
      setPayments(paymentsArray);
    } catch (err) {
      setError(err.message);
      setPayments([]);
      setAllPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(PRODUCT_API, { headers: getHeaders(token) });
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₱0.00";
    return `₱${parseFloat(amount).toFixed(2)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Sync amount with balance automatically
      if (name === "balance") {
        updated.amount = value;
      }
      return updated;
    });
  };

  const openEditModal = (payment) => {
    setFormData({
      paymentId: payment.paymentId,
      customer_name: payment.customer_name || "-",
      fname: payment.fname || "", // Might not be returned in list but good to keep safe
      lname: payment.lname || "",
      amount: payment.amount || "",
      balance: payment.balance || "",
      amount_date: "",
      pay_date: payment.payDate ? payment.payDate.substring(0, 16) : "",
      method: payment.method || "",
      status: payment.status ? payment.status.toLowerCase() : "full_balance"
    });
    setIsEditing(true);
    setIsEditing(true);
    setPaymentCust(""); // Reset payment amount
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    const now = new Date().toISOString().slice(0, 16);
    setFormData({ ...initialFormState, amount_date: now });
    setIsEditing(false);
    setCalcItems([]); // Reset calculator
    setProductSearch(""); // Reset search
    setPaymentCust(""); // Reset payment amount
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Auto-Archive Logic if payment is sufficient
    const payAmount = parseFloat(paymentCust) || 0;
    const currentBalance = parseFloat(formData.amount) || 0;

    if (payAmount >= currentBalance && isEditing) {
      // Archive directly
      const ARCHIVE_API = `${baseUrl}/api/store-credit-list/${formData.paymentId}/archive`;
      try {
        const res = await fetch(ARCHIVE_API, {
          method: "POST",
          headers: getHeaders(token)
        });

        if (!res.ok) throw new Error("Failed to archive");

        // alert("Payment complete. Record archived.");
        setIsModalOpen(false);
        fetchStoreCredits();
        return; // Stop here, don't do normal save
      } catch (err) {
        alert("Failed to archive: " + err.message);
        return;
      }
    }

    const API_SAVE = isEditing
      ? `${baseUrl}/api/store-credit-list/${formData.paymentId}`
      : `${baseUrl}/api/new`;

    const payload = {
      fname: formData.fname,
      lname: formData.lname,
      customer_name: `${formData.fname} ${formData.lname}`,
      amount: parseFloat(formData.amount),
      balance: parseFloat(formData.balance),
      amount_date: formData.amount_date ? formData.amount_date.substring(0, 16) : null,
      pay_date: formData.pay_date ? formData.pay_date.substring(0, 16) : null,
      method: formData.method,
      status: formData.status
    };

    const res = await fetch(API_SAVE, {
      method: isEditing ? "PUT" : "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      alert("Failed to save record");
      return;
    }

    setIsModalOpen(false);
    fetchStoreCredits();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete payment record?")) return;

    const DELETE_API = `${baseUrl}/api/store-credit-list/${id}`;
    const res = await fetch(DELETE_API, {
      method: "DELETE",
      headers: getHeaders(token)
    });

    if (!res.ok) {
      alert("Failed to delete");
      return;
    }

    fetchStoreCredits();
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archive this payment record?")) return;

    const ARCHIVE_API = `${baseUrl}/api/store-credit-list/${id}/archive`;
    const res = await fetch(ARCHIVE_API, {
      method: "POST",
      headers: getHeaders(token)
    });

    if (!res.ok) {
      alert("Failed to archive");
      return;
    }

    fetchStoreCredits();
  };

  // Calculator Functions
  const handleAddCalcItem = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.productId === parseInt(selectedProductId));
    if (!product) return;

    const newItem = {
      id: Date.now(),
      name: `${product.productName} (${product.unit || ''})`,
      price: product.sellingPrice,
      qty: parseInt(calcQty),
      subtotal: product.sellingPrice * parseInt(calcQty)
    };

    const newItems = [...calcItems, newItem];
    setCalcItems(newItems);
    updateAmountFromCalc(newItems);
    setCalcQty(1);
    setSelectedProductId("");
  };

  const removeCalcItem = (id) => {
    const newItems = calcItems.filter(i => i.id !== id);
    setCalcItems(newItems);
    updateAmountFromCalc(newItems);
  };

  const updateAmountFromCalc = (items) => {
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    setFormData(prev => ({
      ...prev,
      amount: total,
      balance: total
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <Sidebar menuItems={menuItems} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} onLogout={handleLogout} />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
        <Header toggleSidebar={toggleSidebar} searchValue="" onSearchChange={() => { }} onLogout={handleLogout} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold">Store Credit List</h2>
              <p className="text-gray-600">View all payment records</p>
            </div>
            <div className="flex space-x-3 items-center">
              {/* Local Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search credits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>

              <button
                onClick={() => navigate("/archive", { state: { activeTab: "payments" } })}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg shadow hover:bg-gray-600 transition-colors"
              >
                View Archive
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left">Payment ID</th>
                  {/* <th className="py-4 px-6 text-left">Customer Name</th> Removed */}
                  <th className="py-4 px-6 text-left">First Name</th>
                  <th className="py-4 px-6 text-left">Last Name</th>
                  <th className="py-4 px-6 text-left">Amount</th>
                  <th className="py-4 px-6 text-left">Balance</th>
                  {/* <th className="py-4 px-6 text-left">Amount Date</th>  Removed per request */}
                  <th className="py-4 px-6 text-left">Pay Date</th>
                  <th className="py-4 px-6 text-left">Method</th>
                  <th className="py-4 px-6 text-left">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.paymentId} className="hover:bg-blue-50">
                    <td className="py-4 px-6">{p.paymentId}</td>
                    {/* <td className="py-4 px-6">{p.customerName || "-"}</td> Removed */}
                    <td className="py-4 px-6">{p.fname || "-"}</td>
                    <td className="py-4 px-6">{p.lname || "-"}</td>
                    <td className="py-4 px-6">{formatCurrency(p.amount)}</td>
                    <td className="py-4 px-6">{formatCurrency(p.balance)}</td>
                    {/* <td className="py-4 px-6">{formatDate(p.amount_date)}</td> Removed */}
                    <td className="py-4 px-6">{formatDate(p.payDate)}</td>
                    <td className="py-4 px-6">{p.method}</td>
                    <td className="py-4 px-6">{p.status}</td>
                    <td className="py-4 px-6 text-center">
                      <button className="text-indigo-600" onClick={() => openEditModal(p)}>Edit</button>
                      <span className="mx-2">|</span>
                      <button className="text-orange-500" onClick={() => handleArchive(p.paymentId)}>Archive</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{isEditing ? "Edit Payment" : "New Utang"}</h3>

            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">

              {!isEditing && (
                <div className="col-span-2 bg-gray-50 p-4 rounded mb-4 border border-gray-200">
                  <h4 className="font-semibold mb-2 text-gray-700">Product Calculator</h4>

                  {/* Search Input */}
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Search product..."
                      className="border p-2 rounded w-full text-sm"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 mb-3">
                    <select
                      className="border p-2 rounded flex-1"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                      <option value="">Select Product...</option>
                      {products
                        .filter(p => p.productName.toLowerCase().includes(productSearch.toLowerCase()))
                        .map(p => (
                          <option key={p.productId} value={p.productId}>
                            {p.productName} ({p.unit}) - ₱{p.sellingPrice}
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      className="border p-2 rounded w-20"
                      value={calcQty}
                      min="1"
                      onChange={(e) => setCalcQty(e.target.value)}
                    />
                    <button type="button" onClick={handleAddCalcItem} className="bg-green-600 text-white px-3 rounded hover:bg-green-700">Add</button>
                  </div>

                  {calcItems.length > 0 && (
                    <div className="text-sm bg-white p-2 rounded border">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-500 border-b">
                            <th className="pb-1">Item</th>
                            <th className="pb-1">Qty</th>
                            <th className="pb-1 text-right">Subtotal</th>
                            <th className="pb-1"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {calcItems.map(item => (
                            <tr key={item.id} className="border-b last:border-0">
                              <td className="py-1">{item.name}</td>
                              <td className="py-1">{item.qty}</td>
                              <td className="py-1 text-right">₱{item.subtotal.toFixed(2)}</td>
                              <td className="py-1 text-right">
                                <button type="button" onClick={() => removeCalcItem(item.id)} className="text-red-500 font-bold px-2">x</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-bold border-t bg-gray-50">
                            <td colSpan="2" className="pt-2">Total</td>
                            <td className="pt-2 text-right">₱{calcItems.reduce((s, i) => s + i.subtotal, 0).toFixed(2)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block mb-1">First Name</label>
                <input
                  type="text"
                  name="fname"
                  value={formData.fname}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Last Name</label>
                <input
                  type="text"
                  name="lname"
                  value={formData.lname}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div className="hidden" style={{ display: 'none' }}>
                <label className="block mb-1">Amount</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="border p-2 rounded w-full" required />
              </div>

              <div>
                <label className="block mb-1">Balance</label>
                <input type="number" name="balance" value={formData.balance} onChange={handleInputChange} className="border p-2 rounded w-full" required />
              </div>


              <div>
                <label className="block mb-1">Pay Date</label>
                <input type="datetime-local" name="pay_date" value={formData.pay_date} onChange={handleInputChange} className="border p-2 rounded w-full" />
              </div>

              <div>
                <label className="block mb-1">Method</label>
                <select name="method" value={formData.method} onChange={handleInputChange} className="border p-2 rounded w-full" required>
                  <option value="credit">Credit</option>
                  <option value="gcash">Gcash</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="border p-2 rounded w-full">
                  <option value="full_balance">Full Balance</option>
                  <option value="partialy">Partially Paid</option>
                  <option value="fully_paid">Fully Paid</option>
                </select>
              </div>

              <div className="col-span-2 bg-blue-50 p-4 rounded mb-4 border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Payment Amount</span>
                  <input
                    type="number"
                    value={paymentCust}
                    onChange={(e) => setPaymentCust(e.target.value)}
                    className="w-32 px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span className="text-lg font-bold text-gray-800">Change</span>
                  <span className={`text-xl font-bold ${(parseFloat(paymentCust) || 0) - (parseFloat(formData.amount) || 0) < 0 ? "text-red-500" : "text-green-600"
                    }`}>
                    {formatCurrency((parseFloat(paymentCust) || 0) - (parseFloat(formData.amount) || 0))}
                  </span>
                </div>
              </div>

              {/* Notification for Full Payment */}
              {(parseFloat(paymentCust) || 0) >= (parseFloat(formData.amount) || 0) && (parseFloat(formData.amount) || 0) > 0 && (
                <div className="col-span-2 mb-4 p-3 bg-green-100 border border-green-200 rounded text-green-800 text-sm font-medium">
                  This amount will be suffiecient to pay for the utang and will now be store in the archive
                </div>
              )}

              <div className="col-span-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{isEditing ? "Update" : "Create"}</button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}

export default StoreCreditList;
