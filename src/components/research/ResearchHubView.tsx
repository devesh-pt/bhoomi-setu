import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Bookmark,
  Sparkles,
  Filter,
  FileText,
  Building2,
  Calendar,
  X,
  CheckCircle2,
  Brain,
  Share2
} from 'lucide-react';
import { ResearchDocument } from '../../types';
import { BhoomiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ResearchHubView: React.FC = () => {
  const { user, toggleSavedResearch } = useAuth();
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [query, setQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDocType, setSelectedDocType] = useState('All');
  const [activeModalDoc, setActiveModalDoc] = useState<ResearchDocument | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    loadResearch();
  }, [query, selectedTopic, selectedState, selectedDocType]);

  const loadResearch = async () => {
    const list = await BhoomiService.searchResearch(query, {
      topic: selectedTopic,
      state: selectedState,
      docType: selectedDocType,
    });
    setDocuments(list);
  };

  const handleOpenSummarizer = async (doc: ResearchDocument) => {
    setActiveModalDoc(doc);
    if (!doc.aiSummary) {
      setIsSummarizing(true);
      const summary = await BhoomiService.generateResearchSummary(doc.id);
      setActiveModalDoc({ ...doc, aiSummary: summary });
      setIsSummarizing(false);
    }
  };

  const topics = [
    'Land Acquisition',
    'Compensation',
    'Rehabilitation & Resettlement',
    'Land Disputes',
    'Rural Development',
    'Land Use',
    'Infrastructure',
    'Agricultural Land',
    'Land Records'
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-700 font-extrabold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Evidence-Based Research Discovery</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Research Hub & Policy Repository</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access 12,450+ indexed peer-reviewed studies, policy evaluations, and empirical land datasets.
          </p>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search research papers, policies, reports and datasets by keyword, author, or statute..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="All">All Topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State Focus</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="All">All States</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Odisha">Odisha</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Document Type</label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="All">All Types</option>
              <option value="Empirical Study">Empirical Study</option>
              <option value="Policy Paper">Policy Paper</option>
              <option value="Evaluation Report">Evaluation Report</option>
              <option value="Legal Analysis">Legal Analysis</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => { setQuery(''); setSelectedTopic('All'); setSelectedState('All'); setSelectedDocType('All'); }}
              className="w-full p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Research Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => {
          const isSaved = user?.savedResearchIds?.includes(doc.id);
          return (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-purple-300 flex flex-col justify-between space-y-4 transition"
            >
              <div className="space-y-3">
                {/* Meta Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 font-bold text-[10px] rounded-md uppercase">
                      {doc.documentType}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{doc.year} • {doc.organization}</span>
                  </div>

                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full">
                    {doc.relevanceScore}% Match
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{doc.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{doc.abstract}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {doc.topics.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleSavedResearch(doc.id)}
                  className={`p-2 rounded-xl text-xs flex items-center space-x-1 border transition ${
                    isSaved ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenSummarizer(doc)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
                  >
                    <Brain className="w-3.5 h-3.5 text-purple-200" />
                    <span>AI Summarize</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Research Summarizer Modal */}
      {activeModalDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-300" />
                <h3 className="font-extrabold text-sm tracking-tight">AI Research Summarizer & Evaluation</h3>
              </div>
              <button
                onClick={() => setActiveModalDoc(null)}
                className="p-1 text-purple-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Document Summary</span>
                <h2 className="text-base font-black text-slate-900 leading-snug mt-1">{activeModalDoc.title}</h2>
                <p className="text-xs text-slate-500 mt-1">Authors: {activeModalDoc.authors.join(', ')} • {activeModalDoc.organization} ({activeModalDoc.year})</p>
              </div>

              {isSummarizing ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Sparkles className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold">Extracting key findings, methodology & statistics...</p>
                </div>
              ) : activeModalDoc.aiSummary ? (
                <div className="space-y-4">
                  {/* Key Findings */}
                  <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl">
                    <h4 className="text-xs font-extrabold text-purple-900 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-purple-700" />
                      Key Research Findings
                    </h4>
                    <ul className="list-disc list-inside text-xs text-purple-950 space-y-1.5">
                      {activeModalDoc.aiSummary.keyFindings.map((f, idx) => (
                        <li key={idx} className="leading-relaxed">{f}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Statistics */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                    <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-2">
                      Key Empirical Statistics
                    </h4>
                    <ul className="list-disc list-inside text-xs text-emerald-950 space-y-1">
                      {activeModalDoc.aiSummary.keyStatistics.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Policy Implications */}
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
                    <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider mb-2">
                      Policy & Governance Implications
                    </h4>
                    <ul className="list-disc list-inside text-xs text-blue-950 space-y-1">
                      {activeModalDoc.aiSummary.policyImplications.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Methodology */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    <strong>Methodology:</strong> {activeModalDoc.aiSummary.methodology}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Predefined Prototype AI Summary Layer</span>
              <button
                onClick={() => setActiveModalDoc(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
