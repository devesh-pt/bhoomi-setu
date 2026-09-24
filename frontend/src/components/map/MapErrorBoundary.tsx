import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  zoom?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[MapErrorBoundary] Caught error at zoom level ${this.props.zoom ?? 'N/A'}:`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[400px] bg-slate-950 flex flex-col items-center justify-center p-6 border border-rose-500/30 rounded-xl text-center text-slate-200 z-10 relative select-none">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mb-4 text-rose-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">GIS Map Rendering Error</h3>
          <p className="text-xs text-rose-300 font-mono bg-rose-950/60 px-3 py-1.5 rounded-md border border-rose-800/40 mb-4 max-w-md truncate">
            {this.state.error?.message || 'An unexpected map error occurred'}
          </p>
          <p className="text-xs text-slate-400 mb-5 max-w-sm">
            Zoom level: <strong className="text-amber-400">{this.props.zoom ?? 'Unknown'}</strong>. The map hit an unexpected condition. You can retry map rendering without losing your session.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg hover:shadow-emerald-600/30 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Map</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
