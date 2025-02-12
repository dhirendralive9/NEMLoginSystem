require('dotenv').config();  // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('express-flash');
const session = require('express-session');
const cors = require('cors');
const db = require('./config/db'); // Import database connection

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Flash messages (for success/error messages)
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());

app.use((req, res, next) => {
  let user = null;

  // Check if token exists in headers
  const token = req.headers.authorization || null;

  if (token) {
    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
      user = { id: decoded.userId, name: decoded.name };
    } catch (error) {
      console.error("Invalid or expired token:", error);
    }
  }

  res.locals.user = user; // Make 'user' available in all views
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  res.locals.name = req.flash('name')[0] || '';  // Store name field for form retention
  res.locals.email = req.flash('email')[0] || '';  // Store email field for form retention
  next();
});



// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use Routes
app.use('/auth', authRoutes); // Authentication routes
app.use('/dashboard', dashboardRoutes); // Dashboard route



// Default Route
app.get('/', (req, res) => {
  res.render('index', { title: 'Home - WebAnalytics365' });
});

// Start the server after DB connection is established
const PORT = process.env.PORT || 3000;
db.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });
