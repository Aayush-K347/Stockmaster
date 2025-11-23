import { pool } from '../config/database';
import { HttpError } from '../middleware/errorHandler';
import { StockLedgerEntry } from '../types';

const demoLedgerEntries: StockLedgerEntry[] = [
  {
    id: 7001,
    date: new Date().toISOString(),
    reference: 'RCT-0001',
    productName: 'Demo Widget',
    sku: 'DW-001',
    location: 'MAIN',
    credit: 0,
    debit: 30,
    balance: 150,
    user: 'System',
    type: 'IN',
  },
  {
    id: 7002,
    date: new Date().toISOString(),
    reference: 'DLV-0001',
    productName: 'Sample Cable',
    sku: 'SC-010',
    location: 'MAIN',
    credit: 20,
    debit: 0,
    balance: 300,
    user: 'System',
    type: 'OUT',
  },
  {
    id: 7003,
    date: new Date().toISOString(),
    reference: 'INT-0001',
    productName: 'Sample Cable',
    sku: 'SC-010',
    location: 'SECONDARY',
    credit: 0,
    debit: 50,
    balance: 370,
    user: 'System',
    type: 'MOVE',
  },
  {
    id: 7004,
    date: new Date().toISOString(),
    reference: 'ADJ-0001',
    productName: 'Calibration Kit',
    sku: 'CK-500',
    location: 'QUARANTINE',
    credit: 0,
    debit: 2,
    balance: 18,
    user: 'System',
    type: 'ADJ',
  },
];

export const getLedgerEntries = async (userId?: number): Promise<StockLedgerEntry[]> => {
  if (!userId) throw new HttpError(401, 'Unauthenticated');

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
     WHERE sm.user_id = ?
     ORDER BY l.created_at DESC`,
    [userId]
  );

  const typedRows = rows as any[];
  if (!typedRows.length) {
    return demoLedgerEntries;
  }

  return typedRows.map((row) => ({
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
