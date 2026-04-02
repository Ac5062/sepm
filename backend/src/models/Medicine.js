const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
    },
    genericName: {
      type: String,
      required: [true, 'Generic name is required'],
      trim: true,
    },
    saltComposition: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    isPrescriptionRequired: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
    },
    packaging: {
      type: String,
      required: [true, 'Packaging info is required'],
      trim: true,
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required'],
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

// Text index for fast search across name, brand, genericName
medicineSchema.index({ name: 'text', brand: 'text', genericName: 'text', saltComposition: 'text' });
medicineSchema.index({ category: 1 });
medicineSchema.index({ brand: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
