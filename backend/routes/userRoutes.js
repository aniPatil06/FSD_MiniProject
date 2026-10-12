const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// USER & ADMIN
router.get("/dashboard", protect, (req, res) => {
  res.json({
    message: "Welcome to the protected dashboard",
    user: req.user
  });
});

// ADMIN ONLY
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin! You can access this page."
  });
});

module.exports = router;