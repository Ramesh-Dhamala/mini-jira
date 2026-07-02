const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createComment,
  getCommentsByTicket,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

router.use(protect);

router.post("/", createComment);
router.get("/ticket/:ticketId", getCommentsByTicket);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

module.exports = router;
