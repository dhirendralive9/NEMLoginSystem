#Node.js Authentication System with JWT & Email Verification
###Overview
This project is a demonstration of a secure authentication system built using Node.js, Express.js, EJS, MongoDB, and JWT. It implements email verification and password reset using the Brevo Email API (formerly known as SendinBlue). The authentication process is completely JWT-based, eliminating the need for session storage.

Features 🚀
✅ User Registration & Login (with JWT-based authentication)
✅ Email Verification (via Brevo API)
✅ Secure Password Hashing (using bcrypt)
✅ Forgot Password & Password Reset (with email link)
✅ Google reCAPTCHA Protection (to prevent spam)
✅ Flash Messages via Response Body (instead of session-based storage)
✅ Fully Responsive UI (Bootstrap + EJS templates)

Tech Stack 🛠️
Backend: Node.js, Express.js
Frontend: EJS, Bootstrap
Database: MongoDB
Authentication: JWT (JSON Web Tokens)
Email Service: Brevo (formerly SendinBlue) API
Security: bcrypt, Helmet, Rate Limiting, reCAPTCHA
Installation & Setup 🔧
 ##1️⃣ Clone the Repository

> git clone https://github.com/yourusername/repo-name.git
> cd repo-name
##2️⃣ Install Dependencies
sh
Copy
Edit
npm install
##3️⃣ Configure Environment Variables
Create a .env file and add the following:

ini
Copy
Edit
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BREVO_API_KEY=your_brevo_api_key
BASE_URL=http://localhost:3000
RECAPTCHA_SECRET_KEY=your_google_recaptcha_secret
##4️⃣ Start the Server

npm start
The app will run on http://localhost:3000

###API Endpoints ⚡
Method	Endpoint	Description
POST	/auth/register	Register a new user
POST	/auth/login	Authenticate user & return JWT
GET	/verify/:token	Verify email
POST	/auth/resend-verification	Resend email verification link
POST	/auth/forgot-password	Send password reset email
POST	/reset-password/:token	Reset password
Usage 🎯
Users must verify their email before logging in.
JWT tokens are used for authentication instead of sessions.
Passwords are hashed using bcrypt for security.
Email communication is handled using Brevo API.
Contributing 🤝
Feel free to fork this repository and contribute by submitting a pull request.

License 📜
This project is licensed under the MIT License.

This README provides a clear, professional, and easy-to-follow guide for users interested in your authentication demo. Let me know if you need any modifications! 🚀
