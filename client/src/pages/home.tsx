import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import Carousel from "@/components/Carousel";
import OffersSection from "@/components/OffersSection";
import ProductCard from "@/components/ProductCard";
import CategorySection from "@/components/CategorySection";
import { Skeleton } from "@/components/ui/skeleton";

interface HomeProps {
  onCategorySelect: (categoryId: number | null) => void;
}

const Home: React.FC<HomeProps> = ({ onCategorySelect }) => {
  // Fetch featured products
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useQuery<Product[]>({
    queryKey: ['/api/products', { featured: true }],
  });

  // Carousel slides data
  const carouselSlides = [
    {
      id: 1,
      imageUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
      title: "Latest Smartphones",
      description: "Up to 40% off on premium devices",
      buttonText: "Shop Now",
      buttonLink: "/products?category=1"
    },
    {
      id: 2,
      imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
      title: "Summer Collection",
      description: "Refresh your wardrobe with trendy styles",
      buttonText: "Explore Now",
      buttonLink: "/products?category=2"
    },
    {
      id: 3,
      imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
      title: "Home Appliances",
      description: "Great deals on home essentials",
      buttonText: "View Offers",
      buttonLink: "/products?category=3"
    }
  ];

  return (
    <div>
      {/* Hero Banner/Carousel */}
      <Carousel slides={carouselSlides} />
      
      {/* Offers Section */}
      <OffersSection />
      
      {/* Featured Products */}
      <section className="container mx-auto px-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-dark">Featured Products</h2>
          <Link href="/products" className="text-primary text-sm font-medium">View All</Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoadingFeatured ? (
            // Skeleton loading state
            Array(4).fill(0).map((_, index) => (
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
            ))
          ) : (
            featuredProducts?.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={() => {}} />
            ))
          )}
        </div>
      </section>
      
      {/* Shop by Category */}
      <CategorySection />
      
      {/* Recently Viewed */}
      <section className="container mx-auto px-4 mb-8">
        <div className="bg-white rounded shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-dark">Top Deals</h2>
            <Link href="/deals" className="text-primary text-sm font-medium">See All Deals</Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts?.slice(0, 4).map(product => (
              <div key={product.id} className="text-center">
                <Link href={`/product/${product.id}`} className="block">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="mx-auto h-32 object-contain mb-2"
                    loading="lazy"
                  />
                  <div className="text-sm font-medium text-dark line-clamp-1">{product.name}</div>
                  <div className="flex items-center justify-center space-x-2 mt-1">
                    <span className="text-base font-medium text-dark">₹{product.discountedPrice?.toLocaleString() || product.price.toLocaleString()}</span>
                    {product.discountedPrice && (
                      <span className="text-xs text-success">{product.discountPercentage}% off</span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Popular Brands Banner */}
      <section className="container mx-auto px-4 mb-8">
        <div className="bg-primary text-white rounded shadow-sm p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Shop Popular Brands</h2>
            <p className="text-white/80">Discover top products from leading brands</p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {["TechX", "FashionX", "ViewTech", "SoundX", "HomeX", "WatchTech"].map((brand, index) => (
              <button 
                key={index}
                onClick={() => {
                  // Filter by brand and navigate to products page
                  window.history.pushState(null, "", "/products");
                }}
                className="bg-white rounded-full p-3 flex flex-col items-center justify-center h-24 text-dark hover:shadow-md transition-shadow"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mb-1 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span className="text-xs font-medium">{brand}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
