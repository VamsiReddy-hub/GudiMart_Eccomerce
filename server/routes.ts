import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import OpenAI from "openai";
import { 
  insertUserSchema, 
  insertCartSchema, 
  insertChatMessageSchema, 
  insertEventSchema,
  insertTeamMemberSchema,
  insertSocialPlatformSchema,
  insertSocialAccountSchema,
  insertContentPostSchema,
  insertContentApprovalSchema,
  insertCalendarEntrySchema 
} from "@shared/schema";
import { setupAuth } from "./auth";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-demo-key" });

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiRouter = "/api";
  
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);
  
  // Category routes
  app.get(`${apiRouter}/categories`, async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  app.get(`${apiRouter}/categories/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  
  // Product routes
  app.get(`${apiRouter}/products`, async (req: Request, res: Response) => {
    try {
      const filters: any = {};
      
      // Parse filter parameters
      if (req.query.categoryId) {
        filters.categoryId = parseInt(req.query.categoryId as string);
      }
      
      if (req.query.minPrice) {
        filters.minPrice = parseFloat(req.query.minPrice as string);
      }
      
      if (req.query.maxPrice) {
        filters.maxPrice = parseFloat(req.query.maxPrice as string);
      }
      
      if (req.query.brand) {
        filters.brand = Array.isArray(req.query.brand)
          ? req.query.brand
          : [req.query.brand as string];
      }
      
      if (req.query.rating) {
        filters.rating = parseFloat(req.query.rating as string);
      }
      
      if (req.query.inStock) {
        filters.inStock = req.query.inStock === 'true';
      }
      
      if (req.query.searchTerm) {
        filters.searchTerm = req.query.searchTerm as string;
      }
      
      if (req.query.sortBy) {
        filters.sortBy = req.query.sortBy as string;
      }
      
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  
  app.get(`${apiRouter}/products/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  
  app.get(`${apiRouter}/products/category/:categoryId`, async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const products = await storage.getProductsByCategory(categoryId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });
  
  // Cart routes
  app.get(`${apiRouter}/cart/:userId`, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const cartItems = await storage.getCartItems(userId);
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json(cartWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  
  app.post(`${apiRouter}/cart`, async (req: Request, res: Response) => {
    try {
      const cartItem = insertCartSchema.parse(req.body);
      const addedItem = await storage.addToCart(cartItem);
      
      const product = await storage.getProduct(addedItem.productId);
      
      res.status(201).json({
        ...addedItem,
        product
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  
  app.put(`${apiRouter}/cart/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = z.object({
        quantity: z.number().min(1)
      }).parse(req.body);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      const updatedItem = await storage.updateCartItem(id, quantity);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      const product = await storage.getProduct(updatedItem.productId);
      
      res.json({
        ...updatedItem,
        product
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  
  app.delete(`${apiRouter}/cart/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      const removed = await storage.removeFromCart(id);
      
      if (!removed) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });
  
  app.delete(`${apiRouter}/cart/user/:userId`, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  
  // Chat routes
  app.get(`${apiRouter}/chat/:userId`, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });
  
  app.post(`${apiRouter}/chat`, async (req: Request, res: Response) => {
    try {
      const userMessage = insertChatMessageSchema.parse(req.body);
      
      // Store user message
      await storage.addChatMessage(userMessage);
      
      // Get chat history for context
      const chatHistory = await storage.getChatMessages(userMessage.userId);
      
      // Prepare message history for OpenAI
      const messages = chatHistory.map(msg => ({
        role: msg.isBot ? "assistant" : "user",
        content: msg.message
      }));
      
      // Add system message for context
      messages.unshift({
        role: "system",
        content: "You are a helpful shopping assistant for GudiMart.com, an e-commerce platform. Help users find products, provide information about shipping, returns, and answer general questions about shopping on our platform. Keep responses concise and friendly."
      });
      
      // Get AI response
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: messages as any,
        max_tokens: 250
      });
      
      const botMessage = response.choices[0].message.content || "";
      
      // Store bot response
      const savedBotMessage = await storage.addChatMessage({
        userId: userMessage.userId,
        isBot: true,
        message: botMessage
      });
      
      res.status(201).json(savedBotMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });
  
  // ------------------------------------------------------------
  // Social Media Content Scheduling API Routes
  // ------------------------------------------------------------
  
  // Event routes
  app.get(`${apiRouter}/events`, async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const events = await storage.getEvents(userId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  
  app.get(`${apiRouter}/events/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });
  
  app.post(`${apiRouter}/events`, async (req: Request, res: Response) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });
  
  app.put(`${apiRouter}/events/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const eventData = insertEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateEvent(id, eventData);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });
  
  app.delete(`${apiRouter}/events/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const deleted = await storage.deleteEvent(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });
  
  // Team member routes
  app.get(`${apiRouter}/events/:eventId/team`, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const teamMembers = await storage.getTeamMembers(eventId);
      res.json(teamMembers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });
  
  app.get(`${apiRouter}/users/:userId/teams`, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const memberships = await storage.getUserTeamMemberships(userId);
      res.json(memberships);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team memberships" });
    }
  });
  
  app.post(`${apiRouter}/team-members`, async (req: Request, res: Response) => {
    try {
      const memberData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add team member" });
    }
  });
  
  app.put(`${apiRouter}/team-members/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid team member ID" });
      }
      
      const memberData = insertTeamMemberSchema.partial().parse(req.body);
      const updatedMember = await storage.updateTeamMember(id, memberData);
      
      if (!updatedMember) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json(updatedMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update team member" });
    }
  });
  
  app.delete(`${apiRouter}/team-members/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid team member ID" });
      }
      
      const removed = await storage.removeTeamMember(id);
      
      if (!removed) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json({ message: "Team member removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove team member" });
    }
  });
  
  // Social platform routes
  app.get(`${apiRouter}/social-platforms`, async (_req: Request, res: Response) => {
    try {
      const platforms = await storage.getSocialPlatforms();
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social platforms" });
    }
  });
  
  // Social account routes
  app.get(`${apiRouter}/events/:eventId/social-accounts`, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const accounts = await storage.getSocialAccounts(eventId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social accounts" });
    }
  });
  
  app.post(`${apiRouter}/social-accounts`, async (req: Request, res: Response) => {
    try {
      const accountData = insertSocialAccountSchema.parse(req.body);
      const account = await storage.createSocialAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add social account" });
    }
  });
  
  app.put(`${apiRouter}/social-accounts/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid account ID" });
      }
      
      const accountData = insertSocialAccountSchema.partial().parse(req.body);
      const updatedAccount = await storage.updateSocialAccount(id, accountData);
      
      if (!updatedAccount) {
        return res.status(404).json({ message: "Social account not found" });
      }
      
      res.json(updatedAccount);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update social account" });
    }
  });
  
  app.delete(`${apiRouter}/social-accounts/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid account ID" });
      }
      
      const deleted = await storage.deleteSocialAccount(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Social account not found" });
      }
      
      res.json({ message: "Social account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete social account" });
    }
  });
  
  // Content post routes
  app.get(`${apiRouter}/content-posts`, async (req: Request, res: Response) => {
    try {
      const filters: any = {};
      
      // Parse filter parameters
      if (req.query.eventId) {
        filters.eventId = parseInt(req.query.eventId as string);
      }
      
      if (req.query.creatorId) {
        filters.creatorId = parseInt(req.query.creatorId as string);
      }
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      if (req.query.platform) {
        filters.platform = parseInt(req.query.platform as string);
      }
      
      if (req.query.tag) {
        filters.tag = req.query.tag as string;
      }
      
      if (req.query.searchTerm) {
        filters.searchTerm = req.query.searchTerm as string;
      }
      
      if (req.query.sortBy) {
        filters.sortBy = req.query.sortBy as string;
      }
      
      const posts = await storage.getContentPosts(filters);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content posts" });
    }
  });
  
  app.get(`${apiRouter}/content-posts/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getContentPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Content post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content post" });
    }
  });
  
  app.post(`${apiRouter}/content-posts`, async (req: Request, res: Response) => {
    try {
      const postData = insertContentPostSchema.parse(req.body);
      const post = await storage.createContentPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create content post" });
    }
  });
  
  app.put(`${apiRouter}/content-posts/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const postData = insertContentPostSchema.partial().parse(req.body);
      const updatedPost = await storage.updateContentPost(id, postData);
      
      if (!updatedPost) {
        return res.status(404).json({ message: "Content post not found" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update content post" });
    }
  });
  
  app.delete(`${apiRouter}/content-posts/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const deleted = await storage.deleteContentPost(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Content post not found" });
      }
      
      res.json({ message: "Content post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete content post" });
    }
  });
  
  // Content approval routes
  app.get(`${apiRouter}/content-posts/:postId/approvals`, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const approvals = await storage.getContentApprovals(postId);
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content approvals" });
    }
  });
  
  app.post(`${apiRouter}/content-approvals`, async (req: Request, res: Response) => {
    try {
      const approvalData = insertContentApprovalSchema.parse(req.body);
      const approval = await storage.createContentApproval(approvalData);
      res.status(201).json(approval);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create content approval" });
    }
  });
  
  // Calendar routes
  app.get(`${apiRouter}/events/:eventId/calendar`, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      let month: number | undefined;
      let year: number | undefined;
      
      if (req.query.month && req.query.year) {
        month = parseInt(req.query.month as string);
        year = parseInt(req.query.year as string);
      }
      
      const entries = await storage.getCalendarEntries(eventId, month, year);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar entries" });
    }
  });
  
  app.post(`${apiRouter}/calendar-entries`, async (req: Request, res: Response) => {
    try {
      const entryData = insertCalendarEntrySchema.parse(req.body);
      const entry = await storage.createCalendarEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create calendar entry" });
    }
  });
  
  app.put(`${apiRouter}/calendar-entries/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const entryData = insertCalendarEntrySchema.partial().parse(req.body);
      const updatedEntry = await storage.updateCalendarEntry(id, entryData);
      
      if (!updatedEntry) {
        return res.status(404).json({ message: "Calendar entry not found" });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update calendar entry" });
    }
  });
  
  app.delete(`${apiRouter}/calendar-entries/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const deleted = await storage.deleteCalendarEntry(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Calendar entry not found" });
      }
      
      res.json({ message: "Calendar entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete calendar entry" });
    }
  });
  
  // Generate post content with AI
  app.post(`${apiRouter}/ai/generate-content`, async (req: Request, res: Response) => {
    try {
      const { prompt, eventId, platform } = z.object({
        prompt: z.string(),
        eventId: z.number(),
        platform: z.number().optional()
      }).parse(req.body);
      
      // Get event information for context
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Get platform information if specified
      let platformInfo = null;
      if (platform) {
        platformInfo = await storage.getSocialPlatform(platform);
      }
      
      // Create prompt for AI
      let systemPrompt = `You are a social media content creator for an event named "${event.name}". `;
      systemPrompt += `The event is described as: "${event.description || 'No description available'}". `;
      
      if (platformInfo) {
        systemPrompt += `Create engaging content specifically for ${platformInfo.name}. `;
      } else {
        systemPrompt += "Create engaging social media content. ";
      }
      
      systemPrompt += "Your job is to craft compelling, concise content that will engage the target audience.";
      
      // Get AI response
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 500
      });
      
      const generatedContent = response.choices[0].message.content || "";
      
      res.json({ 
        content: generatedContent,
        event: event.name,
        platform: platformInfo ? platformInfo.name : 'Generic'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("AI Content Generation error:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
