import { Project, LandParcel, ResearchDocument, NotificationItem, User, AdminAuditLog, VillageSearchResult } from '../types';
import { MOCK_PROJECTS, MOCK_LAND_PARCELS, MOCK_RESEARCH, MOCK_NOTIFICATIONS, DEMO_USERS, ADMIN_AUDIT_LOGS_SEED } from '../data/mockData';

const DB_KEYS = {
  USERS: 'bhoomi_db_users',
  PROJECTS: 'bhoomi_db_projects',
  PARCELS: 'bhoomi_db_parcels',
  RESEARCH: 'bhoomi_db_research',
  NOTIFICATIONS: 'bhoomi_db_notifications',
  ADMIN_AUDIT: 'bhoomi_db_admin_audit',
};

export class BhoomiDatabaseService {
  private static instance: BhoomiDatabaseService;

  private constructor() {
    this.initDatabase();
  }

  public static getInstance(): BhoomiDatabaseService {
    if (!BhoomiDatabaseService.instance) {
      BhoomiDatabaseService.instance = new BhoomiDatabaseService();
    }
    return BhoomiDatabaseService.instance;
  }

  private initDatabase() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(DEMO_USERS));
    }
    if (!localStorage.getItem(DB_KEYS.PROJECTS)) {
      localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify(MOCK_PROJECTS));
    }
    if (!localStorage.getItem(DB_KEYS.PARCELS)) {
      localStorage.setItem(DB_KEYS.PARCELS, JSON.stringify(MOCK_LAND_PARCELS));
    }
    if (!localStorage.getItem(DB_KEYS.RESEARCH)) {
      localStorage.setItem(DB_KEYS.RESEARCH, JSON.stringify(MOCK_RESEARCH));
    }
    if (!localStorage.getItem(DB_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(MOCK_NOTIFICATIONS));
    }
    if (!localStorage.getItem(DB_KEYS.ADMIN_AUDIT)) {
      localStorage.setItem(DB_KEYS.ADMIN_AUDIT, JSON.stringify(ADMIN_AUDIT_LOGS_SEED));
    }
  }

  // --- USERS DATABASE & AUTH ---
  public getUsers(): User[] {
    const raw = localStorage.getItem(DB_KEYS.USERS);
    return raw ? JSON.parse(raw) : DEMO_USERS;
  }

  public registerUser(user: User): User {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return user;
  }

  // --- LAND PARCELS DATABASE CRUD ---
  public getLandParcels(): LandParcel[] {
    const raw = localStorage.getItem(DB_KEYS.PARCELS);
    return raw ? JSON.parse(raw) : MOCK_LAND_PARCELS;
  }

  public getLandParcelById(id: string): LandParcel | undefined {
    return this.getLandParcels().find((p) => p.id === id || p.parcelNumber === id);
  }

  public saveLandParcel(parcel: LandParcel, adminUser?: User): LandParcel {
    const parcels = this.getLandParcels();
    const idx = parcels.findIndex((p) => p.id === parcel.id || p.parcelNumber === parcel.parcelNumber);
    const oldValue = idx >= 0 ? JSON.stringify(parcels[idx]) : 'NEW RECORD';

    if (idx >= 0) {
      parcels[idx] = parcel;
    } else {
      parcels.push(parcel);
    }
    localStorage.setItem(DB_KEYS.PARCELS, JSON.stringify(parcels));

    if (adminUser) {
      this.recordAdminAudit({
        id: `aud-${Date.now()}`,
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: idx >= 0 ? 'UPDATE_PARCEL' : 'ADD_PARCEL',
        parcelId: parcel.parcelNumber,
        fieldName: 'Land Parcel Full Record',
        oldValue: oldValue.slice(0, 100) + '...',
        newValue: `Updated Status: ${parcel.usability.status}, Verification: ${parcel.verificationStatus}`,
        timestamp: new Date().toLocaleString(),
      });
    }

    return parcel;
  }

  public deleteLandParcel(id: string, adminUser: User): void {
    const parcels = this.getLandParcels().filter((p) => p.id !== id && p.parcelNumber !== id);
    localStorage.setItem(DB_KEYS.PARCELS, JSON.stringify(parcels));

    this.recordAdminAudit({
      id: `aud-${Date.now()}`,
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: 'DELETE_PARCEL',
      parcelId: id,
      fieldName: 'Land Parcel Record',
      oldValue: `Record ${id} Active`,
      newValue: 'DELETED',
      timestamp: new Date().toLocaleString(),
    });
  }

  public verifyLandParcel(id: string, adminUser: User): LandParcel | undefined {
    const parcel = this.getLandParcelById(id);
    if (parcel) {
      const oldVer = parcel.verificationStatus;
      parcel.verificationStatus = 'VERIFIED';
      parcel.verifiedBy = adminUser.name;
      parcel.lastUpdated = new Date().toISOString().split('T')[0];
      this.saveLandParcel(parcel);

      this.recordAdminAudit({
        id: `aud-${Date.now()}`,
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'VERIFY_PARCEL',
        parcelId: parcel.parcelNumber,
        fieldName: 'Verification Status',
        oldValue: oldVer,
        newValue: 'VERIFIED',
        timestamp: new Date().toLocaleString(),
      });
    }
    return parcel;
  }

  // --- SPATIAL BUFFER ANALYSIS QUERY ---
  public performBufferAnalysis(lat: number, lng: number, radiusKm: number): {
    affectedParcels: LandParcel[];
    affectedProjects: Project[];
    totalAreaHectares: number;
  } {
    const parcels = this.getLandParcels();
    const projects = this.getProjects();

    const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const affectedProjects = projects.filter(
      (p) => distanceKm(lat, lng, p.coordinates.lat, p.coordinates.lng) <= radiusKm
    );

    const affectedParcels = parcels.filter(
      (lp) => distanceKm(lat, lng, lp.center.lat, lp.center.lng) <= radiusKm
    );

    const totalAreaHectares = affectedParcels.reduce((sum, p) => sum + p.areaHectares, 0);

    return { affectedParcels, affectedProjects, totalAreaHectares: Number(totalAreaHectares.toFixed(1)) };
  }

  // --- SEARCH LAND ENGINE ---
  public searchLand(query: string): { parcels: LandParcel[]; villageSummary?: VillageSearchResult } {
    const parcels = this.getLandParcels();
    if (!query.trim()) return { parcels };

    const q = query.toLowerCase().trim();

    const matchedParcels = parcels.filter(
      (p) =>
        p.parcelNumber.toLowerCase().includes(q) ||
        p.khasraNumber.toLowerCase().includes(q) ||
        p.surveyNumber.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.tehsil.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q)
    );

    // Village level aggregation check
    const villageMatches = parcels.filter(
      (p) => p.village.toLowerCase().includes(q) || q.includes(p.village.toLowerCase())
    );
    let villageSummary: VillageSearchResult | undefined = undefined;

    if (villageMatches.length > 0) {
      const first = villageMatches[0];
      const totalArea = villageMatches.reduce((sum, item) => sum + item.areaHectares, 0);
      villageSummary = {
        village: first.village,
        district: first.district,
        tehsil: first.tehsil,
        state: first.state,
        totalParcels: villageMatches.length,
        totalAreaHectares: Number(totalArea.toFixed(1)),
        parcels: villageMatches,
      };
    }

    return { parcels: matchedParcels, villageSummary };
  }

  // --- ADMIN AUDIT LOGS ---
  public getAdminAuditLogs(): AdminAuditLog[] {
    const raw = localStorage.getItem(DB_KEYS.ADMIN_AUDIT);
    return raw ? JSON.parse(raw) : ADMIN_AUDIT_LOGS_SEED;
  }

  public recordAdminAudit(log: AdminAuditLog): void {
    const logs = this.getAdminAuditLogs();
    logs.unshift(log);
    localStorage.setItem(DB_KEYS.ADMIN_AUDIT, JSON.stringify(logs.slice(0, 100)));
  }

  // --- PROJECTS DATABASE ---
  public getProjects(): Project[] {
    const raw = localStorage.getItem(DB_KEYS.PROJECTS);
    return raw ? JSON.parse(raw) : MOCK_PROJECTS;
  }

  public saveProject(project: Project): Project {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) projects[idx] = project;
    else projects.push(project);
    localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify(projects));
    return project;
  }

  // --- RESEARCH DATABASE ---
  public getResearchDocs(): ResearchDocument[] {
    const raw = localStorage.getItem(DB_KEYS.RESEARCH);
    return raw ? JSON.parse(raw) : MOCK_RESEARCH;
  }

  // --- ADMIN DASHBOARD STATS ---
  public getAdminStats() {
    const users = this.getUsers();
    const parcels = this.getLandParcels();

    const verified = parcels.filter((p) => p.verificationStatus === 'VERIFIED').length;
    const pending = parcels.filter((p) => p.verificationStatus === 'PENDING VERIFICATION' || p.verificationStatus === 'UNVERIFIED').length;
    const legalCases = parcels.filter((p) => p.legal.caseExists).length;
    const underAcquisition = parcels.filter((p) => p.acquisition.acquisitionRequired).length;
    const restricted = parcels.filter((p) => p.usability.status === 'RESTRICTED' || p.usability.status === 'NOT USABLE').length;
    const highRisk = parcels.filter((p) => p.aiRisk.level === 'HIGH' || p.aiRisk.level === 'CRITICAL').length;

    return {
      totalUsers: users.length,
      totalParcels: parcels.length,
      verifiedParcels: verified,
      pendingVerification: pending,
      activeLegalCases: legalCases,
      landUnderAcquisition: underAcquisition,
      restrictedLand: restricted,
      highRiskParcels: highRisk,
    };
  }

  public resetToDefaultSeed() {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(DEMO_USERS));
    localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify(MOCK_PROJECTS));
    localStorage.setItem(DB_KEYS.PARCELS, JSON.stringify(MOCK_LAND_PARCELS));
    localStorage.setItem(DB_KEYS.RESEARCH, JSON.stringify(MOCK_RESEARCH));
    localStorage.setItem(DB_KEYS.ADMIN_AUDIT, JSON.stringify(ADMIN_AUDIT_LOGS_SEED));
  }
}

export const dbService = BhoomiDatabaseService.getInstance();
