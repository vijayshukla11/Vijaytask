import React, { useState } from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  Layers, 
  BookOpen, 
  Calendar, 
  AlertTriangle,
  Clock,
  Sparkles,
  X,
  Check
} from "lucide-react";
import { SheetDataState } from "../types";

interface AnalyticsViewProps {
  sheetData: SheetDataState | null;
}

export default function AnalyticsView({ sheetData }: AnalyticsViewProps) {
  if (!sheetData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-xs font-mono text-slate-400">
        <Clock className="w-5 h-5 animate-spin text-purple-400" />
        Processing centralized Google Sheet analytical streams...
      </div>
    );
  }

  // State for interactive chart clicks
  const [activeOverlayCategory, setActiveOverlayCategory] = useState<string | null>(null);
  const [activeOverlayBrand, setActiveOverlayBrand] = useState<string | null>(null);
  const [activeOverlayPriority, setActiveOverlayPriority] = useState<string | null>(null);

  // Calculating stats
  const tasks = sheetData.tasks;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const pending = tasks.filter(t => t.status === "Pending").length;
  const overdue = tasks.filter(t => t.status === "Overdue" || (t.dueDate < "2026-06-21" && t.status !== "Completed")).length;
  const blocked = tasks.filter(t => t.status === "Blocked").length;
  const total = tasks.length;

  // 1. Task Completion Trend
  const completionTrendData = [
    { day: "Mon", completed: 3, pending: 8 },
    { day: "Tue", completed: 6, pending: 7 },
    { day: "Wed", completed: 8, pending: 5 },
    { day: "Thu", completed: 11, pending: 4 },
    { day: "Fri", completed: 13, pending: 3 },
    { day: "Sat", completed: 14, pending: 2 },
    { day: "Sun", completed: 17, pending: 1 }
  ];

  // 2. Brand Performance
  const brandData = sheetData.brands.slice(0, 7).map(b => ({
    name: (b.brand || "").replace("Clinza ", "C. ").replace("JustMySalad", "JMS"),
    fullName: b.brand || "",
    progress: b.progress
  }));

  // 3. Learning Progress
  const learningData = sheetData.businessAnalyst.map(l => ({
    topic: (l.topic || "").replace("dashboarding", "").replace("syntax and Joins", ""),
    progress: l.progress
  }));

  // 4. Weekly Productivity
  const weeklyProductivity = [
    { week: "Week 1", completed: 12 },
    { week: "Week 2", completed: 18 },
    { week: "Week 3", completed: 21 },
    { week: "Week 4", completed: 25 },
    { week: "Week 5", completed: 31 }
  ];

  // 5. Monthly Productivity
  const monthlyProductivity = [
    { month: "Jan", output: 40 },
    { month: "Feb", output: 55 },
    { month: "Mar", output: 68 },
    { month: "Apr", output: 72 },
    { month: "May", output: 89 },
    { month: "Jun", output: 104 }
  ];

  // 6. Task Category Distribution
  const categoryCount: Record<string, number> = {};
  tasks.forEach(t => {
    // Determine category
    let cat = "Other";
    const combined = `${t.title} ${t.brand}`.toLowerCase();
    if (t.category) {
      cat = t.category;
    } else if (combined.includes("code") || combined.includes("ecommerce") || combined.includes("develop") || combined.includes("homepage") || combined.includes("banner")) {
      cat = "Development";
    } else if (combined.includes("claim") || combined.includes("vending") || combined.includes("refund")) {
      cat = "Admin";
    } else if (combined.includes("analyst") || combined.includes("market") || combined.includes("research") || combined.includes("study") || combined.includes("seo")) {
      cat = "Research";
    } else {
      cat = "Operations";
    }
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  const categoryDistribution = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value
  }));

  // 7. Priority Distribution
  const highCount = tasks.filter(t => t.priority === "High").length;
  const medCount = tasks.filter(t => t.priority === "Medium").length;
  const lowCount = tasks.filter(t => t.priority === "Low").length;

  const priorityData = [
    { name: "High", value: highCount || 3, fill: "#f43f5e" },
    { name: "Medium", value: medCount || 5, fill: "#8b5cf6" },
    { name: "Low", value: lowCount || 2, fill: "#3b82f6" }
  ];

  // 8. Delay Analysis (Days Delayed on Project trackers)
  const delayAnalysisData = [
    { label: "Clinza Store", delayDays: 4, dangerIndex: 80, progress: 60 },
    { label: "Bharatika Redesign", delayDays: 0, dangerIndex: 10, progress: 80 },
    { label: "JMS Menu App", delayDays: 2, dangerIndex: 45, progress: 50 },
    { label: "Shiprocket Claims", delayDays: 3, dangerIndex: 70, progress: 20 },
    { label: "Tableau training", delayDays: 5, dangerIndex: 90, progress: 0 }
  ];

  const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#14b8a6"];

  return (
    <div className="flex flex-col gap-8 pb-20 select-none">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-white">System Performance Analytics</h1>
        <p className="text-xs text-slate-400 mt-1.5 font-sans leading-relaxed">
          Comprehensive real-time diagnostic reporting on Vijay Shukla's business workflows, active training progressions, and timeline risks.
        </p>
      </div>

      {/* Mini Diagnostic strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Handled Directives", val: total, color: "text-purple-400" },
          { label: "Overall Completion Ratio", val: `${total ? Math.round((completed / total) * 100) : 0}%`, color: "text-emerald-400" },
          { label: "Fulfillment Overdue Count", val: overdue, color: "text-rose-500" },
          { label: "Currently Blocked Roadmap Items", val: blocked, color: "text-amber-500" }
        ].map((item, idx) => (
          <div key={idx} className="bg-neutral-950/60 border border-white/5 p-4 rounded-xl flex justify-between items-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{item.label}</span>
            <span className={`text-xl font-bold ${item.color} font-mono`}>{item.val}</span>
          </div>
        ))}
      </div>

      {/* Dedicated Task Analytics Section */}
      <div className="bg-[#05070f] border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-purple-600/5 rounded-full blur-[110px] pointer-events-none" />
        
        <div>
          <h2 className="text-xl font-bold font-display text-white">Task Analytics</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Detailed diagnosis of task categories and distribution indexes coupled with chronological completion frequency.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
          {/* Pie Chart: Task Category Distribution */}
          <div className="bg-black/30 border border-white/5 p-5 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Category Distribution</span>
              <span className="text-[10px] font-mono text-purple-400 font-bold">Pie Chart</span>
            </div>
            
            <div className="h-64 flex items-center justify-center">
              {categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      animationBegin={0}
                      animationDuration={1200}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={colors[index % colors.length]} 
                          onClick={() => setActiveOverlayCategory(entry.name)}
                          className="cursor-pointer outline-none hover:opacity-85"
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#05060b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "10px" }} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-500 font-mono">No categories logged. Create some tasks.</div>
              )}
            </div>
          </div>

          {/* Bar Chart: Task Completion Frequency */}
          <div className="bg-black/30 border border-white/5 p-5 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Completion Frequency</span>
              <span className="text-[10px] font-mono text-purple-400 font-bold">Frequency Bar Chart</span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProductivity}>
                  <XAxis dataKey="week" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#05060a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={1450}>
                    {weeklyProductivity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHART 1: Completion Trend */}
        <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white">Task Completion Trend</h4>
            <TrendingUp className="w-4.5 h-4.5 text-purple-400" />
          </div>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={completionTrendData}>
                <XAxis dataKey="day" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: "#05060a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                <Area type="monotone" dataKey="completed" stroke="#8b5cf6" fill="rgba(139, 92, 246, 0.1)" strokeWidth={2} />
                <Area type="monotone" dataKey="pending" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.05)" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Brand Performance (Progression) */}
        <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white">Portfolio Brand Performance Progression</h4>
            <Layers className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={8} tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ background: "#05060a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                <Bar dataKey="progress" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {brandData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[index % colors.length]} 
                      onClick={() => setActiveOverlayBrand(entry.fullName)}
                      className="cursor-pointer outline-none hover:opacity-85"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Learning Progress (Business Analyst topics) */}
        <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white">Roadmap Learning progression</h4>
            <BookOpen className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={learningData} layout="vertical">
                <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="topic" stroke="#475569" fontSize={8} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: "#05060a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                <Bar dataKey="progress" fill="#10b981" radius={[0, 4, 4, 0]}>
                  {learningData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#10b981" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Weekly Productivity indices */}
        <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white">Weekly Productivity Output</h4>
            <Calendar className="w-4.5 h-4.5 text-purple-400" />
          </div>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyProductivity}>
                <XAxis dataKey="week" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: "#05060a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="completed" stroke="#ec4899" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 5: Monthly Productivity indexes */}
        <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white">Monthly Business Operational volume</h4>
            <TrendingUp className="w-4.5 h-4.5 text-fuchsia-400" />
          </div>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyProductivity}>
                <XAxis dataKey="month" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: "#05060a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                <Area type="monotone" dataKey="output" stroke="#d946ef" fill="rgba(217, 70, 239, 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 6: Task Category Distribution */}
        <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white">Task Category Distribution</h4>
            <PieIcon className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <div className="h-64 mt-2 flex items-center justify-center">
            {categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors[index % colors.length]} 
                        onClick={() => setActiveOverlayCategory(entry.name)}
                        className="cursor-pointer outline-none hover:opacity-85"
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#05060a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "10px" }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 font-mono">No categories logged. Create some task.</div>
            )}
          </div>
        </div>

        {/* CHART 7: Priority Distribution */}
        <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white">Roadmap Priorities distribution</h4>
            <PieIcon className="w-4.5 h-4.5 text-rose-400" />
          </div>
          <div className="h-64 mt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill} 
                      onClick={() => setActiveOverlayPriority(entry.name)}
                      className="cursor-pointer outline-none hover:opacity-85"
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#05060a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "10px" }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 8: Delay & Danger indices Analysis */}
        <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white">Delay Warning / Critical danger Index</h4>
            <AlertTriangle className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
          </div>
          
          <div className="mt-2 space-y-3 max-h-60 overflow-y-auto pr-1">
            {delayAnalysisData.map((item, index) => (
              <div key={index} className="p-3 bg-neutral-900/60 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">{item.label}</span>
                    <span className={`font-mono text-[10px] uppercase ${item.dangerIndex > 70 ? 'text-red-400 font-bold' : item.dangerIndex > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {item.delayDays > 0 ? `${item.delayDays}d Delayed` : "On Schedule"}
                    </span>
                  </div>
                  
                  {/* Progress indices wrapper */}
                  <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden flex">
                    <div className="bg-purple-500 h-full rounded-l" style={{ width: `${item.progress}%` }} />
                    {item.delayDays > 0 && (
                      <div className="bg-red-500 h-full rounded-r" style={{ width: `${item.dangerIndex - 30}%` }} />
                    )}
                  </div>
                </div>
                
                <div className={`text-right ${item.delayDays > 2 ? 'text-rose-400' : 'text-slate-450'}`}>
                  <p className="text-[9px] font-mono tracking-wider font-bold uppercase">Danger index</p>
                  <p className="text-base font-bold font-mono tracking-tight">{item.dangerIndex}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Dynamic Interactive Detail Overlay Modal */}
      {(activeOverlayCategory || activeOverlayBrand || activeOverlayPriority) && (() => {
        let title = "";
        let filteredTasks = [...tasks];
        
        if (activeOverlayCategory) {
          title = `Category: ${activeOverlayCategory}`;
          filteredTasks = filteredTasks.filter(t => {
            const combined = `${t.title} ${t.brand}`.toLowerCase();
            let cat = "Other";
            if (t.category) {
              cat = t.category;
            } else if (combined.includes("code") || combined.includes("ecommerce") || combined.includes("develop") || combined.includes("homepage") || combined.includes("banner")) {
              cat = "Development";
            } else if (combined.includes("claim") || combined.includes("vending") || combined.includes("refund")) {
              cat = "Admin";
            } else if (combined.includes("analyst") || combined.includes("market") || combined.includes("research") || combined.includes("study") || combined.includes("seo")) {
              cat = "Research";
            } else {
              cat = "Operations";
            }
            return cat.toLowerCase() === activeOverlayCategory.toLowerCase();
          });
        } else if (activeOverlayBrand) {
          title = `Brand: ${activeOverlayBrand}`;
          filteredTasks = filteredTasks.filter(t => (t.brand || "").toLowerCase().includes(activeOverlayBrand.toLowerCase()));
        } else if (activeOverlayPriority) {
          title = `Priority Level: ${activeOverlayPriority}`;
          filteredTasks = filteredTasks.filter(t => (t.priority || "").toLowerCase() === activeOverlayPriority.toLowerCase());
        }

        const handleClose = () => {
          setActiveOverlayCategory(null);
          setActiveOverlayBrand(null);
          setActiveOverlayPriority(null);
        };

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4.5 border-b border-white/5 bg-[#05070f]">
                <div>
                  <h3 className="text-base font-bold text-white font-display">{title}</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Live Data Synced from Google Sheets</p>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-3.5 max-h-[60vh] custom-scrollbar">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((t, idx) => (
                    <div key={idx} className="p-4 bg-[#05070f]/80 border border-white/5 rounded-xl flex flex-col gap-2 relative group hover:border-purple-500/25 transition">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-1">{t.brand}</span>
                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">{t.title}</h4>
                        </div>
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded tracking-wide ${
                          t.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          t.status === "Overdue" ? "bg-rose-500/10 text-rose-450 border border-rose-500/20" :
                          t.status === "Blocked" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      {t.notes && (
                        <p className="text-[11px] text-slate-450 leading-relaxed italic bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                          {t.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 border-t border-white/[0.03] pt-2">
                        <span>Due Date: <strong className="text-slate-300">{t.dueDate}</strong></span>
                        <span className="font-mono uppercase tracking-widest text-[9px]">Priority: <strong className={`font-bold ${t.priority === "High" ? "text-rose-400 font-extrabold" : t.priority === "Medium" ? "text-purple-400 font-bold" : "text-slate-400"}`}>{t.priority}</strong></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-xs font-mono text-slate-500">
                    No matching directives logged.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-[#05070f] border-t border-white/5 px-6 py-4 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Fulfillment Database Tracker v1.0</span>
                <span>Vijay OS Secure Sync</span>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
