const jwt = require('jsonwebtoken');

const dashboard = (req, res) => {
  const { token, isLoggedIn } = req.body;

  if (!isLoggedIn) {
    return res.status(401).json("Login First");
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json("Invalid Token");
    }
    res.json(decoded);
  });
};

module.exports = { dashboard };
