import express from "express";
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly); // Protect all routes with admin validation

router.get("/stats", getDashboardStats);
router.get("/orders", getAllOrders);
router.patch("/orders/:id", updateOrderStatus);
router.get("/users", getAllUsers);

export default router;
