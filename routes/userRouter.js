const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');

// get
router.get('/getall', async (req, res) => {
  const users = await User.find({});
  if (!users) {
    return res.status(400).json({ msg: 'no users in db' });
  }
  return res.json(users);
});

router.get('/getCart', auth, async (req, res) => {
  const user = await User.findById(req.user);
  const { _id: userId } = user;
  try {
    let cart = await Cart.find({ userId });

    return res.status(200).json({ cart });
  } catch (err) {
    return res.json({ err });
  }
});
router.get('/getOrders', auth, async (req, res) => {
  try {
    const orders = await Order.find();

    return res.json({ orders });
  } catch (err) {
    return res.json({ err });
  }
});

//getting orderinformation for profile page in frontend. what to display?
router.get('/getOrderInformation', auth, async (req, res) => {
  const user = await User.findById(req.user);
  const { _id: userId } = user;
  try {
    let order = await Order.find({ userId });
    if (order) {
      return res.status(200).json({ order });
    }
    return res.json({ msg: 'no orderDetails for this account' });
  } catch (err) {
    return res.json({ err });
  }
});

router.get('/getUserInformation', auth, async (req, res) => {
  const user = await User.findById(req.user);

  return res.json({ user });
});
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user);
  return res.json({
    ROLE: user.ROLE,
    displayName: user.displayName,
    id: user._id
  });
});

//post

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
    return res.status(200).json({ savedUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

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

    return res.json({
      token,
      user: {
        ROLE: user.ROLE,
        id: user._id,
        displayName: user.displayName
      }
    });
  } catch {
    if (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
});

router.post('/addPreferedPayment', auth, async (req, res) => {
  try {
    const { preferedPayment, id } = req.body;
    await User.findByIdAndUpdate(
      { _id: id },
      { preferedPayment: preferedPayment }
    );
    return res.json(true);
  } catch (err) {
    return res.json({ msg: err.message });
  }
});
router.post('/addAdressDetails', auth, async (req, res) => {
  try {
    const { userId, name, street, zipCode, portCode, floor } = req.body;
    const adress = {
      name,
      street,
      zipCode,
      portCode,
      floor
    };
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        adress
      }
    );
    return res.json(true);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
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
    return res.status(500).json({ msg: err.message });
  }
});
router.post('/deleteCartItem', auth, async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.find({ userId });
    //got cart
    let newProds = cart[0].products.filter(
      (elem) => elem.productId !== productId
    );
    //cart[0].products = newCart;
    await Cart.remove({ userId });

    const newCart = await Cart.create({
      userId,
      products: newProds
    });
    newCart.save();
    return res.status(200).json({ cart });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

router.post('/removeFromCart', auth, async (req, res) => {
  const { userId, productId, quantity, name, price, typeOfProd } = req.body;
  try {
    let cart = await Cart.findOne({ userId });

    if (cart) {
      //cart exists for user
      let itemIndex = cart.products.findIndex((p) => p.productId == productId);

      if (itemIndex > -1) {
        //product exists in the cart, update the quantity
        let productItem = cart.products[itemIndex];
        productItem.quantity -= quantity;

        cart.products[itemIndex] = productItem;
      } else {
        //product does not exists in cart, add new item
        cart.products.push({ productId, quantity, name, price, typeOfProd });
      }
      cart = await cart.save();
      return res.status(201).json({ cart });
    } else {
      //no cart for user, create new cart
      const newCart = await Cart.create({
        userId,
        products: [{ productId, quantity, name, price, typeOfProd }]
      });

      return res.status(201).json({ newCart });
    }
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
});

router.post('/markFinished', auth, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findByIdAndUpdate(
      { _id: orderId },
      { deploymentReady: true }
    );

    await order.save();
    return res.status(201);
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
});

router.put('/order', auth, async (req, res) => {
  const {
    userId,
    orderType,
    orderTime,
    orderPrice,
    phoneNo: phoneNumber,
    portCode,
    floor,
    street,
    latlng,
    name,
    cartItems
  } = req.body;
  //what to do????
  //if user has an active order. do not create new one
  try {
    const order = await Order.findOne({ userId, active: true });
    if (!order) {
      await Order.create({
        userId,
        orderTime,
        orderType,
        orderPrice,
        deliveryDetails: {
          phoneNo: phoneNumber,
          portCode,
          floor,
          street,
          latlng,
          name
        },
        cartItems
      });
      await Cart.findOneAndUpdate({ userId }, { products: [] });
      //add 1 to bought soups at user.
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $inc: { boughtSoups: 1 } },
        { new: true }
      );
    }
    if (order) {
      return res.json({ msg: 'You already have an active order' });
    }

    return res.status(200).json({ order });
  } catch (err) {
    return res.status(500).json({ err });
  }
});
router.post('/cart', auth, async (req, res) => {
  try {
    const { userId, productId, quantity, name, price, typeOfProd } = req.body;

    let cart = await Cart.findOne({ userId });

    if (cart) {
      //cart exists for user
      let itemIndex = cart.products.findIndex((p) => p.productId == productId);

      if (itemIndex > -1) {
        //product exists in the cart, update the quantity
        let productItem = cart.products[itemIndex];
        productItem.quantity += quantity;
        cart.products[itemIndex] = productItem;
      } else {
        //product does not exists in cart, add new item
        cart.products.push({ productId, quantity, name, price, typeOfProd });
      }
      cart = await cart.save();
      return res.status(201).json({ cart });
    } else {
      //no cart for user, create new cart
      const newCart = await Cart.create({
        userId,
        products: [{ productId, quantity, name, price, typeOfProd }]
      });

      return res.status(201).json({ newCart });
    }
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

//delc
router.delete('/deleteCart', auth, async (req, res) => {
  const { userId } = req.body;
  try {
    const deleted = await Cart.findOneAndDelete({ userId });
    return res.status(200).json({ deleted });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});
router.delete('/delete', auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    return res.json(deletedUser);
  } catch (err) {
    return res.status(400).json({ msg: err.message });
  }
});
module.exports = router;
