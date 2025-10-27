import express from "express";
import { register, login, logout, getDashboard } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { verifyDevice } from "../middleware/verifyDevice.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/dashboard", protect, verifyDevice, getDashboard);

export default router;
