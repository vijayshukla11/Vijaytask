import React, { useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Terminal, 
  Sparkles, 
  Mic, 
  HelpCircle,
  Clock,
  Code,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { ChatMessage } from "../types";

interface AiAssistantProps {
  chatMessages: ChatMessage[];
  userPrompt: string;
  setUserPrompt: (val: string) => void;
  onSendChat: () => void;
  isAiTyping: boolean;
}

export default function AiAssistantView({
  chatMessages,
  userPrompt,
  setUserPrompt,
  onSendChat,
  isAiTyping
}: AiAssistantProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping]);

  const recommendedPrompts = [
    "Add critical task for Clinza tomorrow: Update checkout banner",
    "Mark Clinza homepage banner completed",
    "Add new stock market log: Profit on Nifty option buying",
    "Fulfill topic SQL Joins progress to 100%"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[75vh] select-none pb-12">
      
      {/* Left info column: Guided tasks/prompt handbook */}
      <div className="bg-[#05070f] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-fit gap-6">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-2.5 border-b border-white/5 mb-4">
            <Bot className="w-5 h-5 text-purple-400" />
            <span>VJ AI Cognitive Capabilities</span>
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
            VJ AI is connected directly to your Google Sheets master database.
            It can instantly interpret your natural language directives to fetch, create, and update entries.
          </p>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">Supported Directives Examples:</span>
              <div className="space-y-2">
                {[
                  { text: 'Add high task for JustMySalad tomorrow: Update menus', label: 'Create row item' },
                  { text: 'Update Menulist task to completed', label: 'Modify status' },
                  { text: 'Log new problem: Clinza loading bug', label: 'Issue tracker' },
                  { text: 'Update business learning progress for Power Query to 85%', label: 'Set progress stats' }
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-black/35 rounded-xl border border-white/5 text-[11px]">
                    <span className="text-[8px] font-mono text-purple-400 uppercase font-bold block mb-1">{item.label}</span>
                    <span className="text-slate-300 font-medium font-sans italic">"{item.text}"</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-purple-950/10 border border-purple-500/15 rounded-xl">
          <span className="text-[10px] font-mono text-purple-300 font-bold block mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> SECURE AI COGNITIVE ORB
          </span>
          <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
            All spreadsheet action updates write instantly. The master database updates in real-time.
          </p>
        </div>
      </div>

      {/* Main chat center */}
      <div className="lg:col-span-2 bg-[#05070f] border border-white/5 rounded-2xl flex flex-col justify-between h-[75vh] overflow-hidden relative shadow-2xl">
        
        {/* Chat top info */}
        <div className="p-4.5 bg-white/5 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h4 className="text-xs font-semibold text-white">Central VJ AI Operating Panel</h4>
              <span className="text-[9px] text-slate-500 font-mono">Cognitive Google Sheet pipeline stream</span>
            </div>
          </div>
          <Bot className="w-4.5 h-4.5 text-purple-400" />
        </div>

        {/* Chat messages list */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4.5 scrollbar-thin">
          {chatMessages.map(msg => {
            const isUser = msg.sender === "user";
            return (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <div className={`p-4 rounded-2xl text-xs leading-relaxed font-sans ${isUser ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-medium shadow-[0_4px_12px_rgba(124,58,237,0.15)]' : 'bg-black/30 border border-white/5 text-slate-200'}`}>
                  {msg.text}

                  {/* Actions execution box */}
                  {msg.actions && msg.actions.map((act, idy) => (
                    <div 
                      key={idy}
                      className="mt-3 p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 text-[10px] text-emerald-300 font-mono flex items-center gap-2"
                    >
                      <Terminal className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <div>
                        <span className="font-bold">EXECTUED ENGINE ACTION:</span>
                        <span className="text-slate-400 block mt-0.5">{act.type.toUpperCase()} on target: "{act.sheet}" ({act.details})</span>
                      </div>
                    </div>
                  ))}
                </div>
                <span className="text-[8px] font-mono text-slate-500 mt-1.5">{msg.timestamp}</span>
              </div>
            );
          })}

          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Bot className="w-12 h-12 text-slate-600" />
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-400">Ready for commands, Vijay.</p>
                <p className="text-[10px] text-slate-500 font-sans mt-1">Request task changes or ask business questions.</p>
              </div>

              {/* Guide recommendations pills */}
              <div className="flex flex-wrap gap-2 justify-center max-w-md mt-4">
                {recommendedPrompts.map((p, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setUserPrompt(p)}
                    className="p-2 px-3 hover:bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/30 text-[10px] text-slate-400 font-sans active:scale-95 transition cursor-pointer text-left"
                  >
                    🚀 {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isAiTyping && (
            <div className="flex gap-2.5 self-start items-center bg-black/30 border border-white/5 px-4 py-3 rounded-2xl">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-200" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-white/5 bg-neutral-950/80 flex gap-2">
          <input 
            type="text"
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !isAiTyping && onSendChat()}
            placeholder="Type natural language command (e.g. Add high task for Clinza brand tomorrow)..."
            className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 rounded-xl px-4 py-3 text-xs text-white outline-none"
          />
          <button 
            onClick={onSendChat}
            disabled={!userPrompt.trim() || isAiTyping}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white p-3 rounded-xl transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
