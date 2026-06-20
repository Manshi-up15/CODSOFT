import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import type { Product } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import RatingWidget from "../components/RatingWidget";
import { ArrowRight, Headset, Watch, Tablet, Speaker, Settings } from "lucide-react";

const Home: React.FC = () => {
  const { backendUrl } = useApp();
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${backendUrl}/products?limit=4`);
        if (res.ok) {
          const data = await res.json();
          setTrendingProducts(data.products || []);
        }
      } catch (err) {
        console.error("Failed to load trending products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, [backendUrl]);

  const categories = [
    { name: "Headphones", icon: <Headset size={24} />, count: "2 Products" },
    { name: "Wearables", icon: <Watch size={24} />, count: "1 Product" },
    { name: "Tablets", icon: <Tablet size={24} />, count: "1 Product" },
    { name: "Speakers", icon: <Speaker size={24} />, count: "1 Product" },
    { name: "Accessories", icon: <Settings size={24} />, count: "1 Product" }
  ];

  const testimonials = [
    {
      name: "Saurabh Saini",
      role: "Software Engineer",
      rating: 5,
      comment: "The SphereSound Pro X1 headphones are absolutely incredible! Deep rich bass, superb active noise cancellation, and a battery life that seems to last forever. Shipping was incredibly fast."
    },
    {
      name: "Meera Nair",
      role: "Creative Director",
      rating: 5,
      comment: "I purchased the OptimaTab Pro 11 for my design projects, and it's spectacular. Sleek design, vivid display, and fast performance. This storefront curation is top tier!"
    },
    {
      name: "Aman Gupta",
      role: "Tech Enthusiast",
      rating: 4.8,
      comment: "Excellent experience. The NovaCharge Dock minimises wire clutter on my desk. Easy navigation, secure checkout, and prompt status updates. Will buy again!"
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "80px", paddingTop: "40px" }}>
      
      {/* Hero Banner Section */}
      <section className="container">
        <div className="glass" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: "40px",
          padding: "60px 48px",
          borderRadius: "var(--border-radius-lg)",
          overflow: "hidden"
        }}>
          <div>
            <span style={{
              color: "var(--accent-primary)",
              fontWeight: 700,
              fontSize: "0.9rem",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "12px"
            }}>Limited Edition Tech</span>
            <h1 style={{
              fontSize: "3.2rem",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: "20px",
              letterSpacing: "-1px"
            }}>
              Discover Premium <br />
              <span className="gradient-text">Products</span>
            </h1>
            <p style={{
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
              lineHeight: 1.6,
              marginBottom: "32px",
              maxWidth: "480px"
            }}>
              Transform your workspace and elevate your daily lifestyle with our hand-curated collections of high-end consumer electronics.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              <Link to="/shop" className="btn btn-primary">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/shop?category=Headphones" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            <div style={{
              position: "absolute",
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
              zIndex: 1
            }}></div>
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
              alt="Premium Headphones Hero"
              style={{
                width: "85%",
                height: "360px",
                objectFit: "contain",
                borderRadius: "var(--border-radius)",
                filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.5))",
                zIndex: 2
              }}
            />
          </div>
        </div>
      </section>

      {/* Curated Categories */}
      <section className="container">
        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "32px", textAlign: "center" }}>
          Curated Categories
        </h2>
        <div style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "24px"
        }}>
          {categories.map((cat, i) => (
            <Link
              key={i}
              to={`/shop?category=${cat.name}`}
              className="card"
              style={{
                flex: "1 1 180px",
                maxWidth: "220px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                padding: "24px"
              }}
            >
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                color: "var(--accent-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {cat.icon}
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "4px" }}>{cat.name}</h4>
                <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{cat.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="container">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "32px"
        }}>
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Trending Products</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "4px" }}>
              Our customer favourites and best performing devices this week.
            </p>
          </div>
          <Link to="/shop" style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--accent-primary)",
            fontWeight: 600,
            fontSize: "0.95rem"
          }}>
            View All Products <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>
            Loading trending items...
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "24px"
          }}>
            {trendingProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Seasonal Clearance Banner */}
      <section className="container">
        <div style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #1e3a8a 100%)",
          borderRadius: "var(--border-radius-lg)",
          padding: "50px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "32px",
          boxShadow: "0 10px 30px rgba(29, 78, 216, 0.2)"
        }}>
          <div style={{ maxWidth: "600px" }}>
            <span style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase"
            }}>Limited Season Offer</span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", marginTop: "16px", marginBottom: "12px" }}>
              Seasonal Clearance: 50% OFF Sale
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
              Grab a step closer to the frequent sales this year. Explore top selected headphones, smartwatches, and accessories at half the cost. Valid until stock lasts.
            </p>
          </div>
          <Link to="/shop" className="btn" style={{
            backgroundColor: "#ffffff",
            color: "var(--accent-primary-hover)",
            padding: "14px 28px"
          }}>
            Shop Now
          </Link>
        </div>
      </section>

      {/* Client Voices / Testimonials */}
      <section className="container">
        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "12px", textAlign: "center" }}>
          Client Voices
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", textAlign: "center", marginBottom: "40px" }}>
          Join thousands of satisfied shoppers who upgraded their gear with ShopSphere.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px"
        }}>
          {testimonials.map((t, i) => (
            <div key={i} className="card" style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              borderRadius: "16px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: "1rem" }}>{t.name}</h4>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{t.role}</span>
                </div>
                <RatingWidget rating={t.rating} size={16} />
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, fontStyle: "italic" }}>
                "{t.comment}"
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
