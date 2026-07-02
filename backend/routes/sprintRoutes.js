const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createSprint,
  getSprintsByProject,
  getSprint,
  updateSprint,
  updateSprintStatus,
  deleteSprint,
  getActiveSprint,
  getSprintReport,
} = require("../controllers/sprintController");

// All routes require authentication
router.use(protect);

// Sprint CRUD
router.post("/", createSprint);
router.get("/project/:projectId", getSprintsByProject);
router.get("/active/:projectId", getActiveSprint);
router.get("/:id", getSprint);
router.get("/:id/report", getSprintReport);
router.put("/:id", updateSprint);
router.put("/:id/status", updateSprintStatus);
router.delete("/:id", deleteSprint);

module.exports = router;
