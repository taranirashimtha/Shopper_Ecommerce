require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Ensure uploads folder exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// ✅ Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ MongoDB Schemas
const Product = mongoose.model('Product', {
  id: Number,
  name: String,
  image: String,
  category: String,
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true }
});

const Users = mongoose.model('Users', {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now }
});

// ✅ Middleware: Fetch user from JWT
const fetchUser = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return res.status(401).send({ error: "No token provided" });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Invalid token" });
  }
};

// ✅ Upload Image
app.post('/upload', upload.single('product'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

  const imageUrl = `http://localhost:${process.env.PORT}/uploads/${req.file.filename}`;
  res.status(200).json({ success: true, image_url: imageUrl });
});

// ✅ Add Product
app.post('/addproduct', async (req, res) => {
  try {
    const products = await Product.find({});
    const id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
      id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price
    });

    await product.save();
    res.json({ success: true, name: product.name });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Remove Product
app.post('/removeproduct', async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get All Products
app.get('/allproducts', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Signup
app.post('/signup',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const existing = await Users.findOne({ email: req.body.email });
      if (existing) return res.status(400).json({ success: false, errors: "User already exists" });

      let cart = {};
      for (let i = 0; i < 300; i++) cart[i] = 0;

      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = new Users({
        name: req.body.username,
        email: req.body.email.trim().toLowerCase(),
        password: hashedPassword,
        cartData: cart
      });

      await user.save();
      const data = { user: { id: user._id } };
      const token = jwt.sign(data, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

// ✅ Login
app.post('/login', async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    const user = await Users.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "Email not registered" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, error: "Incorrect password" });

    const data = { user: { id: user._id } };
    const token = jwt.sign(data, process.env.JWT_SECRET);
    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ✅ Add to Cart
app.post('/addtocart', fetchUser, async (req, res) => {
  const { itemId } = req.body;
  if (!itemId) return res.status(400).json({ success: false, error: "itemId is required" });

  try {
    const user = await Users.findById(req.user.id);
    user.cartData[itemId] = (user.cartData[itemId] || 0) + 1;
    await user.save();

    res.json({ success: true, message: `Item ${itemId} added to cart` });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ✅ Remove from Cart
app.post('/removefromcart', fetchUser, async (req, res) => {
  const { itemId } = req.body;

  try {
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    if (user.cartData[itemId] > 0) {
      user.cartData[itemId] -= 1;
      await user.save();
      res.send("Removed");
    } else {
      res.status(400).send("Item not in cart or quantity is zero");
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// ✅ Update Cart
app.post('/updatecart', fetchUser, async (req, res) => {
  const { cartData } = req.body;
  try {
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    user.cartData = cartData;
    await user.save();
    res.json({ success: true, message: "Cart updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update cart" });
  }
});

// ✅ Get Cart Data
app.post('/getcart', fetchUser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, cartData: user.cartData });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ✅ New Collections
app.get('/newcollections', async (req, res) => {
  try {
    const products = await Product.find({});
    const newcollection = products.slice(-8);
    res.send(newcollection);
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
});

// ✅ Popular in Women
app.get('/popularinwomen', async (req, res) => {
  try {
    const products = await Product.find({ category: { $regex: /^women$/i } });
    const popular_in_women = products.slice(0, 4);
    res.send(popular_in_women);
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
});

// ✅ Home Route
app.get("/", (req, res) => {
  res.send("✅ Backend Server is running successfully...");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server started at http://localhost:${PORT}`);
});
