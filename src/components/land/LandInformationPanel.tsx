import React from 'react';
import {
  X,
  MapPin,
  FileText,
  UserCheck,
  Scale,
  Building,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Calendar,
  Database,
  ExternalLink,
  Edit
} from 'lucide-react';
import { LandParcel, UsabilityStatus, VerificationStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface LandInformationPanelProps {
  parcel: LandParcel;
  onClose: () => void;
  onEditByAdmin?: (parcel: LandParcel) => void;
}

export const LandInformationPanel: React.FC<LandInformationPanelProps> = ({
  parcel,
  onClose,
  onEditByAdmin,
}) => {
  const { user } = useAuth();

  // Role permissions check
  const isAdmin = user?.role === 'admin' || user?.role === 'official';
  const canViewOwnerDetails = isAdmin || user?.role === 'researcher' || user?.role === 'institution';

  const getUsabilityBadge = (status?: UsabilityStatus) => {
    switch (status) {
      case 'USABLE':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-black rounded-xl text-xs flex items-center gap-1.5">🟢 USABLE</span>;
      case 'UNDER REVIEW':
        return <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-black rounded-xl text-xs flex items-center gap-1.5">🟡 UNDER REVIEW</span>;
      case 'RESTRICTED':
        return <span className="px-3 py-1 bg-orange-100 text-orange-900 border border-orange-300 font-black rounded-xl text-xs flex items-center gap-1.5">🟠 RESTRICTED</span>;
      case 'NOT USABLE':
        return <span className="px-3 py-1 bg-red-100 text-red-900 border border-red-300 font-black rounded-xl text-xs flex items-center gap-1.5">🔴 NOT USABLE</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 border font-bold rounded-xl text-xs">Data not available</span>;
    }
  };

  const getVerificationBadge = (vStatus?: VerificationStatus) => {
    switch (vStatus) {
      case 'VERIFIED':
        return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md border border-emerald-300">✓ VERIFIED</span>;
      case 'PENDING VERIFICATION':
        return <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-md border border-amber-300">⏳ PENDING VERIFICATION</span>;
      case 'UNVERIFIED':
        return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md border border-slate-300">✕ UNVERIFIED</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">UNVERIFIED</span>;
    }
  };

  const legalInfo = parcel?.legal || { caseExists: false };
  const acqInfo = parcel?.acquisition || {
    acquisitionRequired: false,
    acquisitionStage: 'Not Under Acquisition',
    notificationStatus: 'Data not available',
    compensationStatus: 'Data not available',
    possessionStatus: 'Data not available',
    rehabilitationStatus: 'Data not available'
  };
  const usabilityInfo = parcel?.usability || { status: 'USABLE' as UsabilityStatus };
  const aiRiskInfo = parcel?.aiRisk || {
    score: 20,
    level: 'LOW',
    delayProbabilityPercent: 10,
    riskFactors: ['Standard monitoring'],
    recommendations: ['Maintain periodic review']
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right">
        {/* Drawer Header */}
        <div className="p-5 bg-[#0f2942] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Official Land Record Panel
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-blue-900 text-blue-200 rounded font-mono font-bold">
                {parcel?.parcelNumber || 'P-UNKNOWN'}
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Khasra No. {parcel?.khasraNumber || 'N/A'} — {parcel?.village || 'N/A'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {parcel?.tehsil || 'N/A'}, {parcel?.district || 'N/A'}, {parcel?.state || 'N/A'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${parcel?.center?.lat || 21.5},${parcel?.center?.lng || 78.5}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow transition"
              title="Open coordinates in Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </a>

            {isAdmin && onEditByAdmin && (
              <button
                onClick={() => onEditByAdmin(parcel)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Record</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prototype Data Warning Banner */}
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 text-blue-900 text-[11px] font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            DEMO DATA — FOR PROTOTYPE DEMONSTRATION ONLY
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">Source: {parcel?.dataSource || 'Government Dataset'}</span>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Usability & Status Header Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Usability Status</span>
              {getUsabilityBadge(usabilityInfo.status)}
            </div>

            {usabilityInfo.restrictionReason && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <span className="font-bold block text-amber-950">Reason for Restriction:</span>
                <p className="leading-relaxed">{usabilityInfo.restrictionReason}</p>
              </div>
            )}
          </div>

          {/* Identification & Location Grid */}
          <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Location & Identification</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Parcel ID</span>
              <span className="text-xs font-bold text-slate-900">{parcel?.parcelNumber || 'Data not available'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Khasra Number</span>
              <span className="text-xs font-bold text-slate-900">{parcel?.khasraNumber || 'Data not available'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Survey Number</span>
              <span className="text-xs font-bold text-slate-900">{parcel?.surveyNumber || 'Data not available'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">State & District</span>
              <span className="text-xs font-bold text-slate-900">{parcel?.district || 'N/A'}, {parcel?.state || 'N/A'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Tehsil & Village</span>
              <span className="text-xs font-bold text-slate-900">{parcel?.village || 'N/A'} ({parcel?.tehsil || 'N/A'})</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Coordinates</span>
              <span className="text-xs font-mono font-semibold text-slate-700">
                {parcel?.center?.lat ? `${parcel.center.lat.toFixed(4)}, ${parcel.center.lng.toFixed(4)}` : 'Data not available'}
              </span>
            </div>
          </div>

          {/* Permission Controlled Ownership Card */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Ownership & Title Registry</span>
              </span>
              {getVerificationBadge(parcel?.ownerVerificationStatus)}
            </div>

            {canViewOwnerDetails ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Registered Owner Name</span>
                  <span className="font-extrabold text-slate-900">{parcel?.ownerName || 'Data not available'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Ownership Type</span>
                  <span className="font-bold text-slate-800">{parcel?.ownershipType || 'Private'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Co-Owners Count</span>
                  <span className="font-bold text-slate-800">{parcel?.ownerCount || 1} Title Holder(s)</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Access Scope</span>
                  <span className="text-emerald-700 font-bold">Authorized Permission Granted</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  <strong>Permission Controlled:</strong> Owner details are protected. Log in as an Authorized Officer or Researcher to view title holder names.
                </span>
              </div>
            )}
          </div>

          {/* Land Details Grid */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Land Classification & Usage</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Land Area</span>
                <span className="font-black text-slate-900 text-sm">{parcel?.areaHectares || 0} {parcel?.landUnit || 'Hectares'}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Land Category</span>
                <span className="font-bold text-slate-800">{parcel?.landCategory || 'Agricultural'}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Land Use</span>
                <span className="font-semibold text-slate-800">{parcel?.currentLandUse || 'Data not available'}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Irrigation Status</span>
                <span className="font-bold text-slate-800">{parcel?.irrigated ? '💧 Irrigated' : '🌵 Non-Irrigated'}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tenure Type</span>
                <span className="font-bold text-slate-800">{parcel?.governmentPrivate || 'Private'}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Status</span>
                <span className="font-bold text-slate-800">{parcel?.currentStatus || 'Active Record'}</span>
              </div>
            </div>
          </div>

          {/* Legal Status Card */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-red-600" />
                <span>Legal Dispute Status</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded font-extrabold text-[10px] ${
                legalInfo.caseExists ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                CASE EXISTS: {legalInfo.caseExists ? 'YES' : 'NO'}
              </span>
            </div>

            {legalInfo.caseExists ? (
              <div className="grid grid-cols-2 gap-3 text-xs bg-red-50/60 p-3.5 rounded-xl border border-red-200">
                <div>
                  <span className="text-[10px] text-red-800 uppercase font-bold block">Case Number</span>
                  <span className="font-bold text-slate-900">{legalInfo.caseNumber || 'Data not available'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-red-800 uppercase font-bold block">Court / Authority</span>
                  <span className="font-bold text-slate-900">{legalInfo.court || 'Data not available'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-red-800 uppercase font-bold block">Case Type</span>
                  <span className="font-semibold text-slate-900">{legalInfo.caseType || 'Data not available'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-red-800 uppercase font-bold block">Case Status</span>
                  <span className="font-extrabold text-red-700">{legalInfo.caseStatus || 'Pending'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-red-800 uppercase font-bold block">Case Date</span>
                  <span className="text-slate-700">{legalInfo.caseDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-red-800 uppercase font-bold block">Last Updated</span>
                  <span className="text-slate-700">{legalInfo.lastUpdated || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No active legal cases or court stay injunctions on record.</p>
            )}
          </div>

          {/* Acquisition Status Card */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-600" />
                <span>Land Acquisition Status</span>
              </span>
              <span className="text-xs font-bold text-blue-900">
                Required: {acqInfo.acquisitionRequired ? 'YES' : 'NO'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Acquisition Stage</span>
                <span className="font-extrabold text-slate-900">{acqInfo.acquisitionStage}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Notification Status</span>
                <span className="font-semibold text-slate-800">{acqInfo.notificationStatus}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Compensation Status</span>
                <span className="font-semibold text-slate-800">{acqInfo.compensationStatus}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Possession Status</span>
                <span className="font-semibold text-slate-800">{acqInfo.possessionStatus}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Rehabilitation Status</span>
                <span className="font-semibold text-slate-800">{acqInfo.rehabilitationStatus}</span>
              </div>
            </div>
          </div>

          {/* AI Risk Score Card */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-[#0f2942] text-white rounded-2xl shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Risk Assessment Score</span>
              </span>
              <span className={`px-2.5 py-1 rounded font-black text-xs ${
                aiRiskInfo.level === 'CRITICAL' || aiRiskInfo.level === 'HIGH'
                  ? 'bg-red-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {aiRiskInfo.score}/100 — {aiRiskInfo.level} RISK
              </span>
            </div>

            <div className="text-xs space-y-2">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Delay Probability:</span>
                <span className="font-bold text-emerald-300 text-sm">{aiRiskInfo.delayProbabilityPercent}% Probability</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Main Risk Factors:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                  {(aiRiskInfo.riskFactors || ['Routine monitoring']).map((rf, idx) => (
                    <li key={idx}>{rf}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Recommended Actions:</span>
                <ul className="list-disc list-inside text-emerald-300 space-y-0.5">
                  {(aiRiskInfo.recommendations || ['Maintain standard review']).map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 italic pt-2 border-t border-slate-800">
              AI-generated decision-support prediction — not an official legal determination.
            </div>
          </div>

          {/* Provenance & Verification Footer */}
          <div className="p-4 bg-slate-100 rounded-2xl text-xs space-y-1 text-slate-600">
            <div className="flex justify-between font-bold">
              <span>Data Source: {parcel?.dataSource || 'Government Dataset'}</span>
              <span>Verification: {parcel?.verificationStatus || 'VERIFIED'}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Verified By: <strong>{parcel?.verifiedBy || 'Nodal Revenue Officer'}</strong> • Last Updated: <strong>{parcel?.lastUpdated || '2026-09-01'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
