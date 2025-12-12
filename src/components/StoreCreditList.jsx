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

  // Ensure API_URL doesn't already include /api path
  let baseUrl = API_URL;
  if (baseUrl.includes('/api/')) baseUrl = baseUrl.split('/api')[0];
  baseUrl = baseUrl.replace(/\/+$/, '');
  const STORE_CREDIT_API = `${baseUrl}/api/store-credit-list`;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleLogout = () => { logout(); navigate("/login"); };

  const menuItems = [
    { text: "Home", link: "/", icon: "🏠" },
    { text: "Products", link: "/products", icon: "📦" },
    { text: "Store Credit List", link: "/store-credit-list", icon: "📋" },
    { text: "Logout", link: "/logout", icon: "🚪" },
  ];

  useEffect(() => {
    if (token) fetchStoreCredits();
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
      amount_date: "", // Removed from display but kept in state if needed
      pay_date: payment.payDate || "",
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
      amount_date: formData.amount_date,
      pay_date: formData.pay_date,
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

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <Sidebar menuItems={menuItems} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} onLogout={handleLogout} />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
        <Header toggleSidebar={toggleSidebar} searchValue="" onSearchChange={() => { }} />

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
                <label className="block mb-1">Amount Date</label>
                <input type="datetime-local" name="amount_date" value={formData.amount_date} onChange={handleInputChange} className="border p-2 rounded w-full" required />
              </div>

              <div>
                <label className="block mb-1">Pay Date</label>
                <input type="datetime-local" name="pay_date" value={formData.pay_date} onChange={handleInputChange} className="border p-2 rounded w-full" />
              </div>

              <div>
                <label className="block mb-1">Method</label>
                <input type="text" name="method" value={formData.method} onChange={handleInputChange} className="border p-2 rounded w-full" required />
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
