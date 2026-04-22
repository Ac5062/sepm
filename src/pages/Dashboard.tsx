import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from 'next-themes';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Badge } from '../app/components/ui/badge';
import { Skeleton } from '../app/components/ui/skeleton';
import { Search, Pill, DollarSign, MapPin, FileText, LogOut, User, Moon, Sun, TrendingUp, ShoppingCart, Activity, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { medicineApi, type Medicine } from '../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [popularMedicines, setPopularMedicines] = useState<Medicine[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const { theme, setTheme } = useTheme();
  const darkMode = theme === 'dark';
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch popular medicines on mount
  useEffect(() => {
    medicineApi.getAll({ limit: 3 })
      .then(res => setPopularMedicines(res.data))
      .catch(() => {}) // fail silently — dashboard still works
      .finally(() => setLoadingPopular(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // popularMedicines is populated from the API

  const quickActions = [
    {
      icon: Search,
      title: 'Search Medicine',
      description: 'Find any medicine quickly',
      onClick: () => document.getElementById('search-input')?.focus(),
      color: 'bg-primary'
    },
    {
      icon: DollarSign,
      title: 'Compare Prices',
      description: 'Get best deals',
      onClick: () => navigate('/search'),
      color: 'bg-secondary'
    },
    {
      icon: MapPin,
      title: 'Nearby Pharmacy',
      description: 'Find pharmacies near you',
      onClick: () => navigate('/pharmacies'),
      color: 'bg-accent'
    },
    {
      icon: Bell,
      title: 'Med Reminders',
      description: 'Set medication alerts',
      onClick: () => navigate('/reminders'),
      color: 'bg-chart-1'
    },
    {
      icon: FileText,
      title: 'Prescription Info',
      description: 'Check medicine details',
      onClick: () => navigate('/search'),
      color: 'bg-chart-4'
    }
  ];

  const toggleDarkMode = () => {
    setTheme(darkMode ? 'light' : 'dark');
  };

  // Data for charts
  const categoryData = [
    { name: 'Pain Relief', value: 25, color: '#1E88E5' },
    { name: 'Diabetes', value: 20, color: '#00A86B' },
    { name: 'Cholesterol', value: 18, color: '#FF9800' },
    { name: 'Allergy', value: 15, color: '#AB47BC' },
    { name: 'Gastric', value: 12, color: '#26C6DA' },
    { name: 'Others', value: 10, color: '#90CAF9' }
  ];

  const priceComparisonData = [
    { medicine: 'Paracetamol', branded: 45.5, generic: 28, savings: 38 },
    { medicine: 'Metformin', branded: 85, generic: 62, savings: 27 },
    { medicine: 'Atorvastatin', branded: 245, generic: 98, savings: 60 },
    { medicine: 'Cetirizine', branded: 68, generic: 32, savings: 53 },
    { medicine: 'Omeprazole', branded: 156, generic: 95, savings: 39 }
  ];

  const weeklyTrendsData = [
    { day: 'Mon', searches: 45, orders: 12 },
    { day: 'Tue', searches: 52, orders: 18 },
    { day: 'Wed', searches: 48, orders: 15 },
    { day: 'Thu', searches: 61, orders: 22 },
    { day: 'Fri', searches: 55, orders: 19 },
    { day: 'Sat', searches: 67, orders: 28 },
    { day: 'Sun', searches: 43, orders: 14 }
  ];

  const savingsStats = [
    {
      title: 'Total Savings',
      value: '₹12,450',
      change: '+23%',
      icon: DollarSign,
      color: 'bg-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      title: 'Medicines Searched',
      value: '245',
      change: '+12%',
      icon: Activity,
      color: 'bg-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Orders Placed',
      value: '56',
      change: '+8%',
      icon: ShoppingCart,
      color: 'bg-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <Pill className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Affordable Medicine</h1>
                <p className="text-xs text-muted-foreground">Find Better Alternatives</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                title="View profile"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
              </button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">Search for medicines and find affordable alternatives</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="search-input"
                    type="text"
                    placeholder="Search for medicines by name, salt composition, or condition..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-6 text-lg"
                  />
                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    size="sm"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={action.onClick}
                >
                  <CardContent className="p-6">
                    <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold mb-1">{action.title}</h4>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Popular Medicines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold mb-4">Popular Medicines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loadingPopular
              ? [1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </CardContent>
                  </Card>
                ))
              : popularMedicines.map((medicine) => (
                  <Card
                    key={medicine._id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/medicine/${medicine._id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{medicine.brand}</CardTitle>
                          <CardDescription>{medicine.genericName}</CardDescription>
                        </div>
                        {medicine.isPrescriptionRequired && (
                          <Badge variant="outline" className="bg-accent/10 text-accent">Rx</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary">₹{medicine.price}</p>
                          <p className="text-xs text-muted-foreground">{medicine.packaging}</p>
                        </div>
                        <Badge variant={medicine.inStock ? 'default' : 'secondary'}>
                          {medicine.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
            }
          </div>
        </motion.div>

        {/* Charts and Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8"
        >
          <h3 className="text-xl font-semibold mb-4">Your Health Insights</h3>
          
          {/* Savings Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {savingsStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              >
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-primary">{stat.value}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-4 h-4 text-secondary" />
                          <span className="text-sm text-secondary font-medium">{stat.change} this month</span>
                        </div>
                      </div>
                      <div className={`${stat.bgColor} p-3 rounded-lg`}>
                        <stat.icon className={`w-8 h-8 ${stat.color.replace('bg-', 'text-')}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Medicine Categories Pie Chart */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Medicine Categories Distribution</CardTitle>
                <CardDescription>Breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Activity Trends */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Searches and orders over the week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3F2FD" />
                    <XAxis dataKey="day" stroke="#616161" />
                    <YAxis stroke="#616161" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #BBDEFB',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="searches" 
                      stroke="#1E88E5" 
                      strokeWidth={3}
                      dot={{ fill: '#1E88E5', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#00A86B" 
                      strokeWidth={3}
                      dot={{ fill: '#00A86B', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Price Comparison Bar Chart */}
            <Card className="shadow-lg lg:col-span-2">
              <CardHeader>
                <CardTitle>Brand vs Generic Price Comparison</CardTitle>
                <CardDescription>See how much you can save with generic alternatives</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3F2FD" />
                    <XAxis dataKey="medicine" stroke="#616161" />
                    <YAxis stroke="#616161" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #BBDEFB',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="branded" fill="#FF9800" name="Branded Price (₹)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="generic" fill="#00A86B" name="Generic Price (₹)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}