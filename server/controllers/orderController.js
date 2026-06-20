import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Stripe from "stripe";

// Initialize Stripe (mock or real)
let stripe;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "sk_test_mockkey") {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// @desc    Create a new order
// @route   POST /api/orders
export const createOrder = async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus = "pending",
    stripeTokenId // optional, from client for Stripe integration
  } = req.body;

  try {
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    // Verify stock and calculate subtotal
    let totalAmount = 0;
    const finalOrderItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Product ${product.name} is out of stock or insufficient quantity` });
      }

      const price = product.discountPrice || product.price;
      totalAmount += price * item.quantity;

      finalOrderItems.push({
        productId: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
        image: product.images[0]
      });
    }

    // Add tax and shipping calculations
    const tax = Math.round(totalAmount * 0.18); // 18% GST/tax
    const shipping = totalAmount > 1000 ? 0 : 100; // Free shipping above 1000
    const finalTotal = totalAmount + tax + shipping;

    let stripeChargeId = "";
    let finalPaymentStatus = paymentStatus;

    // Process Stripe Payment
    if (paymentMethod === "Card" && stripeTokenId) {
      if (stripe) {
        try {
          const charge = await stripe.charges.create({
            amount: Math.round(finalTotal * 100), // Stripe expects amount in cents/paise
            currency: "inr",
            source: stripeTokenId,
            description: `ShopSphere Order Payment - ${req.user.email}`
          });
          stripeChargeId = charge.id;
          finalPaymentStatus = "paid";
        } catch (err) {
          console.error("Stripe Charge Error: ", err);
          return res.status(400).json({ message: `Payment failed: ${err.message}` });
        }
      } else {
        // If mock key, succeed automatically
        stripeChargeId = "ch_mock_" + Math.random().toString(36).substr(2, 9);
        finalPaymentStatus = "paid";
      }
    } else if (paymentMethod === "COD") {
      finalPaymentStatus = "pending";
    } else {
      // Wallet or Net Banking etc.
      stripeChargeId = "ch_mock_" + Math.random().toString(36).substr(2, 9);
      finalPaymentStatus = "paid";
    }

    // Create Order
    const order = await Order.create({
      userId: req.user._id,
      products: finalOrderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: finalPaymentStatus,
      totalAmount: finalTotal,
      paymentIntentId: stripeChargeId
    });

    // Deduct stocks
    for (const item of finalOrderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear User Cart
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Authorized check: user should own the order or be an admin
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, unauthorized" });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};
