const router = require('express').Router();
const jwt = require('jsonwebtoken');
const onlineUsers = require('../onlineUsers');

router.post('/login', async (req, res, next) => {
  try {
    const { username, tankChoice } = req.body;
    console.log(req.body);
    if (!username || !tankChoice)
      return res
        .status(400)
        .json({ error: 'Username and tank choice required' });

    /// user stuff here
    const user = {
      username,
      tankType: tankChoice,
      id: Object.keys(onlineUsers).length.toString(),
    };
    console.log(user);
    if (!user.id) {
      console.log({ error: `No user found for username: ${username}` });
      res.status(401).json({ error: 'Wrong username and/or password' });
    } else {
      const token = jwt.sign({ id: user.id }, process.env.SESSION_SECRET, {
        expiresIn: 86400,
      });
      res.json({
        ...user,
        token,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/logout', (req, res, next) => {
  res.sendStatus(204);
});

module.exports = router;
