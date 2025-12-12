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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // Calculator State
  const [products, setProducts] = useState([]);
  const [calcItems, setCalcItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [calcQty, setCalcQty] = useState(1);

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
    { text: "Store Credit List", link: "/store-credit-list", icon: "📋" },
    { text: "Archive", link: "/archive", icon: "🗄️" },
    { text: "Logout", link: "/logout", icon: "🚪" },
  ];

  useEffect(() => {
    if (token) {
      fetchStoreCredits();
      fetchProducts();
    }
  }, [token]);

  const fetchStoreCredits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(STORE_CREDIT_API, { headers: getHeaders(token) });
      if (!res.ok) throw new Error("Failed to fetch store credits");
      const data = await res.json();

      const paymentsArray = Array.isArray(data) ? data : data.payments || [];
      setPayments(paymentsArray);
    } catch (err) {
      setError(err.message);
      setPayments([]);
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
    setFormData({ ...formData, [name]: value });
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
      status: payment.status || "FULL_BALANCE"
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    const now = new Date().toISOString().slice(0, 16);
    setFormData({ ...initialFormState, amount_date: now });
    setIsEditing(false);
    setCalcItems([]); // Reset calculator
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

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

  // Calculator Functions
  const handleAddCalcItem = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.productId === parseInt(selectedProductId));
    if (!product) return;

    const newItem = {
      id: Date.now(),
      name: `${product.productName} (${product.size || ''})`,
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
            <button onClick={openAddModal} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow">
              + New Utang
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left">Payment ID</th>
                  <th className="py-4 px-6 text-left">Customer Name</th>
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
                    <td className="py-4 px-6">{p.customerName || "-"}</td>
                    <td className="py-4 px-6">{formatCurrency(p.amount)}</td>
                    <td className="py-4 px-6">{formatCurrency(p.balance)}</td>
                    {/* <td className="py-4 px-6">{formatDate(p.amount_date)}</td> Removed */}
                    <td className="py-4 px-6">{formatDate(p.payDate)}</td>
                    <td className="py-4 px-6">{p.method}</td>
                    <td className="py-4 px-6">{p.status}</td>
                    <td className="py-4 px-6 text-center">
                      <button className="text-indigo-600" onClick={() => openEditModal(p)}>Edit</button>
                      <span className="mx-2">|</span>
                      <button className="text-red-600" onClick={() => handleDelete(p.paymentId)}>Delete</button>
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
                  <div className="flex gap-2 mb-3">
                    <select
                      className="border p-2 rounded flex-1"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                      <option value="">Select Product...</option>
                      {products.map(p => (
                        <option key={p.productId} value={p.productId}>
                          {p.productName} ({p.size}) - ₱{p.sellingPrice}
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

              <div>
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
