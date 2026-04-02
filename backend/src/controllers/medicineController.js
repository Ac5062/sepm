const { validationResult } = require('express-validator');
const Medicine = require('../models/Medicine');

// ── GET /api/medicines ─────────────────────────────────────
// Public. Supports: ?q=keyword&category=X&sortBy=price-low&page=1&limit=10
const getMedicines = async (req, res) => {
  try {
    const { q, category, sortBy, page = 1, limit = 10 } = req.query;

    const query = {};

    // Full-text search
    if (q) {
      query.$text = { $search: q };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Sort
    let sortOption = {};
    if (sortBy === 'price-low')  sortOption = { price: 1 };
    else if (sortBy === 'price-high') sortOption = { price: -1 };
    else if (sortBy === 'rating')     sortOption = { rating: -1 };
    else if (q) sortOption = { score: { $meta: 'textScore' } }; // relevance

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Medicine.countDocuments(query);

    const medicines = await Medicine.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data:       medicines,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching medicines.' });
  }
};

// ── GET /api/medicines/:id ─────────────────────────────────
// Public.
const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }
    res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching medicine.' });
  }
};

// ── GET /api/medicines/:id/alternatives ───────────────────
// Public. Returns medicines with same genericName and lower price.
const getAlternatives = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    const alternatives = await Medicine.find({
      genericName: medicine.genericName,
      _id:         { $ne: medicine._id },
      price:       { $lt: medicine.price },
    }).sort({ price: 1 });

    res.status(200).json({ success: true, data: alternatives });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching alternatives.' });
  }
};

// ── GET /api/medicines/categories ─────────────────────────
// Public. Returns distinct category list.
const getCategories = async (req, res) => {
  try {
    const categories = await Medicine.distinct('category');
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching categories.' });
  }
};

// ── POST /api/medicines ───────────────────────────────────
// Admin only.
const createMedicine = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  try {
    // Duplicate check: same brand + dosage
    const duplicate = await Medicine.findOne({
      brand: { $regex: new RegExp(`^${req.body.brand}$`, 'i') },
      dosage: { $regex: new RegExp(`^${req.body.dosage}$`, 'i') },
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `"${req.body.brand} ${req.body.dosage}" already exists in the database.`,
      });
    }

    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating medicine.' });
  }
};

// ── PUT /api/medicines/:id ────────────────────────────────
// Admin only.
const updateMedicine = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  try {
    // Duplicate check: same brand + dosage, but not itself
    if (req.body.brand && req.body.dosage) {
      const duplicate = await Medicine.findOne({
        _id:   { $ne: req.params.id },
        brand:  { $regex: new RegExp(`^${req.body.brand}$`, 'i') },
        dosage: { $regex: new RegExp(`^${req.body.dosage}$`, 'i') },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `"${req.body.brand} ${req.body.dosage}" already exists.`,
        });
      }
    }

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating medicine.' });
  }
};

// ── DELETE /api/medicines/:id ─────────────────────────────
// Admin only.
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }
    res.status(200).json({ success: true, message: 'Medicine deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting medicine.' });
  }
};

module.exports = {
  getMedicines,
  getMedicineById,
  getAlternatives,
  getCategories,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};
