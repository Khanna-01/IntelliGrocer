const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Email Configuration (Use your actual credentials in .env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// Register User
exports.register = async (req, res) => {
  console.log("Incoming Request Data:", req.body);  // <-- Debugging log

  const { username, email, password, role, employeeId } = req.body;

  try {
      if (!username || !email || !password || !role) {
          return res.status(400).json({ message: "All fields are required" });
      }

      console.log("Checking existing user...");
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
      }

      console.log("Validating role...");
      if (role === "manager" && employeeId !== "815778") {
          return res.status(400).json({ message: "Invalid Manager ID" });
      }

      const validEmployeeIds = ['08661', '08662', '08663', '08664', '08665', '08666', '08667', '08668', '08669', '086650'];
      if (role === "employee" && !validEmployeeIds.includes(employeeId)) {
          return res.status(400).json({ message: "Invalid Employee ID" });
      }

      console.log("Hashing password...");
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log("Saving new user...");
      const newUser = new User({ username, email, password: hashedPassword, role, employeeId });
      await newUser.save();

      console.log("User registration successful!");
      res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
      console.error("Registration Error:", err);  // <-- Log the actual error
      res.status(500).json({ message: "Server error" });
  }
};


exports.login = async (req, res) => {
  console.log("Login attempt for email:", req.body.email);

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username }, // ✅ Include username
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      role: user.role,
      username: user.username, // ✅ Send username
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// Forgot Password - Send Temporary Password via Email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    // Update user with temporary password
    user.password = hashedTempPassword;
    await user.save();

    // Email content
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset - IntelliGrocer',
      text: `Hello ${user.username},\n\nYour temporary password is: ${tempPassword}\n\nPlease log in and change your password.\n\nRegards,\nIntelliGrocer Team`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ message: 'Error sending email' });
      }
      res.json({ message: 'Temporary password sent to your email' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


