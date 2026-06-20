import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import type { Address } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { ShoppingBag, Heart, MapPin, Plus, Trash2, Calendar, CreditCard, ChevronRight } from "lucide-react";

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingStatus: string;
  products: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}

const Profile: React.FC = () => {
  const { token, user, wishlist, backendUrl, showToast, updateUserAddresses } = useApp();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "addresses">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, "_id">>({
    name: user?.name || "",
    phone: user?.phone || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India"
  });
  const [submittingAddress, setSubmittingAddress] = useState(false);

  // Modal detailed order view
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const response = await fetch(`${backendUrl}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          setOrders(await response.json());
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [backendUrl, token]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      showToast("Please fill in all address fields.", "error");
      return;
    }

    setSubmittingAddress(true);
    try {
      const response = await fetch(`${backendUrl}/auth/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });

      if (response.ok) {
        const updatedAddresses = await response.json();
        updateUserAddresses(updatedAddresses);
        showToast("Address added successfully!", "success");
        setShowAddressForm(false);
        setNewAddress({
          name: user?.name || "",
          phone: user?.phone || "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India"
        });
      } else {
        showToast("Failed to add address.", "error");
      }
    } catch (err) {
      showToast("Network error.", "error");
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`${backendUrl}/auth/addresses/${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const updatedAddresses = await response.json();
        updateUserAddresses(updatedAddresses);
        showToast("Address deleted.", "success");
      } else {
        showToast("Failed to delete address.", "error");
      }
    } catch (err) {
      showToast("Error deleting address.", "error");
    }
  };

  return (
    <div className="container" style={{ paddingTop: "40px" }}>
      {/* Profile Welcome Info */}
      <div className="glass" style={{
        padding: "32px",
        borderRadius: "var(--border-radius-lg)",
        marginBottom: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            color: "var(--accent-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontWeight: "bold"
          }}>
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{user?.name}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{user?.email} &middot; {user?.phone || "No phone added"}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <span style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid var(--border-color)",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: 600
          }}>
            Role: <span style={{ color: "var(--accent-primary)" }}>{user?.role.toUpperCase()}</span>
          </span>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        gap: "40px",
        alignItems: "start"
      }}>
        {/* Navigation Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("orders")}
            style={{
              padding: "14px 18px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              backgroundColor: activeTab === "orders" ? "rgba(59, 130, 246, 0.1)" : "transparent",
              border: activeTab === "orders" ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid transparent",
              color: activeTab === "orders" ? "var(--accent-primary)" : "var(--text-secondary)"
            }}
          >
            <ShoppingBag size={18} /> Order History
          </button>

          <button
            onClick={() => setActiveTab("wishlist")}
            style={{
              padding: "14px 18px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              backgroundColor: activeTab === "wishlist" ? "rgba(59, 130, 246, 0.1)" : "transparent",
              border: activeTab === "wishlist" ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid transparent",
              color: activeTab === "wishlist" ? "var(--accent-primary)" : "var(--text-secondary)"
            }}
          >
            <Heart size={18} /> Wishlist
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            style={{
              padding: "14px 18px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              backgroundColor: activeTab === "addresses" ? "rgba(59, 130, 246, 0.1)" : "transparent",
              border: activeTab === "addresses" ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid transparent",
              color: activeTab === "addresses" ? "var(--accent-primary)" : "var(--text-secondary)"
            }}
          >
            <MapPin size={18} /> Manage Addresses
          </button>
        </aside>

        {/* Content Tabs Area */}
        <main>
          {/* TAB 1: Order History */}
          {activeTab === "orders" && (
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "20px" }}>Your Orders</h2>

              {loadingOrders ? (
                <div style={{ color: "var(--text-secondary)" }}>Loading order history...</div>
              ) : orders.length === 0 ? (
                <div className="glass" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)", borderRadius: "12px" }}>
                  <p style={{ marginBottom: "16px" }}>You haven't placed any orders yet.</p>
                  <Link to="/shop" className="btn btn-primary" style={{ padding: "8px 16px" }}>Shop Now</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="glass"
                      style={{
                        padding: "20px",
                        borderRadius: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "16px"
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", fontWeight: 500 }}>ID:</span>
                          <span style={{ fontSize: "0.85rem", fontWeight: "bold", fontFamily: "monospace" }}>{ord._id.substring(0, 10).toUpperCase()}...</span>
                        </div>
                        <div style={{ display: "flex", gap: "16px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={14} /> {new Date(ord.createdAt).toLocaleDateString("en-IN")}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><CreditCard size={14} /> {ord.paymentMethod}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                          <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>${ord.totalAmount.toFixed(2)}</span>
                          <span style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: ord.shippingStatus === "delivered" ? "var(--accent-success)" : "var(--accent-primary)"
                          }}>
                            {ord.shippingStatus.toUpperCase()}
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="btn-icon"
                          style={{ width: "36px", height: "36px" }}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Wishlist */}
          {activeTab === "wishlist" && (
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "20px" }}>Wishlist Products</h2>

              {wishlist.length === 0 ? (
                <div className="glass" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)", borderRadius: "12px" }}>
                  Your wishlist is empty. Save products for later while browsing catalog.
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "24px"
                }}>
                  {wishlist.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Manage Addresses */}
          {activeTab === "addresses" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>My Shipping Addresses</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="btn btn-primary"
                  style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                >
                  <Plus size={16} /> Add Address
                </button>
              </div>

              {/* Add address Form toggle */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="glass" style={{
                  padding: "24px",
                  borderRadius: "12px",
                  marginBottom: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>New Shipping Address</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Recipient Name</label>
                      <input
                        type="text"
                        required
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Address Line 1</label>
                    <input
                      type="text"
                      required
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Zip Code</label>
                      <input
                        type="text"
                        required
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={submittingAddress} className="btn btn-primary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
                      {submittingAddress ? "Saving..." : "Save Address"}
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses List display */}
              {user?.addresses.length === 0 ? (
                <div className="glass" style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", borderRadius: "12px" }}>
                  No saved addresses. Add a new shipping address for faster checkouts.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {user?.addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="glass"
                      style={{
                        padding: "20px",
                        borderRadius: "12px",
                        position: "relative"
                      }}
                    >
                      <h4 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "8px" }}>{addr.name}</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                        {addr.addressLine1} <br />
                        {addr.addressLine2 ? `${addr.addressLine2}, ` : ""}{addr.city}, {addr.state} - {addr.zipCode} <br />
                        Ph: {addr.phone}
                      </p>
                      <button
                        onClick={() => handleDeleteAddress(addr._id!)}
                        style={{
                          position: "absolute",
                          bottom: "20px",
                          right: "20px",
                          color: "var(--text-tertiary)",
                          cursor: "pointer"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-danger)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Detailed Order dialog Modal overlay */}
      {selectedOrder && (
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
        }} onClick={() => setSelectedOrder(null)}>
          <div className="glass" style={{
            maxWidth: "600px",
            width: "100%",
            borderRadius: "var(--border-radius-lg)",
            padding: "32px",
            maxHeight: "90vh",
            overflowY: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px" }}>Order Detail Summary</h3>

            {/* details listings */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              {selectedOrder.products.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "6px",
                      backgroundColor: "#fff",
                      objectFit: "contain",
                      padding: "2px"
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Qty: {item.quantity} &middot; ${item.price.toFixed(2)}</span>
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              borderTop: "1px solid var(--border-color)",
              paddingTop: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: "0.85rem",
              color: "var(--text-secondary)"
            }}>
              <div><strong style={{ color: "#fff" }}>Order ID:</strong> {selectedOrder._id.toUpperCase()}</div>
              <div><strong style={{ color: "#fff" }}>Shipping Status:</strong> <span style={{ color: "var(--accent-primary)" }}>{selectedOrder.shippingStatus.toUpperCase()}</span></div>
              <div><strong style={{ color: "#fff" }}>Payment Status:</strong> <span style={{ color: selectedOrder.paymentStatus === "paid" ? "var(--accent-success)" : "var(--accent-warning)" }}>{selectedOrder.paymentStatus.toUpperCase()}</span></div>
              <div><strong style={{ color: "#fff" }}>Total Order Amount:</strong> <span style={{ fontSize: "1rem", color: "#fff", fontWeight: 700 }}>${selectedOrder.totalAmount.toFixed(2)}</span></div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="btn btn-primary"
              style={{ width: "100%", height: "40px", marginTop: "24px" }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
