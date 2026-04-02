import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '../app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Badge } from '../app/components/ui/badge';
import { Skeleton } from '../app/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../app/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../app/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../app/components/ui/table';
import { ArrowLeft, AlertTriangle, Star, Heart, TrendingDown, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { medicineApi, type Medicine, getErrorMessage } from '../services/api';
import { motion } from 'motion/react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Static demo pharmacy data — computed per medicine price
function buildPharmacyPrices(basePrice: number) {
  return [
    {
      id: 'ph1',
      pharmacy: { name: 'MedPlus Pharmacy', distance: 0.5 },
      price: basePrice,
      discount: 5,
      finalPrice: +(basePrice * 0.95).toFixed(2),
      inStock: true,
    },
    {
      id: 'ph2',
      pharmacy: { name: 'Apollo Pharmacy', distance: 1.2 },
      price: basePrice,
      discount: 0,
      finalPrice: basePrice,
      inStock: true,
    },
    {
      id: 'ph3',
      pharmacy: { name: 'Generic Store', distance: 2.1 },
      price: basePrice,
      discount: 12,
      finalPrice: +(basePrice * 0.88).toFixed(2),
      inStock: true,
    },
    {
      id: 'ph4',
      pharmacy: { name: 'HealthMart', distance: 3.0 },
      price: basePrice,
      discount: 3,
      finalPrice: +(basePrice * 0.97).toFixed(2),
      inStock: false,
    },
  ].sort((a, b) => a.finalPrice - b.finalPrice);
}

const STATIC_REVIEWS = [
  { id: 'r1', userName: 'Rajesh K.', rating: 5, date: '15 Jan 2024', comment: 'Very effective medicine, works well within 30 minutes. Highly recommended.' },
  { id: 'r2', userName: 'Priya S.', rating: 4, date: '3 Feb 2024', comment: 'Good affordable alternative to branded medicines. Genuine quality.' },
  { id: 'r3', userName: 'Amit P.', rating: 4, date: '20 Feb 2024', comment: 'Recommended by my doctor. Has been very helpful for my condition.' },
];

export function MedicineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [alternatives, setAlternatives] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPrescriptionWarning, setShowPrescriptionWarning] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([
      medicineApi.getById(id),
      medicineApi.getAlternatives(id),
    ])
      .then(([med, alts]) => {
        if (!cancelled) {
          setMedicine(med);
          setAlternatives(alts);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-muted">
        <header className="bg-card border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <Skeleton className="h-7 w-48 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader>
                  <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i}>
                  <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                  <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (error || !medicine) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">{error || 'Medicine not found'}</p>
            <p className="text-muted-foreground mb-4">
              The medicine you're looking for could not be loaded.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────
  const pricesWithPharmacy = buildPharmacyPrices(medicine.price);

  const priceTrendData = [
    { month: 'Jan', price: +(medicine.price * 1.10).toFixed(2) },
    { month: 'Feb', price: +(medicine.price * 1.08).toFixed(2) },
    { month: 'Mar', price: +(medicine.price * 1.05).toFixed(2) },
    { month: 'Apr', price: +(medicine.price * 1.03).toFixed(2) },
    { month: 'May', price: +(medicine.price * 1.01).toFixed(2) },
    { month: 'Jun', price: medicine.price },
  ];

  const ratingDistribution = [
    { rating: '5 Stars', count: Math.floor(medicine.reviews * 0.60) },
    { rating: '4 Stars', count: Math.floor(medicine.reviews * 0.25) },
    { rating: '3 Stars', count: Math.floor(medicine.reviews * 0.10) },
    { rating: '2 Stars', count: Math.floor(medicine.reviews * 0.03) },
    { rating: '1 Star',  count: Math.floor(medicine.reviews * 0.02) },
  ];

  const pharmacyPriceChartData = pricesWithPharmacy.map(item => ({
    name: item.pharmacy.name.split(' ')[0],
    price: item.finalPrice,
    distance: item.pharmacy.distance,
  }));

  return (
    <div className="min-h-screen bg-muted">
      {/* Prescription Warning Dialog */}
      <Dialog open={showPrescriptionWarning} onOpenChange={setShowPrescriptionWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-accent/10 p-2 rounded-full">
                <AlertTriangle className="w-6 h-6 text-accent" />
              </div>
              <DialogTitle>Prescription Required</DialogTitle>
            </div>
            <DialogDescription>
              This medicine requires a valid prescription from a licensed healthcare provider.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="bg-accent/10 border-accent">
              <AlertTriangle className="h-4 w-4 text-accent" />
              <AlertTitle>Important Safety Information</AlertTitle>
              <AlertDescription>
                Using prescription medicines without proper medical supervision can be dangerous.
                Please consult a doctor before purchasing this medication.
              </AlertDescription>
            </Alert>
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold mb-2">Legal Compliance:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Valid prescription must be presented at pharmacy</li>
                <li>Prescription should be from a registered medical practitioner</li>
                <li>Self-medication can lead to serious health risks</li>
              </ul>
            </div>
            <Button onClick={() => setShowPrescriptionWarning(false)} className="w-full">
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{medicine.brand}</h1>
              <p className="text-muted-foreground">{medicine.genericName}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Prescription Warning Banner */}
        {medicine.isPrescriptionRequired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="bg-accent/10 border-accent cursor-pointer" onClick={() => setShowPrescriptionWarning(true)}>
              <AlertTriangle className="h-4 w-4 text-accent" />
              <AlertTitle>Prescription Required</AlertTitle>
              <AlertDescription>
                This is a prescription-only medication. Click to learn more.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{medicine.brand}</CardTitle>
                    <CardDescription className="text-base">{medicine.genericName}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">₹{medicine.price}</p>
                    <p className="text-sm text-muted-foreground">{medicine.packaging}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(medicine.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{medicine.rating}</span>
                    <span className="text-muted-foreground">({medicine.reviews} reviews)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Manufacturer</p>
                      <p className="font-medium">{medicine.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{medicine.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dosage</p>
                      <p className="font-medium">{medicine.dosage}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Packaging</p>
                      <p className="font-medium">{medicine.packaging}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p>{medicine.description}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Salt Composition</p>
                    <div className="flex flex-wrap gap-2">
                      {medicine.saltComposition.map((salt, index) => (
                        <Badge key={index} variant="secondary">{salt}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="prices" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="prices">Price Comparison</TabsTrigger>
                <TabsTrigger value="alternatives">
                  Alternatives {alternatives.length > 0 && `(${alternatives.length})`}
                </TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* Price Comparison Tab */}
              <TabsContent value="prices">
                <Card>
                  <CardHeader>
                    <CardTitle>Price Comparison Across Pharmacies</CardTitle>
                    <CardDescription>Compare prices and find the best deal near you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pharmacy</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Final Price</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pricesWithPharmacy.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.pharmacy.name}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {item.pharmacy.distance}km away
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>₹{item.price}</TableCell>
                            <TableCell>
                              {item.discount > 0 && (
                                <Badge variant="secondary">{item.discount}% off</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-primary">₹{item.finalPrice}</span>
                              {index === 0 && (
                                <Badge className="ml-2 bg-secondary">Lowest</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.inStock ? 'default' : 'secondary'}>
                                {item.inStock ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Alternatives Tab */}
              <TabsContent value="alternatives">
                <Card>
                  <CardHeader>
                    <CardTitle>Affordable Generic Alternatives</CardTitle>
                    <CardDescription>Save money with these equivalent medicines</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {alternatives.length > 0 ? (
                      <div className="space-y-4">
                        {alternatives.map(alt => {
                          const savingsPercent = medicine.price > alt.price
                            ? Math.round((medicine.price - alt.price) / medicine.price * 100)
                            : 0;
                          const savingsAmount = (medicine.price - alt.price).toFixed(2);
                          return (
                            <Card
                              key={alt._id}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => navigate(`/medicine/${alt._id}`)}
                            >
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg">{alt.brand}</h4>
                                    <p className="text-sm text-muted-foreground">{alt.genericName}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                      <span className="text-sm">{alt.rating}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {savingsPercent > 0 && (
                                      <div className="flex items-center gap-2 mb-1">
                                        <TrendingDown className="w-5 h-5 text-secondary" />
                                        <span className="text-2xl font-bold text-secondary">
                                          {savingsPercent}% off
                                        </span>
                                      </div>
                                    )}
                                    <p className="text-lg font-bold text-primary">₹{alt.price}</p>
                                    {savingsPercent > 0 && (
                                      <p className="text-sm text-muted-foreground">
                                        Save ₹{savingsAmount}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No cheaper alternatives found for this medicine.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                    <CardDescription>{medicine.reviews} total reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {STATIC_REVIEWS.map(review => (
                        <div key={review.id} className="border-b pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{review.userName}</p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.date}</p>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={medicine.inStock ? 'default' : 'secondary'} className="mb-4">
                  {medicine.inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
                <Button className="w-full mb-2" disabled={!medicine.inStock}>
                  Add to Cart
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/pharmacies')}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Nearby Pharmacy
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <Badge>{medicine.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Manufacturer</span>
                  <span className="text-sm font-medium">{medicine.manufacturer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Reviews</span>
                  <span className="text-sm font-medium">{medicine.reviews}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Trend (Last 6 Months)</CardTitle>
                <CardDescription>Historical price changes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={priceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3F2FD" />
                    <XAxis dataKey="month" stroke="#616161" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#616161" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #BBDEFB',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#1E88E5"
                      strokeWidth={2}
                      dot={{ fill: '#1E88E5', r: 4 }}
                      name="Price (₹)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Breakdown</CardTitle>
                <CardDescription>Customer satisfaction levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={ratingDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3F2FD" />
                    <XAxis type="number" stroke="#616161" style={{ fontSize: '12px' }} />
                    <YAxis type="category" dataKey="rating" stroke="#616161" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #BBDEFB',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="#00A86B" radius={[0, 8, 8, 0]} name="Reviews" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pharmacy Price Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={pharmacyPriceChartData}>
                    <PolarGrid stroke="#E3F2FD" />
                    <PolarAngleAxis dataKey="name" stroke="#616161" style={{ fontSize: '10px' }} />
                    <PolarRadiusAxis stroke="#616161" style={{ fontSize: '10px' }} />
                    <Radar name="Price" dataKey="price" stroke="#1E88E5" fill="#1E88E5" fillOpacity={0.6} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #BBDEFB',
                        borderRadius: '8px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
