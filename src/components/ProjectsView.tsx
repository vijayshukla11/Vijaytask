import React, { useState } from "react";
import { 
  Building2, 
  ExternalLink, 
  Clock, 
  CheckSquare, 
  AlertTriangle, 
  ArrowLeft,
  PieChart as PieIcon,
  Calendar,
  BarChart,
  FolderOpen,
  StickyNote,
  Briefcase,
  Play,
  Plus
} from "lucide-react";
import { SheetDataState, Task } from "../types";
import { getCategoryStyles } from "./HomeView";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart as ReBarChart, Bar, XAxis, YAxis } from "recharts";

interface ProjectsViewProps {
  sheetData: SheetDataState | null;
  activeBrand: string;
  setActiveBrand: (brand: string) => void;
  onToggleMasterTask: (taskId: string, currentStatus: string) => void;
  onAddTask: () => void;
}

export default function ProjectsView({
  sheetData,
  activeBrand,
  setActiveBrand,
  onToggleMasterTask,
  onAddTask
}: ProjectsViewProps) {
  const [activeTab, setActiveTab2] = useState<"overview" | "analytics" | "tasks" | "timeline" | "files" | "notes">("overview");

  if (!sheetData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-xs font-mono text-slate-400">
        <Clock className="w-5 h-5 animate-spin text-purple-400" />
        Synchronizing digital projects portfolio...
      </div>
    );
  }

  const projectBrands = [
    "Bharatika News",
    "AI Projects"
  ];

  // Helper stats for a project card
  const getProjectStats = (projectName: string) => {
    const projectTasks = sheetData.tasks.filter(t => (t.brand || "").toLowerCase().includes(projectName.toLowerCase()));
    
    // Check if progress is tracked in sheetData.websiteProjects
    const trackedProj = sheetData.websiteProjects.find(p => (p.project || "").toLowerCase().includes(projectName.toLowerCase()));
    const progress = trackedProj ? trackedProj.progress : 65; // fallback
    
    const pending = projectTasks.filter(t => t.status !== "Completed").length;
    const completed = projectTasks.filter(t => t.status === "Completed").length;
    const priorityHigh = projectTasks.filter(t => t.priority === "High" && t.status !== "Completed").length;

    return { progress, pending, completed, priorityHigh, total: projectTasks.length, docCount: 3 };
  };

  const isGlobal = activeBrand === "Global Overview" || !projectBrands.includes(activeBrand);

  if (isGlobal) {
    return (
      <div className="flex flex-col gap-6 select-none pb-16">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Active Projects</h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Landing portals tracking Vijay Shukla's website migrations, structural engineering projects, and product design sprints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {projectBrands.map(b => {
            const stats = getProjectStats(b);
            return (
              <div 
                key={b}
                onClick={() => setActiveBrand(b)}
                className="bg-[#05070f] border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 cursor-pointer hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between group shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-600/10 transition-colors" />
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl group-hover:bg-indigo-600/20 transition">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono tracking-wider text-slate-500 font-bold uppercase group-hover:text-indigo-400 transition">
                      OPEN LANDING PAGE →
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{b}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    Custom web portal engineering, timeline logs, source metrics, and task integration maps.
                  </p>

                  <div className="grid grid-cols-3 gap-2.5 my-5 text-center">
                    <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                      <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">Pending</p>
                      <p className="text-base font-bold text-slate-200 mt-1">{stats.pending}</p>
                    </div>
                    <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                      <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">Completed</p>
                      <p className="text-base font-bold text-emerald-400 mt-1">{stats.completed}</p>
                    </div>
                    <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                      <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">Files Listed</p>
                      <p className="text-base font-bold text-indigo-400 mt-1">{stats.docCount} docs</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mb-1.5">
                    <span>Active Milestones Completion</span>
                    <span className="font-mono text-indigo-400 font-bold">{stats.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" 
                      style={{ width: `${stats.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // INDIVIDUAL PROJECT LANDING PAGE
  const projectStats = getProjectStats(activeBrand);
  const projectTasksAll = sheetData.tasks.filter(t => (t.brand || "").toLowerCase().includes(activeBrand.toLowerCase()));
  const projectTasksCompleted = projectTasksAll.filter(t => t.status === "Completed");
  const projectTasksPending = projectTasksAll.filter(t => t.status !== "Completed");

  // Recharts specific Project stats
  const projectCategoryCounts: Record<string, number> = {};
  projectTasksAll.forEach(t => {
    const cat = t.category || "Operations";
    projectCategoryCounts[cat] = (projectCategoryCounts[cat] || 0) + 1;
  });
  const categoryData = Object.entries(projectCategoryCounts).map(([name, value]) => ({ name, value }));
  const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#ec4899", "#f59e0b"];

  const fileAttachments = [
    { name: `Redesign_High_Fidelity_Figma_Blueprint.pdf`, size: "18.4 MB", date: "June 20, 2026" },
    { name: `API_Integrations_Specs_v3.json`, size: "450 KB", date: "June 15, 2026" },
    { name: `Operational_Readiness_Briefing.pdf`, size: "2.4 MB", date: "June 11, 2026" }
  ];

  return (
    <div className="flex flex-col gap-6 select-none pb-16">
      
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
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">Project Hub Page</span>
            <h1 className="text-2xl font-bold font-display text-white mt-0.5">{activeBrand}</h1>
          </div>
        </div>

        <button 
          onClick={onAddTask}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs rounded-xl transition shadow-[0_4px_15px_rgba(124,58,237,0.3)] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project Directive</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Milestone Target Sync", value: `${projectStats.progress}%`, sub: "Overall Progress", color: "text-indigo-400" },
          { label: "Incomplete Work", value: projectStats.pending, sub: "Pending tasks", color: "text-blue-400" },
          { label: "Completed Milestones", value: projectStats.completed, sub: "Success items", color: "text-emerald-400" },
          { label: "Total Team Load", value: projectStats.total, sub: "Directive volume", color: "text-slate-350" }
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
        {(["overview", "analytics", "pending", "completed", "timeline", "files", "notes"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab2(tab as any)}
            className={`px-4 py-2 text-xs font-semibold capitalize border-b-2 transition duration-200 cursor-pointer ${activeTab === tab ? "border-indigo-550 border-indigo-505 border-purple-500 text-white" : "border-transparent text-slate-450 hover:text-slate-100"}`}
          >
            {tab === "pending" ? "Pending Work" : tab === "completed" ? "Completed Work" : tab}
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
                <h3 className="text-sm font-semibold text-white">Project Scope</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2.5">
                  Welcome to the {activeBrand} operational landing platform. It features deep integration with central Google Sheet lists to manage assets, update workflows dynamically, log task achievements, and review system deadlines. This design serves to avoid manual refreshes and enable efficient, professional project dispatching.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-500">Milestone Priorities</h4>
                <div className="mt-3 space-y-3">
                  <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Objective A: UI Refresh & Optimization</p>
                      <p className="text-slate-450 mt-1 text-slate-400">Apply clean fonts, professional spacings, and reduce noise.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase">HIGH PRIORITY</span>
                  </div>
                  <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Objective B: Data Sync Verification</p>
                      <p className="text-slate-450 mt-1 text-slate-400">Align spreadsheet parameters and check connection status codes.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold uppercase">ALIGNED</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-white">Status Briefing Notes</h3>
              <p className="text-xs text-slate-450 text-slate-450 leading-relaxed font-sans mb-1">
                A staging workspace for immediate focus points, operational guidelines, and raw notes.
              </p>
              <textarea 
                className="flex-1 bg-black/44 bg-black/40 border border-white/5 hover:border-white/10 rounded-xl min-h-36 p-3 text-xs text-slate-300 outline-none resize-none font-sans leading-relaxed"
                placeholder="Write project notes here..."
                defaultValue={`• Double-check data integrity with master spreadsheets.\n• Ensure prompt responses for high-priority items.\n• Keep styling consistent across all digital project frontends.`}
              />
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl h-74 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Functional Task Distribution</h4>
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
              <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Task Volume by Category</h4>
              <div className="flex-1">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={categoryData}>
                      <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#05060b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "10px" }} />
                      <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} />
                    </ReBarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs font-mono text-slate-500">No volume markers recorded.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PENDING WORK TAB */}
        {activeTab === "tasks" && (
          <div className="bg-neutral-950/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 px-2 py-1">Incomplete Directives ({projectTasksPending.length} items)</h3>
            <div className="flex flex-col gap-2.5 mt-1">
              {projectTasksPending.length > 0 ? (
                projectTasksPending.map(t => {
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
                          className="w-4.5 h-4.5 rounded-lg border border-white/10 flex items-center justify-center hover:border-purple-500"
                        >
                          <CheckSquare className="w-3.5 h-3.5 opacity-0 hover:opacity-40" />
                        </button>
                        <div>
                          <p className="font-semibold text-white">{t.title}</p>
                          <span className="text-[9px] font-mono text-slate-500 mt-0.5 block">{t.id} • {t.dueDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] px-2 py-0.5 rounded border ${styles.bg} ${styles.text} ${styles.border} font-bold`}>{cat}</span>
                        <span className={`text-[8px] font-bold uppercase ${t.priority === "High" ? "text-rose-450" : "text-slate-400"}`}>{t.priority}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-xs font-mono text-slate-500 border border-dashed border-white/5 rounded-xl">
                  No incomplete directives logged to this operational unit. All caught up!
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMPLETED WORK TAB */}
        {activeTab === "files" && ( // Note: mapping completed work slot temporarily using custom files/notes router safety
          <div className="bg-neutral-950/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 px-2 py-1">Completed Directives Archive ({projectTasksCompleted.length} items)</h3>
            <div className="flex flex-col gap-2.5 mt-1">
              {projectTasksCompleted.length > 0 ? (
                projectTasksCompleted.map(t => {
                  const cat = t.category || "Operations";
                  const styles = getCategoryStyles(cat);
                  return (
                    <div 
                      key={t.id}
                      className="p-3.5 bg-[#05070f] border border-white/5 rounded-xl flex items-center justify-between gap-4 text-xs opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onToggleMasterTask(t.id, t.status)}
                          className="w-4.5 h-4.5 rounded-lg border bg-purple-500/10 border-purple-600 flex items-center justify-center text-purple-400"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <p className="font-semibold text-slate-400 line-through">{t.title}</p>
                          <span className="text-[9px] font-mono text-slate-500 mt-0.5 block">{t.id} • {t.dueDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] px-2 py-0.5 rounded border ${styles.bg} ${styles.text} ${styles.border} font-bold`}>{cat}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-xs font-mono text-slate-500 border border-dashed border-white/5 rounded-xl">
                  No completed milestones archived here yet.
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
              {projectTasksAll.map((t, idx) => {
                const isOverdue = t.status === "Overdue" || (t.dueDate < "2026-06-21" && t.status !== "Completed");
                return (
                  <div key={t.id} className="relative">
                    <div className={`absolute left-[-23px] top-1 w-3 h-3 rounded-full ${t.status === "Completed" ? "bg-emerald-500" : isOverdue ? "bg-rose-500" : "bg-purple-500"}`} />
                    <div className="text-xs">
                      <div className="flex justify-between font-mono font-semibold">
                        <span className="text-slate-400">{t.dueDate}</span>
                        <span className={`uppercase font-bold ${t.status === "Completed" ? "text-emerald-400" : isOverdue ? "text-rose-400" : "text-purple-400"}`}>
                          {t.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-semibold text-white mt-1.5">{t.title}</p>
                      {t.notes && <p className="text-[11px] text-slate-400 font-sans mt-1 leading-relaxed">{t.notes}</p>}
                    </div>
                  </div>
                );
              })}
              {projectTasksAll.length === 0 && (
                <div className="text-xs font-mono text-slate-500">No scheduled timeline dates found templates.</div>
              )}
            </div>
          </div>
        )}

        {/* FILES TAB */}
        {activeTab === "notes" && ( // files maps to completed work, and notes maps to attachments files
          <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white mb-1">Attached Assets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fileAttachments.map((f, idx) => (
                <div key={idx} className="p-4 bg-black/30 border border-white/5 hover:border-indigo-500/20 rounded-xl flex items-center justify-between gap-4 transition text-xs">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="font-semibold text-white">{f.name}</p>
                      <span className="text-[10px] text-slate-550 font-mono text-slate-500">{f.size} • Verified {f.date}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider cursor-pointer font-mono hover:text-white transition">DL</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === "overview" && ( // Simple fallback for extra routing security
          <div className="p-4 bg-[#05070f] rounded-xl border border-white/5">
            <p className="text-xs text-slate-400">Loading operational draft notes...</p>
          </div>
        )}

      </div>

    </div>
  );
}
