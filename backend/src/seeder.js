/**
 * Database Seeder
 * Run with:  node src/seeder.js
 * To clear:  node src/seeder.js --clear
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const connectDB = require('../config/db');
const User      = require('./models/User');
const Medicine  = require('./models/Medicine');

// ── Seed data (mirrors mockData.ts) ──────────────────────
const seedMedicines = [
  { name: 'Paracetamol 500mg', brand: 'Crocin',    genericName: 'Paracetamol',   saltComposition: ['Paracetamol 500mg'],               price: 45.50, isPrescriptionRequired: false, category: 'Pain Relief',  dosage: '500mg',  packaging: '15 tablets',  manufacturer: 'GlaxoSmithKline', rating: 4.5, reviews: 1245, inStock: true,  description: 'Effective pain relief and fever reducer. Suitable for headaches, body aches, and fever.' },
  { name: 'Paracetamol 500mg', brand: 'Dolo',      genericName: 'Paracetamol',   saltComposition: ['Paracetamol 500mg'],               price: 28.00, isPrescriptionRequired: false, category: 'Pain Relief',  dosage: '500mg',  packaging: '15 tablets',  manufacturer: 'Micro Labs',      rating: 4.3, reviews: 892,  inStock: true,  description: 'Affordable generic alternative for pain and fever relief.' },
  { name: 'Amoxicillin 500mg', brand: 'Novamox',   genericName: 'Amoxicillin',   saltComposition: ['Amoxicillin 500mg'],               price: 125.00,isPrescriptionRequired: true,  category: 'Antibiotic',   dosage: '500mg',  packaging: '10 capsules', manufacturer: 'Cipla',           rating: 4.7, reviews: 567,  inStock: true,  description: 'Broad-spectrum antibiotic for bacterial infections. Prescription required.' },
  { name: 'Metformin 500mg',   brand: 'Glycomet',  genericName: 'Metformin',     saltComposition: ['Metformin Hydrochloride 500mg'],   price: 85.00, isPrescriptionRequired: true,  category: 'Diabetes',     dosage: '500mg',  packaging: '30 tablets',  manufacturer: 'USV Ltd',         rating: 4.6, reviews: 2341, inStock: true,  description: 'Used to control blood sugar levels in type 2 diabetes. Prescription required.' },
  { name: 'Metformin 500mg',   brand: 'Obimet',    genericName: 'Metformin',     saltComposition: ['Metformin Hydrochloride 500mg'],   price: 62.00, isPrescriptionRequired: true,  category: 'Diabetes',     dosage: '500mg',  packaging: '30 tablets',  manufacturer: 'Mankind Pharma',  rating: 4.4, reviews: 1876, inStock: true,  description: 'Affordable alternative for diabetes management.' },
  { name: 'Atorvastatin 10mg', brand: 'Lipitor',   genericName: 'Atorvastatin',  saltComposition: ['Atorvastatin Calcium 10mg'],       price: 245.00,isPrescriptionRequired: true,  category: 'Cholesterol',  dosage: '10mg',   packaging: '30 tablets',  manufacturer: 'Pfizer',          rating: 4.8, reviews: 3421, inStock: true,  description: 'Reduces cholesterol and prevents cardiovascular disease. Prescription required.' },
  { name: 'Atorvastatin 10mg', brand: 'Atorva',    genericName: 'Atorvastatin',  saltComposition: ['Atorvastatin Calcium 10mg'],       price: 98.00, isPrescriptionRequired: true,  category: 'Cholesterol',  dosage: '10mg',   packaging: '30 tablets',  manufacturer: 'Zydus Cadila',    rating: 4.5, reviews: 2156, inStock: true,  description: 'Generic alternative for cholesterol management with significant savings.' },
  { name: 'Cetirizine 10mg',   brand: 'Zyrtec',    genericName: 'Cetirizine',    saltComposition: ['Cetirizine Hydrochloride 10mg'],   price: 68.00, isPrescriptionRequired: false, category: 'Allergy',      dosage: '10mg',   packaging: '10 tablets',  manufacturer: 'Johnson & Johnson',rating: 4.6, reviews: 1534, inStock: true,  description: 'Antihistamine for allergy relief including hay fever and skin allergies.' },
  { name: 'Cetirizine 10mg',   brand: 'Okacet',    genericName: 'Cetirizine',    saltComposition: ['Cetirizine Hydrochloride 10mg'],   price: 32.00, isPrescriptionRequired: false, category: 'Allergy',      dosage: '10mg',   packaging: '10 tablets',  manufacturer: 'Cipla',           rating: 4.4, reviews: 987,  inStock: true,  description: 'Affordable generic allergy relief medication.' },
  { name: 'Omeprazole 20mg',   brand: 'Prilosec',  genericName: 'Omeprazole',    saltComposition: ['Omeprazole 20mg'],                 price: 156.00,isPrescriptionRequired: false, category: 'Gastric',      dosage: '20mg',   packaging: '15 capsules', manufacturer: 'AstraZeneca',     rating: 4.7, reviews: 2876, inStock: true,  description: 'Proton pump inhibitor for acid reflux and gastric ulcers.' },
];

const seedUsers = [
  { name: 'Demo User',  email: 'user@demo.com',  phone: '+919876543210', password: 'password', role: 'user'  },
  { name: 'Admin User', email: 'admin@demo.com', phone: '+919876543211', password: 'adminnn',    role: 'admin' },
];

const seed = async () => {
  await connectDB();

  if (process.argv[2] === '--clear') {
    await Medicine.deleteMany();
    await User.deleteMany();
    console.log('🗑️  Database cleared.');
    process.exit(0);
  }

  try {
    // Clear existing data
    await Medicine.deleteMany();
    await User.deleteMany();

    // Insert medicines
    await Medicine.insertMany(seedMedicines);
    console.log(`✅ ${seedMedicines.length} medicines seeded`);

    // Insert users (passwords hashed by the pre-save hook)
    for (const u of seedUsers) {
      await User.create(u);
    }
    console.log(`✅ ${seedUsers.length} users seeded`);
    console.log('\n🎉 Database seeded successfully!');
    console.log('   user@demo.com  / password');
    console.log('   admin@demo.com / adminnn\n');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  }

  process.exit(0);
};

seed();
