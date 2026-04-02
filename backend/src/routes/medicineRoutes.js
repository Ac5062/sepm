const express = require('express');
const { body }  = require('express-validator');
const {
  getMedicines,
  getMedicineById,
  getAlternatives,
  getCategories,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// ── Validation rules ──────────────────────────────────────
const medicineRules = [
  body('name').notEmpty().withMessage('Medicine name is required'),
  body('brand').notEmpty().withMessage('Brand name is required'),
  body('genericName').notEmpty().withMessage('Generic name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('dosage').notEmpty().withMessage('Dosage is required'),
  body('packaging').notEmpty().withMessage('Packaging info is required'),
  body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
  body('description').notEmpty().withMessage('Description is required'),
];

// ── Public routes ─────────────────────────────────────────
router.get('/',               getMedicines);
router.get('/categories',     getCategories);
router.get('/:id',            getMedicineById);
router.get('/:id/alternatives', getAlternatives);

// ── Admin-only routes ─────────────────────────────────────
router.post('/',    protect, adminOnly, medicineRules, createMedicine);
router.put('/:id',  protect, adminOnly, medicineRules, updateMedicine);
router.delete('/:id', protect, adminOnly, deleteMedicine);

module.exports = router;
