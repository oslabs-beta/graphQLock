// const roles = require('../configFiles/operations.config.gl');

// for (const operation in roles) {
//   app.use(`/${operation}`, (req, res) => {
//     for (const role in roles[operation]) {
//       //store each role with a secret on an obj
//       const secret = `process.env.ACCESS_TOKEN_${role.toUpperCase()}_SECRET`;
      
//     }
//   });
// };

require('dotenv').config();
const fs = require('fs');
const encrypt = require('crypto');
const {
  parse,
  stringify
} = require('envfile');

const sourcePath = './server/.env';
let roles = ['admin', 'read-only', 'group1'];
roles = roles.map(el => `ACCESS_TOKEN_${el}_SECRET`);
const secret = encrypt.randomBytes(64).toString('hex');

fs.readFile(sourcePath, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  const result = parse(data);
  roles.forEach(el => result[el] = secret);
  fs.writeFile(sourcePath, stringify(result), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("File Saved"); // Can be commented or deleted
  })
});


// module.exports = secrets;
