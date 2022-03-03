const fs = require('fs');
const encrypt = require('crypto');
const path = require('path');
const {
  parse,
  stringify
} = require('envfile');
const sourcePath = '.env';
const operations = require(path.resolve(__dirname, '../../config/operations.config'));
// let roles = ['admin', 'read_only', 'group1']; //abstract out to use config files

const createSecrets = () => {
  let roles = Object.keys(operations);
  roles = roles.map(el => `ACCESS_TOKEN_${el.toUpperCase()}_SECRET`);
  
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
    if (!result['REFRESH_TOKEN_SECRET']) {
      const secret = encrypt.randomBytes(64).toString('hex');
      process.env['REFRESH_TOKEN_SECRET'] = secret;
      result['REFRESH_TOKEN_SECRET'] = secret;
    }
    fs.writeFile(sourcePath, stringify(result), function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("File Saved"); // Can be commented or deleted
    })
  });
}

// encode a certain way based on what is passed in for the second argument
// each role has a different secret

module.exports = { createSecrets };
