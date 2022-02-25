// sets the cookie on login that we will use for validation
//import
const { Users } =  require('./models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');
require('dotenv').config();

// middleware for login
async function link (req, res, next) {
  //User must set res.locals
  const role = res.locals.role;
  const user = res.locals.username;

  //Use different secrets based on each role?
  //Add ID Tokens
  //Somehow link to operations.config.gl
  // roles are on the configuration file
  const secret = `process.env.ACCESS_TOKEN_${role.toUpperCase()}_SECRET`;
  //is the secret not supposed to be a string? If not, how to convert back to 'plain' code
  // const accessToken = jwt.sign({role}, process.env.ACCESS_TOKEN_ADMIN_SECRET, {expiresIn: '15m'});
  // const accessToken = jwt.sign({role}, '1234', {expiresIn: '15m'});

  const refreshToken = jwt.sign({role}, '59a9fbadeb7f7e2cd15633b3680355ee30a277c12b11b0f21e704240c5a89a1a265e01f4fbeebbe8468b99892bc4f3e8d87e9b1cef6fb4bb32b28ead255a2216');
  // const refreshToken = jwt.sign({role}, process.env.REFRESH_TOKEN_SECRET);
  const hashedToken = await bcrypt.hash(refreshToken, 10);

  Users.create( { username: user, refreshToken: hashedToken }, (err, success) => {
    if (err) console.log('Error in loginLink:', err);
    if (success) {
      console.log('User created in DB');
      mongoose.connection.close();
    }
  })

  // return res.json( { accessToken: accessToken, refreshToken: refreshToken})
  
  // res.cookie('accessToken', accessToken);
  // res.cookie('refreshToken', refreshToken);
  // return next();
}

link({}, {locals: {
  role: "jkl",
  username: "jkl"
}});

//export
// module.exports = link;
