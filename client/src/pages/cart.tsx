import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CartItemWithProduct } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface CartProps {
  cartItems: CartItemWithProduct[];
  userId: number | undefined;
}

const Cart: React.FC<CartProps> = ({ cartItems, userId }) => {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.discountedPrice || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);
  
  const deliveryCharge = subtotal > 500 ? 0 : 40;
  const total = subtotal + deliveryCharge;
  
  // Handle quantity update
  const handleUpdateQuantity = async (id: number, quantity: number) => {
    if (!userId) return;
    
    try {
      await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      queryClient.invalidateQueries({ queryKey: ['/api/cart', userId] });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quantity",
      });
    }
  };
  
  // Handle item removal
  const handleRemoveItem = async (id: number) => {
    if (!userId) return;
    
    try {
      await apiRequest("DELETE", `/api/cart/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/cart', userId] });
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item",
      });
    }
  };
  
  // Handle checkout
  const handleCheckout = async () => {
    if (!userId || cartItems.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear cart
      await apiRequest("DELETE", `/api/cart/user/${userId}`);
      queryClient.invalidateQueries({ queryKey: ['/api/cart', userId] });
      
      toast({
        title: "Order Placed!",
        description: "Your order has been placed successfully",
      });
      
      // Navigate to success page or home
      setLocation("/");
    } catch (error) {
      console.error("Error during checkout:", error);
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: "There was an error processing your order",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-dark mb-6">Shopping Cart</h1>
      
      {!userId ? (
        <div className="bg-white rounded shadow-sm p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-primary mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h2 className="text-xl font-medium text-dark mb-2">Please Login to View Your Cart</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to view and manage your shopping cart</p>
          <Link href="/auth" className="btn-primary">
            Login Now
          </Link>
        </div>
      ) : cartItems.length === 0 ? (
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
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-xl font-medium text-dark mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet</p>
          <Link href="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium text-dark">Cart Items ({cartItems.length})</h2>
              </div>
              
              <div className="divide-y">
                {cartItems.map(item => (
                  <div key={item.id} className="p-4 flex">
                    <div className="w-24 h-24 flex-shrink-0">
                      {item.product ? (
                        <Link href={`/product/${item.productId}`}>
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        </Link>
                      ) : (
                        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          {item.product ? (
                            <Link href={`/product/${item.productId}`} className="text-dark font-medium hover:text-primary">
                              {item.product.name}
                            </Link>
                          ) : (
                            <Skeleton className="h-5 w-40 mb-2" />
                          )}
                          
                          {item.product && (
                            <div className="text-xs text-gray-500 mb-2">Brand: {item.product.brand}</div>
                          )}
                        </div>
                        
                        <div className="mt-2 sm:mt-0 sm:text-right">
                          {item.product ? (
                            <div className="font-medium text-dark">
                              ₹{((item.product.discountedPrice || item.product.price) * item.quantity).toLocaleString()}
                            </div>
                          ) : (
                            <Skeleton className="h-5 w-20 inline-block" />
                          )}
                          
                          {item.product?.discountedPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              ₹{(item.product.price * item.quantity).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-dark disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="mx-3 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-dark"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-sm text-gray-500 hover:text-error flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded shadow-sm overflow-hidden sticky top-24">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium text-dark">Order Summary</h2>
              </div>
              
              <div className="p-4">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-dark">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className={deliveryCharge === 0 ? "text-success" : "text-dark"}>
                      {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  {deliveryCharge > 0 && (
                    <div className="text-xs text-gray-500">
                      Add items worth ₹{(500 - subtotal).toLocaleString()} more for free delivery
                    </div>
                  )}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-medium">
                      <span className="text-dark">Total</span>
                      <span className="text-dark">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3 mb-3 flex items-center justify-center disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </button>
                
                <Link href="/products" className="block text-center text-primary text-sm">
                  Continue Shopping
                </Link>
              </div>
              
              <div className="p-4 bg-gray-50 text-xs text-gray-500">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-success mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Safe & Secure Payments
                </div>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-success mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Easy Returns & Refunds
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
