//imports
const path = require('path');
const app = express();
const roles = require('../configFiles/operations.config.gl');

app.use(express.json());

//read operations and associated roles
for (const operation in roles) {
    app.use(`/${operation}`, (req, res) => {
        for (const role in roles[operation]) {
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


//export
module.exports = app;