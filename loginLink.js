//Sets the cookie on login that we will use for validation
const { Users } =  require('./models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//Middleware for login
async function loginLink (req, res, next) {
  //User must set res.locals
  const role = res.locals.role;
  const user = res.locals.username;
  
  secret = process.env[`ACCESS_TOKEN_${role.toUpperCase()}_SECRET`]
  const accessToken = jwt.sign({role}, secret, {expiresIn: '15m'});

  const refreshToken = jwt.sign({role}, process.env.REFRESH_TOKEN_SECRET);
  const hashedToken = await bcrypt.hash(refreshToken, 10);

  Users.find({username: user}, (err, found) => {
    if (err) console.log('Error in loginLink Users.find:', err);
    if (!found[0]) {
       Users.create({ username: user, refreshToken: hashedToken }, (nestedErr, success) => {
        if (nestedErr) console.log('Error in loginLink Users.create:', nestedErr);
        if (success) console.log('User created in DB');
      });
    }; 
  });
  
  res.cookie('accessToken', accessToken, { maxAge: 15 * 60 * 1000, httpOnly: true, secure: true });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
  return next();
}

//export
module.exports = { loginLink };
