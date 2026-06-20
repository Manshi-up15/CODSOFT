import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { CheckCircle2, Mail } from "lucide-react";

interface OrderDetails {
  _id: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingStatus: string;
  totalAmount: number;
  createdAt: string;
  products: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { backendUrl, token, showToast } = useApp();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${backendUrl}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (err) {
        showToast("Error loading order confirmation.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, backendUrl, token]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0", color: "var(--text-secondary)" }}>
        Fetching order confirmation invoice...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
        <h2>Order Information Not Found</h2>
        <p style={{ margin: "16px 0", color: "var(--text-secondary)" }}>
          We could not locate this order invoice.
        </p>
        <Link to="/" className="btn btn-primary">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "60px", maxWidth: "800px" }}>
      {/* Top Banner Success Confirmation */}
      <div className="glass" style={{
        padding: "48px 24px",
        textAlign: "center",
        borderRadius: "var(--border-radius-lg)",
        marginBottom: "32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px"
      }}>
        <div style={{ color: "var(--accent-success)" }}>
          <CheckCircle2 size={64} fill="rgba(16, 185, 129, 0.1)" />
        </div>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Order Confirmed!</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "0.95rem" }}>
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "var(--bg-tertiary)",
          padding: "8px 16px",
          borderRadius: "20px",
          fontSize: "0.85rem",
          color: "var(--text-secondary)"
        }}>
          <Mail size={14} /> Confirmation email sent to your inbox.
        </div>
      </div>

      {/* Invoice Details Layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: "32px",
        alignItems: "start"
      }}>
        {/* Left Card: Order Items and Shipping */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Items */}
          <div className="glass" style={{ padding: "24px", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              Ordered Items
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {order.products.map((item, idx) => (
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
          </div>

          {/* Shipping Details */}
          <div className="glass" style={{ padding: "24px", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              Shipping Details
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <strong>{order.shippingAddress.name}</strong> <br />
              {order.shippingAddress.addressLine1} <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode} <br />
              Country: {order.shippingAddress.country} <br />
              Phone: {order.shippingAddress.phone}
            </p>
          </div>
        </div>

        {/* Right Card: Summary Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* summary invoice metadata */}
          <div className="glass" style={{ padding: "24px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              Order Overview
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Order ID</span>
                <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{order._id.substring(0, 10).toUpperCase()}...</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Date Placed</span>
                <span>{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Payment Option</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Payment State</span>
                <span style={{
                  color: order.paymentStatus === "paid" ? "var(--accent-success)" : "var(--accent-warning)",
                  fontWeight: 600
                }}>{order.paymentStatus.toUpperCase()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Shipment Status</span>
                <span style={{
                  color: "var(--accent-primary)",
                  fontWeight: 600
                }}>{order.shippingStatus.toUpperCase()}</span>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                fontSize: "1.1rem",
                borderTop: "1px solid var(--border-color)",
                paddingTop: "14px",
                marginTop: "4px"
              }}>
                <span>Total Cost</span>
                <span className="gradient-text">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link to="/profile" className="btn btn-primary" style={{ width: "100%" }}>
              Track My Order
            </Link>
            <Link to="/shop" className="btn btn-secondary" style={{ width: "100%" }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
