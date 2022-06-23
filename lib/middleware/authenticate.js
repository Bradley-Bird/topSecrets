const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const cookie = req.cookies[process.env.COOKIE_NAME];

    //checks the httpOnly session cookie
    if (!cookie) throw new Error('You must be signed in to continue');

    //verify the JWT token stored in the cookie, then attack to each request
    const user = jwt.verify(cookie, process.env.JWT_SECRET);
    req.user = user;
  } catch (e) {
    e.status = 401;
    next(e);
  }
};
