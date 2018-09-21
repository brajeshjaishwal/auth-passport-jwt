const { Strategy, ExtractJwt } = require('passport-jwt')
const jwt = require('jsonwebtoken')
const Users = require('./db/models/Users')

const jwtOptions = {  
    // Telling Passport to check authorization headers for JWT
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    // Telling Passport where to find the secret
    secretOrKey: "my_secret1234",
    jwtSession: {session: false}
}

function initialize(passport) {
    let JWTStrategy = new Strategy(jwtOptions, async function (payload, next) {
        try{
            console.log(payload)
            var user = await Users.findById(payload.id)
            if(user === null){
                next("User not found.", null)
            }
            else {
                next(null, user)
            }
        }catch(err)
        {
            next(err, null)
        }
    })
    passport.use('jwt', JWTStrategy)
    return passport.initialize()
}

async function register(req, res) {
    try{
        if(!req.body.name || !req.body.email || !req.body.password)
        return res.send({message: "some parameters are missing."})
        else {
            var user = new Users({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
            })
            await user.save()
            return res.send({message: "User created successfully."})
        }
    }catch(err)
    {
        return res.status(401).send({message: err})
    }
}

async function login(req, res) {
    try{
        if(!req.body.name || !req.body.email || !req.body.password){
            return res.status(401).send({message: "Some of the parameters are missing."})
        }

        var name = req.body.name
        var password = req.body.password
        var email = req.body.email
        // usually this would be a database call:
        var user = await Users.findOne({email})
        if(user === null){
            res.status(401).json({message:"no such user found"})
        }
        var isMatch = await user.comparePassword(password)
        if(isMatch) {
            // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
            var payload = { id: user._id }
            var token = jwt.sign(payload, jwtOptions.secretOrKey)
            res.send({ token })
        } else {
            res.status(401).json({message:"passwords did not match"})
        }
    }
    catch(err)
    {
        res.status(401).send({message: err})
    }
}

const logout = async function logout() {
    passport.logout()
}

module.exports = {
    initialize,
    login,
    logout,
    register,
}
