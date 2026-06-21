import React, { useState, useEffect, useRef } from "react";
import { googleSignIn, initAuth, logout } from "./auth";
import { 
  Task, 
  BrandInfo, 
  DailyTask, 
  BusinessAnalystLearning, 
  StockMarketJournal, 
  WebsiteProject, 
  KPIMetric, 
  IdeaOrProblem,
  SheetDataState,
  ChatMessage
} from "./types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, 
  Menu, 
  X, 
  Sparkles, 
  Terminal, 
  MessageSquare, 
  Check, 
  Clock, 
  Grid,
  TrendingUp,
  Briefcase
} from "lucide-react";

// Sub views imports
import Sidebar from "./components/Sidebar";
import HomeView from "./components/HomeView";
import TaskView from "./components/TaskView";
import IdeasView from "./components/IdeasView";
import AiAssistantView from "./components/AiAssistantView";
import BusinessView from "./components/BusinessView";
import ProjectsView from "./components/ProjectsView";
import LearningView from "./components/LearningView";
import TradingView from "./components/TradingView";
import DataSyncView from "./components/DataSyncView";
import AuditView from "./components/AuditView";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced");
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("");

  // Routing and portfolio filtering states
  const [activeTab, setActiveTab] = useState<string>("home");
  const [activeBrand, setActiveBrand] = useState<string>("Global Overview");
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  // Sheet Data state
  const [sheetData, setSheetData] = useState<SheetDataState | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string>("");

  // Floating Chat Assistant Orb states
  const [isOrbOpen, setIsOrbOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // New task creation state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskBrand, setNewTaskBrand] = useState("Clinza Ecommerce");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("2026-06-21");
  const [newTaskNotes, setNewTaskNotes] = useState("");

  // Insights / Briefing state
  const [ceoBriefing, setCeoBriefing] = useState<string>("");
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);

  const orbChatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll orb chat
  useEffect(() => {
    if (isOrbOpen) {
      orbChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAiTyping, isOrbOpen]);

  // Auth initialization
  useEffect(() => {
    initAuth(
      (currentUser, activeToken) => {
        setUser(currentUser);
        setToken(activeToken);
        // Persist token to active containers logic safely
        fetch("/api/save-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: activeToken })
        }).catch(e => console.error("Container token mapping alert:", e));
        loadSheetData(activeToken);
      },
      () => {
        setUser(null);
        setToken("anonymous");
        loadSheetData("anonymous");
      }
    );
  }, []);

  // Sync background loops every 8 seconds for real-time automatic refresh
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      loadSheetData(token, true);
    }, 8000);
    return () => clearInterval(interval);
  }, [token]);

  // Authenticate user via Google Accounts flow
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        await fetch("/api/save-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: result.accessToken })
        });
        loadSheetData(result.accessToken);
      }
    } catch (err) {
      console.error("Google Auth execution failing:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Signout user
  const handleGoogleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setUser(null);
      setToken("anonymous");
      loadSheetData("anonymous");
    } catch (err) {
      console.error("Google logout failure:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSheetData = async (accessToken: string, isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setSyncStatus("syncing");
    try {
      const headers: Record<string, string> = {};
      if (accessToken && accessToken !== "anonymous") {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
      const res = await fetch("/api/sheet-data", { headers });
      if (!res.ok) throw new Error("Central sheets stream parsed incorrect codes.");
      const data = await res.json();
      
      setSheetData({
        tasks: data.tasks || [],
        brands: data.brands || [],
        dailyTasks: data.dailyTasks || [],
        businessAnalyst: data.businessAnalyst || [],
        stockMarket: data.stockMarket || [],
        websiteProjects: data.websiteProjects || [],
        kpis: data.kpis || [],
        ideas: data.ideas || []
      });
      setSpreadsheetId(data.spreadsheetId);
      setSyncStatus("synced");
      setLastSyncedTime(new Date().toLocaleTimeString());
      
      // Request Briefings if not a background silent sync
      if (!isSilent) {
        loadBriefingData(accessToken);
      }

      // Welcome prompt
      if (chatMessages.length === 0) {
        setChatMessages([
          {
            id: "system-welcome",
            sender: "ai",
            text: "Initializing central AI intelligence systems... Secure sync connection with Google Sheets active. Operational parameters loaded. How can VJ AI assist you with Vijay Shukla's business operating roadmap?",
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    } catch (err) {
      console.error("Critical sheet synchronization loop alert:", err);
      setSyncStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBriefingData = async (activeToken: string) => {
    setIsBriefingLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (activeToken && activeToken !== "anonymous") {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }
      const res = await fetch("/api/ceo-briefing", { headers });
      if (res.ok) {
        const body = await res.json();
        setCeoBriefing(body.briefing);
      }
    } catch (e) {
      console.error("Retrieval of custom AI briefing failed:", e);
    } finally {
      setIsBriefingLoading(false);
    }
  };

  // Sync / write changes to the connected Google Sheets
  const handleDeleteTask = async (taskId: string) => {
    if (!sheetData) return;
    setSyncStatus("syncing");
    const updatedTasksList = sheetData.tasks.filter(t => t.id !== taskId);
    try {
      const headers = ["Task ID", "Brand", "Title", "Status", "Priority", "Due Date", "Notes", "Updated At", "Category"];
      const rows = [
        headers,
        ...updatedTasksList.map(t => [
          t.id, t.brand, t.title, t.status, t.priority, t.dueDate, t.notes, t.updatedAt, t.category || "Operations"
        ])
      ];

      const res = await fetch("/api/sync-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tab: "MASTER_TASKS", rows })
      });

      if (!res.ok) {
        const errorDetails = await res.json();
        throw new Error(errorDetails.error || "Sheet row deletion fail.");
      }
      const freshData = await res.json();
      setSheetData(prev => prev ? { ...prev, tasks: freshData.tasks || [] } : null);
      setSyncStatus("synced");
    } catch (e: any) {
      console.error("Deletion mapping error:", e);
      alert(e.message || "Credential updates require signing into your Google account.");
      setSyncStatus("error");
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!sheetData) return;
    setSyncStatus("syncing");
    
    const updatedTasksList = sheetData.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);

    try {
      const headers = ["Task ID", "Brand", "Title", "Status", "Priority", "Due Date", "Notes", "Updated At", "Category"];
      const rows = [
        headers,
        ...updatedTasksList.map(t => [
          t.id, t.brand, t.title, t.status, t.priority, t.dueDate, t.notes, t.updatedAt, t.category || "Operations"
        ])
      ];

      const res = await fetch("/api/sync-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tab: "MASTER_TASKS", rows })
      });

      if (!res.ok) {
        const errorDetails = await res.json();
        throw new Error(errorDetails.error || "Sheet writing rejected.");
      }
      const freshData = await res.json();
      setSheetData(prev => prev ? { ...prev, tasks: freshData.tasks || [] } : null);
      setSyncStatus("synced");
    } catch (e: any) {
      console.error("Fulfillment mapping error:", e);
      alert(e.message || "Write operations require clicking 'Secure Google Integration Login' in Settings.");
      setSyncStatus("error");
    }
  };

  const handleToggleMasterTask = async (taskId: string, currentStatus: string) => {
    if (!sheetData) return;
    setSyncStatus("syncing");
    
    const updatedTasksList = sheetData.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: (currentStatus === "Completed" ? "Pending" : "Completed") as any,
          updatedAt: new Date().toISOString().substring(0, 10)
        };
      }
      return t;
    });

    try {
      const headers = ["Task ID", "Brand", "Title", "Status", "Priority", "Due Date", "Notes", "Updated At", "Category"];
      const rows = [
        headers,
        ...updatedTasksList.map(t => [
          t.id, t.brand, t.title, t.status, t.priority, t.dueDate, t.notes, t.updatedAt, t.category || "Operations"
        ])
      ];

      const res = await fetch("/api/sync-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tab: "MASTER_TASKS", rows })
      });

      if (!res.ok) {
        const errPayload = await res.json();
        throw new Error(errPayload.error || "Writing state failed.");
      }
      const updated = await res.json();
      setSheetData(prev => prev ? { ...prev, tasks: updated.tasks } : null);
      setSyncStatus("synced");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Credential updates require active authentication. See Settings.");
      setSyncStatus("error");
    }
  };

  const handleToggleDailyTask = async (taskId: string, currentStatus: string) => {
    if (!sheetData) return;
    setSyncStatus("syncing");

    const updatedRoutines = sheetData.dailyTasks.map(t => {
      if (t.id === taskId) {
        const toggled = currentStatus === "Completed" ? "Pending" : "Completed";
        return {
          ...t,
          status: toggled,
          completedToday: toggled === "Completed" ? "Yes" : "No"
        } as DailyTask;
      }
      return t;
    });

    try {
      const headers = ["Task ID", "Title", "Schedule", "Status", "Completed Today"];
      const rows = [
        headers,
        ...updatedRoutines.map(r => [r.id, r.title, r.schedule, r.status, r.completedToday])
      ];

      const res = await fetch("/api/sync-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tab: "DAILY_TASKS", rows })
      });

      if (!res.ok) {
        const errorDetails = await res.json();
        throw new Error(errorDetails.error || "Master update rejected.");
      }
      const updated = await res.json();
      setSheetData(prev => prev ? { ...prev, dailyTasks: updated.dailyTasks } : null);
      setSyncStatus("synced");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Credential updates require signing into your Google account.");
      setSyncStatus("error");
    }
  };

  const handleAddIdeaDirect = async (newIdea: IdeaOrProblem) => {
    if (!sheetData) return;
    setSyncStatus("syncing");
    
    const currentList = sheetData.ideas ? [...sheetData.ideas, newIdea] : [newIdea];

    try {
      const headers = ["Type", "Detail", "Associated Brand", "Status"];
      const rows = [
        headers,
        ...currentList.map(i => [i.type, i.detail, i.associatedBrand, i.status || "Open"])
      ];

      const res = await fetch("/api/sync-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tab: "IDEAS_AND_PROBLEMS", rows })
      });

      if (!res.ok) {
        const errorDetails = await res.json();
        throw new Error(errorDetails.error || "Storage refused.");
      }
      const freshData = await res.json();
      setSheetData(prev => prev ? { ...prev, ideas: freshData.ideas || [] } : null);
      setSyncStatus("synced");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed saving idea onto cloud database.");
      setSyncStatus("error");
    }
  };

  const handleCreateTaskDirect = async () => {
    if (!newTaskTitle.trim()) return;
    setSyncStatus("syncing");

    const categoryText = newTaskBrand.toLowerCase().includes("learning") ? "Research" : "Development";
    const nextIdx = sheetData ? `MT00${sheetData.tasks.length + 1}` : "MT001";
    const newRecord: Task = {
      id: nextIdx,
      brand: newTaskBrand,
      title: newTaskTitle,
      status: "Pending",
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      notes: newTaskNotes,
      updatedAt: new Date().toISOString().substring(0, 10),
      category: categoryText
    };

    try {
      const currentTasks = sheetData ? [...sheetData.tasks, newRecord] : [newRecord];
      const headers = ["Task ID", "Brand", "Title", "Status", "Priority", "Due Date", "Notes", "Updated At", "Category"];
      const rows = [
        headers,
        ...currentTasks.map(t => [
          t.id, t.brand, t.title, t.status, t.priority, t.dueDate, t.notes, t.updatedAt, t.category || "Operations"
        ])
      ];

      const res = await fetch("/api/sync-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tab: "MASTER_TASKS", rows })
      });

      if (!res.ok) {
        const errPayload = await res.json();
        throw new Error(errPayload.error || "Sync rejected.");
      }
      const updated = await res.json();
      
      setSheetData({
        tasks: updated.tasks,
        brands: updated.brands,
        dailyTasks: updated.dailyTasks,
        businessAnalyst: updated.businessAnalyst,
        stockMarket: updated.stockMarket,
        websiteProjects: updated.websiteProjects,
        kpis: updated.kpis,
        ideas: updated.ideas
      });

      setNewTaskTitle("");
      setNewTaskNotes("");
      setIsNewTaskOpen(false);
      setSyncStatus("synced");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Google Sheets writes require signing in via Settings profile once.");
      setSyncStatus("error");
    }
  };

  // Chat with VJ AI Assistant (Full Screen / Floating Orb)
  const handleSendChat = async () => {
    if (!userPrompt.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    const sentence = userPrompt;
    setUserPrompt("");
    setIsAiTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: sentence,
          previousMessages: chatMessages.slice(-6).map(m => ({
            role: m.sender === "ai" ? "model" : "user",
            parts: [{ text: m.text }]
          }))
        })
      });

      if (!res.ok) throw new Error("Central server AI cognitive channel rejected request.");
      const reply = await res.json();

      setChatMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: "ai",
        text: reply.text,
        timestamp: new Date().toLocaleTimeString(),
        actions: reply.actions
      }]);

      if (reply.updatedData) {
        setSheetData(reply.updatedData);
        setSyncStatus("synced");
        setLastSyncedTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error(e);
      setChatMessages(prev => [...prev, {
        id: "err-sync",
        sender: "ai",
        text: "I encountered an anomaly parsing that request with Google Sheets. Please confirm authorization in Settings profile, Vijay.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] font-sans antialiased text-slate-100 flex flex-col md:flex-row">
      
      {/* 2. Responsive Side Navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeBrand={activeBrand}
        setActiveBrand={setActiveBrand}
        isOpen={isSidebarMobileOpen}
        setIsOpen={setIsSidebarMobileOpen}
        onAddTask={() => setIsNewTaskOpen(true)}
      />

      {/* Main Panel Content Wrap */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Header dashboard navigation indicator */}
        <header className="p-4.5 bg-[#05070f]/90 border-b border-white/5 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsSidebarMobileOpen(true)}
              className="lg:hidden p-1.5 hover:bg-white/5 rounded-lg text-slate-400 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 font-display text-white">
              <span className="text-[10px] font-mono tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/25 px-2 py-0.5 rounded-full uppercase font-bold">
                SYSTEM EXECUTIVE STATUS
              </span>
              <span className="text-white/20 hidden sm:inline">/</span>
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline uppercase tracking-wider">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {syncStatus === "syncing" && (
              <span className="text-[10px] font-mono text-purple-300 animate-pulse flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 animate-spin" /> WRITING Master sheet...
              </span>
            )}
            
            {syncStatus === "synced" && (
              <span className="text-[9px] font-mono text-slate-500 hidden md:inline">
                INDEXED OK: {lastSyncedTime || "AUTO"}
              </span>
            )}

            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
          </div>
        </header>

        {/* Dynamic Frame router */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === "home" && (
            <HomeView 
              sheetData={sheetData}
              activeBrand={activeBrand}
              setActiveBrand={setActiveBrand}
              onToggleMasterTask={handleToggleMasterTask}
              onToggleDailyTask={handleToggleDailyTask}
              onAddTask={() => setIsNewTaskOpen(true)}
              onAddIdeaDirect={(detail) => handleAddIdeaDirect({ type: "Idea", detail, associatedBrand: "Global Overview", status: "Open" })}
              onUpdateTask={handleUpdateTask}
            />
          )}

          {activeTab === "business" && (
            <BusinessView 
              sheetData={sheetData}
              activeBrand={activeBrand}
              setActiveBrand={setActiveBrand}
              onToggleMasterTask={handleToggleMasterTask}
              onAddTask={() => setIsNewTaskOpen(true)}
            />
          )}

          {activeTab === "projects" && (
            <ProjectsView 
              sheetData={sheetData}
              activeBrand={activeBrand}
              setActiveBrand={setActiveBrand}
              onToggleMasterTask={handleToggleMasterTask}
              onAddTask={() => setIsNewTaskOpen(true)}
            />
          )}

          {activeTab === "learning" && (
            <LearningView 
              sheetData={sheetData}
              activeBrand={activeBrand}
              setActiveBrand={setActiveBrand}
            />
          )}

          {activeTab === "trading" && (
            <TradingView 
              sheetData={sheetData}
            />
          )}

          {activeTab === "tasks" && (
            <TaskView 
              sheetData={sheetData}
              onToggleMasterTask={handleToggleMasterTask}
              onUpdateTask={handleUpdateTask}
              onAddTask={() => setIsNewTaskOpen(true)}
            />
          )}

          {activeTab === "ideas" && (
            <IdeasView 
              sheetData={sheetData}
              onAddIdea={handleAddIdeaDirect}
            />
          )}

          {activeTab === "assistant" && (
            <AiAssistantView 
              chatMessages={chatMessages}
              userPrompt={userPrompt}
              setUserPrompt={setUserPrompt}
              onSendChat={handleSendChat}
              isAiTyping={isAiTyping}
            />
          )}

          {activeTab === "audit" && (
            <AuditView 
              sheetData={sheetData}
              token={token}
              onRefresh={async () => {
                await loadSheetData(token || "anonymous");
              }}
            />
          )}

          {activeTab === "settings" && (
            <DataSyncView 
              sheetData={sheetData}
              user={user}
              onLogin={handleGoogleLogin}
              onLogout={handleGoogleLogout}
              isLoading={isLoading}
              lastSyncedTime={lastSyncedTime}
              onSync={() => loadSheetData(token || "anonymous")}
            />
          )}
        </main>

        {/* 3. AI COGNITIVE FLOATING ORB ASSISTANT PANEL */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3.5">
          <AnimatePresence>
            {isOrbOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-[320px] sm:w-[380px] h-[480px] rounded-2xl bg-[#04060b]/98 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col backdrop-blur-xl"
              >
                {/* Panel Header */}
                <div className="p-3.5 bg-white/5 border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-semibold text-white">VJ AI Advisor</h4>
                      <span className="text-[8px] text-slate-500 font-mono">Operations Pipeline Active</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOrbOpen(false)}
                    className="p-1 hover:bg-white/10 rounded text-slate-400 text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Orb chat logs stack */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}>
                      <div className={`p-3 rounded-xl text-xs leading-relaxed ${msg.sender === "user" ? "bg-purple-600 text-white font-medium" : "bg-white/5 border border-white/5 text-slate-250 text-slate-250"}`}>
                        {msg.text}
                        
                        {msg.actions && msg.actions.map((act, idx) => (
                          <div key={idx} className="mt-2 p-1.5 rounded bg-black/40 border border-purple-500/20 text-[9px] text-purple-300 font-mono flex items-center gap-1.5 leading-none">
                            <Terminal className="w-3 h-3 text-purple-400" />
                            <span>Executed action: {act.type.toUpperCase()} on {act.sheet}</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-[8px] text-slate-550 mt-1 font-mono">{msg.timestamp}</span>
                    </div>
                  ))}

                  {isAiTyping && (
                    <div className="flex gap-1.5 self-start items-center bg-white/5 border border-white/5 px-3 py-2 rounded-xl">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-200" />
                    </div>
                  )}
                  <div ref={orbChatEndRef} />
                </div>

                {/* Input block */}
                <div className="p-3 border-t border-white/5 flex gap-1.5 bg-neutral-950">
                  <input 
                    type="text" 
                    value={userPrompt}
                    onChange={e => setUserPrompt(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendChat()}
                    placeholder="Ask VJ AI directive..."
                    className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                  <button 
                    onClick={handleSendChat}
                    className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Orb Activator Trigger button */}
          <button 
            onClick={() => setIsOrbOpen(!isOrbOpen)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)] active:scale-90 hover:scale-105 transition cursor-pointer relative group border border-white/15"
          >
            <div className="absolute inset-0 rounded-full bg-purple-550/20 blur-md group-hover:bg-purple-550/40 transition" />
            <Sparkles className="w-5.5 h-5.5 text-white relative animate-pulse" />
          </button>
        </div>

        {/* DIALOG FOR MANUAL DIRECTIVE ENTRY */}
        <AnimatePresence>
          {isNewTaskOpen && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-neutral-950 border border-white/10 w-full max-w-sm p-6 rounded-2xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                  <h4 className="text-xs font-semibold text-white uppercase font-mono tracking-wider">Inject Manual Operations Directive</h4>
                  <button 
                    onClick={() => setIsNewTaskOpen(false)}
                    className="text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-4 text-xs">
                  <div>
                    <label className="text-[9px] text-slate-450 font-mono block mb-1 uppercase tracking-wider font-bold">Brand Portfolio Segment</label>
                    <select 
                      value={newTaskBrand} 
                      onChange={e => setNewTaskBrand(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-purple-500 outline-none rounded-xl p-2.5 text-white"
                    >
                      {[
                        "Clinza Ecommerce", "Clinza Social Media", "JustMySalad", "Love & Latte", 
                        "JustMySalad Vending", "Nymi Vending", "Shiprocket", "Bharatika News", 
                        "AI Projects", "Business Analyst Learning", "Stock Market", "Resume Development"
                      ].map(b => (
                        <option key={b} value={b} className="bg-neutral-950 text-white">{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-450 font-mono block mb-1 uppercase tracking-wider font-bold">Roadmap Directive Title</label>
                    <input 
                      type="text" 
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      placeholder="e.g. Set system menus design spec"
                      className="w-full bg-white/5 border border-white/10 focus:border-purple-500 outline-none rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] text-slate-450 font-mono block mb-1 uppercase tracking-wider font-bold">Priority Status</label>
                      <select 
                        value={newTaskPriority}
                        onChange={e => setNewTaskPriority(e.target.value as any)}
                        className="w-full bg-white/5 border border-white/10 focus:border-purple-500 outline-none rounded-xl p-2.5 text-white"
                      >
                        <option value="High" className="bg-neutral-950">High</option>
                        <option value="Medium" className="bg-neutral-950">Medium</option>
                        <option value="Low" className="bg-neutral-950">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-450 font-mono block mb-1 uppercase tracking-wider font-bold">Fulfill Date</label>
                      <input 
                        type="date" 
                        value={newTaskDueDate}
                        onChange={e => setNewTaskDueDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-purple-500 outline-none rounded-xl p-2.5 text-white bg-neutral-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-450 font-mono block mb-1 uppercase tracking-wider font-bold">Reference Notes</label>
                    <textarea 
                      value={newTaskNotes}
                      onChange={e => setNewTaskNotes(e.target.value)}
                      placeholder="Operational context variables..."
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 focus:border-purple-500 outline-none p-2.5 rounded-xl text-slate-100"
                    />
                  </div>

                  <button 
                    onClick={handleCreateTaskDirect}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 active:scale-[0.98] text-white font-bold py-3 rounded-xl transition cursor-pointer mt-2"
                  >
                    Fulfill Row Injection
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
