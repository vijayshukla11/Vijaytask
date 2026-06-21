import React, { useState } from "react";
import { 
  Kanban, 
  List, 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  Plus, 
  Check, 
  AlertCircle, 
  CalendarRange, 
  Briefcase, 
  Tag, 
  Clock, 
  CheckSquare, 
  Square,
  Edit2,
  Trash2,
  MoreVertical
} from "lucide-react";
import { Task, SheetDataState } from "../types";
import { getCategoryStyles } from "./HomeView";

interface TaskViewProps {
  sheetData: SheetDataState | null;
  onToggleMasterTask: (taskId: string, currentStatus: string) => void;
  onAddTask: () => void;
  onUpdateTask: (task: Task) => void;
}

type ViewType = "kanban" | "list" | "calendar";

export default function TaskView({
  sheetData,
  onToggleMasterTask,
  onAddTask,
  onUpdateTask
}: TaskViewProps) {
  const [view, setView] = useState<ViewType>("list");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Inline editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingPriority, setEditingPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [editingCategory, setEditingCategory] = useState("Development");
  const [editingDueDate, setEditingDueDate] = useState("2026-06-21");

  if (!sheetData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-xs font-mono text-slate-400">
        <Clock className="w-5 h-5 animate-spin text-purple-400" />
        Acquiring operational tasks registry...
      </div>
    );
  }

  const tasks = sheetData.tasks;

  // Extract all categories/brands safely for filter tags
  const brands = Array.from(new Set(tasks.map(t => t.brand))).filter(Boolean);
  const categories = Array.from(new Set(tasks.map(t => t.category || "Operations"))).filter(Boolean);

  // Filters logic
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = (t.title || "").toLowerCase().includes(search.toLowerCase()) || 
                          (t.brand || "").toLowerCase().includes(search.toLowerCase()) || 
                          (t.category || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesBrand = brandFilter === "all" || t.brand === brandFilter;
    
    const cat = t.category || "Operations";
    const matchesCategory = categoryFilter === "all" || cat === categoryFilter;

    return matchesSearch && matchesPriority && matchesStatus && matchesBrand && matchesCategory;
  });

  const startInlineEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingPriority(task.priority);
    setEditingCategory(task.category || "Operations");
    setEditingDueDate(task.dueDate || "2026-06-21");
  };

  const saveInlineEdit = (task: Task) => {
    onUpdateTask({
      ...task,
      title: editingTitle,
      priority: editingPriority,
      category: editingCategory,
      dueDate: editingDueDate,
      updatedAt: new Date().toISOString()
    });
    setEditingTaskId(null);
  };

  // Grouped columns for Kanban View
  const columns: { label: string; status: string; color: string }[] = [
    { label: "Todo / Pending", status: "Pending", color: "border-t-2 border-indigo-500" },
    { label: "Overdue Care", status: "Overdue", color: "border-t-2 border-rose-500 animate-pulse" },
    { label: "Blocked Items", status: "Blocked", color: "border-t-2 border-amber-500" },
    { label: "Completed Success", status: "Completed", color: "border-t-2 border-emerald-500" }
  ];

  return (
    <div className="flex flex-col gap-6 pb-20 select-none">
      
      {/* Top Banner & Mode selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Task Operational Matrix</h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">VijayOS premium checklist containing active, pending, blocked, and backlog directives.</p>
        </div>
        
        {/* Row of layout view buttons */}
        <div className="flex items-center gap-2 p-1.5 bg-neutral-950 border border-white/5 rounded-xl self-start md:self-auto">
          <button 
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${view === "list" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-100"}`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          
          <button 
            onClick={() => setView("kanban")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${view === "kanban" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-100"}`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>

          <button 
            onClick={() => setView("calendar")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${view === "calendar" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-100"}`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Robust Control Panel */}
      <div className="p-4 rounded-xl bg-[#05070f] border border-white/5 grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-3.5 items-end">
        {/* Search */}
        <div className="flex flex-col gap-1.5 sm:col-span-1">
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Search Keyphrase</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-500" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter master checkings..."
              className="pl-9.5 pr-3 py-2 bg-neutral-950 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl w-full text-xs text-white outline-none"
            />
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Priority Segment</label>
          <select 
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="p-2 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white outline-none w-full"
          >
            <option value="all">⚡ All Priorities</option>
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟣 Medium Priority</option>
            <option value="Low">🔵 Low Priority</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Status Index</label>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white outline-none w-full"
          >
            <option value="all">🎯 All Statuses</option>
            <option value="Pending">⏱️ Pending</option>
            <option value="Overdue">⚠️ Overdue</option>
            <option value="Blocked">🚫 Blocked</option>
            <option value="Completed">✅ Completed</option>
          </select>
        </div>

        {/* Brand Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Brand Portfolio</label>
          <select 
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="p-2 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white outline-none w-full"
          >
            <option value="all">💼 All Brands</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Category Tag</label>
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="p-2 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white outline-none w-full"
          >
            <option value="all">🏷️ All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW DRAWERS */}

      {/* 1. LIST VIEW */}
      {view === "list" && (
        <div className="bg-neutral-950/40 rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center px-2 py-1 text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider hidden sm:flex">
            <span className="flex-1 max-w-[50%]">Core Objective Diagnostic</span>
            <span className="w-40 text-center">Brand Portfolio</span>
            <span className="w-32 text-center">Fulfill Target</span>
            <span className="w-28 text-center font-bold">Category</span>
            <span className="w-24 text-center">Priority</span>
            <span className="w-28 text-right">Actions</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(t => {
                const isEditing = editingTaskId === t.id;
                const cat = t.category || "Operations";
                const styles = getCategoryStyles(cat);
                
                return (
                  <div 
                    key={t.id} 
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-250 ${t.status === "Completed" ? "bg-black/10 border-white/5 opacity-60" : "bg-black/30 border-white/5 hover:border-purple-500/20"}`}
                  >
                    {/* Title + interactive check */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-[50%]">
                      <button 
                        onClick={() => onToggleMasterTask(t.id, t.status)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${t.status === "Completed" ? "bg-purple-650 border-purple-600 text-purple-400 bg-purple-500/10" : "border-white/20 hover:border-purple-400"}`}
                      >
                        {t.status === "Completed" && <Check className="w-3.5 h-3.5" />}
                      </button>
                      
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editingTitle} 
                          onChange={e => setEditingTitle(e.target.value)}
                          className="px-2 py-1 bg-neutral-900 border border-purple-500/50 rounded-lg text-xs text-white outline-none flex-1 font-semibold"
                        />
                      ) : (
                        <div>
                          <p className={`text-xs font-semibold leading-snug ${t.status === "Completed" ? "line-through text-slate-550 text-slate-500" : "text-white"}`}>
                            {t.title}
                          </p>
                          <span className="text-[9px] font-mono text-slate-500 mt-1 block">ID: {t.id}</span>
                        </div>
                      )}
                    </div>

                    {/* Brand segment */}
                    <div className="w-full sm:w-40 text-left sm:text-center text-[11px] font-semibold text-purple-300">
                      {t.brand}
                    </div>

                    {/* Date segment */}
                    <div className="w-full sm:w-32 text-left sm:text-center text-[10px] font-mono text-slate-400 flex items-center sm:justify-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500 block sm:hidden" />
                      {isEditing ? (
                        <input 
                          type="date" 
                          value={editingDueDate} 
                          onChange={e => setEditingDueDate(e.target.value)}
                          className="bg-neutral-900 border border-purple-500/30 rounded text-slate-300 text-xs px-1"
                        />
                      ) : (
                        <span className={t.status === "Overdue" ? "text-rose-400 font-bold" : ""}>{t.dueDate}</span>
                      )}
                    </div>

                    {/* Category pill */}
                    <div className="w-full sm:w-28 flex items-center sm:justify-center gap-1.5">
                      {isEditing ? (
                        <select
                          value={editingCategory}
                          onChange={e => setEditingCategory(e.target.value)}
                          className="bg-neutral-900 border border-purple-500/30 rounded text-slate-350 text-xs px-1 py-0.5"
                        >
                          <option value="Development">Development</option>
                          <option value="Admin">Admin</option>
                          <option value="Research">Research</option>
                          <option value="Operations">Operations</option>
                        </select>
                      ) : (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border ${styles.bg} ${styles.text} ${styles.border} font-bold tracking-wide`}>
                          {cat}
                        </span>
                      )}
                    </div>

                    {/* Priority badge */}
                    <div className="w-full sm:w-24 text-left sm:text-center flex justify-start sm:justify-center">
                      {isEditing ? (
                        <select
                          value={editingPriority}
                          onChange={e => setEditingPriority(e.target.value as any)}
                          className="bg-neutral-950 border border-purple-500/30 rounded text-slate-200 text-xs px-1 py-0.5"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      ) : (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${t.priority === "High" ? "bg-rose-500/10 text-rose-400 border border-rose-500/15" : t.priority === "Medium" ? "bg-purple-500/10 text-purple-400 border border-purple-500/15" : "bg-zinc-800 text-zinc-400"}`}>
                          {t.priority}
                        </span>
                      )}
                    </div>

                    {/* List edit buttons */}
                    <div className="w-full sm:w-28 flex justify-end gap-2 text-xs">
                      {isEditing ? (
                        <button 
                          onClick={() => saveInlineEdit(t)} 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px]"
                        >
                          Save
                        </button>
                      ) : (
                        <button 
                          onClick={() => startInlineEdit(t)} 
                          className="p-1 px-2.5 bg-neutral-900 border border-white/5 hover:border-purple-500/30 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-1 text-[10px]"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 font-mono border border-dashed border-white/10 rounded-xl">
                No matching tasks returned using current filters state.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. KANBAN BOARD VIEW */}
      {view === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {columns.map(col => {
            let colTasks = filteredTasks.filter(t => t.status === col.status);
            
            // Overdue columns rule fallback
            if (col.status === "Overdue") {
              colTasks = filteredTasks.filter(t => t.status === "Overdue" || (t.dueDate < "2026-06-21" && t.status !== "Completed"));
            } else if (col.status === "Pending") {
              colTasks = filteredTasks.filter(t => t.status === "Pending" && t.dueDate >= "2026-06-21");
            }

            return (
              <div key={col.status} className="bg-[#05070f] rounded-2xl border border-white/5 p-4 flex flex-col gap-4">
                <div className={`pt-2 flex justify-between items-center border-b border-white/5 pb-2.5 ${col.color}`}>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{col.label}</span>
                  <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-slate-400 font-mono">{colTasks.length}</span>
                </div>

                <div className="flex flex-col gap-3 min-h-[350px] max-h-[500px] overflow-y-auto pr-1">
                  {colTasks.map(t => {
                    const cat = t.category || "Operations";
                    const styles = getCategoryStyles(cat);
                    return (
                      <div key={t.id} className="p-4 bg-black/40 border border-white/5 rounded-xl hover:border-purple-500/20 hover:scale-[1.01] transition-all flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-xs font-semibold text-white tracking-wide break-words max-w-[85%]">{t.title}</span>
                          <button 
                            onClick={() => onToggleMasterTask(t.id, t.status)}
                            className="p-0.5 hover:bg-white/5 rounded border border-white/10 text-slate-400"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-purple-400 font-semibold">{t.brand}</span>
                          <span className={`text-[8px] px-2 py-0.5 rounded border ${styles.bg} ${styles.text} ${styles.border} font-bold uppercase`}>
                            {cat}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-slate-500 pt-2 border-t border-white/5">
                          <span className="font-mono">{t.dueDate}</span>
                          <span className={`font-semibold uppercase ${t.priority === "High" ? "text-rose-450 text-rose-400" : "text-slate-400"}`}>
                            {t.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="h-44 border border-dashed border-white/5 rounded-xl flex items-center justify-center text-[10px] text-slate-500 font-mono text-center px-4">
                      No matching directives.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. CALENDAR AGENDA VIEW */}
      {view === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grouped Day lists */}
          <div className="lg:col-span-2 bg-[#05070f] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5">
              <CalendarRange className="w-4 h-4 text-purple-400" />
              <span>Directives Deadline Schedule</span>
            </h3>

            <div className="flex flex-col gap-6">
              {[
                { label: "Today (June 21, 2026)", date: "2026-06-21" },
                { label: "Tomorrow (June 22, 2026)", date: "2026-06-22" },
                { label: "Upcoming (June 23 onwards)", pattern: "future" },
                { label: "Historic / Backlog (Pending / Overdue)", pattern: "past" }
              ].map((slot, idx) => {
                let slotTasks = [];
                if (slot.date) {
                  slotTasks = filteredTasks.filter(t => t.dueDate === slot.date);
                } else if (slot.pattern === "future") {
                  slotTasks = filteredTasks.filter(t => t.dueDate > "2026-06-22");
                } else {
                  slotTasks = filteredTasks.filter(t => t.status === "Overdue" || (t.dueDate < "2026-06-21" && t.status !== "Completed"));
                }

                return (
                  <div key={idx} className="border-l-2 border-white/10 pl-4 py-1">
                    <h4 className="text-xs font-semibold text-purple-300 font-mono uppercase tracking-wider mb-2.5">{slot.label}</h4>
                    <div className="flex flex-col gap-2">
                      {slotTasks.length > 0 ? (
                        slotTasks.map(t => {
                          const cat = t.category || "Operations";
                          const styles = getCategoryStyles(cat);
                          return (
                            <div key={t.id} className="p-3 bg-black/20 rounded-xl border border-white/5 flex justify-between items-center gap-4 text-xs">
                              <div>
                                <span className={`${t.status === "Completed" ? "line-through text-slate-500" : "text-white"} font-semibold`}>{t.title}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-purple-400">{t.brand}</span>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded border ${styles.bg} ${styles.text} ${styles.border} font-bold`}>{cat}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">{t.dueDate}</span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-[10px] text-slate-550 block font-mono text-slate-500">No scheduled tasks.</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white">Daily Operational Routines</h3>
            <p className="text-xs text-slate-450 text-slate-450 leading-relaxed font-sans">
              Routines scheduled in the master database log. These trigger recurrences daily regardless of master roadmap.
            </p>

            <div className="space-y-2 select-none">
              {sheetData.dailyTasks.map(dt => (
                <div key={dt.id} className="p-3 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">{dt.title}</span>
                  <span className="text-[9px] bg-purple-550/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono uppercase font-bold">{dt.schedule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
