import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GitCommit, CheckCircle2, Clock, ShieldCheck, AlertCircle, FileText, Send, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MutationTrackerView: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOfficer = user?.role === 'admin' || user?.role === 'official' || (user?.role as string) === 'officer';

  const [activeTab, setActiveTab] = useState<'track' | 'apply' | 'officer'>(isOfficer ? 'officer' : 'track');
  const [appIdInput, setAppIdInput] = useState('CG-MUT-1001');
  const [mutationData, setMutationData] = useState<any | null>(null);
  const [officerList, setOfficerList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Apply Form state
  const [parcelId, setParcelId] = useState('CG-RAI-0001');
  const [khasraNo, setKhasraNo] = useState('101/A');
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [mutationType, setMutationType] = useState('Inheritance (फौती नामांतरण)');
  const [transferorName, setTransferorName] = useState('');
  const [transfereeName, setTransfereeName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchMutationStatus(appIdInput);
    if (isOfficer) {
      fetchOfficerList();
    }
  }, [isOfficer]);

  async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('access_token');
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  }

  const fetchMutationStatus = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/v1/mutations/${id}`);
      const data = await res.json();
      setMutationData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficerList = async () => {
    try {
      const res = await fetchWithAuth('/api/v1/mutations/list');
      const data = await res.json();
      setOfficerList(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/v1/mutations/apply', {
        method: 'POST',
        body: JSON.stringify({
          parcel_id: parcelId,
          khasra_no: khasraNo,
          applicant_name: applicantName,
          applicant_phone: applicantPhone,
          mutation_type: mutationType,
          transferor_name: transferorName,
          transferee_name: transfereeName,
          remarks: remarks
        })
      });
      const data = await res.json();
      setSubmitSuccess(data.application_id);
      setAppIdInput(data.application_id);
      fetchMutationStatus(data.application_id);
      if (isOfficer) fetchOfficerList();
    } catch (err) {
      console.error("Failed to submit mutation application", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOfficerStageUpdate = async (id: string, stageIdx: number, statusStr: string) => {
    try {
      await fetchWithAuth(`/api/v1/mutations/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          stage_index: stageIdx,
          status: statusStr,
          remarks: `Officer updated stage to ${statusStr}`
        })
      });
      fetchOfficerList();
      fetchMutationStatus(id);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <GitCommit className="w-6 h-6 text-emerald-400" />
            <span>Land Mutation Tracker & Tehsildar Workflow (नामांतरण ट्रैकर)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end 5-stage mutation lifecycle tracking for land transfer, inheritance, and partition
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              activeTab === 'track' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Track Status
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              activeTab === 'apply' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Apply for Mutation
          </button>
          {isOfficer && (
            <button
              onClick={() => setActiveTab('officer')}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                activeTab === 'officer' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Officer Portal ({officerList.length})
            </button>
          )}
        </div>
      </div>

      {/* Track Status Tab */}
      {activeTab === 'track' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={appIdInput}
              onChange={(e) => setAppIdInput(e.target.value)}
              placeholder="Enter Application ID e.g. CG-MUT-1001"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => fetchMutationStatus(appIdInput)}
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow"
            >
              {loading ? 'Searching...' : 'Track Mutation Progress'}
            </button>
          </div>

          {mutationData && (
            <div className="space-y-6 pt-2">
              {/* Application Details Summary Header */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Application ID</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{mutationData.application_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Khasra Number</span>
                  <span className="font-bold text-white text-sm">{mutationData.khasra_no}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Applicant Name</span>
                  <span className="font-bold text-slate-200">{mutationData.applicant_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Mutation Category</span>
                  <span className="font-bold text-amber-400">{mutationData.mutation_type}</span>
                </div>
              </div>

              {/* 5-Stage Visual Progress Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  5-Stage Mutation Workflow Timeline
                </h3>

                <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
                  {mutationData.timeline?.map((tItem: any, idx: number) => {
                    const isPassed = tItem.completed;
                    const isCurrent = mutationData.stage_index === idx + 1;
                    return (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isPassed ? 'bg-emerald-600 text-white shadow-lg' : isCurrent ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className={`font-bold ${isPassed ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-slate-400'}`}>
                              {tItem.stage}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{tItem.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {idx === 0 && 'Application registered at SDM / Tehsildar Revenue Portal.'}
                            {idx === 1 && 'Public notice published in Gram Panchayat & Revenue Board.'}
                            {idx === 2 && '15-day objection period active for public claims.'}
                            {idx === 3 && 'Tehsildar court hearing & order issuance.'}
                            {idx === 4 && 'Record updated in Chhattisgarh Bhuiyan land registry.'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Apply Tab */}
      {activeTab === 'apply' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-400" />
            <span>Submit Mutation Application (नामांतरण आवेदन)</span>
          </h2>

          {submitSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-600 p-4 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
              <div>
                <strong>Mutation Application Submitted Successfully!</strong>
                <p className="text-[11px] text-emerald-400 mt-0.5">Application ID: <strong>{submitSuccess}</strong></p>
              </div>
              <button
                onClick={() => setActiveTab('track')}
                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                Track Now
              </button>
            </div>
          )}

          <form onSubmit={handleApplySubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Parcel ID (खसरा आईडी)</label>
              <input
                type="text"
                value={parcelId}
                onChange={(e) => setParcelId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Khasra Number (खसरा नं.)</label>
              <input
                type="text"
                value={khasraNo}
                onChange={(e) => setKhasraNo(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Applicant Name (आवेदक का नाम)</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                required
                placeholder="Full Name as per Aadhaar"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Applicant Phone (फ़ोन नंबर)</label>
              <input
                type="text"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                required
                placeholder="10-digit mobile number"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Mutation Type (नामांतरण प्रकार)</label>
              <select
                value={mutationType}
                onChange={(e) => setMutationType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              >
                <option value="Inheritance (फौती नामांतरण)">Inheritance (फौती नामांतरण)</option>
                <option value="Registered Transfer / Sale (बिक्री नामांतरण)">Registered Transfer / Sale (बिक्री नामांतरण)</option>
                <option value="Partition (बंटवारा)">Partition (बंटवारा)</option>
                <option value="Gift Deed (दान पत्र)">Gift Deed (दान पत्र)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Transferor / Original Owner</label>
              <input
                type="text"
                value={transferorName}
                onChange={(e) => setTransferorName(e.target.value)}
                placeholder="Name of previous owner"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Remarks & Supporting Documents Summary</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                placeholder="Registry number, death certificate details, or inheritance tree description..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow transition"
              >
                {loading ? 'Submitting...' : 'Submit Mutation Application'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Officer Portal Tab */}
      {activeTab === 'officer' && isOfficer && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-400" />
              <span>Tehsildar Mutation Approval Queue</span>
            </h2>
            <button onClick={fetchOfficerList} className="text-xs text-blue-400 hover:underline">
              Refresh Queue
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 text-xs">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">App ID</th>
                  <th className="p-3">Applicant & Type</th>
                  <th className="p-3">Khasra No</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 text-right">Tehsildar Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                {officerList.map((m) => (
                  <tr key={m.id || m.application_id}>
                    <td className="p-3 font-mono font-bold text-emerald-400">{m.application_id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{m.applicant_name}</div>
                      <div className="text-[10px] text-amber-400">{m.mutation_type}</div>
                    </td>
                    <td className="p-3 font-bold text-slate-200">{m.khasra_no}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-[10px] font-semibold text-emerald-300 uppercase">
                        {m.status} (Stage {m.stage_index}/5)
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleOfficerStageUpdate(m.application_id, 2, 'notice_issued')}
                        className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-bold"
                      >
                        Issue Notice
                      </button>
                      <button
                        onClick={() => handleOfficerStageUpdate(m.application_id, 4, 'hearing')}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold"
                      >
                        Schedule Hearing
                      </button>
                      <button
                        onClick={() => handleOfficerStageUpdate(m.application_id, 5, 'mutated')}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                      >
                        Approve & Mutate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
