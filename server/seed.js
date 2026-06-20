import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Cart from "./models/Cart.js";
import Review from "./models/Review.js";
import Order from "./models/Order.js";
import Category from "./models/Category.js";

dotenv.config();

const productsData = [
  {
    name: "SphereSound Pro X1 Wireless",
    price: 299.99,
    discountPrice: 249.99,
    category: "Headphones",
    brand: "SphereSound",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Experience audiophile-grade audio quality with industry-leading hybrid active noise cancellation. Features 40 hours of battery life, memory foam cups, and instant voice assistant support.",
    stock: 25,
    rating: 4.8,
    numReviews: 2,
    isNewArrival: true
  },
  {
    name: "AeroBuds Active Gen 2",
    price: 149.99,
    discountPrice: 129.99,
    category: "Earbuds",
    brand: "AeroBuds",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Compact wireless earbuds with deep bass, comfortable customizable ear tips, IPX7 sweatproof rating, and crystal-clear microphone calls. Perfect for active lifestyles.",
    stock: 45,
    rating: 4.5,
    numReviews: 1,
    isNewArrival: false
  },
  {
    name: "TimeSync Horizon Smartwatch",
    price: 249.99,
    discountPrice: 199.99,
    category: "Wearables",
    brand: "TimeSync",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"
    ],
    description: "A gorgeous luxury smartwatch featuring AMOLED display, heart rate monitor, SpO2 sensor, sleep tracker, integrated GPS, and up to 7 days of active battery life.",
    stock: 18,
    rating: 4.6,
    numReviews: 1,
    isNewArrival: true
  },
  {
    name: "NovaCharge 3-in-1 Dock",
    price: 99.99,
    discountPrice: 79.99,
    category: "Accessories",
    brand: "NovaCharge",
    images: [
      "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Sleek wooden and aluminum Qi fast wireless charging stand for your phone, smartwatch, and earbud case simultaneously. Minimizes clutter and complements any modern desk.",
    stock: 50,
    rating: 4.2,
    numReviews: 0,
    isNewArrival: false
  },
  {
    name: "AuraVoice Smart Speaker",
    price: 179.99,
    discountPrice: 149.99,
    category: "Speakers",
    brand: "AuraVoice",
    images: [
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Fill your room with rich, 360-degree high-fidelity audio. Features built-in voice assistants, smart home control hub, and elegant fabric finish designed to blend into any environment.",
    stock: 30,
    rating: 4.7,
    numReviews: 0,
    isNewArrival: true
  },
  {
    name: "OptimaTab Pro 11",
    price: 699.99,
    discountPrice: 599.99,
    category: "Tablets",
    brand: "OptimaTab",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Powerful 11-inch tablet with ultra-smooth 120Hz display, high performance Octa-Core chip, stylus support, and quad-speaker system. Excellent for drawing, working, or streaming.",
    stock: 12,
    rating: 4.9,
    numReviews: 0,
    isNewArrival: false
  },
  {
    name: "VividLens DSLR 4K Camera",
    price: 999.99,
    discountPrice: 899.99,
    category: "Cameras",
    brand: "VividLens",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Capture life's details in stunning 4K clarity. Includes a 18-55mm lens kit, 24.2 MP CMOS sensor, high-speed continuous autofocus, and built-in Wi-Fi / Bluetooth for instant sharing.",
    stock: 8,
    rating: 4.4,
    numReviews: 0,
    isNewArrival: false
  },
  {
    name: "CoreFocus Noise Cancelling Headband",
    price: 219.99,
    discountPrice: 179.99,
    category: "Headphones",
    brand: "SphereSound",
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Ergonomic overhead headset with premium acoustic isolating technology. Designed specifically for workplace concentration, online calls, and distraction-free learning environments.",
    stock: 15,
    rating: 4.3,
    numReviews: 0,
    isNewArrival: false
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shopsphere");
    console.log("Database connected for seeding...");

    // Clean up existing collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
    await Category.deleteMany({});
    console.log("Database cleared.");

    // Seed default categories
    const categoriesData = [
      { name: "Headphones", description: "Over-ear, on-ear headphones and headsets", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80" },
      { name: "Earbuds", description: "True wireless in-ear earbuds and accessories", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80" },
      { name: "Wearables", description: "Smartwatches, fitness bands, and trackers", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80" },
      { name: "Accessories", description: "Chargers, docking stations, and audio adapters", image: "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=800&auto=format&fit=crop&q=80" },
      { name: "Speakers", description: "Smart home assistants and portable wireless speakers", image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&auto=format&fit=crop&q=80" },
      { name: "Tablets", description: "Tablets and interactive drawing pads", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80" },
      { name: "Cameras", description: "Professional DSLRs, action cams, and lenses", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80" }
    ];
    await Category.insertMany(categoriesData);
    console.log("Categories seeded.");

    // Create Admin
    const admin = new User({
      name: "ShopSphere Admin",
      email: "admin@shopsphere.com",
      password: "admin12345", // Will be hashed via pre-save hook
      phone: "+919876543210",
      role: "admin",
      addresses: [
        {
          name: "ShopSphere Headquarters",
          phone: "+919876543210",
          addressLine1: "123 Tech Tower, Phase 1",
          addressLine2: "Cyber City",
          city: "Gurugram",
          state: "Haryana",
          zipCode: "122002",
          country: "India"
        }
      ]
    });
    await admin.save();
    console.log("Admin user seeded.");

    // Create Customer
    const customer = new User({
      name: "John Doe",
      email: "customer@shopsphere.com",
      password: "customer12345", // Will be hashed via pre-save hook
      phone: "+918888888888",
      role: "customer",
      addresses: [
        {
          name: "John Doe (Home)",
          phone: "+918888888888",
          addressLine1: "Flat 402, Sunshine Heights",
          addressLine2: "Park Avenue Road",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          country: "India"
        }
      ]
    });
    await customer.save();
    console.log("Customer user seeded.");

    // Create Cart for Admin and Customer
    await Cart.create({ userId: admin._id, items: [] });
    await Cart.create({ userId: customer._id, items: [] });
    console.log("Empty carts seeded.");

    // Create Products
    const createdProducts = await Product.insertMany(productsData);
    console.log(`${createdProducts.length} Products seeded.`);

    // Add some reviews to the first two products
    const review1 = await Review.create({
      userId: customer._id,
      userName: customer.name,
      productId: createdProducts[0]._id,
      rating: 5,
      comment: "Absolutely incredible sound! Best noise cancelling headphones I have owned. Worth every single penny."
    });

    const review2 = await Review.create({
      userId: admin._id,
      userName: admin.name,
      productId: createdProducts[0]._id,
      rating: 4,
      comment: "Decent build quality, but the active noise cancellation stands out as top-tier. Battery life is fantastic."
    });

    const review3 = await Review.create({
      userId: customer._id,
      userName: customer.name,
      productId: createdProducts[1]._id,
      rating: 4.5,
      comment: "Super convenient and comfortable for runs. Clear audio and they fit snug in ears."
    });

    const review4 = await Review.create({
      userId: customer._id,
      userName: customer.name,
      productId: createdProducts[2]._id,
      rating: 5,
      comment: "Looks and feels extremely premium. Trackers are very accurate and it syncs nicely with my phone."
    });

    console.log("Reviews seeded.");

    // Add order history for customer
    const orderItems = [
      {
        productId: createdProducts[0]._id,
        name: createdProducts[0].name,
        price: createdProducts[0].discountPrice,
        quantity: 1,
        image: createdProducts[0].images[0]
      },
      {
        productId: createdProducts[3]._id,
        name: createdProducts[3].name,
        price: createdProducts[3].discountPrice,
        quantity: 2,
        image: createdProducts[3].images[0]
      }
    ];

    const totalAmount = createdProducts[0].discountPrice + (createdProducts[3].discountPrice * 2);
    const tax = Math.round(totalAmount * 0.18);
    const shipping = 0; // free since > 1000
    const finalTotal = totalAmount + tax + shipping;

    const order = await Order.create({
      userId: customer._id,
      products: orderItems,
      shippingAddress: customer.addresses[0],
      paymentMethod: "Card",
      paymentStatus: "paid",
      shippingStatus: "delivered",
      totalAmount: finalTotal,
      paymentIntentId: "ch_mock_initial_seed"
    });

    console.log("Order history seeded.");

    // Update customer's wishlist
    customer.wishlist.push(createdProducts[1]._id);
    customer.wishlist.push(createdProducts[4]._id);
    await customer.save();
    console.log("Wishlist updated for customer.");

    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding failed:", error);
    mongoose.connection.close();
  }
};

seedDB();
