import Product from "../models/Product.js";
import Review from "../models/Review.js";
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

// @desc    Get all products with filters, sorting, searching & pagination
// @route   GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      rating,
      priceMin,
      priceMax,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // 1. Text Search
    if (search) {
      query.$text = { $search: search };
    }

    // 2. Category Filter
    if (category) {
      query.category = category;
    }

    // 3. Brand Filter
    if (brand) {
      query.brand = brand;
    }

    // 4. Rating Filter (match rating >= specified value)
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // 5. Price Filters
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    // Sorting
    let sortOptions = {};
    if (sort) {
      if (sort === "price-asc") {
        sortOptions = { price: 1 };
      } else if (sort === "price-desc") {
        sortOptions = { price: -1 };
      } else if (sort === "newest") {
        sortOptions = { createdAt: -1 };
      } else if (sort === "rating") {
        sortOptions = { rating: -1 };
      }
    } else {
      sortOptions = { createdAt: -1 }; // Default sort
    }

    // Pagination
    const skipCount = (Number(page) - 1) * Number(limit);

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skipCount)
      .limit(Number(limit));

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(totalProducts / Number(limit)),
      totalProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
export const createProduct = async (req, res, next) => {
  try {
    const { name, price, discountPrice, category, brand, description, stock, isNewArrival } = req.body;

    let existing = [];
    if (req.body.existingImages) {
      try {
        existing = typeof req.body.existingImages === "string"
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
      } catch (e) {
        existing = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
      }
    }
    const images = [...existing, ...(req.uploadedImageUrls || [])];

    if (images.length === 0) {
      return res.status(400).json({ message: "At least one product image is required." });
    }

    const product = await Product.create({
      name,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      category,
      brand,
      images,
      description,
      stock: Number(stock),
      isNewArrival: isNewArrival === "true" || isNewArrival === true
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, price, discountPrice, category, brand, description, stock, isNewArrival } = req.body;

    let existing = [];
    if (req.body.existingImages) {
      try {
        existing = typeof req.body.existingImages === "string"
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
      } catch (e) {
        existing = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
      }
    }
    const images = [...existing, ...(req.uploadedImageUrls || [])];

    if (images.length === 0) {
      return res.status(400).json({ message: "At least one product image is required." });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        category,
        brand,
        images,
        description,
        stock: Number(stock),
        isNewArrival: isNewArrival === "true" || isNewArrival === true
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 1. Delete associated images from storage (Cloudinary & Local uploads)
    if (product.images && product.images.length > 0) {
      for (const url of product.images) {
        if (url.includes("/uploads/")) {
          // Local storage cleanup
          const filename = url.substring(url.lastIndexOf("/") + 1);
          const filePath = path.join(__dirname, "../uploads", filename);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (err) {
              console.error(`Failed to delete local file ${filePath}:`, err);
            }
          }
        } else if (isCloudinaryConfigured && url.includes("cloudinary.com")) {
          // Cloudinary storage cleanup
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
            console.error("Cloudinary file deletion failed:", cloudinaryErr);
          }
        }
      }
    }

    // 2. Delete product from database
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
export const createProductReview = async (req, res, next) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({ userId: req.user._id, productId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed by this user" });
    }

    const review = await Review.create({
      userId: req.user._id,
      userName: req.user.name,
      productId,
      rating: Number(rating),
      comment
    });

    // Update product rating & review count
    const reviews = await Review.find({ productId });
    product.numReviews = reviews.length;
    product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};
