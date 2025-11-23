import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { HttpError } from '../middleware/errorHandler';
import { createOperation, getOperations, updateOperationData, updateOperationStatus } from '../services/operationService';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const operations = await getOperations(req.user?.userId);
    res.json(operations);
  } catch (error) {
    next(error);
  }
});

const itemSchema = z.object({
  productId: z.number().int(),
  quantity: z.number().positive(),
});

const createSchema = z.object({
  type: z.enum(['RECEIPT', 'DELIVERY', 'INTERNAL', 'ADJUSTMENT']),
  reference: z.string(),
  contact: z.string(),
  responsible: z.string(),
  sourceLocation: z.string().optional(),
  destLocation: z.string().optional(),
  scheduledDate: z.string(),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED']).optional(),
  items: z.array(itemSchema).min(1),
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const payload = createSchema.parse(req.body);
    const op = await createOperation(payload, req.user?.userId);
    res.status(201).json(op);
  } catch (error) {
    next(error);
  }
});

const updateSchema = createSchema.partial();

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const payload = updateSchema.parse(req.body);
    const id = Number(req.params.id);
    if (Number.isNaN(id)) throw new HttpError(400, 'Invalid id');
    await updateOperationData(id, payload as any, req.user?.userId);
    res.json({ message: 'Updated' });
  } catch (error) {
    next(error);
  }
});

const statusSchema = z.object({
  status: z.enum(['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED']),
});

router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const id = Number(req.params.id);
    if (Number.isNaN(id)) throw new HttpError(400, 'Invalid id');
    await updateOperationStatus(id, status, req.user?.email, req.user?.userId);
    res.json({ message: 'Updated' });
  } catch (error) {
    next(error);
  }
});

export const operationsRouter = router;
