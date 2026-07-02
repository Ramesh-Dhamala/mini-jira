const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorize, ROLES } = require("../middleware/roles");

const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addTeamMember,
  removeTeamMember,
} = require("../controllers/projectController");

// All routes require authentication
router.use(protect);

// Project CRUD
router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Team management
router.get("/:id/members", getProjectMembers);
router.post("/:id/members", addTeamMember);
router.delete("/:id/members/:userId", removeTeamMember);

module.exports = router;
