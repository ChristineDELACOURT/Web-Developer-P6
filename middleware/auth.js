const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
    // on prend le deuxième champ de authorization / on ne prend pas Bearer
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, process.env.JWT_KEY_TOKEN);
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};