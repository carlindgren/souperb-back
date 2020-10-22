const router = require('express').Router();
const Soup = require('../models/soupModel');

router.get('/getall', async (req, res) => {
  const soups = await Soup.find({});
  if (!soups) {
    return res.status(400).json({ msg: 'no soups in db' });
  }
  return res.json(soups);
});

router.post('/add', async (req, res) => {
  //should be in the post req.body so destructrure.
  try {
    let { name, calories, price, description, imgUrl } = req.body;
    //validate
    if (!name || !calories || !price) {
      return res.status(400).json({ msg: 'not all fields entered' });
    }
    const existingSoup = await Soup.findOne({ name: name });
    if (existingSoup) {
      return res.status(400).json({ msg: 'this soup already exists' });
    }
    if (!description) {
      description = '';
    }
    const newSoup = new Soup({
      name,
      calories,
      price,
      imgUrl,
      description
    });

    const savedSoup = await newSoup.save();
    return res.json(savedSoup);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
module.exports = router;
