-- Roles and permissions
INSERT INTO auth_group (name) VALUES ('admin'), ('manager'), ('viewer')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO auth_permission (code, name) VALUES 
 ('inventory.manage', 'Full inventory management'),
 ('inventory.view', 'View inventory data')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO auth_group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM auth_group g CROSS JOIN auth_permission p
WHERE g.name = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM auth_group_permissions gp WHERE gp.group_id = g.id AND gp.permission_id = p.id
  );

-- Admin user (firebase uid placeholder)
INSERT INTO inventory_user (email, password_hash, full_name, is_active, firebase_uid)
VALUES ('admin@stockmaster.com', '$2a$10$muSksiQHsMs0iik88vVxFeOV7Cn3pyKepwl..yvEvV92QfkW134nm', 'Admin User', 1, 'seed-admin')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), full_name = VALUES(full_name), is_active = VALUES(is_active), firebase_uid = VALUES(firebase_uid);

INSERT INTO inventory_user_groups (user_id, group_id)
SELECT u.id, g.id FROM inventory_user u, auth_group g
WHERE u.email = 'admin@stockmaster.com' AND g.name = 'admin'
  AND NOT EXISTS (SELECT 1 FROM inventory_user_groups ug WHERE ug.user_id = u.id AND ug.group_id = g.id);

-- Warehouses and locations
INSERT INTO inventory_warehouse (name, code, address, capacity_pct) VALUES
 ('Main Warehouse', 'WH-MAIN', '123 Ind. Estate', 85),
 ('Dispatch Center', 'WH-DISPATCH', '456 Logistics Blvd', 42),
 ('External Network', 'EXT', 'Vendors/Customers', 0)
ON DUPLICATE KEY UPDATE name = VALUES(name), address = VALUES(address), capacity_pct = VALUES(capacity_pct);

INSERT INTO inventory_location (warehouse_id, name, code, type) VALUES
 ((SELECT id FROM inventory_warehouse WHERE code = 'WH-MAIN'), 'Main Storage', 'WH-MAIN', 'INTERNAL'),
 ((SELECT id FROM inventory_warehouse WHERE code = 'WH-DISPATCH'), 'Dispatch Storage', 'WH-DISPATCH', 'INTERNAL'),
 ((SELECT id FROM inventory_warehouse WHERE code = 'EXT'), 'Vendor Dock', 'VENDOR', 'VENDOR'),
 ((SELECT id FROM inventory_warehouse WHERE code = 'EXT'), 'Customer Dock', 'CUSTOMER', 'CUSTOMER')
ON DUPLICATE KEY UPDATE name = VALUES(name), warehouse_id = VALUES(warehouse_id), type = VALUES(type);

-- Units and categories
INSERT INTO inventory_uom (name, code) VALUES
 ('Kilogram', 'kg'),
 ('Unit', 'unit'),
 ('Meter', 'm')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO inventory_productcategory (name) VALUES
 ('Raw Material'),
 ('Finished Goods'),
 ('Electronics')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Products
INSERT INTO inventory_product (category_id, name, sku, uom_id, min_stock, max_stock, price, default_location_id, qc_status, barcode, created_by) VALUES
 ((SELECT id FROM inventory_productcategory WHERE name = 'Raw Material'), 'Steel Rods 20mm', 'ST-20', (SELECT id FROM inventory_uom WHERE code = 'kg'), 50, 500, 45.00, (SELECT id FROM inventory_location WHERE code = 'WH-MAIN'), 'PASS', NULL, (SELECT id FROM inventory_user WHERE email = 'admin@stockmaster.com' LIMIT 1)),
 ((SELECT id FROM inventory_productcategory WHERE name = 'Raw Material'), 'Copper Wire', 'CU-W1', (SELECT id FROM inventory_uom WHERE code = 'm'), 100, 300, 12.50, (SELECT id FROM inventory_location WHERE code = 'WH-MAIN'), 'PENDING', NULL, (SELECT id FROM inventory_user WHERE email = 'admin@stockmaster.com' LIMIT 1)),
 ((SELECT id FROM inventory_productcategory WHERE name = 'Finished Goods'), 'Office Chair Ergonomic', 'FURN-01', (SELECT id FROM inventory_uom WHERE code = 'unit'), 10, 50, 150.00, (SELECT id FROM inventory_location WHERE code = 'WH-DISPATCH'), 'PASS', NULL, (SELECT id FROM inventory_user WHERE email = 'admin@stockmaster.com' LIMIT 1)),
 ((SELECT id FROM inventory_productcategory WHERE name = 'Finished Goods'), 'Gaming Desk', 'FURN-02', (SELECT id FROM inventory_uom WHERE code = 'unit'), 5, 30, 220.00, (SELECT id FROM inventory_location WHERE code = 'WH-DISPATCH'), 'PASS', NULL, (SELECT id FROM inventory_user WHERE email = 'admin@stockmaster.com' LIMIT 1)),
 ((SELECT id FROM inventory_productcategory WHERE name = 'Electronics'), 'LED Monitor 27\"', 'ELEC-01', (SELECT id FROM inventory_uom WHERE code = 'unit'), 20, 150, 300.00, (SELECT id FROM inventory_location WHERE code = 'WH-MAIN'), 'PASS', NULL, (SELECT id FROM inventory_user WHERE email = 'admin@stockmaster.com' LIMIT 1))
ON DUPLICATE KEY UPDATE price = VALUES(price), min_stock = VALUES(min_stock), max_stock = VALUES(max_stock), default_location_id = VALUES(default_location_id), qc_status = VALUES(qc_status);

-- Stock on hand
INSERT INTO inventory_stockquant (product_id, location_id, quantity, updated_at) VALUES
 ((SELECT id FROM inventory_product WHERE sku = 'ST-20'), (SELECT id FROM inventory_location WHERE code = 'WH-MAIN'), 120, NOW()),
 ((SELECT id FROM inventory_product WHERE sku = 'CU-W1'), (SELECT id FROM inventory_location WHERE code = 'WH-MAIN'), 40, NOW()),
 ((SELECT id FROM inventory_product WHERE sku = 'FURN-01'), (SELECT id FROM inventory_location WHERE code = 'WH-DISPATCH'), 15, NOW()),
 ((SELECT id FROM inventory_product WHERE sku = 'FURN-02'), (SELECT id FROM inventory_location WHERE code = 'WH-DISPATCH'), 8, NOW()),
 ((SELECT id FROM inventory_product WHERE sku = 'ELEC-01'), (SELECT id FROM inventory_location WHERE code = 'WH-MAIN'), 200, NOW())
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), updated_at = VALUES(updated_at);

-- Audit trail samples
INSERT INTO auth_audit_log (user_email, firebase_uid, event, ip_address, user_agent)
VALUES
 ('admin@stockmaster.com', 'seed-admin', 'seed_login', '127.0.0.1', 'seed-data')
ON DUPLICATE KEY UPDATE event = VALUES(event);

-- Sample operations
INSERT INTO inventory_stockmove (type, reference, contact, responsible, status, source_location_id, dest_location_id, scheduled_date, notes, version, created_at, last_edited_by)
VALUES
 ('RECEIPT', 'WH/IN/0001', 'Acme Steel Co.', 'Admin', 'DONE', NULL, (SELECT id FROM inventory_location WHERE code = 'WH-MAIN'), '2023-10-25', 'Initial receipt', 1, '2023-10-25 14:30:00', 'Admin'),
 ('DELIVERY', 'WH/OUT/0001', 'TechStart Inc.', 'Manager', 'READY', (SELECT id FROM inventory_location WHERE code = 'WH-DISPATCH'), NULL, '2023-10-27', 'Delivery to customer', 2, '2023-10-26 09:15:00', 'Manager'),
 ('INTERNAL', 'WH/INT/0002', 'Internal', 'Staff', 'DRAFT', (SELECT id FROM inventory_location WHERE code = 'WH-MAIN'), (SELECT id FROM inventory_location WHERE code = 'WH-DISPATCH'), '2023-10-28', 'Move to dispatch', 1, '2023-10-26 11:00:00', 'Staff'),
 ('RECEIPT', 'WH/IN/0003', 'Global Electronics', 'Admin', 'WAITING', NULL, (SELECT id FROM inventory_location WHERE code = 'WH-MAIN'), '2023-11-01', 'Incoming monitors', 1, '2023-10-27 16:45:00', 'Admin')
ON DUPLICATE KEY UPDATE status = VALUES(status), scheduled_date = VALUES(scheduled_date), last_edited_by = VALUES(last_edited_by);

-- Operation lines
INSERT INTO inventory_stocktransfer (stockmove_id, product_id, quantity) VALUES
 ((SELECT id FROM inventory_stockmove WHERE reference = 'WH/IN/0001' LIMIT 1), (SELECT id FROM inventory_product WHERE sku = 'ST-20' LIMIT 1), 100),
 ((SELECT id FROM inventory_stockmove WHERE reference = 'WH/OUT/0001' LIMIT 1), (SELECT id FROM inventory_product WHERE sku = 'FURN-01' LIMIT 1), 5),
 ((SELECT id FROM inventory_stockmove WHERE reference = 'WH/INT/0002' LIMIT 1), (SELECT id FROM inventory_product WHERE sku = 'FURN-02' LIMIT 1), 2),
 ((SELECT id FROM inventory_stockmove WHERE reference = 'WH/IN/0003' LIMIT 1), (SELECT id FROM inventory_product WHERE sku = 'ELEC-01' LIMIT 1), 50)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

-- Ledger
INSERT INTO inventory_stockvaluationlayer (stockmove_id, product_id, location_id, debit_qty, credit_qty, balance, unit_cost, created_at, user_id)
VALUES
 ((SELECT id FROM inventory_stockmove WHERE reference = 'WH/IN/0001' LIMIT 1), (SELECT id FROM inventory_product WHERE sku = 'ST-20' LIMIT 1), (SELECT id FROM inventory_location WHERE code = 'WH-MAIN' LIMIT 1), 100, 0, 120, 45, '2023-10-25 14:30:00', (SELECT id FROM inventory_user WHERE email = 'admin@stockmaster.com' LIMIT 1)),
 ((SELECT id FROM inventory_stockmove WHERE reference = 'WH/OUT/0001' LIMIT 1), (SELECT id FROM inventory_product WHERE sku = 'FURN-01' LIMIT 1), (SELECT id FROM inventory_location WHERE code = 'WH-DISPATCH' LIMIT 1), 0, 5, 15, 150, '2023-10-26 09:15:00', (SELECT id FROM inventory_user WHERE email = 'admin@stockmaster.com' LIMIT 1)),
 ((SELECT id FROM inventory_stockmove WHERE reference = 'WH/INT/0002' LIMIT 1), (SELECT id FROM inventory_product WHERE sku = 'FURN-02' LIMIT 1), (SELECT id FROM inventory_location WHERE code = 'WH-DISPATCH' LIMIT 1), 2, 0, 8, 220, '2023-10-26 11:00:00', (SELECT id FROM inventory_user WHERE email = 'admin@stockmaster.com' LIMIT 1)),
 ((SELECT id FROM inventory_stockmove WHERE reference = 'WH/IN/0003' LIMIT 1), (SELECT id FROM inventory_product WHERE sku = 'ELEC-01' LIMIT 1), (SELECT id FROM inventory_location WHERE code = 'WH-MAIN' LIMIT 1), 50, 0, 200, 300, '2023-10-27 16:45:00', (SELECT id FROM inventory_user WHERE email = 'admin@stockmaster.com' LIMIT 1))
ON DUPLICATE KEY UPDATE debit_qty = VALUES(debit_qty), credit_qty = VALUES(credit_qty), balance = VALUES(balance), unit_cost = VALUES(unit_cost);
