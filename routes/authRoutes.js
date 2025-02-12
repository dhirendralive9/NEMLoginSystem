const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const axios = require('axios');
const { sendPasswordResetEmail,sendVerificationEmail } = require('../config/email');
const crypto = require('crypto');


const router = express.Router();

// @route   GET /auth/register
router.get('/register', (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    name: null, // Default to null
    email: null, // Default to null
    errorMessage: null, // Default to null
    successMessage: null // Default to null
  });
});



router.get('/login', (req, res) => {
  let successMessage = '';
  let errorMessage = '';

  if (req.query.verify === 'success') {
    successMessage = 'Your email has been verified! You can now log in.';
  } else if (req.query.verify === 'invalid') {
    errorMessage = 'Invalid or expired verification link. Please try again.';
  } else if (req.query.verify === 'required') {
    errorMessage = 'Please verify your email before logging in.';
  } else if (req.query.resend === 'sent') {
    errorMessage = 'Check your email to continue.';
  } else if (req.query.resend === 'already_verified') {
    errorMessage = 'You are already verified. Please log in.';
  } else if (req.query.logout === 'success') {
    successMessage = 'You are successfully logged out, please login again to continue.';
  } else if (req.query.reset === 'sent') {
    errorMessage = 'Check your email for more instructions.';
  } else if (req.query.reset === 'success') {
    successMessage = 'Your password has been reset successfully. You can now log in.';
  } else if (req.query.reset === 'invalid') {
    errorMessage = 'Invalid or expired reset link. Please try again.';
  } else if (req.query.reset === 'error') {
    errorMessage = 'Something went wrong. Please try again.';
  }




  res.render('auth/login', {
    title: 'Login',
    errorMessage,
    successMessage
  });
});

// @route   POST /auth/register
// @desc    Handle user registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, 'g-recaptcha-response': captcha } = req.body;

    // ✅ Check if CAPTCHA is solved
    if (!captcha) {
      return res.render('auth/register', { title: 'Register', name, email, errorMessage: 'Please complete the CAPTCHA.', successMessage: '' });
    }

    // ✅ Verify reCAPTCHA
    const captchaRes = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: { secret: process.env.RECAPTCHA_SECRET_KEY, response: captcha }
    });

    if (!captchaRes.data.success) {
      return res.render('auth/register', { title: 'Register', name, email, errorMessage: 'CAPTCHA verification failed.', successMessage: '' });
    }

    // ✅ Ensure passwords match
    if (password !== confirmPassword) {
      return res.render('auth/register', { title: 'Register', name, email, errorMessage: 'Passwords do not match.', successMessage: '' });
    }

    // ✅ Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.render('auth/register', { title: 'Register', name, email, errorMessage: 'User already exists.', successMessage: '' });
    }

    // ✅ Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // ✅ Hash password and save user
    user = new User({ name, email, password, verificationToken, isVerified: false });
    await user.save();

    // ✅ Send verification email
    await sendVerificationEmail(email, name, verificationToken);

    // ✅ Redirect with verification warning
    res.redirect('/auth/login?verify=required');

  } catch (error) {
    console.error('Registration Error:', error);
    return res.render('auth/register', { title: 'Register', name: '', email: '', errorMessage: 'Something went wrong. Please try again.', successMessage: '' });
  }
});


// @route   POST /auth/login
// @desc    Authenticate user and generate JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password, 'g-recaptcha-response': captcha } = req.body;

    // ✅ Ensure reCAPTCHA is solved
    if (!captcha) {
      return res.render('auth/login', { title: 'Login', errorMessage: 'Please complete the CAPTCHA.', successMessage: '' });
    }

    // ✅ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', { title: 'Login', errorMessage: 'Invalid email or password.', successMessage: '' });
    }

    // ✅ Check if email is verified
    if (!user.isVerified) {
      return res.render('auth/login', { title: 'Login', errorMessage: 'Please verify your email before logging in.', successMessage: '' });
    }

    // ✅ Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('auth/login', { title: 'Login', errorMessage: 'Invalid email or password.', successMessage: '' });
    }

    // ✅ Generate JWT token and redirect to dashboard
    const token = jwt.sign({ userId: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    req.session.token = token;
    res.redirect('/dashboard');

  } catch (error) {
    console.error('Login Error:', error);
    return res.render('auth/login', { title: 'Login', errorMessage: 'Something went wrong. Please try again.', successMessage: '' });
  }
});



router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // ✅ Find user with the provided verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.redirect('/auth/login?verify=invalid'); // Invalid token message
    }

    // ✅ Mark the user as verified
    user.isVerified = true;
    user.verificationToken = undefined; // Remove token after verification
    await user.save();

    return res.redirect('/auth/login?verify=success'); // Successful verification message
  } catch (error) {
    console.error('Email Verification Error:', error);
    return res.redirect('/auth/login?verify=error'); // Generic error message
  }
});






// @route   GET /auth/logout
// @desc    Log user out by clearing token
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login?logout=success');
  });
});


router.get('/resend-verification', (req, res) => {
  res.render('auth/resendVerification', {
    title: 'Resend Verification Email',
    errorMessage: ''
  });
});

router.post('/resend-verification', async (req, res) => {
  try {
    const { email, 'g-recaptcha-response': captcha } = req.body;

    // ✅ Check if CAPTCHA is solved
    if (!captcha) {
      return res.render('auth/resendVerification', {
        title: 'Resend Verification Email',
        errorMessage: 'Please complete the CAPTCHA.'
      });
    }

    // ✅ Verify reCAPTCHA
    const captchaRes = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: { secret: process.env.RECAPTCHA_SECRET_KEY, response: captcha }
    });

    if (!captchaRes.data.success) {
      return res.render('auth/resendVerification', {
        title: 'Resend Verification Email',
        errorMessage: 'CAPTCHA verification failed.'
      });
    }

    // ✅ Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // ❌ Email not registered: Ignore request but show the same generic message
      return res.redirect('/auth/login?resend=sent');
    }

    if (user.isVerified) {
      // ✅ User is already verified, send email with login link
      const emailContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #007bff;">Hello, ${user.name}!</h2>
          <p>You are already verified. Click the button below to log in:</p>
          <p>
            <a href="${process.env.BASE_URL}/auth/login"
               style="display: inline-block; padding: 10px 20px; background-color: #28a745;
                      color: white; text-decoration: none; border-radius: 5px;">
              Login to WebAnalytics365
            </a>
          </p>
          <p>Best regards,<br>WebAnalytics365 Team</p>
        </div>
      `;

      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { email: process.env.BREVO_SENDER_EMAIL, name: "WebAnalytics365" },
        to: [{ email, name: user.name }],
        subject: "You're Already Verified - WebAnalytics365",
        htmlContent: emailContent
      }, {
        headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' }
      });

      return res.redirect('/auth/login?resend=already_verified');
    }

    // ✅ User is not verified, resend verification email
    await sendVerificationEmail(user.email, user.name, user.verificationToken);

    return res.redirect('/auth/login?resend=sent');
  } catch (error) {
    console.error('Resend Verification Error:', error);
    return res.render('auth/resendVerification', {
      title: 'Resend Verification Email',
      errorMessage: 'Something went wrong. Please try again.'
    });
  }
});


router.get('/forgot-password', (req, res) => {
  res.render('auth/forgotPassword', {
    title: 'Forgot Password',
    errorMessage: ''
  });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email, 'g-recaptcha-response': captcha } = req.body;

    // ✅ Check if CAPTCHA is solved
    if (!captcha) {
      return res.render('auth/forgotPassword', {
        title: 'Forgot Password',
        errorMessage: 'Please complete the CAPTCHA.'
      });
    }

    // ✅ Verify reCAPTCHA
    const captchaRes = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: { secret: process.env.RECAPTCHA_SECRET_KEY, response: captcha }
    });

    if (!captchaRes.data.success) {
      return res.render('auth/forgotPassword', {
        title: 'Forgot Password',
        errorMessage: 'CAPTCHA verification failed.'
      });
    }

    // ✅ Find user by email
    const user = await User.findOne({ email });

    if (user && user.isVerified) {
      // ✅ Generate token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // ✅ Ensure token is saved in MongoDB
      user.resetToken = resetToken;
      user.resetTokenExpires = Date.now() + 3600000; // 1 hour from now

      const savedUser = await user.save(); // Ensure this is awaited

      if (!savedUser) {
        console.error('❌ Error saving reset token in database');
        return res.render('auth/forgotPassword', {
          title: 'Forgot Password',
          errorMessage: 'Something went wrong. Please try again.'
        });
      }

      // ✅ Send email
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    }

    return res.redirect('/auth/login?reset=sent');
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.render('auth/forgotPassword', {
      title: 'Forgot Password',
      errorMessage: 'Something went wrong. Please try again.'
    });
  }
});

router.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // ✅ Find user by token and ensure it has NOT expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() } // Ensure expiration is in the future
    });

    if (!user) {
      return res.redirect('/auth/login?reset=invalid');
    }

    res.render('auth/resetPassword', {
      title: 'Reset Password',
      token,
      errorMessage: ''
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.redirect('/auth/login?reset=error');
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render('auth/resetPassword', {
        title: 'Reset Password',
        token,
        errorMessage: 'Passwords do not match.'
      });
    }

    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });

    if (!user) {
      return res.redirect('/auth/login?reset=invalid');
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return res.redirect('/auth/login?reset=success');
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.redirect('/auth/login?reset=error');
  }
});



module.exports = router;
