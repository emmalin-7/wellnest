import User from '../users/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const register = async (req, res) => {

    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    try {
        const user = new User({ username, password: hashed });
        await user.save();
        res.status(201).json({ message: 'user created!' });
    } 
    catch (err) 
    {
        res.status(400).json({ error: 'username exists' });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'wrong username' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'wrong password' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '5m' });
    res.json({ token });
};

export const logout = async (req, res) => {
    res.json({ message: 'u have logged out!' });
};