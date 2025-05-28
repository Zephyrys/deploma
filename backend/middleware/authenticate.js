const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ 
          code: 'MISSING_TOKEN',
          message: 'Токен відсутній' 
        });
      }
  
      const [type, token] = authHeader.split(' ');
      
      if (type !== 'Bearer' || !token || token.length < 100) {
        return res.status(401).json({
          code: 'INVALID_TOKEN',
          message: 'Невірний формат токена'
        });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
  
    } catch (err) {
      const errorType = err.name === 'TokenExpiredError' 
        ? 'TOKEN_EXPIRED' 
        : 'INVALID_TOKEN';
      
      res.status(401).json({
        code: errorType,
        message: err.message
      });
    }
  };
module.exports = authenticate;