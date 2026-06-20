import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";

const Cart: React.FC = () => {
  const { cart, updateCartQty, removeFromCart, token } = useApp();
  const navigate = useNavigate();

  const handleQtyChange = (productId: string, currentQty: number, change: number, stock: number) => {
    const nextQty = currentQty + change;
    if (nextQty >= 1 && nextQty <= stock) {
      updateCartQty(productId, nextQty);
    }
  };

  const handleCheckout = () => {
    if (token) {
      navigate("/checkout");
    } else {
      // Direct user to login, and redirect back to checkout
      navigate("/login?redirect=checkout");
    }
  };

  const isCartEmpty = cart.items.length === 0;

  return (
    <div className="container" style={{ paddingTop: "40px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "32px" }}>
        Shopping Cart
      </h1>

      {isCartEmpty ? (
        <div className="glass" style={{
          padding: "60px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          borderRadius: "var(--border-radius-lg)"
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            color: "var(--accent-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <ShoppingBag size={36} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>Your Cart is Empty</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              Looks like you haven't added any products to your cart yet.
            </p>
          </div>
          <Link to="/shop" className="btn btn-primary" style={{ padding: "12px 28px" }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: "40px",
          alignItems: "start"
        }}>
          {/* Cart Items List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {cart.items.map((item) => {
              const product = item.productId;
              if (!product) return null;

              const price = product.discountPrice || product.price;

              return (
                <div
                  key={product._id}
                  className="glass"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "24px",
                    padding: "20px",
                    borderRadius: "16px"
                  }}
                >
                  {/* Product Image */}
                  <div style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  </div>

                  {/* Title & Brand */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase" }}>
                      {product.brand}
                    </span>
                    <Link to={`/product/${product._id}`} style={{ display: "block" }}>
                      <h3 style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {product.name}
                      </h3>
                    </Link>
                    <span style={{ fontSize: "0.85rem", color: "var(--accent-primary)", fontWeight: 600 }}>
                      ${price.toFixed(2)} each
                    </span>
                  </div>

                  {/* Qty Selector */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    height: "36px"
                  }}>
                    <button
                      onClick={() => handleQtyChange(product._id, item.quantity, -1, product.stock)}
                      style={{ width: "32px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}
                      className="btn-secondary"
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ width: "32px", textAlign: "center", fontWeight: "bold", fontSize: "0.9rem" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(product._id, item.quantity, 1, product.stock)}
                      style={{ width: "32px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}
                      className="btn-secondary"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div style={{ width: "80px", textAlign: "right", fontWeight: 700, fontSize: "0.95rem" }}>
                    ${(price * item.quantity).toFixed(2)}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="btn-icon"
                    style={{ width: "36px", height: "36px", color: "var(--text-tertiary)" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
              <Link to="/shop" className="btn btn-secondary">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          <aside className="glass" style={{
            padding: "24px",
            borderRadius: "var(--border-radius)",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
              Order Summary
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.95rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Estimated Tax (18%)</span>
                <span>${cart.tax.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                <span>{cart.shipping === 0 ? "FREE" : `$${cart.shipping.toFixed(2)}`}</span>
              </div>
              {cart.shipping > 0 && (
                <div style={{ fontSize: "0.75rem", color: "var(--accent-warning)", marginTop: "-6px" }}>
                  Add ${(1000 - cart.subtotal).toFixed(2)} more for FREE shipping!
                </div>
              )}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                fontSize: "1.1rem",
                borderTop: "1px solid var(--border-color)",
                paddingTop: "16px",
                marginTop: "6px"
              }}>
                <span>Total</span>
                <span className="gradient-text">${cart.total.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="btn btn-primary" style={{ width: "100%" }}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
