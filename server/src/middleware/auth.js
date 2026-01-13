import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'No token provided. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
    }

    next();
  } catch (error) {
    // Token is invalid, but that's okay for optional auth
    next();
  }
};
