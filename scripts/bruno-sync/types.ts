export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface EndpointMeta {
  module: string;          // e.g. "application/good-received-note"
  moduleSlug: string;      // e.g. "good-received-note" (used for folder resolution)
  controllerPath: string;
  method: HttpMethod;
  methodPath: string;
  fullPath: string;        // normalized: "/api/good-received-note/:id"
  methodName: string;      // e.g. "findOne"
  pathParams: string[];
  queryParams: string[];
  bodyDto?: string;
  isPublic: boolean;
  sourceFile: string;      // absolute path of .controller.ts
}

export interface BodySchema {
  kind: 'class' | 'zod' | 'unknown';
  dtoName: string;
  skeleton: Record<string, unknown> | unknown[];
  warnings: string[];
}

export interface BruSections {
  meta?: Record<string, string>;
  method?: { verb: string; body: string };
  headers?: string;
  auth?: Record<string, string>;
  query?: string;
  body_json?: string;
  vars_pre_request?: string;
  vars_post_response?: string;
  script_pre_request?: string;
  script_post_response?: string;
  tests?: string;
  docs?: string;
  unknown: Record<string, string>; // preserve unrecognized sections
}

export interface BruFile {
  path: string;            // absolute
  relativePath: string;    // relative to Bruno collection root
  sections: BruSections;
}

export interface DiffResult {
  created: { endpoint: EndpointMeta; targetPath: string }[];
  updated: { endpoint: EndpointMeta; bru: BruFile }[];
  orphaned: BruFile[];
  warnings: string[];
}

export interface SyncReport {
  addedCount: number;
  updatedCount: number;
  archivedCount: number;
  warnings: string[];
  parseErrors: string[];
  dryRun: boolean;
}
