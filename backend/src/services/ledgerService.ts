import { pool } from '../config/database';
import { StockLedgerEntry } from '../types';

export const getLedgerEntries = async (): Promise<StockLedgerEntry[]> => {
  const [rows] = await pool.query(
    `SELECT l.id,
            l.created_at AS date,
            sm.reference,
            p.name AS productName,
            p.sku,
            loc.code AS location,
            l.debit_qty AS debit,
            l.credit_qty AS credit,
            l.balance,
            u.full_name AS user,
            sm.type as type
     FROM inventory_stockvaluationlayer l
     LEFT JOIN inventory_stockmove sm ON sm.id = l.stockmove_id
     LEFT JOIN inventory_product p ON p.id = l.product_id
     LEFT JOIN inventory_location loc ON loc.id = l.location_id
     LEFT JOIN inventory_user u ON u.id = l.user_id
     ORDER BY l.created_at DESC`
  );

  return (rows as any[]).map((row) => ({
    id: row.id,
    date: row.date,
    reference: row.reference,
    productName: row.productName,
    sku: row.sku,
    location: row.location,
    credit: Number(row.credit ?? 0),
    debit: Number(row.debit ?? 0),
    balance: Number(row.balance ?? 0),
    user: row.user || 'System',
    type: row.type === 'DELIVERY' ? 'OUT' : row.type === 'RECEIPT' ? 'IN' : row.type === 'INTERNAL' ? 'MOVE' : 'ADJ',
  }));
};
