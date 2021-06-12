const express = require('express');
const router = express.Router();
const { Users } = require('../models');
const bcrypt = require('bcryptjs');
const { createToken } = require('../middleware/jwt');
const { validateToken } = require('../middleware/jwt');
const { Op } = require('sequelize');

//registration
router.post('/', async (req, res) => {
  const { username, password, email } = req.body;
  const userCheck = await Users.findOne({ where: { username: username } });
  const emailCheck = await Users.findOne({ where: { email: email } });

  if (emailCheck) {
    res.json({ error: 'Email already exist !' });
  } else if (userCheck) {
    res.json({ error: 'Username already exist !' });
  } else if (!userCheck && !emailCheck) {
    bcrypt.hash(password, 10).then((hash) => {
      Users.create({
        username: username,
        password: hash,
        email: email
      });
      res.json('Registered 😍');
    });
  }
});

//auth
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await Users.findOne({ where: { username: username } });

  if (!user) {
    res.json({ error: 'Hmm, that email address doesn\'t look right.\n 😳' })
  } else {
    bcrypt.compare(password, user.password).then((match) => {
      if (!match) {
        res.json({ error: 'Username or password is wrong 🤔' });
      } else {
        const accessToken = createToken(user);
        res.json({ accessToken, username});
      }
    });
  }
});

router.get('/auth-user', validateToken, (req, res) => {
  res.json(req.user);
})

router.get('/profile/:id', async (req, res) => {
  const id = req.params.id;
  const profileUser = await Users.findByPk(id, { attributes: { exclude: ['password'] } });

  res.json(profileUser);
});


router.put('/change-password', async (req, res) => {
  const { username, password, email } = req.body;
  const user = await Users.findOne({
    where: {
      [Op.and]: [
        { username: username },
        { email: email }
      ]
    }
  });

  if (!user) {
    res.json({ error: 'Email or Username is wrong ' });
  } else {
    bcrypt.hash(password, 10).then((hash) => {
      Users.update({
        password: hash
      }, {
        where: {
          [Op.and]: [
            { username: username },
            { email: email }
          ]
        }
      });
      res.json('Password changed 😍');
    });
  }
});

module.exports = router;
