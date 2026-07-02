const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getActivitiesByTicket,
  getActivitiesByProject,
} = require("../controllers/activityController");

router.use(protect);

router.get("/ticket/:ticketId", getActivitiesByTicket);
router.get("/project/:projectId", getActivitiesByProject);

module.exports = router;
