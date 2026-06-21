import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus,
  Briefcase,
  Play,
  TrendingUp,
  Bookmark,
  ShieldCheck,
  PlusCircle,
  Check,
  Activity,
  LineChart,
  ArrowRight,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  TrendingDown,
  Building2,
  ListTodo
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { Task, SheetDataState } from "../types";

export const categoryColors: Record<string, { bg: string, text: string, border: string }> = {
  "Development": { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/20" },
  "Admin": { bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-500/20" },
  "Research": { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/20" },
  "Operations": { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/20" },
  "Design": { bg: "bg-rose-500/10", text: "text-rose-300", border: "border-rose-500/20" },
  "Marketing": { bg: "bg-pink-500/10", text: "text-pink-300", border: "border-pink-500/20" },
};

export const getCategoryStyles = (cat?: string) => {
  const norm = cat ? cat.trim() : "Development";
  return categoryColors[norm] || { bg: "bg-indigo-500/10", text: "text-indigo-300", border: "border-indigo-500/20" };
};

export function getTaskPriorityRank(task: Task): { tier: number; name: string; color: string; border: string; bg: string } {
  const brand = (task.brand || "").toLowerCase().trim();
  const category = (task.category || "").toLowerCase().trim();
  const title = (task.title || "").toLowerCase().trim();

  // Priority 1: Core Business Operations
  const isP1 = [
    "justmysalad", 
    "love & latte", 
    "love and latte", 
    "nymi vending", 
    "justmysalad vending", 
    "shiprocket"
  ].some(b => brand.includes(b));

  if (isP1) {
    return { 
      tier: 1, 
      name: "Core Business Operations", 
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20", 
      border: "border-rose-500/20", 
      bg: "bg-rose-500/5" 
    };
  }

  // Priority 2: Business Growth
  const isP2 = [
    "clinza ecommerce", 
    "clinza social media", 
    "clinza",
    "marketing", 
    "website improvements", 
    "seo", 
    "brand building"
  ].some(b => brand.includes(b) || category.includes(b) || title.includes(b));

  if (isP2) {
    return { 
      tier: 2, 
      name: "Business Growth", 
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20", 
      border: "border-amber-500/20", 
      bg: "bg-amber-500/5" 
    };
  }

  // Priority 3: Career Growth
  const isP3 = [
    "business analyst learning", 
    "business analyst", 
    "english improvement", 
    "resume development", 
    "portfolio development",
    "learning"
  ].some(b => brand.includes(b) || title.includes(b) || category.includes(b));

  if (isP3) {
    return { 
      tier: 3, 
      name: "Career Growth", 
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20", 
      border: "border-purple-500/20", 
      bg: "bg-purple-500/5" 
    };
  }

  // Priority 4: Future Projects (AI Projects, Bharatika News, Automation)
  return { 
    tier: 4, 
    name: "Future Projects", 
    color: "text-sky-400 bg-sky-500/10 border-sky-500/20", 
    border: "border-sky-500/20", 
    bg: "bg-sky-500/5" 
  };
}

interface HomeViewProps {
  sheetData: SheetDataState | null;
  activeBrand: string;
  setActiveBrand: (brand: string) => void;
  onToggleMasterTask: (taskId: string, currentStatus: string) => void;
  onToggleDailyTask: (taskId: string, currentStatus: string) => void;
  onAddTask: () => void;
  onAddIdeaDirect?: (title: string) => void;
  onAddTradeDirect?: (symbol: string, pnl: number) => void;
  onUpdateTask?: (updatedTask: Task) => void;
}

export default function HomeView({
  sheetData,
  activeBrand,
  setActiveBrand,
  onToggleMasterTask,
  onToggleDailyTask,
  onAddTask,
  onAddIdeaDirect,
  onAddTradeDirect,
  onUpdateTask
}: HomeViewProps) {
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");

  // Staging state for immediate actions inside quick actions
  const [quickIdeaTitle, setQuickIdeaTitle] = useState("");
  const [quickTradeSymbol, setQuickTradeSymbol] = useState("");
  const [quickTradeProfit, setQuickTradeProfit] = useState("");
  const [activeQuickAction, setActiveQuickAction] = useState<"none" | "idea" | "trade">("none");

  // Filter tasks display category tab
  const [homeTaskTab, setHomeTaskTab] = useState<"all" | "business" | "learning" | "projects">("all");

  // States for clickable KPI Card detail drawers/modals
  const [activeKpiLabel, setActiveKpiLabel] = useState<string | null>(null);
  const [selectedKpiBrand, setSelectedKpiBrand] = useState<string | null>(null);
  const [selectedKpiTask, setSelectedKpiTask] = useState<Task | null>(null);

  // States for task detail editor
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [editingTaskNotes, setEditingTaskNotes] = useState("");
  const [editingTaskDueDate, setEditingTaskDueDate] = useState("");
  const [editingTaskPriority, setEditingTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [editingTaskStatus, setEditingTaskStatus] = useState<"Pending" | "Completed" | "Blocked" | "Overdue">("Pending");

  // Clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handler to sync task edits back to App state and Google Sheets
  const handleSaveTaskForm = () => {
    if (!selectedKpiTask || !onUpdateTask) return;
    const updated: Task = {
      ...selectedKpiTask,
      title: editingTaskTitle,
      notes: editingTaskNotes,
      dueDate: editingTaskDueDate,
      priority: editingTaskPriority,
      status: editingTaskStatus,
      updatedAt: new Date().toISOString().substring(0, 10)
    };
    onUpdateTask(updated);
    setSelectedKpiTask(null);
  };

  const getDashboardStats = () => {
    if (!sheetData) return {
      total: 0, completed: 0, pending: 0, blocked: 0, overdue: 0, today: 0, thisWeek: 0
    };

    const tasks = sheetData.tasks || [];
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const pending = tasks.filter(t => t.status !== "Completed").length;
    const blocked = tasks.filter(t => t.status === "Blocked").length;
    const overdue = tasks.filter(t => t.status === "Overdue" || (t.dueDate < "2020-01-01" /* dynamic test check fallback */ && t.status !== "Completed")).length;
    
    // Today's tasks
    const today = tasks.filter(t => t.status !== "Completed").length;
    const thisWeek = tasks.filter(t => t.status !== "Completed").length;

    return { total, completed, pending, blocked, overdue, today, thisWeek };
  };

  const s = getDashboardStats();

  const handleQuickAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIdeaTitle.trim()) return;
    if (onAddIdeaDirect) {
      onAddIdeaDirect(quickIdeaTitle);
    } else {
      alert(`Idea Saved: ${quickIdeaTitle}`);
    }
    setQuickIdeaTitle("");
    setActiveQuickAction("none");
  };

  const handleQuickAddTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTradeSymbol.trim()) return;
    const pnl = Number(quickTradeProfit) || 2500;
    if (onAddTradeDirect) {
      onAddTradeDirect(quickTradeSymbol.toUpperCase(), pnl);
    } else {
      alert(`Trade Logged: ${quickTradeSymbol} [₹${pnl}]`);
    }
    setQuickTradeSymbol("");
    setQuickTradeProfit("");
    setActiveQuickAction("none");
  };

  // Compile and sort tasks based on Vijay Shukla's Custom Priority Framework
  const tasks = sheetData ? sheetData.tasks : [];

  // Helper function to rank and sort arrays of tasks
  const prioritizeTasks = (taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
      const pA = getTaskPriorityRank(a).tier;
      const pB = getTaskPriorityRank(b).tier;
      
      // Tier 1 (Business Core) < Tier 2 (Growth) < Tier 3 (Learning) < Tier 4 (Projects)
      if (pA !== pB) return pA - pB;

      // Inside tiers, High priority first
      const priorityWeights = { High: 3, Medium: 2, Low: 1 };
      const weightA = priorityWeights[a.priority] || 2;
      const weightB = priorityWeights[b.priority] || 2;
      if (weightA !== weightB) return weightB - weightA;

      // Sort by Due Date
      return (a.dueDate || "").localeCompare(b.dueDate || "");
    });
  };

  const pendingPrioritized = prioritizeTasks(tasks.filter(t => t.status !== "Completed"));
  const sortedOverdue = prioritizeTasks(tasks.filter(t => t.status === "Overdue" || (t.dueDate < "2026-06-21" && t.status !== "Completed")));

  // CEO DAILY BRIEF: Today's Top 5 Tasks Grouped by human rank weights
  const topFiveCount = Math.min(5, pendingPrioritized.length);
  const top5Tasks = pendingPrioritized.slice(0, 5);

  const briefBusiness = top5Tasks.filter(t => getTaskPriorityRank(t).tier <= 2);
  const briefLearning = top5Tasks.filter(t => getTaskPriorityRank(t).tier === 3);
  const briefProjects = top5Tasks.filter(t => getTaskPriorityRank(t).tier === 4);

  // Recommendations mapping inside Schedule hours
  const scheduleBlocks = [
    {
      time: "10:00 AM - 1:00 PM",
      title: "Core Business Operations",
      desc: "Focus on operational continuity and client deliverables.",
      tier: 1,
      tag: "Priority 1 (Highly Critical)",
      color: "from-rose-500/10 to-transparent border-rose-500/20",
      iconColor: "text-rose-400",
      recommendations: pendingPrioritized.filter(t => getTaskPriorityRank(t).tier === 1).slice(0, 2)
    },
    {
      time: "1:00 PM - 4:00 PM",
      title: "Business Growth",
      desc: "Strategic marketing, ecommerce sales optimization & brand building.",
      tier: 2,
      tag: "Priority 2 (High Status Growth)",
      color: "from-amber-500/10 to-transparent border-amber-500/20",
      iconColor: "text-amber-400",
      recommendations: pendingPrioritized.filter(t => getTaskPriorityRank(t).tier === 2).slice(0, 2)
    },
    {
      time: "4:00 PM - 6:00 PM",
      title: "Career Growth",
      desc: "Hone data analytics, SQL schemas, and English mastery.",
      tier: 3,
      tag: "Priority 3 (Career Training)",
      color: "from-purple-500/10 to-transparent border-purple-500/20",
      iconColor: "text-purple-400",
      recommendations: pendingPrioritized.filter(t => getTaskPriorityRank(t).tier === 3).slice(0, 2)
    },
    {
      time: "6:00 PM - 7:00 PM",
      title: "Future Projects / Strategic Planning",
      desc: "Review future roadmaps, AI prototypes & news logs.",
      tier: 4,
      tag: "Priority 4 (Experimental/Ideas)",
      color: "from-sky-500/10 to-transparent border-sky-500/20",
      iconColor: "text-sky-400",
      recommendations: pendingPrioritized.filter(t => getTaskPriorityRank(t).tier === 4).slice(0, 2)
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-16 select-none animate-fade-in font-sans text-xs">
      
      {/* HEADER ROW: Welcome Vijay Shukla & Live Operating System Banner */}
      <div className="relative rounded-2xl bg-[#05070f] border border-white/5 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden shadow-2xl">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-purple-600/5 rounded-full blur-[110px] pointer-events-none" />
        
        <div className="z-10 flex gap-4 items-start">
          <div className="p-3.5 bg-gradient-to-br from-purple-500/10 to-slate-500/5 border border-purple-500/15 text-purple-400 rounded-2xl shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 inline-block">
              Vijay OS Core Engine
            </h2>
            <h1 className="text-2xl md:text-3xl font-extrabold font-display text-white mt-2">Daily Directive Hub</h1>
            <div className="text-xs text-slate-400 mt-3 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                {dateStr || "Syncing Date..."}
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-mono text-purple-300 font-bold">{time || "Syncing clock..."}</span>
              </span>
              <span className="text-[10px] text-slate-500 bg-black/40 border border-white/5 px-2 py-0.5 rounded-md font-mono">
                Working Shift: 10:00 AM - 7:00 PM
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Prioritization Summary */}
        <div className="z-10 bg-black/45 border border-white/5 rounded-2xl p-4 text-xs md:w-80 w-full shadow-lg">
          <p className="font-mono text-purple-300 font-bold uppercase tracking-wider text-[9px] mb-1.5 flex items-center justify-between">
            <span>Operating Principle</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </p>
          <p className="text-slate-350 leading-relaxed font-sans text-[11px]">
            The ranking engine puts **Core Business** first to secure operations, **Learning** second for ongoing career development, and **Digital Projects** third as future growth avenues.
          </p>
        </div>
      </div>

      {/* CEO DAILY BRIEF: Today's top 5 Tasks organized strictly by priorities */}
      <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px]" />
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">CEO Daily Brief</h3>
            <p className="text-[10px] text-slate-550 mt-0.5">Top 5 actionable focal points grouped by weighted business priority.</p>
          </div>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-bold">
            Live Priorities
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          
          {/* Brief Category: Business */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-rose-450 mb-1 border-b border-rose-500/10 pb-1.5">
              <Building2 className="w-4 h-4 text-rose-400" />
              <span className="font-mono text-[10px] uppercase font-bold text-rose-300">Core & Growth Business</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {briefBusiness.length > 0 ? (
                briefBusiness.map((t, idx) => (
                  <div key={idx} className="p-3 bg-[#0d0912]/40 rounded-xl border border-rose-500/10 hover:border-rose-500/20 transition">
                    <p className="font-semibold text-slate-200 text-xs leading-normal">{t.title}</p>
                    <div className="flex justify-between items-center text-[9px] mt-2 font-mono">
                      <span className="text-rose-400/80 font-bold">{t.brand}</span>
                      <span className="text-slate-500">Due: {t.dueDate}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[9px] text-slate-500 font-mono italic">No Business directives currently loaded in top 5.</p>
              )}
            </div>
          </div>

          {/* Brief Category: Learning */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-purple-450 mb-1 border-b border-purple-500/10 pb-1.5">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-[10px] uppercase font-bold text-purple-300">Career Learning</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {briefLearning.length > 0 ? (
                briefLearning.map((t, idx) => (
                  <div key={idx} className="p-3 bg-[#110e1a]/40 rounded-xl border border-purple-500/10 hover:border-purple-500/20 transition">
                    <p className="font-semibold text-slate-200 text-xs leading-normal">{t.title}</p>
                    <div className="flex justify-between items-center text-[9px] mt-2 font-mono">
                      <span className="text-purple-400 font-bold">{t.brand}</span>
                      <span className="text-slate-500">Due: {t.dueDate}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[9px] text-slate-500 font-mono italic">No Career Growth tasks loaded in top 5.</p>
              )}
            </div>
          </div>

          {/* Brief Category: Projects */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-sky-450 mb-1 border-b border-sky-500/10 pb-1.5">
              <Briefcase className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-[10px] uppercase font-bold text-sky-300">Strategic Projects</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {briefProjects.length > 0 ? (
                briefProjects.map((t, idx) => (
                  <div key={idx} className="p-3 bg-[#0a111a]/40 rounded-xl border border-sky-500/10 hover:border-sky-500/20 transition">
                    <p className="font-semibold text-slate-200 text-xs leading-normal">{t.title}</p>
                    <div className="flex justify-between items-center text-[9px] mt-2 font-mono">
                      <span className="text-sky-400 font-bold">{t.brand}</span>
                      <span className="text-slate-500">Due: {t.dueDate}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[9px] text-slate-500 font-mono italic">No Future Projects logged in today's top 5.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* TODAY'S FOCUS: Custom Ranked Queue & Schedule Block Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Ranked Today's Focus List (Tiers ordered explicitly) (7 cols) */}
        <div className="lg:col-span-7 bg-[#05070f] border border-white/5 rounded-2xl p-6 shadow-2xl relative flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold font-display text-white">Vijay Shukla's Ranked Focus Queue</h3>
                <p className="text-[10px] text-slate-450 mt-0.5">Ranked in real-time by core utility logic: Business Rank &gt; Study Rank &gt; Projects Rank.</p>
              </div>
              <ListTodo className="w-4.5 h-4.5 text-purple-400" />
            </div>

            {/* Filter buttons to inspect tasks inside category tabs */}
            <div className="flex gap-2 mb-4 bg-black/40 p-1 rounded-xl border border-white/5 self-start">
              {[
                { id: "all", label: "Unified Queue" },
                { id: "business", label: "Business (P1 & P2)" },
                { id: "learning", label: "Learning (P3)" },
                { id: "projects", label: "Projects (P4)" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setHomeTaskTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wide transition uppercase font-semibold cursor-pointer ${
                    homeTaskTab === tab.id 
                    ? "bg-purple-600 text-white shadow-md font-bold" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3.5 max-h-[500px] overflow-y-auto pr-1">
              {(() => {
                let filteredList = pendingPrioritized;
                if (homeTaskTab === "business") {
                  filteredList = pendingPrioritized.filter(t => getTaskPriorityRank(t).tier <= 2);
                } else if (homeTaskTab === "learning") {
                  filteredList = pendingPrioritized.filter(t => getTaskPriorityRank(t).tier === 3);
                } else if (homeTaskTab === "projects") {
                  filteredList = pendingPrioritized.filter(t => getTaskPriorityRank(t).tier === 4);
                }

                return filteredList.length > 0 ? (
                  filteredList.map((t, idx) => {
                    const rankInfo = getTaskPriorityRank(t);
                    const styles = getCategoryStyles(t.category);
                    return (
                      <div 
                        key={t.id || idx} 
                        onClick={() => {
                          setSelectedKpiTask(t);
                          setEditingTaskTitle(t.title);
                          setEditingTaskNotes(t.notes || "");
                          setEditingTaskDueDate(t.dueDate);
                          setEditingTaskPriority(t.priority || "Medium");
                          setEditingTaskStatus(t.status || "Pending");
                        }}
                        className="bg-black/35 hover:bg-[#070a16] border border-white/5 hover:border-purple-500/20 p-4 rounded-xl flex items-center justify-between gap-4 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 flex-1 select-text">
                          {/* Checked index indicator mapping to exact priority queue slot */}
                          <div className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center border ${rankInfo.color} shrink-0`}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white leading-snug group-hover:text-purple-300 transition-colors break-words">
                              {t.title}
                            </p>
                            <div className="flex items-center gap-2.5 mt-2 flex-wrap text-[9px] font-mono">
                              <span className="text-slate-400 font-bold uppercase">{t.brand}</span>
                              <span className="text-slate-500">•</span>
                              <span className={`px-1.5 py-0.5 rounded border border-transparent bg-white/5 text-slate-350`}>
                                {t.category || "Operations"}
                              </span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-450 italic mt-0.5">Tier {rankInfo.tier}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${t.priority === 'High' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/25' : 'bg-slate-800 text-slate-400'}`}>
                            {t.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center text-xs text-slate-500 font-mono border border-dashed border-white/5 rounded-xl bg-black/15">
                    No active deliverables registered under this priority filter.
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Timeline & schedule hourly constraints (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Daily Schedule View */}
          <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Vijay's Daily Timeline</h3>
                <p className="text-[10px] text-slate-550 mt-0.5">Interactive scheduler showing real-time slot recommendations.</p>
              </div>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>

            <div className="space-y-4">
              {scheduleBlocks.map((block, idx) => (
                <div 
                  key={idx}
                  className={`p-4 bg-gradient-to-r rounded-xl border flex flex-col gap-2 transition ${block.color}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-mono text-[9px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-widest">{block.time}</span>
                      <h4 className="font-bold text-white text-xs mt-1 leading-snug">{block.title}</h4>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase mt-0.5">{block.tag}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-0.5">{block.desc}</p>

                  {/* Recommendations */}
                  <div className="mt-2 border-t border-white/5 pt-2">
                    <p className="text-[9px] font-mono text-slate-500 uppercase font-semibold mb-1.5">Recommended Actions:</p>
                    <div className="space-y-1.5">
                      {block.recommendations.length > 0 ? (
                        block.recommendations.map((rec, rIdx) => (
                          <div 
                            key={rIdx}
                            onClick={() => {
                              setSelectedKpiTask(rec);
                              setEditingTaskTitle(rec.title);
                              setEditingTaskNotes(rec.notes || "");
                              setEditingTaskDueDate(rec.dueDate);
                              setEditingTaskPriority(rec.priority || "Medium");
                              setEditingTaskStatus(rec.status || "Pending");
                            }}
                            className="p-2.5 bg-black/45 border border-white/5 hover:border-purple-500/20 text-[11px] rounded-lg text-slate-200 flex justify-between items-center transition cursor-pointer"
                          >
                            <span className="line-clamp-1 font-semibold flex-1 pr-3">{rec.title}</span>
                            <span className="font-mono text-[8px] text-purple-400 uppercase shrink-0">{rec.brand}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[9px] text-slate-500 font-mono italic">No items remaining. Pipeline clear.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* QUICK QUICK ACTIONS SHEET STRIP */}
      <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase font-bold mb-4">Core Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={onAddTask}
            className="p-4 bg-black/40 hover:bg-[#070914] border border-white/5 hover:border-purple-500/20 rounded-xl transition flex flex-col items-center justify-center gap-2 text-center cursor-pointer group"
          >
            <PlusCircle className="w-5.5 h-5.5 text-rose-400 group-hover:scale-105 transition" />
            <span className="text-xs font-semibold text-slate-200">Log Task</span>
          </button>

          <button 
            onClick={() => setActiveQuickAction(activeQuickAction === "idea" ? "none" : "idea")}
            className={`p-4 border rounded-xl transition flex flex-col items-center justify-center gap-2 text-center cursor-pointer group ${activeQuickAction === "idea" ? "bg-purple-650/10 border-purple-500 text-white" : "bg-black/40 border-white/5 hover:bg-[#070914] hover:border-purple-500/20"}`}
          >
            <Bookmark className="w-5.5 h-5.5 text-amber-400 group-hover:scale-105 transition" />
            <span className="text-xs font-semibold text-slate-200">Append Idea</span>
          </button>

          <button 
            onClick={onAddTask}
            className="p-4 bg-black/40 hover:bg-[#070914] border border-white/5 hover:border-purple-500/20 rounded-xl transition flex flex-col items-center justify-center gap-2 text-center cursor-pointer group"
          >
            <BookOpen className="w-5.5 h-5.5 text-purple-400 group-hover:scale-105 transition" />
            <span className="text-xs font-semibold text-slate-200">New Syllabus</span>
          </button>

          <button 
            onClick={() => setActiveQuickAction(activeQuickAction === "trade" ? "none" : "trade")}
            className={`p-4 border rounded-xl transition flex flex-col items-center justify-center gap-2 text-center cursor-pointer group ${activeQuickAction === "trade" ? "bg-purple-650/10 border-purple-500 text-white" : "bg-black/40 border-white/5 hover:bg-[#070914] hover:border-purple-500/20"}`}
          >
            <TrendingUp className="w-5.5 h-5.5 text-blue-400 group-hover:scale-105 transition" />
            <span className="text-xs font-semibold text-slate-200">Log Trade</span>
          </button>
        </div>

        {/* Dynamic Inline Forms for Quick Actions */}
        {activeQuickAction === "idea" && (
          <form onSubmit={handleQuickAddIdea} className="mt-4 p-4 bg-black/60 border border-white/5 rounded-xl flex gap-3 text-xs animate-slide-down">
            <input 
              type="text" 
              value={quickIdeaTitle}
              onChange={e => setQuickIdeaTitle(e.target.value)}
              placeholder="What strategic idea or system issue is on your mind?"
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white outline-none focus:border-purple-500"
              required
            />
            <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg cursor-pointer">
              Add Idea
            </button>
          </form>
        )}

        {activeQuickAction === "trade" && (
          <form onSubmit={handleQuickAddTrade} className="mt-4 p-4 bg-black/60 border border-white/5 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-slide-down">
            <input 
              type="text" 
              value={quickTradeSymbol}
              onChange={e => setQuickTradeSymbol(e.target.value)}
              placeholder="SYMBOL e.g. TATA"
              className="bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white outline-none focus:border-purple-500 uppercase"
              required
            />
            <input 
              type="number" 
              value={quickTradeProfit}
              onChange={e => setQuickTradeProfit(e.target.value)}
              placeholder="Net realized profit / loss in ₹"
              className="bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white outline-none focus:border-purple-500"
              required
            />
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer">
              Log Realized P&L
            </button>
          </form>
        )}
      </div>

      {/* OVERDUE ALERTS CARD */}
      {sortedOverdue.length > 0 && (
        <div className="bg-[#05070f] border border-red-500/10 rounded-2xl p-6 shadow-2xl relative">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-red-500/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              <h3 className="text-sm font-bold text-red-200 uppercase tracking-wide font-mono">Delayed Deliverables ({sortedOverdue.length})</h3>
            </div>
            <span className="text-[10px] font-mono text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded">Action Required</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedOverdue.slice(0, 6).map((t, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  setSelectedKpiTask(t);
                  setEditingTaskTitle(t.title);
                  setEditingTaskNotes(t.notes || "");
                  setEditingTaskDueDate(t.dueDate);
                  setEditingTaskPriority(t.priority || "Medium");
                  setEditingTaskStatus(t.status || "Pending");
                }}
                className="bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 p-4 rounded-xl flex flex-col justify-between cursor-pointer transition text-xs"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-red-200 line-clamp-1">{t.title}</span>
                    <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-mono shrink-0">OVERDUE</span>
                  </div>
                  {t.notes && <p className="text-[10px] text-slate-450 mt-1 lines-clamp-2 italic">{t.notes}</p>}
                </div>
                <div className="flex justify-between items-center text-[9px] mt-4 pt-2 border-t border-white/5 font-mono">
                  <span className="text-slate-400 font-bold uppercase">{t.brand}</span>
                  <span className="text-red-400">Target: {t.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Overlay for activeKpiLabel and and task editor dialogues */}
      {(() => {
        let filteredKpiTasks: Task[] = [];
        if (activeKpiLabel) {
          const all = sheetData?.tasks || [];
          if (activeKpiLabel === "Total Tasks") {
            filteredKpiTasks = all;
          } else if (activeKpiLabel === "Completed") {
            filteredKpiTasks = all.filter(t => t.status === "Completed");
          } else if (activeKpiLabel === "Pending") {
            filteredKpiTasks = all.filter(t => t.status !== "Completed");
          } else if (activeKpiLabel === "Overdue") {
            filteredKpiTasks = all.filter(t => t.status === "Overdue" || (t.dueDate < "2026-06-21" && t.status !== "Completed"));
          } else if (activeKpiLabel === "Blocked") {
            filteredKpiTasks = all.filter(t => t.status === "Blocked");
          } else if (activeKpiLabel === "Today's") {
            filteredKpiTasks = pendingPrioritized;
          } else if (activeKpiLabel === "This Week") {
            filteredKpiTasks = all.filter(t => t.dueDate >= "2026-06-21" && t.dueDate <= "2026-06-28");
          }
        }

        const kpiBrandGroups: Record<string, Task[]> = {};
        filteredKpiTasks.forEach(t => {
          const b = t.brand || "Operations";
          if (!kpiBrandGroups[b]) kpiBrandGroups[b] = [];
          kpiBrandGroups[b].push(t);
        });

        return activeKpiLabel && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in text-xs font-sans">
            <div className="bg-[#05070f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4.5 border-b border-white/5 bg-black/40">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    {activeKpiLabel} Details ({filteredKpiTasks.length})
                  </h3>
                  <p className="text-[10px] text-slate-550 font-mono mt-0.5">Vijay OS KPI Directives</p>
                </div>
                <button 
                  onClick={() => {
                    setActiveKpiLabel(null);
                    setSelectedKpiBrand(null);
                    setSelectedKpiTask(null);
                  }}
                  className="p-1.5 hover:bg-white/5 text-[11px] font-mono rounded-lg text-slate-400 hover:text-white transition cursor-pointer border-none bg-transparent"
                >
                  Close ×
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                
                {/* STEP 1: Main Brand grouping selector */}
                {!selectedKpiBrand && !selectedKpiTask && (
                  <div className="space-y-2.5">
                    <p className="text-slate-400 font-medium mb-3">Grouped by Brand Portfolio:</p>
                    {Object.entries(kpiBrandGroups).map(([brandName, brandTasks]) => (
                      <button
                        key={brandName}
                        onClick={() => setSelectedKpiBrand(brandName)}
                        className="w-full text-left p-4 bg-[#0a0c16]/70 border border-white/5 hover:border-purple-500/20 rounded-xl transition flex justify-between items-center group cursor-pointer outline-none font-sans"
                      >
                        <div>
                          <span className="font-bold text-slate-200 group-hover:text-purple-300 transition-colors text-xs">{brandName}</span>
                          <p className="text-[10px] text-slate-500 mt-1">Click brand portfolio to view specific task directives</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/15 px-2.5 py-1 rounded">
                          {brandTasks.length} {activeKpiLabel === "Total Tasks" ? "Total" : activeKpiLabel}
                        </span>
                      </button>
                    ))}
                    {Object.keys(kpiBrandGroups).length === 0 && (
                      <div className="text-center py-8 text-slate-500 font-mono">No matching records found.</div>
                    )}
                  </div>
                )}

                {/* STEP 2: Selected Brand tasks list */}
                {selectedKpiBrand && !selectedKpiTask && (() => {
                  const tasksInBrand = kpiBrandGroups[selectedKpiBrand] || [];
                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-slate-200 font-semibold">{selectedKpiBrand} Directive Log</p>
                        <button 
                          onClick={() => setSelectedKpiBrand(null)}
                          className="text-[10px] font-mono text-purple-400 hover:underline cursor-pointer bg-transparent border-none"
                        >
                          ← Back to Brand Selection
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {tasksInBrand.map((t, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedKpiTask(t);
                              setEditingTaskTitle(t.title);
                              setEditingTaskNotes(t.notes || "");
                              setEditingTaskDueDate(t.dueDate);
                              setEditingTaskPriority(t.priority || "Medium");
                              setEditingTaskStatus(t.status || "Pending");
                            }}
                            className="w-full text-left p-4 bg-neutral-900/60 hover:bg-[#070914] border border-white/5 hover:border-purple-500/30 rounded-xl transition flex justify-between gap-4 items-center group cursor-pointer outline-none"
                          >
                            <div className="flex-1 pr-4 min-w-0">
                              <h4 className="font-bold text-slate-100 group-hover:text-purple-300 transition-colors text-xs break-words">{t.title}</h4>
                              <p className="text-[10px] text-slate-500 mt-1 italic leading-relaxed line-clamp-1">{t.notes || "No notes logged."}</p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1.5 shrink-0 min-w-[100px]">
                              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                                t.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                t.status === "Blocked" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                t.status === "Overdue" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              }`}>
                                {t.status}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">{t.dueDate}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* STEP 3: Selected Task Form Modifier */}
                {selectedKpiTask && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-1">
                      <div>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest text-xs">Active Task Editor ({selectedKpiTask.id})</p>
                        <p className="text-slate-200 font-bold text-sm mt-0.5">{selectedKpiBrand || selectedKpiTask.brand}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedKpiTask(null)}
                        className="text-[10px] font-mono text-purple-400 hover:underline cursor-pointer bg-transparent border-none"
                      >
                        ← Back to brand tasks
                      </button>
                    </div>

                    <div className="space-y-3.5 bg-neutral-900/60 p-5 rounded-2xl border border-white/5 text-slate-200">
                      {/* Title */}
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">Task Title</label>
                        <input 
                          type="text" 
                          value={editingTaskTitle}
                          onChange={e => setEditingTaskTitle(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white outline-none focus:border-purple-500 text-xs font-semibold"
                          required
                        />
                      </div>

                      {/* Due date & Priority Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">Due Date</label>
                          <input 
                            type="date" 
                            value={editingTaskDueDate}
                            onChange={e => setEditingTaskDueDate(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white outline-none focus:border-purple-500 text-xs text-slate-300 font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">Priority</label>
                          <select 
                            value={editingTaskPriority}
                            onChange={e => setEditingTaskPriority(e.target.value as any)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white outline-none focus:border-purple-500 text-xs text-slate-300 font-medium"
                          >
                            <option value="High">🔴 High Priority</option>
                            <option value="Medium">🟣 Medium Priority</option>
                            <option value="Low">🔵 Low Priority</option>
                          </select>
                        </div>
                      </div>

                      {/* Status selection */}
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase tracking-wider font-semibold">Status State</label>
                        <select 
                          value={editingTaskStatus}
                          onChange={e => setEditingTaskStatus(e.target.value as any)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white outline-none focus:border-purple-500 text-xs text-slate-300 font-medium"
                        >
                          <option value="Pending">⌛ Pending Delivery</option>
                          <option value="Completed">🟢 Completed Done</option>
                          <option value="Blocked">⚠️ Blocked Issues</option>
                          <option value="Overdue">🕒 Overdue Delayed</option>
                        </select>
                      </div>

                      {/* Notes textarea */}
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">Notes & Descriptions</label>
                        <textarea 
                          value={editingTaskNotes}
                          onChange={e => setEditingTaskNotes(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500 text-xs resize-none min-h-24 leading-relaxed font-sans"
                          placeholder="Write task checklist progress notes or notes on blocker causes here..."
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleSaveTaskForm}
                          className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-lg transition-all text-xs font-mono tracking-wide shadow-lg cursor-pointer border-none"
                        >
                          SAVE & UPDATE SHEET
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="bg-black/40 border-t border-white/5 py-3.5 px-6 flex justify-between items-center text-[9px] font-mono text-slate-500">
                <span>VJ Operating System Pipeline Connected</span>
                <span>Vijay OS v1.1 Elite</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Task editor overlay when clicking item outside activeKpiLabel (from Ranked Focus Queue directly) */}
      {!activeKpiLabel && selectedKpiTask && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in text-xs font-sans text-slate-200">
          <div className="bg-[#05070f] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 gap-4 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div>
                <p className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-bold">Direct Task Update</p>
                <h4 className="text-white font-bold text-sm mt-0.5">{selectedKpiTask.id} • {selectedKpiTask.brand}</h4>
              </div>
              <button 
                onClick={() => setSelectedKpiTask(null)}
                className="text-[10px] font-mono text-slate-400 hover:text-white cursor-pointer bg-transparent border-none"
              >
                Cancel ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1 font-bold">TASK TITLE</label>
                <input 
                  type="text" 
                  value={editingTaskTitle}
                  onChange={e => setEditingTaskTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white outline-none focus:border-purple-500 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1 font-bold">DUE DATE</label>
                  <input 
                    type="date" 
                    value={editingTaskDueDate}
                    onChange={e => setEditingTaskDueDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white outline-none focus:border-purple-500 text-xs text-slate-350 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1 font-bold">PRIORITY</label>
                  <select 
                    value={editingTaskPriority}
                    onChange={e => setEditingTaskPriority(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs text-slate-300 font-semibold"
                  >
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟣 Medium Priority</option>
                    <option value="Low">🔵 Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1 font-bold">STATUS STATE</label>
                <select 
                  value={editingTaskStatus}
                  onChange={e => setEditingTaskStatus(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs text-slate-300 font-semibold"
                >
                  <option value="Pending">⌛ Pending Delivery</option>
                  <option value="Completed">🟢 Completed Done</option>
                  <option value="Blocked">⚠️ Blocked Issues</option>
                  <option value="Overdue">🕒 Overdue Delayed</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1 font-bold">NOTES</label>
                <textarea 
                  value={editingTaskNotes}
                  onChange={e => setEditingTaskNotes(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500 text-xs resize-none min-h-24 leading-relaxed font-sans"
                  placeholder="Checklist logs..."
                />
              </div>

              <button
                onClick={handleSaveTaskForm}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-lg text-xs tracking-wider uppercase shadow-lg border-none cursor-pointer mt-2"
              >
                Save & Update Google Sheet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
