import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import type { Address } from "../context/AppContext";
import { CreditCard, Truck, ShieldCheck } from "lucide-react";

const Checkout: React.FC = () => {
  const { cart, token, user, backendUrl, showToast, fetchCart } = useApp();
  const navigate = useNavigate();

  // Redirect if cart is empty or not logged in
  if (!token) {
    return <Navigate to="/login?redirect=checkout" replace />;
  }
  if (cart.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  // Steps state: 1 = Shipping, 2 = Payment & Submit
  const [step, setStep] = useState(1);

  // Form states
  const [address, setAddress] = useState<Address>({
    name: user?.name || "",
    phone: user?.phone || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India"
  });

  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD, Card, UPI
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address templates check
  const handleSelectSavedAddress = (saved: Address) => {
    setAddress({
      name: saved.name,
      phone: saved.phone,
      addressLine1: saved.addressLine1,
      addressLine2: saved.addressLine2 || "",
      city: saved.city,
      state: saved.state,
      zipCode: saved.zipCode,
      country: saved.country
    });
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.zipCode) {
      showToast("Please fill all required shipping fields.", "error");
      return;
    }
    setStep(2);
  };

  const handleOrderSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Structure order items matching backend expectations
      const orderItems = cart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity
      }));

      const orderPayload = {
        orderItems,
        shippingAddress: address,
        paymentMethod,
        stripeTokenId: paymentMethod === "Card" ? "tok_visa" : undefined // Mock Stripe charge token
      };

      const response = await fetch(`${backendUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const orderData = await response.json();
        showToast("Order placed successfully!", "success");
        // Force refresh cart details
        await fetchCart();
        navigate(`/order-success/${orderData._id}`);
      } else {
        const errData = await response.json();
        showToast(errData.message || "Failed to submit order.", "error");
      }
    } catch (err) {
      showToast("Failed to connect to server.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "40px" }}>
      {/* Checkout Progress Tracker */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        marginBottom: "40px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "0.85rem"
          }}>1</span>
          <span style={{ fontWeight: 600, color: step >= 1 ? "#fff" : "var(--text-tertiary)" }}>Shipping Address</span>
        </div>
        <div style={{ width: "60px", height: "1px", backgroundColor: step === 2 ? "var(--accent-primary)" : "var(--border-color)" }}></div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: step === 2 ? "var(--accent-primary)" : "var(--bg-tertiary)",
            border: step === 2 ? "none" : "1px solid var(--border-color)",
            color: step === 2 ? "#fff" : "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "0.85rem"
          }}>2</span>
          <span style={{ fontWeight: 600, color: step === 2 ? "#fff" : "var(--text-tertiary)" }}>Payment & Confirm</span>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: "40px",
        alignItems: "start"
      }}>
        {/* Step 1: Shipping Info */}
        {step === 1 && (
          <main className="glass" style={{ padding: "32px", borderRadius: "16px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Truck size={22} style={{ color: "var(--accent-primary)" }} /> Shipping Information
            </h2>

            {/* Saved Addresses snippet */}
            {user && user.addresses.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <h4 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "10px" }}>Select Saved Address:</h4>
                <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px" }}>
                  {user.addresses.map((addr) => (
                    <button
                      key={addr._id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "var(--bg-tertiary)",
                        textAlign: "left",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        flexShrink: 0
                      }}
                      className="btn-secondary"
                    >
                      <strong style={{ display: "block", marginBottom: "4px" }}>{addr.name}</strong>
                      <span>{addr.addressLine1}, {addr.city}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleNextStep} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  placeholder="Street address, P.O. box, company name"
                  value={address.addressLine1}
                  onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  value={address.addressLine2}
                  onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Zip / Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Country *</label>
                  <input
                    type="text"
                    required
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "48px", marginTop: "12px" }}>
                Proceed to Payment
              </button>
            </form>
          </main>
        )}

        {/* Step 2: Payment Details */}
        {step === 2 && (
          <main className="glass" style={{ padding: "32px", borderRadius: "16px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
              <CreditCard size={22} style={{ color: "var(--accent-primary)" }} /> Payment Methods
            </h2>

            {/* Select Method */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                border: `1.5px solid ${paymentMethod === "COD" ? "var(--accent-primary)" : "var(--border-color)"}`,
                borderRadius: "12px",
                backgroundColor: paymentMethod === "COD" ? "rgba(59, 130, 246, 0.05)" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  style={{ width: "18px", height: "18px" }}
                />
                <div>
                  <strong style={{ display: "block" }}>Cash on Delivery (COD)</strong>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Pay with cash upon package receipt.</span>
                </div>
              </label>

              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                border: `1.5px solid ${paymentMethod === "Card" ? "var(--accent-primary)" : "var(--border-color)"}`,
                borderRadius: "12px",
                backgroundColor: paymentMethod === "Card" ? "rgba(59, 130, 246, 0.05)" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "Card"}
                  onChange={() => setPaymentMethod("Card")}
                  style={{ width: "18px", height: "18px" }}
                />
                <div>
                  <strong style={{ display: "block" }}>Credit / Debit Card</strong>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Secure mock payments powered by Stripe gateway.</span>
                </div>
              </label>
            </div>

            {/* Card details entry if Card selected */}
            {paymentMethod === "Card" && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                border: "1px solid var(--border-color)",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "28px"
              }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Summary */}
            <div className="glass" style={{ padding: "16px 20px", borderRadius: "12px", marginBottom: "28px" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px" }}>Shipping To:</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {address.name} <br />
                {address.addressLine1}, {address.addressLine2 ? `${address.addressLine2}, ` : ""}{address.city}, {address.state} - {address.zipCode} <br />
                Ph: {address.phone}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "16px" }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1, height: "48px" }}>
                Back to Address
              </button>
              <button
                onClick={handleOrderSubmit}
                disabled={isSubmitting || (paymentMethod === "Card" && (!cardNumber || !cardExpiry || !cardCvv))}
                className="btn btn-primary"
                style={{ flex: 1.5, height: "48px" }}
              >
                {isSubmitting ? "Processing Order..." : "Confirm & Place Order"}
              </button>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              color: "var(--text-tertiary)",
              fontSize: "0.75rem",
              marginTop: "20px"
            }}>
              <ShieldCheck size={14} /> PCI-DSS Compliant 256-bit Secure Gateway
            </div>
          </main>
        )}

        {/* Right Side: Order Summary Checklist */}
        <aside className="glass" style={{
          padding: "24px",
          borderRadius: "var(--border-radius)",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
            Items in Order
          </h3>

          {/* Items listing */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "240px", overflowY: "auto", paddingRight: "4px" }}>
            {cart.items.map((item) => {
              const product = item.productId;
              if (!product) return null;
              const price = product.discountPrice || product.price;

              return (
                <div key={product._id} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "6px",
                      backgroundColor: "#fff",
                      objectFit: "contain",
                      padding: "2px"
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Qty: {item.quantity}</span>
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    ${(price * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing breakdowns */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            borderTop: "1px solid var(--border-color)",
            paddingTop: "16px",
            fontSize: "0.85rem"
          }}>
            <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Tax (18%)</span>
              <span>${cart.tax.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
              <span>{cart.shipping === 0 ? "FREE" : `$${cart.shipping.toFixed(2)}`}</span>
            </div>
            <div style={{
              display: "flex",
              justifyItems: "center",
              justifyContent: "space-between",
              fontWeight: 700,
              fontSize: "1.05rem",
              borderTop: "1px solid var(--border-color)",
              paddingTop: "14px",
              marginTop: "6px"
            }}>
              <span>Final Total</span>
              <span className="gradient-text">${cart.total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
