const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to check authentication
const authenticateUser = (req, res, next) => {
  const token = req.session.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.redirect('/auth/login');
  }
};

// ✅ Protect the dashboard route
router.get('/', authenticateUser, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    user: req.user
  });
});

module.exports = router;
