# 🔐 Node.js Authentication System with JWT & Email Verification  

## Overview  
This project is a **demonstration of a secure authentication system** built using **Node.js, Express.js, EJS, MongoDB, and JWT**. It implements **email verification and password reset** using the **Brevo Email API** (formerly known as SendinBlue). The authentication process is completely **JWT-based**, eliminating the need for session storage.

## Features 🚀  
✅ **User Registration & Login** (with JWT-based authentication)  
✅ **Email Verification** (via Brevo API)  
✅ **Secure Password Hashing** (using bcrypt)  
✅ **Forgot Password & Password Reset** (with email link)  
✅ **Google reCAPTCHA Protection** (to prevent spam)  
✅ **Flash Messages via Response Body** (instead of session-based storage)  
✅ **Fully Responsive UI** (Bootstrap + EJS templates)  

## Tech Stack 🛠️  
- **Backend:** Node.js, Express.js  
- **Frontend:** EJS, Bootstrap  
- **Database:** MongoDB  
- **Authentication:** JWT (JSON Web Tokens)  
- **Email Service:** Brevo (formerly SendinBlue) API  
- **Security:** bcrypt, Helmet, Rate Limiting, reCAPTCHA  

---

## Installation & Setup 🔧  

### 1️⃣ Clone the Repository  
```
git clone https://github.com/dhirendralive9/NEMLoginSystem.git
cd NEMLoginSystem
```
### 2️⃣ Install Dependencies
```sh
npm install
```
### 3️⃣ Create A .env file 
```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BREVO_API_KEY=your_brevo_api_key
BASE_URL=http://localhost:3000
RECAPTCHA_SECRET_KEY=your_google_recaptcha_secret
```
### 4️⃣ Setup an Mongodb and connect it.
```
Make sure you have MongoDB installed and running locally or provide a MongoDB Atlas connection string in the .env file.
```

### 5️⃣  Start the Server
```
npm start
```

## API Endpoints ⚡


## Usage 🎯

### 1️⃣ Register & Verify Email

Sign up via /auth/register.
Check your email and click the verification link.

### 2️⃣ Login & Authentication

Use `/auth/login` with your email & password to receive a JWT token.
Store the JWT and send it in the Authorization header for protected routes.

### 3️⃣ Forgot Password Flow

Visit `/auth/forgot-password`, enter your email, and check your inbox for the reset link.
Click the link and update your password via /reset-password/:token.

## Security Measures 🔒
JWT-Based Authentication: No session storage.
bcrypt Hashing: Passwords are securely stored.
Google reCAPTCHA: Protects registration & login from bots.
Helmet & Rate Limiting: Prevents common security threats.
Environment Variables: Sensitive credentials are not hardcoded.

