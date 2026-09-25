import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Send, Search, HelpCircle, FileCheck, Clock, UserCheck } from 'lucide-react';
import { api } from '../../services/api';

export const GrievanceModuleView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'track'>('create');
  
  // Form state
  const [parcelId, setParcelId] = useState('CG-RAI-0001');
  const [category, setCategory] = useState('Record Correction');
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [description, setDescription] = useState('');
  const [createdTicket, setCreatedTicket] = useState<string | null>(null);

  // Track state
  const [ticketInput, setTicketInput] = useState('BHOOMI-GRV-2001');
  const [ticketDetails, setTicketDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.createGrievanceTicket({
        parcel_id: parcelId,
        category: category,
        applicant_name: applicantName,
        applicant_phone: applicantPhone,
        description: description
      });
      setCreatedTicket(data.ticket_id);
      setTicketInput(data.ticket_id);
    } catch (err) {
      console.error("Failed to create grievance ticket", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.trackGrievanceTicket(ticketInput);
      setTicketDetails(data);
    } catch (err) {
      setTicketDetails(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-400" />
            <span>Record Correction & Grievance Redressal (शिकायत एवं अभिलेख सुधार)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Lodge record correction tickets, area mismatch disputes, or name spelling updates
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              activeTab === 'create' ? 'bg-amber-600 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lodge Ticket
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              activeTab === 'track' ? 'bg-amber-600 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Track Grievance
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          {createdTicket && (
            <div className="bg-amber-950/80 border border-amber-600 p-4 rounded-xl text-amber-300 text-xs flex items-center justify-between">
              <div>
                <strong>Grievance Ticket Created Successfully!</strong>
                <p className="text-[11px] text-amber-400 mt-0.5">Ticket ID: <strong>{createdTicket}</strong></p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('track');
                  handleTrackSubmit(new Event('submit') as any);
                }}
                className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Track Status
              </button>
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Grievance Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              >
                <option value="Record Correction">Record Correction (अभिलेख सुधार)</option>
                <option value="Area Mismatch">Area Mismatch (रकबा त्रुटि)</option>
                <option value="Name Spelling Correction">Name Spelling Correction (नाम सुधार)</option>
                <option value="Boundary Survey Request">Boundary Survey Request (सीमांकन आवेदन)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Parcel ID (खसरा संख्या)</label>
              <input
                type="text"
                value={parcelId}
                onChange={(e) => setParcelId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Applicant Name</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                required
                placeholder="Applicant Full Name"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                required
                placeholder="10-digit phone number"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Detailed Description of Discrepancy</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                placeholder="Explain the error in the Bhuiyan record and details of supporting revenue certificates..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting...' : 'Lodge Grievance Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'track' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <form onSubmit={handleTrackSubmit} className="flex gap-3">
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Enter Ticket ID e.g. BHOOMI-GRV-2001"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-bold transition shadow"
            >
              {loading ? 'Tracking...' : 'Track Ticket'}
            </button>
          </form>

          {ticketDetails && (
            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Ticket Reference</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{ticketDetails.ticket_id}</span>
                </div>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold rounded-full uppercase">
                  {ticketDetails.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px]">Category</span>
                  <span className="font-semibold text-white">{ticketDetails.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Assigned Officer</span>
                  <span className="font-semibold text-emerald-400">{ticketDetails.assigned_officer}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Description</span>
                <p className="text-slate-300 italic">{ticketDetails.description}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Resolution Notes</span>
                <p className="text-slate-200">{ticketDetails.resolution_notes}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
