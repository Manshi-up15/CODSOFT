import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import type { Product } from "../context/AppContext";
import RatingWidget from "../components/RatingWidget";
import ProductCard from "../components/ProductCard";
import { ShoppingCart, Heart, Plus, Minus } from "lucide-react";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { backendUrl, addToCart, toggleWishlist, wishlist, token, showToast } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for reviews
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Gallery main image
  const [mainImage, setMainImage] = useState("");
  const [qty, setQty] = useState(1);

  const isWishlisted = wishlist.some((item) => item._id === (product?._id || ""));

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Fetch Product info
        const res = await fetch(`${backendUrl}/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const productData = await res.json();
        setProduct(productData);
        setMainImage(productData.images[0]);
        setQty(1);

        // 2. Fetch Product Reviews
        const resReviews = await fetch(`${backendUrl}/products/${id}/reviews`);
        if (resReviews.ok) {
          const reviewsData = await resReviews.json();
          setReviews(reviewsData);
        }

        // 3. Fetch Similar Products
        const resSimilar = await fetch(
          `${backendUrl}/products?category=${productData.category}&limit=4`
        );
        if (resSimilar.ok) {
          const similarData = await resSimilar.json();
          setSimilarProducts(
            similarData.products.filter((p: Product) => p._id !== productData._id)
          );
        }
      } catch (err) {
        console.error("Error loading product details:", err);
        showToast("Product details failed to load.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, backendUrl]);

  const handleQtyChange = (type: "inc" | "dec") => {
    if (!product) return;
    if (type === "inc" && qty < product.stock) {
      setQty(qty + 1);
    } else if (type === "dec" && qty > 1) {
      setQty(qty - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product._id, qty);
    }
  };

  const handleBuyNow = async () => {
    if (product) {
      await addToCart(product._id, qty);
      navigate("/cart");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast("Please login to write a review.", "info");
      return;
    }

    if (!userComment.trim()) {
      showToast("Review text cannot be empty.", "error");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`${backendUrl}/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: userRating, comment: userComment })
      });

      if (response.ok) {
        showToast("Review added successfully!", "success");
        setUserComment("");
        // Reload reviews and product rating
        const resReviews = await fetch(`${backendUrl}/products/${id}/reviews`);
        if (resReviews.ok) {
          setReviews(await resReviews.json());
        }
        const resProduct = await fetch(`${backendUrl}/products/${id}`);
        if (resProduct.ok) {
          setProduct(await resProduct.json());
        }
      } else {
        const errData = await response.json();
        showToast(errData.message || "Failed to submit review.", "error");
      }
    } catch (err) {
      showToast("Server connection error.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0", color: "var(--text-secondary)" }}>
        Loading product information details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
        <h2>Product Not Found</h2>
        <p style={{ margin: "16px 0", color: "var(--text-secondary)" }}>
          The product you are trying to view does not exist.
        </p>
        <Link to="/shop" className="btn btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "40px" }}>
      {/* Breadcrumbs */}
      <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", marginBottom: "32px" }}>
        <Link to="/">Home</Link> &nbsp;/&nbsp;&nbsp;
        <Link to="/shop">Shop</Link> &nbsp;/&nbsp;&nbsp;
        <Link to={`/shop?category=${product.category}`}>{product.category}</Link> &nbsp;/&nbsp;&nbsp;
        <span style={{ color: "var(--text-secondary)" }}>{product.name}</span>
      </div>

      {/* Main product showcase split */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "60px",
        alignItems: "start",
        marginBottom: "80px"
      }}>
        {/* Left Side: Images */}
        <div>
          <div className="glass" style={{
            padding: "24px",
            borderRadius: "var(--border-radius-lg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            marginBottom: "20px",
            height: "400px"
          }}>
            <img
              src={mainImage}
              alt={product.name}
              style={{
                maxWidth: "100%",
                maxHeight: "360px",
                objectFit: "contain"
              }}
            />
          </div>

          {/* Thumbnails list */}
          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: "12px", overflowX: "auto" }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    border: mainImage === img ? "2px solid var(--accent-primary)" : "2px solid transparent",
                    cursor: "pointer",
                    flex: "0 0 80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <img src={img} alt="thumbnail" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
              {product.brand} &middot; {product.category}
            </span>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginTop: "8px", marginBottom: "12px" }}>
              {product.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <RatingWidget rating={product.rating} size={18} />
              <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                {product.rating.toFixed(1)} / 5.0 ({reviews.length} reviews)
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
            {product.discountPrice ? (
              <>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>
                  ${product.discountPrice.toFixed(2)}
                </span>
                <span style={{ fontSize: "1.3rem", color: "var(--text-tertiary)", textDecoration: "line-through" }}>
                  ${product.price.toFixed(2)}
                </span>
                <span style={{
                  color: "var(--accent-success)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  padding: "4px 10px",
                  borderRadius: "6px"
                }}>
                  Save ${(product.price - product.discountPrice).toFixed(2)}
                </span>
              </>
            ) : (
              <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "1rem" }}>
            {product.description}
          </p>

          {/* Specifications snippet */}
          <div className="glass" style={{
            padding: "16px 20px",
            borderRadius: "var(--border-radius)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            fontSize: "0.9rem"
          }}>
            <div><span style={{ color: "var(--text-tertiary)" }}>Availability:</span> <span style={{ fontWeight: 600, color: product.stock > 0 ? "var(--accent-success)" : "var(--accent-danger)" }}>
              {product.stock > 0 ? `In Stock (${product.stock} units)` : "Out of Stock"}
            </span></div>
            <div><span style={{ color: "var(--text-tertiary)" }}>Free Delivery:</span> <span style={{ fontWeight: 600, color: "#fff" }}>Orders &gt; $1000</span></div>
            <div><span style={{ color: "var(--text-tertiary)" }}>Return Policy:</span> <span style={{ fontWeight: 600, color: "#fff" }}>30-day replacement</span></div>
            <div><span style={{ color: "var(--text-tertiary)" }}>Brand Origin:</span> <span style={{ fontWeight: 600, color: "#fff" }}>Designed in India</span></div>
          </div>

          {/* Action Row: Qty selector and Buttons */}
          {product.stock > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", marginTop: "12px" }}>
              {/* Qty picker */}
              <div style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--border-radius)",
                height: "48px",
                overflow: "hidden"
              }}>
                <button
                  onClick={() => handleQtyChange("dec")}
                  style={{ width: "40px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}
                  className="btn-secondary"
                >
                  <Minus size={16} />
                </button>
                <span style={{ width: "40px", textAlign: "center", fontWeight: "bold" }}>{qty}</span>
                <button
                  onClick={() => handleQtyChange("inc")}
                  style={{ width: "40px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}
                  className="btn-secondary"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Cart */}
              <button onClick={handleAddToCart} className="btn btn-secondary" style={{ height: "48px", padding: "0 24px" }}>
                <ShoppingCart size={18} /> Add to Cart
              </button>

              {/* Buy Now */}
              <button onClick={handleBuyNow} className="btn btn-primary" style={{ height: "48px", padding: "0 28px" }}>
                Buy Now
              </button>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product._id)}
                className="btn-icon"
                style={{
                  height: "48px",
                  width: "48px",
                  color: isWishlisted ? "var(--accent-danger)" : "var(--text-primary)"
                }}
              >
                <Heart size={20} fill={isWishlisted ? "var(--accent-danger)" : "none"} />
              </button>
            </div>
          ) : (
            <div style={{ marginTop: "12px" }}>
              <button className="btn btn-secondary" disabled style={{ width: "100%", opacity: 0.5, cursor: "not-allowed" }}>
                Product Out of Stock
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Tab Section */}
      <section style={{ marginBottom: "80px" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>
          Customer Reviews ({reviews.length})
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "60px",
          alignItems: "start"
        }}>
          {/* Reviews List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {reviews.length === 0 ? (
              <div className="glass" style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
                No reviews yet for this product. Be the first to leave one!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="glass" style={{ padding: "20px", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: "0.95rem" }}>{rev.userName}</h4>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                    </div>
                    <RatingWidget rating={rev.rating} size={14} />
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Add Review Form */}
          <div className="glass" style={{ padding: "24px", borderRadius: "var(--border-radius)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px" }}>Write a Review</h3>

            {token ? (
              <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label className="form-label" style={{ display: "block", marginBottom: "6px" }}>Rating</label>
                  <RatingWidget rating={userRating} interactive onChange={setUserRating} size={24} />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Review Comment</label>
                  <textarea
                    rows={4}
                    placeholder="Share your thoughts about this product's performance and design..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="form-input"
                    style={{ resize: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ width: "100%", height: "40px" }}
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
                  You must be logged in to write a review.
                </p>
                <Link to="/login" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>Similar Products</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "24px"
          }}>
            {similarProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
