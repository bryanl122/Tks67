import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { SEED_PRODUCTS, img } from "./seed-data";
import type { Order, OrderItem, OrderStatus, Product } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "dropflow.db");

// Singleton: survives Next.js hot reloads in dev.
declare global {
  // eslint-disable-next-line no-var
  var __dropflowDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  seed(db);
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      compare_at_price INTEGER,
      image TEXT NOT NULL,
      gallery TEXT NOT NULL DEFAULT '[]',
      category TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      supplier TEXT NOT NULL DEFAULT '',
      rating REAL NOT NULL DEFAULT 0,
      reviews INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      country TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      subtotal INTEGER NOT NULL,
      shipping INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'card'
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  `);
}

function seed(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) AS c FROM products").get() as {
    c: number;
  };
  if (count.c > 0) return;

  const insert = db.prepare(`
    INSERT INTO products
      (slug, name, description, price, compare_at_price, image, gallery, category, stock, supplier, rating, reviews, featured)
    VALUES
      (@slug, @name, @description, @price, @compareAtPrice, @image, @gallery, @category, @stock, @supplier, @rating, @reviews, @featured)
  `);

  const tx = db.transaction(() => {
    for (const p of SEED_PRODUCTS) {
      insert.run({
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        image: img(p.imageSeed, 1),
        gallery: JSON.stringify([
          img(p.imageSeed, 1),
          img(p.imageSeed, 2),
          img(p.imageSeed, 3),
        ]),
        category: p.category,
        stock: p.stock,
        supplier: p.supplier,
        rating: p.rating,
        reviews: p.reviews,
        featured: p.featured,
      });
    }
  });
  tx();
}

export function getDb(): Database.Database {
  if (!global.__dropflowDb) {
    global.__dropflowDb = createConnection();
  }
  return global.__dropflowDb;
}

// ---- Row mapping ---------------------------------------------------------

interface ProductRow {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  image: string;
  gallery: string;
  category: string;
  stock: number;
  supplier: string;
  rating: number;
  reviews: number;
  featured: number;
  created_at: string;
}

function mapProduct(row: ProductRow): Product {
  let gallery: string[] = [];
  try {
    gallery = JSON.parse(row.gallery);
  } catch {
    gallery = [row.image];
  }
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    image: row.image,
    gallery,
    category: row.category,
    stock: row.stock,
    supplier: row.supplier,
    rating: row.rating,
    reviews: row.reviews,
    featured: row.featured,
    createdAt: row.created_at,
  };
}

// ---- Product queries -----------------------------------------------------

export interface ProductQuery {
  category?: string;
  search?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  featured?: boolean;
  limit?: number;
}

export function getProducts(q: ProductQuery = {}): Product[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: Record<string, unknown> = {};

  if (q.category) {
    clauses.push("category = @category");
    params.category = q.category;
  }
  if (q.search) {
    clauses.push("(name LIKE @search OR description LIKE @search)");
    params.search = `%${q.search}%`;
  }
  if (q.featured) {
    clauses.push("featured = 1");
  }

  let order = "created_at DESC, id DESC";
  switch (q.sort) {
    case "price-asc":
      order = "price ASC";
      break;
    case "price-desc":
      order = "price DESC";
      break;
    case "popular":
      order = "reviews DESC";
      break;
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = q.limit ? `LIMIT ${Number(q.limit)}` : "";
  const rows = db
    .prepare(`SELECT * FROM products ${where} ORDER BY ${order} ${limit}`)
    .all(params) as ProductRow[];
  return rows.map(mapProduct);
}

export function getProductBySlug(slug: string): Product | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM products WHERE slug = ?")
    .get(slug) as ProductRow | undefined;
  return row ? mapProduct(row) : null;
}

export function getProductById(id: number): Product | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(id) as ProductRow | undefined;
  return row ? mapProduct(row) : null;
}

export function getCategories(): { category: string; count: number }[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT category, COUNT(*) AS count FROM products GROUP BY category ORDER BY category"
    )
    .all() as { category: string; count: number }[];
}

export function createProduct(p: Omit<Product, "id" | "createdAt">): number {
  const db = getDb();
  const res = db
    .prepare(
      `INSERT INTO products
        (slug, name, description, price, compare_at_price, image, gallery, category, stock, supplier, rating, reviews, featured)
       VALUES
        (@slug, @name, @description, @price, @compareAtPrice, @image, @gallery, @category, @stock, @supplier, @rating, @reviews, @featured)`
    )
    .run({
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      image: p.image,
      gallery: JSON.stringify(p.gallery),
      category: p.category,
      stock: p.stock,
      supplier: p.supplier,
      rating: p.rating,
      reviews: p.reviews,
      featured: p.featured,
    });
  return Number(res.lastInsertRowid);
}

export function updateProduct(
  id: number,
  p: Omit<Product, "id" | "createdAt">
): void {
  const db = getDb();
  db.prepare(
    `UPDATE products SET
      slug=@slug, name=@name, description=@description, price=@price,
      compare_at_price=@compareAtPrice, image=@image, gallery=@gallery,
      category=@category, stock=@stock, supplier=@supplier,
      rating=@rating, reviews=@reviews, featured=@featured
     WHERE id=@id`
  ).run({
    id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    image: p.image,
    gallery: JSON.stringify(p.gallery),
    category: p.category,
    stock: p.stock,
    supplier: p.supplier,
    rating: p.rating,
    reviews: p.reviews,
    featured: p.featured,
  });
}

export function deleteProduct(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
}

// ---- Order queries -------------------------------------------------------

interface OrderRow {
  id: number;
  reference: string;
  created_at: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    reference: row.reference,
    createdAt: row.created_at,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    postalCode: row.postal_code,
    country: row.country,
    status: row.status,
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    paymentMethod: row.payment_method,
  };
}

export interface NewOrderInput {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  items: { productId: number; quantity: number }[];
}

export interface CreateOrderResult {
  ok: boolean;
  reference?: string;
  error?: string;
}

const FREE_SHIPPING_THRESHOLD = 5000; // 50,00 €
const SHIPPING_FEE = 490; // 4,90 €

export function createOrder(input: NewOrderInput): CreateOrderResult {
  const db = getDb();

  if (!input.items.length) {
    return { ok: false, error: "Le panier est vide." };
  }

  const reference = generateReference();

  try {
    const result = db.transaction(() => {
      let subtotal = 0;
      const lineItems: { productId: number; name: string; price: number; quantity: number }[] = [];

      for (const item of input.items) {
        const product = db
          .prepare("SELECT * FROM products WHERE id = ?")
          .get(item.productId) as ProductRow | undefined;
        if (!product) {
          throw new Error(`Produit introuvable (#${item.productId}).`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuffisant pour "${product.name}".`);
        }
        subtotal += product.price * item.quantity;
        lineItems.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        });
      }

      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
      const total = subtotal + shipping;

      const orderRes = db
        .prepare(
          `INSERT INTO orders
            (reference, customer_name, email, phone, address, city, postal_code, country, status, subtotal, shipping, total, payment_method)
           VALUES
            (@reference, @customerName, @email, @phone, @address, @city, @postalCode, @country, 'paid', @subtotal, @shipping, @total, @paymentMethod)`
        )
        .run({
          reference,
          customerName: input.customerName,
          email: input.email,
          phone: input.phone,
          address: input.address,
          city: input.city,
          postalCode: input.postalCode,
          country: input.country,
          subtotal,
          shipping,
          total,
          paymentMethod: input.paymentMethod,
        });

      const orderId = Number(orderRes.lastInsertRowid);
      const itemStmt = db.prepare(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`
      );
      const stockStmt = db.prepare(
        "UPDATE products SET stock = stock - ? WHERE id = ?"
      );
      for (const li of lineItems) {
        itemStmt.run(orderId, li.productId, li.name, li.price, li.quantity);
        stockStmt.run(li.quantity, li.productId);
      }
      return reference;
    })();

    return { ok: true, reference: result };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur lors de la commande.",
    };
  }
}

export function getOrders(): Order[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM orders ORDER BY created_at DESC, id DESC")
    .all() as OrderRow[];
  return rows.map(mapOrder);
}

export function getOrderByReference(reference: string): Order | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM orders WHERE reference = ?")
    .get(reference) as OrderRow | undefined;
  if (!row) return null;
  const order = mapOrder(row);
  order.items = db
    .prepare("SELECT * FROM order_items WHERE order_id = ?")
    .all(row.id) as OrderItem[];
  return order;
}

export function updateOrderStatus(reference: string, status: OrderStatus): void {
  const db = getDb();
  db.prepare("UPDATE orders SET status = ? WHERE reference = ?").run(
    status,
    reference
  );
}

export function getDashboardStats() {
  const db = getDb();
  const revenue = db
    .prepare("SELECT COALESCE(SUM(total), 0) AS v FROM orders WHERE status != 'cancelled'")
    .get() as { v: number };
  const orderCount = db.prepare("SELECT COUNT(*) AS c FROM orders").get() as {
    c: number;
  };
  const productCount = db.prepare("SELECT COUNT(*) AS c FROM products").get() as {
    c: number;
  };
  const lowStock = db
    .prepare("SELECT COUNT(*) AS c FROM products WHERE stock < 50")
    .get() as { c: number };
  return {
    revenue: revenue.v,
    orders: orderCount.c,
    products: productCount.c,
    lowStock: lowStock.c,
  };
}

function generateReference(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rnd = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `DF-${ts}${rnd}`;
}
