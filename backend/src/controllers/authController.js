/**
 * @file authController.js
 * @description Handles Dual-Layer Authentication (Access + Refresh Tokens).
 */
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const user = await User.create({
            name,
            email,
            password
        });

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: accessToken,
            refreshToken: refreshToken
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
};

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

exports.refreshToken = async (req, res) => {
    const { token } = req.body;

    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        
        const accessToken = generateAccessToken(decoded.id);
        
        res.json({ accessToken });
    } catch (error) {
        res.status(403).json({ error: 'Invalid Refresh Token' });
    }
};