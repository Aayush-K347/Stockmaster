import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { createProduct, getProducts } from '../services/productService';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const products = await getProducts(userId);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

const createSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(1),
  category: z.string().optional(),
  uomCode: z.string().min(1),
  minStock: z.number().optional(),
  maxStock: z.number().optional(),
  price: z.number().optional(),
  barcode: z.string().optional(),
  qcStatus: z.enum(['PASS', 'FAIL', 'PENDING']).optional(),
  locationCode: z.string().optional(),
  initialQuantity: z.number().optional(),
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const payload = createSchema.parse(req.body);
    const userId = req.user?.userId;
    const product = await createProduct(payload, userId);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

export const productRouter = router;
