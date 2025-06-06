import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "../../shared/schema";

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  console.log("Running migrations...");
  
  // Create tables
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR UNIQUE NOT NULL,
      first_name VARCHAR,
      last_name VARCHAR,
      phone VARCHAR,
      is_email_verified BOOLEAN DEFAULT FALSE,
      role VARCHAR NOT NULL DEFAULT 'buyer',
      is_deletable BOOLEAN NOT NULL DEFAULT TRUE,
      created_by INTEGER REFERENCES users(id),
      last_login_at TIMESTAMP,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      permissions JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      id SERIAL PRIMARY KEY,
      email VARCHAR NOT NULL,
      code VARCHAR NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      is_used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS vendors (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER NOT NULL REFERENCES users(id),
      name VARCHAR NOT NULL,
      domain VARCHAR NOT NULL UNIQUE,
      custom_domain_id INTEGER,
      description TEXT,
      plan VARCHAR NOT NULL DEFAULT 'basic',
      status VARCHAR NOT NULL DEFAULT 'active',
      subscription_status VARCHAR NOT NULL DEFAULT 'trial',
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS custom_domains (
      id SERIAL PRIMARY KEY,
      domain VARCHAR NOT NULL UNIQUE,
      vendor_id INTEGER REFERENCES vendors(id),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      ssl_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
      is_global BOOLEAN NOT NULL DEFAULT FALSE,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      vendor_id INTEGER NOT NULL REFERENCES vendors(id),
      name VARCHAR NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      image_url VARCHAR,
      category_id INTEGER REFERENCES categories(id),
      stock INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      sku VARCHAR(100) NOT NULL UNIQUE,
      mrp DECIMAL(10,2) NOT NULL,
      selling_price DECIMAL(10,2) NOT NULL,
      purchase_price DECIMAL(10,2) NOT NULL,
      stock INTEGER DEFAULT 0,
      weight DECIMAL(8,3),
      length DECIMAL(8,2),
      breadth DECIMAL(8,2),
      height DECIMAL(8,2),
      color VARCHAR(50),
      size VARCHAR(50),
      material VARCHAR(100),
      style VARCHAR(100),
      image_urls TEXT[],
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES users(id),
      vendor_id INTEGER NOT NULL REFERENCES vendors(id),
      total DECIMAL(10,2) NOT NULL,
      status VARCHAR NOT NULL DEFAULT 'pending',
      shipping_address JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL DEFAULT 1,
      size VARCHAR(50),
      color VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      sid VARCHAR PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions(expire);
  `);

  console.log("Migrations completed successfully!");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed!");
  console.error(err);
  process.exit(1);
}); 