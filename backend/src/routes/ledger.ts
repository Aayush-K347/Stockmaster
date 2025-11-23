import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getLedgerEntries } from '../services/ledgerService';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const entries = await getLedgerEntries();
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

export const ledgerRouter = router;
