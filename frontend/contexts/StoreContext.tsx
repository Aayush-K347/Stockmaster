
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Product, Operation, StockLedgerEntry } from '../types';
import { MOCK_PRODUCTS, MOCK_OPERATIONS, MOCK_LEDGER } from '../constants';
import { useAuth } from './AuthContext';

interface StoreContextType {
  products: Product[];
  operations: Operation[];
  ledger: StockLedgerEntry[];
  addProduct: (product: Product) => void;
  addOperation: (op: Operation) => void;
  updateOperation: (id: string, op: Partial<Operation>) => void;
  validateOperation: (id: string) => void;
  deleteOperation: (id: string) => void;
}

type SessionSnapshot = {
  products: Product[];
  operations: Operation[];
  ledger: StockLedgerEntry[];
};

const SESSION_STORAGE_PREFIX = 'stockmaster:session';

const readSessionSnapshot = (key: string): SessionSnapshot | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as SessionSnapshot) : null;
  } catch (error) {
    console.warn('Failed to read session snapshot', error);
    return null;
  }
};

const writeSessionSnapshot = (key: string, data: SessionSnapshot) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to persist session snapshot', error);
  }
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  const { apiFetch, isSignedIn, user } = useAuth();
  const sessionKey = useMemo(
    () => `${SESSION_STORAGE_PREFIX}:${isSignedIn && user?.email ? user.email : 'guest'}`,
    [isSignedIn, user?.email]
  );
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [operations, setOperations] = useState<Operation[]>(MOCK_OPERATIONS);
  const [ledger, setLedger] = useState<StockLedgerEntry[]>(MOCK_LEDGER);
  const apiReady = Boolean(import.meta.env.VITE_API_URL && isSignedIn);

  const mapProduct = (p: any): Product => ({
    id: String(p.id),
    name: p.name,
    sku: p.sku,
    category: p.category,
    uom: p.uom,
    quantity: Number(p.quantity ?? 0),
    minStock: Number(p.minStock ?? 0),
    maxStock: Number(p.maxStock ?? 0),
    price: Number(p.price ?? 0),
    location: p.location || 'WH-MAIN',
    barcode: p.barcode,
    qcStatus: p.qcStatus,
  });

  const mapOperation = (o: any): Operation => ({
    id: String(o.id),
    type: o.type,
    reference: o.reference,
    contact: o.contact,
    responsible: o.responsible,
    status: o.status,
    sourceLocation: o.sourceLocation || undefined,
    destLocation: o.destLocation || undefined,
    scheduledDate: o.scheduledDate,
    notes: o.notes,
    version: o.version,
    createdAt: o.createdAt,
    lastEditedBy: o.lastEditedBy,
    items: (o.items || []).map((i: any) => ({
      productId: String(i.productId),
      productName: i.productName,
      quantity: Number(i.quantity),
    })),
  });

  const mapLedger = (l: any): StockLedgerEntry => ({
    id: String(l.id),
    date: l.date,
    reference: l.reference,
    productName: l.productName,
    sku: l.sku,
    location: l.location,
    credit: Number(l.credit ?? 0),
    debit: Number(l.debit ?? 0),
    balance: Number(l.balance ?? 0),
    user: l.user,
    type: l.type,
  });

  const loadFromApi = async () => {
    if (!apiReady) return false;
    try {
      const [apiProducts, apiOps, apiLedger] = await Promise.all([
        apiFetch('/products'),
        apiFetch('/operations'),
        apiFetch('/ledger'),
      ]);
      const mappedProducts = (apiProducts as any[]).map(mapProduct);
      const mappedOperations = (apiOps as any[]).map(mapOperation);
      const mappedLedger = (apiLedger as any[]).map(mapLedger);
      setProducts(mappedProducts);
      setOperations(mappedOperations);
      setLedger(mappedLedger);
      writeSessionSnapshot(sessionKey, {
        products: mappedProducts,
        operations: mappedOperations,
        ledger: mappedLedger,
      });
      return true;
    } catch (error) {
      console.error('Failed to load from backend', error);
      return false;
    }
  };

  const loadFromSnapshotOrSeed = () => {
    const snapshot = readSessionSnapshot(sessionKey);
    if (snapshot) {
      setProducts(snapshot.products);
      setOperations(snapshot.operations);
      setLedger(snapshot.ledger);
      return true;
    }
    setProducts(MOCK_PRODUCTS);
    setOperations(MOCK_OPERATIONS);
    setLedger(MOCK_LEDGER);
    writeSessionSnapshot(sessionKey, {
      products: MOCK_PRODUCTS,
      operations: MOCK_OPERATIONS,
      ledger: MOCK_LEDGER,
    });
    return false;
  };

  useEffect(() => {
    if (!apiReady) {
      loadFromSnapshotOrSeed();
      return;
    }

    loadFromApi().then(success => {
      if (!success) {
        loadFromSnapshotOrSeed();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, sessionKey]);

  useEffect(() => {
    writeSessionSnapshot(sessionKey, { products, operations, ledger });
  }, [ledger, operations, products, sessionKey]);

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    if (apiReady) {
      apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: product.name,
          sku: product.sku,
          category: product.category,
          uomCode: product.uom,
          minStock: product.minStock,
          maxStock: product.maxStock,
          price: product.price,
          locationCode: product.location?.toUpperCase(),
          initialQuantity: product.quantity,
          qcStatus: product.qcStatus || 'PASS',
        }),
      }).then(loadFromApi).catch((err) => console.error(err));
    }
  };

  const addOperation = (op: Operation) => {
    setOperations(prev => [op, ...prev]);
    if (apiReady) {
      apiFetch('/operations', {
        method: 'POST',
        body: JSON.stringify({
          type: op.type,
          reference: op.reference,
          contact: op.contact,
          responsible: op.responsible,
          sourceLocation: op.sourceLocation?.toUpperCase(),
          destLocation: op.destLocation?.toUpperCase(),
          scheduledDate: op.scheduledDate,
          notes: op.notes,
          status: op.status,
          items: op.items.map(i => ({ productId: Number(i.productId), quantity: i.quantity })),
        }),
      }).then(loadFromApi).catch((err) => console.error(err));
    }
  };

  const updateOperation = (id: string, updates: Partial<Operation>) => {
    setOperations(prev => prev.map(o => o.id === id ? { ...o, ...updates, lastEditedBy: 'Admin', version: (o.version || 1) + 1 } : o));
    if (apiReady) {
      const op = operations.find(o => o.id === id);
      if (op) {
        apiFetch(`/operations/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...op,
            ...updates,
            sourceLocation: updates.sourceLocation || op.sourceLocation?.toUpperCase(),
            destLocation: updates.destLocation || op.destLocation?.toUpperCase(),
            items: (updates.items || op.items).map(i => ({ productId: Number(i.productId), quantity: i.quantity })),
          }),
        }).then(loadFromApi).catch((err) => console.error(err));
      }
    }
  };

  const deleteOperation = (id: string) => {
    setOperations(prev => prev.filter(o => o.id !== id));
  }

  const addToLedger = (entry: StockLedgerEntry) => {
    setLedger(prev => [entry, ...prev]);
  };

  // CORE BUSINESS LOGIC
  const validateOperation = (id: string) => {
    const op = operations.find(o => o.id === id);
    if (!op || op.status === 'DONE') return;

    // 1. STRICT VALIDATION CHECKS
    if (op.type === 'DELIVERY' || op.type === 'INTERNAL') {
      for (const item of op.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          alert(`Error: Product ${item.productName} not found.`);
          return;
        }
        if (product.quantity < item.quantity) {
          alert(`Validation Failed: Insufficient stock for ${product.name}.\nAvailable: ${product.quantity}\nRequired: ${item.quantity}`);
          return;
        }
      }
    }

    // 2. UPDATE STATUS
    const updatedOps = operations.map(o => 
      o.id === id ? { ...o, status: 'DONE' as const } : o
    );
    setOperations(updatedOps);

    // 3. PROCESS STOCK IMPACT
    op.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      let newQty = product.quantity;
      let newLocation = product.location;
      let ledgerType: 'IN' | 'OUT' | 'ADJ' | 'MOVE' = 'IN';
      let debit = 0;
      let credit = 0;
      let logLocation = op.destLocation || op.sourceLocation || product.location;

      switch (op.type) {
        case 'RECEIPT':
          newQty += item.quantity;
          debit = item.quantity;
          ledgerType = 'IN';
          logLocation = op.destLocation || 'WH-Main'; 
          // If product was out of stock or new, set location to inbound location
          if (product.quantity === 0 && op.destLocation) {
             newLocation = op.destLocation;
          }
          break;
        
        case 'DELIVERY':
          newQty -= item.quantity;
          credit = item.quantity;
          ledgerType = 'OUT';
          logLocation = op.sourceLocation || 'WH-Dispatch';
          break;
        
        case 'INTERNAL':
          ledgerType = 'MOVE';
          debit = item.quantity;
          credit = item.quantity;
          logLocation = `${op.sourceLocation} → ${op.destLocation}`;
          // LOGIC: If moving entire stock, update the product's main location reference
          if (item.quantity >= product.quantity && op.destLocation) {
             newLocation = op.destLocation;
          }
          break;

        case 'ADJUSTMENT':
          const diff = item.quantity - product.quantity; // item.quantity here is the "Physical Count"
          newQty = item.quantity;
          ledgerType = 'ADJ';
          if (diff > 0) {
             debit = diff;
          } else {
             credit = Math.abs(diff);
          }
          logLocation = op.sourceLocation || product.location;
          break;
      }

      // Update Product State
      if (newQty !== product.quantity || newLocation !== product.location) {
        setProducts(prev => prev.map(p => 
          p.id === product.id ? { ...p, quantity: newQty, location: newLocation } : p
        ));
      }

      // Add Ledger Entry
      addToLedger({
        id: `leg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toLocaleString(),
        reference: op.reference,
        productName: product.name,
        sku: product.sku,
        location: logLocation,
        debit,
        credit,
        balance: newQty,
        user: op.responsible || 'Admin',
        type: ledgerType
      });
    });

    if (apiReady) {
      apiFetch(`/operations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'DONE' }),
      }).then(loadFromApi).catch((err) => console.error(err));
    }
  };

  return (
    <StoreContext.Provider value={{ products, operations, ledger, addProduct, addOperation, updateOperation, validateOperation, deleteOperation }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
