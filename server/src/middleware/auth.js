const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

function requireAuth(req, res, next) {
  const bearer = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  const token = req.cookies?.token || bearer;
  if (!token) return res.status(401).json({ message: 'Zaloguj się, aby kontynuować.' });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return res.status(401).json({ message: 'Sesja wygasła. Zaloguj się ponownie.' });
  }
}

module.exports = requireAuth;
