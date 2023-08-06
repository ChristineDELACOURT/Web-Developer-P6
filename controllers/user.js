var User = require('../models/User');
const bcrypt = require('bcrypt'); // cryptage du mot de passe
const jwt = require('jsonwebtoken'); // creation des jetons
var validator = require('validatorjs'); // pour valider l'email
const dotenv = require('dotenv').config(); // pour utiliser les variables d environnement

exports.signup = (req, res, next) => {
  const validiteEmail = new validator(
  {email: req.body.email}, 
  {email: 'required|email'} ,
  'email invalide');  
  if (validiteEmail.fails()) {
    return res.status(401).json({ message: 'email invalide' });      
  }
  const passwordRegExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  if (passwordRegExp.test(req.body.password) == false) {
    return res.status(401).json({ message: 'password invalide' });
  }
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
      .then(user => {
          if (!user) {
              return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
          }
          bcrypt.compare(req.body.password, user.password)
              .then(valid => {
                  if (!valid) {
                      return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                  }
                  res.status(200).json({
                      userId: user._id,
                      token: jwt.sign( // encodage d un token
                        { userId: user._id },
                        process.env.JWT_KEY_TOKEN,
                        { expiresIn: '24h' } // le jeton est valable 24h
                    )
                  });
              })
              .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};