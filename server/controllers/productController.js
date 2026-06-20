import Product from "../models/Product.js";
import Review from "../models/Review.js";

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
  const { name, price, discountPrice, category, brand, images, description, stock, isNewArrival } = req.body;

  try {
    const product = await Product.create({
      name,
      price,
      discountPrice,
      category,
      brand,
      images,
      description,
      stock,
      isNewArrival
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

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
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
