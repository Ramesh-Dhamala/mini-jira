// backend/routes/ticketRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/authMiddleware"); // Only if you have a validate function

const {
  createTicket,
  getTicketsByProject,
  getTicketsBySprint,
  getTicket,
  updateTicket,
  moveTicket,
  deleteTicket,
  searchTickets,
  getTicketStats,
} = require("../controllers/ticketController");

// All routes require authentication
router.use(protect);

// ✅ GET routes - NO validation middleware
router.get("/search", searchTickets);
router.get("/project/:projectId", getTicketsByProject);
router.get("/sprint/:sprintId", getTicketsBySprint);
router.get("/stats/:projectId", getTicketStats);
router.get("/:id", getTicket); // ✅ NO validation here

// ✅ POST/PUT routes - WITH validation (if needed)
router.post("/", createTicket);
router.put("/:id", updateTicket);
router.put("/:id/status", moveTicket);
router.delete("/:id", deleteTicket);

module.exports = router;
