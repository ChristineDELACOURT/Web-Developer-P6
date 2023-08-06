const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};

// Code récupéré sur Internet
//
//module.exports = (req, res, next) => {
//  try {
//    const token = req.headers.authorization.split(" ")[1];
//    const decodedToken = jwt.verify(token, process.env.TOKEN);
//    const userId = decodedToken.userId;
//
//    if (req.body.userId && req.body.userId !== userId) {
//      throw "User Id non valable ! ";
//    } else {
//      // si tout est ok, on peut passer la requête au prochain middleware
//      next();
//    }
//  } catch (error) {
    // problème d'authentification
//    res.status(401).json({ error: error | "Requête non authentifiée !" });
//  }
//};