

require("dotenv").config()
const {Client} = require('pg');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;

module.exports = passport => {
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        const client = new Client();
        client.connect().then(() => {
            const sql = 'SELECT * FROM users WHERE user_id=$1';
            const params = [jwt_payload.id]
            return client.query(sql, params).then((results) => {
                if(results.rowCount == 1) {
                    // Takes two parameters, error and actual user
                   return done(null, results.rows)
                }else {
                    return done(null, false)
                }
            }).catch(err => {
                console.log(err)
            })
             
        }).catch(err => {
            console.log(err)  
        })  
  }));
}
