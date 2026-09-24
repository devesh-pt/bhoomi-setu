import React, { useState } from 'react';
import { Bot, Send, Sparkles, BookOpen, ShieldAlert, FileText, ChevronRight, RefreshCw, Trash2 } from 'lucide-react';
import { BhoomiChatMessage } from '../../types';
import { BhoomiService } from '../../services/api';

interface BhoomiAIViewProps {
  onNavigateResearch?: (docId: string) => void;
  onNavigateProject?: (projectId: string) => void;
}

export const BhoomiAIView: React.FC<BhoomiAIViewProps> = ({ onNavigateResearch, onNavigateProject }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<BhoomiChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: "Namaste! I am **BHOOMI AI**, your intelligent assistant for land governance research, policy innovation, and evidence-based decision support. How can I assist your analysis today?",
      timestamp: '09:00 AM',
    }
  ]);

  const suggestedQuestions = [
    'Why are land acquisition projects delayed?',
    'Show high-risk projects in Chhattisgarh.',
    'What are the major causes of compensation delays?',
    'Find research related to land acquisition disputes.',
    'Compare land acquisition timelines between states.'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: BhoomiChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await BhoomiService.askBhoomiAI(query);
      setMessages((prev) => [...prev, aiResponse]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-slate-100 max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>BHOOMI AI</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full uppercase">
                RAG Engine
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Your intelligent assistant for land governance research and policy insights
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Questions Pills */}
      <div className="mb-4 overflow-x-auto pb-1 flex items-center space-x-2 scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Suggested:
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-900 rounded-2xl text-xs font-semibold shrink-0 transition shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 overflow-y-auto space-y-4 shadow-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-3xl p-4 sm:p-5 shadow-xs ${
                m.sender === 'user'
                  ? 'bg-blue-900 text-white rounded-br-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-bl-none'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  {m.sender === 'user' ? 'You' : 'BHOOMI AI RAG Response'}
                </span>
                <span className="text-[10px] opacity-60">{m.timestamp}</span>
              </div>

              {/* Text Output */}
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
                {m.text}
              </div>

              {/* Grounded Source References */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-600" />
                    <span>Grounded RAG Sources & Citations:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.sources.map((src, sIdx) => (
                      <div
                        key={sIdx}
                        onClick={() => {
                          if (src.type === 'Research' && onNavigateResearch) {
                            onNavigateResearch(src.id);
                          } else if (src.type === 'Project' && onNavigateProject) {
                            onNavigateProject(src.id);
                          }
                        }}
                        className="p-2.5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 cursor-pointer transition flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          {src.type === 'Research' ? (
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          ) : (
                            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                          )}
                          <div className="truncate">
                            <h5 className="text-xs font-bold text-slate-900 truncate">{src.title}</h5>
                            <span className="text-[9px] text-slate-400 font-semibold uppercase">{src.type} Citation</span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer Tag */}
              {m.sender === 'ai' && (
                <div className="mt-3 text-[10px] text-slate-400 italic">
                  Prototype AI Response — Not official government advice.
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-4 rounded-3xl rounded-bl-none flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>BHOOMI AI is indexing research vector embeddings...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="mt-4 bg-white p-3 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask BHOOMI AI about land acquisition delays, legal disputes, compensation policy..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-transparent px-3 text-xs sm:text-sm focus:outline-none text-slate-900"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="p-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-2xl shadow-md transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
