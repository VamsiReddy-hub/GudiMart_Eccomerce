import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  discountedPrice: doublePrecision("discounted_price"),
  discountPercentage: integer("discount_percentage"),
  categoryId: integer("category_id").notNull(),
  brand: text("brand").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  inStock: boolean("in_stock").default(true),
  deliveryTime: text("delivery_time").default("3-5 days"),
  specifications: json("specifications"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cart schema
export const cart = pgTable("cart", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

// Chat message schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  isBot: boolean("is_bot").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Event schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  organizerId: integer("organizer_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: text("location"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Team member schema
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventId: integer("event_id").notNull(),
  role: text("role").notNull(),
  permissions: json("permissions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Social media platforms
export const socialPlatforms = pgTable("social_platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon"),
  apiEndpoint: text("api_endpoint"),
  active: boolean("active").default(true),
});

// Social media accounts
export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  platformId: integer("platform_id").notNull(),
  accountName: text("account_name").notNull(),
  accountHandle: text("account_handle").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content posts
export const contentPosts = pgTable("content_posts", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  creatorId: integer("creator_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mediaUrls: json("media_urls"),
  status: text("status").default("draft"), // draft, scheduled, published, failed
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at"),
  platforms: json("platforms"), // Array of platform IDs
  tags: json("tags"), // Array of tags
  metrics: json("metrics"), // Engagement metrics
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Content approvals
export const contentApprovals = pgTable("content_approvals", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  approverId: integer("approver_id").notNull(),
  status: text("status").notNull(), // pending, approved, rejected
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content calendar entries
export const calendarEntries = pgTable("calendar_entries", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // post, milestone, reminder
  date: date("date").notNull(),
  time: text("time"),
  postId: integer("post_id"), // Optional reference to a post
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertCartSchema = createInsertSchema(cart).omit({ id: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, timestamp: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, createdAt: true });
export const insertSocialPlatformSchema = createInsertSchema(socialPlatforms).omit({ id: true });
export const insertSocialAccountSchema = createInsertSchema(socialAccounts).omit({ id: true, createdAt: true });
export const insertContentPostSchema = createInsertSchema(contentPosts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContentApprovalSchema = createInsertSchema(contentApprovals).omit({ id: true, createdAt: true });
export const insertCalendarEntrySchema = createInsertSchema(calendarEntries).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCart = z.infer<typeof insertCartSchema>;
export type CartItem = typeof cart.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export type InsertSocialPlatform = z.infer<typeof insertSocialPlatformSchema>;
export type SocialPlatform = typeof socialPlatforms.$inferSelect;

export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;
export type SocialAccount = typeof socialAccounts.$inferSelect;

export type InsertContentPost = z.infer<typeof insertContentPostSchema>;
export type ContentPost = typeof contentPosts.$inferSelect;

export type InsertContentApproval = z.infer<typeof insertContentApprovalSchema>;
export type ContentApproval = typeof contentApprovals.$inferSelect;

export type InsertCalendarEntry = z.infer<typeof insertCalendarEntrySchema>;
export type CalendarEntry = typeof calendarEntries.$inferSelect;
