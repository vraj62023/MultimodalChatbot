/**
 * @file authController.js
 * @description Handles Dual-Layer Authentication (Access + Refresh Tokens).
 */
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate Access Token (Short Life - 15m)
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Generate Refresh Token (Long Life - 7d)
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // FIX 1: Return 400 (Bad Request), NOT 500
            return res.status(400).json({ error: "User already exists" });
        }

        // Create User
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate Tokens
        // FIX 2: Ensure we use the function names defined at the top of the file
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: accessToken, // Frontend expects 'token'
            refreshToken: refreshToken
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
};

// @desc    Login user & get tokens
// @route   POST /api/v1/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                email: user.email,
                accessToken: generateAccessToken(user._id),
                refreshToken: generateRefreshToken(user._id)
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// @desc    Refresh Access Token
// @route   POST /api/v1/auth/refresh
exports.refreshToken = async (req, res) => {
    const { token } = req.body;

    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        
        // Issue new Access Token
        const accessToken = generateAccessToken(decoded.id);
        
        res.json({ accessToken });
    } catch (error) {
        res.status(403).json({ error: 'Invalid Refresh Token' });
    }
};