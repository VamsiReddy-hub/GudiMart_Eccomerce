import { 
  User, InsertUser, 
  Category, InsertCategory, 
  Product, InsertProduct, 
  CartItem, InsertCart,
  ChatMessage, InsertChatMessage,
  Event, InsertEvent,
  TeamMember, InsertTeamMember,
  SocialPlatform, InsertSocialPlatform,
  SocialAccount, InsertSocialAccount,
  ContentPost, InsertContentPost,
  ContentApproval, InsertContentApproval,
  CalendarEntry, InsertCalendarEntry
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(userId: number, productId: number): Promise<CartItem | undefined>;
  addToCart(cartItem: InsertCart): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Chat operations
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Event operations
  getEvents(userId?: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Team operations
  getTeamMembers(eventId: number): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  getUserTeamMemberships(userId: number): Promise<TeamMember[]>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  removeTeamMember(id: number): Promise<boolean>;
  
  // Social platform operations
  getSocialPlatforms(): Promise<SocialPlatform[]>;
  getSocialPlatform(id: number): Promise<SocialPlatform | undefined>;
  createSocialPlatform(platform: InsertSocialPlatform): Promise<SocialPlatform>;
  updateSocialPlatform(id: number, data: Partial<InsertSocialPlatform>): Promise<SocialPlatform | undefined>;
  
  // Social account operations
  getSocialAccounts(eventId: number): Promise<SocialAccount[]>;
  getSocialAccount(id: number): Promise<SocialAccount | undefined>;
  createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccount(id: number, data: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined>;
  deleteSocialAccount(id: number): Promise<boolean>;
  
  // Content post operations
  getContentPosts(filters: ContentPostFilters): Promise<ContentPost[]>;
  getContentPost(id: number): Promise<ContentPost | undefined>;
  createContentPost(post: InsertContentPost): Promise<ContentPost>;
  updateContentPost(id: number, data: Partial<InsertContentPost>): Promise<ContentPost | undefined>;
  deleteContentPost(id: number): Promise<boolean>;
  
  // Content approval operations
  getContentApprovals(postId: number): Promise<ContentApproval[]>;
  getContentApproval(id: number): Promise<ContentApproval | undefined>;
  createContentApproval(approval: InsertContentApproval): Promise<ContentApproval>;
  
  // Calendar operations
  getCalendarEntries(eventId: number, month?: number, year?: number): Promise<CalendarEntry[]>;
  getCalendarEntry(id: number): Promise<CalendarEntry | undefined>;
  createCalendarEntry(entry: InsertCalendarEntry): Promise<CalendarEntry>;
  updateCalendarEntry(id: number, data: Partial<InsertCalendarEntry>): Promise<CalendarEntry | undefined>;
  deleteCalendarEntry(id: number): Promise<boolean>;
}

export interface ProductFilters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string[];
  rating?: number;
  inStock?: boolean;
  searchTerm?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export interface ContentPostFilters {
  eventId?: number;
  creatorId?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  platform?: number;
  tag?: string;
  searchTerm?: string;
  sortBy?: 'scheduled_asc' | 'scheduled_desc' | 'created_asc' | 'created_desc';
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private chatMessages: Map<number, ChatMessage>;
  private events: Map<number, Event>;
  private teamMembers: Map<number, TeamMember>;
  private socialPlatforms: Map<number, SocialPlatform>;
  private socialAccounts: Map<number, SocialAccount>;
  private contentPosts: Map<number, ContentPost>;
  private contentApprovals: Map<number, ContentApproval>;
  private calendarEntries: Map<number, CalendarEntry>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private productIdCounter: number;
  private cartIdCounter: number;
  private chatIdCounter: number;
  private eventIdCounter: number;
  private teamMemberIdCounter: number;
  private socialPlatformIdCounter: number;
  private socialAccountIdCounter: number;
  private contentPostIdCounter: number;
  private contentApprovalIdCounter: number;
  private calendarEntryIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.chatMessages = new Map();
    this.events = new Map();
    this.teamMembers = new Map();
    this.socialPlatforms = new Map();
    this.socialAccounts = new Map();
    this.contentPosts = new Map();
    this.contentApprovals = new Map();
    this.calendarEntries = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.productIdCounter = 1;
    this.cartIdCounter = 1;
    this.chatIdCounter = 1;
    this.eventIdCounter = 1;
    this.teamMemberIdCounter = 1;
    this.socialPlatformIdCounter = 1;
    this.socialAccountIdCounter = 1;
    this.contentPostIdCounter = 1;
    this.contentApprovalIdCounter = 1;
    this.calendarEntryIdCounter = 1;
    
    // Initialize with sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Add categories
    const categories: InsertCategory[] = [
      { name: "Electronics", description: "Latest gadgets & devices", icon: "laptop", color: "#2874f0" },
      { name: "Fashion", description: "Clothing, shoes & accessories", icon: "tshirt", color: "#ff9f00" },
      { name: "Home & Kitchen", description: "Appliances & home essentials", icon: "home", color: "#388e3c" },
      { name: "Beauty & Health", description: "Personal care & wellness", icon: "heartbeat", color: "#ff6161" }
    ];
    
    categories.forEach(category => this.createCategory(category));
    
    // Add social media platforms
    const platforms: InsertSocialPlatform[] = [
      { name: "Facebook", icon: "facebook", apiEndpoint: "https://graph.facebook.com/v18.0", active: true },
      { name: "Twitter", icon: "twitter", apiEndpoint: "https://api.twitter.com/2", active: true },
      { name: "Instagram", icon: "instagram", apiEndpoint: "https://graph.instagram.com", active: true },
      { name: "LinkedIn", icon: "linkedin", apiEndpoint: "https://api.linkedin.com/v2", active: true },
      { name: "TikTok", icon: "tiktok", apiEndpoint: "https://open-api.tiktok.com", active: true },
      { name: "YouTube", icon: "youtube", apiEndpoint: "https://www.googleapis.com/youtube/v3", active: true },
      { name: "Pinterest", icon: "pinterest", apiEndpoint: "https://api.pinterest.com/v5", active: true }
    ];
    
    platforms.forEach(platform => this.createSocialPlatform(platform));
    
    // Add products
    const products: InsertProduct[] = [
      {
        name: "Smartphone X Pro",
        description: "Latest flagship smartphone with high-end specifications",
        price: 15999,
        discountedPrice: 12999,
        discountPercentage: 18,
        categoryId: 1,
        brand: "TechX",
        imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97",
        rating: 4.5,
        reviewCount: 2345,
        inStock: true,
        deliveryTime: "Free delivery by tomorrow",
        specifications: { ram: "8GB", storage: "128GB", display: "6.5-inch AMOLED", camera: "108MP" }
      },
      {
        name: "Laptop ProBook",
        description: "Powerful laptop for professionals and creatives",
        price: 64999,
        discountedPrice: 52490,
        discountPercentage: 19,
        categoryId: 1,
        brand: "TechBook",
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302",
        rating: 4.3,
        reviewCount: 1120,
        inStock: true,
        deliveryTime: "Free delivery in 2 days",
        specifications: { processor: "Intel i7", ram: "16GB", storage: "512GB SSD", display: "15.6-inch 4K" }
      },
      {
        name: "Smart Watch Ultra",
        description: "Premium smartwatch with health monitoring features",
        price: 35900,
        discountedPrice: 32900,
        discountPercentage: 8,
        categoryId: 1,
        brand: "WatchTech",
        imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a",
        rating: 4.7,
        reviewCount: 3789,
        inStock: true,
        deliveryTime: "Free delivery by tomorrow",
        specifications: { display: "1.8-inch AMOLED", battery: "48 hours", waterproof: true }
      },
      {
        name: "Men's Formal Shirt",
        description: "Premium cotton formal shirt for professional occasions",
        price: 1499,
        discountedPrice: 799,
        discountPercentage: 47,
        categoryId: 2,
        brand: "FashionX",
        imageUrl: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3",
        rating: 4.1,
        reviewCount: 945,
        inStock: true,
        deliveryTime: "Free delivery in 2 days",
        specifications: { material: "100% Cotton", fit: "Regular", color: "Blue", size: "L" }
      },
      {
        name: "Smart TV 55-inch 4K Ultra HD",
        description: "4K Ultra HD Smart LED TV with HDR and voice control",
        price: 56990,
        discountedPrice: 42990,
        discountPercentage: 25,
        categoryId: 3,
        brand: "ViewTech",
        imageUrl: "https://images.unsplash.com/photo-1564275124027-9e6e2a3bbe0c",
        rating: 4.4,
        reviewCount: 2134,
        inStock: true,
        deliveryTime: "Free delivery in 3-5 days",
        specifications: { resolution: "4K Ultra HD", display: "LED", smart: true, hdmi: 3 }
      },
      {
        name: "Wireless Noise Cancelling Headphones",
        description: "Premium wireless headphones with active noise cancellation",
        price: 24990,
        discountedPrice: 18990,
        discountPercentage: 24,
        categoryId: 1,
        brand: "SoundX",
        imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c",
        rating: 4.6,
        reviewCount: 3421,
        inStock: true,
        deliveryTime: "Free delivery by tomorrow",
        specifications: { type: "Over-ear", batteryLife: "30 hours", anc: true, bluetooth: "5.0" }
      }
    ];
    
    products.forEach(product => this.createProduct(product));
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Product operations
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (filters) {
      if (filters.categoryId) {
        products = products.filter(p => p.categoryId === filters.categoryId);
      }
      
      if (filters.minPrice !== undefined) {
        products = products.filter(p => {
          const price = p.discountedPrice ?? p.price;
          return price >= filters.minPrice!;
        });
      }
      
      if (filters.maxPrice !== undefined) {
        products = products.filter(p => {
          const price = p.discountedPrice ?? p.price;
          return price <= filters.maxPrice!;
        });
      }
      
      if (filters.brand && filters.brand.length > 0) {
        products = products.filter(p => filters.brand!.includes(p.brand));
      }
      
      if (filters.rating !== undefined) {
        products = products.filter(p => p.rating >= filters.rating!);
      }
      
      if (filters.inStock !== undefined) {
        products = products.filter(p => p.inStock === filters.inStock);
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(term) || 
          p.description.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term)
        );
      }
      
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            products.sort((a, b) => {
              const priceA = a.discountedPrice ?? a.price;
              const priceB = b.discountedPrice ?? b.price;
              return priceA - priceB;
            });
            break;
          case 'price_desc':
            products.sort((a, b) => {
              const priceA = a.discountedPrice ?? a.price;
              const priceB = b.discountedPrice ?? b.price;
              return priceB - priceA;
            });
            break;
          case 'rating':
            products.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
            products.sort((a, b) => {
              const dateA = new Date(a.createdAt);
              const dateB = new Date(b.createdAt);
              return dateB.getTime() - dateA.getTime();
            });
            break;
        }
      }
    }
    
    return products;
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.categoryId === categoryId
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const createdAt = new Date();
    const newProduct: Product = { ...product, id, createdAt };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      item => item.userId === userId
    );
  }
  
  async getCartItem(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      item => item.userId === userId && item.productId === productId
    );
  }
  
  async addToCart(cartItem: InsertCart): Promise<CartItem> {
    // Check if item already exists
    const existingItem = await this.getCartItem(cartItem.userId, cartItem.productId);
    
    if (existingItem) {
      // Update quantity
      return this.updateCartItem(existingItem.id, existingItem.quantity + cartItem.quantity) as Promise<CartItem>;
    }
    
    // Create new item
    const id = this.cartIdCounter++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    
    if (!cartItem) {
      return undefined;
    }
    
    const updatedItem: CartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const cartIds: number[] = [];
    
    this.cartItems.forEach((item, id) => {
      if (item.userId === userId) {
        cartIds.push(id);
      }
    });
    
    cartIds.forEach(id => this.cartItems.delete(id));
    return true;
  }
  
  // Chat operations
  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatIdCounter++;
    const timestamp = new Date();
    const newMessage: ChatMessage = { ...message, id, timestamp };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }
  
  // User update operation
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Event operations
  async getEvents(userId?: number): Promise<Event[]> {
    let events = Array.from(this.events.values());
    
    if (userId) {
      events = events.filter(event => event.organizerId === userId);
    }
    
    return events.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const createdAt = new Date();
    const newEvent: Event = { ...event, id, createdAt };
    this.events.set(id, newEvent);
    return newEvent;
  }
  
  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    
    if (!event) {
      return undefined;
    }
    
    const updatedEvent: Event = { ...event, ...eventData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Team member operations
  async getTeamMembers(eventId: number): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values())
      .filter(member => member.eventId === eventId);
  }
  
  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }
  
  async getUserTeamMemberships(userId: number): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values())
      .filter(member => member.userId === userId);
  }
  
  async createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberIdCounter++;
    const createdAt = new Date();
    const newTeamMember: TeamMember = { ...teamMember, id, createdAt };
    this.teamMembers.set(id, newTeamMember);
    return newTeamMember;
  }
  
  async updateTeamMember(id: number, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const member = this.teamMembers.get(id);
    
    if (!member) {
      return undefined;
    }
    
    const updatedMember: TeamMember = { ...member, ...data };
    this.teamMembers.set(id, updatedMember);
    return updatedMember;
  }
  
  async removeTeamMember(id: number): Promise<boolean> {
    return this.teamMembers.delete(id);
  }
  
  // Social platform operations
  async getSocialPlatforms(): Promise<SocialPlatform[]> {
    return Array.from(this.socialPlatforms.values())
      .filter(platform => platform.active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  
  async getSocialPlatform(id: number): Promise<SocialPlatform | undefined> {
    return this.socialPlatforms.get(id);
  }
  
  async createSocialPlatform(platform: InsertSocialPlatform): Promise<SocialPlatform> {
    const id = this.socialPlatformIdCounter++;
    const newPlatform: SocialPlatform = { ...platform, id };
    this.socialPlatforms.set(id, newPlatform);
    return newPlatform;
  }
  
  async updateSocialPlatform(id: number, data: Partial<InsertSocialPlatform>): Promise<SocialPlatform | undefined> {
    const platform = this.socialPlatforms.get(id);
    
    if (!platform) {
      return undefined;
    }
    
    const updatedPlatform: SocialPlatform = { ...platform, ...data };
    this.socialPlatforms.set(id, updatedPlatform);
    return updatedPlatform;
  }
  
  // Social account operations
  async getSocialAccounts(eventId: number): Promise<SocialAccount[]> {
    return Array.from(this.socialAccounts.values())
      .filter(account => account.eventId === eventId);
  }
  
  async getSocialAccount(id: number): Promise<SocialAccount | undefined> {
    return this.socialAccounts.get(id);
  }
  
  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    const id = this.socialAccountIdCounter++;
    const createdAt = new Date();
    const newAccount: SocialAccount = { ...account, id, createdAt };
    this.socialAccounts.set(id, newAccount);
    return newAccount;
  }
  
  async updateSocialAccount(id: number, data: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined> {
    const account = this.socialAccounts.get(id);
    
    if (!account) {
      return undefined;
    }
    
    const updatedAccount: SocialAccount = { ...account, ...data };
    this.socialAccounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  async deleteSocialAccount(id: number): Promise<boolean> {
    return this.socialAccounts.delete(id);
  }
  
  // Content post operations
  async getContentPosts(filters: ContentPostFilters): Promise<ContentPost[]> {
    let posts = Array.from(this.contentPosts.values());
    
    if (filters.eventId !== undefined) {
      posts = posts.filter(post => post.eventId === filters.eventId);
    }
    
    if (filters.creatorId !== undefined) {
      posts = posts.filter(post => post.creatorId === filters.creatorId);
    }
    
    if (filters.status !== undefined) {
      posts = posts.filter(post => post.status === filters.status);
    }
    
    if (filters.startDate !== undefined) {
      posts = posts.filter(post => {
        if (!post.scheduledFor) return false;
        return new Date(post.scheduledFor) >= new Date(filters.startDate!);
      });
    }
    
    if (filters.endDate !== undefined) {
      posts = posts.filter(post => {
        if (!post.scheduledFor) return false;
        return new Date(post.scheduledFor) <= new Date(filters.endDate!);
      });
    }
    
    if (filters.platform !== undefined) {
      posts = posts.filter(post => {
        if (!post.platforms) return false;
        return (post.platforms as number[]).includes(filters.platform!);
      });
    }
    
    if (filters.tag !== undefined) {
      posts = posts.filter(post => {
        if (!post.tags) return false;
        return (post.tags as string[]).includes(filters.tag!);
      });
    }
    
    if (filters.searchTerm !== undefined) {
      const term = filters.searchTerm.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(term) || 
        post.content.toLowerCase().includes(term)
      );
    }
    
    if (filters.sortBy !== undefined) {
      switch (filters.sortBy) {
        case 'scheduled_asc':
          posts.sort((a, b) => {
            if (!a.scheduledFor) return 1;
            if (!b.scheduledFor) return -1;
            return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
          });
          break;
        case 'scheduled_desc':
          posts.sort((a, b) => {
            if (!a.scheduledFor) return 1;
            if (!b.scheduledFor) return -1;
            return new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime();
          });
          break;
        case 'created_asc':
          posts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'created_desc':
          posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    } else {
      // Default sort by scheduled date descending
      posts.sort((a, b) => {
        if (!a.scheduledFor) return 1;
        if (!b.scheduledFor) return -1;
        return new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime();
      });
    }
    
    return posts;
  }
  
  async getContentPost(id: number): Promise<ContentPost | undefined> {
    return this.contentPosts.get(id);
  }
  
  async createContentPost(post: InsertContentPost): Promise<ContentPost> {
    const id = this.contentPostIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newPost: ContentPost = { ...post, id, createdAt, updatedAt };
    this.contentPosts.set(id, newPost);
    return newPost;
  }
  
  async updateContentPost(id: number, data: Partial<InsertContentPost>): Promise<ContentPost | undefined> {
    const post = this.contentPosts.get(id);
    
    if (!post) {
      return undefined;
    }
    
    const updatedAt = new Date();
    const updatedPost: ContentPost = { ...post, ...data, updatedAt };
    this.contentPosts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deleteContentPost(id: number): Promise<boolean> {
    return this.contentPosts.delete(id);
  }
  
  // Content approval operations
  async getContentApprovals(postId: number): Promise<ContentApproval[]> {
    return Array.from(this.contentApprovals.values())
      .filter(approval => approval.postId === postId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getContentApproval(id: number): Promise<ContentApproval | undefined> {
    return this.contentApprovals.get(id);
  }
  
  async createContentApproval(approval: InsertContentApproval): Promise<ContentApproval> {
    const id = this.contentApprovalIdCounter++;
    const createdAt = new Date();
    const newApproval: ContentApproval = { ...approval, id, createdAt };
    this.contentApprovals.set(id, newApproval);
    return newApproval;
  }
  
  // Calendar operations
  async getCalendarEntries(eventId: number, month?: number, year?: number): Promise<CalendarEntry[]> {
    let entries = Array.from(this.calendarEntries.values())
      .filter(entry => entry.eventId === eventId);
    
    if (month !== undefined && year !== undefined) {
      entries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === month && entryDate.getFullYear() === year;
      });
    }
    
    return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  async getCalendarEntry(id: number): Promise<CalendarEntry | undefined> {
    return this.calendarEntries.get(id);
  }
  
  async createCalendarEntry(entry: InsertCalendarEntry): Promise<CalendarEntry> {
    const id = this.calendarEntryIdCounter++;
    const createdAt = new Date();
    const newEntry: CalendarEntry = { ...entry, id, createdAt };
    this.calendarEntries.set(id, newEntry);
    return newEntry;
  }
  
  async updateCalendarEntry(id: number, data: Partial<InsertCalendarEntry>): Promise<CalendarEntry | undefined> {
    const entry = this.calendarEntries.get(id);
    
    if (!entry) {
      return undefined;
    }
    
    const updatedEntry: CalendarEntry = { ...entry, ...data };
    this.calendarEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  async deleteCalendarEntry(id: number): Promise<boolean> {
    return this.calendarEntries.delete(id);
  }
}

export const storage = new MemStorage();
