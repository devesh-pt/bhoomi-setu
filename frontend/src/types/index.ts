export type UserRole = 'user' | 'admin' | 'official' | 'researcher' | 'institution' | 'public';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  organization: string;
  department?: string;
  avatarUrl?: string;
  savedResearchIds: string[];
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProjectType = 'Highway' | 'Railway' | 'Irrigation' | 'Industrial Corridor' | 'Rural Infrastructure';
export type VerificationStatus = 'VERIFIED' | 'PENDING VERIFICATION' | 'UNVERIFIED';
export type DataSourceType = 'Government Dataset' | 'Authorized Department' | 'Public Dataset' | 'User Submitted' | 'Demo Dataset';
export type UsabilityStatus = 'USABLE' | 'UNDER REVIEW' | 'RESTRICTED' | 'NOT USABLE';
export type AcquisitionStage = 'Not Under Acquisition' | 'Preliminary Notification' | 'Declaration' | 'SIA Completed' | 'Compensation Disbursement' | 'Possession Taken' | 'Rehabilitation';

export interface LegalCase {
  id: string;
  caseNumber: string;
  court: string;
  issueType: string;
  status: 'Pending' | 'Resolved' | 'Stay Granted';
  filedDate: string;
  affectedAreaHectares: number;
  lastUpdated?: string;
}

export interface CompensationRecord {
  totalAffectedFamilies: number;
  totalApprovedAmountCr: number;
  totalDisbursedAmountCr: number;
  pendingDisbursementCr: number;
  disbursementPercentage: number;
}

export interface RehabilitationRecord {
  targetFamilies: number;
  resettledFamilies: number;
  housingUnitsAllocated: number;
  livelihoodSupportProvided: number;
  progressPercentage: number;
}

export interface RiskPrediction {
  projectId: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  delayProbabilityPercent: number;
  estimatedDelayMonths: number;
  legalRiskLevel: RiskLevel;
  compensationRiskLevel: RiskLevel;
  rehabilitationRiskLevel: RiskLevel;
  riskCauses: string[];
  recommendedActions: string[];
  lastCalculated: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  type: ProjectType;
  state: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  landRequiredHectares: number;
  landAcquiredHectares: number;
  acquisitionProgressPercent: number;
  startDate: string;
  targetCompletionDate: string;
  status: 'Active' | 'Delayed' | 'Under Review' | 'Completed';
  riskScore: number;
  riskLevel: RiskLevel;
  compensation: CompensationRecord;
  rehabilitation: RehabilitationRecord;
  legalCasesCount: number;
  legalCases: LegalCase[];
  description: string;
  implementingAgency: string;
}

export interface ParcelLegalInfo {
  caseExists: boolean;
  caseNumber?: string;
  court?: string;
  caseType?: string;
  caseStatus?: string;
  caseDate?: string;
  lastUpdated?: string;
}

export interface ParcelAcquisitionInfo {
  acquisitionRequired: boolean;
  acquisitionStage: AcquisitionStage;
  notificationStatus: string;
  compensationStatus: string;
  possessionStatus: string;
  rehabilitationStatus: string;
}

export interface ParcelUsabilityInfo {
  status: UsabilityStatus;
  restrictionReason?: string;
}

export interface ParcelAIRiskInfo {
  score: number;
  level: RiskLevel;
  delayProbabilityPercent: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface LandParcel {
  id: string;
  parcelNumber: string; // Parcel ID
  khasraNumber: string;
  surveyNumber: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  city: string;
  areaHectares: number;
  landUnit: 'Hectares' | 'Acres' | 'Sq. Meters';
  landCategory: 'Agricultural' | 'Forest' | 'Industrial' | 'Barren' | 'Residential';
  currentLandUse: string;
  irrigated: boolean;
  governmentPrivate: 'Government' | 'Private' | 'Community';
  currentStatus: string;
  
  // Ownership
  ownerName: string;
  ownershipType: 'Private' | 'Government' | 'Community' | 'Tribal / FRA';
  ownerVerificationStatus: VerificationStatus;
  ownerCount: number;

  // Spatial & Geometrical
  projectId?: string;
  coordinates: [number, number][]; // Polygon coordinates
  center: { lat: number; lng: number };
  disputeStatus: boolean;

  // Status Modules
  legal: ParcelLegalInfo;
  acquisition: ParcelAcquisitionInfo;
  usability: ParcelUsabilityInfo;
  aiRisk: ParcelAIRiskInfo;

  // Data Provenance & Audit
  dataSource: DataSourceType;
  lastUpdated: string;
  verificationStatus: VerificationStatus;
  verifiedBy: string;
}

export interface VillageSearchResult {
  village: string;
  district: string;
  tehsil: string;
  state: string;
  totalParcels: number;
  totalAreaHectares: number;
  parcels: LandParcel[];
}

export interface ResearchDocument {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  publication: string;
  documentType: 'Policy Paper' | 'Empirical Study' | 'Evaluation Report' | 'Dataset Summary' | 'Legal Analysis';
  organization: string;
  topics: string[];
  stateFocus: string[];
  citationsCount: number;
  pdfUrl?: string;
  relevanceScore?: number;
  aiSummary?: {
    keyFindings: string[];
    methodology: string;
    keyStatistics: string[];
    policyImplications: string[];
    limitations: string[];
    relatedResearchIds: string[];
  };
}

export interface PolicyScenario {
  compensationMultiplier: number;
  processingTimeMonths: number;
  affectedFamiliesCount: number;
  legalDisputeProbPercent: number;
  adminEfficiencyPercent: number;
  rehabilitationRatePercent: number;
}

export interface PolicyImpact {
  expectedDelayMonths: number;
  estimatedAffectedPopulation: number;
  financialImpactCr: number;
  riskLevel: RiskLevel;
  completionProbabilityPercent: number;
  historicalComparisonData: {
    name: string;
    currentScenario: number;
    proposedScenario: number;
  }[];
}

export interface BhoomiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: {
    title: string;
    type: 'Research' | 'Project' | 'Policy Clause';
    id: string;
    url?: string;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'risk_alert' | 'research_update' | 'compensation_milestone' | 'policy_simulation';
  projectId?: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  parcelId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}
