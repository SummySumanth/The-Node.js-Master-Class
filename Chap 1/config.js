/* 
* Create and export configuration variables
*
*/

// Container for all the environments

const environments = {}

// Staging (default) environment
environments.staging = {
    port: 3000,
    envName: 'STAGING'
};

// Production environment
environments.production = {
    port: 8000,
    envName: 'PRODUCTION' 
};

// Determine which environment was passed as command line argument 
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check is the current environment is one of the environments above, if not, default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;