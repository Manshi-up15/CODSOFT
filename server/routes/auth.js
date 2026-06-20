import express from "express";
import {
  signup,
  login,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

router.post("/addresses", protect, addAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

router.get("/wishlist", protect, getWishlist);
router.post("/wishlist", protect, toggleWishlist);

export default router;
