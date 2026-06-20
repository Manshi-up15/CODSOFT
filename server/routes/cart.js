import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  syncCart
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // Secure all cart endpoints

router.get("/", getCart);
router.post("/add", addToCart);
router.patch("/update", updateCartItem);
router.delete("/remove/:productId", removeFromCart);
router.post("/sync", syncCart);

export default router;
