import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { HttpError } from '../middleware/errorHandler';
import { Operation, OperationItem, OperationStatus, OperationType } from '../types';

const buildOperationFromRows = (rows: any[]): Operation => {
  const base = rows[0];
  const items: OperationItem[] = rows
    .filter((r) => r.productId)
    .map((r) => ({
      productId: r.productId,
      productName: r.productName,
      quantity: Number(r.quantity),
    }));

  return {
    id: base.id,
    type: base.type,
    reference: base.reference,
    contact: base.contact,
    responsible: base.responsible,
    status: base.status,
    sourceLocation: base.sourceLocation || undefined,
    destLocation: base.destLocation || undefined,
    scheduledDate: base.scheduledDate,
    notes: base.notes || undefined,
    version: base.version,
    createdAt: base.createdAt,
    lastEditedBy: base.lastEditedBy || undefined,
    items,
  };
};

export const getOperations = async (userId?: number): Promise<Operation[]> => {
  if (!userId) throw new HttpError(401, 'Unauthenticated');

  const [rows] = await pool.query(
    `SELECT sm.id,
            sm.type,
            sm.reference,
            sm.contact,
            sm.responsible,
            sm.status,
            sm.scheduled_date AS scheduledDate,
            sm.notes,
            sm.version,
            sm.created_at AS createdAt,
            sm.last_edited_by AS lastEditedBy,
            src.code AS sourceLocation,
            dest.code AS destLocation,
            st.product_id AS productId,
            st.quantity,
            p.name AS productName
     FROM inventory_stockmove sm
     LEFT JOIN inventory_stocktransfer st ON st.stockmove_id = sm.id
     LEFT JOIN inventory_product p ON p.id = st.product_id
     LEFT JOIN inventory_location src ON src.id = sm.source_location_id
     LEFT JOIN inventory_location dest ON dest.id = sm.dest_location_id
     WHERE sm.user_id = ?
     ORDER BY sm.created_at DESC`,
    [userId]
  );

  const grouped = new Map<number, any[]>();
  (rows as any[]).forEach((row) => {
    if (!grouped.has(row.id)) grouped.set(row.id, []);
    grouped.get(row.id)!.push(row);
  });

  return Array.from(grouped.values()).map(buildOperationFromRows);
};

const resolveLocationId = async (code: string | undefined, conn: any) => {
  if (!code) return null;
  const [rows] = await conn.query(`SELECT id FROM inventory_location WHERE code = ?`, [code]);
  const id = (rows as any[])[0]?.id;
  if (!id) {
    throw new HttpError(400, `Location ${code} not found`);
  }
  return id;
};

export interface CreateOperationInput {
  type: OperationType;
  reference: string;
  contact: string;
  responsible: string;
  sourceLocation?: string;
  destLocation?: string;
  scheduledDate: string;
  items: { productId: number; quantity: number }[];
  notes?: string;
  status?: OperationStatus;
}

export const createOperation = async (input: CreateOperationInput, userId?: number): Promise<Operation> => {
  if (!userId) throw new HttpError(401, 'Unauthenticated');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const sourceLocationId = await resolveLocationId(input.sourceLocation, conn);
    const destLocationId = await resolveLocationId(input.destLocation, conn);

    const [result] = await conn.execute(
      `INSERT INTO inventory_stockmove
         (type, reference, contact, responsible, status, source_location_id, dest_location_id, scheduled_date, notes, version, user_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, NOW())`,
      [
        input.type,
        input.reference,
        input.contact,
        input.responsible,
        input.status ?? 'DRAFT',
        sourceLocationId,
        destLocationId,
        input.scheduledDate,
        input.notes ?? null,
        userId,
      ]
    );

    const stockmoveId = (result as ResultSetHeader).insertId;

    for (const item of input.items) {
      await conn.execute(
        `INSERT INTO inventory_stocktransfer (stockmove_id, product_id, quantity) VALUES (?, ?, ?)`,
        [stockmoveId, item.productId, item.quantity]
      );
    }

    await conn.commit();

    return {
      id: stockmoveId,
      type: input.type,
      reference: input.reference,
      contact: input.contact,
      responsible: input.responsible,
      status: input.status ?? 'DRAFT',
      sourceLocation: input.sourceLocation,
      destLocation: input.destLocation,
      scheduledDate: input.scheduledDate,
      notes: input.notes,
      version: 1,
      lastEditedBy: undefined,
      items: input.items.map((it) => ({
        productId: it.productId,
        productName: '',
        quantity: it.quantity,
      })),
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const updateOperationData = async (id: number, updates: Partial<CreateOperationInput>, userId?: number): Promise<void> => {
  if (!userId) throw new HttpError(401, 'Unauthenticated');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(`SELECT id FROM inventory_stockmove WHERE id = ? AND user_id = ? FOR UPDATE`, [id, userId]);
    if (!(existing as any[])[0]) throw new HttpError(404, 'Operation not found');

    const sourceLocationId =
      updates.sourceLocation !== undefined
        ? await resolveLocationId(updates.sourceLocation, conn)
        : undefined;
    const destLocationId =
      updates.destLocation !== undefined ? await resolveLocationId(updates.destLocation, conn) : undefined;

    await conn.execute(
      `UPDATE inventory_stockmove
       SET contact = COALESCE(?, contact),
           responsible = COALESCE(?, responsible),
           scheduled_date = COALESCE(?, scheduled_date),
           notes = COALESCE(?, notes),
           status = COALESCE(?, status),
           source_location_id = COALESCE(?, source_location_id),
           dest_location_id = COALESCE(?, dest_location_id),
           updated_at = NOW(),
           version = COALESCE(version, 1) + 1
       WHERE id = ? AND user_id = ?`,
      [
        updates.contact ?? null,
        updates.responsible ?? null,
        updates.scheduledDate ?? null,
        updates.notes ?? null,
        updates.status ?? null,
        sourceLocationId ?? null,
        destLocationId ?? null,
        id,
        userId,
      ]
    );

    if (updates.items) {
      await conn.execute(`DELETE FROM inventory_stocktransfer WHERE stockmove_id = ?`, [id]);
      for (const item of updates.items) {
        await conn.execute(
          `INSERT INTO inventory_stocktransfer (stockmove_id, product_id, quantity) VALUES (?, ?, ?)`,
          [id, item.productId, item.quantity]
        );
      }
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const upsertQuant = async (conn: any, productId: number, locationId: number, delta: number) => {
  const [rows] = await conn.query(
    `SELECT id, quantity FROM inventory_stockquant WHERE product_id = ? AND location_id = ? FOR UPDATE`,
    [productId, locationId]
  );
  const existing = (rows as any[])[0];
  if (!existing) {
    if (delta < 0) {
      throw new HttpError(400, 'Insufficient stock for movement');
    }
    await conn.execute(
      `INSERT INTO inventory_stockquant (product_id, location_id, quantity, updated_at) VALUES (?, ?, ?, NOW())`,
      [productId, locationId, delta]
    );
    return delta;
  }

  const newQty = Number(existing.quantity) + delta;
  if (newQty < 0) {
    throw new HttpError(400, 'Insufficient stock for movement');
  }

  await conn.execute(
    `UPDATE inventory_stockquant SET quantity = ?, updated_at = NOW() WHERE id = ?`,
    [newQty, existing.id]
  );
  return newQty;
};

const insertValuationLayer = async (
  conn: any,
  stockmoveId: number,
  productId: number,
  locationId: number | null,
  debit: number,
  credit: number,
  balance: number,
  userId?: number
) => {
  await conn.execute(
    `INSERT INTO inventory_stockvaluationlayer 
      (stockmove_id, product_id, location_id, debit_qty, credit_qty, balance, unit_cost, created_at, user_id) 
     VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), ?)`,
    [stockmoveId, productId, locationId, debit, credit, balance, userId ?? null]
  );
};

export const updateOperationStatus = async (
  stockmoveId: number,
  status: OperationStatus,
  actor?: string,
  userId?: number
): Promise<void> => {
  if (!userId) throw new HttpError(401, 'Unauthenticated');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [moves] = await conn.query(
      `SELECT id, type, status, source_location_id AS sourceLocationId, dest_location_id AS destLocationId
       FROM inventory_stockmove WHERE id = ? AND user_id = ? FOR UPDATE`,
      [stockmoveId, userId]
    );
    const move = (moves as any[])[0];
    if (!move) throw new HttpError(404, 'Operation not found');

    const [items] = await conn.query(
      `SELECT st.product_id AS productId, st.quantity, p.sku, p.name
       FROM inventory_stocktransfer st
       INNER JOIN inventory_product p ON p.id = st.product_id
       WHERE st.stockmove_id = ?`,
      [stockmoveId]
    );
    const moveItems = items as any[];

    if (status === 'DONE' && move.status !== 'DONE') {
      for (const item of moveItems) {
        switch (move.type as OperationType) {
          case 'RECEIPT': {
            if (!move.destLocationId) throw new HttpError(400, 'Destination location required');
            const balance = await upsertQuant(conn, item.productId, move.destLocationId, Number(item.quantity));
            await insertValuationLayer(
              conn,
              stockmoveId,
              item.productId,
              move.destLocationId,
              Number(item.quantity),
              0,
              balance,
              userId
            );
            break;
          }
          case 'DELIVERY': {
            if (!move.sourceLocationId) throw new HttpError(400, 'Source location required');
            const balance = await upsertQuant(conn, item.productId, move.sourceLocationId, -Number(item.quantity));
            await insertValuationLayer(
              conn,
              stockmoveId,
              item.productId,
              move.sourceLocationId,
              0,
              Number(item.quantity),
              balance,
              userId
            );
            break;
          }
          case 'INTERNAL': {
            if (!move.sourceLocationId || !move.destLocationId) {
              throw new HttpError(400, 'Source and destination required');
            }
            await upsertQuant(conn, item.productId, move.sourceLocationId, -Number(item.quantity));
            const balance = await upsertQuant(conn, item.productId, move.destLocationId, Number(item.quantity));
            await insertValuationLayer(
              conn,
              stockmoveId,
              item.productId,
              move.destLocationId,
              Number(item.quantity),
              0,
              balance,
              userId
            );
            break;
          }
          case 'ADJUSTMENT': {
            if (!move.destLocationId && !move.sourceLocationId) {
              throw new HttpError(400, 'Location required');
            }
            const targetLocation = move.destLocationId || move.sourceLocationId;
            const balance = await upsertQuant(conn, item.productId, targetLocation, Number(item.quantity));
            await insertValuationLayer(
              conn,
              stockmoveId,
              item.productId,
              targetLocation,
              Number(item.quantity),
              0,
              balance,
              userId
            );
            break;
          }
        }
      }
    }

    await conn.execute(
      `UPDATE inventory_stockmove 
       SET status = ?, version = COALESCE(version, 1) + 1, last_edited_by = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [status, actor ?? null, stockmoveId, userId]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
