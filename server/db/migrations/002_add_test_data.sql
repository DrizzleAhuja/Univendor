-- First, let's add a test vendor if not exists
INSERT INTO vendors (id, owner_id, name, domain, description, plan, status)
SELECT 1, 2, 'Test Store', 'test-store', 'A test store', 'basic', 'active'
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE id = 1);

-- Now add some test products
INSERT INTO products (id, vendor_id, name, description, price, image_url, stock, is_active)
VALUES 
(1, 1, 'Test T-Shirt', 'A comfortable cotton t-shirt', 29.99, 'https://example.com/tshirt.jpg', 100, true),
(2, 1, 'Test Jeans', 'Classic blue jeans', 59.99, 'https://example.com/jeans.jpg', 50, true),
(3, 1, 'Test Hoodie', 'Warm winter hoodie', 49.99, 'https://example.com/hoodie.jpg', 75, true)
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock; 