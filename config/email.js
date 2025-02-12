const axios = require('axios');

const sendVerificationEmail = async (email, name, token) => {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #007bff;">Welcome to WebAnalytics365, ${name}!</h2>
        <p>Thank you for signing up. Please verify your email address to activate your account.</p>
        <p>
          <a href="${process.env.BASE_URL}/auth/verify/${token}" 
             style="display: inline-block; padding: 10px 20px; background-color: #28a745; 
                    color: white; text-decoration: none; border-radius: 5px;">
            Verify Your Email
          </a>
        </p>
        <p>If you didn't register, please ignore this email.</p>
        <p>Best regards,<br>WebAnalytics365 Team</p>
      </div>
    `;

    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { email: process.env.BREVO_SENDER_EMAIL, name: process.env.BREVO_SENDER_NAME },
      to: [{ email, name }],
      subject: "Verify Your Email - WebAnalytics365",
      htmlContent: emailContent
    }, {
      headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' }
    });

    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error.response ? error.response.data : error.message);
  }
};


const sendPasswordResetEmail = async (email, name, token) => {
  try {
    const resetLink = `${process.env.BASE_URL}/auth/reset-password/${token}`;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #007bff;">Reset Your Password, ${name}</h2>
        <p>You requested a password reset. Click the button below or use the direct link:</p>

        <p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 10px 20px; background-color: #28a745; 
                    color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>

        <p>🔗 <strong>Direct Link:</strong> <br>
          <a href="${resetLink}" style="word-wrap: break-word;">${resetLink}</a>
        </p>

        <p>If you didn't request this, you can ignore this email.</p>
        <p>Best regards,<br>WebAnalytics365 Team</p>
      </div>
    `;

    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { email: process.env.BREVO_SENDER_EMAIL, name: "WebAnalytics365" },
      to: [{ email, name }],
      subject: "Reset Your Password - WebAnalytics365",
      htmlContent: emailContent
    }, {
      headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' }
    });

    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error.response ? error.response.data : error.message);
  }
};



  

module.exports = { sendVerificationEmail,sendPasswordResetEmail };
