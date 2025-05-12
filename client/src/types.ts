import { Category, Product, User, CartItem } from "@shared/schema";

export interface ProductWithQuantity extends Product {
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  product?: Product;
}

export interface FilterState {
  minPrice?: number;
  maxPrice?: number;
  brands: string[];
  rating?: number;
  inStock: boolean;
}

export interface ChatMessage {
  id: number;
  userId: number;
  isBot: boolean;
  message: string;
  timestamp: Date;
}

export interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  cart: CartItemWithProduct[];
  totalItems: number;
  categoryFilter: number | null;
  searchTerm: string;
}
