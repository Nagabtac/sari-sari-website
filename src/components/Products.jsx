import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/constants";

// API Endpoints:
// GET    http://localhost:1000/api/products - Get all products
// GET    http://localhost:1000/api/products/{id} - Get product by ID
// POST   http://localhost:1000/api/products - Create new product
// PUT    http://localhost:1000/api/products/{id} - Update product
// DELETE http://localhost:1000/api/products/{id} - Delete product

// Ensure API_URL doesn't already include /api path
// Remove any existing /api/cars, /api, or trailing paths
let baseUrl = API_URL;
if (baseUrl.includes('/api/')) {
  // Remove everything from /api onwards
  baseUrl = baseUrl.split('/api')[0];
}
// Remove trailing slashes
baseUrl = baseUrl.replace(/\/+$/, '');
const PRODUCTS_API = `${baseUrl}/api/products`;

// Helper function to get headers with authentication
const getHeaders = (token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

function Products() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { logout, token } = useAuth();

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initialFormState = {
    productId: null, productName: "", sellingPrice: "", basePrice: "", quantityInStock: 0, description: "", unit: ""
  };
  const [formData, setFormData] = useState(initialFormState);

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

  // --- API Effects & Handlers ---
  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setProducts(allProducts);
      return;
    }

    const filtered = allProducts.filter((product) => {
      const searchLower = searchTerm.toLowerCase();

      // Get product fields (handle both camelCase and snake_case)
      const productName = (product.productName || product.product_name || product.name || "").toLowerCase();
      const sellingPrice = String(product.sellingPrice || product.selling_price || 0);
      const basePrice = String(product.basePrice || product.base_price || 0);
      const quantity = String(product.quantityInStock || product.quantity_in_stock || product.quantity || product.stock || 0);
      const description = (product.description || "").toLowerCase();

      // Search across all fields
      return (
        productName.includes(searchLower) ||
        sellingPrice.includes(searchTerm) ||
        basePrice.includes(searchTerm) ||
        quantity.includes(searchTerm) ||
        description.includes(searchLower)
      );
    });

    setProducts(filtered);
  }, [searchTerm, allProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching products from:", PRODUCTS_API);
      const res = await fetch(PRODUCTS_API, {
        headers: getHeaders(token)
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      // Handle different response formats
      const productsArray = Array.isArray(data)
        ? data
        : (data.products || data.data || []);

      setAllProducts(productsArray); // Store all products
      setProducts(productsArray); // Set initial filtered products

      if (productsArray.length > 0) {
        console.log("First product data:", productsArray[0]);
        console.log("Created At check:", productsArray[0].createdAt, productsArray[0].created_at);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Removed openAddModal as adding is done in Inventory now

  const openEditModal = (product) => {
    setFormData(product);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${PRODUCTS_API}/${id}`, {
        method: "DELETE",
        headers: getHeaders(token)
      });

      if (res.ok) {
        setProducts(prevProducts => {
          return prevProducts.filter(product => {
            const productId = product.productId || product.product_id || product.id;
            return String(productId) !== String(id);
          });
        });
        setTimeout(() => fetchProducts(), 100);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to delete product: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    const productId = formData.productId || formData.product_id;
    const url = isEditing ? `${PRODUCTS_API}/${productId}` : PRODUCTS_API;

    try {
      const requestData = {
        productName: formData.productName,
        sellingPrice: parseFloat(formData.sellingPrice),
        basePrice: parseFloat(formData.basePrice),
        quantityInStock: parseInt(formData.quantityInStock),
        description: formData.description,
        unit: formData.unit
      };

      if (isEditing && productId) {
        requestData.productId = productId;
      }

      const res = await fetch(url, {
        method: method,
        headers: getHeaders(token),
        body: JSON.stringify(requestData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to save product: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
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
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 overflow-auto">
          {/* Title Section */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Products</h2>
              <p className="text-gray-600 mt-1">Manage your product inventory</p>
            </div>
            <div className="flex gap-4 items-center">
              {/* Local Search Bar */}
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

              <button
                onClick={() => navigate("/archive")}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <span className="text-xl leading-none pb-1">🗄️</span> Archive
              </button>
            </div>
          </div>

          {/* Table Section */}
          {loading ? (
            <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-4xl mb-4 animate-spin">⏳</div>
              <p className="text-gray-500 text-lg font-medium">Loading products...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-500 text-lg font-medium mb-2">Error loading products</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : products.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Selling Price</th>
                    <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Base Price</th>
                    <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="py-4 px-6 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="py-4 px-6 text-center font-semibold text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product, index) => {
                    // Display sequential ID (1, 2, 3...) that updates when products are deleted
                    const displayId = index + 1;

                    // Get actual database ID for operations (delete, edit)
                    const actualProductId = product.productId !== undefined && product.productId !== null
                      ? product.productId
                      : (product.product_id !== undefined && product.product_id !== null
                        ? product.product_id
                        : (product.id !== undefined && product.id !== null
                          ? product.id
                          : null));

                    const productName = product.productName || product.product_name || product.name || "-";
                    const quantity = product.quantityInStock !== undefined
                      ? product.quantityInStock
                      : (product.quantity_in_stock !== undefined
                        ? product.quantity_in_stock
                        : (product.quantity || product.stock || 0));
                    const sellingPrice = product.sellingPrice || product.selling_price || 0;
                    const basePrice = product.basePrice || product.base_price || 0;
                    const description = product.description || "-";
                    const createdAt = product.createdAt || product.created_at || null;
                    const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : "-";

                    return (
                      <tr key={actualProductId || index} className="hover:bg-blue-50 transition-colors duration-150">
                        <td className="py-4 px-6 text-sm text-gray-900 font-medium">{displayId}</td>
                        <td className="py-4 px-6 text-sm text-gray-700 font-medium">{productName}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{product.unit || "-"}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">₱{parseFloat(sellingPrice || 0).toFixed(2)}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">₱{parseFloat(basePrice || 0).toFixed(2)}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{quantity}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{formattedDate}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{description}</td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center space-x-3">
                            <button onClick={() => openEditModal(product)} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">Edit</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => {
                              // Use the actualProductId we already extracted above
                              console.log("Delete clicked - actualId:", actualProductId, "product:", product);
                              if (actualProductId === null || actualProductId === undefined) {
                                alert("Cannot delete: Product ID not found");
                                return;
                              }
                              handleDelete(actualProductId);
                            }} className="text-red-600 hover:text-red-900 font-medium text-sm">Archive</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg font-medium">No products found in inventory.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal Logic */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4">{isEditing ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input name="productName" placeholder="Enter product name" value={formData.productName || ""} onChange={handleInputChange} className="border p-2 rounded w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₱)</label>
                <input name="sellingPrice" type="number" step="0.01" placeholder="0.00" value={formData.sellingPrice || ""} onChange={handleInputChange} className="border p-2 rounded w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₱)</label>
                <input name="basePrice" type="number" step="0.01" placeholder="0.00" value={formData.basePrice || ""} onChange={handleInputChange} className="border p-2 rounded w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity in Stock</label>
                <input name="quantityInStock" type="number" placeholder="0" value={formData.quantityInStock || 0} onChange={handleInputChange} className="border p-2 rounded w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input name="unit" placeholder="Unit" value={formData.unit || ""} onChange={handleInputChange} className="border p-2 rounded w-full" required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" placeholder="Enter product description" value={formData.description || ""} onChange={handleInputChange} className="border p-2 rounded w-full" rows="3" />
              </div>
              <div className="col-span-2 flex justify-end space-x-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;

