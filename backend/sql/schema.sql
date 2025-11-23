-- Core auth tables
CREATE TABLE IF NOT EXISTS auth_group (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auth_permission (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(150) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auth_group_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  permission_id INT NOT NULL,
  CONSTRAINT fk_group_perm_group FOREIGN KEY (group_id) REFERENCES auth_group(id),
  CONSTRAINT fk_group_perm_perm FOREIGN KEY (permission_id) REFERENCES auth_permission(id),
  UNIQUE KEY uniq_group_perm (group_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Users & ACL
CREATE TABLE IF NOT EXISTS inventory_user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  firebase_uid VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Backward compatibility for existing databases
SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'inventory_user'
    AND COLUMN_NAME = 'firebase_uid'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE inventory_user ADD COLUMN firebase_uid VARCHAR(255) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS inventory_user_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  CONSTRAINT fk_user_group_user FOREIGN KEY (user_id) REFERENCES inventory_user(id),
  CONSTRAINT fk_user_group_group FOREIGN KEY (group_id) REFERENCES auth_group(id),
  UNIQUE KEY uniq_user_group (user_id, group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory_user_user_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  permission_id INT NOT NULL,
  CONSTRAINT fk_user_perm_user FOREIGN KEY (user_id) REFERENCES inventory_user(id),
  CONSTRAINT fk_user_perm_perm FOREIGN KEY (permission_id) REFERENCES auth_permission(id),
  UNIQUE KEY uniq_user_perm (user_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auth_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  firebase_uid VARCHAR(255) NULL,
  event VARCHAR(50) NOT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Master data
CREATE TABLE IF NOT EXISTS inventory_warehouse (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  address VARCHAR(255),
  capacity_pct DECIMAL(5,2) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory_location (
  id INT AUTO_INCREMENT PRIMARY KEY,
  warehouse_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('INTERNAL','VENDOR','CUSTOMER') DEFAULT 'INTERNAL',
  CONSTRAINT fk_location_wh FOREIGN KEY (warehouse_id) REFERENCES inventory_warehouse(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory_partner (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('VENDOR','CUSTOMER') NOT NULL,
  contact VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory_uom (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory_productcategory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory_product (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  uom_id INT NOT NULL,
  min_stock DECIMAL(12,2) DEFAULT 0,
  max_stock DECIMAL(12,2) DEFAULT 0,
  price DECIMAL(12,2) DEFAULT 0,
  default_location_id INT NULL,
  qc_status ENUM('PASS','FAIL','PENDING') DEFAULT 'PENDING',
  barcode VARCHAR(100),
  created_by INT NULL,
  CONSTRAINT fk_product_cat FOREIGN KEY (category_id) REFERENCES inventory_productcategory(id),
  CONSTRAINT fk_product_uom FOREIGN KEY (uom_id) REFERENCES inventory_uom(id),
  CONSTRAINT fk_product_loc FOREIGN KEY (default_location_id) REFERENCES inventory_location(id),
  CONSTRAINT fk_product_user FOREIGN KEY (created_by) REFERENCES inventory_user(id),
  UNIQUE KEY uniq_user_sku (created_by, sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Backward compatibility for existing product data
SET @prod_user_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'inventory_product'
    AND COLUMN_NAME = 'created_by'
);
SET @sql := IF(@prod_user_exists = 0, 'ALTER TABLE inventory_product ADD COLUMN created_by INT NULL AFTER barcode', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @old_sku_index := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'inventory_product'
    AND INDEX_NAME = 'sku'
);
SET @sql := IF(@old_sku_index > 0, 'ALTER TABLE inventory_product DROP INDEX sku', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @user_sku_index := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'inventory_product'
    AND INDEX_NAME = 'uniq_user_sku'
);
SET @sql := IF(@user_sku_index = 0, 'ALTER TABLE inventory_product ADD UNIQUE KEY uniq_user_sku (created_by, sku)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @product_user_fk := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'inventory_product'
    AND COLUMN_NAME = 'created_by'
    AND REFERENCED_TABLE_NAME = 'inventory_user'
);
SET @sql := IF(@product_user_fk = 0, 'ALTER TABLE inventory_product ADD CONSTRAINT fk_product_user FOREIGN KEY (created_by) REFERENCES inventory_user(id)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE inventory_product
SET created_by = (
  SELECT id FROM inventory_user ORDER BY id LIMIT 1
)
WHERE created_by IS NULL;

CREATE TABLE IF NOT EXISTS inventory_stocklot (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  lot_number VARCHAR(100),
  expiry_date DATE NULL,
  quantity DECIMAL(12,2) DEFAULT 0,
  CONSTRAINT fk_stocklot_prod FOREIGN KEY (product_id) REFERENCES inventory_product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Transactions
CREATE TABLE IF NOT EXISTS inventory_stockmove (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('RECEIPT','DELIVERY','INTERNAL','ADJUSTMENT') NOT NULL,
  reference VARCHAR(100) NOT NULL,
  contact VARCHAR(255),
  responsible VARCHAR(255),
  status ENUM('DRAFT','WAITING','READY','DONE','CANCELLED') DEFAULT 'DRAFT',
  source_location_id INT NULL,
  dest_location_id INT NULL,
  scheduled_date DATE,
  notes TEXT NULL,
  version INT DEFAULT 1,
  last_edited_by VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  CONSTRAINT fk_stockmove_src FOREIGN KEY (source_location_id) REFERENCES inventory_location(id),
  CONSTRAINT fk_stockmove_dest FOREIGN KEY (dest_location_id) REFERENCES inventory_location(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory_stocktransfer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stockmove_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_transfer_move FOREIGN KEY (stockmove_id) REFERENCES inventory_stockmove(id),
  CONSTRAINT fk_transfer_product FOREIGN KEY (product_id) REFERENCES inventory_product(id),
  UNIQUE KEY uniq_transfer_line (stockmove_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory_stockquant (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  location_id INT NOT NULL,
  quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quant_product FOREIGN KEY (product_id) REFERENCES inventory_product(id),
  CONSTRAINT fk_quant_location FOREIGN KEY (location_id) REFERENCES inventory_location(id),
  UNIQUE KEY uniq_quant (product_id, location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory_stockvaluationlayer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stockmove_id INT NOT NULL,
  product_id INT NOT NULL,
  location_id INT NULL,
  debit_qty DECIMAL(12,2) DEFAULT 0,
  credit_qty DECIMAL(12,2) DEFAULT 0,
  balance DECIMAL(12,2) DEFAULT 0,
  unit_cost DECIMAL(12,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id INT NULL,
  CONSTRAINT fk_val_move FOREIGN KEY (stockmove_id) REFERENCES inventory_stockmove(id),
  CONSTRAINT fk_val_product FOREIGN KEY (product_id) REFERENCES inventory_product(id),
  CONSTRAINT fk_val_location FOREIGN KEY (location_id) REFERENCES inventory_location(id),
  CONSTRAINT fk_val_user FOREIGN KEY (user_id) REFERENCES inventory_user(id),
  UNIQUE KEY uniq_val_line (stockmove_id, product_id, location_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
