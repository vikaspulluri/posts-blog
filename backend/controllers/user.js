const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
        .then(hash => {
          const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hash
          });
          user.save()
              .then(result => {
                res.status(201).json({
                  message: 'User created!!!',
                  firstName: result.firstName,
                  lastName: result.lastName,
                  email: result.email
                });
              })
              .catch(err => {
                res.status(500).json({
                  message: 'Invalid authentication credentials!!!'
                });
              });
        });
}

exports.loginUser = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
      .then(user => {
        if(!user) {
          return res.status(401).json({
            error: false,
            message: 'Please enter correct email!!!'
          });
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password);
      })
      .then(result => {
        if(!result){
          return res.status(401).json({
            message: 'Please enter correct password!!!'
          });
        }
        const token = jwt.sign({email: fetchedUser.email, id: fetchedUser._id}, process.env.JWT_KEY, {expiresIn: '1h'});
        res.status(200).json({
          error: false,
          username: result.firstName + ' ' + result.lastName,
          token: token,
          expiresIn: 3600,
          userId: fetchedUser._id
        });
      })
      .catch(err => {
        res.status(401).json({
          message: 'Authentication failed!!!',
        });
      });
}
