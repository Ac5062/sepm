export interface Medicine {
  id: string;
  name: string;
  brand: string;
  genericName: string;
  saltComposition: string[];
  price: number;
  isPrescriptionRequired: boolean;
  category: string;
  dosage: string;
  packaging: string;
  manufacturer: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  description: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: number;
  phone: string;
  lat: number;
  lng: number;
  isOpen: boolean;
  openingHours: string;
  ratings: number;
}

export interface MedicinePrice {
  medicineId: string;
  pharmacyId: string;
  price: number;
  discount: number;
  finalPrice: number;
  inStock: boolean;
}

export interface Alternative {
  id: string;
  originalMedicineId: string;
  alternativeMedicineId: string;
  savingsPercent: number;
  savingsAmount: number;
}

export interface Review {
  id: string;
  medicineId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export const medicines: Medicine[] = [
  {
    id: "m1",
    name: "Paracetamol 500mg",
    brand: "Crocin",
    genericName: "Paracetamol",
    saltComposition: ["Paracetamol 500mg"],
    price: 45.50,
    isPrescriptionRequired: false,
    category: "Pain Relief",
    dosage: "500mg",
    packaging: "15 tablets",
    manufacturer: "GlaxoSmithKline",
    rating: 4.5,
    reviews: 1245,
    inStock: true,
    description: "Effective pain relief and fever reducer. Suitable for headaches, body aches, and fever."
  },
  {
    id: "m2",
    name: "Paracetamol 500mg",
    brand: "Dolo",
    genericName: "Paracetamol",
    saltComposition: ["Paracetamol 500mg"],
    price: 28.00,
    isPrescriptionRequired: false,
    category: "Pain Relief",
    dosage: "500mg",
    packaging: "15 tablets",
    manufacturer: "Micro Labs",
    rating: 4.3,
    reviews: 892,
    inStock: true,
    description: "Affordable generic alternative for pain and fever relief."
  },
  {
    id: "m3",
    name: "Amoxicillin 500mg",
    brand: "Novamox",
    genericName: "Amoxicillin",
    saltComposition: ["Amoxicillin 500mg"],
    price: 125.00,
    isPrescriptionRequired: true,
    category: "Antibiotic",
    dosage: "500mg",
    packaging: "10 capsules",
    manufacturer: "Cipla",
    rating: 4.7,
    reviews: 567,
    inStock: true,
    description: "Broad-spectrum antibiotic for bacterial infections. Prescription required."
  },
  {
    id: "m4",
    name: "Metformin 500mg",
    brand: "Glycomet",
    genericName: "Metformin",
    saltComposition: ["Metformin Hydrochloride 500mg"],
    price: 85.00,
    isPrescriptionRequired: true,
    category: "Diabetes",
    dosage: "500mg",
    packaging: "30 tablets",
    manufacturer: "USV Ltd",
    rating: 4.6,
    reviews: 2341,
    inStock: true,
    description: "Used to control blood sugar levels in type 2 diabetes. Prescription required."
  },
  {
    id: "m5",
    name: "Metformin 500mg",
    brand: "Obimet",
    genericName: "Metformin",
    saltComposition: ["Metformin Hydrochloride 500mg"],
    price: 62.00,
    isPrescriptionRequired: true,
    category: "Diabetes",
    dosage: "500mg",
    packaging: "30 tablets",
    manufacturer: "Mankind Pharma",
    rating: 4.4,
    reviews: 1876,
    inStock: true,
    description: "Affordable alternative for diabetes management."
  },
  {
    id: "m6",
    name: "Atorvastatin 10mg",
    brand: "Lipitor",
    genericName: "Atorvastatin",
    saltComposition: ["Atorvastatin Calcium 10mg"],
    price: 245.00,
    isPrescriptionRequired: true,
    category: "Cholesterol",
    dosage: "10mg",
    packaging: "30 tablets",
    manufacturer: "Pfizer",
    rating: 4.8,
    reviews: 3421,
    inStock: true,
    description: "Reduces cholesterol and prevents cardiovascular disease. Prescription required."
  },
  {
    id: "m7",
    name: "Atorvastatin 10mg",
    brand: "Atorva",
    genericName: "Atorvastatin",
    saltComposition: ["Atorvastatin Calcium 10mg"],
    price: 98.00,
    isPrescriptionRequired: true,
    category: "Cholesterol",
    dosage: "10mg",
    packaging: "30 tablets",
    manufacturer: "Zydus Cadila",
    rating: 4.5,
    reviews: 2156,
    inStock: true,
    description: "Generic alternative for cholesterol management with significant savings."
  },
  {
    id: "m8",
    name: "Cetirizine 10mg",
    brand: "Zyrtec",
    genericName: "Cetirizine",
    saltComposition: ["Cetirizine Hydrochloride 10mg"],
    price: 68.00,
    isPrescriptionRequired: false,
    category: "Allergy",
    dosage: "10mg",
    packaging: "10 tablets",
    manufacturer: "Johnson & Johnson",
    rating: 4.6,
    reviews: 1534,
    inStock: true,
    description: "Antihistamine for allergy relief including hay fever and skin allergies."
  },
  {
    id: "m9",
    name: "Cetirizine 10mg",
    brand: "Okacet",
    genericName: "Cetirizine",
    saltComposition: ["Cetirizine Hydrochloride 10mg"],
    price: 32.00,
    isPrescriptionRequired: false,
    category: "Allergy",
    dosage: "10mg",
    packaging: "10 tablets",
    manufacturer: "Cipla",
    rating: 4.4,
    reviews: 987,
    inStock: true,
    description: "Affordable generic allergy relief medication."
  },
  {
    id: "m10",
    name: "Omeprazole 20mg",
    brand: "Prilosec",
    genericName: "Omeprazole",
    saltComposition: ["Omeprazole 20mg"],
    price: 156.00,
    isPrescriptionRequired: false,
    category: "Gastric",
    dosage: "20mg",
    packaging: "15 capsules",
    manufacturer: "AstraZeneca",
    rating: 4.7,
    reviews: 2876,
    inStock: true,
    description: "Proton pump inhibitor for acid reflux and gastric ulcers."
  }
];

export const pharmacies: Pharmacy[] = [
  {
    id: "p1",
    name: "HealthPlus Pharmacy",
    address: "123 Main Street, Downtown",
    distance: 0.8,
    phone: "+91-98765-43210",
    lat: 28.6139,
    lng: 77.2090,
    isOpen: true,
    openingHours: "8:00 AM - 10:00 PM",
    ratings: 4.5
  },
  {
    id: "p2",
    name: "MedCare Drugstore",
    address: "456 Park Avenue, Central",
    distance: 1.2,
    phone: "+91-98765-43211",
    lat: 28.6129,
    lng: 77.2295,
    isOpen: true,
    openingHours: "24 Hours",
    ratings: 4.7
  },
  {
    id: "p3",
    name: "Apollo Pharmacy",
    address: "789 Lake Road, Eastside",
    distance: 2.1,
    phone: "+91-98765-43212",
    lat: 28.6280,
    lng: 77.2177,
    isOpen: true,
    openingHours: "7:00 AM - 11:00 PM",
    ratings: 4.8
  },
  {
    id: "p4",
    name: "Quick Meds",
    address: "321 Hill Street, Westside",
    distance: 2.8,
    phone: "+91-98765-43213",
    lat: 28.5355,
    lng: 77.3910,
    isOpen: false,
    openingHours: "9:00 AM - 9:00 PM",
    ratings: 4.2
  },
  {
    id: "p5",
    name: "City Pharmacy",
    address: "555 River Road, Northside",
    distance: 3.5,
    phone: "+91-98765-43214",
    lat: 28.7041,
    lng: 77.1025,
    isOpen: true,
    openingHours: "8:00 AM - 10:00 PM",
    ratings: 4.6
  }
];

export const medicinePrices: MedicinePrice[] = [
  { medicineId: "m1", pharmacyId: "p1", price: 45.50, discount: 0, finalPrice: 45.50, inStock: true },
  { medicineId: "m1", pharmacyId: "p2", price: 45.50, discount: 10, finalPrice: 40.95, inStock: true },
  { medicineId: "m1", pharmacyId: "p3", price: 48.00, discount: 5, finalPrice: 45.60, inStock: true },
  { medicineId: "m2", pharmacyId: "p1", price: 28.00, discount: 0, finalPrice: 28.00, inStock: true },
  { medicineId: "m2", pharmacyId: "p2", price: 28.00, discount: 15, finalPrice: 23.80, inStock: true },
  { medicineId: "m3", pharmacyId: "p1", price: 125.00, discount: 0, finalPrice: 125.00, inStock: true },
  { medicineId: "m3", pharmacyId: "p3", price: 122.00, discount: 8, finalPrice: 112.24, inStock: true },
  { medicineId: "m4", pharmacyId: "p2", price: 85.00, discount: 12, finalPrice: 74.80, inStock: true },
  { medicineId: "m5", pharmacyId: "p2", price: 62.00, discount: 10, finalPrice: 55.80, inStock: true },
  { medicineId: "m6", pharmacyId: "p3", price: 245.00, discount: 5, finalPrice: 232.75, inStock: true },
  { medicineId: "m7", pharmacyId: "p3", price: 98.00, discount: 15, finalPrice: 83.30, inStock: true }
];

export const alternatives: Alternative[] = [
  {
    id: "a1",
    originalMedicineId: "m1",
    alternativeMedicineId: "m2",
    savingsPercent: 38,
    savingsAmount: 17.50
  },
  {
    id: "a2",
    originalMedicineId: "m4",
    alternativeMedicineId: "m5",
    savingsPercent: 27,
    savingsAmount: 23.00
  },
  {
    id: "a3",
    originalMedicineId: "m6",
    alternativeMedicineId: "m7",
    savingsPercent: 60,
    savingsAmount: 147.00
  },
  {
    id: "a4",
    originalMedicineId: "m8",
    alternativeMedicineId: "m9",
    savingsPercent: 53,
    savingsAmount: 36.00
  }
];

export const reviews: Review[] = [
  {
    id: "r1",
    medicineId: "m1",
    userName: "Rahul Sharma",
    rating: 5,
    comment: "Very effective for headaches. Works within 30 minutes.",
    date: "2026-02-10"
  },
  {
    id: "r2",
    medicineId: "m1",
    userName: "Priya Patel",
    rating: 4,
    comment: "Good medicine, but a bit expensive compared to generics.",
    date: "2026-02-08"
  },
  {
    id: "r3",
    medicineId: "m2",
    userName: "Amit Kumar",
    rating: 5,
    comment: "Best value for money. Works just as well as branded versions.",
    date: "2026-02-12"
  },
  {
    id: "r4",
    medicineId: "m4",
    userName: "Sneha Reddy",
    rating: 5,
    comment: "Excellent for diabetes management. My doctor recommended it.",
    date: "2026-02-05"
  }
];
