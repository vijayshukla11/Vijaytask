import React from "react";
import { ShieldCheck, RefreshCw, AlertTriangle, CloudRain, CheckSquare, LogOut } from "lucide-react";
import { SheetDataState } from "../types";

interface DataSyncViewProps {
  sheetData: SheetDataState | null;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  isLoading: boolean;
  onSync: () => void;
  lastSyncedTime: string;
}

export default function DataSyncView({
  sheetData,
  user,
  onLogin,
  onLogout,
  isLoading,
  onSync,
  lastSyncedTime
}: DataSyncViewProps) {
  const getRecordCount = () => {
    if (!sheetData) return 0;
    return (
      (sheetData.tasks?.length || 0) +
      (sheetData.brands?.length || 0) +
      (sheetData.dailyTasks?.length || 0) +
      (sheetData.businessAnalyst?.length || 0) +
      (sheetData.stockMarket?.length || 0) +
      (sheetData.websiteProjects?.length || 0) +
      (sheetData.kpis?.length || 0) +
      (sheetData.ideas?.length || 0)
    );
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-2xl mx-auto select-none">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Data Sync</h1>
        <p className="text-xs text-slate-400 mt-1.5 font-sans">
          Manage your cloud storage link. All actions synchronize instantly.
        </p>
      </div>

      <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${user ? "bg-emerald-500 animate-pulse" : "bg-purple-500"}`} />
            <div>
              <p className="text-sm font-semibold text-white">Connection Status</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                {user ? "Cloud Synchronized Mode" : "Local Database Mode"}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onSync}
            disabled={isLoading}
            className="p-2 hover:bg-white/5 rounded-xl border border-white/10 active:scale-95 transition text-slate-350 disabled:opacity-50 cursor-pointer"
            title="Force refresh synchronization"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col justify-between h-24">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Last Sync Time</span>
            <span className="text-base font-bold text-purple-300 font-mono mt-1">
              {lastSyncedTime || "Not Synced"}
            </span>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col justify-between h-24">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Records Synced</span>
            <span className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {getRecordCount()} objects
            </span>
          </div>
        </div>

        {user && (
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-xs text-emerald-300 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Connected with Google Accounts</p>
              <p className="text-slate-400 mt-0.5">{user.email}</p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {user ? "Cloud sync active." : "Auth is recommended for global team collaboration."}
          </span>
          {user ? (
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/15 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Auth</span>
            </button>
          ) : (
            <button 
              onClick={onLogin}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-[0_4px_15px_rgba(124,58,237,0.3)] transition cursor-pointer"
            >
              <span>Connect Google Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
