
import React, { useState } from 'react';
import { Package, ArrowDownLeft, ArrowUpRight, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { GlassCard } from '../../components/GlassCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_FORECAST, MOCK_ACTIVITY } from '../../constants';

const StatCard = ({ icon: Icon, label, value, subValue, color }: any) => (
  <GlassCard className={`p-5 flex flex-col justify-between relative overflow-hidden group border-${color}-500/20`}>
    <div className={`absolute right-0 top-0 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-all`} />
    <div className="flex justify-between items-start mb-4">
       <div className={`p-2 bg-${color}-500/20 rounded-lg text-${color}-400`}><Icon size={20} /></div>
    </div>
    <div>
      <h3 className={`text-3xl font-bold text-${color}-100 font-display`}>{value}</h3>
      <p className="text-gray-400 text-sm">{label}</p>
      {subValue && <p className={`text-xs mt-1 text-${color}-400`}>{subValue}</p>}
    </div>
  </GlassCard>
);

export default function Overview() {
  const { products, operations } = useStore();
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  const handleViewAnalysis = async () => {
    setAnalysisStatus(null);
    setIsRunningAnalysis(true);

    const hostedBaseUrl = 'https://focused-celebration-production.up.railway.app';
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocalHost = ['localhost', '127.0.0.1'].includes(hostname);
    const isRailwayOrigin = currentOrigin.includes('.railway.app');

    // Prefer the current deployed origin when on Railway, otherwise fall back to the hosted base or local dev.
    const dashboardBase = isRailwayOrigin
      ? currentOrigin
      : isLocalHost
        ? 'http://127.0.0.1:8080'
        : hostedBaseUrl;
    const dashboardUrl = `${dashboardBase.replace(/\/$/, '')}/dashboard`;

    // Try the most contextually relevant forecast endpoint first, with a hosted fallback to avoid local-only failures.
    const generatorEndpoints = [] as string[];
    if (isRailwayOrigin) {
      generatorEndpoints.push(`${dashboardBase.replace(/\/$/, '')}/api/forecast/generate`);
    }
    if (isLocalHost) {
      generatorEndpoints.push('http://127.0.0.1:5000/api/forecast/generate');
    }
    generatorEndpoints.push(`${hostedBaseUrl}/api/forecast/generate`);

    try {
      const newWin = window.open(dashboardUrl, '_blank', 'noopener,noreferrer');

      // Fire-and-forget the generate endpoint; try local first, then fall back to the deployed service.
      let lastError: Error | null = null;
      for (const apiUrl of generatorEndpoints) {
        try {
          const res = await fetch(apiUrl, { method: 'POST' });
          if (!res.ok) {
            const message = await res.text();
            throw new Error(message || 'Failed to start demand analysis');
          }
          setAnalysisStatus('Demand analysis completed successfully.');
          lastError = null;
          break;
        } catch (err: any) {
          lastError = err;
        }
      }

      if (lastError) {
        throw lastError;
      }

      // If the new window was opened to about:blank or similar, ensure it points to dashboard.
      if (newWin && !newWin.closed) {
        try {
          newWin.location.href = dashboardUrl;
        } catch (e) {
          // cross-origin may block assignment; ignore safely
        }
      }
    } catch (error: any) {
      setAnalysisStatus(error?.message || 'Unable to run demand analysis right now.');
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* AI Alert Banner */}
      <div className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 flex items-center justify-between shadow-[0_0_15px_rgba(109,40,217,0.2)]">
         <div className="flex items-center gap-4">
            <div className="p-2 bg-primary rounded-lg animate-pulse-slow"><TrendingUp className="text-white" size={24} /></div>
            <div>
               <h3 className="text-white font-bold">AI Demand Forecast</h3>
               <p className="text-purple-200 text-sm">Stockout predicted for <span className="font-bold text-white">Copper Wire</span> in 3 days. Suggested replenishment: 200m.</p>
            </div>
         </div>
         <button 
           onClick={handleViewAnalysis}
           disabled={isRunningAnalysis}
           className={`px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all border border-white/10 cursor-pointer ${isRunningAnalysis ? 'opacity-60 cursor-not-allowed' : ''}`}
         >
           {isRunningAnalysis ? 'Running...' : 'View Analysis'}
         </button>
      </div>
      {analysisStatus && (
        <div className="text-sm text-purple-200 bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2">
          {analysisStatus}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Stock Value" value="$24.5k" subValue="+12% vs last month" color="purple" />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={products.filter(p => p.quantity <= p.minStock).length} subValue="Action Required" color="orange" />
        <StatCard icon={ArrowDownLeft} label="Pending Receipts" value={operations.filter(o => o.type === 'RECEIPT' && o.status === 'WAITING').length} color="blue" />
        <StatCard icon={ArrowUpRight} label="To Deliver" value={operations.filter(o => o.type === 'DELIVERY' && o.status === 'READY').length} color="green" />
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-medium mb-6 text-white flex items-center gap-2"><Activity size={20} className="text-primary"/> Stock Movement (Real-time)</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_FORECAST}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="month" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0B15', border: '1px solid #333', color: '#fff' }} />
                <Area type="monotone" dataKey="predictedDemand" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorDemand)" />
                <Area type="monotone" dataKey="actualDemand" stroke="#10B981" fillOpacity={0} strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-0 flex flex-col h-[400px] overflow-hidden">
           <div className="p-6 border-b border-white/5 bg-white/5">
              <h3 className="text-lg font-medium text-white">Live Activity</h3>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {MOCK_ACTIVITY.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                   <div className={`w-2 h-2 mt-2 rounded-full ${log.type === 'VALIDATE' ? 'bg-green-500' : log.type === 'CREATE' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                   <div>
                      <p className="text-sm text-white font-medium">{log.action}</p>
                      <p className="text-xs text-gray-400">{log.document} • <span className="text-gray-500">{log.user}</span></p>
                   </div>
                   <span className="ml-auto text-[10px] text-gray-600 group-hover:text-gray-400">{log.timestamp}</span>
                </div>
              ))}
           </div>
        </GlassCard>
      </div>
    </div>
  );
}
