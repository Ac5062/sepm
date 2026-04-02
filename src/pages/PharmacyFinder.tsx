import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Badge } from '../app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../app/components/ui/tabs';
import { Alert, AlertDescription } from '../app/components/ui/alert';
import { ArrowLeft, MapPin, Phone, Navigation, Clock, Star, Map } from 'lucide-react';
import { pharmacies } from '../data/mockData';
import { motion } from 'motion/react';

export function PharmacyFinder() {
  const navigate = useNavigate();
  const [locationPermission, setLocationPermission] = useState(false);
  const [view, setView] = useState<'list' | 'map'>('list');

  const requestLocation = () => {
    // Simulate location permission
    setLocationPermission(true);
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Nearby Pharmacies</h1>
              <p className="text-muted-foreground">Find pharmacies near your location</p>
            </div>
            <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'map')} className="w-auto">
              <TabsList>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="map">Map</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!locationPermission ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <MapPin className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center">Enable Location</CardTitle>
                <CardDescription className="text-center">
                  We need your location to show nearby pharmacies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertDescription>
                    Your location data will only be used to find pharmacies near you. We don't store or share your location.
                  </AlertDescription>
                </Alert>
                <Button onClick={requestLocation} className="w-full">
                  <Navigation className="w-4 h-4 mr-2" />
                  Enable Location
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {view === 'map' ? (
              <Card className="h-[600px]">
                <CardContent className="p-0 h-full flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <Map className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Map view would display here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      (Interactive map integration available with Google Maps API)
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pharmacies.map((pharmacy, index) => (
                  <motion.div
                    key={pharmacy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle>{pharmacy.name}</CardTitle>
                              {pharmacy.isOpen && (
                                <Badge className="bg-secondary">Open</Badge>
                              )}
                              {!pharmacy.isOpen && (
                                <Badge variant="secondary">Closed</Badge>
                              )}
                            </div>
                            <CardDescription className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{pharmacy.address}</span>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="font-medium">{pharmacy.ratings}</span>
                            </div>
                            <p className="text-sm font-medium text-primary">{pharmacy.distance}km</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{pharmacy.openingHours}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <a href={`tel:${pharmacy.phone}`} className="text-primary hover:underline">
                                {pharmacy.phone}
                              </a>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" asChild>
                              <a href={`tel:${pharmacy.phone}`}>
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                              </a>
                            </Button>
                            <Button asChild>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Navigation className="w-4 h-4 mr-2" />
                                Directions
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}