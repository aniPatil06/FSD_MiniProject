const express = require("express");
const { body, validationResult } = require("express-validator");
const { registerUser, loginUser, getProfile, getAdminData } = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

const validateRegister = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must contain at least 6 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    next();
  }
];

router.post("/register", validateRegister, registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.get("/admin", protect, admin, getAdminData);

module.exports = router;