
// const {generateSecrets} = require('graphQLock')
// random 64 byte strings that encode the JWTs
// making secret and putting the secrets in the .env file
// JWTs are encoded - 

// const roles = require('../configFiles/operations.config.gl');

// require('dotenv').config();
const fs = require('fs');
const encrypt = require('crypto');
const {
  parse,
  stringify
} = require('envfile');
const sourcePath = '.env';

// let roles = ['admin', 'read-only', 'group1']; //abstract out to use config files

const createSecrets = (roles) => {
  roles = roles.map(el => `ACCESS_TOKEN_${el.toUpperCase()}_SECRET`);
  
  fs.readFile(sourcePath, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    const result = parse(data);
    // object where secret is created
    roles.forEach(el => result[el] = encrypt.randomBytes(64).toString('hex'));
    if (!result['REFRESH_TOKEN_SECRET']) result['REFRESH_TOKEN_SECRET'] = encrypt.randomBytes(64).toString('hex');
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
