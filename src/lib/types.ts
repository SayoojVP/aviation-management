// ─── Enums ───────────────────────────────────────────────────────────────────

export enum UserRole {
  PILOT = "PILOT",
  FLEET_MANAGER = "FLEET_MANAGER",
  ADMIN = "ADMIN",
}

export enum AircraftCategory {
  SINGLE_ENGINE_LAND = "SINGLE_ENGINE_LAND",
  MULTI_ENGINE_LAND = "MULTI_ENGINE_LAND",
  SINGLE_ENGINE_SEA = "SINGLE_ENGINE_SEA",
  MULTI_ENGINE_SEA = "MULTI_ENGINE_SEA",
  HELICOPTER = "HELICOPTER",
  GLIDER = "GLIDER",
  TURBOPROP = "TURBOPROP",
  JET = "JET",
}

export enum WeatherCondition {
  VMC = "VMC",   // Visual Meteorological Conditions
  IMC = "IMC",   // Instrument Meteorological Conditions
}

export enum FlightRule {
  VFR = "VFR",
  IFR = "IFR",
}

export enum MaintenanceCheckType {
  ANNUAL = "ANNUAL",
  HUNDRED_HOUR = "HUNDRED_HOUR",
  FIFTY_HOUR = "FIFTY_HOUR",
  PHASE = "PHASE",
  UNSCHEDULED = "UNSCHEDULED",
  AD_COMPLIANCE = "AD_COMPLIANCE",   // Airworthiness Directive
}

export enum MaintenanceStatus {
  DUE = "DUE",
  OVERDUE = "OVERDUE",
  COMPLETED = "COMPLETED",
  IN_PROGRESS = "IN_PROGRESS",
}

export enum AircraftStatus {
  AIRWORTHY = "AIRWORTHY",
  GROUNDED = "GROUNDED",
  MAINTENANCE = "MAINTENANCE",
}

// ─── Base Entity ─────────────────────────────────────────────────────────────

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  certificateNumber?: string;    // FAA Certificate #
  medicalClass?: string;
  medicalExpiry?: string;
  avatarInitials: string;
}

// ─── Aircraft (base) ─────────────────────────────────────────────────────────

export interface Aircraft extends BaseEntity {
  tailNumber: string;            // e.g. N12345
  make: string;
  model: string;
  year: number;
  category: AircraftCategory;
  totalAirframeHours: number;
  status: AircraftStatus;
  engineCount: number;
  maxPassengers: number;
  ownerId?: string;
  imageUrl?: string;
}

// ─── Subtypes (OOP Inheritance pattern) ──────────────────────────────────────

export interface SingleEngineAircraft extends Aircraft {
  category: AircraftCategory.SINGLE_ENGINE_LAND | AircraftCategory.SINGLE_ENGINE_SEA;
}

export interface MultiEngineAircraft extends Aircraft {
  category: AircraftCategory.MULTI_ENGINE_LAND | AircraftCategory.MULTI_ENGINE_SEA;
  engineCount: 2 | 3 | 4;
}

export interface Helicopter extends Aircraft {
  category: AircraftCategory.HELICOPTER;
  rotorDiameter?: number;
}

// ─── Flight Log Entry ────────────────────────────────────────────────────────

export interface FlightLogEntry extends BaseEntity {
  pilotId: string;
  aircraftId: string;
  aircraftTailNumber: string;
  aircraftModel: string;
  date: string;                  // ISO date string YYYY-MM-DD
  departureAirport: string;      // ICAO code
  arrivalAirport: string;
  totalFlightTime: number;       // decimal hours
  picTime: number;               // Pilot In Command hours
  sicTime: number;               // Second In Command hours
  dualReceivedTime: number;
  soloTime: number;
  nightTime: number;
  ifrTime: number;
  crossCountryTime: number;
  dayLandings: number;
  nightLandings: number;
  weatherCondition: WeatherCondition;
  flightRule: FlightRule;
  remarks?: string;
  approachTypes?: string[];
  simulatorTime?: number;
}

// ─── Maintenance Record ───────────────────────────────────────────────────────

export interface MaintenanceRecord extends BaseEntity {
  aircraftId: string;
  aircraftTailNumber: string;
  checkType: MaintenanceCheckType;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  hoursAtCheck: number;
  nextDueHours?: number;
  nextDueDate?: string;
  technician?: string;
  squawks?: string;              // Defects found
  cost?: number;
  notes?: string;
}

// ─── Aggregated Stats (computed by business logic) ──────────────────────────

export interface PilotFlightStats {
  totalTime: number;
  picTime: number;
  sicTime: number;
  nightTime: number;
  ifrTime: number;
  crossCountryTime: number;
  dualReceived: number;
  soloTime: number;
  totalLandings: number;
  nightLandings: number;
  last30Days: number;
  last90Days: number;
  lastYear: number;
  byAircraftCategory: Record<string, number>;
}

export interface MaintenanceAlert {
  aircraftId: string;
  tailNumber: string;
  checkType: MaintenanceCheckType;
  status: MaintenanceStatus;
  daysUntilDue: number;
  hoursUntilDue: number;
  urgency: "CRITICAL" | "WARNING" | "INFO";
}

export interface FleetStats {
  totalAircraft: number;
  airworthyCount: number;
  groundedCount: number;
  maintenanceCount: number;
  overdueChecks: number;
  dueSoonChecks: number;
  totalFleetHours: number;
}
