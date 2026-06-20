import React, { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import type { Product } from "../context/AppContext";
import { Plus, Edit, Trash2, DollarSign, ShoppingCart, Users, Percent, Package, ListFilter, Upload } from "lucide-react";

interface Stats {
  revenue: number;
  ordersCount: number;
  customersCount: number;
  conversionRate: string;
  recentOrders: Array<{
    _id: string;
    createdAt: string;
    totalAmount: number;
    paymentStatus: string;
    shippingStatus: string;
    userId: {
      name: string;
      email: string;
    } | null;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    price: number;
    image: string;
    totalQtySold: number;
    totalRevenueSold: number;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { token, user, backendUrl, showToast } = useApp();

  // Redirect if not logged in or not admin
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const [activeSubTab, setActiveSubTab] = useState<"overview" | "products" | "orders">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog / Modal Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [prodForm, setProdForm] = useState({
    name: "",
    price: "",
    discountPrice: "",
    category: "",
    brand: "",
    imageUrl: "",
    description: "",
    stock: "",
    isNewArrival: false
  });

  const [submittingProduct, setSubmittingProduct] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<Array<{
    type: "existing" | "new";
    url?: string;
    file?: File;
    previewUrl?: string;
  }>>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    addFiles(Array.from(files));
  };

  const addFiles = (files: File[]) => {
    const validFiles: Array<{ type: "new"; file: File; previewUrl: string }> = [];
    let err = "";

    const currentTotal = selectedImages.length;
    if (currentTotal + files.length > 5) {
      showToast("Maximum 5 images allowed.", "error");
      return;
    }

    files.forEach(file => {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        err = "Unsupported file type. Please upload PNG, JPG, JPEG, or WEBP.";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        err = "File too large. Maximum size allowed is 5MB.";
        return;
      }

      validFiles.push({
        type: "new",
        file,
        previewUrl: URL.createObjectURL(file)
      });
    });

    if (err) {
      showToast(err, "error");
    }

    if (validFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...validFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => {
      const copy = [...prev];
      const removed = copy.splice(index, 1)[0];
      if (removed.type === "new" && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return copy;
    });
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${backendUrl}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${backendUrl}/products?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${backendUrl}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchProducts(), fetchOrders()]);
      setLoading(false);
    };
    loadAdminData();
  }, [backendUrl, token]);

  const handleOpenAddProduct = () => {
    setIsEditMode(false);
    setEditingProductId(null);
    setProdForm({
      name: "",
      price: "",
      discountPrice: "",
      category: "Headphones",
      brand: "",
      imageUrl: "",
      description: "",
      stock: "",
      isNewArrival: false
    });
    setSelectedImages([]);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setIsEditMode(true);
    setEditingProductId(p._id);
    setProdForm({
      name: p.name,
      price: p.price.toString(),
      discountPrice: p.discountPrice ? p.discountPrice.toString() : "",
      category: p.category,
      brand: p.brand,
      imageUrl: "",
      description: p.description,
      stock: p.stock.toString(),
      isNewArrival: p.isNewArrival || false
    });
    const existing = (p.images || []).map(url => ({ type: "existing" as const, url }));
    setSelectedImages(existing);
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.price || !prodForm.category || !prodForm.brand || selectedImages.length === 0 || !prodForm.description || !prodForm.stock) {
      showToast("Please fill all required product fields and upload at least one image.", "error");
      return;
    }

    setSubmittingProduct(true);
    try {
      const formData = new FormData();
      formData.append("name", prodForm.name);
      formData.append("price", prodForm.price);
      if (prodForm.discountPrice) {
        formData.append("discountPrice", prodForm.discountPrice);
      }
      formData.append("category", prodForm.category);
      formData.append("brand", prodForm.brand);
      formData.append("description", prodForm.description);
      formData.append("stock", prodForm.stock);
      formData.append("isNewArrival", prodForm.isNewArrival.toString());

      const existingUrls: string[] = [];
      selectedImages.forEach(img => {
        if (img.type === "existing" && img.url) {
          existingUrls.push(img.url);
        } else if (img.type === "new" && img.file) {
          formData.append("images", img.file);
        }
      });
      formData.append("existingImages", JSON.stringify(existingUrls));

      const url = isEditMode
        ? `${backendUrl}/products/${editingProductId}`
        : `${backendUrl}/products`;

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        showToast(isEditMode ? "Product updated successfully!" : "Product created successfully!", "success");
        setShowProductModal(false);
        fetchProducts();
        fetchStats(); // Update stats
      } else {
        const errorData = await res.json();
        showToast(errorData.message || "Failed to save product details.", "error");
      }
    } catch (err) {
      showToast("Error connecting to server.", "error");
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product? This action is irreversible.")) return;

    try {
      const res = await fetch(`${backendUrl}/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Product deleted successfully.", "info");
        fetchProducts();
        fetchStats(); // Update stats
      } else {
        showToast("Failed to delete product.", "error");
      }
    } catch (err) {
      showToast("Error deleting product.", "error");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${backendUrl}/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ shippingStatus: status })
      });
      if (res.ok) {
        showToast("Order status updated successfully.", "success");
        fetchOrders();
        fetchStats(); // Update stats
      } else {
        showToast("Failed to update status.", "error");
      }
    } catch (err) {
      showToast("Error updating order.", "error");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0", color: "var(--text-secondary)" }}>
        Loading administrator dashboard stats...
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "40px" }}>
      {/* Top Banner Navigation bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px",
        marginBottom: "36px"
      }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Admin Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Monitor catalog details, shipping logistics, and platform metrics.</p>
        </div>

        {/* Tab triggers */}
        <div style={{ display: "flex", gap: "10px", backgroundColor: "var(--bg-secondary)", padding: "6px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <button
            onClick={() => setActiveSubTab("overview")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeSubTab === "overview" ? "var(--bg-tertiary)" : "transparent",
              color: activeSubTab === "overview" ? "#fff" : "var(--text-secondary)"
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSubTab("products")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeSubTab === "products" ? "var(--bg-tertiary)" : "transparent",
              color: activeSubTab === "products" ? "#fff" : "var(--text-secondary)"
            }}
          >
            Products
          </button>
          <button
            onClick={() => setActiveSubTab("orders")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeSubTab === "orders" ? "var(--bg-tertiary)" : "transparent",
              color: activeSubTab === "orders" ? "#fff" : "var(--text-secondary)"
            }}
          >
            Orders Logistics
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Overview stats */}
      {activeSubTab === "overview" && stats && (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {/* KPI Cards Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px"
          }}>
            <div className="glass" style={{ padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--accent-success)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                <DollarSign size={24} />
              </div>
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Total Revenue</span>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>${stats.revenue.toFixed(2)}</h3>
              </div>
            </div>

            <div className="glass" style={{ padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                <ShoppingCart size={24} />
              </div>
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Total Orders</span>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{stats.ordersCount}</h3>
              </div>
            </div>

            <div className="glass" style={{ padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "var(--accent-warning)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                <Users size={24} />
              </div>
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Total Customers</span>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{stats.customersCount}</h3>
              </div>
            </div>

            <div className="glass" style={{ padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--accent-danger)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                <Percent size={24} />
              </div>
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Conversion Rate</span>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{stats.conversionRate}%</h3>
              </div>
            </div>
          </div>

          {/* Split lists: Top Products & Recent Orders */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: "40px",
            alignItems: "start"
          }}>
            {/* Top Products */}
            <div className="glass" style={{ padding: "24px", borderRadius: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={18} style={{ color: "var(--accent-primary)" }} /> Top Selling Products
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {stats.topProducts.length === 0 ? (
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No products sold yet.</div>
                ) : (
                  stats.topProducts.map((p, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <img src={p.image} alt={p.name} style={{ width: "40px", height: "40px", borderRadius: "6px", backgroundColor: "#fff", objectFit: "contain", padding: "2px" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{p.totalQtySold} units sold</span>
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>${p.totalRevenueSold.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="glass" style={{ padding: "24px", borderRadius: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <ListFilter size={18} style={{ color: "var(--accent-primary)" }} /> Recent Orders
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                      <th style={{ padding: "10px 6px" }}>User</th>
                      <th style={{ padding: "10px 6px" }}>Total</th>
                      <th style={{ padding: "10px 6px" }}>Shipment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: "20px", color: "var(--text-secondary)", textAlign: "center" }}>No orders placed yet.</td>
                      </tr>
                    ) : (
                      stats.recentOrders.map((ord) => (
                        <tr key={ord._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "12px 6px" }}>
                            <strong style={{ display: "block" }}>{ord.userId ? ord.userId.name : "Guest User"}</strong>
                            <span style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>{ord.userId ? ord.userId.email : ""}</span>
                          </td>
                          <td style={{ padding: "12px 6px", fontWeight: 700 }}>${ord.totalAmount.toFixed(2)}</td>
                          <td style={{ padding: "12px 6px", color: "var(--accent-primary)", fontWeight: 600 }}>{ord.shippingStatus.toUpperCase()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Product Management */}
      {activeSubTab === "products" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Manage Catalog Products</h3>
            <button onClick={handleOpenAddProduct} className="btn btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
              <Plus size={16} /> Add Product
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {products.map((p) => (
              <div key={p._id} className="glass" style={{
                padding: "20px",
                borderRadius: "14px",
                display: "flex",
                gap: "16px",
                alignItems: "center"
              }}>
                <img src={p.images[0]} alt={p.name} style={{ width: "70px", height: "70px", backgroundColor: "#fff", borderRadius: "8px", objectFit: "contain", padding: "4px", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--accent-primary)", fontWeight: 600, textTransform: "uppercase" }}>{p.category}</span>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: "2px 0" }}>{p.name}</h4>
                  <div style={{ display: "flex", gap: "10px", fontSize: "0.85rem" }}>
                    <span style={{ fontWeight: 700 }}>${p.discountPrice || p.price}</span>
                    <span style={{ color: "var(--text-tertiary)" }}>Stock: {p.stock}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button onClick={() => handleOpenEditProduct(p)} className="btn-icon" style={{ width: "32px", height: "32px" }}>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDeleteProduct(p._id)} className="btn-icon" style={{ width: "32px", height: "32px", color: "var(--accent-danger)" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: Orders Logistics */}
      {activeSubTab === "orders" && (
        <div className="glass" style={{ padding: "24px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px" }}>Order Logistics</h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "12px 10px" }}>Order ID</th>
                  <th style={{ padding: "12px 10px" }}>Customer</th>
                  <th style={{ padding: "12px 10px" }}>Date</th>
                  <th style={{ padding: "12px 10px" }}>Payment</th>
                  <th style={{ padding: "12px 10px" }}>Total</th>
                  <th style={{ padding: "12px 10px" }}>Logistics Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "20px", textTransform: "uppercase", textAlign: "center", color: "var(--text-secondary)" }}>No orders placed.</td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "16px 10px", fontFamily: "monospace", fontWeight: 600 }}>{ord._id.substring(0, 10).toUpperCase()}...</td>
                      <td style={{ padding: "16px 10px" }}>
                        <strong style={{ display: "block" }}>{ord.userId ? ord.userId.name : "Guest Customer"}</strong>
                        <span style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>{ord.userId ? ord.userId.email : ""}</span>
                      </td>
                      <td style={{ padding: "16px 10px" }}>{new Date(ord.createdAt).toLocaleDateString("en-IN")}</td>
                      <td style={{ padding: "16px 10px" }}>
                        <span style={{
                          backgroundColor: ord.paymentStatus === "paid" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                          color: ord.paymentStatus === "paid" ? "var(--accent-success)" : "var(--accent-warning)",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontWeight: 600
                        }}>{ord.paymentStatus.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: "16px 10px", fontWeight: 700 }}>${ord.totalAmount.toFixed(2)}</td>
                      <td style={{ padding: "16px 10px" }}>
                        <select
                          value={ord.shippingStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                          className="form-select"
                          style={{
                            width: "160px",
                            height: "32px",
                            padding: "0 8px",
                            fontSize: "0.8rem",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-tertiary)"
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="out-for-delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal Overlay */}
      {showProductModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: "20px"
        }} onClick={() => setShowProductModal(false)}>
          <div className="glass" style={{
            maxWidth: "600px",
            width: "100%",
            borderRadius: "var(--border-radius-lg)",
            padding: "32px",
            maxHeight: "90vh",
            overflowY: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px" }}>
              {isEditMode ? "Modify Product Details" : "Create New Catalog Product"}
            </h3>

            <form onSubmit={handleProductSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="SphereSound Wireless earbuds..."
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="299.99"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Discount Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="249.99"
                    value={prodForm.discountPrice}
                    onChange={(e) => setProdForm({ ...prodForm, discountPrice: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category *</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="Headphones">Headphones</option>
                    <option value="Earbuds">Earbuds</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Speakers">Speakers</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Cameras">Cameras</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="SphereSound"
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Product Images (Max 5) *</label>
                
                {/* Drag & Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragOver ? "var(--accent-primary)" : "var(--border-color)"}`,
                    backgroundColor: isDragOver ? "rgba(59, 130, 246, 0.05)" : "var(--bg-tertiary)",
                    borderRadius: "var(--border-radius)",
                    padding: "24px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    position: "relative"
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept=".jpg,.jpeg,.png,.webp"
                    style={{ display: "none" }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <Upload size={28} style={{ color: isDragOver ? "var(--accent-primary)" : "var(--text-secondary)" }} />
                    <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                      Upload product images or drag and drop here
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                      PNG, JPG, JPEG, WEBP (max 5MB each)
                    </span>
                  </div>
                </div>

                {/* Previews */}
                {selectedImages.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
                    {selectedImages.map((img, idx) => {
                      const src = img.type === "existing" ? img.url : img.previewUrl;
                      return (
                        <div
                          key={idx}
                          style={{
                            position: "relative",
                            width: "64px",
                            height: "64px",
                            borderRadius: "8px",
                            border: "1px solid var(--border-color)",
                            backgroundColor: "#fff",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <img
                            src={src}
                            alt="preview"
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: "2px",
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(239, 68, 68, 0.9)",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              lineHeight: 1,
                              border: "none"
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Product Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="A detailed product spec description..."
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="form-input"
                  style={{ resize: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    className="form-input"
                  />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "var(--text-secondary)", cursor: "pointer", marginTop: "24px" }}>
                  <input
                    type="checkbox"
                    checked={prodForm.isNewArrival}
                    onChange={(e) => setProdForm({ ...prodForm, isNewArrival: e.target.checked })}
                    style={{ width: "16px", height: "16px" }}
                  />
                  New Arrival Banner
                </label>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submittingProduct} className="btn btn-primary" style={{ padding: "0 24px" }}>
                  {submittingProduct ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
