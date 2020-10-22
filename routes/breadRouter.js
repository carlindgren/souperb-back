const router = require('express').Router();
const Bread = require('../models/breadModel');

router.get('/getall', async (req, res) => {
  const breads = await Bread.find({});
  if (!breads) {
    return res.status(400).json({ msg: 'no soups in db' });
  }
  return res.json(breads);
});

router.post('/add', async (req, res) => {
  //should be in the post req.body so destructrure.
  try {
    let { name, calories, price, description } = req.body;
    //validate
    if (!name || !calories || !price) {
      return res.status(400).json({ msg: 'not all fields entered' });
    }
    const existingBread = await Bread.findOne({ name: name });
    if (existingBread) {
      return res
        .status(400)
        .json({ msg: 'Drink with this name already exists' });
    }
    if (!description) {
      description = '';
    }
    const newBread = new Bread({
      name,
      calories,
      price,
      description
    });

    const savedBread = await newBread.save();
    return res.json(savedBread);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
