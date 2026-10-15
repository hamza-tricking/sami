const express = require('express');
const Product = require('../models/Product');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Helper to sanitize ingredients input (array or comma-delimited string)
const parseIngredients = (input) => {
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

// @route   GET /api/products
// @desc    Fetch products with optional filters (homeOnly, category, availability, search)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { homeOnly, availableOnly, category, search } = req.query;
    const filter = {};

    if (homeOnly === 'true') {
      filter.displayOnHome = true;
    }

    if (availableOnly === 'true') {
      filter.isAvailable = true;
    }

    if (category && ['tartlet', 'cookies', 'beignet'].includes(category)) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error('Fetch products error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products',
      error: err.message,
    });
  }
});

// @route   GET /api/products/:id
// @desc    Fetch a single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product',
      error: err.message,
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin only)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      ingredients,
      price,
      category,
      image,
      images,
      isAvailable,
      displayOnHome,
      badge,
      order,
    } = req.body;

    if (!name || !description || price === undefined || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, description, price, category, image)',
      });
    }

    const newProduct = await Product.create({
      name,
      description,
      ingredients: parseIngredients(ingredients),
      price: Number(price),
      category,
      image,
      images: Array.isArray(images) ? images : image ? [image] : [],
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      displayOnHome: displayOnHome !== undefined ? Boolean(displayOnHome) : true,
      badge: badge || '',
      order: order !== undefined ? Number(order) : 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct,
    });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(400).json({
      success: false,
      message: 'Failed to create product',
      error: err.message,
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update an existing product
// @access  Private (Admin only)
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.ingredients !== undefined) {
      updates.ingredients = parseIngredients(updates.ingredients);
    }
    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
    }
    if (updates.isAvailable !== undefined) {
      updates.isAvailable = Boolean(updates.isAvailable);
    }
    if (updates.displayOnHome !== undefined) {
      updates.displayOnHome = Boolean(updates.displayOnHome);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Failed to update product',
      error: err.message,
    });
  }
});

// @route   PATCH /api/products/:id/toggle-home
// @desc    Quick toggle whether product displays on home page
// @access  Private (Admin only)
router.patch('/:id/toggle-home', protect, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.displayOnHome = !product.displayOnHome;
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Product ${product.displayOnHome ? 'added to' : 'removed from'} home page`,
      data: product,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle home display status',
      error: err.message,
    });
  }
});

// @route   PATCH /api/products/:id/toggle-available
// @desc    Quick toggle product availability status
// @access  Private (Admin only)
router.patch('/:id/toggle-available', protect, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Product marked as ${product.isAvailable ? 'available' : 'unavailable'}`,
      data: product,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle availability status',
      error: err.message,
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: { id: req.params.id },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: err.message,
    });
  }
});

module.exports = router;
