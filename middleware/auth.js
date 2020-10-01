const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token'); //stores webtoken if there is one.
  try {
    if (!token) {
      return res
        .status(401)
        .json({ msg: 'No auth token, authorization denied' });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      res
        .status(401)
        .json({ msg: 'token verification failed, authorization denied' });
    }
    req.user = verified.id;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = auth;
