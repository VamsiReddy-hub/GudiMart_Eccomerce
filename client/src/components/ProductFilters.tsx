import { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { FilterState } from '@/types';

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  categoryId?: number | null;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ onFilterChange, categoryId }) => {
  // Get unique brands for the filter
  const { data: brands } = useQuery<string[]>({
    queryKey: ['/api/products/brands', categoryId],
    queryFn: async () => {
      // In a real app, you would fetch this from API
      return ["TechX", "TechBook", "WatchTech", "FashionX", "ViewTech", "SoundX"];
    }
  });
  
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 100000,
    brands: [],
    rating: 0,
    inStock: true
  });
  
  // Price range state
  const [priceRange, setPriceRange] = useState([0, 100000]);
  
  // Update filters when inputs change
  const handleBrandChange = (brand: string, checked: boolean) => {
    const updatedBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter(b => b !== brand);
    
    setFilters(prev => ({
      ...prev,
      brands: updatedBrands
    }));
  };
  
  const handleRatingChange = (rating: number, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      rating: checked ? rating : 0
    }));
  };
  
  const handleStockChange = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      inStock: checked
    }));
  };
  
  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };
  
  // Effect to notify parent of filter changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    }));
    
    // Apply a debounce for price changes
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters.brands, filters.rating, filters.inStock, priceRange]);
  
  // Reset filters when category changes
  useEffect(() => {
    setFilters({
      minPrice: 0,
      maxPrice: 100000,
      brands: [],
      rating: 0,
      inStock: true
    });
    setPriceRange([0, 100000]);
  }, [categoryId]);
  
  return (
    <div className="bg-white rounded shadow-sm p-4">
      <h3 className="font-medium text-lg mb-4 text-dark border-b pb-2">Filters</h3>
      
      {/* Price Range Filter */}
      <div className="mb-4 border-b pb-4">
        <h4 className="font-medium mb-3 text-dark">Price Range</h4>
        <div className="px-2">
          <Slider
            defaultValue={[0, 100000]}
            value={priceRange}
            min={0}
            max={100000}
            step={1000}
            onValueChange={handlePriceChange}
            className="my-6"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* Brand Filter */}
      <div className="mb-4 border-b pb-4">
        <h4 className="font-medium mb-3 text-dark">Brand</h4>
        <div className="space-y-2">
          {brands?.map(brand => (
            <div key={brand} className="flex items-center">
              <Checkbox
                id={`brand-${brand}`}
                checked={filters.brands.includes(brand)}
                onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                className="mr-2"
              />
              <Label htmlFor={`brand-${brand}`} className="text-sm text-gray-700">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Customer Rating Filter */}
      <div className="mb-4 border-b pb-4">
        <h4 className="font-medium mb-3 text-dark">Customer Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2].map(rating => (
            <div key={rating} className="flex items-center">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={(checked) => handleRatingChange(rating, checked as boolean)}
                className="mr-2"
              />
              <Label htmlFor={`rating-${rating}`} className="text-sm text-gray-700 flex items-center">
                {rating}★ & above
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Availability Filter */}
      <div className="mb-4">
        <h4 className="font-medium mb-3 text-dark">Availability</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox
              id="availability"
              checked={filters.inStock}
              onCheckedChange={(checked) => handleStockChange(checked as boolean)}
              className="mr-2"
            />
            <Label htmlFor="availability" className="text-sm text-gray-700">
              In Stock Only
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
