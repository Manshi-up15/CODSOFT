import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ShoppingCart, Heart, User as UserIcon, Search, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";

interface NavbarProps {
  onSearch?: (term: string) => void;
}

const Navbar: React.FC<NavbarProps> = () => {
  const { user, cart, logout } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const totalCartItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="glass" style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      width: "100%",
      borderBottom: "1px solid var(--border-color)",
      padding: "16px 0"
    }}>
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px"
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            background: "linear-gradient(135deg, var(--accent-primary) 0%, #1d4ed8 100%)",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1.2rem"
          }}>S</div>
          <span style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.5px" }}>
            Shop<span className="gradient-text">Sphere</span>
          </span>
        </Link>

        {/* Navigation Categories */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }} className="nav-links">
          <Link to="/shop" style={{ fontWeight: 500, fontSize: "0.95rem" }}>Shop All</Link>
          <Link to="/shop?category=Headphones" style={{ fontWeight: 500, fontSize: "0.95rem" }}>Headphones</Link>
          <Link to="/shop?category=Wearables" style={{ fontWeight: 500, fontSize: "0.95rem" }}>Wearables</Link>
          <Link to="/shop?category=Tablets" style={{ fontWeight: 500, fontSize: "0.95rem" }}>Tablets</Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{
          position: "relative",
          flex: "0 1 350px",
          display: "flex",
          alignItems: "center"
        }}>
          <input
            type="text"
            placeholder="Search products, brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: "44px",
              paddingRight: "16px",
              height: "40px",
              borderRadius: "20px"
            }}
          />
          <Search size={18} style={{
            position: "absolute",
            left: "16px",
            color: "var(--text-secondary)"
          }} />
        </form>

        {/* User Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Wishlist Link */}
          {user && (
            <Link to="/profile?tab=wishlist" className="btn-icon" style={{ position: "relative" }}>
              <Heart size={20} />
            </Link>
          )}

          {/* Cart Icon */}
          <Link to="/cart" className="btn-icon" style={{ position: "relative" }}>
            <ShoppingCart size={20} />
            {totalCartItems > 0 && (
              <span style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                backgroundColor: "var(--accent-primary)",
                color: "#fff",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                fontSize: "0.75rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {totalCartItems}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div style={{ position: "relative" }}>
            {user ? (
              <>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="btn"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-color)",
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderRadius: "20px"
                  }}
                >
                  <UserIcon size={16} />
                  <span style={{ fontSize: "0.9rem" }}>{user.name.split(" ")[0]}</span>
                </button>

                {showDropdown && (
                  <div className="glass" style={{
                    position: "absolute",
                    right: 0,
                    top: "48px",
                    width: "200px",
                    borderRadius: "var(--border-radius)",
                    padding: "8px",
                    boxShadow: "var(--glass-shadow)",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px"
                  }}>
                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setShowDropdown(false)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.9rem"
                        }}
                        className="btn-secondary"
                      >
                        <LayoutDashboard size={16} />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.9rem"
                      }}
                      className="btn-secondary"
                    >
                      <ShoppingBag size={16} />
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.9rem",
                        textAlign: "left",
                        width: "100%",
                        cursor: "pointer",
                        color: "var(--accent-danger)"
                      }}
                      className="btn-secondary"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{
                padding: "8px 20px",
                borderRadius: "20px",
                fontSize: "0.9rem"
              }}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
