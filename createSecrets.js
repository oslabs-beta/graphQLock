const fs = require('fs');
const encrypt = require('crypto');
const path = require('path');
const { parse, stringify } = require('envfile');
const sourcePath = '.env';
const operations = require(path.resolve(__dirname, '../../config/operations.config'));

const createSecrets = () => {
  // parse through all roles to create a unique list
  let allRoles = [];
  Object.values(operations).forEach(el => allRoles = [...allRoles, ...el]);
  const roles = [...new Set(allRoles)].map(el => `ACCESS_TOKEN_${el.toUpperCase()}_SECRET`);
  
  fs.readFile(sourcePath, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    // object where secret is created
    const result = parse(data);
    roles.forEach(el => {
      const secret = encrypt.randomBytes(64).toString('hex');
      process.env[el] = secret;
      result[el] = secret;
    });
    //if refresh token secret doesnt exits, create new refresh token secret
    if (!result['REFRESH_TOKEN_SECRET']) {
      const secret = encrypt.randomBytes(64).toString('hex');
      process.env['REFRESH_TOKEN_SECRET'] = secret;
      result['REFRESH_TOKEN_SECRET'] = secret;
    };
    fs.writeFile(sourcePath, stringify(result), function (err) {
      if (err) {
        return console.log(err);
      };
      console.log("File Saved");
    });
  });
};

module.exports = { createSecrets };
