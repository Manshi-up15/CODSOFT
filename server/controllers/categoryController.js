import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary if credentials exist
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// @desc    Get all categories with product count
// @route   GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat.name });
        return {
          _id: cat._id,
          name: cat.name,
          description: cat.description,
          image: cat.image,
          createdAt: cat.createdAt,
          productCount
        };
      })
    );

    res.json(categoriesWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category (Admin only)
// @route   POST /api/categories
export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category name must be unique" });
    }

    const image = req.uploadedCategoryImageUrl || "";

    const category = new Category({
      name: name.trim(),
      description: description ? description.trim() : "",
      image
    });

    await category.save();
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category (Admin only)
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const oldName = category.name;
    const newName = name ? name.trim() : oldName;

    if (newName.toLowerCase() !== oldName.toLowerCase()) {
      const existing = await Category.findOne({ name: { $regex: new RegExp(`^${newName}$`, "i") } });
      if (existing) {
        return res.status(400).json({ success: false, message: "Category name must be unique" });
      }
    }

    category.name = newName;
    category.description = description ? description.trim() : category.description;
    
    if (req.uploadedCategoryImageUrl) {
      // Clean up old image if local
      if (category.image && category.image.includes("/uploads/")) {
        const filename = category.image.substring(category.image.lastIndexOf("/") + 1);
        const filePath = path.join(__dirname, "../uploads", filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error(`Failed to delete local category image:`, err);
          }
        }
      }
      category.image = req.uploadedCategoryImageUrl;
    }

    await category.save();

    if (newName !== oldName) {
      await Product.updateMany({ category: oldName }, { category: newName });
    }

    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category (Admin only)
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category containing products."
      });
    }

    const url = category.image;
    if (url) {
      if (url.includes("/uploads/")) {
        const filename = url.substring(url.lastIndexOf("/") + 1);
        const filePath = path.join(__dirname, "../uploads", filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error(`Failed to delete local category image:`, err);
          }
        }
      } else if (isCloudinaryConfigured && url.includes("cloudinary.com")) {
        try {
          const parts = url.split("/upload/");
          if (parts.length >= 2) {
            let publicIdWithExtension = parts[1];
            publicIdWithExtension = publicIdWithExtension.replace(/^v\d+\//, "");
            const extensionIndex = publicIdWithExtension.lastIndexOf(".");
            const publicId = extensionIndex !== -1 
              ? publicIdWithExtension.substring(0, extensionIndex) 
              : publicIdWithExtension;
            
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (cloudinaryErr) {
          console.error("Cloudinary category image deletion failed:", cloudinaryErr);
        }
      }
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};
