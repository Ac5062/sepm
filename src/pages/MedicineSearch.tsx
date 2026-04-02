import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Input } from '../app/components/ui/input';
import { Button } from '../app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Badge } from '../app/components/ui/badge';
import { Skeleton } from '../app/components/ui/skeleton';
import { Alert, AlertDescription } from '../app/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../app/components/ui/select';
import { Search, ArrowLeft, Star, AlertCircle, RefreshCw, SearchX, ChevronLeft, ChevronRight } from 'lucide-react';
import { medicineApi, type Medicine, getErrorMessage } from '../services/api';
import { motion } from 'motion/react';

const ITEMS_PER_PAGE = 5;

export function MedicineSearch() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  // Separate input value from the query that's actually submitted/searched
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);

  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  // Load categories once on mount
  useEffect(() => {
    medicineApi.getCategories()
      .then(cats => setAvailableCategories(cats))
      .catch(() => {}); // fail silently
  }, []);

  // Main search effect — runs whenever submitted query, filters, or page changes
  useEffect(() => {
    let cancelled = false;

    const fetchMedicines = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await medicineApi.getAll({
          q: submittedQuery.trim() || undefined,
          category: category === 'all' ? undefined : category,
          sortBy: sortBy === 'relevance' ? undefined : sortBy,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });

        if (!cancelled) {
          setResults(res.data);
          setTotalResults(res.total);
          setTotalPages(res.totalPages);
          setHasSearched(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMedicines();
    return () => { cancelled = true; };
  }, [submittedQuery, category, sortBy, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSubmittedQuery(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSubmittedQuery('');
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setCurrentPage(1);
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Search Medicines</h1>
          </div>

          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, brand, salt composition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-24"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
              <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">
                Search
              </Button>
            </div>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Error banner */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmittedQuery(q => q + ' ')}
                className="ml-4 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {availableCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>

          {!loading && hasSearched && !error && (
            <div className="text-sm text-muted-foreground self-center">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
              {submittedQuery && (
                <span> for "<span className="font-medium text-foreground">{submittedQuery}</span>"</span>
              )}
            </div>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32 mt-1" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No results after search */}
        {!loading && !error && hasSearched && results.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <SearchX className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No medicines found</h3>
              <p className="text-muted-foreground text-center mb-6">
                {submittedQuery
                  ? <>No results for "<span className="font-medium">{submittedQuery}</span>". Try a different name or clear the filters.</>
                  : 'No medicines match the selected filters.'}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClearSearch}>Clear Search</Button>
                <Button onClick={() => handleCategoryChange('all')}>Reset Filters</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!loading && !error && results.length > 0 && (
          <>
            <div className="space-y-4">
              {results.map((medicine, index) => (
                <motion.div
                  key={medicine._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/medicine/${medicine._id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle>{medicine.brand}</CardTitle>
                            {medicine.isPrescriptionRequired && (
                              <Badge variant="outline" className="bg-accent/10 text-accent">Rx Required</Badge>
                            )}
                          </div>
                          <CardDescription>
                            {medicine.genericName} • {medicine.dosage}
                          </CardDescription>
                        </div>
                        <Badge variant={medicine.inStock ? 'default' : 'secondary'}>
                          {medicine.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-2">{medicine.description}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="font-medium">{medicine.rating}</span>
                            </div>
                            <span className="text-muted-foreground">({medicine.reviews} reviews)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-3xl font-bold text-primary">₹{medicine.price}</p>
                            <p className="text-xs text-muted-foreground">{medicine.packaging}</p>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/medicine/${medicine._id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalResults)} of {totalResults} results
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPage(p => p - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-9"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPage(p => p + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
