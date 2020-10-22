const router = require('express').Router();
const Drink = require('../models/drinkModel');

router.get('/getall', async (req, res) => {
  const drinks = await Drink.find({});
  if (!drinks) {
    return res.status(400).json({ msg: 'no soups in db' });
  }
  return res.json(drinks);
});

router.post('/add', async (req, res) => {
  //should be in the post req.body so destructrure.
  try {
    let { name, calories, price, description } = req.body;
    //validate
    if (!name || !calories || !price) {
      return res.status(400).json({ msg: 'not all fields entered' });
    }
    const existingDrink = await Drink.findOne({ name: name });
    if (existingDrink) {
      return res
        .status(400)
        .json({ msg: 'Drink with this name already exists' });
    }
    if (!description) {
      description = '';
    }
    const newDrink = new Drink({
      name,
      calories,
      price,
      description
    });

    const savedDrink = await newDrink.save();
    return res.json(savedDrink);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
