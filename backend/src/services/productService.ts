import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { Product } from '../types';
import { HttpError } from '../middleware/errorHandler';

export interface CreateProductInput {
  name: string;
  sku: string;
  category?: string;
  uomCode: string;
  minStock?: number;
  maxStock?: number;
  price?: number;
  barcode?: string;
  qcStatus?: 'PASS' | 'FAIL' | 'PENDING';
  locationCode?: string;
  initialQuantity?: number;
}

export const getProducts = async (userId?: number): Promise<Product[]> => {
  if (!userId) throw new HttpError(401, 'Unauthenticated');

  const [rows] = await pool.query(
    `SELECT p.id,
            p.name,
            p.sku,
            COALESCE(pc.name, 'Uncategorized') AS category,
            COALESCE(u.code, 'unit') AS uom,
            p.min_stock AS minStock,
            p.max_stock AS maxStock,
            p.price,
            p.barcode,
            p.qc_status AS qcStatus,
            COALESCE(SUM(q.quantity), 0) AS quantity,
            COALESCE(dl.code, 'MAIN') AS location
     FROM inventory_product p
     LEFT JOIN inventory_productcategory pc ON pc.id = p.category_id
     LEFT JOIN inventory_uom u ON u.id = p.uom_id
     LEFT JOIN inventory_stockquant q ON q.product_id = p.id
     LEFT JOIN inventory_location dl ON dl.id = p.default_location_id
     WHERE p.created_by = ?
     GROUP BY p.id, p.name, p.sku, pc.name, u.code, p.min_stock, p.max_stock, p.price, p.barcode, p.qc_status, dl.code
     ORDER BY p.id DESC`,
    [userId]
  );

  return (rows as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    uom: row.uom,
    quantity: Number(row.quantity),
    minStock: Number(row.minStock ?? 0),
    maxStock: Number(row.maxStock ?? 0),
    price: Number(row.price ?? 0),
    location: row.location,
    barcode: row.barcode ?? undefined,
    qcStatus: row.qcStatus ?? undefined,
  }));
};

export const createProduct = async (input: CreateProductInput, userId?: number): Promise<Product> => {
  if (!userId) throw new HttpError(401, 'Unauthenticated');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [uomRow] = await conn.query(`SELECT id FROM inventory_uom WHERE code = ?`, [input.uomCode]);
    const uomId = (uomRow as any[])[0]?.id;
    if (!uomId) {
      throw new HttpError(400, `UOM code ${input.uomCode} not found`);
    }

    let locationId: number | null = null;
    if (input.locationCode) {
      const [locRow] = await conn.query(`SELECT id FROM inventory_location WHERE code = ?`, [input.locationCode]);
      locationId = (locRow as any[])[0]?.id ?? null;
    }

    let categoryId: number | null = null;
    if (input.category) {
      const [catRow] = await conn.query(`SELECT id FROM inventory_productcategory WHERE name = ?`, [input.category]);
      categoryId = (catRow as any[])[0]?.id ?? null;
      if (!categoryId) {
        const [catInsert] = await conn.execute(
          `INSERT INTO inventory_productcategory (name) VALUES (?)`,
          [input.category]
        );
        categoryId = (catInsert as ResultSetHeader).insertId;
      }
    }

    const [result] = await conn.execute(
      `INSERT INTO inventory_product
        (name, sku, category_id, uom_id, min_stock, max_stock, price, default_location_id, qc_status, barcode, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name,
        input.sku,
        categoryId,
        uomId,
        input.minStock ?? 0,
        input.maxStock ?? 0,
        input.price ?? 0,
        locationId,
        input.qcStatus ?? 'PENDING',
        input.barcode ?? null,
        userId,
      ]
    );

    const productId = (result as ResultSetHeader).insertId;

    if (locationId && input.initialQuantity !== undefined) {
      await conn.execute(
        `INSERT INTO inventory_stockquant (product_id, location_id, quantity, updated_at) VALUES (?, ?, ?, NOW())`,
        [productId, locationId, input.initialQuantity]
      );
    }

    await conn.commit();

    return {
      id: productId,
      name: input.name,
      sku: input.sku,
      category: input.category || 'Uncategorized',
      uom: input.uomCode,
      minStock: input.minStock ?? 0,
      maxStock: input.maxStock ?? 0,
      price: input.price ?? 0,
      quantity: input.initialQuantity ?? 0,
      location: input.locationCode ?? 'MAIN',
      barcode: input.barcode,
      qcStatus: input.qcStatus ?? 'PENDING',
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
