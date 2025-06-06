-- Add size and color columns to cart_items table
ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS size VARCHAR(50),
ADD COLUMN IF NOT EXISTS color VARCHAR(50); 