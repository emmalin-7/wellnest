import express from 'express';

const router = express.Router();


// temporary hard code just for testing reasons. WILL NOT BE LIKE THIS IN FINAL APP
const hardcodedUser = {
  username: 'admin',
  password: 'password',
};


// something seems to be wrong here but i cannot figure it out rm\n
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('login attempt:', req.body);

  if (username === hardcodedUser.username && password === hardcodedUser.password) {
    return res.json({ message: 'login was successful!' });
  } else {
    return res.status(400).json({ error: 'wrong username or password' });
  }
});

export default router;