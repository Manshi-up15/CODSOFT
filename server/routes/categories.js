import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { handleCategoryImageUpload } from "../middleware/upload.js";

const router = express.Router();

router.route("/")
  .get(getCategories)
  .post(protect, adminOnly, handleCategoryImageUpload, createCategory);

router.route("/:id")
  .put(protect, adminOnly, handleCategoryImageUpload, updateCategory)
  .delete(protect, adminOnly, deleteCategory);

export default router;
