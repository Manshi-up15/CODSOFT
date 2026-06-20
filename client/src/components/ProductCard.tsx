import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import type { Product } from "../context/AppContext";
import RatingWidget from "./RatingWidget";
import { Heart, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useApp();

  const isWishlisted = wishlist.some((item) => item._id === product._id);
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product._id, 1);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  return (
    <div className="card" style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      position: "relative",
      padding: "16px",
      borderRadius: "16px"
    }}>
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <span style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          backgroundColor: "var(--accent-danger)",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontWeight: 700,
          zIndex: 10
        }}>
          {discountPercent}% OFF
        </span>
      )}

      {/* Stock status badge */}
      {product.stock === 0 && (
        <span style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          backgroundColor: "var(--bg-tertiary)",
          color: "var(--text-tertiary)",
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontWeight: 700,
          zIndex: 10
        }}>
          OUT OF STOCK
        </span>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        style={{
          position: "absolute",
          top: "12px",
          right: product.stock === 0 ? "110px" : "12px",
          backgroundColor: "rgba(17, 24, 39, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: isWishlisted ? "var(--accent-danger)" : "#fff",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
          backdropFilter: "blur(4px)",
          transition: "transform 0.2s ease"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <Heart size={18} fill={isWishlisted ? "var(--accent-danger)" : "none"} />
      </button>

      {/* Image Gallery Container */}
      <Link to={`/product/${product._id}`} style={{ display: "block", marginBottom: "16px", overflow: "hidden", borderRadius: "10px", backgroundColor: "#fff" }}>
        <img
          src={product.images[0]}
          alt={product.name}
          style={{
            width: "100%",
            height: "200px",
            objectFit: "contain",
            transition: "transform 0.5s ease"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      </Link>

      {/* Brand & Category info */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px"
      }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase" }}>
          {product.brand}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 600 }}>
          {product.category}
        </span>
      </div>

      {/* Product Name */}
      <Link to={`/product/${product._id}`} style={{ display: "block", marginBottom: "8px" }}>
        <h3 style={{
          fontSize: "1rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}>
          {product.name}
        </h3>
      </Link>

      {/* Rating section */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
        <RatingWidget rating={product.rating} size={14} />
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          ({product.numReviews})
        </span>
      </div>

      {/* Price & Action button */}
      <div style={{
        marginTop: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px"
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {product.discountPrice ? (
            <>
              <span style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
                ${product.discountPrice.toFixed(2)}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", textDecoration: "line-through" }}>
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={handleCartClick}
          disabled={product.stock === 0}
          className="btn btn-primary"
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            height: "36px",
            opacity: product.stock === 0 ? 0.5 : 1,
            cursor: product.stock === 0 ? "not-allowed" : "pointer"
          }}
        >
          <ShoppingCart size={16} />
          Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
