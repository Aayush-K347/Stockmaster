import React from 'react';
import { Layers, Plus, ArrowUpRight, PlayCircle, CheckCircle2, Boxes, Truck, RefreshCw, ShieldCheck, Database, Zap, Globe, ChevronRight, Activity, BarChart3, PackageSearch, User, Factory, Warehouse } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export default function LandingPage({ onNavigateToLogin }: { onNavigateToLogin: () => void }) {
  return (
    <div className="min-h-screen bg-background text-white font-sans overflow-x-hidden selection:bg-primary selection:text-white">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left: Pills */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2 backdrop-blur-md">
              Home <Plus size={14} className="text-gray-400" />
            </button>
            <button className="px-5 py-2 rounded-full bg-transparent border border-white/10 hover:bg-white/5 transition-all text-sm font-medium flex items-center gap-2 backdrop-blur-md">
              Features <ArrowUpRight size={14} className="text-gray-400" />
            </button>
          </div>

          {/* Center: Logo */}
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
             <div className="w-8 h-8 bg-primary rounded-lg rotate-3 flex items-center justify-center shadow-[0_0_15px_rgba(109,40,217,0.5)]">
                <Layers className="text-white w-5 h-5 -rotate-3" />
             </div>
             <span className="text-xl font-bold font-display tracking-tight">StockMaster</span>
          </div>

          {/* Right: CTA */}
          <div className="flex items-center gap-4">
            <button className="hidden md:block px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium backdrop-blur-md">
              For Business
            </button>
            <button 
              onClick={onNavigateToLogin}
              className="px-6 py-2.5 rounded-full bg-primary hover:bg-primaryLight text-white text-sm font-medium transition-all shadow-[0_0_20px_-5px_rgba(109,40,217,0.5)] hover:scale-105 active:scale-95"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-[90vh] flex flex-col justify-center items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat opacity-40"
          style={{
            backgroundImage: "url('/background/stockMaster.png')",
            backgroundPosition: "center calc(80% + 200px)"
          }}
        />
        
        {/* Spotlight Effects */}
        <div className="absolute top-[-20%] left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute top-[-20%] right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0" />
        
        {/* Cyber Grid Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] opacity-30 pointer-events-none perspective-1000 overflow-hidden">
           <div className="w-full h-[200%] absolute top-0 bg-grid-pattern bg-[length:60px_60px] animate-grid-move transform-style-3d rotate-x-60 origin-top mask-image-linear-gradient"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-[#02010A] via-transparent to-transparent"></div>
        </div>

        {/* Grainy Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>

        <div className="max-w-6xl mx-auto text-center relative z-10 w-full">
          
          {/* Floating Element Left - Analytics */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-40 hidden xl:block pointer-events-none">
             <div className="w-64 p-4 glass-card rounded-2xl transform -rotate-12 animate-float border-t border-l border-white/20 shadow-2xl bg-black/40 backdrop-blur-xl">
                 <div className="w-full h-32 bg-gradient-to-br from-gray-900 to-black rounded-lg mb-4 relative overflow-hidden border border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
                    {/* Mock Chart */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-between px-2 pb-2 gap-1">
                       {[40, 70, 50, 90, 60, 80].map((h, i) => (
                          <div key={i} style={{height: `${h}%`, animationDelay: `${i * 0.1}s`}} className="w-full bg-primary/60 rounded-t-sm animate-slide-up"></div>
                       ))}
                    </div>
                 </div>
                 <div className="flex justify-between items-center">
                    <div className="text-left">
                       <div className="h-2 w-20 bg-white/20 rounded mb-2"></div>
                       <div className="h-2 w-10 bg-white/10 rounded"></div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                       <div className="w-4 h-4 bg-green-400 rounded-full box-shadow-[0_0_10px_green]"></div>
                    </div>
                 </div>
             </div>
          </div>

          {/* Floating Element Right - Status */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-40 hidden xl:block pointer-events-none">
             <div className="w-64 p-5 glass-card rounded-2xl transform rotate-12 animate-float-delayed border-t border-r border-white/20 shadow-2xl bg-black/40 backdrop-blur-xl">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_15px_rgba(109,40,217,0.5)]">
                       <CheckCircle2 size={20} />
                    </div>
                    <div className="text-left">
                       <div className="text-sm font-bold text-white">Order #9221</div>
                       <div className="text-xs text-green-400 font-mono">COMPLETE</div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                       <span>Progress</span>
                       <span className="text-white">100%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden relative">
                       <div className="h-full w-full bg-gradient-to-r from-primary to-blue-500 absolute top-0 left-0"></div>
                       <div className="absolute inset-0 bg-white/20 animate-scan"></div>
                    </div>
                 </div>
             </div>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-bold font-display tracking-tighter leading-[1.1] mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-sm">
            Fast, Secure, and <br />
            <span className="italic font-serif text-white relative inline-block">
               Seamless Inventory
               {/* Custom Underline SVG */}
               <svg className="absolute w-[110%] h-4 -bottom-2 left-[-5%] text-primary opacity-80" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C50 5.00005 160 -1.99996 198 6.99997" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            A mobile-ready inventory gateway that puts you in full control 
            of every transaction — easy, instant, and reliable.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
            <button 
              onClick={onNavigateToLogin}
              className="px-10 py-4 bg-primary hover:bg-primaryLight text-white rounded-full font-medium transition-all shadow-[0_0_40px_-10px_rgba(109,40,217,0.6)] hover:-translate-y-1 hover:shadow-[0_0_60px_-10px_rgba(109,40,217,0.8)] text-lg"
            >
              Get Started
            </button>
            <button className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-medium transition-all flex items-center gap-3 group text-lg backdrop-blur-md">
              <PlayCircle className="w-5 h-5 group-hover:text-primary transition-colors" />
              How It Works
            </button>
          </div>

        </div>
      </section>

      <section className="relative px-6 py-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('/background/floating_element.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02010A] via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Refined Hero Visual: Digital Horizon */}
          <div className="relative h-[300px] w-full max-w-4xl mx-auto">
            {/* SVG Curve Container */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(109, 40, 217, 0)" />
                  <stop offset="20%" stopColor="rgba(109, 40, 217, 0.5)" />
                  <stop offset="50%" stopColor="rgba(139, 92, 246, 1)" />
                  <stop offset="80%" stopColor="rgba(109, 40, 217, 0.5)" />
                  <stop offset="100%" stopColor="rgba(109, 40, 217, 0)" />
                </linearGradient>
              </defs>
              <path
                d="M0,150 C200,150 300,50 500,50 C700,50 800,150 1000,150"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M0,150 C200,150 300,50 500,50 C700,50 800,150 1000,150"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                strokeDasharray="10, 10"
                className="animate-dash-flow"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Icons Positioned on the Curve */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[118px] left-[15%] md:left-[20%] -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_30px_-5px_rgba(109,40,217,0.3)] bg-[#0a0a0a] animate-float">
                  <Factory className="text-primary w-8 h-8" />
                </div>
              </div>
              <div className="absolute top-[50px] left-[50%] -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center border border-white/20 shadow-[0_0_40px_-5px_rgba(255,255,255,0.1)] bg-[#0a0a0a] z-10 animate-float-delayed">
                  <Layers className="text-white w-10 h-10" />
                </div>
                <div className="absolute top-full left-1/2 w-px h-20 bg-gradient-to-b from-white/20 to-transparent" />
              </div>
              <div className="absolute top-[118px] left-[85%] md:left-[80%] -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] bg-[#0a0a0a] animate-float">
                  <User className="text-blue-400 w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Command Center Snapshot Section */}
      <section className="py-32 px-6 relative z-10 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
               <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-white">
                 The Neural Core of <br/> Your Operations
               </h2>
               <p className="text-gray-400 text-lg">Real-time visibility into every SKU, shipment, and adjustment.</p>
            </div>

            {/* 3D Container */}
            <div className="perspective-1000 flex justify-center items-center py-10 relative">
               {/* Background Glow for 3D element */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 rounded-full blur-[100px]"></div>
               
               {/* The Tilted Dashboard */}
               <div className="relative w-full max-w-5xl animate-tilt transform-style-3d group">
                  {/* Main Dashboard Panel */}
                  <div className="glass-card p-1 rounded-2xl bg-[#02010A] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden relative transform transition-transform duration-700">
                     
                     {/* Glass Header */}
                     <div className="h-14 border-b border-white/5 flex items-center px-6 gap-4 bg-white/5 backdrop-blur-md justify-between">
                        <div className="flex gap-2">
                           <div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500/30"></div>
                           <div className="w-3 h-3 rounded-full bg-yellow-500/50 border border-yellow-500/30"></div>
                           <div className="w-3 h-3 rounded-full bg-green-500/50 border border-green-500/30"></div>
                        </div>
                        <div className="hidden md:flex gap-8 text-xs font-mono text-gray-500 uppercase tracking-widest">
                           <span className="text-primary">System: Online</span>
                           <span>Latency: 24ms</span>
                           <span>Encryption: AES-256</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/10"></div>
                     </div>

                     {/* Body Mockup */}
                     <div className="p-6 grid grid-cols-12 gap-6 h-[500px] bg-[#05050A] relative">
                        
                        {/* Grid Overlay */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none"></div>
                        <div className="absolute inset-0 bg-grid-pattern bg-[length:30px_30px] opacity-10 pointer-events-none"></div>

                        {/* Sidebar Mock */}
                        <div className="col-span-2 hidden md:flex flex-col gap-4 border-r border-white/5 pr-6">
                           {[1,2,3,4,5,6].map(i => (
                              <div key={i} className={`h-10 w-full rounded-lg flex items-center px-3 gap-3 ${i === 1 ? 'bg-primary/20 border border-primary/20' : 'bg-transparent hover:bg-white/5'}`}>
                                 <div className={`w-5 h-5 rounded ${i === 1 ? 'bg-primary text-white' : 'bg-white/10'}`}></div>
                                 {i === 1 && <div className="h-1.5 w-12 bg-white/50 rounded"></div>}
                                 {i !== 1 && <div className="h-1.5 w-8 bg-white/10 rounded"></div>}
                              </div>
                           ))}
                        </div>

                        {/* Content Mock */}
                        <div className="col-span-12 md:col-span-10 flex flex-col gap-6">
                           {/* Top Stats */}
                           <div className="grid grid-cols-3 gap-6">
                              {[
                                 { label: 'Total Revenue', val: '$124k', color: 'from-purple-500 to-blue-500' },
                                 { label: 'Active Orders', val: '843', color: 'from-green-400 to-emerald-600' },
                                 { label: 'Pending Items', val: '28', color: 'from-orange-400 to-red-500' }
                              ].map((stat, i) => (
                                 <div key={i} className="h-28 bg-white/5 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity`}></div>
                                    <div className="relative z-10">
                                       <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{stat.label}</div>
                                       <div className="text-3xl font-bold font-display text-white">{stat.val}</div>
                                    </div>
                                    {/* Tiny Chart */}
                                    <div className="absolute bottom-0 left-0 right-0 h-10 flex items-end gap-1 px-4 pb-2 opacity-30">
                                        {[40,60,30,80,50,90,70].map((h,j) => (
                                           <div key={j} className="w-full bg-white rounded-t-sm" style={{height: `${h}%`}}></div>
                                        ))}
                                    </div>
                                 </div>
                              ))}
                           </div>

                           {/* Main Graph Area */}
                           <div className="flex-1 bg-white/5 rounded-xl p-6 border border-white/5 relative overflow-hidden flex flex-col">
                               <div className="flex justify-between items-center mb-6">
                                  <div className="h-4 w-32 bg-white/10 rounded"></div>
                                  <div className="flex gap-2">
                                     <div className="h-6 w-16 bg-white/5 rounded-full border border-white/5"></div>
                                     <div className="h-6 w-16 bg-white/5 rounded-full border border-white/5"></div>
                                  </div>
                               </div>
                               {/* Graph SVG */}
                               <div className="flex-1 relative w-full h-full">
                                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                     <path d="M0,150 Q100,100 200,120 T400,80 T600,140 T800,60 L800,200 L0,200 Z" fill="url(#graphGradient)" opacity="0.2" />
                                     <path d="M0,150 Q100,100 200,120 T400,80 T600,140 T800,60" fill="none" stroke="#8B5CF6" strokeWidth="3" className="drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                                     <defs>
                                        <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                                           <stop offset="0%" stopColor="#8B5CF6" />
                                           <stop offset="100%" stopColor="transparent" />
                                        </linearGradient>
                                     </defs>
                                     {/* Data Points */}
                                     <circle cx="200" cy="120" r="4" fill="#fff" className="animate-pulse" />
                                     <circle cx="400" cy="80" r="4" fill="#fff" className="animate-pulse" style={{animationDelay: '0.5s'}} />
                                     <circle cx="600" cy="140" r="4" fill="#fff" className="animate-pulse" style={{animationDelay: '1s'}} />
                                  </svg>
                               </div>
                           </div>
                        </div>
                     </div>
                     
                     {/* Scan Line Effect */}
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan pointer-events-none h-[20%] w-full mix-blend-overlay"></div>
                  </div>

                  {/* Floating Satellite Cards with Connection Lines */}
                  
                  {/* Left Satellite */}
                  <div className="absolute -left-16 top-32 transform translate-z-20 animate-float">
                     <div className="w-48 p-4 glass-card rounded-xl border border-white/10 bg-black/80 shadow-2xl">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center text-green-400">
                              <PackageSearch size={16} />
                           </div>
                           <span className="text-xs font-bold text-white">INBOUND</span>
                        </div>
                        <div className="text-xl font-mono text-green-400 mb-1">+ 420 Units</div>
                        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                           <div className="h-full w-3/4 bg-green-500 animate-pulse"></div>
                        </div>
                     </div>
                     {/* Line to main board */}
                     <svg className="absolute top-1/2 -right-8 w-8 h-2 overflow-visible pointer-events-none">
                        <path d="M0,4 L32,4" stroke="rgba(255,255,255,0.2)" strokeDasharray="2,2" />
                        <circle cx="32" cy="4" r="2" fill="white" />
                     </svg>
                  </div>

                  {/* Right Satellite */}
                  <div className="absolute -right-12 bottom-40 transform translate-z-30 animate-float-delayed">
                     <div className="w-48 p-4 glass-card rounded-xl border border-white/10 bg-black/80 shadow-2xl">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">
                              <Activity size={16} />
                           </div>
                           <span className="text-xs font-bold text-white">VELOCITY</span>
                        </div>
                        <div className="text-xl font-mono text-blue-400 mb-1">High Demand</div>
                        <div className="text-[10px] text-gray-400">Zone A-12 Reordering</div>
                     </div>
                      {/* Line to main board */}
                      <svg className="absolute top-1/2 -left-8 w-8 h-2 overflow-visible pointer-events-none">
                        <path d="M0,4 L32,4" stroke="rgba(255,255,255,0.2)" strokeDasharray="2,2" />
                        <circle cx="0" cy="4" r="2" fill="white" />
                     </svg>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative z-10 border-t border-white/5 bg-black/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Explore the Pillars of Our <br />
              <span className="text-gray-500">Next-Gen Warehouse</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">It's not just a tracker — it's a powerful tool for operational independence. Here's what makes it stand out.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(240px,auto)]">
            {/* Card 1: Large Square */}
            <GlassCard className="md:col-span-1 md:row-span-2 p-8 flex flex-col justify-between hover:border-primary/50 transition-all duration-500 group bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <ShieldCheck className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
                </div>
                <Plus className="text-gray-700 font-light" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-white">True Accuracy</h3>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-6xl font-bold tracking-tighter text-white font-display">99.9%</span>
                </div>
                <p className="text-sm text-gray-400 mb-6">Your running achievements</p>
                {/* Progress Bar Visual */}
                <div className="flex gap-1 h-12 mt-4 items-end">
                   {[...Array(12)].map((_, i) => (
                     <div key={i} className={`w-full rounded-sm transition-all duration-700 ${i < 9 ? 'bg-primary h-full shadow-[0_0_10px_rgba(109,40,217,0.5)]' : 'bg-white/5 h-1/3'}`} />
                   ))}
                </div>
              </div>
            </GlassCard>

            {/* Card 2: Wide Rectangle */}
            <GlassCard className="md:col-span-2 p-8 relative overflow-hidden group hover:border-primary/50 transition-all duration-500">
              <div className="absolute right-0 top-0 w-2/3 h-full bg-gradient-to-l from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                 <div className="flex justify-between">
                    <div className="p-3 bg-white/5 rounded-xl inline-block mb-4 group-hover:bg-primary/20 transition-colors">
                      <Database className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
                    </div>
                    <Plus className="text-gray-700 font-light" />
                 </div>
                 <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                   <div>
                      <h3 className="text-3xl font-medium text-white mb-3 font-display">Maximum Privacy</h3>
                      <p className="text-gray-400 text-base max-w-xs leading-relaxed">We don't store your data externally. No tracking, only private access to your ledger.</p>
                   </div>
                   <div className="hidden md:block relative transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="w-64 h-32 bg-black/40 rounded-lg border border-white/10 backdrop-blur-md p-4 shadow-2xl">
                         <div className="flex gap-2 mb-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                         </div>
                         <div className="space-y-3">
                            <div className="h-2.5 w-full bg-white/10 rounded animate-pulse"></div>
                            <div className="h-2.5 w-2/3 bg-white/10 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="h-2.5 w-1/2 bg-primary/30 rounded animate-pulse" style={{animationDelay: '0.4s'}}></div>
                         </div>
                      </div>
                   </div>
                 </div>
              </div>
            </GlassCard>

            {/* Card 3: Small */}
            <GlassCard className="p-8 flex flex-col justify-between hover:border-primary/50 transition-all duration-500 group">
               <div className="flex justify-between mb-8">
                 <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Zap className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
                 </div>
                 <Plus className="text-gray-700 font-light" />
               </div>
               <div>
                 <h3 className="text-5xl font-bold mb-2 font-display text-white">1.6k+</h3>
                 <p className="text-sm text-gray-400">Operations / Day</p>
                 <p className="text-xl font-medium text-white mt-6">Empowered Earning</p>
               </div>
            </GlassCard>

            {/* Card 4: Small */}
            <GlassCard className="p-8 flex flex-col justify-between hover:border-primary/50 transition-all duration-500 group">
               <div className="flex justify-between mb-8">
                 <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Globe className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
                 </div>
                 <Plus className="text-gray-700 font-light" />
               </div>
               <div>
                 <h3 className="text-5xl font-bold mb-2 font-display text-white">24/7</h3>
                 <p className="text-sm text-gray-400">Global Access</p>
                 <p className="text-xl font-medium text-white mt-6">Multi-Warehouse</p>
               </div>
            </GlassCard>
          </div>
        </div>
      </section>
      
      {/* NEW: Classic & Rich Logistics Flow Section (Crazy Dotted Arrows) */}
      <section className="py-32 relative overflow-hidden bg-[#02010A]">
         <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
               <div className="lg:w-1/3 relative z-10">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primaryLight text-xs font-bold mb-6 tracking-wider uppercase">
                     Seamless Integration
                  </div>
                  <h2 className="text-4xl md:text-6xl font-bold font-display mb-6 text-white leading-tight">
                     Orchestrated <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Logistics Flow.</span>
                  </h2>
                  <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                     From vendor receipts to customer delivery, watch your inventory move through a connected digital nervous system.
                  </p>
                  <button className="flex items-center gap-3 text-white font-medium hover:text-primary transition-colors group">
                     View Documentation <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
               </div>
               
               {/* The Illustration - Neural Supply Chain */}
               <div className="lg:w-2/3 relative h-[500px] w-full">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,40,217,0.15),transparent_70%)]"></div>
                  
                  {/* SVG Container */}
                  <svg className="w-full h-full visible" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
                     <defs>
                        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor="#6D28D9" stopOpacity="0.2"/>
                           <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.8"/>
                           <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2"/>
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                           <feGaussianBlur stdDeviation="3" result="blur" />
                           <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                     </defs>
                     
                     {/* Background Grid Nodes */}
                     <pattern id="smallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.05)" />
                     </pattern>
                     <rect width="800" height="500" fill="url(#smallGrid)" />

                     {/* --- NODES --- */}
                     
                     {/* Left Node: Suppliers */}
                     <g transform="translate(100, 250)">
                        <circle r="40" fill="#0B0B15" stroke="#333" strokeWidth="2" />
                        <circle r="30" fill="rgba(109,40,217,0.2)" className="animate-pulse-slow" />
                        <foreignObject x="-20" y="-20" width="40" height="40">
                           <div className="flex items-center justify-center w-full h-full text-primary"><Factory size={24} /></div>
                        </foreignObject>
                        <text x="0" y="60" textAnchor="middle" fill="#666" fontSize="12" fontFamily="sans-serif" fontWeight="bold">VENDORS</text>
                     </g>

                     {/* Center Node: Warehouse Hub */}
                     <g transform="translate(400, 250)">
                        <circle r="60" fill="#0B0B15" stroke="#6D28D9" strokeWidth="2" filter="url(#glow)" />
                        <circle r="50" fill="rgba(109,40,217,0.1)" />
                        <circle r="40" fill="rgba(109,40,217,0.2)" className="animate-ping" style={{animationDuration: '3s'}} />
                        <foreignObject x="-30" y="-30" width="60" height="60">
                           <div className="flex items-center justify-center w-full h-full text-white"><Layers size={36} /></div>
                        </foreignObject>
                        <text x="0" y="90" textAnchor="middle" fill="white" fontSize="14" fontFamily="sans-serif" fontWeight="bold" letterSpacing="1">STOCKMASTER CORE</text>
                     </g>

                     {/* Right Node: Customers */}
                     <g transform="translate(700, 250)">
                        <circle r="40" fill="#0B0B15" stroke="#333" strokeWidth="2" />
                        <circle r="30" fill="rgba(59,130,246,0.2)" className="animate-pulse-slow" />
                        <foreignObject x="-20" y="-20" width="40" height="40">
                           <div className="flex items-center justify-center w-full h-full text-blue-400"><User size={24} /></div>
                        </foreignObject>
                         <text x="0" y="60" textAnchor="middle" fill="#666" fontSize="12" fontFamily="sans-serif" fontWeight="bold">CUSTOMERS</text>
                     </g>

                     {/* Top Node: Internal */}
                     <g transform="translate(400, 100)">
                        <circle r="30" fill="#0B0B15" stroke="#333" strokeWidth="2" />
                        <foreignObject x="-15" y="-15" width="30" height="30">
                           <div className="flex items-center justify-center w-full h-full text-orange-400"><RefreshCw size={18} /></div>
                        </foreignObject>
                     </g>

                     {/* --- PATHS & ARROWS --- */}

                     {/* Path 1: Vendor to Hub (Curvy Dotted) */}
                     <path 
                        d="M140,250 C200,250 250,250 340,250" 
                        fill="none" 
                        stroke="url(#pathGradient)" 
                        strokeWidth="2" 
                        strokeDasharray="8,8"
                        className="animate-dash-flow-fast"
                     />
                     {/* Moving Particle 1 */}
                     <circle r="4" fill="#A78BFA">
                        <animateMotion repeatCount="indefinite" dur="3s" path="M140,250 C200,250 250,250 340,250" />
                     </circle>

                     {/* Path 2: Hub to Customer (Curvy Dotted) */}
                     <path 
                        d="M460,250 C550,250 600,250 660,250" 
                        fill="none" 
                        stroke="url(#pathGradient)" 
                        strokeWidth="2" 
                        strokeDasharray="8,8"
                        className="animate-dash-flow-fast"
                     />
                     {/* Moving Particle 2 */}
                     <circle r="4" fill="#60A5FA">
                        <animateMotion repeatCount="indefinite" dur="3s" begin="1.5s" path="M460,250 C550,250 600,250 660,250" />
                     </circle>

                     {/* Path 3: Hub to Internal (Loop) */}
                     <path 
                        d="M400,190 C380,160 380,140 400,130" 
                        fill="none" 
                        stroke="rgba(255,255,255,0.1)" 
                        strokeWidth="2" 
                        strokeDasharray="4,4"
                     />
                      <path 
                        d="M400,130 C420,140 420,160 400,190" 
                        fill="none" 
                        stroke="rgba(255,255,255,0.1)" 
                        strokeWidth="2" 
                        strokeDasharray="4,4"
                     />
                     {/* Moving Particle 3 */}
                     <circle r="3" fill="#F59E0B">
                        <animateMotion repeatCount="indefinite" dur="4s" path="M400,190 C380,160 380,140 400,130 C420,140 420,160 400,190" />
                     </circle>

                     {/* Decorative Orbit Rings around Hub */}
                     <ellipse cx="400" cy="250" rx="180" ry="80" fill="none" stroke="rgba(109,40,217,0.1)" strokeWidth="1" className="animate-spin-slow origin-center" />
                     <ellipse cx="400" cy="250" rx="180" ry="80" fill="none" stroke="rgba(109,40,217,0.1)" strokeWidth="1" strokeDasharray="10,20" className="animate-spin-reverse-slow origin-center" transform="rotate(45 400 250)" />

                  </svg>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="relative pt-24 pb-12 px-6 bg-[#02010A] border-t border-white/5 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-20">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg rotate-3 flex items-center justify-center shadow-[0_0_15px_rgba(109,40,217,0.5)]">
                   <Layers className="text-white w-5 h-5 -rotate-3" />
                </div>
                <span className="text-2xl font-bold font-display tracking-tight text-white">StockMaster</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Manage inventory anytime, anywhere. Stay organized, stay efficient.
              </p>
            </div>

            {/* Spacer */}
            <div className="hidden lg:block lg:col-span-1" />

            {/* Links Columns */}
            <div>
              <h4 className="font-bold text-white mb-6 font-display">Company</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><button className="hover:text-primary transition-colors">About Us</button></li>
                <li><button className="hover:text-primary transition-colors">Careers</button></li>
                <li><button className="hover:text-primary transition-colors">Blog</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 font-display">Support</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><button className="hover:text-primary transition-colors">Help Center</button></li>
                <li><button className="hover:text-primary transition-colors">Integration Docs</button></li>
                <li><button className="hover:text-primary transition-colors">Contact Us</button></li>
              </ul>
            </div>

             <div>
              <h4 className="font-bold text-white mb-6 font-display">Social Links</h4>
              <div className="flex gap-3">
                 {/* Instagram */}
                 <button className="w-10 h-10 rounded-full bg-[#6D28D9] hover:bg-[#5b21b6] flex items-center justify-center text-white transition-all hover:scale-110 shadow-[0_0_15px_rgba(109,40,217,0.4)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                 </button>
                 {/* Facebook */}
                 <button className="w-10 h-10 rounded-full bg-[#6D28D9] hover:bg-[#5b21b6] flex items-center justify-center text-white transition-all hover:scale-110 shadow-[0_0_15px_rgba(109,40,217,0.4)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                 </button>
                 {/* LinkedIn */}
                 <button className="w-10 h-10 rounded-full bg-[#6D28D9] hover:bg-[#5b21b6] flex items-center justify-center text-white transition-all hover:scale-110 shadow-[0_0_15px_rgba(109,40,217,0.4)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                 </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              Copyright © 2025 StockMaster. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm text-gray-500">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <span className="text-gray-700">•</span>
              <button className="hover:text-white transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}