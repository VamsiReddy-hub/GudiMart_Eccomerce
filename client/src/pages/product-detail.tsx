import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductDetailProps {
  productId: number;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  
  // Fetch product details
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
  });
  
  // Fetch related products
  const { data: relatedProducts, isLoading: isLoadingRelated } = useQuery<Product[]>({
    queryKey: ['/api/products', { limit: 4, exclude: productId, category: product?.categoryId }],
    enabled: !!product,
  });
  
  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [productId]);
  
  // Handle quantity change
  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const handleDecreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (product) {
      onAddToCart(product, quantity);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/5 p-6">
              <Skeleton className="w-full h-80" />
            </div>
            <div className="md:w-3/5 p-6">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/4 mb-4" />
              <Skeleton className="h-5 w-1/3 mb-3" />
              <Skeleton className="h-4 w-full mb-6" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-white rounded shadow-sm p-8">
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-medium text-dark mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">
            The product you're looking for is no longer available or may have been removed.
          </p>
          <Link href="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  const {
    name,
    brand,
    description,
    price,
    discountedPrice,
    discountPercentage,
    imageUrl,
    rating,
    reviewCount,
    inStock,
    deliveryTime,
    specifications
  } = product;
  
  // Calculate savings amount
  const savings = discountedPrice ? price - discountedPrice : 0;
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <div className="text-sm breadcrumbs mb-4">
        <ul className="flex items-center">
          <li>
            <Link href="/" className="text-gray-500 hover:text-primary">
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li>
            <Link href="/products" className="text-gray-500 hover:text-primary">
              Products
            </Link>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="text-dark font-medium truncate">{name}</li>
        </ul>
      </div>
      
      {/* Product Detail Card */}
      <div className="bg-white rounded shadow-sm overflow-hidden mb-6">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="md:w-2/5 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
            <img
              src={imageUrl}
              alt={name}
              className="max-w-full max-h-80 object-contain"
            />
          </div>
          
          {/* Product Info */}
          <div className="md:w-3/5 p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-medium text-dark mb-1">{name}</h1>
              <div className="flex items-center mb-2">
                <span className="text-xs text-primary font-medium">{brand.toUpperCase()}</span>
                <span className="mx-2 text-gray-300">|</span>
                <div className="flex items-center">
                  <span className="rating-badge mr-2">{rating} ★</span>
                  <span className="text-xs text-gray-500">{reviewCount.toLocaleString()} ratings</span>
                </div>
              </div>
              
              {inStock ? (
                <div className="text-success text-sm mb-3">In Stock</div>
              ) : (
                <div className="text-error text-sm mb-3">Out of Stock</div>
              )}
              
              <div className="mb-4">
                <div className="flex items-center">
                  <span className="text-2xl font-medium text-dark">
                    ₹{discountedPrice ? discountedPrice.toLocaleString() : price.toLocaleString()}
                  </span>
                  {discountedPrice && (
                    <>
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ₹{price.toLocaleString()}
                      </span>
                      <span className="text-sm text-success ml-2">
                        {discountPercentage}% off
                      </span>
                    </>
                  )}
                </div>
                {savings > 0 && (
                  <div className="text-xs text-success mt-1">
                    You save: ₹{savings.toLocaleString()}
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-500 mb-5">{deliveryTime}</div>
              
              <div className="mb-6">
                <div className="text-sm font-medium text-dark mb-2">Quantity</div>
                <div className="flex items-center">
                  <button
                    onClick={handleDecreaseQuantity}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-dark disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="mx-4 w-8 text-center">{quantity}</span>
                  <button
                    onClick={handleIncreaseQuantity}
                    disabled={!inStock}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-dark disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="btn-secondary flex-1 py-3 flex items-center justify-center disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Add to Cart
                </button>
                <button className="btn-primary flex-1 py-3 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="bg-white rounded shadow-sm overflow-hidden mb-8">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full flex justify-start px-4 pt-2 border-b">
            <TabsTrigger value="description" className="px-6 py-3">Description</TabsTrigger>
            <TabsTrigger value="specifications" className="px-6 py-3">Specifications</TabsTrigger>
            <TabsTrigger value="reviews" className="px-6 py-3">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="p-6">
            <h3 className="text-lg font-medium text-dark mb-3">Product Description</h3>
            <p className="text-gray-700">{description}</p>
          </TabsContent>
          <TabsContent value="specifications" className="p-6">
            <h3 className="text-lg font-medium text-dark mb-3">Product Specifications</h3>
            <table className="w-full text-sm">
              <tbody>
                {specifications && Object.entries(specifications as Record<string, string>).map(([key, value]) => (
                  <tr key={key} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 font-medium text-dark w-1/3 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                    <td className="py-2 text-gray-700">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
          <TabsContent value="reviews" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-dark">Customer Reviews</h3>
              <button className="btn-primary text-sm py-1">Write a Review</button>
            </div>
            <div className="flex items-center mb-6">
              <div className="text-4xl font-medium text-dark mr-4">{rating}</div>
              <div>
                <div className="flex text-yellow-400 mb-1">
                  {Array(5).fill(0).map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${i < Math.floor(rating) ? 'fill-current' : 'stroke-current fill-none'}`}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  ))}
                </div>
                <div className="text-sm text-gray-500">Based on {reviewCount.toLocaleString()} reviews</div>
              </div>
            </div>
            
            {/* Sample reviews - would come from API in a real app */}
            <div className="space-y-6">
              {[
                { id: 1, name: "Rahul S.", rating: 5, date: "2 months ago", comment: "Excellent product! Exceeded my expectations in terms of quality and performance." },
                { id: 2, name: "Priya M.", rating: 4, date: "1 month ago", comment: "Very good product for the price. Fast delivery and good packaging." }
              ].map(review => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 mr-2">
                      {Array(5).fill(0).map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'stroke-current fill-none'}`}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      ))}
                    </div>
                    <div className="font-medium text-dark">{review.name}</div>
                    <div className="mx-2 text-gray-300">|</div>
                    <div className="text-sm text-gray-500">{review.date}</div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="bg-white rounded shadow-sm overflow-hidden p-6">
          <h3 className="text-lg font-medium text-dark mb-4">Related Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoadingRelated ? (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="w-full h-40 bg-gray-200 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              relatedProducts.map(product => (
                <Link key={product.id} href={`/product/${product.id}`} className="block">
                  <div className="text-center">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="mx-auto h-40 object-contain mb-2"
                      loading="lazy"
                    />
                    <h4 className="font-medium text-dark text-sm mb-1 line-clamp-2" title={product.name}>
                      {product.name}
                    </h4>
                    <div className="text-sm">
                      <span className="font-medium text-dark">
                        ₹{product.discountedPrice?.toLocaleString() || product.price.toLocaleString()}
                      </span>
                      {product.discountedPrice && (
                        <span className="text-xs text-success ml-1">
                          ({product.discountPercentage}% off)
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
