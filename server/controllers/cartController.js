import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc    Get current user's cart
// @route   GET /api/cart
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
export const addToCart = async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // Item already in cart, increment quantity
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      // Add new item
      cart.items.push({ productId, quantity: Number(quantity) });
    }

    await cart.save();
    const updatedCart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");
    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PATCH /api/cart/update
export const updateCartItem = async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();

    const updatedCart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");
    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
export const removeFromCart = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    const updatedCart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");
    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};

// @desc    Sync local cart with database (on login)
// @route   POST /api/cart/sync
export const syncCart = async (req, res, next) => {
  const { items } = req.body; // Array of { productId, quantity }

  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    items.forEach(localItem => {
      const dbItemIndex = cart.items.findIndex(
        dbItem => dbItem.productId.toString() === localItem.productId
      );

      if (dbItemIndex > -1) {
        // If exists in DB, merge quantity or take the maximum/sum
        cart.items[dbItemIndex].quantity = Math.max(cart.items[dbItemIndex].quantity, localItem.quantity);
      } else {
        // Add local item to DB cart
        cart.items.push({ productId: localItem.productId, quantity: localItem.quantity });
      }
    });

    await cart.save();
    const updatedCart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");
    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};
