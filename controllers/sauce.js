const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
//  delete sauceObject._userId;
  const sauce = new Sauce({
      ...sauceObject,
      userId: req.auth.userId, // userId est le propriétaire de la sauce
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  sauce.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

exports.likedislikeSauce = (req, res, next) => {
  const sauceId = req.params.id;
  const userId = req.body.userId;
  const like = req.body.like;
  // l'utilisateur aime la sauce : (like === 1)
  if (like === 1) {
    Sauce.updateOne(
      { _id: sauceId },
      {
        $inc: { likes: 1 }, // on incrémente le nombre de like
        $addToSet: { usersLiked: userId }, // on ajoute l'utilisateur dans le tableau
      }
    )
      .then(() => res.status(200).json({ message: "Sauce aimée" }))
      .catch((error) => res.status(500).json({ error }));
  }

  // l utilisateur déteste la sauce (like === -1)
  else if (like === -1) {
    Sauce.updateOne(
      { _id: sauceId },
      {
        $inc: { dislikes: -1 }, // on décrémente le nombre de like
        $addToSet: { usersDisliked: userId }, // on ajoute l'utilisateur dans le tableau
      }
    )
      .then(() => res.status(200).json({ message: "Sauce détestée" }))
      .catch((error) => res.status(500).json({ error }));
  }
  // l utilisateur retire son like ou son dislike (like === 0)
  else {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) { // l utilisateur retire son like
          Sauce.updateOne(
            { _id: sauceId },
            { 
              $inc: { likes: -1 },  // on décrémente le nombre de like
              $pull: { usersLiked: userId }, // on retire l'utilisateur dans le tableau
            }, 
          )
            .then(() => {
              res.status(200).json({ message: "Sauce détestée" });
            })
            .catch((error) => res.status(500).json({ error }));
        } else if (sauce.usersDisliked.includes(userId)) { // l utilisateur retire son dislike
          Sauce.updateOne(
            { _id: sauceId },
            {
              $inc: { dislikes: -1 }, // on décrémente le nombre de dislike
              $pull: { usersDisliked: userId }, // on retire l'utilisateur dans le tableau
            }
          )
            .then(() => {
              res.status(200).json({ message: "Sauce aimée" });
            })
            .catch((error) => res.status(500).json({ error }));
        }
      })
      .catch((error) => res.status(401).json({ error }));
  }
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
            // res.status(401).json({ message : 'Not authorized'});
              res.status(403).json({ message : ' unauthorized request'});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};