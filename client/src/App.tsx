import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CartItem, Product } from "@shared/schema";
import { CartItemWithProduct, AppState } from "./types";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import Layout from "./components/Layout";
import Home from "./pages/home";
import Products from "./pages/products";
import ProductDetail from "./pages/product-detail";
import Cart from "./pages/cart";
import NotFound from "./pages/not-found";
import Events from "./pages/events";
import ContentPosts from "./pages/content-posts";
import ContentCalendar from "./pages/content-calendar";
import AuthPage from "./pages/auth-page";
import { apiRequest } from "./lib/queryClient";

// Initial app state (without user data which is now in AuthContext)
const initialState: AppState = {
  cart: [],
  totalItems: 0,
  categoryFilter: null,
  searchTerm: ""
};

function AppContent() {
  const [location] = useLocation();
  const [state, setState] = useState<AppState>(initialState);
  const queryClient = useQueryClient();
  const { user, logoutMutation } = useAuth();

  // Fetch cart data when user is logged in
  const { data: cartData } = useQuery({
    queryKey: ['/api/cart', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await apiRequest("GET", `/api/cart/${user.id}`);
      return await response.json();
    },
    enabled: !!user
  });

  // Update cart in state when data changes
  useEffect(() => {
    if (cartData) {
      const totalItems = cartData.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      
      setState(prev => ({
        ...prev,
        cart: cartData,
        totalItems
      }));
    }
  }, [cartData]);

  // Handle search term changes
  const handleSearch = (term: string) => {
    setState(prev => ({
      ...prev,
      searchTerm: term
    }));
  };

  // Handle category filter changes
  const handleCategoryFilter = (categoryId: number | null) => {
    setState(prev => ({
      ...prev,
      categoryFilter: categoryId
    }));
    
    // Navigate to products page if not already there
    if (location !== "/products") {
      window.history.pushState(null, "", "/products");
    }
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
    setState(prev => ({
      ...prev,
      cart: [],
      totalItems: 0
    }));
  };

  // Handle add to cart
  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    if (!user) return;
    
    try {
      await apiRequest("POST", "/api/cart", {
        userId: user.id,
        productId: product.id,
        quantity
      });
      
      // Refresh cart data
      queryClient.invalidateQueries({ queryKey: ['/api/cart', user.id] });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <Layout 
      user={user}
      cartItemCount={state.totalItems}
      onSearch={handleSearch}
      onCategorySelect={handleCategoryFilter}
      onLogout={handleLogout}
    >
      <Switch>
        {/* Auth route */}
        <Route path="/auth" component={AuthPage} />
        
        {/* E-commerce routes */}
        <Route path="/" component={() => <Home onCategorySelect={handleCategoryFilter} />} />
        <Route 
          path="/products" 
          component={() => (
            <Products 
              searchTerm={state.searchTerm} 
              categoryFilter={state.categoryFilter}
              onAddToCart={handleAddToCart}
            />
          )} 
        />
        <Route 
          path="/product/:id" 
          component={(params: any) => (
            <ProductDetail 
              productId={parseInt(params.id)} 
              onAddToCart={handleAddToCart}
            />
          )} 
        />
        
        {/* Protected routes that require authentication */}
        <ProtectedRoute 
          path="/cart" 
          component={() => (
            <Cart 
              cartItems={state.cart as CartItemWithProduct[]} 
              userId={user?.id}
            />
          )} 
        />
        
        {/* Content scheduling routes - all protected */}
        <ProtectedRoute 
          path="/events" 
          component={() => (
            <Events userId={user?.id} />
          )}
        />
        <ProtectedRoute 
          path="/events/:eventId/content" 
          component={() => (
            <ContentPosts />
          )}
        />
        <ProtectedRoute 
          path="/events/:eventId/calendar" 
          component={() => (
            <ContentCalendar />
          )}
        />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
