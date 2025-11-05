// Shared progress store for AI Full Auto Pentest
// In production, use Redis or a proper database

interface ProgressUpdate {
  stage: string;
  status: string;
  message?: string;
  endpoints_found?: number;
  attack_surface_score?: number;
  vulnerabilities_found?: number;
  high_risk?: number;
  payloads_generated?: number;
  crashes?: number;
  exploits_successful?: number;
  access_gained?: boolean;
  critical_findings?: number;
  bypass_payloads?: number;
  [key: string]: unknown;
}

interface ProgressStoreItem {
  currentStage: string;
  stageProgress: Record<string, ProgressUpdate>;
  result: {
    target?: string;
    stages?: unknown[];
    vulnerabilities_found?: unknown[];
    risk_score?: number;
    recommendations?: string[];
    status?: string;
    summary?: unknown;
  } | null;
  completed: boolean;
}

// Shared in-memory store (in production, use Redis)
const progressStore = new Map<string, ProgressStoreItem>();

export { progressStore, type ProgressStoreItem, type ProgressUpdate };

