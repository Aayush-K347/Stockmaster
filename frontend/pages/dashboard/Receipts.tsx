
import React, { useMemo, useState } from 'react';
import { Plus, Printer, X, Search, Trash2, PackageCheck, ArrowRight, Copy, FileEdit, AlertCircle } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { GlassCard } from '../../components/GlassCard';
import { Operation, OperationItem } from '../../types';

export default function Receipts() {
  const { operations, products, addOperation, updateOperation, validateOperation, deleteOperation } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [printPreview, setPrintPreview] = useState<Operation | null>(null);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [supplier, setSupplier] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedItems, setSelectedItems] = useState<OperationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const destinationLabel = useMemo(() => {
    if (!printPreview?.destLocation) return 'Main Warehouse (Stock)';
    return printPreview.destLocation === 'WH-Main' ? 'Main Warehouse (Stock)' : printPreview.destLocation;
  }, [printPreview?.destLocation]);

  // Filter products
  const filteredProducts = products.filter(p => 
     p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      const existing = selectedItems.find(i => i.productId === productId);
      if (existing) {
         setSelectedItems(selectedItems.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
         setSelectedItems([...selectedItems, { productId: prod.id, productName: prod.name, quantity: 1 }]);
      }
      setSearchTerm('');
      setIsAddingProduct(false);
    }
  };

  const removeItem = (index: number) => {
     const newItems = [...selectedItems];
     newItems.splice(index, 1);
     setSelectedItems(newItems);
  };

  const handleEdit = (op: Operation) => {
    setSupplier(op.contact);
    setScheduleDate(op.scheduledDate);
    setSelectedItems(op.items);
    setEditingId(op.id);
    setShowCreate(true);
  };

  const handleDuplicate = (op: Operation) => {
    const newOp: Operation = {
        ...op,
        id: `rcpt-${Date.now()}`,
        reference: `WH/IN/${String(operations.length + 1001).padStart(4, '0')}`,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        items: [...op.items] // Deep copy items
    };
    addOperation(newOp);
  };

  const handleCreate = (validateNow: boolean = false) => {
     if (!supplier) { alert('Please enter a supplier'); return; }
     if (selectedItems.length === 0) { alert('Please add at least one product'); return; }

     if (editingId) {
        // UPDATE EXISTING
        updateOperation(editingId, {
            contact: supplier,
            scheduledDate: scheduleDate,
            items: selectedItems,
        });
        if (validateNow) setTimeout(() => validateOperation(editingId), 100);
     } else {
        // CREATE NEW
        const newOp: Operation = {
            id: `rcpt-${Date.now()}`,
            type: 'RECEIPT',
            reference: `WH/IN/${String(operations.length + 1001).padStart(4, '0')}`,
            contact: supplier,
            responsible: 'Admin',
            scheduledDate: scheduleDate,
            status: 'DRAFT',
            items: selectedItems,
            createdAt: new Date().toISOString(),
            destLocation: 'WH-Main'
        };
        addOperation(newOp);
        if (validateNow) {
            setTimeout(() => validateOperation(newOp.id), 100);
        }
     }
     resetForm();
  };

  const resetForm = () => {
    setShowCreate(false);
    setEditingId(null);
    setSupplier('');
    setSelectedItems([]);
    setSearchTerm('');
    setIsAddingProduct(false);
  };

  const receipts = operations.filter(o => o.type === 'RECEIPT');

  return (
    <div className="space-y-6 animate-slide-up pb-20">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Receipts</h1>
          <p className="text-gray-400 text-sm mt-1">Manage incoming vendor shipments.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primaryLight text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-[0_0_20px_rgba(109,40,217,0.4)] transition-all hover:scale-105">
          <Plus size={18} /> New Receipt
        </button>
      </div>

      {/* Create/Edit Receipt Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
           <div className="w-full max-w-5xl bg-[#02010A] border border-primary/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-white/5 shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg"><PackageCheck className="text-primary" size={20}/></div>
                    <div>
                        <div className="text-white font-bold tracking-wide text-sm uppercase">{editingId ? 'Edit Receipt' : 'Incoming Shipment'}</div>
                        <div className="text-gray-500 text-xs font-mono">Reference: {editingId ? operations.find(o => o.id === editingId)?.reference : 'AUTO-GENERATED'}</div>
                    </div>
                 </div>
                 <button onClick={resetForm} className="text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                 {/* Status Bar */}
                 <div className="flex justify-end mb-8">
                    <div className="flex items-center bg-white/5 rounded-full px-1 p-1 border border-white/10">
                       <div className="px-6 py-1.5 rounded-full bg-primary text-white text-xs font-bold uppercase shadow-lg">Draft</div>
                       <div className="px-2"><ArrowRight size={12} className="text-gray-600"/></div>
                       <div className="px-6 py-1.5 rounded-full text-gray-500 text-xs font-bold uppercase">Done</div>
                    </div>
                 </div>

                 {/* Main Form */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                    <div className="space-y-8">
                       <div className="group">
                          <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider">Receive From (Vendor)</label>
                          <input 
                            value={supplier} 
                            onChange={e => setSupplier(e.target.value)} 
                            className="w-full bg-transparent border-b border-white/20 py-2 text-2xl text-white outline-none focus:border-primary transition-colors placeholder-gray-700 font-display font-bold" 
                            placeholder="Vendor Name..." 
                            autoFocus
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Destination Warehouse</label>
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                             <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded flex items-center justify-center text-xs font-bold">WH</div>
                             <span className="text-white font-medium">Main Warehouse (Stock)</span>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-8">
                       <div>
                          <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider">Scheduled Date</label>
                          <input 
                            type="date" 
                            value={scheduleDate} 
                            onChange={e => setScheduleDate(e.target.value)} 
                            className="w-full bg-transparent border-b border-white/20 py-2 text-xl text-white outline-none focus:border-primary transition-colors font-mono" 
                          />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Source Document</label>
                           <input className="w-full bg-transparent border-b border-white/20 py-2 text-lg text-white outline-none focus:border-primary transition-colors placeholder-gray-700" placeholder="e.g. PO00123" />
                       </div>
                    </div>
                 </div>

                 {/* Product Lines */}
                 <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                       <h3 className="text-sm font-bold text-white uppercase tracking-wider">Product Lines</h3>
                       <span className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded">{selectedItems.length} Items</span>
                    </div>

                    <table className="w-full text-left text-sm">
                       <thead className="bg-black/20">
                          <tr className="text-gray-500 text-xs uppercase tracking-wider">
                             <th className="px-6 py-3 font-medium">Product</th>
                             <th className="px-6 py-3 font-medium text-right">Current Stock</th>
                             <th className="px-6 py-3 font-medium text-right">Quantity to Receive</th>
                             <th className="px-6 py-3 w-16"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {selectedItems.map((item, idx) => {
                             const product = products.find(p => p.id === item.productId);
                             return (
                                <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                   <td className="px-6 py-4 text-white font-medium">
                                      <div>{item.productName}</div>
                                      {product && <div className="text-[10px] text-gray-500 mt-0.5 font-mono">{product.sku}</div>}
                                   </td>
                                   <td className="px-6 py-4 text-right text-gray-400 font-mono">
                                      {product ? (
                                         <span className="bg-white/5 px-2 py-1 rounded text-xs">{product.quantity} {product.uom}</span>
                                      ) : '-'}
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <div className="inline-flex items-center bg-[#02010A] rounded-lg border border-white/20 focus-within:border-primary transition-colors">
                                         <input 
                                           type="number" 
                                           min="1"
                                           value={item.quantity} 
                                           onChange={e => {
                                              const val = parseInt(e.target.value);
                                              const newItems = [...selectedItems];
                                              newItems[idx].quantity = isNaN(val) ? 0 : val;
                                              setSelectedItems(newItems);
                                           }}
                                           className="w-24 bg-transparent text-right text-white p-2 outline-none font-mono text-sm" 
                                         />
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-center">
                                      <button onClick={() => removeItem(idx)} className="text-gray-600 hover:text-red-400 transition-colors p-2"><Trash2 size={16}/></button>
                                   </td>
                                </tr>
                             );
                          })}
                       </tbody>
                    </table>
                    
                    {/* INLINE ADD PRODUCT */}
                    <div className="p-4 bg-black/20 border-t border-white/5">
                        {!isAddingProduct ? (
                           <button 
                              onClick={() => setIsAddingProduct(true)}
                              className="w-full py-3 border border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                           >
                              <Plus size={16} /> Add Product Line
                           </button>
                        ) : (
                           <div className="animate-fade-in bg-[#02010A] border border-primary/30 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3">
                                 <Search size={16} className="text-primary"/>
                                 <input 
                                    autoFocus
                                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
                                    placeholder="Type to search products..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                 />
                                 <button onClick={() => setIsAddingProduct(false)} className="text-xs text-gray-500 hover:text-white">Close</button>
                              </div>
                              <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                                 {filteredProducts.map(p => (
                                    <button 
                                       key={p.id} 
                                       onClick={() => addItem(p.id)} 
                                       className="w-full text-left p-2 hover:bg-white/10 rounded flex justify-between items-center group transition-colors"
                                    >
                                       <span className="text-gray-300 group-hover:text-white">{p.name}</span>
                                       <div className="flex items-center gap-3">
                                           <span className="text-xs font-mono text-gray-600 group-hover:text-primary">{p.sku}</span>
                                           <span className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{p.quantity} in stock</span>
                                       </div>
                                    </button>
                                 ))}
                                 {filteredProducts.length === 0 && <div className="text-center text-gray-600 text-xs py-2">No products found</div>}
                              </div>
                           </div>
                        )}
                    </div>
                 </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-white/10 bg-white/5 flex justify-between items-center shrink-0">
                 <button onClick={resetForm} className="px-6 py-3 text-gray-400 hover:text-white transition-colors font-medium">Discard</button>
                 <div className="flex gap-4">
                    <button onClick={() => handleCreate(false)} className="px-8 py-3 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-colors font-medium">
                        {editingId ? 'Save Changes' : 'Save Draft'}
                    </button>
                    <button onClick={() => handleCreate(true)} className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primaryLight transition-all shadow-[0_0_20px_rgba(109,40,217,0.4)] font-bold">
                        Validate Receipt
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Printable Receipt Preview */}
      {printPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-gradient-to-b from-[#0B0815] to-black border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-white/5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Receipt</p>
                <h2 className="text-2xl font-display text-white font-bold">{printPreview.reference}</h2>
                <p className="text-sm text-gray-400 mt-1">Validated vendor receipt overview</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-green-500/10 text-green-400 border border-green-500/20">{printPreview.status}</span>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryLight transition-colors"
                >
                  <Printer size={16} /> Print
                </button>
                <button onClick={() => setPrintPreview(null)} className="text-gray-500 hover:text-white transition-colors p-2 rounded-full bg-white/5">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 px-8 py-6 bg-black/30 border-b border-white/5">
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Vendor</p>
                <p className="text-lg text-white font-semibold">{printPreview.contact}</p>
                <p className="text-sm text-gray-400">Scheduled: {new Date(printPreview.scheduledDate).toLocaleDateString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Destination</p>
                <p className="text-lg text-white font-semibold">{destinationLabel}</p>
                <p className="text-sm text-gray-400">Handled by {printPreview.responsible || 'Admin'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Summary</p>
                <p className="text-lg text-white font-semibold">{printPreview.items.length} line items</p>
                <p className="text-sm text-gray-400">Total to receive: {printPreview.items.reduce((sum, i) => sum + i.quantity, 0)}</p>
              </div>
            </div>

            <div className="px-8 py-6">
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3 text-right">Quantity</th>
                      <th className="px-4 py-3 text-right">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {printPreview.items.map(item => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <tr key={item.productId} className="bg-black/20">
                          <td className="px-4 py-3 text-white font-medium">{item.productName}</td>
                          <td className="px-4 py-3 text-gray-400 font-mono text-sm">{product?.sku || '—'}</td>
                          <td className="px-4 py-3 text-right text-white font-semibold">{item.quantity} {product?.uom || ''}</td>
                          <td className="px-4 py-3 text-right text-gray-400">{product?.location || printPreview.destLocation || 'WH-Main'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-6 text-sm text-gray-400">
                <div>
                  <p className="uppercase text-[11px] tracking-wide text-gray-500">Notes</p>
                  <p className="text-white/80">{printPreview.notes || 'Receipt validated. Ready for putaway.'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Created</p>
                  <p className="text-white">{printPreview.createdAt ? new Date(printPreview.createdAt).toLocaleString() : '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      <GlassCard className="overflow-hidden border-t-0">
        <div className="overflow-x-auto">
           <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400 border-b border-white/5">
                 <tr>
                    <th className="p-5 font-semibold">Reference</th>
                    <th className="p-5 font-semibold">Vendor</th>
                    <th className="p-5 font-semibold">Scheduled Date</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 font-semibold text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {receipts.map(op => (
                    <tr key={op.id} className="hover:bg-white/5 transition-colors group">
                       <td className="p-5 font-mono text-primary font-medium">{op.reference}</td>
                       <td className="p-5 text-white font-medium">{op.contact}</td>
                       <td className="p-5 text-gray-400">{op.scheduledDate}</td>
                       <td className="p-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border tracking-wide ${op.status === 'DONE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                             {op.status}
                          </span>
                       </td>
                       <td className="p-5 text-right flex items-center justify-end gap-2">
                          {/* Validate Button */}
                          {op.status !== 'DONE' && (
                             <button onClick={() => validateOperation(op.id)} className="text-xs bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-green-900/20 font-bold tracking-wide hover:scale-105 active:scale-95">
                                Validate
                             </button>
                          )}
                          
                          {/* Edit Button */}
                          {op.status === 'DRAFT' && (
                            <button onClick={() => handleEdit(op)} className="p-2 text-gray-400 hover:text-blue-400 transition-colors hover:bg-blue-500/10 rounded-lg" title="Edit">
                              <FileEdit size={16} />
                            </button>
                          )}

                          {/* Duplicate Button */}
                          <button onClick={() => handleDuplicate(op)} className="p-2 text-gray-400 hover:text-purple-400 transition-colors hover:bg-purple-500/10 rounded-lg" title="Duplicate">
                            <Copy size={16} />
                          </button>

                          {/* Delete Button */}
                          {op.status === 'DRAFT' && (
                             <button onClick={() => deleteOperation(op.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors hover:bg-red-500/10 rounded-lg"><Trash2 size={16}/></button>
                          )}
                          
                          {op.status === 'DONE' && (
                             <button
                               onClick={() => setPrintPreview(op)}
                               className="text-gray-600 hover:text-white transition-colors p-2"
                               title="View printable receipt"
                             >
                               <Printer size={18}/>
                             </button>
                          )}
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
           {receipts.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4"><PackageCheck size={24} opacity={0.5}/></div>
                 <p>No receipts found.</p>
                 <button onClick={() => setShowCreate(true)} className="mt-4 text-primary hover:text-primaryLight text-sm">Create your first receipt</button>
              </div>
           )}
        </div>
      </GlassCard>
    </div>
  );
}
