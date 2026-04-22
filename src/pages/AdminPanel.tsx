import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Label } from '../app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../app/components/ui/table';
import { Badge } from '../app/components/ui/badge';
import { Skeleton } from '../app/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../app/components/ui/dialog';
import { Switch } from '../app/components/ui/switch';
import { Textarea } from '../app/components/ui/textarea';
import { Pill, Plus, Edit, Trash2, BarChart3, Users, ArrowLeft, Search, TrendingUp } from 'lucide-react';
import { medicineApi, authApi, type Medicine, type AdminStats, getErrorMessage } from '../services/api';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export function AdminPanel() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [medicineList, setMedicineList] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  // Fetch medicines + real admin stats on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medicineRes, stats] = await Promise.all([
          medicineApi.getAll({ limit: 100 }),
          authApi.getAdminStats(),
        ]);
        setMedicineList(medicineRes.data);
        setAdminStats(stats);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">You don't have permission to access the admin panel.</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredMedicines = medicineList.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteMedicine = async (id: string) => {
    try {
      await medicineApi.delete(id);
      setMedicineList(prev => prev.filter(m => m._id !== id));
      toast.success('Medicine deleted successfully');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const stats = [
    {
      title: 'Total Medicines',
      value: loading ? '…' : (adminStats?.totalMedicines ?? medicineList.length),
      icon: Pill,
      color: 'bg-primary',
    },
    {
      title: 'Registered Users',
      value: loading ? '…' : (adminStats?.totalUsers ?? '—'),
      icon: Users,
      color: 'bg-secondary',
    },
    {
      title: 'Total Reviews',
      value: loading ? '…' : medicineList.reduce((sum, m) => sum + m.reviews, 0),
      icon: BarChart3,
      color: 'bg-accent',
    },
  ];

  // Analytics data — from real DB stats when available, fallback to local computation
  const CHART_COLORS = ['#1E88E5', '#00A86B', '#FF9800', '#AB47BC', '#26C6DA', '#90CAF9', '#EF5350', '#66BB6A'];
  const categoryDistribution = adminStats?.categoryBreakdown
    ? adminStats.categoryBreakdown.map((c, i) => ({ ...c, color: CHART_COLORS[i % CHART_COLORS.length] }))
    : [
        { name: 'Pain Relief', value: medicineList.filter(m => m.category === 'Pain Relief').length, color: '#1E88E5' },
        { name: 'Diabetes',    value: medicineList.filter(m => m.category === 'Diabetes').length,    color: '#00A86B' },
        { name: 'Cholesterol', value: medicineList.filter(m => m.category === 'Cholesterol').length, color: '#FF9800' },
        { name: 'Allergy',     value: medicineList.filter(m => m.category === 'Allergy').length,     color: '#AB47BC' },
        { name: 'Gastric',     value: medicineList.filter(m => m.category === 'Gastric').length,     color: '#26C6DA' },
        { name: 'Antibiotic',  value: medicineList.filter(m => m.category === 'Antibiotic').length,  color: '#90CAF9' },
      ];

  const monthlyData = adminStats?.monthlyData ?? [
    { month: 'Jan', medicines: 45, users: 120 },
    { month: 'Feb', medicines: 52, users: 145 },
    { month: 'Mar', medicines: 48, users: 168 },
    { month: 'Apr', medicines: 61, users: 195 },
    { month: 'May', medicines: 55, users: 220 },
    { month: 'Jun', medicines: 67, users: 250 },
  ];

  const priceRangeData = [
    { range: '₹0-50',    count: medicineList.filter(m => m.price <= 50).length },
    { range: '₹51-100',  count: medicineList.filter(m => m.price > 50  && m.price <= 100).length },
    { range: '₹101-200', count: medicineList.filter(m => m.price > 100 && m.price <= 200).length },
    { range: '₹201+',    count: medicineList.filter(m => m.price > 200).length },
  ];

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Manage medicines and database</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary">Admin</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-4 h-4 text-secondary" />
                        <span className="text-sm text-secondary font-medium">+12% this month</span>
                      </div>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Analytics Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Analytics Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Medicine Categories</CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%" cy="50%"
                      labelLine={false}
                      label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Growth */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Monthly Growth Trends</CardTitle>
                <CardDescription>Medicines, users, and reviews over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3F2FD" />
                    <XAxis dataKey="month" stroke="#616161" />
                    <YAxis stroke="#616161" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #BBDEFB', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="medicines" stroke="#1E88E5" strokeWidth={3} name="Medicines Added" />
                    <Line type="monotone" dataKey="users"     stroke="#00A86B" strokeWidth={3} name="New Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Price Range Distribution */}
            <Card className="shadow-lg lg:col-span-2">
              <CardHeader>
                <CardTitle>Medicine Price Distribution</CardTitle>
                <CardDescription>Number of medicines in each price range</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceRangeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3F2FD" />
                    <XAxis dataKey="range" stroke="#616161" />
                    <YAxis stroke="#616161" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #BBDEFB', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="count" fill="#1E88E5" name="Number of Medicines" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Medicine Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Medicine Database</CardTitle>
                <CardDescription>Manage all medicines in the system</CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medicine
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Medicine</DialogTitle>
                    <DialogDescription>Enter the details of the new medicine</DialogDescription>
                  </DialogHeader>
                  <MedicineForm
                    onSubmit={async (data) => {
                      try {
                        const newMed = await medicineApi.create(data);
                        setMedicineList(prev => [...prev, newMed]);
                        setIsAddDialogOpen(false);
                        toast.success('Medicine added successfully');
                      } catch (err) {
                        toast.error(getErrorMessage(err));
                      }
                    }}
                    onCancel={() => setIsAddDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Generic Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    filteredMedicines.map((medicine) => (
                      <TableRow key={medicine._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{medicine.brand}</p>
                            <p className="text-sm text-muted-foreground">{medicine.manufacturer}</p>
                          </div>
                        </TableCell>
                        <TableCell>{medicine.genericName}</TableCell>
                        <TableCell className="font-medium">₹{medicine.price}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{medicine.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={medicine.inStock ? 'default' : 'secondary'}>
                            {medicine.inStock ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingMedicine(medicine)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMedicine(medicine._id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit Dialog */}
      {editingMedicine && (
        <Dialog open={!!editingMedicine} onOpenChange={() => setEditingMedicine(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Medicine</DialogTitle>
              <DialogDescription>Update the medicine details</DialogDescription>
            </DialogHeader>
            <MedicineForm
              initialData={editingMedicine}
              onSubmit={async (data) => {
                try {
                  const updated = await medicineApi.update(editingMedicine._id, data);
                  setMedicineList(prev =>
                    prev.map(m => m._id === editingMedicine._id ? updated : m)
                  );
                  setEditingMedicine(null);
                  toast.success('Medicine updated successfully');
                } catch (err) {
                  toast.error(getErrorMessage(err));
                }
              }}
              onCancel={() => setEditingMedicine(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ── MedicineForm component ─────────────────────────────────

type MedicineFormData = Omit<Medicine, '_id'>;

interface MedicineFormProps {
  initialData?: Medicine;
  onSubmit: (data: MedicineFormData) => Promise<void>;
  onCancel: () => void;
}

function MedicineForm({ initialData, onSubmit, onCancel }: MedicineFormProps) {
  const [formData, setFormData] = useState<MedicineFormData>(
    initialData
      ? (({ _id, ...rest }) => rest)(initialData)
      : {
          name: '',
          brand: '',
          genericName: '',
          saltComposition: [],
          price: 0,
          isPrescriptionRequired: false,
          category: '',
          dosage: '',
          packaging: '',
          manufacturer: '',
          rating: 0,
          reviews: 0,
          inStock: true,
          description: '',
        }
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Medicine Name</Label>
        <Input
          id="name"
          placeholder="e.g., Paracetamol 500mg"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand Name</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="genericName">Generic Name</Label>
          <Input
            id="genericName"
            value={formData.genericName}
            onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dosage">Dosage</Label>
          <Input
            id="dosage"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="packaging">Packaging</Label>
          <Input
            id="packaging"
            value={formData.packaging}
            onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="manufacturer">Manufacturer</Label>
        <Input
          id="manufacturer"
          value={formData.manufacturer}
          onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="saltComposition">Salt Composition</Label>
        <Input
          id="saltComposition"
          placeholder="e.g., Paracetamol 500mg (comma-separated)"
          value={formData.saltComposition.join(', ')}
          onChange={(e) =>
            setFormData({
              ...formData,
              saltComposition: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="prescription"
          checked={formData.isPrescriptionRequired}
          onCheckedChange={(checked) => setFormData({ ...formData, isPrescriptionRequired: checked })}
        />
        <Label htmlFor="prescription">Prescription Required</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="inStock"
          checked={formData.inStock}
          onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
        />
        <Label htmlFor="inStock">In Stock</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : initialData ? 'Update Medicine' : 'Add Medicine'}
        </Button>
      </div>
    </form>
  );
}
