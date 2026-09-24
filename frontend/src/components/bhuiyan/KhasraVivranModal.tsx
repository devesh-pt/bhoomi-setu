import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, ShieldCheck, QrCode, FileText, AlertTriangle } from 'lucide-react';

interface KhasraVivranModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: any | null;
}

export const KhasraVivranModal: React.FC<KhasraVivranModalProps> = ({
  isOpen,
  onClose,
  parcel
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save current active element to restore focus when modal closes
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Lock background page scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Set focus inside modal (X button) after mounting
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    // Keyboard handling: Esc key to close & Focus trap inside modal dialog
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);

      // Restore focus to previous element
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !parcel) return null;

  const areaSqFt = parcel.area_sqm ? Math.round(parcel.area_sqm * 10.7639) : Math.round(parcel.area_hectares * 107639);
  const totalValLakhs = (parcel.area_hectares * (parcel.market_value_per_ha || 15)).toFixed(2);
  const hashString = `BHOOMI-CG-${parcel.parcel_id}-${parcel.khasra_no}-VERIFIED`;

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cadastral-modal-title"
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col print:m-0 print:w-full print:max-w-none print:shadow-none print:border-none print:max-h-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header Bar - Hidden on Print */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center sticky top-0 z-20 shrink-0 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5 pr-2">
            <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 id="cadastral-modal-title" className="font-bold text-sm sm:text-base truncate">
              खसरा विवरण (P-II) — Printable Official Extract
            </h3>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close record"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-y-auto flex-1 print:p-4 print:overflow-visible">
          {/* DEMO DATA Ribbon / Badge */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center justify-between gap-3 text-amber-800 dark:text-amber-300 text-xs font-medium">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>प्रदर्शनात्मक डेटा - कृत्रिम अभिलेख (DEMO DATA - synthetic record)</span>
            </div>
            <span className="bg-amber-500/20 text-amber-900 dark:text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase shrink-0">
              DEMO DATA
            </span>
          </div>

          {/* Government Header */}
          <div className="text-center border-b-2 border-emerald-800 pb-4 space-y-1">
            <div className="flex justify-center items-center gap-3">
              <img src="/logo.svg" alt="Logo" className="w-10 h-10 object-contain" onError={(e: any) => e.target.style.display='none'} />
              <div>
                <h1 className="text-xl font-extrabold text-emerald-950 dark:text-emerald-400 tracking-wide">छत्तीसगढ़ शासन / Govt of Chhattisgarh</h1>
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">राजस्व एवं आपदा प्रबंधन विभाग (Bhuiyan Portal Sync)</h2>
              </div>
            </div>
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 pt-1">
              अभिलेख प्रपत्र पी-II (खसरा) / Authenticated Cadastral Record Extract
            </p>
          </div>

          {/* Location Hierarchy Bar */}
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-300 dark:border-slate-700 grid grid-cols-3 text-center text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">जिला / District:</span>
              <span className="text-slate-900 dark:text-white font-bold">{parcel.district_hi || parcel.district} ({parcel.district})</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">तहसील / Tehsil:</span>
              <span className="text-slate-900 dark:text-white font-bold">{parcel.tehsil_hi || parcel.tehsil || parcel.district}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">ग्राम / Village:</span>
              <span className="text-emerald-800 dark:text-emerald-400 font-bold">{parcel.village_hi || parcel.village}</span>
            </div>
          </div>

          {/* Parcel Primary Details Grid */}
          <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-emerald-900 text-white px-4 py-2 text-xs font-bold flex justify-between items-center">
              <span>खसरा एवं भूमि स्वामी विवरण (Cadastral Ownership Detail)</span>
              <span className="font-mono text-[11px] bg-emerald-800 px-2 py-0.5 rounded">ID: {parcel.parcel_id}</span>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <tbody>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300 w-1/3 border-r border-slate-200 dark:border-slate-800">खसरा नंबर / Khasra No:</td>
                  <td className="p-2.5 font-bold text-emerald-900 dark:text-emerald-400 text-sm">{parcel.khasra_no}</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">खाता नंबर / Khatauni Khata:</td>
                  <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">{parcel.khata_no || 'KH-104'}</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">भूमि स्वामी / Recorded Owner:</td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">
                    <div>{parcel.owner_name}</div>
                    {parcel.owner_name_hi && <div className="text-amber-800 dark:text-amber-400 text-xs font-medium">{parcel.owner_name_hi}</div>}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">पिता / पति का नाम (Father/Husband):</td>
                  <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">
                    <div>{parcel.father_name || 'N/A'}</div>
                    {parcel.father_name_hi && <div className="text-slate-600 dark:text-slate-400 text-xs">{parcel.father_name_hi}</div>}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">रकबा (Area Breakdown):</td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">
                    {parcel.area_hectares} हेक्टेयर ({parcel.area_acres} एकड़ / {areaSqFt.toLocaleString()} sq.ft)
                  </td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">भूमि प्रकार एवं मिट्टी (Type & Soil):</td>
                  <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{parcel.land_type} | {parcel.soil_type || 'Matasi Soil'}</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">सिंचाई साधन (Irrigation):</td>
                  <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{parcel.irrigation_source || 'Canal Network'}</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">गाइडलाइन बाजार मूल्य (Est Market Value):</td>
                  <td className="p-2.5 font-bold text-emerald-800 dark:text-emerald-400">₹{parcel.market_value_per_ha} लाख/हेक्ट. (कुल: ₹{totalValLakhs} लाख)</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">नामांतरण स्थिति (Mutation Status):</td>
                  <td className="p-2.5 font-semibold text-emerald-800 dark:text-emerald-400">{parcel.mutation_status || 'Mutated'}</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">राजस्व न्यायालय प्रकरण (Litigation):</td>
                  <td className="p-2.5 font-semibold text-amber-900 dark:text-amber-400">{parcel.litigation_status || 'No dispute'}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">5वीं अनुसूची क्षेत्र (Tribal Status):</td>
                  <td className="p-2.5 font-bold">
                    {parcel.tribal_sensitive ? (
                      <span className="text-purple-900 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded border border-purple-300 dark:border-purple-700">
                        🛡️ 5th Schedule Tribal Sensitive (Sec 170-B Restricted)
                      </span>
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400">सामान्य श्रेणी (General Category)</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verification Footer & Digital Hash */}
          <div className="pt-4 border-t border-slate-300 dark:border-slate-800 flex justify-between items-end text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>डिजिटल रूप से प्रमाणित प्रति (Digitally Authenticated Record)</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">SHA256: {hashString}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">निरीक्षण तिथि / Verification Date: {new Date().toLocaleDateString('hi-IN')}</p>
            </div>
            <div className="text-center space-y-1">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded flex items-center justify-center mx-auto">
                <QrCode className="w-12 h-12 text-slate-800 dark:text-slate-200" />
              </div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-semibold">bhuiyan.cg.nic.in Verified</span>
            </div>
          </div>
        </div>

        {/* Footer - Secondary Close Button for Mobile & Accessibility */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center print:hidden shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Bhoomi Setu Digital Verification Portal</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close record"
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            बंद करें / Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
