import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { FilterState } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ProductsProps {
  searchTerm: string;
  categoryFilter: number | null;
  onAddToCart: (product: Product) => void;
}

const Products: React.FC<ProductsProps> = ({
  searchTerm,
  categoryFilter,
  onAddToCart,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 100000,
    brands: [],
    rating: 0,
    inStock: true,
  });
  
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  
  // Build query params
  const queryParams: any = {
    searchTerm,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    inStock: filters.inStock,
  };
  
  if (categoryFilter) {
    queryParams.categoryId = categoryFilter;
  }
  
  if (filters.rating) {
    queryParams.rating = filters.rating;
  }
  
  if (filters.brands.length > 0) {
    queryParams.brand = filters.brands;
  }
  
  switch (sortBy) {
    case "price_low":
      queryParams.sortBy = "price_asc";
      break;
    case "price_high":
      queryParams.sortBy = "price_desc";
      break;
    case "rating":
      queryParams.sortBy = "rating";
      break;
    case "newest":
      queryParams.sortBy = "newest";
      break;
    default:
      queryParams.sortBy = "popularity";
  }
  
  // Fetch products based on filters
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', queryParams],
  });
  
  // Calculate pagination
  const totalProducts = products?.length || 0;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products?.slice(indexOfFirstProduct, indexOfLastProduct);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, filters, sortBy]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };
  
  // Handle pagination
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Generate pagination links
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  return (
    <section className="container mx-auto px-4 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block">
          <ProductFilters onFilterChange={handleFilterChange} categoryId={categoryFilter} />
        </div>
        
        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Sort Bar */}
          <div className="bg-white p-3 rounded shadow-sm mb-4 flex flex-wrap justify-between items-center">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-dark">{totalProducts}</span> products found
              {categoryFilter && " in this category"}
              {searchTerm && ` for "${searchTerm}"`}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-dark">Sort By:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <SelectValue placeholder="Popularity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden btn-primary text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 inline"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Filter
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your product search
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4">
                    <ProductFilters onFilterChange={handleFilterChange} categoryId={categoryFilter} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded shadow-sm overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-3">
                    <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="px-3 pb-3">
                    <div className="h-9 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentProducts?.length === 0 ? (
            <div className="bg-white rounded shadow-sm p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-dark mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-4">
                We couldn't find any products matching your current filters.
              </p>
              <button
                onClick={() => {
                  setFilters({
                    minPrice: 0,
                    maxPrice: 100000,
                    brands: [],
                    rating: 0,
                    inStock: true,
                  });
                  setSortBy("popularity");
                }}
                className="btn-primary"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentProducts?.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => onAddToCart(product)}
                />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded border text-dark hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-dark"
                >
                  &laquo;
                </button>
                
                {pageNumbers.map(number => {
                  // Always show first page, last page, current page, and one page before and after current
                  if (
                    number === 1 ||
                    number === totalPages ||
                    number === currentPage ||
                    number === currentPage - 1 ||
                    number === currentPage + 1
                  ) {
                    return (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-2 rounded border ${
                          currentPage === number
                            ? "bg-primary text-white"
                            : "text-dark hover:bg-primary hover:text-white"
                        }`}
                      >
                        {number}
                      </button>
                    );
                  }
                  
                  // Show ellipsis
                  if (
                    (number === 2 && currentPage > 3) ||
                    (number === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return <span key={number} className="px-2 text-gray-500">...</span>;
                  }
                  
                  return null;
                })}
                
                <button
                  onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded border text-dark hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-dark"
                >
                  &raquo;
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Products;
