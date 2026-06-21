import React, { useState } from "react";
import { 
  Home, 
  Briefcase, 
  Rocket, 
  BookOpen, 
  TrendingUp, 
  ClipboardList, 
  Lightbulb, 
  Bot, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Menu,
  X,
  Plus,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeBrand: string;
  setActiveBrand: (brand: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onAddTask: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeBrand,
  setActiveBrand,
  isOpen,
  setIsOpen,
  onAddTask
}: SidebarProps) {
  // Submenu open states
  const [businessOpen, setBusinessOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [learningOpen, setLearningOpen] = useState(true);
  const [tradingOpen, setTradingOpen] = useState(true);

  const businessBrands = [
    "Clinza Ecommerce",
    "Clinza Social Media",
    "JustMySalad",
    "Love & Latte",
    "JustMySalad Vending",
    "Nymi Vending",
    "Shiprocket"
  ];

  const projects = [
    "Bharatika News",
    "AI Projects"
  ];

  const learningRoadmaps = [
    "Business Analyst",
    "English Improvement",
    "Resume Development"
  ];

  const tradingItems = [
    "Stock Market"
  ];

  const handleBrandClick = (brandName: string, tabName: string) => {
    setActiveTab(tabName);
    setActiveBrand(brandName);
    // On mobile, auto close sidebar upon item click
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    setActiveBrand("Global Overview");
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#05070f]/95 border-r border-white/5 text-slate-200">
      {/* Brand logo header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-0.5 flex items-center justify-center font-bold text-white text-base shadow-[0_0_15px_rgba(124,58,237,0.3)]">
            VS
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white font-sans">Vijay Shukla</h1>
            <p className="text-[10px] text-purple-400 font-mono uppercase tracking-widest font-bold">Personal OS</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-1.5 hover:bg-white/5 rounded-lg text-slate-450 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main navigation links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-thin">
        {/* Home option */}
        <button
          onClick={() => handleTabClick("home")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === "home" ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/5 border border-purple-500/20 text-purple-200" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-100"}`}
        >
          <Home className={`w-4 h-4 ${activeTab === "home" ? "text-purple-400" : "text-slate-400"}`} />
          <span>Home</span>
        </button>

        {/* Business with accordion */}
        <div>
          <button
            onClick={() => handleBrandClick("Global Overview", "business")}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition ${activeTab === "business" ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/5 border border-purple-500/20 text-purple-200" : "text-slate-450 hover:bg-white/5 hover:text-slate-100"}`}
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Business</span>
            </div>
            {businessOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          
          <AnimatePresence initial={false}>
            {businessOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pl-7 pr-1 mt-1 space-y-1"
              >
                {businessBrands.map(b => (
                  <button
                    key={b}
                    onClick={() => handleBrandClick(b, "business")}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${activeBrand === b && activeTab === "business" ? "text-purple-400 bg-purple-500/5 font-semibold" : "text-slate-400 hover:text-white"}`}
                  >
                    • {b}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Projects with accordion */}
        <div>
          <button
            onClick={() => handleBrandClick("Global Overview", "projects")}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition ${activeTab === "projects" ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/5 border border-purple-500/20 text-purple-200" : "text-slate-455 hover:bg-white/5 hover:text-slate-100"}`}
          >
            <div className="flex items-center gap-3">
              <Rocket className="w-4 h-4 text-purple-400" />
              <span>Projects</span>
            </div>
            {projectsOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          <AnimatePresence initial={false}>
            {projectsOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pl-7 pr-1 mt-1 space-y-1"
              >
                {projects.map(b => (
                  <button
                    key={b}
                    onClick={() => handleBrandClick(b, "projects")}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${activeBrand === b && activeTab === "projects" ? "text-purple-400 bg-purple-500/5 font-semibold" : "text-slate-400 hover:text-white"}`}
                  >
                    • {b}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Learning with accordion */}
        <div>
          <button
            onClick={() => handleBrandClick("Global Overview", "learning")}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition ${activeTab === "learning" ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/5 border border-purple-500/20 text-purple-200" : "text-slate-450 hover:bg-white/5 hover:text-slate-100"}`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Learning</span>
            </div>
            {learningOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          <AnimatePresence initial={false}>
            {learningOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pl-7 pr-1 mt-1 space-y-1"
              >
                {learningRoadmaps.map(b => {
                  const targetBrand = b === "Business Analyst" ? "Business Analyst Learning" : b;
                  return (
                    <button
                      key={b}
                      onClick={() => handleBrandClick(targetBrand, "learning")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${activeBrand === targetBrand && activeTab === "learning" ? "text-purple-400 bg-purple-500/5 font-semibold" : "text-slate-400 hover:text-white"}`}
                    >
                      • {b}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Trading with accordion */}
        <div>
          <button
            onClick={() => handleBrandClick("Global Overview", "trading")}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition ${activeTab === "trading" ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/5 border border-purple-500/20 text-purple-200" : "text-slate-450 hover:bg-white/5 hover:text-slate-100"}`}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Trading</span>
            </div>
            {tradingOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          <AnimatePresence initial={false}>
            {tradingOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pl-7 pr-1 mt-1 space-y-1"
              >
                {tradingItems.map(b => (
                  <button
                    key={b}
                    onClick={() => handleBrandClick(b, "trading")}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${activeBrand === b && activeTab === "trading" ? "text-purple-400 bg-purple-500/5 font-semibold" : "text-slate-400 hover:text-white"}`}
                  >
                    • {b}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tasks Link */}
        <button
          onClick={() => handleTabClick("tasks")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === "tasks" ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/5 border border-purple-500/20 text-purple-200" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-100"}`}
        >
          <ClipboardList className={`w-4 h-4 ${activeTab === "tasks" ? "text-purple-400" : "text-slate-400"}`} />
          <span>Tasks</span>
        </button>

        {/* Ideas & Problems Link */}
        <button
          onClick={() => handleTabClick("ideas")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === "ideas" ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/5 border border-purple-500/20 text-purple-200" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-100"}`}
        >
          <Lightbulb className={`w-4 h-4 ${activeTab === "ideas" ? "text-purple-400" : "text-slate-400"}`} />
          <span>Ideas & Problems</span>
        </button>

        {/* AI Assistant Link */}
        <button
          onClick={() => handleTabClick("assistant")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === "assistant" ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/5 border border-purple-500/20 text-purple-200" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-100"}`}
        >
          <Bot className={`w-4 h-4 ${activeTab === "assistant" ? "text-purple-400" : "text-slate-400"}`} />
          <span>AI Assistant</span>
        </button>

        {/* Live Diagnostics Link */}
        <button
          onClick={() => handleTabClick("audit")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === "audit" ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/5 border border-purple-500/20 text-purple-200" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-100"}`}
        >
          <ShieldCheck className={`w-4 h-4 ${activeTab === "audit" ? "text-purple-400" : "text-slate-400"}`} />
          <span>Diagnostics Suite</span>
        </button>

        {/* Data Sync Link (replaces Settings) */}
        <button
          onClick={() => handleTabClick("settings")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === "settings" ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/5 border border-purple-500/20 text-purple-200" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-100"}`}
        >
          <RefreshCw className={`w-4 h-4 ${activeTab === "settings" ? "text-purple-400" : "text-slate-400"}`} />
          <span>Data Sync</span>
        </button>
      </div>

      {/* Sidebar footer action (Quick task direct trigger) */}
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={onAddTask}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.5)] active:scale-98 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Os Directive</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed top-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Slide out */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Sidebar drawer body */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-72 h-full flex flex-col z-10"
            >
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
