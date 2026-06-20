import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  category: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  images: [{ type: String, required: true }],
  description: { type: String, required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  isNewArrival: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Indexing for search
productSchema.index({ name: "text", description: "text", category: "text", brand: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;
