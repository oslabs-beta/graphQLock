// sets the cookie on login that we will use for validation
//import
const { Users } =  require('./models');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

// middleware for login
async function loginLink (req, res, next) {
  //User must set res.locals
  const role = res.locals.role;
  const user = res.locals.username;

  //Use different secrets based on each role?
  //Add ID Tokens
  //Somehow link to operations.config.gl
  // roles are on the configuration file
  //is the secret not supposed to be a string? If not, how to convert back to 'plain' code
  const accessToken = jwt.sign({role}, eval(`process.env.ACCESS_TOKEN_${role.toUpperCase()}_SECRET`), {expiresIn: '15m'});

  const refreshToken = jwt.sign({role}, process.env.REFRESH_TOKEN_SECRET);
  const hashedToken = await bcrypt.hash(refreshToken, 10);

  Users.create( { username: user, refreshToken: hashedToken }, (err, success) => {
    if (err) console.log('Error in loginLink:', err);
    if (success) {
      console.log(success);
      console.log('User created in DB');
    }
    mongoose.connection.close();
  })

  res.cookie('accessToken', accessToken);
  res.cookie('refreshToken', refreshToken);
  return next();
}

//TEST:
// link({}, {locals: {
//   role: "admin",
//   username: "phoenix"
// }});

//export
module.exports = { loginLink };
