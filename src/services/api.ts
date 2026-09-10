import {
  Project,
  ResearchDocument,
  NotificationItem,
  PolicyScenario,
  PolicyImpact,
  RiskPrediction,
  BhoomiChatMessage,
  RiskLevel,
  LandParcel,
  User,
  AdminAuditLog,
  VillageSearchResult
} from '../types';
import { dbService } from './db';

export const BhoomiService = {
  // Users & Auth API
  getUsers(): User[] {
    return dbService.getUsers();
  },

  // Land Parcel & Search API
  async getLandParcels(): Promise<LandParcel[]> {
    return dbService.getLandParcels();
  },

  async getLandParcelById(id: string): Promise<LandParcel | undefined> {
    await new Promise((r) => setTimeout(r, 100));
    return dbService.getLandParcelById(id);
  },

  async searchLand(query: string): Promise<{ parcels: LandParcel[]; villageSummary?: VillageSearchResult }> {
    await new Promise((r) => setTimeout(r, 150));
    return dbService.searchLand(query);
  },

  async saveLandParcel(parcel: LandParcel, adminUser?: User): Promise<LandParcel> {
    await new Promise((r) => setTimeout(r, 200));
    return dbService.saveLandParcel(parcel, adminUser);
  },

  async deleteLandParcel(id: string, adminUser: User): Promise<void> {
    await new Promise((r) => setTimeout(r, 150));
    dbService.deleteLandParcel(id, adminUser);
  },

  async verifyLandParcel(id: string, adminUser: User): Promise<LandParcel | undefined> {
    await new Promise((r) => setTimeout(r, 150));
    return dbService.verifyLandParcel(id, adminUser);
  },

  async performSpatialBufferAnalysis(lat: number, lng: number, radiusKm: number) {
    await new Promise((r) => setTimeout(r, 250));
    return dbService.performBufferAnalysis(lat, lng, radiusKm);
  },

  // Admin Audit Logs API
  async getAdminAuditLogs(): Promise<AdminAuditLog[]> {
    await new Promise((r) => setTimeout(r, 100));
    return dbService.getAdminAuditLogs();
  },

  async getAuditLogs(): Promise<AdminAuditLog[]> {
    return dbService.getAdminAuditLogs();
  },

  exportDatabase(): string {
    return JSON.stringify({
      parcels: dbService.getLandParcels(),
      projects: dbService.getProjects(),
      users: dbService.getUsers(),
      auditLogs: dbService.getAdminAuditLogs(),
    }, null, 2);
  },

  // Admin Dashboard Statistics API
  async getAdminStats() {
    await new Promise((r) => setTimeout(r, 100));
    return dbService.getAdminStats();
  },

  // Projects API
  async getProjects(filters?: {
    state?: string;
    type?: string;
    riskLevel?: string;
    search?: string;
  }): Promise<Project[]> {
    await new Promise((r) => setTimeout(r, 150));
    let list = dbService.getProjects();

    if (filters) {
      if (filters.state && filters.state !== 'All') {
        list = list.filter((p) => p.state.toLowerCase() === filters.state?.toLowerCase());
      }
      if (filters.type && filters.type !== 'All') {
        list = list.filter((p) => p.type === filters.type);
      }
      if (filters.riskLevel && filters.riskLevel !== 'All') {
        list = list.filter((p) => p.riskLevel === filters.riskLevel);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            p.district.toLowerCase().includes(q) ||
            p.state.toLowerCase().includes(q)
        );
      }
    }

    return list;
  },

  async getProjectById(id: string): Promise<Project | undefined> {
    await new Promise((r) => setTimeout(r, 100));
    return dbService.getProjects().find((p) => p.id === id);
  },

  async saveProject(project: Project): Promise<Project> {
    await new Promise((r) => setTimeout(r, 200));
    return dbService.saveProject(project);
  },

  // Predictive ML Delay Analytics
  async predictRisk(input: {
    projectType: string;
    landAreaHectares: number;
    affectedFamilies: number;
    compensationDisbursedPercent: number;
    approvalTimeMonths: number;
    legalDisputesCount: number;
    rehabilitationProgressPercent: number;
    stakeholderResponsiveness: 'High' | 'Medium' | 'Low';
  }): Promise<RiskPrediction> {
    await new Promise((r) => setTimeout(r, 300));

    let score = 30;
    const compGap = 100 - input.compensationDisbursedPercent;
    score += compGap * 0.35;
    score += Math.min(input.legalDisputesCount * 4, 30);
    const rehabGap = 100 - input.rehabilitationProgressPercent;
    score += rehabGap * 0.2;

    if (input.approvalTimeMonths > 12) score += 10;
    if (input.approvalTimeMonths > 24) score += 10;
    if (input.stakeholderResponsiveness === 'Low') score += 15;
    if (input.stakeholderResponsiveness === 'Medium') score += 5;

    score = Math.min(Math.max(Math.round(score), 10), 98);

    let riskLevel: RiskLevel = 'LOW';
    if (score >= 40 && score < 60) riskLevel = 'MEDIUM';
    if (score >= 60 && score < 80) riskLevel = 'HIGH';
    if (score >= 80) riskLevel = 'CRITICAL';

    const delayProb = Math.min(Math.round(score * 0.92), 95);
    const estDelayMonths = Number((score * 0.15).toFixed(1));

    const causes: string[] = [];
    const recs: string[] = [];

    if (input.compensationDisbursedPercent < 60) {
      causes.push(`Compensation distribution is incomplete (${input.compensationDisbursedPercent}% disbursed).`);
      recs.push('Accelerate direct benefit transfer (DBT) verification & digital compensation escrow.');
    }
    if (input.legalDisputesCount > 5) {
      causes.push(`Multiple pending legal disputes (${input.legalDisputesCount} cases active in courts).`);
      recs.push('Prioritize court mediation & set up dedicated High Court Land Acquisition Bench.');
    }
    if (input.rehabilitationProgressPercent < 50) {
      causes.push(`Rehabilitation & Resettlement (R&R) progress is below target (${input.rehabilitationProgressPercent}% complete).`);
      recs.push('Increase R&R site monitoring, fast-track housing allocation, and livelihood grants.');
    }
    if (input.approvalTimeMonths > 18) {
      causes.push(`Administrative approval timeframe exceeds national average (${input.approvalTimeMonths} months elapsed).`);
      recs.push('Assign dedicated Senior Nodal Officer for single-window inter-departmental clearances.');
    }
    if (causes.length === 0) {
      causes.push('Minor administrative workflow bottlenecks.');
      recs.push('Maintain routine bi-weekly progress monitoring.');
    }

    return {
      projectId: 'custom-prediction',
      riskScore: score,
      riskLevel,
      delayProbabilityPercent: delayProb,
      estimatedDelayMonths: estDelayMonths,
      legalRiskLevel: input.legalDisputesCount > 8 ? 'HIGH' : input.legalDisputesCount > 2 ? 'MEDIUM' : 'LOW',
      compensationRiskLevel: input.compensationDisbursedPercent < 50 ? 'HIGH' : input.compensationDisbursedPercent < 80 ? 'MEDIUM' : 'LOW',
      rehabilitationRiskLevel: input.rehabilitationProgressPercent < 45 ? 'HIGH' : input.rehabilitationProgressPercent < 75 ? 'MEDIUM' : 'LOW',
      riskCauses: causes,
      recommendedActions: recs,
      lastCalculated: new Date().toISOString()
    };
  },

  // Research Hub API
  async searchResearch(query: string, filters?: { topic?: string; state?: string; docType?: string }): Promise<ResearchDocument[]> {
    await new Promise((r) => setTimeout(r, 150));
    let list = dbService.getResearchDocs();

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.abstract.toLowerCase().includes(q) ||
          r.topics.some((t) => t.toLowerCase().includes(q)) ||
          r.organization.toLowerCase().includes(q)
      );
    }

    if (filters) {
      if (filters.topic && filters.topic !== 'All') {
        list = list.filter((r) => r.topics.includes(filters.topic!));
      }
      if (filters.state && filters.state !== 'All') {
        list = list.filter((r) => r.stateFocus.includes(filters.state!) || r.stateFocus.includes('All India'));
      }
      if (filters.docType && filters.docType !== 'All') {
        list = list.filter((r) => r.documentType === filters.docType);
      }
    }

    return list;
  },

  async generateResearchSummary(docId: string): Promise<ResearchDocument['aiSummary']> {
    await new Promise((r) => setTimeout(r, 300));
    const doc = dbService.getResearchDocs().find((r) => r.id === docId);
    if (doc && doc.aiSummary) {
      return doc.aiSummary;
    }
    return {
      keyFindings: ['Land acquisition timelines are strongly linked to digital land record accuracy.'],
      methodology: 'Empirical data extraction from state land department archives.',
      keyStatistics: ['58% of land disputes stem from unverified inheritance records.'],
      policyImplications: ['Integrate digital GIS mapping into preliminary notifications.'],
      limitations: ['Sample size limited to major infrastructure corridors.'],
      relatedResearchIds: ['res-1']
    };
  },

  // Policy Lab Simulator
  async runPolicySimulation(scenario: PolicyScenario): Promise<PolicyImpact> {
    await new Promise((r) => setTimeout(r, 250));

    const baseDelay = scenario.processingTimeMonths;
    const compensationBenefit = (scenario.compensationMultiplier - 1.0) * 4.5;
    const efficiencyBenefit = (scenario.adminEfficiencyPercent / 100) * 3.5;
    const disputePenalty = (scenario.legalDisputeProbPercent / 100) * 5.0;

    let expectedDelay = baseDelay - compensationBenefit - efficiencyBenefit + disputePenalty;
    expectedDelay = Math.max(Number(expectedDelay.toFixed(1)), 2.0);

    const affectedPop = Math.round(scenario.affectedFamiliesCount * 4.6);
    const costPerFamilyCr = 0.12 * scenario.compensationMultiplier;
    const financialImpact = Number((scenario.affectedFamiliesCount * costPerFamilyCr).toFixed(1));

    let riskLevel: RiskLevel = 'LOW';
    if (expectedDelay > 12) riskLevel = 'MEDIUM';
    if (expectedDelay > 18) riskLevel = 'HIGH';

    const completionProb = Math.min(Math.max(Math.round(100 - expectedDelay * 3.8 + scenario.adminEfficiencyPercent * 0.3), 15), 98);

    return {
      expectedDelayMonths: expectedDelay,
      estimatedAffectedPopulation: affectedPop,
      financialImpactCr: financialImpact,
      riskLevel,
      completionProbabilityPercent: completionProb,
      historicalComparisonData: [
        { name: 'Average Delay (Months)', currentScenario: 18.5, proposedScenario: expectedDelay },
        { name: 'Dispute Rate (%)', currentScenario: 42, proposedScenario: scenario.legalDisputeProbPercent },
        { name: 'Completion Rate (%)', currentScenario: 54, proposedScenario: completionProb },
      ]
    };
  },

  // Bhoomi AI RAG API
  async askBhoomiAI(prompt: string): Promise<BhoomiChatMessage> {
    await new Promise((r) => setTimeout(r, 500));
    const p = prompt.toLowerCase();

    let responseText = "Based on national land governance database queries and empirical research under RFCTLARR 2013, land acquisition delays in India stem primarily from 3 interconnected factors: (1) Compensation disbursement disputes, (2) Gram Sabha consent verification gaps in Schedule V areas, and (3) Non-functional R&R resettlement monitoring.";
    let sources: BhoomiChatMessage['sources'] = [
      { title: 'Evaluating Land Acquisition Delays in Indian Infrastructure', type: 'Research', id: 'res-1' },
      { title: 'Raigarh-Surguja Industrial Highway (NH-CG-2024-04)', type: 'Project', id: 'proj-cg-01' }
    ];

    if (p.includes('chhattisgarh') || p.includes('high risk')) {
      responseText = "Database Query Result: In Chhattisgarh, the primary high-risk project is the **Raigarh-Surguja Industrial Highway Corridor (NH-CG-2024-04)** with a Risk Score of **78/100 (HIGH RISK)**. Major bottlenecks include 18 pending legal cases in the High Court related to Gram Sabha consent verification under PESA, and a compensation disbursement rate of only 46.6%.";
      sources = [
        { title: 'Raigarh-Surguja Industrial Highway (NH-43)', type: 'Project', id: 'proj-cg-01' },
        { title: 'Tribal Land Rights & FRA 2006 Governance', type: 'Research', id: 'res-4' }
      ];
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources
    };
  },

  async getNotifications(): Promise<NotificationItem[]> {
    return JSON.parse(localStorage.getItem('bhoomi_db_notifications') || '[]');
  },

  resetDatabase() {
    dbService.resetToDefaultSeed();
  }
};
