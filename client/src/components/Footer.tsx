import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: "var(--bg-secondary)",
      borderTop: "1px solid var(--border-color)",
      padding: "60px 0 30px 0",
      marginTop: "80px"
    }}>
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px",
          marginBottom: "40px"
        }}>
          <div>
            <span style={{ fontSize: "1.3rem", fontWeight: 800, display: "block", marginBottom: "16px" }}>
              Shop<span className="gradient-text">Sphere</span>
            </span>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Premium curated consumer electronics and workspace aesthetics. Elevate your space and lifestyle.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: "16px", fontSize: "1rem", fontWeight: 600 }}>Quick Links</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              <li><Link to="/shop">Shop Catalog</Link></li>
              <li><Link to="/cart">My Shopping Cart</Link></li>
              <li><Link to="/profile">My Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: "16px", fontSize: "1rem", fontWeight: 600 }}>Support</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              <li><a href="#">Track Orders</a></li>
              <li><a href="#">Shipping Details</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: "16px", fontSize: "1rem", fontWeight: 600 }}>Newsletter</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "12px" }}>
              Subscribe to get updates on new arrivals and deals.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="email"
                placeholder="Your email"
                className="form-input"
                style={{ height: "40px" }}
              />
              <button className="btn btn-primary" style={{ padding: "0 16px", height: "40px", fontSize: "0.9rem" }}>
                Join
              </button>
            </div>
          </div>
        </div>
        <div style={{
          borderTop: "1px solid var(--border-color)",
          paddingTop: "24px",
          textAlign: "center",
          color: "var(--text-tertiary)",
          fontSize: "0.85rem"
        }}>
          &copy; {new Date().getFullYear()} ShopSphere. All rights reserved. Built with React and Node.js.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
