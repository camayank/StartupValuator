/**
 * Database Configuration
 */

export const databaseConfig = {
  // Connection pool settings
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },

  // Query timeout
  queryTimeout: 30000, // 30 seconds

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Caching
  cache: {
    enabled: true,
    ttl: {
      companies: 300, // 5 minutes
      valuations: 1800, // 30 minutes
      schemes: 3600, // 1 hour
      benchmarks: 86400, // 24 hours
    },
  },

  // Soft delete
  softDelete: {
    enabled: true,
    field: 'deletedAt',
  },

  // Audit logging
  audit: {
    enabled: true,
    actions: ['create', 'update', 'delete', 'read'],
    excludeFields: ['password', 'passwordHash', 'secret'],
  },
};

export type DatabaseConfig = typeof databaseConfig;

export default databaseConfig;
