const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
        .then(hash => {
          const user = new User({
            email: req.body.email,
            password: hash
          });
          user.save()
              .then(result => {
                res.status(201).json({
                  message: 'User created!!!',
                  result: result
                });
              })
              .catch(err => {
                res.status(500).json({
                  error: err
                });
              });
        });
});

router.post('/login', (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
      .then(user => {
        if(!user) {
          return res.status(401).json({
            error: false,
            message: 'email not found'
          });
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password);
      })
      .then(result => {
        if(!result){
          return res.status(401).json({
            message: 'Wrong password'
          });
        }
        const token = jwt.sign({email: fetchedUser.email, id: fetchedUser._id}, 'kaushal_army', {expiresIn: '2h'});
        res.status(200).json({
          error: false,
          message: 'Success',
          token: token
        });
      })
      .catch(err => {
        res.status(401).json({
          message: 'Auth failed!!!',
          error: err
        });
      });
});

module.exports = router;
