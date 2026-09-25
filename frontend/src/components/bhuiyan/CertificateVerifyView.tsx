import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, FileText, QrCode, ArrowLeft } from 'lucide-react';

interface CertificateVerifyViewProps {
  hashParam?: string;
  onBack?: () => void;
}

export const CertificateVerifyView: React.FC<CertificateVerifyViewProps> = ({
  hashParam,
  onBack
}) => {
  const [inputHash, setInputHash] = useState(hashParam || '');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hashParam) {
      verifyHash(hashParam);
    }
  }, [hashParam]);

  const verifyHash = async (hashVal: string) => {
    if (!hashVal.trim()) return;
    setLoading(true);
    try {
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_BASE_URL}/api/v1/certificates/verify/${encodeURIComponent(hashVal.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ verified: false, message: "Server network error during verification." });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyHash(inputHash);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 lg:p-8 flex flex-col justify-center items-center selection:bg-emerald-600 selection:text-white">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portal
          </button>
        )}

        <div className="flex items-center space-x-3">
          <img
            src={`${(import.meta as any).env?.BASE_URL || './'}logo.png`}
            onError={(e) => { (e.target as HTMLImageElement).src = `${(import.meta as any).env?.BASE_URL || './'}logo.svg`; }}
            alt="BHOOMI SETU"
            className="w-12 h-12 rounded-2xl object-contain bg-slate-900 p-0.5 shadow-lg border border-emerald-500/30"
          />
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">BHUMISETU</h1>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              State Land Certificate Authentication Portal
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Enter Certificate Cryptographic Hash (SHA-256)
          </label>
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputHash}
              onChange={(e) => setInputHash(e.target.value)}
              placeholder="Paste SHA-256 hash or scan QR code..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow"
            >
              {loading ? 'Verifying...' : 'Verify Hash'}
            </button>
          </form>
        </div>

        {/* Verification Result Panel */}
        {result && (
          <div className={`p-5 rounded-2xl border ${
            result.verified
              ? 'bg-emerald-950/60 border-emerald-500/50 text-slate-100'
              : 'bg-rose-950/60 border-rose-500/50 text-slate-100'
          } space-y-3`}>
            <div className="flex items-center gap-2">
              {result.verified ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              )}
              <h2 className="text-base font-bold">
                {result.verified ? 'CERTIFICATE AUTHENTIC & VALID' : 'FORGERY WARNING / UNVERIFIED HASH'}
              </h2>
            </div>

            <p className="text-xs text-slate-300">{result.message}</p>

            {result.verified && (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Certificate Type</span>
                  <span className="font-bold text-emerald-300">{result.certificate_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Issued To</span>
                  <span className="font-bold text-white">{result.issued_to}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Parcel & Khasra No</span>
                  <span className="font-bold text-white">{result.khasra_no} ({result.parcel_id})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">District</span>
                  <span className="font-bold text-amber-300">{result.district}, Chhattisgarh</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">Digital Signature</span>
                  <span className="font-mono text-[10px] text-slate-300">{result.digital_signature}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
