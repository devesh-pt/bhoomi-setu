import React from 'react';
import { Shield, Sparkles, Map, LineChart, BookOpen, Sliders, Bot, ArrowRight, PlayCircle } from 'lucide-react';

interface WelcomeLandingProps {
  onLoginClick: () => void;
  onExploreDemoClick: () => void;
}

export const WelcomeLanding: React.FC<WelcomeLandingProps> = ({
  onLoginClick,
  onExploreDemoClick,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-5 border-b border-slate-800 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <img
            src="/logo.jpg"
            alt="BHOOMI SETU Emblem"
            className="w-10 h-10 rounded-xl object-cover shadow-lg border border-emerald-500/30"
          />
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white">BHOOMI SETU</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              National Digital Platform
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onExploreDemoClick}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold rounded-xl text-xs border border-slate-700 transition"
          >
            <PlayCircle className="w-4 h-4 text-emerald-400" />
            <span>Explore Demo</span>
          </button>

          <button
            onClick={onLoginClick}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
          >
            Portal Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-20 text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-bold mb-6">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Smart India Hackathon 2026 Problem Statement SIH26019</span>
        </div>

        <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
          Connecting Land, Research, Policy & Intelligence
        </h1>

        <p className="mt-6 text-lg lg:text-xl text-slate-300 max-w-3xl font-normal leading-relaxed">
          An AI-powered national digital platform for evidence-based land governance, research discovery, geospatial intelligence, and predictive decision support across India.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={onLoginClick}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm shadow-xl flex items-center justify-center space-x-2 transition"
          >
            <span>Access Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreDemoClick}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-2xl text-sm shadow-xl flex items-center justify-center space-x-2 transition"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Launch Guided Demo</span>
          </button>
        </div>

        {/* Core Pillars Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl w-full text-left">
          <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
            <Map className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-sm font-bold text-white">GIS Land Intelligence</h3>
            <p className="text-xs text-slate-400 mt-1">Multi-layer spatial audits of land use, forest cover & acquisition corridors.</p>
          </div>

          <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
            <LineChart className="w-6 h-6 text-blue-400 mb-3" />
            <h3 className="text-sm font-bold text-white">Predictive Risk ML</h3>
            <p className="text-xs text-slate-400 mt-1">0–100 Delay risk score, litigation forecast & actionable recommendations.</p>
          </div>

          <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
            <Sliders className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="text-sm font-bold text-white">Policy Lab Simulator</h3>
            <p className="text-xs text-slate-400 mt-1">Simulate compensation multipliers & legal dispute impacts in real-time.</p>
          </div>

          <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
            <Bot className="w-6 h-6 text-purple-400 mb-3" />
            <h3 className="text-sm font-bold text-white">BHOOMI AI Assistant</h3>
            <p className="text-xs text-slate-400 mt-1">Grounded RAG intelligence referencing research papers & statutory clauses.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Government-Grade National Prototype for SIH 2026</span>
        </div>
      </footer>
    </div>
  );
};
