// sets the cookie on login that we will use for validation
//import
const { User } =  require('./models');

// middleware for login
function link (req, res, next) {
  //User must set res.locals
  const userRole = res.locals.role;
  const user = res.locals.username;

  //Use different secrets based on each role?
  //Add ID Tokens
  //Somehow link to operations.config.gl
  // roles are on the configuration file
  const secret = `process.env.ACCESS_TOKEN_${role.toUpperCase()}_SECRET`;
  //is the secret not supposed to be a string? If not, how to convert back to 'plain' code
  const accessToken = jwt.sign(userRole, secret, { expiresIn: '15m' });

  const refreshToken = jwt.sign(userRole, process.env.REFRESH_TOKEN_SECRET);
  const hashedToken = bcrypt.hash(refreshToken, 10);

  User.create( { username: user, refreshToken: hashedToken }, (err, success) => {
    if (!err) console.log('User created in DB');
    else console.log('Error in loginLink:', err)
  })

  // return res.json( { accessToken: accessToken, refreshToken: refreshToken})
  
  res.cookie('accessToken', accessToken);
  res.cookie('refreshToken', refreshToken);
  return next();
}

//export
module.exports = link;
