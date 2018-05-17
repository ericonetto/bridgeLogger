var dotenv = require('dotenv');
dotenv.load();

const getDeviceCredentialsByUuidPromise = (uuid) => {
  return {
    apiKey: process.env.KONKER_API_KEY, 
    password: process.env.KONKER_API_PASS
  }
}

// **************** EXPORTS ****************
module.exports = {
  getDeviceCredentialsByUuidPromise  
}