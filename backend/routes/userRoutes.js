const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { uploadAvatar } = require("../controllers/userController");

router.use(protect);

router.post("/avatar", upload.single("avatar"), uploadAvatar);

module.exports = router;
