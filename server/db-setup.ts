import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Parse the DATABASE_URL to add SSL parameters
const connectionString = process.env.DATABASE_URL.includes('?') 
  ? `${process.env.DATABASE_URL}&sslmode=require`
  : `${process.env.DATABASE_URL}?sslmode=require`;

const pool = new pg.Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const db = drizzle(pool, { schema });

async function main() {
  console.log('Running migrations...');
  
  try {
    // Create all necessary tables
    await db.execute(sql`
      -- Sessions table
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

      -- Users table
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

      -- OTP codes table
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR NOT NULL,
        code VARCHAR NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Custom domains table
      CREATE TABLE IF NOT EXISTS custom_domains (
        id SERIAL PRIMARY KEY,
        domain VARCHAR NOT NULL UNIQUE,
        vendor_id INTEGER,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        ssl_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Vendors table
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER NOT NULL REFERENCES users(id),
        name VARCHAR NOT NULL,
        domain VARCHAR NOT NULL UNIQUE,
        custom_domain_id INTEGER REFERENCES custom_domains(id),
        description TEXT,
        plan VARCHAR NOT NULL DEFAULT 'basic',
        status VARCHAR NOT NULL DEFAULT 'active',
        subscription_status VARCHAR NOT NULL DEFAULT 'trial',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Add foreign key constraint for custom_domains.vendor_id
      ALTER TABLE custom_domains 
      ADD CONSTRAINT fk_custom_domains_vendor 
      FOREIGN KEY (vendor_id) 
      REFERENCES vendors(id);
    `);
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main(); 