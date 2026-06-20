import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews
} from "../controllers/productController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { handleImageUpload } from "../middleware/upload.js";

const router = express.Router();

router.route("/")
  .get(getProducts)
  .post(protect, adminOnly, handleImageUpload, createProduct);

router.route("/:id")
  .get(getProductById)
  .put(protect, adminOnly, handleImageUpload, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

router.route("/:id/reviews")
  .get(getProductReviews)
  .post(protect, createProductReview);

export default router;
