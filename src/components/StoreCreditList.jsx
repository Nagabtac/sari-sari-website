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
    customer_id: "",
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
  if (baseUrl.includes('/api/')) {
    baseUrl = baseUrl.split('/api')[0];
  }
  baseUrl = baseUrl.replace(/\/+$/, '');
  const STORE_CREDIT_API = `${baseUrl}/api/store-credit-list`;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { text: "Home", link: "/", icon: "🏠" },
    { text: "Products", link: "/products", icon: "📦" },
    { text: "Store Credit List", link: "/store-credit-list", icon: "📋" },
    { text: "Logout", link: "/logout", icon: "🚪" },
  ];

  useEffect(() => {
    if (token) {
      fetchStoreCredits();
    }
  }, [token]);

  const fetchStoreCredits = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching store credits from:", STORE_CREDIT_API);
      
      const res = await fetch(STORE_CREDIT_API, {
        headers: getHeaders(token)
      });

      if (!res.ok) {
        console.error("API Error:", res.status, res.statusText);
        if (res.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        throw new Error(`Failed to fetch store credits: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Store credits data received:", data);

      // Handle different response formats
      const paymentsArray = Array.isArray(data)
        ? data
        : (data.payments || data.data || []);

      setPayments(paymentsArray);
    } catch (err) {
      console.error("Error fetching store credits:", err);
      setError(err.message || "Failed to load store credits. Please check if the API server is running.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₱0.00";
    return `₱${parseFloat(amount).toFixed(2)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openEditModal = (payment) => {
    const paymentId = payment.payment_id || payment.paymentId || payment.id;
    const amountDate = payment.amount_date || payment.amountDate || null;
    const payDate = payment.pay_date || payment.payDate || null;
    
    setFormData({
      paymentId: paymentId,
      customer_id: payment.customer_id || payment.customerId || "",
      amount: payment.amount || "",
      balance: payment.balance || "",
      amount_date: amountDate ? new Date(amountDate).toISOString().slice(0, 16) : "",
      pay_date: payDate ? new Date(payDate).toISOString().slice(0, 16) : "",
      method: payment.method || "",
      status: payment.status || "full_balance"
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    // Set current date/time for amount_date when creating new payment
    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16);
    
    setFormData({
      ...initialFormState,
      amount_date: currentDateTime
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const paymentId = formData.paymentId;
    
    if (isEditing && !paymentId) {
      alert("Payment ID is missing. Cannot update.");
      return;
    }

    const API_URL = isEditing 
      ? `${baseUrl}/api/store-credit-list/${paymentId}`
      : `${baseUrl}/api/new`;

    try {
      const requestData = {
        customer_id: formData.customer_id ? (parseInt(formData.customer_id) || formData.customer_id) : null,
        amount: parseFloat(formData.amount) || 0,
        balance: parseFloat(formData.balance) || 0,
        amount_date: formData.amount_date || null,
        pay_date: formData.pay_date || null,
        method: formData.method || "",
        status: formData.status || "full_balance"
      };

      console.log(`${isEditing ? "Updating" : "Creating"} payment:`, requestData);

      const res = await fetch(API_URL, {
        method: isEditing ? "PUT" : "POST",
        headers: getHeaders(token),
        body: JSON.stringify(requestData),
        redirect: 'manual' 
      });

      if (res.type === 'opaqueredirect' || res.status === 302 || res.status === 301) {
        throw new Error("Request was redirected. This usually means the endpoint doesn't exist or authentication failed.");
      }

      const contentType = res.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          alert("Unauthorized. Please log in again.");
          logout();
          navigate("/login");
          return;
        }
        
        let errorMessage = `Failed to ${isEditing ? "update" : "create"} payment: ${res.status} ${res.statusText}`;
        
        if (isJson) {
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (parseErr) {
            console.error("Error parsing error response:", parseErr);
          }
        } else {
          if (res.status === 404) {
            errorMessage = `API endpoint not found. Please check if the backend endpoint exists and supports ${isEditing ? "PUT" : "POST"} method.`;
          }
        }
        
        alert(errorMessage);
        return;
      }

      if (isJson) {
        const result = await res.json();
        console.log(`Payment ${isEditing ? "updated" : "created"} successfully:`, result);
        setIsModalOpen(false);
        fetchStoreCredits(); 
      } else {
        console.log(`Payment ${isEditing ? "updated" : "created"} successfully (non-JSON response)`);
        setIsModalOpen(false);
        fetchStoreCredits();
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      if (error.message.includes("redirected")) {
        alert("The update request was redirected. Please check your backend API configuration.");
      } else if (error.message.includes("Failed to fetch")) {
        alert("Failed to connect to the server. Please check if the backend server is running.");
      } else {
        alert(`Failed to ${isEditing ? "update" : "create"} payment: ${error.message || "Unknown error"}`);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;
    try {
      console.log("Deleting payment with ID:", id);
      
      const DELETE_API = `${baseUrl}/api/store-credit-list/${id}`;
      const res = await fetch(DELETE_API, { 
        method: "DELETE",
        headers: getHeaders(token)
      });
      
      if (res.ok) {
        setPayments(prevPayments => {
          const filtered = prevPayments.filter((payment) => {
            const paymentId = payment.payment_id !== undefined && payment.payment_id !== null
              ? payment.payment_id
              : (payment.paymentId !== undefined && payment.paymentId !== null
                ? payment.paymentId
                : (payment.id !== undefined && payment.id !== null
                  ? payment.id
                  : null));
            return String(paymentId) !== String(id);
          });
          return filtered;
        });
        
        setTimeout(() => fetchStoreCredits(), 100);
      } else if (res.status === 401) {
        alert("Unauthorized. Please log in again.");
        logout();
        navigate("/login");
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || res.statusText || 'Unknown error';
        
        if (errorMessage.includes('DataIntegrityViolationException') || errorMessage.includes('foreign key')) {
           alert("Cannot delete this payment record because it is being used in other records.");
        } else {
           alert(`Failed to delete payment record: ${errorMessage}`);
        }
      }
    } catch (error) { 
      console.error("Error deleting payment:", error);
      alert("Failed to delete payment record. Please check the console for details.");
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
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header
          toggleSidebar={toggleSidebar}
          searchValue=""
          onSearchChange={() => {}}
        />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Store Credit List</h2>
              <p className="text-gray-600 mt-1">View all payment records</p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="text-xl leading-none pb-1">+</span> New Utang
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-4xl mb-4 animate-spin">⏳</div>
              <p className="text-gray-500 text-lg font-medium">Loading store credits...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-500 text-lg font-medium mb-2">Error loading store credits</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={fetchStoreCredits}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : payments.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">
                        Payment ID
                      </th>
                      <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">
                        Customer ID
                      </th>
                      <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">
                        Amount Date
                      </th>
                      <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">
                        Pay Date
                      </th>
                      <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-4 px-6 text-center font-semibold text-xs text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((payment, index) => {
                      const paymentId = payment.payment_id || payment.paymentId || payment.id || index;
                      
                      // UPDATED LOGIC: Checks flat fields AND nested customer object
                      const customerName = 
                        payment.customer_name || 
                        payment.customerName || 
                        (payment.customer && payment.customer.customer_name) ||
                        (payment.customer && payment.customer.customerName) || 
                        "-";
                        
                      const customerId = payment.customer_id || payment.customerId || "-";
                      const amount = payment.amount || 0;
                      const balance = payment.balance || 0;
                      const amountDate = payment.amount_date || payment.amountDate || null;
                      const payDate = payment.pay_date || payment.payDate || null;
                      const method = payment.method || "-";
                      const status = payment.status || "-";

                      return (
                        <tr
                          key={paymentId}
                          className="hover:bg-blue-50 transition-colors duration-150"
                        >
                          <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                            {paymentId}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700">{customerId}</td>
                          <td className="py-4 px-6 text-sm text-gray-700">
                            {formatCurrency(amount)}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700">
                            {formatCurrency(balance)}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700">
                            {formatDate(amountDate)}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700">
                            {formatDate(payDate)}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700">{method}</td>
                          <td className="py-4 px-6 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                status === "fully_paid"
                                  ? "bg-green-100 text-green-800"
                                  : status === "partialy"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center space-x-3">
                              <button
                                onClick={() => openEditModal(payment)}
                                className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                              >
                                Edit
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => {
                                  const actualPaymentId = payment.payment_id !== undefined && payment.payment_id !== null
                                    ? payment.payment_id
                                    : (payment.paymentId !== undefined && payment.paymentId !== null
                                      ? payment.paymentId
                                      : (payment.id !== undefined && payment.id !== null
                                        ? payment.id
                                        : null));
                                  if (actualPaymentId === null || actualPaymentId === undefined) {
                                    alert("Cannot delete: Payment ID not found");
                                    return;
                                  }
                                  handleDelete(actualPaymentId);
                                }}
                                className="text-red-600 hover:text-red-900 font-medium text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-lg font-medium">No payment records found.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal Logic */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{isEditing ? "Edit Payment Record" : "New Utang"}</h3>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                <input
                  name="customer_id"
                  type="text"
                  placeholder="Enter customer ID"
                  value={formData.customer_id || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₱)</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Balance (₱)</label>
                <input
                  name="balance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.balance || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Date</label>
                <input
                  name="amount_date"
                  type="datetime-local"
                  value={formData.amount_date || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Date</label>
                <input
                  name="pay_date"
                  type="datetime-local"
                  value={formData.pay_date || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <input
                  name="method"
                  type="text"
                  placeholder="Enter payment method"
                  value={formData.method || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status || "full_balance"}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="full_balance">Full Balance</option>
                  <option value="partialy">Partially Paid</option>
                  <option value="fully_paid">Fully Paid</option>
                </select>
              </div>
              <div className="col-span-2 flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {isEditing ? "Update" : "Create"}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreCreditList;