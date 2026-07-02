const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  uploadAttachment,
  getAttachmentsByTicket,
  deleteAttachment,
} = require("../controllers/attachmentController");

router.use(protect);

router.post("/", upload.single("file"), uploadAttachment);
router.get("/ticket/:ticketId", getAttachmentsByTicket);
router.delete("/:id", deleteAttachment);

module.exports = router;
