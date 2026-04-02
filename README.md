# Affordable Medicine Alternative - Complete Frontend Application

A comprehensive healthcare web application that helps users search medicines, find affordable generic alternatives, compare prices across pharmacies, and manage medication reminders. Built with React, TypeScript, Tailwind CSS, and a professional blue-themed healthcare design system.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 Features

### ✅ Complete Feature Set

#### 🔐 Authentication System
- User registration and login
- Forgot password functionality
- Protected routes with role-based access
- Admin and user roles
- JWT token-based authentication

#### 📊 Dashboard
- Personalized welcome screen
- Quick action cards (Search, Compare Prices, Nearby Pharmacy, Med Reminders, Prescription Info)
- Analytics cards showing savings, searches, and orders
- **Data Visualization Charts:**
  - Medicine Categories Distribution (Pie Chart)
  - Weekly Activity Trends (Line Chart)
  - Brand vs Generic Price Comparison (Bar Chart)

#### 💊 Medicine Management
- Advanced search with real-time filtering
- Category and price filters
- Sort by relevance, price, or rating
- Detailed medicine information pages
- Generic alternative suggestions with savings calculations
- Price comparison across multiple pharmacies
- Prescription requirement warnings
- User reviews and ratings
- **Medicine Detail Charts:**
  - Price Trends Over Time (Line Chart)
  - Rating Distribution (Bar Chart)
  - Pharmacy Comparison (Radar Chart)

#### 🏥 Pharmacy Finder
- Location-based pharmacy search
- Distance filtering
- Open/closed status indicators
- Contact information and directions
- Map integration ready

#### ⏰ Medication Reminders (NEW!)
- Create custom medication schedules
- Flexible frequency options (1-4 times daily)
- Multiple time slots per day
- Start and end dates
- Special instructions support
- Active/Inactive toggle
- Edit and delete reminders
- **Reminder Analytics:**
  - Frequency Distribution Chart
  - Time Distribution Chart
- LocalStorage persistence per user

#### 👨‍💼 Admin Panel
- Medicine database management (CRUD)
- Pharmacy management
- Analytics dashboard
- Data visualization

### 🎨 Design System

- **Primary Color:** Medical Blue (#1E88E5)
- **Secondary Color:** Emerald Green (#00A86B)
- **Accent Color:** Soft Orange (#FF9800)
- **Border Radius:** 12px rounded corners
- **Fully Responsive:** Mobile, Tablet, Desktop
- **Professional Healthcare Aesthetic**
- **Smooth Animations** using Motion (Framer Motion)

---

## 📁 Project Structure

```
affordable-medicine-frontend/
├── public/                          # Static assets
├── src/
│   ├── app/
│   │   ├── App.tsx                 # Main app with routing
│   │   └── components/
│   │       ├── figma/              # Figma components
│   │       └── ui/                 # 40+ Shadcn UI components
│   ├── contexts/
│   │   └── AuthContext.tsx         # Authentication context
│   ├── data/
│   │   └── mockData.ts            # Mock data (replace with API)
│   ├── pages/                      # 10 page components
│   │   ├── AdminPanel.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── Login.tsx
│   │   ├── MedicineDetail.tsx
│   │   ├── MedicineSearch.tsx
│   │   ├── PharmacyFinder.tsx
│   │   ├── Register.tsx
│   │   ├── Reminders.tsx          # ⭐ Medication reminder system
│   │   └── SplashScreen.tsx
│   ├── services/                   # API service layer (to be created)
│   ├── styles/                     # CSS and theme files
│   ├── types/                      # TypeScript definitions (to be created)
│   └── main.tsx                    # Entry point
├─��� .env                            # Environment variables
├── package.json                    # Dependencies
├── vite.config.ts                 # Vite configuration
├── BACKEND_INTEGRATION_GUIDE.md   # 📚 Backend integration docs
├── API_SERVICE_IMPLEMENTATION.md  # 📚 API service layer guide
├── COMPLETE_SETUP_GUIDE.md        # 📚 Setup and deployment guide
├── COMPLETE_SOURCE_CODE.md        # 📚 Source code reference
└── README.md                       # This file
```

---

## 🛠️ Technology Stack

### Frontend Framework
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **React Router 7.13.0** - Routing

### Styling
- **Tailwind CSS 4.1.12** - Utility-first CSS
- **Shadcn UI** - Component library
- **Motion (Framer Motion)** - Animations

### Data Visualization
- **Recharts 2.15.2** - Charts and graphs

### UI Components
- **Radix UI** - Accessible components
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### HTTP Client (for backend integration)
- **Axios** - API requests

### Development
- **Vite 6.3.5** - Build tool
- **PostCSS** - CSS processing

---

## 📦 Installation

### Prerequisites
- Node.js 18+ or higher
- npm 9+ or pnpm 8+

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Install Axios (required for backend integration)
npm install axios

# 3. Create environment file
cp .env.example .env

# 4. Update API URL in .env
VITE_API_BASE_URL=http://localhost:3000/api

# 5. Run development server
npm run dev

# 6. Open browser
# Navigate to http://localhost:5173
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Application
VITE_APP_NAME=Affordable Medicine Alternative
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
```

---

## 🎯 Demo Credentials

**User Account:**
- Email: `user@demo.com`
- Password: `password`

**Admin Account:**
- Email: `admin@demo.com`
- Password: `admin`

---

## 🔌 Backend Integration

### Step 1: Review Documentation

Read these files in order:
1. **BACKEND_INTEGRATION_GUIDE.md** - Database schema and API specifications
2. **API_SERVICE_IMPLEMENTATION.md** - Service layer implementation
3. **COMPLETE_SETUP_GUIDE.md** - Setup and deployment guide

### Step 2: Database Schema

Your backend needs these tables:
- `users` - User accounts
- `medicines` - Medicine catalog
- `pharmacies` - Pharmacy locations
- `medicine_prices` - Price information
- `alternatives` - Generic alternatives
- `reviews` - User reviews
- `medication_reminders` - Reminder schedules

Complete SQL schema in **BACKEND_INTEGRATION_GUIDE.md**.

### Step 3: API Endpoints

Implement these endpoints:

**Authentication:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`

**Medicines:**
- `GET /api/medicines` (with pagination and filters)
- `GET /api/medicines/:id`
- `GET /api/medicines/:id/alternatives`
- `GET /api/medicines/:id/prices`
- `GET /api/medicines/:id/reviews`
- `POST /api/medicines` (admin)
- `PUT /api/medicines/:id` (admin)
- `DELETE /api/medicines/:id` (admin)

**Pharmacies:**
- `GET /api/pharmacies` (with location filters)
- `GET /api/pharmacies/:id`
- `POST /api/pharmacies` (admin)
- `PUT /api/pharmacies/:id` (admin)
- `DELETE /api/pharmacies/:id` (admin)

**Reminders:**
- `GET /api/reminders`
- `POST /api/reminders`
- `PUT /api/reminders/:id`
- `DELETE /api/reminders/:id`
- `PATCH /api/reminders/:id/toggle`

Complete API specifications in **BACKEND_INTEGRATION_GUIDE.md**.

### Step 4: Create Service Layer

Create these files based on **API_SERVICE_IMPLEMENTATION.md**:

```
src/services/
├── api.ts                   # Base API client with interceptors
├── auth.service.ts          # Authentication API calls
├── medicine.service.ts      # Medicine-related API calls
├── pharmacy.service.ts      # Pharmacy-related API calls
└── reminder.service.ts      # Reminder API calls
```

### Step 5: Update AuthContext

Replace mock authentication in `/src/contexts/AuthContext.tsx` with real API calls using the auth service.

### Step 6: Update Page Components

Replace mock data imports with API service calls:

```typescript
// Before (Mock)
import { medicines } from '../data/mockData';

// After (API)
import { medicineService } from '../services/medicine.service';
const [medicines, setMedicines] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await medicineService.searchMedicines({});
      setMedicines(response.data.items);
    } catch (error) {
      console.error(error);
    }
  };
  fetchData();
}, []);
```

---

## 📱 Key Pages Overview

### 1. Dashboard (`/dashboard`)
- Welcome message
- Search bar
- 5 Quick action cards
- Popular medicines
- Analytics with 3 charts

### 2. Medicine Search (`/search`)
- Search with filters
- Category selection
- Sort options
- Results grid

### 3. Medicine Detail (`/medicine/:id`)
- Detailed information
- Alternative suggestions
- Price comparison table
- Reviews section
- 3 analytical charts

### 4. Pharmacy Finder (`/pharmacies`)
- Location search
- Distance filter
- Pharmacy cards
- Contact information

### 5. Reminders (`/reminders`) ⭐ NEW!
- Create/Edit/Delete reminders
- Frequency configuration
- Time management
- Statistics and charts
- Active/Inactive toggle

### 6. Admin Panel (`/admin`)
- Medicine management
- Pharmacy management
- Analytics dashboard

---

## 🏗️ Building for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

Build output will be in the `/dist` folder.

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Docker

```bash
docker build -t affordable-medicine .
docker run -p 80:80 affordable-medicine
```

See **COMPLETE_SETUP_GUIDE.md** for detailed deployment instructions.

---

## 📊 Data Visualization

The application includes comprehensive data visualization:

### Dashboard Charts
1. **Medicine Categories Distribution** - Pie chart showing category breakdown
2. **Weekly Activity** - Line chart showing searches and orders over time
3. **Brand vs Generic Comparison** - Bar chart comparing prices

### Medicine Detail Charts
1. **Price Trends** - Line chart showing price changes
2. **Rating Distribution** - Bar chart of rating frequencies
3. **Pharmacy Comparison** - Radar chart comparing pharmacy metrics

### Reminder Charts
1. **Frequency Distribution** - Pie chart of reminder frequencies
2. **Time Distribution** - Bar chart of medication times throughout the day

### Admin Panel Charts
- Category distribution
- Price trends
- Pharmacy ratings

---

## 🔐 Security Features

### Frontend Security
- ✅ JWT token storage
- ✅ Protected routes
- ✅ Input validation
- ✅ XSS prevention

### Backend Requirements
- Password hashing (bcrypt)
- SQL injection prevention
- CSRF protection
- Rate limiting
- HTTPS enforcement

---

## 📚 Documentation Files

1. **README.md** (this file) - Overview and quick start
2. **BACKEND_INTEGRATION_GUIDE.md** - Complete backend integration guide
   - Database schema
   - API endpoints
   - Security considerations
3. **API_SERVICE_IMPLEMENTATION.md** - Service layer implementation
   - Complete service files
   - Error handling
   - Usage examples
4. **COMPLETE_SETUP_GUIDE.md** - Setup and deployment
   - Installation steps
   - Environment configuration
   - Deployment options
5. **COMPLETE_SOURCE_CODE.md** - Source code reference
   - File structure
   - Configuration files
   - Feature checklist

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Authentication flow (register, login, logout)
- [ ] Dashboard features
- [ ] Medicine search and filters
- [ ] Medicine detail page
- [ ] Pharmacy finder
- [ ] Reminder CRUD operations
- [ ] Admin panel (with admin account)
- [ ] Responsive design (mobile, tablet, desktop)

---

## 🛣️ Roadmap

### Current Version (v1.0.0)
- ✅ Complete UI/UX
- ✅ All page components
- ✅ Medication reminders
- ✅ Data visualization
- ✅ Responsive design

### Pending (Requires Backend)
- [ ] Real database integration
- [ ] Email/SMS notifications
- [ ] Push notifications
- [ ] Payment processing
- [ ] Advanced analytics
- [ ] Real-time updates

---

## 💡 Key Technologies Explained

### Why React?
- Component-based architecture
- Large ecosystem
- Excellent performance
- TypeScript support

### Why Tailwind CSS?
- Utility-first approach
- Fast development
- Small bundle size
- Easy customization

### Why Recharts?
- React-friendly
- Responsive charts
- Easy to use
- Good documentation

### Why Vite?
- Fast HMR
- Optimized builds
- Great DX
- Modern tooling

---

## 📞 Support

For questions or issues:
- Review the documentation files
- Check browser console for errors
- Verify API connectivity
- Test with demo credentials first

---

## 🤝 Contributing

This is a complete frontend application ready for backend integration. To contribute:

1. Review existing code
2. Follow the established patterns
3. Maintain the blue healthcare theme
4. Test thoroughly
5. Update documentation

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 Getting Started Now

1. **Read this README** ✓
2. **Install dependencies:** `npm install && npm install axios`
3. **Review BACKEND_INTEGRATION_GUIDE.md** for database schema
4. **Review API_SERVICE_IMPLEMENTATION.md** for API layer
5. **Create your backend** following the specifications
6. **Connect frontend to backend** using service layer
7. **Test and deploy!**

---

## 📸 Features at a Glance

### Medication Reminders System
- ✅ Create reminders with custom schedules
- ✅ 1-4 times daily frequency options
- ✅ Flexible time selection
- ✅ Start/End date management
- ✅ Special instructions field
- ✅ Active/Inactive toggle
- ✅ Edit and delete functionality
- ✅ Statistics dashboard
- ✅ Visual charts (frequency & time distribution)
- ✅ Blue-themed healthcare design
- ✅ Fully responsive

### Dashboard
- ✅ 5 Quick action cards
- ✅ Search integration
- ✅ Analytics cards
- ✅ 3 Data visualization charts
- ✅ Recent medicine listings

### Medicine Management
- ✅ Advanced search
- ✅ Category & price filters
- ✅ Alternative suggestions
- ✅ Price comparison
- ✅ Reviews & ratings
- ✅ 3 Analytical charts per medicine

### Admin Panel
- ✅ Medicine CRUD operations
- ✅ Pharmacy management
- ✅ Analytics dashboard
- ✅ Data visualization

---

## 🌟 Special Thanks

This application is built with modern best practices and ready for production use. All code is well-documented and follows industry standards.

**Happy Coding! 🚀**
