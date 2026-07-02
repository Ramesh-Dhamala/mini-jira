const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  searchUsers,
  followUser,
  getFollowers,
  getFollowing,
  searchTickets,
  searchProjects,
} = require("../controllers/searchController");

router.use(protect);

// Search endpoints
router.get("/users", searchUsers);
router.get("/tickets", searchTickets);
router.get("/projects", searchProjects);

// Follow endpoints
router.post("/follow", followUser);
router.get("/followers/:userId?", getFollowers);
router.get("/following/:userId?", getFollowing);

module.exports = router;
