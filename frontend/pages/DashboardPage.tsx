
import React, { useState } from 'react';
import { ViewState } from '../types';
import { MOCK_WAREHOUSES } from '../constants';
import {
  LayoutDashboard, Package, ArrowRightLeft,
  LogOut, Bell, Search, ChevronDown, ArrowUpRight,
  ArrowDownLeft, Menu, Layers,
  ClipboardList, TrendingUp, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Import Pages
import Overview from './dashboard/Overview';
import Products from './dashboard/Products';
import Receipts from './dashboard/Receipts';
import Deliveries from './dashboard/Deliveries';
import InternalTransfers from './dashboard/InternalTransfers';
import Adjustments from './dashboard/Adjustments';
import Ledger from './dashboard/Ledger';
import HeatmapView from './dashboard/Overview'; // For now using overview, Heatmap is specific
import QuantumInventory from './QuantumInventory';

export default function DashboardPage({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout } = useAuth();

  const NavItem = ({ icon: Icon, label, active, onClick, showLabel }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${showLabel ? 'gap-3 justify-start' : 'gap-0 justify-center'} px-4 py-2.5 mb-1 text-sm font-medium transition-all rounded-r-full border-l-2 ${
        active
        ? 'bg-gradient-to-r from-primary/20 to-transparent border-primary text-white shadow-[0_0_15px_-5px_rgba(109,40,217,0.5)]'
        : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
      }`}
      aria-label={label}
    >
      <Icon size={18} className={`${active ? 'text-primary' : 'text-gray-500'} ${showLabel ? '' : 'mx-auto'}`} />
      {showLabel && <span>{label}</span>}
      {!showLabel && <span className="sr-only">{label}</span>}
    </button>
  );

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="px-4 mt-6 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">{label}</div>
  );

  return (
    <div className="min-h-screen bg-[#02010A] text-white flex overflow-hidden font-sans selection:bg-primary selection:text-white">
      {/* Sidebar */}
      <aside className={`fixed lg:relative z-30 w-64 h-screen glass-panel border-y-0 border-l-0 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'} lg:bg-[#05050A]`}>
        <div className="p-6 flex items-center gap-3 mb-2">
           <div className="w-8 h-8 bg-primary rounded-lg rotate-3 flex items-center justify-center shadow-[0_0_15px_rgba(109,40,217,0.5)] flex-shrink-0">
              <Layers className="text-white w-5 h-5 -rotate-3" />
           </div>
           {isSidebarOpen && <span className="text-xl font-bold font-display tracking-tight whitespace-nowrap">StockMaster</span>}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-0 pb-6">
           {isSidebarOpen && <SectionLabel label="Main" />}
           <NavItem icon={LayoutDashboard} label="Dashboard" active={view === ViewState.DASHBOARD} onClick={() => setView(ViewState.DASHBOARD)} showLabel={isSidebarOpen} />
           <NavItem icon={Package} label="Products" active={view === ViewState.PRODUCTS} onClick={() => setView(ViewState.PRODUCTS)} showLabel={isSidebarOpen} />

           {isSidebarOpen && <SectionLabel label="Operations" />}
           <NavItem icon={ArrowDownLeft} label="Receipts" active={view === ViewState.OPERATIONS_RECEIPTS} onClick={() => setView(ViewState.OPERATIONS_RECEIPTS)} showLabel={isSidebarOpen} />
           <NavItem icon={ArrowUpRight} label="Deliveries" active={view === ViewState.OPERATIONS_DELIVERIES} onClick={() => setView(ViewState.OPERATIONS_DELIVERIES)} showLabel={isSidebarOpen} />
           <NavItem icon={ArrowRightLeft} label="Internal Transfers" active={view === ViewState.OPERATIONS_INTERNAL} onClick={() => setView(ViewState.OPERATIONS_INTERNAL)} showLabel={isSidebarOpen} />
           <NavItem icon={TrendingUp} label="Adjustments" active={view === ViewState.OPERATIONS_ADJUSTMENTS} onClick={() => setView(ViewState.OPERATIONS_ADJUSTMENTS)} showLabel={isSidebarOpen} />

           {isSidebarOpen && <SectionLabel label="Intelligence" />}
           <NavItem icon={ClipboardList} label="Stock Ledger" active={view === ViewState.STOCK_LEDGER} onClick={() => setView(ViewState.STOCK_LEDGER)} showLabel={isSidebarOpen} />
           <NavItem icon={Zap} label="Inventory Bot" active={view === ViewState.QUANTUM_INVENTORY} onClick={() => setView(ViewState.QUANTUM_INVENTORY)} showLabel={isSidebarOpen} />
        </div>

        <div className="p-4 mt-auto border-t border-white/5">
           <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-xs font-bold border border-white/20">AD</div>
              {isSidebarOpen && <div className="text-xs"><p className="font-bold">Admin User</p><p className="text-gray-500">Head of Logistics</p></div>}
           </div>
          <button 
            onClick={() => { logout(); onLogout(); }} 
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
             <LogOut size={18} />
             {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#02010A]">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#02010A]/80 backdrop-blur-md z-20 sticky top-0">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:text-white transition-colors">
               <Menu size={20} />
             </button>
             <div className="hidden md:flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <Layers size={14} />
                <span>{MOCK_WAREHOUSES[0].name}</span>
                <ChevronDown size={14} />
             </div>
           </div>

           <div className="flex items-center gap-4">
             <div className="relative hidden md:block group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-primary transition-colors" size={14} />
               <input className="bg-black/20 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-gray-500 w-64 focus:border-primary/30 outline-none transition-all" placeholder="Search..." />
             </div>
             <button className="p-2 relative text-gray-400 hover:text-white transition-colors">
               <Bell size={20} />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#6D28D9]"></span>
             </button>
           </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
           {view === ViewState.DASHBOARD && <div className="p-6 md:p-8"><Overview /></div>}
           {view === ViewState.PRODUCTS && <div className="p-6 md:p-8"><Products /></div>}
           {view === ViewState.OPERATIONS_RECEIPTS && <div className="p-6 md:p-8"><Receipts /></div>}
           {view === ViewState.OPERATIONS_DELIVERIES && <div className="p-6 md:p-8"><Deliveries /></div>}
           {view === ViewState.OPERATIONS_INTERNAL && <div className="p-6 md:p-8"><InternalTransfers /></div>}
           {view === ViewState.OPERATIONS_ADJUSTMENTS && <div className="p-6 md:p-8"><Adjustments /></div>}
           {view === ViewState.STOCK_LEDGER && <div className="p-6 md:p-8"><Ledger /></div>}
           {view === ViewState.QUANTUM_INVENTORY && <QuantumInventory />}
        </div>
      </main>
    </div>
  );
}
