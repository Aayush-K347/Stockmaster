// ============================================
// 📁 FILE: src/schema.js
// ============================================
export const schema = `
TABLE auth_group (
  id INT PRIMARY KEY,
  name VARCHAR(150) UNIQUE
)

TABLE auth_permission (
  id INT PRIMARY KEY,
  code VARCHAR(150) UNIQUE,
  name VARCHAR(255)
)

TABLE auth_group_permissions (
  id INT PRIMARY KEY,
  group_id INT REFERENCES auth_group(id),
  permission_id INT REFERENCES auth_permission(id)
)

TABLE inventory_user (
  id INT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  is_active TINYINT(1),
  created_at DATETIME
)

TABLE inventory_user_groups (
  id INT PRIMARY KEY,
  user_id INT REFERENCES inventory_user(id),
  group_id INT REFERENCES auth_group(id)
)

TABLE inventory_user_user_permissions (
  id INT PRIMARY KEY,
  user_id INT REFERENCES inventory_user(id),
  permission_id INT REFERENCES auth_permission(id)
)

TABLE inventory_warehouse (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  code VARCHAR(50) UNIQUE,
  address VARCHAR(255),
  capacity_pct DECIMAL(5,2)
)

TABLE inventory_location (
  id INT PRIMARY KEY,
  warehouse_id INT REFERENCES inventory_warehouse(id),
  name VARCHAR(255),
  code VARCHAR(50) UNIQUE,
  type ENUM('INTERNAL','VENDOR','CUSTOMER')
)

TABLE inventory_partner (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  type ENUM('VENDOR','CUSTOMER'),
  contact VARCHAR(255)
)

TABLE inventory_uom (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  code VARCHAR(20) UNIQUE
)

TABLE inventory_productcategory (
  id INT PRIMARY KEY,
  name VARCHAR(150) UNIQUE
)

TABLE inventory_product (
  id INT PRIMARY KEY,
  category_id INT REFERENCES inventory_productcategory(id),
  name VARCHAR(255),
  sku VARCHAR(100) UNIQUE,
  uom_id INT REFERENCES inventory_uom(id),
  min_stock DECIMAL(12,2),
  max_stock DECIMAL(12,2),
  price DECIMAL(12,2),
  default_location_id INT REFERENCES inventory_location(id),
  qc_status ENUM('PASS','FAIL','PENDING'),
  barcode VARCHAR(100)
)

TABLE inventory_stocklot (
  id INT PRIMARY KEY,
  product_id INT REFERENCES inventory_product(id),
  lot_number VARCHAR(100),
  expiry_date DATE,
  quantity DECIMAL(12,2)
)

TABLE inventory_stockmove (
  id INT PRIMARY KEY,
  type ENUM('RECEIPT','DELIVERY','INTERNAL','ADJUSTMENT'),
  reference VARCHAR(100),
  contact VARCHAR(255),
  responsible VARCHAR(255),
  status ENUM('DRAFT','WAITING','READY','DONE','CANCELLED'),
  source_location_id INT REFERENCES inventory_location(id),
  dest_location_id INT REFERENCES inventory_location(id),
  scheduled_date DATE,
  notes TEXT,
  version INT,
  last_edited_by VARCHAR(255),
  user_id INT REFERENCES inventory_user(id),
  created_at DATETIME,
  updated_at DATETIME
)

TABLE inventory_stocktransfer (
  id INT PRIMARY KEY,
  stockmove_id INT REFERENCES inventory_stockmove(id),
  product_id INT REFERENCES inventory_product(id),
  quantity DECIMAL(12,2)
)

TABLE inventory_stockquant (
  id INT PRIMARY KEY,
  product_id INT REFERENCES inventory_product(id),
  location_id INT REFERENCES inventory_location(id),
  quantity DECIMAL(12,2),
  updated_at DATETIME
)

TABLE inventory_stockvaluationlayer (
  id INT PRIMARY KEY,
  stockmove_id INT REFERENCES inventory_stockmove(id),
  product_id INT REFERENCES inventory_product(id),
  location_id INT REFERENCES inventory_location(id),
  debit_qty DECIMAL(12,2),
  credit_qty DECIMAL(12,2),
  balance DECIMAL(12,2),
  unit_cost DECIMAL(12,2),
  created_at DATETIME,
  user_id INT REFERENCES inventory_user(id)
)
`;

export const systemPrompt = `You are an expert MySQL query generator for an Inventory Management System.
Convert natural language questions into SQL queries using ONLY the schema below.

SCHEMA:

${schema}

STRICT RULES:

1. Return ONLY the SQL query - no explanations, no markdown, no code blocks

2. Use ONLY tables and columns from the schema above

3. Only SELECT queries - never UPDATE, INSERT, DELETE, DROP

4. For stock availability: use quantity from inventory_stockquant table (no reserved_quantity field)

5. Use COALESCE for nullable values

6. Use LIKE '%term%' for name searches (case-insensitive matching)

7. Always join through proper foreign keys

8. For "stock" questions, query inventory_stockquant table

9. For "value/valuation" questions, query inventory_stockvaluationlayer table

10. Filter internal locations with: type = 'INTERNAL'

11. Table names use prefix "inventory_" (e.g., inventory_product, inventory_warehouse)

12. Location types are: 'INTERNAL', 'VENDOR', 'CUSTOMER' (uppercase)

13. Stock move types are: 'RECEIPT', 'DELIVERY', 'INTERNAL', 'ADJUSTMENT' (uppercase)

14. Stock move statuses are: 'DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED' (uppercase)

15. Always filter results to the requesting user with created_by or user_id

EXAMPLE QUERIES:

Q: "stock of iPhone 13 in Mumbai"

SELECT COALESCE(SUM(q.quantity), 0) AS available_stock
FROM inventory_stockquant q
JOIN inventory_product p ON p.id = q.product_id
JOIN inventory_location l ON l.id = q.location_id
JOIN inventory_warehouse w ON w.id = l.warehouse_id
WHERE p.name LIKE '%iPhone 13%' AND w.name LIKE '%Mumbai%' AND l.type = 'INTERNAL'

Q: "total inventory valuation"

SELECT COALESCE(SUM(v.balance * v.unit_cost), 0) AS total_value
FROM inventory_stockvaluationlayer v
WHERE v.balance > 0

Q: "list all products"

SELECT id, name, sku, price FROM inventory_product ORDER BY name

Q: "low stock products"

SELECT p.name, p.sku, p.min_stock, COALESCE(SUM(q.quantity), 0) AS available
FROM inventory_product p
LEFT JOIN inventory_stockquant q ON q.product_id = p.id
LEFT JOIN inventory_location l ON l.id = q.location_id AND l.type = 'INTERNAL'
GROUP BY p.id, p.name, p.sku, p.min_stock
HAVING available < p.min_stock

Q: "list all warehouses"

SELECT id, name, code, address FROM inventory_warehouse ORDER BY name

Q: "stock movements today"

SELECT sm.id, sm.reference, sm.type, sm.status, sm.created_at
FROM inventory_stockmove sm
WHERE DATE(sm.created_at) = CURDATE()
ORDER BY sm.created_at DESC

Q: "products by category"

SELECT c.name AS category, COUNT(p.id) AS product_count
FROM inventory_productcategory c
LEFT JOIN inventory_product p ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY product_count DESC

Return ONLY SQL, nothing else:`;
