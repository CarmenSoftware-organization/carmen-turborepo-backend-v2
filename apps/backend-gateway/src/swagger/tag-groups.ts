export type SwaggerTag = {
  name: string;
  description: string;
};

export type SwaggerTagGroup = {
  name: string;
  tags: string[];
};

export const SWAGGER_TAGS: SwaggerTag[] = [
  // Group 1 — Getting Started (2)
  { name: 'Authentication', description: 'Login, logout, password change, token refresh via Keycloak' },
  { name: 'App Info',        description: 'App-level metadata, version, health' },

  // Group 2 — Platform Administration (9)
  { name: 'Platform: Clusters',                description: 'Tenant clusters (hotel chains / franchise groups)' },
  { name: 'Platform: Business Units',          description: 'BU registration, activation, subscriptions' },
  { name: 'Platform: Users',                   description: 'Platform-level users (cross-BU)' },
  { name: 'Platform: User ↔ Cluster',          description: 'Assign users to clusters' },
  { name: 'Platform: User ↔ Business Unit',    description: 'Assign users to business units' },
  { name: 'Platform: Application Roles',       description: 'Define application-level roles' },
  { name: 'Platform: Application Permissions', description: 'Define application-level permissions' },
  { name: 'Platform: Role ↔ Permission',       description: 'Bind permissions to roles' },
  { name: 'Platform: Report Templates',        description: 'Platform-wide report template catalog' },

  // Group 3 — Business Unit Configuration (12)
  { name: 'Config: Currencies & FX',     description: 'Currencies, exchange rates' },
  { name: 'Config: Locations',           description: 'Locations, location-user, product-location, delivery points' },
  { name: 'Config: Departments',         description: 'Departments, department-user assignments' },
  { name: 'Config: Products',            description: 'Products, categories, sub-categories, item groups' },
  { name: 'Config: Units',               description: 'Units of measure, unit conversions' },
  { name: 'Config: Vendors',             description: 'Vendors, vendor business types, credit terms, credit-note reasons' },
  { name: 'Config: Tax & Cost Types',    description: 'Tax profiles, adjustment types, extra-cost types' },
  { name: 'Config: Recipes',             description: 'Recipe, category, cuisine, equipment, equipment-category' },
  { name: 'Config: Price Lists',         description: 'Price list master data' },
  { name: 'Config: Workflows',           description: 'Workflow definitions' },
  { name: 'Config: Roles & Permissions', description: 'BU-level role/permission binding' },
  { name: 'Config: System',              description: 'App-config, running codes, SQL query runner, dimensions' },

  // Group 4 — Procurement (5)
  { name: 'Procurement: Purchase Requests',   description: 'PR header, details, templates, comments' },
  { name: 'Procurement: Purchase Orders',     description: 'PO header, details, comments' },
  { name: 'Procurement: Good Received Notes', description: 'GRN header, details, comments' },
  { name: 'Procurement: Credit Notes',        description: 'Credit notes, reasons, details, comments' },
  { name: 'Procurement: Store Requisitions',  description: 'SR header, details, comments' },

  // Group 5 — Inventory (4)
  { name: 'Inventory: Stock In',       description: 'Stock-in header, details, comments' },
  { name: 'Inventory: Stock Out',      description: 'Stock-out header, details, comments' },
  { name: 'Inventory: Transfers',      description: 'Transfer header, details, comments' },
  { name: 'Inventory: Physical Count', description: 'Physical count, periods, details, comments' },

  // Group 6 — Workflow & Approval (1)
  { name: 'Workflow: Operations', description: 'Runtime workflow state transitions and comments' },

  // Group 7 — Reporting & Insights (3)
  { name: 'Reports: Dashboard',         description: 'Aggregated KPI endpoints for dashboards' },
  { name: 'Reports: Activity Log',      description: 'Audit trail / activity feed' },
  { name: 'Documents: File Management', description: 'Attachment upload/download, document metadata' },

  // Group 8 — Notifications (1)
  { name: 'Notifications', description: 'REST endpoints for notifications. WebSocket server at /ws documented here.' },

  // Group 9 — User Profile & Access (1)
  { name: 'User: Profile', description: 'Current user profile, BU assignments, and location assignments' },
];

export const SWAGGER_TAG_GROUPS: SwaggerTagGroup[] = [
  { name: 'Getting Started', tags: ['Authentication', 'App Info'] },
  {
    name: 'Platform Administration',
    tags: [
      'Platform: Clusters',
      'Platform: Business Units',
      'Platform: Users',
      'Platform: User ↔ Cluster',
      'Platform: User ↔ Business Unit',
      'Platform: Application Roles',
      'Platform: Application Permissions',
      'Platform: Role ↔ Permission',
      'Platform: Report Templates',
    ],
  },
  {
    name: 'Business Unit Configuration',
    tags: [
      'Config: Currencies & FX',
      'Config: Locations',
      'Config: Departments',
      'Config: Products',
      'Config: Units',
      'Config: Vendors',
      'Config: Tax & Cost Types',
      'Config: Recipes',
      'Config: Price Lists',
      'Config: Workflows',
      'Config: Roles & Permissions',
      'Config: System',
    ],
  },
  {
    name: 'Procurement',
    tags: [
      'Procurement: Purchase Requests',
      'Procurement: Purchase Orders',
      'Procurement: Good Received Notes',
      'Procurement: Credit Notes',
      'Procurement: Store Requisitions',
    ],
  },
  {
    name: 'Inventory',
    tags: [
      'Inventory: Stock In',
      'Inventory: Stock Out',
      'Inventory: Transfers',
      'Inventory: Physical Count',
    ],
  },
  {
    name: 'Workflow & Approval',
    tags: ['Workflow: Operations'],
  },
  {
    name: 'Reporting & Insights',
    tags: [
      'Reports: Dashboard',
      'Reports: Activity Log',
      'Documents: File Management',
    ],
  },
  { name: 'Notifications', tags: ['Notifications'] },
  {
    name: 'User Profile & Access',
    tags: ['User: Profile'],
  },
];
