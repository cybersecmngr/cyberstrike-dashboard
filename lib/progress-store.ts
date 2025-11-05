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
  discovery_progress?: {
    stage?: string;
    message?: string;
    endpoints_found?: number;
    scanned?: number;
    total?: number;
    found?: number;
    [key: string]: unknown;
  };
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
// Use global variable to persist across hot reloads in Next.js development
declare global {
  var __progressStore: Map<string, ProgressStoreItem> | undefined;
}

if (!global.__progressStore) {
  global.__progressStore = new Map<string, ProgressStoreItem>();
}

const progressStore = global.__progressStore;

export { progressStore, type ProgressStoreItem, type ProgressUpdate };

