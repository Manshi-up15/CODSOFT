import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import type { Product } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { SlidersHorizontal, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

const Shop: React.FC = () => {
  const { backendUrl } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // State values for products and filters
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Extract initial query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category") || "";
  const initialSearch = queryParams.get("search") || "";
  const initialSort = queryParams.get("sort") || "newest";
  const initialPage = Number(queryParams.get("page") || "1");

  // State matching current URL or user inputs
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  // Local filters (applied on "Apply" or live)
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [brand, setBrand] = useState("");
  const [rating, setRating] = useState("");

  // Sync category and search when location changes (from navbar etc.)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setCategory(params.get("category") || "");
    setSearch(params.get("search") || "");
    setPage(Number(params.get("page") || "1"));
  }, [location.search]);

  // Fetch products whenever filters or page changes
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.append("search", search);
        if (category) query.append("category", category);
        if (brand) query.append("brand", brand);
        if (rating) query.append("rating", rating);
        if (priceMin) query.append("priceMin", priceMin);
        if (priceMax) query.append("priceMax", priceMax);
        if (sort) query.append("sort", sort);
        query.append("page", page.toString());
        query.append("limit", "9"); // 9 items per page

        const res = await fetch(`${backendUrl}/products?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setTotalPages(data.pages || 1);
          setTotalProducts(data.totalProducts || 0);
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [search, category, brand, rating, priceMin, priceMax, sort, page, backendUrl]);

  // Update navigation search query
  const updateUrl = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "") {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });
    navigate(`/shop?${params.toString()}`);
  };

  const handleCategorySelect = (selectedCat: string) => {
    setCategory(selectedCat);
    setPage(1);
    updateUrl({ category: selectedCat, page: 1 });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    updateUrl({ sort: e.target.value });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      updateUrl({ page: newPage });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const clearFilters = () => {
    setCategory("");
    setSearch("");
    setPriceMin("");
    setPriceMax("");
    setBrand("");
    setRating("");
    setSort("newest");
    setPage(1);
    navigate("/shop");
  };

  const categoriesList = ["Headphones", "Earbuds", "Wearables", "Speakers", "Tablets", "Cameras", "Accessories"];
  const brandsList = ["SphereSound", "AeroBuds", "TimeSync", "NovaCharge", "AuraVoice", "OptimaTab", "VividLens"];

  return (
    <div className="container" style={{ paddingTop: "40px" }}>
      {/* Top Banner/Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Product Catalog</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {search ? `Search results for "${search}"` : "Explore our range of premium workspace audio, wearables and chargers"} ({totalProducts} items)
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: "40px",
        alignItems: "start"
      }}>
        {/* Left Filters Sidebar */}
        <aside className="glass" style={{
          padding: "24px",
          borderRadius: "var(--border-radius)",
          display: "flex",
          flexDirection: "column",
          gap: "28px"
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem", fontWeight: 700 }}>
              <SlidersHorizontal size={18} /> Filters
            </h3>
            <button
              onClick={clearFilters}
              style={{
                fontSize: "0.8rem",
                color: "var(--accent-primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: 600
              }}
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
              Category
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={() => handleCategorySelect("")}
                style={{
                  textAlign: "left",
                  fontSize: "0.9rem",
                  color: category === "" ? "var(--accent-primary)" : "var(--text-secondary)",
                  fontWeight: category === "" ? 600 : 400,
                  cursor: "pointer"
                }}
              >
                All Products
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  style={{
                    textAlign: "left",
                    fontSize: "0.9rem",
                    color: category === cat ? "var(--accent-primary)" : "var(--text-secondary)",
                    fontWeight: category === cat ? 600 : 400,
                    cursor: "pointer"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
              Brand
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {brandsList.map((b) => (
                <label key={b} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="brand-filter"
                    checked={brand === b}
                    onChange={() => { setBrand(b); setPage(1); }}
                    style={{ cursor: "pointer" }}
                  />
                  {b}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
              Price Range ($)
            </h4>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="form-input"
                style={{ padding: "8px 10px", fontSize: "0.85rem", height: "36px" }}
              />
              <span style={{ color: "var(--text-tertiary)" }}>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="form-input"
                style={{ padding: "8px 10px", fontSize: "0.85rem", height: "36px" }}
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
              Customer Rating
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[4, 3, 2].map((r) => (
                <label key={r} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="rating-filter"
                    checked={rating === r.toString()}
                    onChange={() => { setRating(r.toString()); setPage(1); }}
                    style={{ cursor: "pointer" }}
                  />
                  {r}★ & Up
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main>
          {/* Top Sort / Actions toolbar */}
          <div className="glass" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderRadius: "var(--border-radius)",
            marginBottom: "24px"
          }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Showing {products.length} of {totalProducts} items
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Sort By:</span>
              <select
                value={sort}
                onChange={handleSortChange}
                className="form-select"
                style={{
                  width: "180px",
                  height: "36px",
                  padding: "0 12px",
                  fontSize: "0.85rem",
                  borderRadius: "8px"
                }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "100px 0", color: "var(--text-secondary)" }}>
              Loading products list...
            </div>
          ) : products.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "100px 0",
              color: "var(--text-secondary)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px"
            }} className="glass">
              <h3>No products found</h3>
              <p>We couldn't find any products matching your selected filters.</p>
              <button onClick={clearFilters} className="btn btn-primary" style={{ padding: "8px 16px" }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "24px",
                marginBottom: "40px"
              }}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="btn-icon"
                    style={{ opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          backgroundColor: page === pageNum ? "var(--accent-primary)" : "var(--bg-tertiary)",
                          border: page === pageNum ? "none" : "1px solid var(--border-color)",
                          color: page === pageNum ? "#fff" : "var(--text-primary)",
                          fontWeight: "bold",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="btn-icon"
                    style={{ opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
