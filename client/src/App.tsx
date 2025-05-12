import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User, CartItem, Product } from "@shared/schema";
import { CartItemWithProduct, AppState } from "./types";
import Layout from "./components/Layout";
import Home from "./pages/home";
import Products from "./pages/products";
import ProductDetail from "./pages/product-detail";
import Cart from "./pages/cart";
import Login from "./pages/login";
import NotFound from "./pages/not-found";
import { apiRequest } from "./lib/queryClient";

// Initial app state
const initialState: AppState = {
  user: null,
  isLoggedIn: false,
  cart: [],
  totalItems: 0,
  categoryFilter: null,
  searchTerm: ""
};

function App() {
  const [location] = useLocation();
  const [state, setState] = useState<AppState>(initialState);
  const queryClient = useQueryClient();

  // For demo purposes - set a default user
  useEffect(() => {
    const demoUser: User = {
      id: 1,
      username: "demo_user",
      password: "password",
      email: "demo@example.com",
      name: "Demo User",
      createdAt: new Date()
    };
    
    setState(prev => ({
      ...prev,
      user: demoUser,
      isLoggedIn: true
    }));
  }, []);

  // Fetch cart data when user is logged in
  const { data: cartData } = useQuery({
    queryKey: ['/api/cart', state.user?.id],
    queryFn: async () => {
      if (!state.user) return [];
      const response = await apiRequest("GET", `/api/cart/${state.user.id}`);
      return await response.json();
    },
    enabled: !!state.user
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

  // Handle login
  const handleLogin = (user: User) => {
    setState(prev => ({
      ...prev,
      user,
      isLoggedIn: true
    }));
    
    // Fetch cart data after login
    queryClient.invalidateQueries({ queryKey: ['/api/cart', user.id] });
  };

  // Handle logout
  const handleLogout = () => {
    setState(prev => ({
      ...prev,
      user: null,
      isLoggedIn: false,
      cart: [],
      totalItems: 0
    }));
  };

  // Handle add to cart
  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    if (!state.user) return;
    
    try {
      await apiRequest("POST", "/api/cart", {
        userId: state.user.id,
        productId: product.id,
        quantity
      });
      
      // Refresh cart data
      queryClient.invalidateQueries({ queryKey: ['/api/cart', state.user.id] });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <Layout 
      user={state.user}
      cartItemCount={state.totalItems}
      onSearch={handleSearch}
      onCategorySelect={handleCategoryFilter}
      onLogout={handleLogout}
    >
      <Switch>
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
          component={(params) => (
            <ProductDetail 
              productId={parseInt(params.id)} 
              onAddToCart={handleAddToCart}
            />
          )} 
        />
        <Route 
          path="/cart" 
          component={() => (
            <Cart 
              cartItems={state.cart as CartItemWithProduct[]} 
              userId={state.user?.id}
            />
          )} 
        />
        <Route path="/login" component={() => <Login onLogin={handleLogin} />} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default App;
