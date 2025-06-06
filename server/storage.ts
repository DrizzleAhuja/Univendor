import {
  users,
  vendors,
  products,
  orders,
  orderItems,
  cartItems,
  otpCodes,
  categories,
  customDomains,
  type User,
  type InsertUser,
  type InsertVendor,
  type Vendor,
  type InsertProduct,
  type Product,
  type InsertOrder,
  type Order,
  type InsertOrderItem,
  type OrderItem,
  type InsertCartItem,
  type CartItem,
  type InsertCategory,
  type Category,
  type InsertOtp,
  type OtpCode,
  type CustomDomain,
  type InsertCustomDomain,
  type ProductWithVendor,
  type OrderWithItems,
  type CartItemWithProduct,
  type VendorWithOwner,
  type CategoryWithChildren,
  type CustomDomainWithVendor,
  type UserWithCreator,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, lt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // OTP operations
  createOtp(otp: InsertOtp): Promise<OtpCode>;
  getValidOtp(email: string, code: string): Promise<OtpCode | undefined>;
  markOtpAsUsed(id: number): Promise<void>;
  cleanupExpiredOtps(): Promise<void>;
  
  // Vendor operations
  getVendors(): Promise<VendorWithOwner[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  getVendorByDomain(domain: string): Promise<Vendor | undefined>;
  getVendorByOwner(ownerId: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  
  // Product operations
  getProducts(vendorId?: number): Promise<ProductWithVendor[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(userId: number, productId: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(userId: number, productId: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Order operations
  getOrders(filters?: { customerId?: number; vendorId?: number }): Promise<OrderWithItems[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Custom domain operations
  getCustomDomains(): Promise<CustomDomainWithVendor[]>;
  getCustomDomain(id: number): Promise<CustomDomain | undefined>;
  createCustomDomain(domain: InsertCustomDomain): Promise<CustomDomain>;
  updateCustomDomain(id: number, domain: Partial<InsertCustomDomain>): Promise<CustomDomain | undefined>;
  deleteCustomDomain(id: number): Promise<boolean>;
  
  // Category operations
  getCategories(filters?: { vendorId?: number; isGlobal?: boolean }): Promise<CategoryWithChildren[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Admin operations
  getAllUsers(): Promise<UserWithCreator[]>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  impersonateUser(adminId: string, targetUserId: number): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // OTP operations
  async createOtp(otp: InsertOtp): Promise<OtpCode> {
    const [newOtp] = await db
      .insert(otpCodes)
      .values(otp)
      .returning();
    return newOtp;
  }

  async getValidOtp(email: string, code: string): Promise<OtpCode | undefined> {
    // Simple direct query to find the most recent OTP for this email
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.email, email),
          eq(otpCodes.code, code)
        )
      )
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    // Log what we found
    console.log('OTP check:', {
      provided: { email, code },
      found: otp ? {
        id: otp.id,
        code: otp.code,
        email: otp.email,
        isUsed: otp.isUsed,
        expiresAt: otp.expiresAt
      } : 'no matching OTP'
    });

    return otp;
  }

  async markOtpAsUsed(id: number): Promise<void> {
    await db
      .update(otpCodes)
      .set({ isUsed: true })
      .where(eq(otpCodes.id, id));
  }

  async cleanupExpiredOtps(): Promise<void> {
    await db
      .delete(otpCodes)
      .where(lt(otpCodes.expiresAt, new Date()));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Vendor operations
  async getVendors(): Promise<VendorWithOwner[]> {
    return await db
      .select()
      .from(vendors)
      .leftJoin(users, eq(vendors.ownerId, users.id))
      .then(rows => rows.map(row => ({
        ...row.vendors,
        owner: row.users!
      })));
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async getVendorByDomain(domain: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.domain, domain));
    return vendor;
  }

  async getVendorByOwner(ownerId: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.ownerId, ownerId));
    return vendor;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [updatedVendor] = await db
      .update(vendors)
      .set({ ...vendor, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor;
  }

  // Product operations
  async getProducts(vendorId?: number): Promise<ProductWithVendor[]> {
    const query = db
      .select()
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.id))
      .where(vendorId ? eq(products.vendorId, vendorId) : undefined)
      .orderBy(desc(products.createdAt));

    return await query.then(rows => rows.map(row => ({
      ...row.products,
      vendor: row.vendors!
    })));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    return await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(vendors, eq(products.vendorId, vendors.id))
      .where(eq(cartItems.userId, userId))
      .then(rows => rows.map(row => ({
        ...row.cart_items,
        product: {
          ...row.products!,
          vendor: row.vendors!
        }
      })));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, item.userId),
        eq(cartItems.productId, item.productId)
      ));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + item.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db.insert(cartItems).values(item).returning();
      return newItem;
    }
  }

  async updateCartItem(userId: string, productId: number, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await this.removeFromCart(userId, productId);
      return undefined;
    }

    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId)
      ))
      .returning();
    return updatedItem;
  }

  async removeFromCart(userId: string, productId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId)
      ));
    return result.rowCount > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return result.rowCount > 0;
  }

  // Order operations
  async getOrders(filters?: { customerId?: string; vendorId?: number }): Promise<OrderWithItems[]> {
    let query = db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .leftJoin(vendors, eq(orders.vendorId, vendors.id))
      .orderBy(desc(orders.createdAt));

    if (filters?.customerId) {
      query = query.where(eq(orders.customerId, filters.customerId));
    }
    if (filters?.vendorId) {
      query = query.where(eq(orders.vendorId, filters.vendorId));
    }

    const orderRows = await query;
    
    // Get order items for each order
    const ordersWithItems: OrderWithItems[] = [];
    for (const row of orderRows) {
      const items = await db
        .select()
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, row.orders.id));

      ordersWithItems.push({
        ...row.orders,
        customer: row.users!,
        vendor: row.vendors!,
        items: items.map(item => ({
          ...item.order_items,
          product: item.products!
        }))
      });
    }

    return ordersWithItems;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const [orderRow] = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .leftJoin(vendors, eq(orders.vendorId, vendors.id))
      .where(eq(orders.id, id));

    if (!orderRow) return undefined;

    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    return {
      ...orderRow.orders,
      customer: orderRow.users!,
      vendor: orderRow.vendors!,
      items: items.map(item => ({
        ...item.order_items,
        product: item.products!
      }))
    };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id
    }));
    
    await db.insert(orderItems).values(orderItemsWithOrderId);
    
    const createdOrder = await this.getOrder(newOrder.id);
    return createdOrder!;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Custom domain operations
  async getCustomDomains(): Promise<CustomDomainWithVendor[]> {
    const domains = await db
      .select()
      .from(customDomains)
      .leftJoin(vendors, eq(customDomains.vendorId, vendors.id))
      .orderBy(customDomains.createdAt);
    
    return domains.map(({ custom_domains, vendors: vendor }) => ({
      ...custom_domains,
      vendor: vendor || undefined,
    }));
  }

  async getCustomDomain(id: number): Promise<CustomDomain | undefined> {
    const [domain] = await db.select().from(customDomains).where(eq(customDomains.id, id));
    return domain;
  }

  async createCustomDomain(domain: InsertCustomDomain): Promise<CustomDomain> {
    const [createdDomain] = await db
      .insert(customDomains)
      .values(domain)
      .returning();
    return createdDomain;
  }

  async updateCustomDomain(id: number, domain: Partial<InsertCustomDomain>): Promise<CustomDomain | undefined> {
    const [updatedDomain] = await db
      .update(customDomains)
      .set({ ...domain, updatedAt: new Date() })
      .where(eq(customDomains.id, id))
      .returning();
    return updatedDomain;
  }

  async deleteCustomDomain(id: number): Promise<boolean> {
    const result = await db.delete(customDomains).where(eq(customDomains.id, id));
    return result.rowCount! > 0;
  }

  // Admin operations
  async getAllUsers(): Promise<UserWithCreator[]> {
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(users.createdAt);
    
    return allUsers.map(user => ({
      ...user,
      createdBy: undefined, // Simplified for now - can be enhanced later
    }));
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    // Check if user is deletable
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user || user.isDeletable === false) {
      return false;
    }
    
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount! > 0;
  }

  // Category operations
  async getCategories(filters?: { vendorId?: number; isGlobal?: boolean }): Promise<CategoryWithChildren[]> {
    let query = db.select().from(categories);
    
    const conditions = [];
    
    if (filters?.vendorId !== undefined) {
      conditions.push(eq(categories.vendorId, filters.vendorId));
    }
    
    if (filters?.isGlobal !== undefined) {
      conditions.push(eq(categories.isGlobal, filters.isGlobal));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const result = await query.orderBy(categories.name);
    return result as CategoryWithChildren[];
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values({
        ...category,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set({
        ...category,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount! > 0;
  }

  async impersonateUser(adminId: string, targetUserId: number): Promise<User | undefined> {
    // Verify admin has permission
    const admin = await this.getUser(parseInt(adminId));
    if (!admin || (admin.role !== 'super_admin' && admin.role !== 'admin')) {
      return undefined;
    }
    
    const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId));
    return targetUser;
  }
}

export const storage = new DatabaseStorage();
