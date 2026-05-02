const { env } = require('../../common/config/env');
const { InMemoryPatientRepository } = require('../../common/repositories/implementations/in-memory-patient.repository');
const { SqlPatientRepository } = require('../../common/repositories/implementations/sql-patient.repository');

/**
 * Factory function to create appropriate PatientRepository
 * based on configuration (DB_MODE environment variable)
 */
function createPatientRepository() {
  const mode = env.dbMode.toLowerCase();

  if (mode === 'sql') {
    // TODO: Initialize SQL connection pool and pass to SqlPatientRepository
    // For now, this will throw when used
    console.log('⚠️  Using SQL Server mode (not yet fully implemented)');
    return new SqlPatientRepository(null); // connectionPool will be null until implemented
  }

  // Default: in-memory repository
  console.log('✓ Using in-memory repository mode');
  return new InMemoryPatientRepository();
}

const patientRepository = createPatientRepository();

module.exports = { patientRepository };