const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({  // ou enregistrer les fichiers entrants
  destination: (req, file, callback) => {
    callback(null, 'images'); // on enregistre les fichiers dans le dossier images
  },
  // le fichier final sera le nom du fichier entrant avec les espaces
  // remplaces par des underscores et un timestamp en suffixe
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype]; // on recupere l extension du fichier
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('image');