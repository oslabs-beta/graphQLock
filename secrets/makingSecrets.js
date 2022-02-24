// const crypto = require('crypto');
const roles = require('../configFiles/operations.config.gl');

for (const operation in roles) {
  app.use(`/${operation}`, (req, res) => {
    for (const role in roles[operation]) {
      //store each role with a secret on an obj
      const secret = `process.env.ACCESS_TOKEN_${role.toUpperCase()}_SECRET`;
      
    }
  });
};

Crypto.randomBytes(64).toString('hex');

module.exports = secrets;
