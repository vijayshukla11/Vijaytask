import React, { useState } from "react";
import { 
  Lightbulb, 
  AlertTriangle, 
  Plus, 
  Check, 
  Clock, 
  FolderMinus, 
  HelpCircle,
  FolderPlus
} from "lucide-react";
import { SheetDataState, IdeaOrProblem } from "../types";

interface IdeasViewProps {
  sheetData: SheetDataState | null;
  onAddIdea: (idea: IdeaOrProblem) => void;
}

export default function IdeasView({ sheetData, onAddIdea }: IdeasViewProps) {
  const [type, setType] = useState<"Idea" | "Problem">("Idea");
  const [detail, setDetail] = useState("");
  const [associatedBrand, setAssociatedBrand] = useState("Clinza Ecommerce");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!sheetData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-xs font-mono text-slate-400">
        <Clock className="w-5 h-5 animate-spin text-purple-400" />
        Synchronizing system innovation logs...
      </div>
    );
  }

  const ideasList = sheetData.ideas || [
    { type: "Idea", detail: "Launch a loyalty point system for Clinza loyalists.", associatedBrand: "Clinza Ecommerce", status: "Open" },
    { type: "Problem", detail: "Love & Latte checkout loading times exceed 4 seconds.", associatedBrand: "Love & Latte", status: "Open" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail.trim()) return;

    setIsSubmitting(true);
    const newIdea: IdeaOrProblem = {
      type,
      detail,
      associatedBrand,
      status: "Open"
    };

    onAddIdea(newIdea);
    setDetail("");
    setTimeout(() => {
      setIsSubmitting(false);
    }, 800);
  };

  const ideasCount = ideasList.filter(i => i.type === "Idea").length;
  const problemsCount = ideasList.filter(i => i.type === "Problem").length;

  return (
    <div className="flex flex-col gap-8 pb-16 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Innovation Logs & Bottlenecks</h1>
        <p className="text-xs text-slate-400 mt-1">
          Catalog system ideas and record blocking problems for Vijay Shukla's business ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Log Form column */}
        <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 h-fit">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5">
            <FolderPlus className="w-4 h-4 text-purple-400" />
            <span>Log Idea or Problem</span>
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Log Entry Type</label>
              <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 border border-white/10 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setType("Idea")}
                  className={`py-2 rounded-lg font-semibold transition ${type === "Idea" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  💡 Smart Idea
                </button>
                <button 
                  type="button"
                  onClick={() => setType("Problem")}
                  className={`py-2 rounded-lg font-semibold transition ${type === "Problem" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  ⚠️ Critical Problem
                </button>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Detail Specifications</label>
              <textarea 
                value={detail}
                onChange={e => setDetail(e.target.value)}
                placeholder={type === "Idea" ? "Log design workflow enhancements, sales triggers, etc..." : "Explain checkout bugs, logistics delay factors, etc..."}
                rows={4}
                className="w-full p-2.5 bg-neutral-950 border border-white/10 focus:border-purple-500 rounded-xl text-white outline-none resize-none transition"
              />
            </div>

            <div>
              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Associated Brand</label>
              <select 
                value={associatedBrand}
                onChange={e => setAssociatedBrand(e.target.value)}
                className="p-2.5 bg-neutral-950 border border-white/10 focus:border-purple-500 rounded-xl text-xs text-white outline-none w-full"
              >
                {[
                  "Clinza Ecommerce", "Clinza Social Media", "JustMySalad", "Love & Latte", 
                  "JustMySalad Vending", "Nymi Vending", "Shiprocket", "Bharatika News", 
                  "AI Projects", "Stock Market", "English Improvement"
                ].map(b => (
                  <option key={b} value={b} className="bg-neutral-950 text-white">{b}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? "Syncing row item..." : "Fulfill Log Entry"}
            </button>
          </form>
        </div>

        {/* Existing Logs List Column */}
        <div className="lg:col-span-2 bg-[#05070f] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Innovation & Bottleneck Backlog</h3>
            <div className="flex gap-2 text-[10px] font-mono">
              <span className="bg-purple-500/10 border border-purple-500/25 px-2 py-0.5 rounded text-purple-400 font-bold">Ideas: {ideasCount}</span>
              <span className="bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded text-rose-400 font-bold">Problems: {problemsCount}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
            {ideasList.map((item, index) => {
              const isIdea = item.type === "Idea";
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-xl border flex gap-3.5 items-start ${isIdea ? "bg-purple-950/5 border-purple-500/15" : "bg-rose-950/5 border-rose-500/15"}`}
                >
                  <div className={`p-2 rounded-lg mt-0.5 ${isIdea ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                    {isIdea ? <Lightbulb className="w-4.5 h-4.5" /> : <AlertTriangle className="w-4.5 h-4.5 animate-pulse" />}
                  </div>
                  
                  <div className="flex-1 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-slate-200 block text-xs">{item.associatedBrand}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase rounded ${item.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {item.status || "Open"}
                      </span>
                    </div>
                    <p className="text-slate-350 text-xs mt-2 leading-relaxed font-sans">{item.detail}</p>
                    <div className="flex gap-2 items-center text-[9px] text-slate-500 mt-3 font-mono">
                      <span>TYPE: {item.type.toUpperCase()}</span>
                      <span>•</span>
                      <span>STATUS: {item.status?.toUpperCase() || "OPEN"}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {ideasList.length === 0 && (
              <div className="text-slate-500 py-16 text-center text-xs font-mono">
                No ideas or problems recorded on sheet logs. Submit one!
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
