/* 
* Create and export config variables
*/

// Container for all the environments 
let environments = {};

// Staging (default) environment
environments.staging = {
  port: 1000,
  envName: 'Staging'
}

// Staging environment
environments.production = {
  port: 3000,
  envName: 'Production'
}

// Determine which environment was passed as a command-line argument
var currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not, default to staging,
var environmentToExport = typeof(environments[currentEnv]) === 'object' ? environments[currentEnv] : environments.staging;

// Export the module
module.exports = environmentToExport;