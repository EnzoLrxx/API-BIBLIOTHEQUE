const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token invalide' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expiré' });
  }

  if (err.code === 'P2002') {
    return res.status(400).json({ error: 'Cette valeur existe déjà' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Ressource non trouvée' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur'
  });
};

module.exports = errorHandler;
