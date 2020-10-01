const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/userModel');

router.get('/getall', async (req, res) => {
  const users = await User.find({});
  if (!users) {
    res.status(400).json({ msg: 'no users in db' });
  }
  res.json(users);
});

router.post('/register', async (req, res) => {
  //should be in the post req.body so destructrure.
  try {
    let { email, password, passwordCheck, displayName, phoneNumber } = req.body;
    //validate
    if (!email || !password || !passwordCheck) {
      return res.status(400).json({ msg: 'not all fields entered' });
    }
    if (password.length < 5) {
      return res
        .status(400)
        .json({ msg: 'password must be at least 5 characters' });
    }
    if (password !== passwordCheck) {
      return res.status(400).json({ msg: 'passwords must match' });
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: 'account with this email already exists' });
    }
    if (!phoneNumber) {
      phoneNumber = '';
    }
    if (!displayName) {
      displayName = email;
    }
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: passwordHash,
      displayName,
      phoneNumber
    });

    const savedUser = await newUser.save();
    res.json(savedUser);

    console.log(passwordHash);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    //validate
    if (!email || !password) {
      return res
        .status(400)
        .json({ msg: 'email, password or both are missing' });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: 'no account with this email has been registered' });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'invalid login credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    console.log(token);
    res.json({
      token,
      user: {
        id: user._id,
        displayName: user.displayName
      }
    });
  } catch {
    if (err) {
      res.status(500).json({ msg: err.message });
    }
  }
});

router.delete('/delete', auth, async (req, res) => {
  console.log(req.user);

  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    res.json(deletedUser);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

//add soup to database
router.post('/addSoup', auth, async (req, res) => {
  //add soupID in the soups array.
  const { soupID, userID } = req.body;
  let newSoup = { soup: soupID };
  console.log(soupID + 'soupid');
  try {
    await User.findByIdAndUpdate({ _id: userID }, { $push: newSoup });
  } catch (err) {
    res.json({ msg: err.message });
  }
});

router.post('/addDrinks', auth, async (req, res) => {
  try {
    const { userID, drinksArray } = req.body;

    await User.findByIdAndUpdate(
      { _id: userID },
      { $push: { drinks: drinksArray } }
    );
    return res.json(true);
  } catch (err) {
    res.json({ msg: err.message });
  }
});
router.post('/addBread', auth, async (req, res) => {
  try {
    const { userID, breadArray } = req.body;
    await User.findByIdAndUpdate(
      { _id: userID },
      { $push: { bread: breadArray } }
    );
    return res.json(true);
  } catch (err) {
    res.json({ msg: err.message });
  }
});

router.post('/tokenIsValid', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.json(false);
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.json(false);
    }
    const user = await User.findById(verified.id);
    if (!user) {
      return res.json(false);
    }
    return res.json(true);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get('/getUserInformation', auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({ user });
});
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({
    displayName: user.displayName,
    id: user._id
  });
});
module.exports = router;
