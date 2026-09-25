import React, { useEffect, useState } from 'react';

export const SplashLoader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 900ms pulse animation, then 300ms fade-out = 1.2s total
    const timer1 = setTimeout(() => {
      setFading(true);
    }, 900);

    const timer2 = setTimeout(() => {
      onComplete();
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 blur-xl animate-pulse" />
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="BHOOMI SETU Emblem"
            className="w-24 h-24 rounded-3xl object-contain bg-slate-900 p-2 shadow-2xl border-2 border-emerald-500/50 animate-emblem-pulse relative z-10"
            onError={(e: any) => { e.target.src = `${import.meta.env.BASE_URL}logo.svg`; }}
          />
        </div>
        <div className="text-center space-y-1 z-10">
          <h1 className="text-2xl font-black tracking-tight text-white">BHOOMI SETU</h1>
          <p className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">
            SIH26019 • Land Governance Intelligence
          </p>
        </div>
      </div>
    </div>
  );
};
