const path = require('path');
const bodyParser = require('body-parser');
const userModel = require('../../models/User');
const {Client} = require('pg');
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt =  require('jsonwebtoken');
const passport = require('passport');
require("dotenv").config()



router.get('/test', (req, res) => res.json({
    'msg':'User works'
}));


// Registering a user
router.post('/register', (req, res) => {
    const client = new Client()
        client.connect().then(() => {
            //do query stuff
            return client.query(userModel).then((result) => {
                // s for size, r for rating, d for  default
                const avarta = gravatar.url(req.body.email, {s: '200', r: 'pg', d: 'mm'});
                //checkout if email exists already in the database
                const sql = 'SELECT * FROM users WHERE email=$1';
                const params = [req.body.email]
                return client.query(sql, params).then((results) => {
                    if(results.rowCount >= 1) {
                      res.status(400).json({email:'Email already exists'});
                    }else {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(req.body.password, salt, (err, hash) => {
                                if(err) throw err;
                                req.body.password = hash
                                const sql = 'INSERT INTO users (name, email, avarta, password) VALUES ($1,$2,$3,$4)';
                                const params = [req.body.name, req.body.email, avarta, req.body.password];
                                const avarta_key = "avarta";
                                const avarta_value = avarta;
                                req.body[avarta_key] = avarta_value
                                return client.query( sql, params).then((result) => {
                                    res.status(201).json(req.body);
                                }).catch((err) => {
                                    console.log(err)
                                })
                            })
                        });
                        
                    }
                }).catch((err) => {
                    console.log('error', err);
                    res.status(400).json({'message':'Something bad happened'});
                })
            }).catch((err) => {
                console.log('error', err);
                res.status(400).json({'message':'Something bad happened'});
            })
    })

});

// Logging in a user
router.post('/login', (req, res) => {
    const client = new Client()

    client.connect().then(() => {
        const email = req.body.email;
        const password = req.body.password;
        const sql = 'SELECT * FROM users WHERE email=$1';
        const params = [email]
        return client.query(sql, params).then((results) => {
            const returned_dictionary =   results.rows[0];
            console.log(Object.values(returned_dictionary));
            const convert_to_array = Object.values(returned_dictionary);
            user_register_password = convert_to_array[3];
            if(results.rowCount == 1) {
                bcrypt.compare(password, user_register_password).then(isMatch => {
                    if(isMatch) {
                        // Create JWT payload
                        const payload = {
                            id:convert_to_array[0],
                            name:convert_to_array[1],
                            avarta:convert_to_array[4 ]
                        }
                        jwt.sign(payload, process.env.SECRET_KEY, { expiresIn:3600}, (err, token) => {
                             
                            res.json({
                                success:true,
                                token:'Bearer ' + token
                            })
                         
                        })
                         
                    }else {
                        res.status(400).json({'password': 'Password Incorrect'})
                    }
                })
                          

            }else {
                res.status(404).json({email:'User not found'});  
            }
        }).catch((err) => {
            res.status(400).json({'message':'Something bad happened'});
        })
    }).catch(err => {
        res.status(400).json({'message':'Something bad happened'});        
    })
})

router.get('/current', passport.authenticate('jwt', {session:false}), (req, res) => {
    console.log(req.user[0]["user_id"]);
    res.json({
        user_id: req.user[0]["user_id"],
        name: req.user[0]["name"],
        email: req.user[0]["email"]
    })
})



module.exports = router;



