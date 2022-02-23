//imports
const path = require('path');
const app = express();
const roles = require('../configFiles/operations.config.gl');

app.use(express.json());

//REFACTOR
//if the expiration date runs out on an accessToken
app.use('/token', (req, res) => {
    //would this work?
    const refreshToken = req.body.token.refreshToken
    const accessToken = req.body.token.accessToken
    const userRole = req.body.role

    if (accessToken == null) {
        if (refreshToken != null) {
            if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) return res.sendStatus(403);
                
                accessToken = jwt.sign(userRole, secret, { expiresIn: '15m' })
                return res.json( { accessToken: accessToken, refreshToken: refreshToken})
            })
        }
    }
})

//read operations and associated roles
for (const operation in roles) {
    app.use(`/${operation}`, (req, res) => {
        for (const role in roles[operation]) {
            //Do we store the secrets in a database, or in process.env?
            const secret = `process.env.ACCESS_TOKEN_${role.toUpperCase()}_SECRET`;
            jwt.verify(myWebToken, secret, (err, found) => {
                if (found) return res.json(true);
            })
        }
        return res.sendStatus(401);
    });
};

//global error handling
app.use((err, req, res, next) => {
const defaultError = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { error: 'Caught Unknown Error'}
}
const errObj = {...defaultError, ...err};
return res.status(errObj.status).json(errObj.message);
});

app.listen(3000);

//export
module.exports = app;