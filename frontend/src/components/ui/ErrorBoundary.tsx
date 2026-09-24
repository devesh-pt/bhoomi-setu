import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CRITICAL] Uncaught React Render Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-xl w-full bg-slate-900 border border-rose-500/50 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header Badge */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tight">
                  BHOOMI SETU — Application Recovery Mode
                </h1>
                <p className="text-xs text-rose-400 font-semibold mt-0.5">
                  An unexpected render exception was caught by ErrorBoundary.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Error Diagnostics:</span>
              </div>
              <p className="font-mono text-xs text-rose-300 break-words leading-relaxed font-bold">
                {this.state.error?.message || 'Unknown Application Error'}
              </p>
              {this.state.errorInfo && (
                <details className="mt-2 text-[11px] text-slate-400 font-mono">
                  <summary className="cursor-pointer hover:text-slate-200 font-semibold mb-1">
                    Component Stack Details
                  </summary>
                  <pre className="max-h-36 overflow-y-auto p-2 bg-slate-900 rounded border border-slate-800 text-[10px] text-slate-300 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleReload}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs rounded-xl transition"
              >
                Clear Cache & Reset
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
