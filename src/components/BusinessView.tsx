import React, { useState } from "react";
import { 
  Building2, 
  ExternalLink, 
  Clock, 
  CheckSquare, 
  AlertTriangle, 
  ArrowLeft,
  Calendar,
  BarChart,
  FolderOpen,
  StickyNote,
  Briefcase,
  Play,
  Plus,
  TrendingUp,
  Activity,
  Heart,
  ShieldAlert,
  Inbox
} from "lucide-react";
import { SheetDataState, Task } from "../types";
import { getCategoryStyles } from "./HomeView";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart as ReBarChart, Bar, XAxis, YAxis } from "recharts";

interface BusinessViewProps {
  sheetData: SheetDataState | null;
  activeBrand: string;
  setActiveBrand: (brand: string) => void;
  onToggleMasterTask: (taskId: string, currentStatus: string) => void;
  onAddTask: () => void;
}

export default function BusinessView({
  sheetData,
  activeBrand,
  setActiveBrand,
  onToggleMasterTask,
  onAddTask
}: BusinessViewProps) {
  const [activeTab, setActiveTab2] = useState<"overview" | "analytics" | "tasks" | "timeline" | "files">("overview");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!sheetData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-xs font-mono text-slate-400">
        <Clock className="w-5 h-5 animate-spin text-purple-400" />
        Synchronizing business portfolios...
      </div>
    );
  }

  // BUSINESS ORDER: Always show EXACTLY in this order:
  const businessBrands = [
    "JustMySalad",
    "Love & Latte",
    "Nymi Vending",
    "JustMySalad Vending",
    "Shiprocket",
    "Clinza Ecommerce",
    "Clinza Social Media"
  ];

  // Helper stats for a specific brand card
  const getBrandStats = (brandName: string) => {
    const brandTasks = sheetData.tasks.filter(t => (t.brand || "").toLowerCase().includes(brandName.toLowerCase()));
    const progressObj = sheetData.brands.find(b => (b.brand || "").toLowerCase().includes(brandName.toLowerCase()));
    
    // Dynamic fallback defaults if progress shows 0 in sheet mock
    const defaultProgresses: Record<string, number> = {
      "JustMySalad": 70,
      "Love & Latte": 40,
      "Nymi Vending": 80,
      "JustMySalad Vending": 60,
      "Shiprocket": 90,
      "Clinza Ecommerce": 60,
      "Clinza Social Media": 45
    };
    
    const progress = progressObj && progressObj.progress > 0 ? progressObj.progress : (defaultProgresses[brandName] || 50);
    const pending = brandTasks.filter(t => t.status !== "Completed").length;
    const completed = brandTasks.filter(t => t.status === "Completed").length;
    const priorityHigh = brandTasks.filter(t => t.priority === "High" && t.status !== "Completed").length;

    return { progress, pending, completed, priorityHigh, total: brandTasks.length };
  };

  // Compile global stats across only the 7 BUSINESS BRANDS
  const allBusinessTasks = sheetData.tasks.filter(t => 
    businessBrands.some(b => (t.brand || "").toLowerCase().includes(b.toLowerCase()))
  );

  const totalBusinessTasksCount = allBusinessTasks.length;
  const completedBusinessTasksCount = allBusinessTasks.filter(t => t.status === "Completed").length;
  const pendingBusinessTasks = allBusinessTasks.filter(t => t.status !== "Completed");
  const criticalBusinessTasks = pendingBusinessTasks.filter(t => t.priority === "High");
  const overdueBusinessTasks = pendingBusinessTasks.filter(t => t.status === "Overdue" || (t.dueDate < "2026-06-21"));

  // Sort upcoming deadlines
  const upcomingDeadlines = [...pendingBusinessTasks].sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));

  // Calculate Business Health Score
  // Weights: Brand progresses (50%) + Task completion rate (50%)
  const avgBrandProgress = businessBrands.reduce((acc, curr) => acc + getBrandStats(curr).progress, 0) / businessBrands.length;
  const taskCompletionRate = totalBusinessTasksCount > 0 ? (completedBusinessTasksCount / totalBusinessTasksCount) * 100 : 75;
  const healthScore = Math.round((avgBrandProgress + taskCompletionRate) / 2);

  const getHealthStatusText = (score: number) => {
    if (score >= 85) return { label: "Outstanding Peak", color: "text-emerald-400", desc: "Core business avenues are operating with high velocity and minimal friction." };
    if (score >= 70) return { label: "Optimal Flow", color: "text-purple-400", desc: "Operational metrics are consistent. Monitor JustMySalad and Love & Latte milestones closely." };
    return { label: "Needs Review", color: "text-amber-400", desc: "Some core avenues are experiencing task delays. Check pending blockers." };
  };

  const healthStatus = getHealthStatusText(healthScore);

  const isGlobal = activeBrand === "Global Overview" || !businessBrands.some(b => b.toLowerCase() === activeBrand.toLowerCase());

  if (isGlobal) {
    return (
      <div className="flex flex-col gap-6 select-none pb-16 animate-fade-in text-xs font-sans">
        
        {/* TITLE SECTION */}
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">Business Command Center</h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Consolidated operational grid representing Vijay Shukla's individual corporate channels, cash streams, and execution indices.
          </p>
        </div>

        {/* TOP LEVEL METRICS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Business Health Score Gauge (Highly Polished) (5 columns) */}
          <div className="lg:col-span-5 bg-[#05070f] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />
            <div>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold">Consolidated Metric</p>
              <h3 className="text-base font-bold text-white mt-1">Operational Health Score</h3>
            </div>

            <div className="flex items-center gap-6 my-5">
              {/* Radial Score Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.04)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    stroke="url(#purpleGlow)" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - healthScore / 100)}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-mono text-white tracking-tighter">{healthScore}%</span>
                  <span className="text-[7.5px] font-mono text-slate-500 uppercase font-bold">Compliance</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className={`text-sm font-bold uppercase font-mono ${healthStatus.color}`}>{healthStatus.label}</span>
                <p className="text-[11px] text-slate-400 leading-normal">{healthStatus.desc}</p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>Overall Deliverables Completeness:</span>
              <span className="text-slate-300 font-bold">{completedBusinessTasksCount} / {totalBusinessTasksCount} Completed</span>
            </div>
          </div>

          {/* Quick Stats Grid block (7 columns) */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Directives", value: totalBusinessTasksCount, icon: Briefcase, color: "text-slate-300", bg: "bg-slate-500/5", border: "border-slate-500/10" },
              { label: "Pending Issues", value: pendingBusinessTasks.length, icon: Inbox, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/10" },
              { label: "Critical Actions", value: criticalBusinessTasks.length, icon: ShieldAlert, color: "text-rose-400", bg: "bg-rose-500/5", border: "border-rose-500/10" },
              { label: "Delayed/Overdue", value: overdueBusinessTasks.length, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10" },
            ].map((stat, idx) => (
              <div key={idx} className={`p-4 bg-[#05070f] border ${stat.border} rounded-2xl flex flex-col justify-between h-32 hover:border-purple-500/20 transition`}>
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase">{stat.label}</span>
                  <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-bold font-mono text-white mt-1">{stat.value}</h4>
                  <p className="text-[9.5px] text-slate-500 mt-1 font-sans">Active in portfolio</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* SPLIT SCREEN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2">
          
          {/* LEFT: Brands progress in ORDER (Always JMySalad, L&Latte, Nymi, JMySaladVend, Shiprocket, ClinzaEcommerce, ClinzaSocial) (5 cols) */}
          <div className="lg:col-span-5 bg-[#05070f] border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 mb-4">
              Corporate Progress Matrix
            </h3>
            
            <div className="space-y-4.5">
              {businessBrands.map((brandName, idx) => {
                const stats = getBrandStats(brandName);
                return (
                  <div 
                    key={brandName}
                    onClick={() => setActiveBrand(brandName)}
                    className="p-3.5 bg-black/35 hover:bg-[#070a16] border border-white/5 hover:border-purple-500/20 rounded-xl transition cursor-pointer group flex flex-col gap-2 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500">{idx + 1}</span>
                        <span className="font-bold text-slate-100 group-hover:text-purple-300 transition-colors text-xs tracking-wide">{brandName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/15">
                        {stats.progress}%
                      </span>
                    </div>

                    {/* Progress Slider */}
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden z-10">
                      <div 
                        className="bg-purple-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                        style={{ width: `${stats.progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-0.5 z-10">
                      <span>{stats.pending} Pending • {stats.completed} Done</span>
                      <span className="text-purple-450 uppercase group-hover:underline text-[8.5px]">Open command &rarr;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Tasks Panel containing Critical Tasks, Pending List & Upcoming Deadlines (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Critical Tasks Panel */}
            <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">Critical High-Priority Actions</h3>
                </div>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded font-bold">URGENT</span>
              </div>

              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {criticalBusinessTasks.length > 0 ? (
                  criticalBusinessTasks.map((t, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setActiveBrand(t.brand);
                      }}
                      className="p-3 bg-rose-550/5 hover:bg-[#070a16] border border-rose-500/10 hover:border-purple-500/20 rounded-xl flex justify-between items-center gap-4 transition cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-rose-200 text-xs truncate leading-snug group-hover:text-purple-300 transition-colors">{t.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase font-bold">{t.brand} • Target: {t.dueDate}</p>
                      </div>
                      <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-bold uppercase shrink-0">HIGH</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6 font-mono border border-dashed border-white/5 rounded-xl bg-black/10">No critical high-priority tasks pending in business.</p>
                )}
              </div>
            </div>

            {/* Upcoming Deadlines & Pending Business List unified */}
            <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">Upcoming Business Deliverables</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">Chronological Grid</span>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.map((t, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setActiveBrand(t.brand)}
                      className="p-3 bg-black/30 hover:bg-[#070a16] border border-white/5 hover:border-purple-500/20 rounded-xl flex justify-between items-center gap-4 transition cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-200 text-xs truncate leading-snug group-hover:text-purple-300 transition-colors">{t.title}</p>
                        <p className="text-[9.5px] text-slate-550 mt-1 font-mono uppercase font-bold text-slate-500">{t.brand}</p>
                      </div>
                      <span className="text-[10px] font-mono text-purple-400 font-bold shrink-0 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/15">
                        {t.dueDate}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6 font-mono border border-dashed border-white/5 rounded-xl bg-black/10">No upcoming deliverables pending.</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // INDIVIDUAL BRAND PAGE
  const brandStats = getBrandStats(activeBrand);
  const brandTasksAll = sheetData.tasks.filter(t => (t.brand || "").toLowerCase().includes(activeBrand.toLowerCase()));
  const brandTasksCompleted = brandTasksAll.filter(t => t.status === "Completed");
  const brandTasksPending = brandTasksAll.filter(t => t.status !== "Completed");

  // Recharts specific Brand stats
  const brandCategoryCounts: Record<string, number> = {};
  brandTasksAll.forEach(t => {
    const cat = t.category || "Operations";
    brandCategoryCounts[cat] = (brandCategoryCounts[cat] || 0) + 1;
  });
  const categoryData = Object.entries(brandCategoryCounts).map(([name, value]) => ({ name, value }));
  const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#ec4899", "#f59e0b"];

  const fileAttachments = [
    { name: `${activeBrand.split(" ")[0]}_Financial_Model.xlsx`, size: "4.2 MB", date: "June 18, 2026" },
    { name: `Marketing_Assets_Specification.pdf`, size: "12.8 MB", date: "June 12, 2026" },
    { name: `Operation_Protocol_Guidebook_v1.docx`, size: "1.1 MB", date: "June 05, 2026" }
  ];

  return (
    <div className="flex flex-col gap-6 select-none pb-16 animate-fade-in text-xs font-sans">
      
      {/* Back button and Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveBrand("Global Overview")}
            className="p-2.5 bg-neutral-950 hover:bg-neutral-900 border border-white/5 hover:border-white/10 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">Portfolio Business page</span>
            <h1 className="text-2xl font-bold font-display text-white mt-0.5">{activeBrand}</h1>
          </div>
        </div>

        <button 
          onClick={onAddTask}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs rounded-xl transition shadow-[0_4px_15px_rgba(124,58,237,0.3)] cursor-pointer border-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Business Directive</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Roadmap Progress", value: `${brandStats.progress}%`, sub: "Development progress", color: "text-purple-400" },
          { label: "Pending Directives", value: brandStats.pending, sub: "Requires attention", color: "text-blue-400" },
          { label: "Completed Items", value: brandStats.completed, sub: "Archived history", color: "text-emerald-400" },
          { label: "Overall Task Volume", value: brandStats.total, sub: "Total task load", color: "text-slate-350" }
        ].map((c, idx) => (
          <div key={idx} className="bg-[#05070f] border border-white/5 p-4 rounded-xl flex flex-col justify-between h-20">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">{c.label}</span>
            <div className="flex justify-between items-baseline mt-1.5">
              <span className={`text-xl font-bold ${c.color} font-mono`}>{c.value}</span>
              <span className="text-[8px] text-slate-500 font-mono italic">{c.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Inner Subpage Tabs */}
      <div className="flex border-b border-white/5 pb-0.5 gap-2.5 overflow-x-auto">
        {(["overview", "analytics", "tasks", "timeline", "files"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab2(tab)}
            className={`px-4 py-2 text-xs font-semibold capitalize border-b-2 transition duration-200 cursor-pointer border-none bg-transparent ${activeTab === tab ? "border-purple-500 text-white" : "border-transparent text-slate-400 hover:text-slate-100"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SUBPAGE CONTENT VIEWS */}
      <div className="mt-2 min-h-[300px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#05070f] border border-white/5 p-6 rounded-2xl flex flex-col gap-5">
              <div>
                <h3 className="text-sm font-semibold text-white">About the Business</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2.5">
                  This segment serves as the main command log for {activeBrand}. All tasks, project objectives, and document milestones are centralized and synchronized directly with the team. Real-time changes map to our live Google Sheets architecture to preserve durable connection, pipeline updates, and calendar sync.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-500">Core Objectives</h4>
                <div className="mt-3 space-y-3">
                  <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Objective A: Launch Campaign Phase 1</p>
                      <p className="text-slate-450 mt-1 text-slate-400">Completion expected this quarter.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold uppercase">ACTIVE</span>
                  </div>
                  <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Objective B: Operational Team Alignment</p>
                      <p className="text-slate-450 mt-1 text-slate-400">Sync with stakeholders weekly at noon.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold uppercase">IN SCOPE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-white">Strategy Notes</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-1">
                A staging workspace for immediate focus points, operational guidelines, and raw notes.
              </p>
              <textarea 
                className="flex-1 bg-black/40 border border-white/5 hover:border-white/10 rounded-xl min-h-36 p-3 text-xs text-slate-300 outline-none resize-none font-sans leading-relaxed"
                placeholder="Write business notes here..."
                defaultValue={`• Prioritize cashflow and claim recoveries for resolving backlog issues.\n• Keep banner templates modular for rapid branding upgrades.\n• Update JustMySalad status checklist after aligning pricing schemas on Excel.`}
              />
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl h-74 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Functional Task Distribution</h4>
                <span className="text-[9px] font-mono text-purple-400 animate-pulse bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Click Segment to Inspect</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans -mt-2">Provides quick operational drill-down of task segments.</p>
              <div className="flex-1 flex items-center justify-center">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        onClick={(data) => {
                          if (data && data.name) setSelectedCategory(data.name);
                        }}
                        className="cursor-pointer"
                      >
                        {categoryData.map((e, index) => (
                           <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#05060b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs font-mono text-slate-500">No category parameters logged.</p>
                )}
              </div>
            </div>

            <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl h-74 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Task Volume by Category</h4>
                <span className="text-[9px] font-mono text-purple-400 animate-pulse bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Click bar to inspect</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans -mt-2">Interactive chart linking categories directly with source task sheets.</p>
              <div className="flex-1">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={categoryData}>
                      <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#05060b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "10px" }} />
                      <Bar 
                        dataKey="value" 
                        fill="#8b5cf6" 
                        radius={[4, 4, 0, 0]}
                        onClick={(data) => {
                          if (data && data.name) setSelectedCategory(data.name);
                        }}
                        className="cursor-pointer"
                      />
                    </ReBarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs font-mono text-slate-500">No volume markers recorded.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div className="bg-neutral-950/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 px-2 py-1">Directives backlog ({brandTasksAll.length} items)</h3>
            <div className="flex flex-col gap-2.5 mt-1">
              {brandTasksAll.length > 0 ? (
                brandTasksAll.map(t => {
                  const cat = t.category || "Operations";
                  const styles = getCategoryStyles(cat);
                  return (
                    <div 
                      key={t.id}
                      className="p-3.5 bg-[#05070f] border border-white/5 rounded-xl flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onToggleMasterTask(t.id, t.status)}
                          className={`w-4.5 h-4.5 rounded-lg border flex items-center justify-center transition ${t.status === "Completed" ? "bg-purple-650/10 border-purple-600 font-bold text-purple-400 animate-pulse" : "border-white/10"}`}
                        >
                          {t.status === "Completed" && <CheckSquare className="w-3.5 h-3.5 text-purple-500" />}
                        </button>
                        <div>
                          <p className={`font-semibold ${t.status === "Completed" ? "line-through text-slate-500" : "text-white"}`}>{t.title}</p>
                          <span className="text-[9px] font-mono text-slate-500 mt-0.5 block">{t.id} • {t.dueDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] px-2 py-0.5 rounded border ${styles.bg} ${styles.text} ${styles.border} font-bold`}>{cat}</span>
                        <span className={`text-[8px] font-bold uppercase ${t.priority === "High" ? "text-rose-400" : "text-slate-400"}`}>{t.priority}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-xs font-mono text-slate-500 border border-dashed border-white/5 rounded-xl">
                  No direct directives logged to this operational unit.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === "timeline" && (
          <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Milestone Roadmap</h3>
            <div className="flex flex-col gap-6 pl-4 border-l-2 border-white/5">
              {brandTasksAll.map((t, idx) => {
                const isOverdue = t.status === "Overdue" || (t.dueDate < "2026-06-21" && t.status !== "Completed");
                return (
                  <div key={t.id} className="relative">
                    <div className={`absolute left-[-23px] top-1 w-3 h-3 rounded-full ${t.status === "Completed" ? "bg-emerald-500" : isOverdue ? "bg-rose-500" : "bg-purple-500"}`} />
                    <div className="text-xs">
                      <div className="flex justify-between font-mono font-semibold">
                        <span className="text-slate-400">{t.dueDate}</span>
                        <span className={`uppercase font-bold ${t.status === "Completed" ? "text-emerald-400" : isOverdue ? "text-rose-450" : "text-purple-400"}`}>
                           {t.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-semibold text-white mt-1.5">{t.title}</p>
                      {t.notes && <p className="text-[11px] text-slate-400 font-sans mt-1 leading-relaxed">{t.notes}</p>}
                    </div>
                  </div>
                );
              })}
              {brandTasksAll.length === 0 && (
                <div className="text-xs font-mono text-slate-500">No scheduled timeline dates found tags.</div>
              )}
            </div>
          </div>
        )}

        {/* FILES TAB */}
        {activeTab === "files" && (
          <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white mb-1">Attached Assets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fileAttachments.map((f, idx) => (
                <div key={idx} className="p-4 bg-black/30 border border-white/5 hover:border-purple-500/20 rounded-xl flex items-center justify-between gap-4 transition text-xs">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-semibold text-white">{f.name}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{f.size} • Verified {f.date}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider cursor-pointer font-mono hover:text-white transition">DL</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {selectedCategory && (() => {
        const matchingTasks = brandTasksAll.filter(t => (t.category || "Operations").toLowerCase() === selectedCategory.toLowerCase());
        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#05070f] border border-white/10 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans text-xs">
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-black/40">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Category: {selectedCategory} Directives ({matchingTasks.length})
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Live drill-down mapping of Google Sheet records</p>
                </div>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer hover:underline border-none bg-transparent"
                >
                  Close Dialog ×
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-3 flex-1">
                {matchingTasks.map((t, idx) => {
                  return (
                    <div 
                      key={t.id || idx}
                      className="p-4 bg-neutral-900/60 border border-white/5 rounded-xl flex justify-between items-center gap-4 hover:border-purple-500/20 transition text-xs"
                    >
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-100">{t.title}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">{t.id} • {t.brand} • Due: {t.dueDate}</p>
                        {t.notes && <p className="text-[11px] text-slate-450 mt-1.5 italic leading-relaxed">{t.notes}</p>}
                      </div>
                      <span className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded uppercase border whitespace-nowrap ${
                        t.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        t.status === "Blocked" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        t.status === "Overdue" ? "bg-rose-500/10 text-rose-400 border-rose-500/25" :
                        "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      }`}>
                         {t.status}
                      </span>
                    </div>
                  );
                })}
                {matchingTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-500 font-mono">No matching objectives found.</div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
