import jwt from "jsonwebtoken";
import crypto from "crypto";
import { findUserByEmail, createUser, findUserById } from "../models/userModel.js";

const cookiesOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge : 1000 * 60 * 30 , //30 min
};

const generateToken = (id) => jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30m"});

//SHA-512 hashing

const hashedPassword = (password) =>{
    return crypto.createHash("sha512").update(password).digest("hex");
};

export const register = async (req, res) => {
    try {
        const {full_name, email, phone_number, password, device_id} = req.body;

        if (!full_name || !email || !phone_number || !password || !device_id) {
            return res.status(400).json({message: "All fields are required"});
        }

        const userExists = await findUserByEmail(email);

        if (userExists) {
            return res.status(400).json({message: "User already exists"});
        }

        const password_hash = hashedPassword(password);
        const newUser = await createUser(full_name, email, phone_number, password_hash, device_id);

        const token = generateToken(newUser.id);
        res.cookie("token", token, cookiesOptions);

        res.status(201).json({message: "Account created successfully. Await admin device verification.", user: newUser,})

    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server error"});
        
    }
}

export const login = async (req, res) => {
    try {
        const {email, password, device_id} = req.body;

        if (!email || !password || !device_id) {
            return res.status(400).json({message: "All fields are required"});
        }

        const user = await findUserByEmail(email);
        if (!user) return res.status(400).json({message: "Invalid credentials"});

        const password_hash = hashedPassword(password);

        if (user.password_hash !== password_hash) {
            return res.status(400).json({message: "Invalid credentials"});
        }

        // Check device verification

        if (!user.is_verified || user.device_id !== device_id ) {
            return res.status(403).json({message: "Device not verified. Please wait for approval."})
        }

        const token = generateToken(user.id);
        res.cookie("token", token, cookiesOptions);
        res.json({user: {id: user.id, full_name: user.full_name, email: user.email}});
    } catch (err) {
        res.status(500).json({message: "Server error"})
    }
}

export const logout = (req, res) =>{
    res.cookie("token", "", {...cookiesOptions, maxAge: 1});
    res.json({message: "Logged out successfully"});
};

export const getDashboard = async (req, res) =>{
    const user = await findUserById(req.user.id);
    res.json(user);
}