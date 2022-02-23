//links users log in info giving us access to role

//import

//authenticateLogin
    //userController.verify()
    //graphQLOCK.link()

function link(req) {
    const userRole = {role: req.body.role}

    //Use different secrets based on each role?
    //Somehow link to permissions.config.gl
    for (const role in rolesList) {
        if (role === userRole.role) {
            const secret = `process.env.ACCESS_TOKEN_${role.toUpperCase()}_SECRET`
            //is the secret not supposed to be a string? If not, how to convert back to 'plain' code
            const accessToken = jwt.sign(userRole, secret, { expiresIn: '15m' })
        }
    }

    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)

    res.json( { accessToken: accessToken, refreshToken: refreshToken})

}

//export