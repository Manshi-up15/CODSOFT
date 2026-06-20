import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ShieldCheck, Mail, Lock, User, Phone, CheckCircle2 } from "lucide-react";

const Login: React.FC = () => {
  const { login, backendUrl, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract redirect query parameter if present
  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get("redirect") || "";

  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast("Email and Password are required.", "error");
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        showToast("Full Name is required.", "error");
        return;
      }
      if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
      }
      if (password.length < 6) {
        showToast("Password must be at least 6 characters.", "error");
        return;
      }
    }

    setSubmitting(true);
    try {
      const endpoint = isRegister ? "/auth/signup" : "/auth/login";
      const payload = isRegister
        ? { name, email, phone, password }
        : { email, password };

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token, data.user);
        
        // Redirect appropriately
        if (redirect === "checkout") {
          navigate("/checkout");
        } else {
          navigate("/");
        }
      } else {
        const errData = await response.json();
        showToast(errData.message || "Authentication failed.", "error");
      }
    } catch (err) {
      showToast("Could not connect to authentication server.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    "50% Off Seasonal Clearance",
    "Track Dispatched Shipments",
    "Save Custom Wishlist Items",
    "PCI Compliant Secure Checkout"
  ];

  return (
    <div className="container" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - 180px)",
      paddingTop: "40px",
      paddingBottom: "40px"
    }}>
      <div className="glass" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        maxWidth: "960px",
        width: "100%",
        borderRadius: "var(--border-radius-lg)",
        overflow: "hidden",
        minHeight: "560px"
      }}>
        {/* Left Side: Gradient Banner Info */}
        <div className="gradient-banner" style={{
          padding: "48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative"
        }}>
          {/* Background decor orb */}
          <div style={{
            position: "absolute",
            width: "260px",
            height: "260px",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)",
            top: "-60px",
            left: "-60px"
          }}></div>

          <div style={{ position: "relative", zIndex: 5 }}>
            <span style={{ fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
              ShopSphere Workspace
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", marginTop: "12px", marginBottom: "24px", lineHeight: 1.25 }}>
              Elevate your <br />
              shopping journey.
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "36px" }}>
              {benefits.map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", color: "rgba(255,255,255,0.85)" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--accent-success)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>{b}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px", display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>
              <ShieldCheck size={18} /> SSL Secured Encrypted Sessions
            </div>
          </div>
        </div>

        {/* Right Side: Account Forms */}
        <div style={{
          padding: "48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "8px" }}>
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "32px" }}>
            {isRegister ? "Get started with ShopSphere today." : "Please sign in to access your account."}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isRegister && (
              <>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: "40px" }}
                    />
                    <User size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-tertiary)" }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: "40px" }}
                    />
                    <Phone size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-tertiary)" }} />
                  </div>
                </div>
              </>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address *</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: "40px" }}
                />
                <Mail size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-tertiary)" }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: "40px" }}
                />
                <Lock size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-tertiary)" }} />
              </div>
            </div>

            {isRegister && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: "40px" }}
                  />
                  <Lock size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-tertiary)" }} />
                </div>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: "100%", height: "44px", marginTop: "10px" }}>
              {submitting ? "Signing in..." : isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Toggle state */}
          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>
              {isRegister ? "Already have an account?" : "New to ShopSphere?"}
            </span>{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              style={{
                color: "var(--accent-primary)",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {isRegister ? "Sign In" : "Register Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
