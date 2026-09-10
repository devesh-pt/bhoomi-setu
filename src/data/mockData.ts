import { Project, ResearchDocument, NotificationItem, LandParcel, User, AdminAuditLog } from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Sanjeev Malhotra (IAS)',
    email: 'admin@bhoomi.gov.in',
    phone: '9999999999',
    password: 'admin123',
    role: 'admin',
    organization: 'Ministry of Land Resources & Governance',
    department: 'National Land Authority Admin Division',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    savedResearchIds: ['res-1', 'res-2'],
  },
  {
    id: 'usr-user-1',
    name: 'Vikram Singh',
    email: 'user@bhoomi.gov.in',
    phone: '9876543210',
    password: 'user123',
    role: 'user',
    organization: 'Public Citizen Access',
    department: 'Registered User Portal',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    savedResearchIds: [],
  },
  {
    id: 'usr-official-1',
    name: 'Dr. Rajesh Sharma',
    email: 'rajesh.sharma@niti.gov.in',
    phone: '9888888888',
    password: 'official123',
    role: 'official',
    organization: 'NITI Aayog / Ministry of Rural Development',
    department: 'Land Governance & Infra Division',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    savedResearchIds: ['res-1', 'res-3', 'res-7'],
  },
  {
    id: 'usr-researcher-1',
    name: 'Prof. Ananya Sen',
    email: 'ananya.sen@iim-b.ac.in',
    phone: '9777777777',
    password: 'researcher123',
    role: 'researcher',
    organization: 'Indian Institute of Management Bangalore',
    department: 'Center for Public Policy',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    savedResearchIds: ['res-2', 'res-4', 'res-5'],
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-cg-01',
    name: 'Raigarh-Surguja Industrial Highway Corridor (NH-43 Corridor)',
    code: 'NH-CG-2024-04',
    type: 'Highway',
    state: 'Chhattisgarh',
    district: 'Raigarh',
    coordinates: { lat: 21.8974, lng: 83.3950 },
    landRequiredHectares: 1450,
    landAcquiredHectares: 710,
    acquisitionProgressPercent: 48.9,
    startDate: '2023-04-15',
    targetCompletionDate: '2026-12-31',
    status: 'Delayed',
    riskScore: 78,
    riskLevel: 'HIGH',
    implementingAgency: 'National Highways Authority of India (NHAI)',
    description: '4-lane greenfield expressway connecting Raigarh industrial hub with Surguja mineral belt across forest and tribal land parcels.',
    compensation: {
      totalAffectedFamilies: 3240,
      totalApprovedAmountCr: 450.8,
      totalDisbursedAmountCr: 210.4,
      pendingDisbursementCr: 240.4,
      disbursementPercentage: 46.6,
    },
    rehabilitation: {
      targetFamilies: 890,
      resettledFamilies: 310,
      housingUnitsAllocated: 280,
      livelihoodSupportProvided: 190,
      progressPercentage: 34.8,
    },
    legalCasesCount: 18,
    legalCases: [
      {
        id: 'lc-1',
        caseNumber: 'WP(C)/2024/4891',
        court: 'Chhattisgarh High Court',
        issueType: 'Gram Sabha Consent & PESA Compliance',
        status: 'Stay Granted',
        filedDate: '2024-01-18',
        affectedAreaHectares: 240.5,
      },
      {
        id: 'lc-2',
        caseNumber: 'LA/2023/1102',
        court: 'District Civil Court Raigarh',
        issueType: 'Disputed Circle Rate Multiplier Valuation',
        status: 'Pending',
        filedDate: '2023-09-04',
        affectedAreaHectares: 85.0,
      }
    ]
  },
  {
    id: 'proj-mh-02',
    name: 'Vadhavan Port Rail Freight Corridor',
    code: 'DFC-MH-2023-11',
    type: 'Railway',
    state: 'Maharashtra',
    district: 'Palghar',
    coordinates: { lat: 19.9868, lng: 72.7169 },
    landRequiredHectares: 980,
    landAcquiredHectares: 820,
    acquisitionProgressPercent: 83.6,
    startDate: '2022-08-10',
    targetCompletionDate: '2025-10-30',
    status: 'Active',
    riskScore: 38,
    riskLevel: 'LOW',
    implementingAgency: 'Dedicated Freight Corridor Corporation of India (DFCCIL)',
    description: 'Dedicated rail freight linkage connecting upcoming Vadhavan mega port with western industrial freight nodes.',
    compensation: {
      totalAffectedFamilies: 1850,
      totalApprovedAmountCr: 720.0,
      totalDisbursedAmountCr: 685.2,
      pendingDisbursementCr: 34.8,
      disbursementPercentage: 95.1,
    },
    rehabilitation: {
      targetFamilies: 420,
      resettledFamilies: 390,
      housingUnitsAllocated: 390,
      livelihoodSupportProvided: 350,
      progressPercentage: 92.8,
    },
    legalCasesCount: 3,
    legalCases: [
      {
        id: 'lc-3',
        caseNumber: 'PIL/2023/881',
        court: 'Bombay High Court',
        issueType: 'Mangrove Buffer Zone Alignment',
        status: 'Resolved',
        filedDate: '2023-02-12',
        affectedAreaHectares: 14.2,
      }
    ]
  }
];

export const MOCK_LAND_PARCELS: LandParcel[] = [
  {
    id: 'P101',
    parcelNumber: 'P101',
    khasraNumber: '402/1-A',
    surveyNumber: 'SUR-CG-882',
    state: 'Chhattisgarh',
    district: 'Raigarh',
    tehsil: 'Gharghoda',
    village: 'Tamnar',
    city: 'Raigarh Suburb',
    areaHectares: 14.5,
    landUnit: 'Hectares',
    landCategory: 'Forest',
    currentLandUse: 'Dense Tribal Forest & Sal Belt',
    irrigated: false,
    governmentPrivate: 'Private',
    currentStatus: 'Contested Acquisition',
    
    ownerName: 'Rameshwar Tribal Agricultural Trust',
    ownershipType: 'Tribal / FRA',
    ownerVerificationStatus: 'VERIFIED',
    ownerCount: 4,

    projectId: 'proj-cg-01',
    coordinates: [
      [21.8974, 83.3950],
      [21.9020, 83.3980],
      [21.9010, 83.4050],
      [21.8950, 83.4010]
    ],
    center: { lat: 21.8974, lng: 83.3950 },
    disputeStatus: true,

    legal: {
      caseExists: true,
      caseNumber: 'WP(C)/2024/4891',
      court: 'Chhattisgarh High Court',
      caseType: 'Gram Sabha Consent Violation under PESA',
      caseStatus: 'Stay Order Active',
      caseDate: '2024-01-18',
      lastUpdated: '2026-08-15',
    },
    acquisition: {
      acquisitionRequired: true,
      acquisitionStage: 'Preliminary Notification',
      notificationStatus: 'Section 11 Issued',
      compensationStatus: '46.6% Disbursed (₹240.4 Cr Pending)',
      possessionStatus: '34.0% Physical Possession Taken',
      rehabilitationStatus: 'Housing Units Under Construction',
    },
    usability: {
      status: 'RESTRICTED',
      restrictionReason: 'Pending legal dispute in Chhattisgarh High Court & PESA Gram Sabha clearance requirement.',
    },
    aiRisk: {
      score: 78,
      level: 'HIGH',
      delayProbabilityPercent: 72,
      riskFactors: [
        'Active High Court Stay Injunction',
        'Compensation disbursement lag >50%',
        'Schedule V PESA Gram Sabha Consent Dispute'
      ],
      recommendations: [
        'Conduct fast-track video Gram Sabha consent verification',
        'Accelerate DBT compensation distribution to escrow account'
      ]
    },
    dataSource: 'Government Dataset',
    lastUpdated: '2026-09-01',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Revenue Nodal Officer Raigarh'
  },

  {
    id: 'P102',
    parcelNumber: 'P102',
    khasraNumber: '184/A-2',
    surveyNumber: 'SUR-MH-1049',
    state: 'Maharashtra',
    district: 'Palghar',
    tehsil: 'Dahanu',
    village: 'Rampur',
    city: 'Palghar Maritime Belt',
    areaHectares: 8.2,
    landUnit: 'Hectares',
    landCategory: 'Agricultural',
    currentLandUse: 'Chiku & Horticulture Farmland',
    irrigated: true,
    governmentPrivate: 'Private',
    currentStatus: 'Smooth Acquisition',

    ownerName: 'Vithalrao Kisan Patil & Sons',
    ownershipType: 'Private',
    ownerVerificationStatus: 'VERIFIED',
    ownerCount: 2,

    projectId: 'proj-mh-02',
    coordinates: [
      [19.9868, 72.7169],
      [19.9910, 72.7200],
      [19.9890, 72.7250],
      [19.9840, 72.7210]
    ],
    center: { lat: 19.9868, lng: 72.7169 },
    disputeStatus: false,

    legal: {
      caseExists: false,
    },
    acquisition: {
      acquisitionRequired: true,
      acquisitionStage: 'Compensation Disbursement',
      notificationStatus: 'Section 19 Declaration Complete',
      compensationStatus: '95.1% Disbursed',
      possessionStatus: '92.0% Possession Handed Over',
      rehabilitationStatus: 'Resettlement Completed',
    },
    usability: {
      status: 'USABLE',
      restrictionReason: 'Clear title & verified compensation distribution.',
    },
    aiRisk: {
      score: 22,
      level: 'LOW',
      delayProbabilityPercent: 12,
      riskFactors: ['Minor boundary verification check remaining'],
      recommendations: ['Proceed with final land transfer registration']
    },
    dataSource: 'Government Dataset',
    lastUpdated: '2026-09-05',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Collectorate Palghar'
  },

  {
    id: 'P103',
    parcelNumber: 'P103',
    khasraNumber: '92/3',
    surveyNumber: 'SUR-UP-441',
    state: 'Uttar Pradesh',
    district: 'Prayagraj',
    tehsil: 'Soraon',
    village: 'Rampur',
    city: 'Prayagraj Rural',
    areaHectares: 24.0,
    landUnit: 'Hectares',
    landCategory: 'Agricultural',
    currentLandUse: 'Triple-crop Wheat & Paddy Farmland',
    irrigated: true,
    governmentPrivate: 'Private',
    currentStatus: 'Under Judicial Assessment',

    ownerName: 'Rampur Farmers Co-operative Society',
    ownershipType: 'Private',
    ownerVerificationStatus: 'PENDING VERIFICATION',
    ownerCount: 14,

    coordinates: [
      [25.4358, 81.8463],
      [25.4400, 81.8500],
      [25.4380, 81.8550],
      [25.4330, 81.8510]
    ],
    center: { lat: 25.4358, lng: 81.8463 },
    disputeStatus: true,

    legal: {
      caseExists: true,
      caseNumber: 'WP/2023/12090',
      court: 'Allahabad High Court',
      caseType: 'Circle Rate Multiplication Factor Challenge',
      caseStatus: 'Hearing Adjourned',
      caseDate: '2023-11-02',
      lastUpdated: '2026-07-20',
    },
    acquisition: {
      acquisitionRequired: true,
      acquisitionStage: 'Declaration',
      notificationStatus: 'Section 19 Issued',
      compensationStatus: '60.0% Approved / Disbursement Delayed',
      possessionStatus: '45.0% Possession Taken',
      rehabilitationStatus: '49.6% R&R Housing Allocated',
    },
    usability: {
      status: 'UNDER REVIEW',
      restrictionReason: 'Solatium rate dispute pending in Allahabad High Court.',
    },
    aiRisk: {
      score: 71,
      level: 'HIGH',
      delayProbabilityPercent: 68,
      riskFactors: ['High Court solatium dispute', '14 co-sharers pending title verification'],
      recommendations: ['Establish direct mediation committee at Prayagraj Collectorate']
    },
    dataSource: 'Public Dataset',
    lastUpdated: '2026-08-28',
    verificationStatus: 'PENDING VERIFICATION',
    verifiedBy: 'Tehsildar Soraon'
  },

  {
    id: 'P104',
    parcelNumber: 'P104',
    khasraNumber: '14/B',
    surveyNumber: 'SUR-RJ-309',
    state: 'Rajasthan',
    district: 'Jodhpur',
    tehsil: 'Phalodi',
    village: 'Bhadla',
    city: 'Jodhpur Desert Zone',
    areaHectares: 120.0,
    landUnit: 'Hectares',
    landCategory: 'Barren',
    currentLandUse: 'Solar PV Array Installation Zone',
    irrigated: false,
    governmentPrivate: 'Government',
    currentStatus: 'Fully Transferred',

    ownerName: 'Rajasthan State Land Revenue Board',
    ownershipType: 'Government',
    ownerVerificationStatus: 'VERIFIED',
    ownerCount: 1,

    coordinates: [
      [26.2389, 73.0243],
      [26.2440, 73.0290],
      [26.2410, 73.0350],
      [26.2350, 73.0300]
    ],
    center: { lat: 26.2389, lng: 73.0243 },
    disputeStatus: false,

    legal: {
      caseExists: false,
    },
    acquisition: {
      acquisitionRequired: true,
      acquisitionStage: 'Possession Taken',
      notificationStatus: 'Completed',
      compensationStatus: 'Fully Disbursed',
      possessionStatus: '100% Possession Handed Over',
      rehabilitationStatus: 'N/A (Government Land)',
    },
    usability: {
      status: 'USABLE',
      restrictionReason: 'Government clear land encumbrance-free.',
    },
    aiRisk: {
      score: 15,
      level: 'LOW',
      delayProbabilityPercent: 5,
      riskFactors: ['None'],
      recommendations: ['Approved for immediate construction commencement']
    },
    dataSource: 'Government Dataset',
    lastUpdated: '2026-09-08',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'RRECL Nodal Officer'
  },

  {
    id: 'P105',
    parcelNumber: 'P105',
    khasraNumber: '501/7',
    surveyNumber: 'SUR-MP-612',
    state: 'Madhya Pradesh',
    district: 'Panna',
    tehsil: 'Amanganj',
    village: 'Kishangarh',
    city: 'Panna Tiger Buffer',
    areaHectares: 65.0,
    landUnit: 'Hectares',
    landCategory: 'Forest',
    currentLandUse: 'Panna Tiger Reserve Core Buffer Zone',
    irrigated: false,
    governmentPrivate: 'Government',
    currentStatus: 'Critically Restricted',

    ownerName: 'Forest Department MP & Wildlife Board',
    ownershipType: 'Government',
    ownerVerificationStatus: 'VERIFIED',
    ownerCount: 1,

    coordinates: [
      [24.7208, 80.1852],
      [24.7260, 80.1900],
      [24.7230, 80.1960],
      [24.7180, 80.1910]
    ],
    center: { lat: 24.7208, lng: 80.1852 },
    disputeStatus: true,

    legal: {
      caseExists: true,
      caseNumber: 'PIL/2024/104',
      court: 'Supreme Court of India',
      caseType: 'Wild Life Protection Act Conservation Challenge',
      caseStatus: 'Supreme Court Stay Order',
      caseDate: '2024-02-10',
      lastUpdated: '2026-09-02',
    },
    acquisition: {
      acquisitionRequired: true,
      acquisitionStage: 'Preliminary Notification',
      notificationStatus: 'Stage-II Forest Clearance Pending',
      compensationStatus: '41.8% Disbursed',
      possessionStatus: 'Blocked by Forest Injunction',
      rehabilitationStatus: '30.9% Relocation Progress',
    },
    usability: {
      status: 'NOT USABLE',
      restrictionReason: 'Supreme Court stay order under Wildlife Protection Act & Panna Tiger Sanctuary buffer zone rules.',
    },
    aiRisk: {
      score: 88,
      level: 'CRITICAL',
      delayProbabilityPercent: 92,
      riskFactors: [
        'Supreme Court Wildlife Bench Injunction Stay',
        'National Board for Wildlife clearance rejected',
        'Submergence of 2.1 lakh tiger corridor trees'
      ],
      recommendations: [
        'Redesign river interlinking canal tunnel alignment outside sanctuary boundary',
        'File compensatory afforestation affidavit in Supreme Court'
      ]
    },
    dataSource: 'Authorized Department',
    lastUpdated: '2026-09-06',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Chief Conservator of Forests MP'
  }
];

export const MOCK_RESEARCH: ResearchDocument[] = [
  {
    id: 'res-1',
    title: 'Evaluating Land Acquisition Delays in Indian Infrastructure: Empirical Evidence from 1,200 Projects (2014–2024)',
    abstract: 'This national empirical study examines the primary bottlenecks causing time and cost overruns in major transport, energy, and irrigation land acquisitions across India under RFCTLARR 2013. The findings reveal that compensation disbursement disputes and non-functional R&R monitoring account for 64% of total project delays.',
    authors: ['Dr. Ramesh Chandra', 'Dr. Sunita Kulkarni', 'Prof. Arvind Nambiar'],
    year: 2024,
    publication: 'Journal of Indian Land Policy & Governance',
    documentType: 'Empirical Study',
    organization: 'NITI Aayog & IIPA New Delhi',
    topics: ['Land Acquisition', 'Compensation', 'Rehabilitation & Resettlement', 'Infrastructure'],
    stateFocus: ['Chhattisgarh', 'Odisha', 'Uttar Pradesh', 'Maharashtra'],
    citationsCount: 142,
    relevanceScore: 98,
    aiSummary: {
      keyFindings: [
        'Average land acquisition delay across highway projects is 14.2 months, while irrigation projects experience 22.6 months delay.',
        'Gram Sabha consent verification and PESA compliance ambiguity in Schedule V areas represent 38% of judicial stays.',
        'Digital titling integration (DILRMP) reduced land identity disputes by 41% in early adopting districts.'
      ],
      methodology: 'Mixed-methods research combining econometrics on 1,248 Ministry of Statistics & Programme Implementation (MOSPI) project files with 320 field interviews of displaced landholders across 8 states.',
      keyStatistics: [
        '64% of total project delays stem from compensation disbursement gaps.',
        'Average time to resolve land title litigation in High Courts is 4.3 years.',
        'Projects utilizing real-time digital GIS compensation tracking experienced 52% faster possession timelines.'
      ],
      policyImplications: [
        'Mandate digital escrow mechanisms for instantaneous direct benefit transfer (DBT) of land compensation.',
        'Establish specialized Land Acquisition Benches at the High Court level for time-bound 90-day dispute resolution.',
        'Standardize GIS-overlay verification before issuing Section 11 preliminary notifications.'
      ],
      limitations: ['Study excludes private municipal land acquisitions under state-specific urban planning acts.'],
      relatedResearchIds: ['res-3', 'res-5']
    }
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'High Risk Alert: Parcel P101 (Tamnar, Chhattisgarh)',
    message: 'Tamnar forest parcel P101 marked RESTRICTED due to High Court PESA stay injunction.',
    timestamp: '10 minutes ago',
    read: false,
    type: 'risk_alert',
    projectId: 'proj-cg-01'
  },
  {
    id: 'notif-2',
    title: 'New Land Record Verified',
    message: 'Palghar Rampur Parcel P102 verified by Collectorate Palghar as USABLE.',
    timestamp: '1 hour ago',
    read: false,
    type: 'compensation_milestone',
    projectId: 'proj-mh-02'
  }
];

export const ADMIN_AUDIT_LOGS_SEED: AdminAuditLog[] = [
  {
    id: 'aud-101',
    adminId: 'usr-admin-1',
    adminName: 'Sanjeev Malhotra (IAS)',
    action: 'UPDATE_ACQUISITION',
    parcelId: 'P102',
    fieldName: 'Acquisition Stage',
    oldValue: 'Preliminary Notification',
    newValue: 'Compensation Disbursement',
    timestamp: '2026-09-09 19:30:15'
  },
  {
    id: 'aud-102',
    adminId: 'usr-admin-1',
    adminName: 'Sanjeev Malhotra (IAS)',
    action: 'VERIFY_PARCEL',
    parcelId: 'P102',
    fieldName: 'Verification Status',
    oldValue: 'PENDING VERIFICATION',
    newValue: 'VERIFIED',
    timestamp: '2026-09-09 19:15:40'
  }
];
