const express = require('express'); // framework facilitant la gestion du serveur Node
// const bodyParser = require('body-parser'); inutile car nous sommes en express 4.18.2 > 4.16
const dotenv = require('dotenv').config(); // pour utiliser les variables d environnement

const mongoose = require('mongoose');
const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
const path = require('path');

mongoose.connect(process.env.DB_CHAINE_CONNECTION,
{ useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Récupération des erreurs de la base de données
mongoose.connection.on('error',console.error.bind(console, 'Erreur de connexion: '));

const app = express();

// On autorise les échanges entre 2 serveurs différents en évitant les erreurs de CORS
// CORS = Cross Origin Resource Sharing
app.use((req, res, next) => {
  // accéder à notre API depuis n'importe quelle origine ( '*' ) 
  res.setHeader('Access-Control-Allow-Origin', '*');
  // ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.) 
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  // envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.).
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

//app.use(bodyParser.json());
//Express prend toutes les requêtes qui ont comme Content-Type  application/json  
// et met à disposition leur  body  directement sur l'objet req
app.use(express.json());  // Le bodyParser est dans express

app.use('/images', express.static(path.join(__dirname, 'images'))); //rend le dossier images statique
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;