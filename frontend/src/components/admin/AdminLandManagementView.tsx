import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  PlusCircle,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Users,
  FileText,
  Building,
  Scale,
  Database,
  History,
  X,
  Save,
  Search,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { LandParcel, AdminAuditLog, UsabilityStatus, VerificationStatus, DataSourceType } from '../../types';
import { BhoomiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminLandManagementView: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'parcels' | 'audit'>('dashboard');
  const [editingParcel, setEditingParcel] = useState<LandParcel | null>(null);
  const [isNewParcel, setIsNewParcel] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const s = await BhoomiService.getAdminStats();
    setStats(s);
    const p = await BhoomiService.getLandParcels();
    setParcels(p);
    const logs = await BhoomiService.getAdminAuditLogs();
    setAuditLogs(logs);
  };

  const handleVerifyParcel = async (parcelId: string) => {
    if (!user) return;
    await BhoomiService.verifyLandParcel(parcelId, user);
    await loadAdminData();
  };

  const handleDeleteParcel = async (parcelId: string) => {
    if (!user) return;
    if (window.confirm(`Are you sure you want to delete land parcel ${parcelId}? This operation will be recorded in the Admin Audit Log.`)) {
      await BhoomiService.deleteLandParcel(parcelId, user);
      await loadAdminData();
    }
  };

  const handleSaveParcelForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParcel || !user) return;

    await BhoomiService.saveLandParcel(editingParcel, user);
    await loadAdminData();
    setEditingParcel(null);
  };

  const handleCreateNewParcel = () => {
    const newP: LandParcel = {
      id: `P${Date.now().toString().slice(-4)}`,
      parcelNumber: `P${Math.floor(100 + Math.random() * 900)}`,
      khasraNumber: '101/A',
      surveyNumber: 'SUR-NEW-01',
      state: 'Chhattisgarh',
      district: 'Raigarh',
      tehsil: 'Gharghoda',
      village: 'Tamnar',
      city: 'Raigarh Industrial',
      areaHectares: 10.0,
      landUnit: 'Hectares',
      landCategory: 'Agricultural',
      currentLandUse: 'Paddy Agriculture',
      irrigated: true,
      governmentPrivate: 'Private',
      currentStatus: 'Normal Title',
      ownerName: 'Devendra Kumar & Co-sharers',
      ownershipType: 'Private',
      ownerVerificationStatus: 'PENDING VERIFICATION',
      ownerCount: 3,
      coordinates: [
        [21.8974, 83.3950],
        [21.9020, 83.3980],
        [21.9010, 83.4050],
        [21.8950, 83.4010]
      ],
      center: { lat: 21.8974, lng: 83.3950 },
      disputeStatus: false,
      legal: { caseExists: false },
      acquisition: {
        acquisitionRequired: false,
        acquisitionStage: 'Not Under Acquisition',
        notificationStatus: 'None',
        compensationStatus: 'N/A',
        possessionStatus: 'N/A',
        rehabilitationStatus: 'N/A'
      },
      usability: { status: 'USABLE' },
      aiRisk: {
        score: 20,
        level: 'LOW',
        delayProbabilityPercent: 10,
        riskFactors: ['Clear title'],
        recommendations: ['Routine monitoring']
      },
      dataSource: 'Authorized Department',
      lastUpdated: new Date().toISOString().split('T')[0],
      verificationStatus: 'PENDING VERIFICATION',
      verifiedBy: user?.name || 'Authorized Admin'
    };

    setIsNewParcel(true);
    setEditingParcel(newP);
  };

  const filteredParcels = parcels.filter(
    (p) =>
      p.parcelNumber.toLowerCase().includes(filterSearch.toLowerCase()) ||
      p.village.toLowerCase().includes(filterSearch.toLowerCase()) ||
      p.khasraNumber.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const usabilityChartData = [
    { name: 'Usable', value: parcels.filter((p) => p.usability.status === 'USABLE').length, fill: '#10b981' },
    { name: 'Under Review', value: parcels.filter((p) => p.usability.status === 'UNDER REVIEW').length, fill: '#f59e0b' },
    { name: 'Restricted', value: parcels.filter((p) => p.usability.status === 'RESTRICTED').length, fill: '#f97316' },
    { name: 'Not Usable', value: parcels.filter((p) => p.usability.status === 'NOT USABLE').length, fill: '#ef4444' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Admin Header */}
      <div className="bg-[#0f2942] text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Authorized Officer Control Center
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">Admin Land Management & Audit Portal</h1>
          <p className="text-xs text-slate-300 mt-1">
            Official record verification, usability status updates, and audit logging.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateNewParcel}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Land Record</span>
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'dashboard' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Admin Dashboard Stats
        </button>
        <button
          onClick={() => setActiveTab('parcels')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'parcels' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Manage Parcels ({parcels.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'audit' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Admin Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* FEATURE 8: ADMIN DASHBOARD STATS */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          {/* Admin KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registered Users</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Role-based Auth Active</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Land Parcels</span>
              <h3 className="text-2xl font-black text-blue-900 mt-1">{stats.totalParcels}</h3>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">{stats.verifiedParcels} Verified</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Legal Cases</span>
              <h3 className="text-2xl font-black text-red-600 mt-1">{stats.activeLegalCases}</h3>
              <p className="text-[11px] text-red-700 font-bold mt-0.5">Pending Court Stays</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High / Critical Risk</span>
              <h3 className="text-2xl font-black text-orange-600 mt-1">{stats.highRiskParcels}</h3>
              <p className="text-[11px] text-orange-700 font-bold mt-0.5">Flagged by AI Engine</p>
            </div>
          </div>

          {/* Admin Visual Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Usability Breakdown */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Parcels by Usability Status</h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usabilityChartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px' }} />
                    <Bar dataKey="value" name="Total Parcels" radius={[4, 4, 0, 0]}>
                      {usabilityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Verification Status Distribution */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Verification Distribution</h4>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Verified', value: stats.verifiedParcels, fill: '#10b981' },
                        { name: 'Pending Verification', value: stats.pendingVerification, fill: '#f59e0b' },
                      ]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PARCEL MANAGEMENT TABLE */}
      {activeTab === 'parcels' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter parcels by ID, Khasra, or Village..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Parcel ID & Khasra</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Owner Info</th>
                    <th className="p-4">Usability Status</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4">Risk</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredParcels.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{p.parcelNumber}</div>
                        <div className="text-[10px] text-slate-400">Khasra {p.khasraNumber} • {p.areaHectares} Ha</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-800 font-semibold">{p.village}</div>
                        <div className="text-[10px] text-slate-400">{p.district}, {p.state}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-900 font-bold">{p.ownerName}</div>
                        <div className="text-[10px] text-slate-400">{p.ownershipType}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          p.usability.status === 'USABLE' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {p.usability.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.verificationStatus}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {p.aiRisk.score}/100
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {p.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleVerifyParcel(p.parcelNumber)}
                            className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-lg text-[11px] hover:bg-emerald-200 transition"
                          >
                            Verify
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setIsNewParcel(false);
                            setEditingParcel({ ...p });
                          }}
                          className="px-2.5 py-1 bg-blue-900 text-white font-bold rounded-lg text-[11px] hover:bg-blue-800 transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteParcel(p.parcelNumber)}
                          className="px-2.5 py-1 bg-red-100 text-red-700 hover:bg-red-200 font-bold rounded-lg text-[11px] transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 9: ADMIN AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-700" />
            <span>Official Admin Audit Logs</span>
          </h3>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-blue-900">{log.adminName} (ID: {log.adminId})</span>
                  <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
                </div>
                <div className="text-slate-800 font-semibold">
                  Action: <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-mono text-[10px]">{log.action}</span> on Parcel ID <strong>{log.parcelId}</strong>
                </div>
                <div className="text-slate-600 text-[11px]">
                  <strong>{log.fieldName}:</strong> "{log.oldValue}" → <strong className="text-emerald-700">"{log.newValue}"</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT / ADD PARCEL MODAL FORM (FEATURE 5) */}
      {editingParcel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col animate-in zoom-in-95">
            <div className="p-5 bg-[#0f2942] text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-400" />
                <span>{isNewParcel ? 'Add New Official Land Record' : `Edit Land Record ${editingParcel.parcelNumber}`}</span>
              </h3>
              <button onClick={() => setEditingParcel(null)} className="p-1 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveParcelForm} className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parcel ID</label>
                  <input
                    type="text"
                    value={editingParcel.parcelNumber}
                    onChange={(e) => setEditingParcel({ ...editingParcel, parcelNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khasra Number</label>
                  <input
                    type="text"
                    value={editingParcel.khasraNumber}
                    onChange={(e) => setEditingParcel({ ...editingParcel, khasraNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Survey Number</label>
                  <input
                    type="text"
                    value={editingParcel.surveyNumber}
                    onChange={(e) => setEditingParcel({ ...editingParcel, surveyNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editingParcel.state}
                    onChange={(e) => setEditingParcel({ ...editingParcel, state: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={editingParcel.district}
                    onChange={(e) => setEditingParcel({ ...editingParcel, district: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tehsil</label>
                  <input
                    type="text"
                    value={editingParcel.tehsil}
                    onChange={(e) => setEditingParcel({ ...editingParcel, tehsil: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Village</label>
                  <input
                    type="text"
                    value={editingParcel.village}
                    onChange={(e) => setEditingParcel({ ...editingParcel, village: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Ownership & Usability */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={editingParcel.ownerName}
                    onChange={(e) => setEditingParcel({ ...editingParcel, ownerName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Usability Status</label>
                  <select
                    value={editingParcel.usability.status}
                    onChange={(e) => setEditingParcel({
                      ...editingParcel,
                      usability: { ...editingParcel.usability, status: e.target.value as UsabilityStatus }
                    })}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
                  >
                    <option value="USABLE">🟢 USABLE</option>
                    <option value="UNDER REVIEW">🟡 UNDER REVIEW</option>
                    <option value="RESTRICTED">🟠 RESTRICTED</option>
                    <option value="NOT USABLE">🔴 NOT USABLE</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Verification Status</label>
                  <select
                    value={editingParcel.verificationStatus}
                    onChange={(e) => setEditingParcel({ ...editingParcel, verificationStatus: e.target.value as VerificationStatus })}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="PENDING VERIFICATION">PENDING VERIFICATION</option>
                    <option value="UNVERIFIED">UNVERIFIED</option>
                  </select>
                </div>
              </div>

              {/* Restriction Reason */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Restriction Reason (if restricted)</label>
                <input
                  type="text"
                  value={editingParcel.usability.restrictionReason || ''}
                  onChange={(e) => setEditingParcel({
                    ...editingParcel,
                    usability: { ...editingParcel.usability, restrictionReason: e.target.value }
                  })}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
                />
              </div>

              <div className="pt-4 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingParcel(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl shadow transition flex items-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Record & Log Audit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
