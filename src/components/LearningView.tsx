import React, { useState } from "react";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Tv,
  Award,
  Activity,
  Plus,
  Flame,
  Milestone,
  Target,
  CalendarDays,
  Sparkles,
  BookMarked
} from "lucide-react";
import { SheetDataState } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

interface LearningViewProps {
  sheetData: SheetDataState | null;
  activeBrand: string;
  setActiveBrand: (brand: string) => void;
}

export default function LearningView({
  sheetData,
  activeBrand,
  setActiveBrand
}: LearningViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "topics" | "roadmap" | "analytics">("overview");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  if (!sheetData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-xs font-mono text-slate-400">
        <Clock className="w-5 h-5 animate-spin text-purple-400" />
        Loading training portfolios...
      </div>
    );
  }

  const learningCategories = [
    "Business Analyst",
    "English Improvement",
    "Resume Development"
  ];

  const getCategoryStats = (catName: string) => {
    // Business Analyst pulls values from sheetData.businessAnalyst
    if (catName === "Business Analyst") {
      const items = sheetData.businessAnalyst || [];
      const total = items.length || 5;
      const completedList = items.filter(i => i.progress === 100);
      const pendingList = items.filter(i => i.progress < 100);
      const totalProgress = items.reduce((acc, curr) => acc + (curr.progress || 0), 0);
      const progress = total ? Math.round(totalProgress / total) : 60;
      return {
        progress,
        completed: completedList.length,
        pending: pendingList.length,
        completedList,
        pendingList,
        studyTime: "34 hours logged",
        projects: "Tableau Dashboard, SQL Retail Schema"
      };
    } else if (catName === "English Improvement") {
      return {
        progress: 85,
        completed: 12,
        pending: 3,
        completedList: [
          { topic: "Business Presentation Phrasing", progress: 100 },
          { topic: "Active Voice in Corporate Correspondence", progress: 100 }
        ],
        pendingList: [
          { topic: "Spontaneous Client Briefings", progress: 40 }
        ],
        studyTime: "18 hours logged",
        projects: "Elevator Pitch Video Simulation"
      };
    } else {
      // Resume Development
      return {
        progress: 90,
        completed: 4,
        pending: 1,
        completedList: [
          { topic: "Harvard-style Template Styling", progress: 100 },
          { topic: "Drizzle / Postgres Skill Matrix Injection", progress: 100 }
        ],
        pendingList: [
          { topic: "Automated LinkedIn Export Validation", progress: 70 }
        ],
        studyTime: "12 hours logged",
        projects: "PDF Resume Pipeline Automation"
      };
    }
  };

  // Compile overall metrics for Learning
  const baStats = getCategoryStats("Business Analyst");
  const enStats = getCategoryStats("English Improvement");
  const resStats = getCategoryStats("Resume Development");
  const overallLearningCompletion = Math.round((baStats.progress + enStats.progress + resStats.progress) / 3);

  const isGlobal = activeBrand === "Global Overview" || !learningCategories.includes(activeBrand);

  if (isGlobal) {
    return (
      <div className="flex flex-col gap-6 select-none pb-16 animate-fade-in text-xs font-sans">
        
        {/* HEADER SECTION */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block font-bold">
            Career growth engine
          </span>
          <h1 className="text-3xl font-extrabold font-display text-white mt-2">Professional Syllabus Academy</h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Curated tracking modules focused on data analytics, English presentation mastery, and corporate CV distribution pipelines.
          </p>
        </div>

        {/* CORE REQUIREMENTS IN ACTION: Career Target cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COMMANDS (5 cols) */}
          <div className="lg:col-span-5 bg-[#05070f] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-[-30%] right-[-10%] w-52 h-52 bg-emerald-600/5 rounded-full blur-[80px]" />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold">Execution metrics</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="flex items-center gap-4.5 my-3">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 flex items-center justify-center font-mono text-lg font-black text-white shrink-0 shadow-inner">
                  {overallLearningCompletion}%
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase font-mono">Academic Completion Index</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    Aggregate completion score tracked across professional training channels. Practice SQL daily.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <BookMarked className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono uppercase font-bold block">Current Module</span>
                      <span className="font-semibold text-slate-200 text-xs">SQL Multi-Table Joins & Window Functions</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Milestone className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono uppercase font-bold block">Next Module</span>
                      <span className="font-semibold text-slate-200 text-xs">A/B Testing, Cohort Analysis & Tableau Maps</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>Goal Target Pace:</span>
              <span className="text-emerald-400 font-bold uppercase">Optimal Continuous</span>
            </div>
          </div>

          {/* RIGHT COMMANDS: Streak & Goals Grid (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            
            {/* Streak card (Full width inside row layout structure) */}
            <div className="col-span-2 p-5 bg-[#05070f] border border-white/5 rounded-2xl flex items-center justify-between relative overflow-hidden h-28">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl font-bold animate-pulse">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">Interactive Streak</h4>
                  <h3 className="text-2xl font-black font-mono text-white mt-1">11 Consecutive Days</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Excellent! Daily syllabus logs synced securely to Sheets.</p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">
                Fire
              </span>
            </div>

            {/* Weekly Goal Card */}
            <div className="p-5 bg-[#05070f] border border-white/5 rounded-2xl flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono tracking-wider text-slate-500 font-bold uppercase">Weekly Goal</span>
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3">
                <h4 className="text-sm font-bold text-slate-200">10 hrs Seat Time</h4>
                <p className="text-[10px] text-slate-450 mt-1.5 leading-relaxed text-slate-400">
                  Focus on SQL queries practice inside terminal grids & English speech recordings.
                </p>
              </div>
            </div>

            {/* Monthly Goal Card */}
            <div className="p-5 bg-[#05070f] border border-white/5 rounded-2xl flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono tracking-wider text-slate-500 font-bold uppercase">Monthly Target</span>
                <CalendarDays className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-3">
                <h4 className="text-sm font-bold text-slate-200">2 Certifications Passed</h4>
                <p className="text-[10px] text-slate-450 mt-1.5 leading-relaxed text-slate-400">
                  Complete advanced analytical Case Study pipelines and dispatch active Resume variants.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* BRANDS LIST FOR SYLLABUS DIRECTIVES (3 Cards layout) */}
        <div>
          <h3 className="text-xs font-mono tracking-widest text-slate-500 uppercase font-bold mb-4">Syllabus Classrooms</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningCategories.map(cat => {
              const stats = getCategoryStats(cat);
              return (
                <div 
                  key={cat}
                  onClick={() => setActiveBrand(cat)}
                  className="bg-[#05070f] border border-white/5 hover:border-purple-500/30 rounded-2xl p-5 cursor-pointer hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between group shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-600/10 transition-colors" />
                  
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl group-hover:bg-emerald-600/20 transition">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-mono tracking-wider text-slate-500 font-bold uppercase group-hover:text-emerald-400 transition">
                        OPEN CURRICULUM →
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">{cat}</h3>
                    <p className="text-xs text-slate-405 mt-1.5 line-clamp-2 leading-relaxed text-slate-400">
                      Detailed syllabus tracks, interactive logs, study hours, and academic targets.
                    </p>

                    <div className="grid grid-cols-2 gap-2.5 my-5 text-center font-mono">
                      <div className="bg-black/35 p-2 rounded-xl border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Passed</p>
                        <p className="text-xs font-bold text-emerald-400 mt-1">{stats.completed} topics</p>
                      </div>
                      <div className="bg-black/35 p-2 rounded-xl border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Remaining</p>
                        <p className="text-xs font-bold text-slate-300 mt-1">{stats.pending} topics</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mb-1.5">
                      <span>Syllabus Mastered</span>
                      <span className="font-mono text-emerald-400 font-bold">{stats.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                        style={{ width: `${stats.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  }

  // INDIVIDUAL CATEGORY VIEW
  const catStats = getCategoryStats(activeBrand);
  const chartData = (activeBrand === "Business Analyst" && sheetData.businessAnalyst)
    ? sheetData.businessAnalyst.map(t => ({ name: t.topic?.replace("dashboarding", "") || "Query", Progress: t.progress || 0 }))
    : [
        { name: "Syllabus 1", Progress: 100 },
        { name: "Syllabus 2", Progress: 80 },
        { name: "Syllabus 3", Progress: 40 }
      ];

  return (
    <div className="flex flex-col gap-6 select-none pb-16 animate-fade-in text-xs font-sans">
      
      {/* Header with escape back route */}
      <div className="flex items-center gap-4 text-xs">
        <button 
          onClick={() => setActiveBrand("Global Overview")}
          className="p-2.5 bg-neutral-950 hover:bg-neutral-900 border border-white/5 hover:border-white/10 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">Professional Training</span>
          <h1 className="text-2xl font-bold font-display text-white mt-0.5">{activeBrand}</h1>
        </div>
      </div>

      {/* Numerical Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Execution Progress", value: `${catStats.progress}%`, sub: "Mastery Index", color: "text-emerald-400" },
          { label: "Completed Topics", value: catStats.completed, sub: "Passed milestones", color: "text-indigo-400" },
          { label: "Incomplete Syllabus", value: catStats.pending, sub: "Remaining work", color: "text-amber-400" },
          { label: "Study Investment", value: catStats.studyTime.split(" ")[0] + " hrs", sub: "Time on seat", color: "text-slate-300" }
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

      {/* Tabs */}
      <div className="flex border-b border-white/5 pb-0.5 gap-2.5">
        {(["overview", "topics", "roadmap", "analytics"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold capitalize border-b-2 transition duration-200 cursor-pointer border-none bg-transparent ${activeTab === tab ? "border-emerald-500 text-white animate-pulse" : "border-transparent text-slate-450 hover:text-slate-100"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-2 min-h-[250px]">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-white">Syllabus Overview</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                This certification roadmap outlines target qualifications, study hours, and real-time execution steps. By syncing directly with Google Sheets logs, we can maintain study consistency and log progress after finishing SQL queries, tableau mockups, and writing resumes.
              </p>
              
              <div className="mt-2 p-3 bg-neutral-950/40 rounded-xl border border-white/5 text-xs text-slate-300">
                <span className="font-semibold text-white block text-xs">Active Projects:</span>
                <span className="text-slate-400 text-[11px] block mt-1">{catStats.projects}</span>
              </div>
            </div>

            <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Weekly Focus</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
                  Dedicate at least 3 to 4 hours weekly to practice core objectives, review study cards, and build fast prototypes on localhost.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Milestone Certification status:</span>
                <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider text-[10px]">IN PROGRESS</span>
              </div>
            </div>
          </div>
        )}

        {/* TOPICS */}
        {activeTab === "topics" && (
          <div className="bg-neutral-950/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-2.5 text-xs">
            <h3 className="text-xs font-mono font-bold text-slate-450 uppercase tracking-widest px-1">Curriculum topics</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
              {/* Completed */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 font-mono block uppercase">Completed Topics ({catStats.completed})</span>
                {catStats.completedList.length > 0 ? (
                  catStats.completedList.map((t, idx) => (
                    <div key={idx} className="p-3 bg-[#05070f] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-300">{t.topic}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">100%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 font-mono italic">No topics marked as passed.</p>
                )}
              </div>

              {/* Pending */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-amber-400 font-mono block uppercase">Pending Topics ({catStats.pending})</span>
                {catStats.pendingList.length > 0 ? (
                  catStats.pendingList.map((t, idx) => (
                    <div key={idx} className="p-3 bg-[#05070f] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-200">{t.topic}</span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">{t.progress}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 font-mono italic">All topics successfully completed!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ROADMAP */}
        {activeTab === "roadmap" && (
          <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 text-xs">
            <h3 className="text-sm font-semibold text-white mb-4">Milestone Roadmap</h3>
            <div className="flex flex-col gap-6 pl-4 border-l-2 border-white/5">
              <div className="relative">
                <div className="absolute left-[-23px] top-1 w-3 h-3 rounded-full bg-emerald-500" />
                <div>
                  <span className="font-mono text-slate-400 text-[10px]">Phase 1: Basic Foundations</span>
                  <p className="font-semibold text-slate-200 mt-1">Foundational schemas and phrasing worksheets</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-[-23px] top-1 w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <span className="font-mono text-slate-400 text-[10px]">Phase 2: Complex Execution</span>
                  <p className="font-semibold text-slate-100 mt-1 mt-1">Multi-stage cohort calculations & mock presentation records</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-[-23px] top-1 w-3 h-3 rounded-full bg-white/10" />
                <div>
                  <span className="font-mono text-slate-500 text-[10px]">Phase 3: Active Portfolio Delivery</span>
                  <p className="font-semibold text-slate-500 mt-1">Dissemination across LinkedIn indexes and recruiters</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="bg-[#05070f] border border-white/5 p-6 rounded-2xl h-64 flex flex-col gap-4 text-xs">
            <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Acquisition Progress Curve</h4>
            <p className="text-[10px] text-slate-500 font-sans -mt-2">Real-time representation of progress checkpoints.</p>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#05060b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "10px" }} />
                  <Area type="monotone" dataKey="Progress" stroke="#10b981" fill="rgba(16, 185, 129, 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
