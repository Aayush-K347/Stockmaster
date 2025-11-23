
import React, { useState } from 'react';
import { Search, Plus, ScanBarcode, Download, AlertTriangle, Boxes, Eye, X } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { GlassCard } from '../../components/GlassCard';
import { Product } from '../../types';

export default function Products() {
  const { products, addProduct } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ category: 'Raw Material', uom: 'unit' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku) return;

    addProduct({
      id: `p-${Date.now()}`,
      name: newProduct.name,
      sku: newProduct.sku,
      category: newProduct.category || 'Uncategorized',
      uom: newProduct.uom || 'unit',
      quantity: newProduct.quantity || 0,
      minStock: 10,
      maxStock: 100,
      price: newProduct.price ?? Number((Math.random() * 450 + 50).toFixed(2)),
      location: 'WH-Main',
      qcStatus: 'PENDING'
    });
    setShowCreate(false);
    setNewProduct({});
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Product Management</h1>
          <p className="text-gray-400 text-sm">Create products, set categories, and manage SKUs.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primaryLight text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(109,40,217,0.4)]">
            <Plus size={16} /> Create Product
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
           <GlassCard className="w-full max-w-lg p-8 relative bg-[#05050A]">
              <button onClick={() => setShowCreate(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
              <h2 className="text-2xl font-bold font-display mb-6 text-white">New Product</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="block text-xs text-gray-400 mb-1 uppercase">Product Name</label>
                       <input required value={newProduct.name || ''} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary outline-none" placeholder="e.g. Steel Rods 20mm" />
                    </div>
                    <div>
                       <label className="block text-xs text-gray-400 mb-1 uppercase">SKU / Code</label>
                       <input required value={newProduct.sku || ''} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary outline-none" placeholder="ST-20" />
                    </div>
                    <div>
                       <label className="block text-xs text-gray-400 mb-1 uppercase">Category</label>
                       <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary outline-none">
                          <option>Raw Material</option>
                          <option>Finished Goods</option>
                          <option>Electronics</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs text-gray-400 mb-1 uppercase">Unit of Measure</label>
                       <input value={newProduct.uom || ''} onChange={e => setNewProduct({...newProduct, uom: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary outline-none" placeholder="kg, m, unit" />
                    </div>
                    <div>
                       <label className="block text-xs text-gray-400 mb-1 uppercase">Initial Stock</label>
                       <input type="number" value={newProduct.quantity || 0} onChange={e => setNewProduct({...newProduct, quantity: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary outline-none" />
                    </div>
                 </div>
                 <div className="pt-4">
                    <button type="submit" className="w-full py-3 bg-primary hover:bg-primaryLight rounded-lg text-white font-bold shadow-[0_0_20px_rgba(109,40,217,0.4)]">Create Product</button>
                 </div>
              </form>
           </GlassCard>
        </div>
      )}

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input type="text" placeholder="Search SKU, Name..." className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-primary outline-none" />
           </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="p-4 font-medium">Product Details</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">UoM</th>
              <th className="p-4 font-medium text-right">Stock Level</th>
              <th className="p-4 font-medium text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-4">
                  <div className="font-medium text-white">{p.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">{p.sku}</span>
                    {p.quantity <= p.minStock && <span className="text-[10px] text-red-400 flex items-center gap-1"><AlertTriangle size={10}/> Low Stock</span>}
                  </div>
                </td>
                <td className="p-4 text-gray-300">{p.category}</td>
                <td className="p-4 text-gray-400">{p.uom}</td>
                <td className="p-4 text-right">
                   <div className="w-24 ml-auto">
                      <div className="flex justify-between text-xs mb-1">
                         <span className="text-white font-bold">{p.quantity}</span>
                         <span className="text-gray-500">/ {p.maxStock}</span>
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                         <div className="h-full bg-primary" style={{width: `${Math.min((p.quantity/p.maxStock)*100, 100)}%`}}></div>
                      </div>
                   </div>
                </td>
                <td className="p-4 text-right text-gray-300 font-mono">${(p.price * p.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
