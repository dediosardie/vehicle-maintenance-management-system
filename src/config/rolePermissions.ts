/**
 * ROLE-BASED ACCESS CONTROL (RBAC) CONFIGURATION
 * 
 * This file defines ALL user roles and their allowed responsibilities.
 * These rules MUST be enforced consistently across:
 * - UI visibility
 * - Feature access
 * - Backend logic
 * - Supabase Row Level Security (RLS)
 * 
 * Anything NOT explicitly allowed is FORBIDDEN.
 */

export type UserRole = 
  | 'fleet_manager' 
  | 'maintenance_team' 
  | 'driver' 
  | 'administration' 
  | 'client_company_liaison';

export type Permission = 
  | 'vehicles:read'
  | 'vehicles:create'
  | 'vehicles:update'
  | 'vehicles:delete'
  | 'maintenance:read'
  | 'maintenance:create'
  | 'maintenance:update'
  | 'maintenance:delete'
  | 'drivers:read'
  | 'drivers:create'
  | 'drivers:update'
  | 'drivers:delete'
  | 'drivers:performance'
  | 'trips:read'
  | 'trips:create'
  | 'trips:update'
  | 'trips:delete'
  | 'fuel:read'
  | 'fuel:create'
  | 'fuel:update'
  | 'fuel:delete'
  | 'incidents:read'
  | 'incidents:create'
  | 'incidents:update'
  | 'incidents:delete'
  | 'reports:read'
  | 'reports:create'
  | 'reports:configure'
  | 'leasing:read'
  | 'leasing:create'
  | 'leasing:update'
  | 'leasing:delete'
  | 'disposal:read'
  | 'disposal:create'
  | 'disposal:update'
  | 'disposal:delete'
  | 'compliance:read'
  | 'compliance:create'
  | 'compliance:update'
  | 'compliance:delete'
  | 'analytics:read'
  | 'system:configure'
  | 'users:read'
  | 'users:manage';

export type Module = 
  | 'vehicles'
  | 'maintenance'
  | 'drivers'
  | 'trips'
  | 'fuel'
  | 'incidents'
  | 'reports'
  | 'compliance'
  | 'disposal'
  | 'analytics'
  | 'users';

/**
 * Role Permissions Matrix
 * Defines what each role is explicitly allowed to do
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Fleet Manager: Oversee entire fleet operations
  fleet_manager: [
    'vehicles:read',
    'vehicles:create',
    'vehicles:update',
    'maintenance:read',
    'maintenance:create',
    'maintenance:update',
    'drivers:read',
    'drivers:performance',
    'trips:read',
    'fuel:read',
    'incidents:read',
    'reports:read',
    'leasing:read',
    'leasing:create',
    'leasing:update',
    'disposal:read',
    'compliance:read',
    'analytics:read',
  ],

  // Maintenance Team: Perform maintenance and repairs
  maintenance_team: [
    'vehicles:read',
    'maintenance:read',
    'maintenance:create',
    'maintenance:update',
    'incidents:read', // To view reported vehicle issues
  ],

  // Driver: Operate vehicles and log activities
  driver: [
    'vehicles:read', // Only assigned vehicles
    'trips:read',    // Only own trips
    'trips:create',
    'fuel:read',     // Only own fuel logs
    'fuel:create',
    'incidents:read', // Only own incidents
    'incidents:create',
  ],

  // Administration: Manage backend operations
  administration: [
    'vehicles:read',
    'vehicles:update',
    'maintenance:read',
    'maintenance:update',
    'drivers:read',
    'trips:read',
    'trips:update',
    'fuel:read',
    'fuel:update',
    'incidents:read',
    'incidents:update',
    'reports:read',
    'reports:create',
    'reports:configure',
    'leasing:read',
    'leasing:update',
    'disposal:read',
    'disposal:update',
    'compliance:read',
    'compliance:update',
    'analytics:read',
    'users:read',
  ],

  // Client-Company Liaison: Coordinate with clients
  client_company_liaison: [
    'vehicles:read',     // Client-scoped only
    'leasing:read',      // Client-scoped only
    'reports:read',      // Client-scoped only
    'compliance:read',   // Client-scoped only
  ],
};

/**
 * Module Access Matrix
 * Defines which modules each role can access
 */
export const ROLE_MODULE_ACCESS: Record<UserRole, Module[]> = {
  fleet_manager: [
    'vehicles',
    'maintenance',
    'drivers',
    'trips',
    'fuel',
    'incidents',
    'reports',
    'compliance',
    'disposal',
    'analytics',
  ],
  maintenance_team: [
    'reports',
    'vehicles',
    'maintenance',
    'incidents',
  ],
  driver: [
    'vehicles',
    'trips',
    'fuel',
    'incidents',
  ],
  administration: [
    'vehicles',
    'maintenance',
    'drivers',
    'trips',
    'fuel',
    'incidents',
    'reports',
    'compliance',
    'disposal',
    'analytics',
    'users',
  ],
  client_company_liaison: [
    'vehicles',
    'reports',
    'compliance',
  ],
};

/**
 * Role Descriptions
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, {
  title: string;
  description: string;
  responsibilities: string[];
  restrictions: string[];
}> = {
  fleet_manager: {
    title: 'Fleet Manager',
    description: 'Oversee entire fleet operations and ensure compliance',
    responsibilities: [
      'Oversee entire fleet operations',
      'Ensure vehicle maintenance and regulatory compliance',
      'Monitor driver performance and safety adherence',
      'Manage vehicle acquisition and leasing',
    ],
    restrictions: [
      'Cannot delete system records',
      'Cannot modify system configuration',
      'Cannot manage user roles',
    ],
  },
  maintenance_team: {
    title: 'Maintenance Team',
    description: 'Perform vehicle maintenance and repairs',
    responsibilities: [
      'Perform scheduled and corrective maintenance',
      'Handle repair requests',
      'Track vehicle downtime',
      'Track parts replacement',
      'Coordinate with external service providers',
    ],
    restrictions: [
      'No access to financial reports',
      'No access to driver performance analytics',
      'No access to vehicle acquisition or disposal',
    ],
  },
  driver: {
    title: 'Driver',
    description: 'Operate vehicles and maintain logs',
    responsibilities: [
      'Operate vehicles safely and efficiently',
      'Maintain accurate trip logs',
      'Record fuel usage',
      'Report incidents and vehicle issues immediately',
    ],
    restrictions: [
      'Cannot view other drivers\' data',
      'Cannot edit vehicle or maintenance records',
      'Cannot access reports or analytics',
    ],
  },
  administration: {
    title: 'Administration',
    description: 'Manage backend system operations',
    responsibilities: [
      'Manage backend system operations',
      'Configure reports',
      'Maintain data accuracy and completeness',
    ],
    restrictions: [
      'Cannot perform operational actions (driving, maintenance execution)',
      'Cannot modify client contracts',
    ],
  },
  client_company_liaison: {
    title: 'Client-Company Liaison',
    description: 'Coordinate between DNS and client companies',
    responsibilities: [
      'Coordinate between DNS and client-companies',
      'Communicate vehicle needs and lease terms',
      'Address client concerns',
      'Oversee service agreements',
    ],
    restrictions: [
      'Cannot modify system configuration',
      'Cannot perform driver or maintenance execution',
      'Cannot edit operational data',
      'Data access limited to assigned client scope only',
    ],
  },
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has access to a module
 */
export function hasModuleAccess(role: UserRole, module: Module): boolean {
  return ROLE_MODULE_ACCESS[role]?.includes(module) ?? false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Get all accessible modules for a role
 */
export function getRoleModules(role: UserRole): Module[] {
  return ROLE_MODULE_ACCESS[role] ?? [];
}

/**
 * Validate if a user role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return ['fleet_manager', 'maintenance_team', 'driver', 'administration', 'client_company_liaison'].includes(role);
}
