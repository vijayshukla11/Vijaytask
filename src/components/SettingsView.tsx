import React, { useState } from "react";
import { 
  Settings, 
  Database, 
  User, 
  ShieldCheck, 
  LogOut, 
  RefreshCw, 
  CheckCircle2, 
  Grid,
  Link2,
  FileCheck,
  Sparkles
} from "lucide-react";
import { SheetDataState } from "../types";

interface SettingsViewProps {
  sheetData: SheetDataState | null;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  isLoading: boolean;
  onSync: () => void;
}

export default function SettingsView({
  sheetData,
  user,
  onLogin,
  onLogout,
  isLoading,
  onSync
}: SettingsViewProps) {
  const [profileName, setProfileName] = useState("Vijay Shukla");
  const [profileRole, setProfileRole] = useState("Managing Director & CEO");
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSavedMsg(true);
    setTimeout(() => {
      setShowSavedMsg(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8 pb-16 select-none max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-white">System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure user profile variables, synchronize connected storage endpoints, and inspect system integrity parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Card Form */}
        <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 pb-2.5 border-b border-white/5">
            <User className="w-4 h-4 text-purple-400" />
            <span>CEO Core Identity Profile</span>
          </h3>

          <form onSubmit={saveProfile} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
              <input 
                type="text"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                className="w-full p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Operational Title</label>
              <input 
                type="text"
                value={profileRole}
                onChange={e => setProfileRole(e.target.value)}
                className="w-full p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white outline-none"
              />
            </div>

            <div className="flex items-center justify-between mt-1">
              <button 
                type="submit"
                className="px-4 py-2 text-xs bg-purple-600 hover:bg-purple-500 font-semibold text-white rounded-xl transition cursor-pointer"
              >
                Save Identity
              </button>
              
              {showSavedMsg && (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Identity updated!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Database Credentials Sync Card */}
        <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-5">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 pb-2.5 border-b border-white/5 mb-4">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Durable Cloud Spreadsheet integration</span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
              VijayOS uses your private <strong>Google Sheet</strong> as the single database system source-of-truth.
              Data writes edit the cloud in real-time. Connect your account to enable write privileges.
            </p>

            <div className="bg-black/35 p-4 rounded-xl border border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold font-mono text-[9px] uppercase">Storage connection</span>
                {user ? (
                  <span className="text-emerald-400 font-semibold font-mono flex items-center gap-1 text-[10px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> ACCOUNT SECURED
                  </span>
                ) : (
                  <span className="text-indigo-400 font-semibold font-mono flex items-center gap-1 text-[10px]">
                    <Link2 className="w-3.5 h-3.5" /> SECURE PUBLIC API FALLBACK
                  </span>
                )}
              </div>

              {user && (
                <div className="text-slate-350 text-[11px]">
                  <p className="font-semibold text-white">Gmail Access Point:</p>
                  <p className="text-slate-450 mt-0.5 text-slate-400 truncate">{user.email || "Vijay Shukla Account"}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {user ? (
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-xl text-xs font-semibold text-rose-400 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Auth</span>
              </button>
            ) : (
              <button 
                onClick={onLogin}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold text-white transition cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Secure Google Integration Login</span>
              </button>
            )}

            <button 
              onClick={onSync}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-white/5 rounded-xl text-xs font-semibold text-purple-300 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
              <span>Full Refetch</span>
            </button>
          </div>
        </div>

      </div>

      {/* Database stats and specifications */}
      <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Ecosystem Database Record Metrics</span>
        </h3>

        {sheetData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {[
              { label: "Active Project Roadmaps", count: sheetData.tasks.length },
              { label: "Habit Operations Routine Logs", count: sheetData.dailyTasks.length },
              { label: "BA Syllabus Roadmaps", count: sheetData.businessAnalyst.length },
              { label: "Trading Journals Count", count: sheetData.stockMarket.length },
            ].map((stat, idx) => (
              <div key={idx} className="bg-black/30 p-4 border border-white/5 rounded-xl">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-1">{stat.label}</span>
                <span className="text-base font-bold text-white font-mono">{stat.count} rows indexed</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-mono">Statistical data parameters offline until full pipeline synchronization completes...</p>
        )}
      </div>

    </div>
  );
}
