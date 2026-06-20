import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  addresses: Address[];
  wishlist: string[];
}

export interface Address {
  _id?: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand: string;
  images: string[];
  description: string;
  stock: number;
  rating: number;
  numReviews: number;
  isNewArrival?: boolean;
}

export interface CartItem {
  productId: Product;
  quantity: number;
}

export interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error" | "info";
}

interface AppContextType {
  user: User | null;
  token: string | null;
  cart: {
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  wishlist: Product[];
  loading: boolean;
  toasts: ToastMessage[];
  showToast: (text: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: number) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUserAddresses: (addresses: Address[]) => void;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartQty: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  fetchWishlist: () => Promise<void>;
  backendUrl: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const backendUrl = "http://localhost:5000/api";

  // Toast Management
  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Functions
  const login = async (newToken: string, userData: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
    showToast(`Welcome back, ${userData.name}!`, "success");
    
    // Sync LocalStorage Cart with DB
    const localCart = JSON.parse(localStorage.getItem("localCart") || "[]");
    if (localCart.length > 0) {
      try {
        const response = await fetch(`${backendUrl}/cart/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`
          },
          body: JSON.stringify({ items: localCart })
        });
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
          localStorage.removeItem("localCart");
        }
      } catch (err) {
        console.error("Failed to sync cart:", err);
      }
    } else {
      // Fetch user's cart from DB
      fetchCartData(newToken);
    }
    
    // Fetch Wishlist
    fetchWishlistData(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setCartItems([]);
    setWishlist([]);
    showToast("Logged out successfully.", "info");
  };

  const updateUserAddresses = (addresses: Address[]) => {
    if (user) {
      setUser({ ...user, addresses });
    }
  };

  // Cart operations
  const fetchCartData = async (authToken: string) => {
    try {
      const response = await fetch(`${backendUrl}/cart`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const fetchCart = async () => {
    if (token) {
      await fetchCartData(token);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (token) {
      // User is logged in, use DB API
      try {
        const response = await fetch(`${backendUrl}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity })
        });
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
          showToast("Item added to cart!", "success");
        } else {
          const errData = await response.json();
          showToast(errData.message || "Failed to add to cart.", "error");
        }
      } catch (err) {
        showToast("Error connecting to server.", "error");
      }
    } else {
      // Anonymous user, use localStorage
      try {
        // Fetch product info to store correctly
        const resProduct = await fetch(`${backendUrl}/products/${productId}`);
        if (!resProduct.ok) throw new Error("Product fetch failed");
        const productInfo: Product = await resProduct.json();

        if (productInfo.stock < 1) {
          showToast("Product is out of stock", "error");
          return;
        }

        const localCart = JSON.parse(localStorage.getItem("localCart") || "[]");
        const itemIndex = localCart.findIndex((i: any) => i.productId === productId);

        if (itemIndex > -1) {
          localCart[itemIndex].quantity += quantity;
        } else {
          localCart.push({ productId, quantity });
        }
        localStorage.setItem("localCart", JSON.stringify(localCart));

        // Update active cart state by mapping products locally
        const updatedCartItems = await Promise.all(
          localCart.map(async (item: any) => {
            const productRes = await fetch(`${backendUrl}/products/${item.productId}`);
            const product = await productRes.json();
            return { productId: product, quantity: item.quantity };
          })
        );

        setCartItems(updatedCartItems);
        showToast("Item added to cart!", "success");
      } catch (err) {
        showToast("Failed to add to cart.", "error");
      }
    }
  };

  const updateCartQty = async (productId: string, quantity: number) => {
    if (token) {
      try {
        const response = await fetch(`${backendUrl}/cart/update`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity })
        });
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
        } else {
          const errData = await response.json();
          showToast(errData.message || "Failed to update quantity.", "error");
        }
      } catch (err) {
        showToast("Error updating cart.", "error");
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem("localCart") || "[]");
      const itemIndex = localCart.findIndex((i: any) => i.productId === productId);
      if (itemIndex > -1) {
        localCart[itemIndex].quantity = quantity;
        localStorage.setItem("localCart", JSON.stringify(localCart));

        // Re-map items
        const updatedCartItems = await Promise.all(
          localCart.map(async (item: any) => {
            const productRes = await fetch(`${backendUrl}/products/${item.productId}`);
            const product = await productRes.json();
            return { productId: product, quantity: item.quantity };
          })
        );
        setCartItems(updatedCartItems);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    if (token) {
      try {
        const response = await fetch(`${backendUrl}/cart/remove/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
          showToast("Item removed from cart.", "info");
        }
      } catch (err) {
        showToast("Error removing item.", "error");
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem("localCart") || "[]");
      const filteredCart = localCart.filter((i: any) => i.productId !== productId);
      localStorage.setItem("localCart", JSON.stringify(filteredCart));

      const updatedCartItems = await Promise.all(
        filteredCart.map(async (item: any) => {
          const productRes = await fetch(`${backendUrl}/products/${item.productId}`);
          const product = await productRes.json();
          return { productId: product, quantity: item.quantity };
        })
      );
      setCartItems(updatedCartItems);
      showToast("Item removed from cart.", "info");
    }
  };

  // Wishlist operations
  const fetchWishlistData = async (authToken: string) => {
    try {
      const response = await fetch(`${backendUrl}/auth/wishlist`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data || []);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  const fetchWishlist = async () => {
    if (token) {
      await fetchWishlistData(token);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!token) {
      showToast("Please login to use the Wishlist.", "info");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/auth/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data || []);
        const inWishlist = data.some((p: Product) => p._id === productId);
        showToast(
          inWishlist ? "Added to wishlist!" : "Removed from wishlist.",
          "success"
        );
      }
    } catch (err) {
      showToast("Error updating wishlist.", "error");
    }
  };

  // Subtotal and totals calculation
  const calculateCartTotals = () => {
    const subtotal = cartItems.reduce((acc, item) => {
      if (!item.productId) return acc;
      const price = item.productId.discountPrice || item.productId.price;
      return acc + price * item.quantity;
    }, 0);
    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal === 0 || subtotal > 1000 ? 0 : 100;
    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total };
  };

  // Initial load
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      if (token) {
        try {
          // Fetch current user details
          const response = await fetch(`${backendUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser({
              id: userData._id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              role: userData.role,
              addresses: userData.addresses || [],
              wishlist: userData.wishlist ? userData.wishlist.map((w: any) => w._id || w) : []
            });
            await fetchCartData(token);
            await fetchWishlistData(token);
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (err) {
          console.error("Initial load auth error:", err);
          logout();
        }
      } else {
        // Load local cart for guest users
        const localCart = JSON.parse(localStorage.getItem("localCart") || "[]");
        if (localCart.length > 0) {
          try {
            const items = await Promise.all(
              localCart.map(async (item: any) => {
                const productRes = await fetch(`${backendUrl}/products/${item.productId}`);
                if (!productRes.ok) return null;
                const product = await productRes.json();
                return { productId: product, quantity: item.quantity };
              })
            );
            setCartItems(items.filter((item) => item !== null) as CartItem[]);
          } catch (err) {
            console.error("Error loading local cart items:", err);
          }
        }
      }
      setLoading(false);
    };

    initApp();
  }, [token]);

  const { subtotal, tax, shipping, total } = calculateCartTotals();

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        cart: { items: cartItems, subtotal, tax, shipping, total },
        wishlist,
        loading,
        toasts,
        showToast,
        removeToast,
        login,
        logout,
        updateUserAddresses,
        fetchCart,
        addToCart,
        updateCartQty,
        removeFromCart,
        toggleWishlist,
        fetchWishlist,
        backendUrl
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
