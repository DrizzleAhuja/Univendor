import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
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
    // Create tables if they don't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR NOT NULL,
        code VARCHAR NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
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