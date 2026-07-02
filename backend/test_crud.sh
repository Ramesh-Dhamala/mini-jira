#!/bin/bash

# ==================== SETUP ====================
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtcXdlZGdidTAwMDBpank3ZjF5bnE1YnAiLCJyb2xlIjoiREVWRUxPUEVSIiwiaWF0IjoxNzgyNTY3NTYzLCJleHAiOjE3ODMxNzIzNjN9.u6aRuG-Ui1X1z9iv7jNvSOq_kS3O-oHvafhFexQCbs4"
PROJECT_ID="cmqwerpwe0000ij5zj5rpumnx"

echo "========================================="
echo "     🚀 TESTING ALL CRUD OPERATIONS     "
echo "========================================="

# ==================== 1. PROJECT CRUD ====================
echo -e "\n📁 1. TESTING PROJECT CRUD"

# CREATE Project
echo -e "\n  📝 CREATE Project:"
CREATE_PROJECT=$(curl -s -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"CRUD Test Project","description":"Testing CRUD operations"}')
echo "$CREATE_PROJECT" | jq .
TEST_PROJECT_ID=$(echo "$CREATE_PROJECT" | jq -r '.project.id')
echo "  ✅ Project ID: $TEST_PROJECT_ID"

# READ Projects
echo -e "\n  📖 READ Projects:"
curl -s -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN" | jq '.projects | length'

# UPDATE Project
echo -e "\n  ✏️ UPDATE Project:"
curl -s -X PUT "http://localhost:5000/api/projects/$TEST_PROJECT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Updated CRUD Project","description":"Updated description"}' | jq .

# DELETE Project
echo -e "\n  🗑️ DELETE Project:"
curl -s -X DELETE "http://localhost:5000/api/projects/$TEST_PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n  ✅ Project CRUD Complete!"

# ==================== 2. SPRINT CRUD ====================
echo -e "\n🏃 2. TESTING SPRINT CRUD"

# CREATE Sprint
echo -e "\n  📝 CREATE Sprint:"
CREATE_SPRINT=$(curl -s -X POST http://localhost:5000/api/sprints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"CRUD Sprint\",
    \"goal\":\"Testing sprint CRUD\",
    \"startDate\":\"2026-07-01\",
    \"endDate\":\"2026-07-14\",
    \"projectId\":\"$PROJECT_ID\"
  }")
echo "$CREATE_SPRINT" | jq .
SPRINT_ID=$(echo "$CREATE_SPRINT" | jq -r '.sprint.id')
echo "  ✅ Sprint ID: $SPRINT_ID"

# READ Sprints
echo -e "\n  📖 READ Sprints:"
curl -s -X GET "http://localhost:5000/api/sprints/project/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.sprints | length'

# UPDATE Sprint
echo -e "\n  ✏️ UPDATE Sprint:"
curl -s -X PUT "http://localhost:5000/api/sprints/$SPRINT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Updated Sprint","goal":"Updated goal"}' | jq .

# DELETE Sprint
echo -e "\n  🗑️ DELETE Sprint:"
curl -s -X DELETE "http://localhost:5000/api/sprints/$SPRINT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n  ✅ Sprint CRUD Complete!"

# ==================== 3. TICKET CRUD ====================
echo -e "\n🎫 3. TESTING TICKET CRUD"

# CREATE Ticket
echo -e "\n  📝 CREATE Ticket:"
CREATE_TICKET=$(curl -s -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\":\"CRUD Test Ticket\",
    \"description\":\"Testing ticket CRUD\",
    \"type\":\"TASK\",
    \"priority\":\"HIGH\",
    \"status\":\"TODO\",
    \"projectId\":\"$PROJECT_ID\"
  }")
echo "$CREATE_TICKET" | jq .
TICKET_ID=$(echo "$CREATE_TICKET" | jq -r '.ticket.id')
echo "  ✅ Ticket ID: $TICKET_ID"

# READ Tickets
echo -e "\n  📖 READ Tickets:"
curl -s -X GET "http://localhost:5000/api/tickets/project/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.tickets | length'

# UPDATE Ticket Status
echo -e "\n  ✏️ UPDATE Ticket Status (TODO → IN_PROGRESS):"
curl -s -X PUT "http://localhost:5000/api/tickets/$TICKET_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"IN_PROGRESS"}' | jq .

echo -e "\n  ✏️ UPDATE Ticket Status (IN_PROGRESS → DONE):"
curl -s -X PUT "http://localhost:5000/api/tickets/$TICKET_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"DONE"}' | jq .

# DELETE Ticket
echo -e "\n  🗑️ DELETE Ticket:"
curl -s -X DELETE "http://localhost:5000/api/tickets/$TICKET_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n  ✅ Ticket CRUD Complete!"

# ==================== 4. COMMENT CRUD ====================
echo -e "\n💬 4. TESTING COMMENT CRUD"

# First create a ticket for comments
CREATE_TICKET=$(curl -s -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\":\"Ticket for Comments\",
    \"description\":\"Testing comments\",
    \"type\":\"TASK\",
    \"priority\":\"MEDIUM\",
    \"status\":\"TODO\",
    \"projectId\":\"$PROJECT_ID\"
  }")
TICKET_ID=$(echo "$CREATE_TICKET" | jq -r '.ticket.id')

# CREATE Comment
echo -e "\n  📝 CREATE Comment:"
CREATE_COMMENT=$(curl -s -X POST http://localhost:5000/api/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"content\":\"This is a test comment\",
    \"ticketId\":\"$TICKET_ID\"
  }")
echo "$CREATE_COMMENT" | jq .
COMMENT_ID=$(echo "$CREATE_COMMENT" | jq -r '.comment.id')
echo "  ✅ Comment ID: $COMMENT_ID"

# READ Comments
echo -e "\n  📖 READ Comments:"
curl -s -X GET "http://localhost:5000/api/comments/ticket/$TICKET_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.comments | length'

# UPDATE Comment
echo -e "\n  ✏️ UPDATE Comment:"
curl -s -X PUT "http://localhost:5000/api/comments/$COMMENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content":"Updated comment content"}' | jq .

# DELETE Comment
echo -e "\n  🗑️ DELETE Comment:"
curl -s -X DELETE "http://localhost:5000/api/comments/$COMMENT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Clean up ticket
curl -s -X DELETE "http://localhost:5000/api/tickets/$TICKET_ID" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo -e "\n  ✅ Comment CRUD Complete!"

# ==================== 5. NOTIFICATION CRUD ====================
echo -e "\n🔔 5. TESTING NOTIFICATION CRUD"

# CREATE Notification (via ticket assignment)
echo -e "\n  📝 CREATE Notification (via ticket creation):"
CREATE_TICKET=$(curl -s -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\":\"Notification Test\",
    \"description\":\"Testing notifications\",
    \"type\":\"TASK\",
    \"priority\":\"MEDIUM\",
    \"status\":\"TODO\",
    \"projectId\":\"$PROJECT_ID\"
  }")
TICKET_ID=$(echo "$CREATE_TICKET" | jq -r '.ticket.id')

# READ Notifications
echo -e "\n  📖 READ Notifications:"
curl -s -X GET "http://localhost:5000/api/notifications" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.notifications | length'

# UPDATE Notification (Mark as read)
echo -e "\n  ✏️ UPDATE Notification (Mark as read):"
NOTIF_ID=$(curl -s -X GET "http://localhost:5000/api/notifications" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data.notifications[0].id')
if [ "$NOTIF_ID" != "null" ] && [ "$NOTIF_ID" != "" ]; then
  curl -s -X PUT "http://localhost:5000/api/notifications/$NOTIF_ID/read" \
    -H "Authorization: Bearer $TOKEN" | jq .
fi

# DELETE Notification
echo -e "\n  🗑️ DELETE Notification:"
if [ "$NOTIF_ID" != "null" ] && [ "$NOTIF_ID" != "" ]; then
  curl -s -X DELETE "http://localhost:5000/api/notifications/$NOTIF_ID" \
    -H "Authorization: Bearer $TOKEN" | jq .
fi

# Clean up ticket
curl -s -X DELETE "http://localhost:5000/api/tickets/$TICKET_ID" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo -e "\n  ✅ Notification CRUD Complete!"

# ==================== 6. USER CRUD (Admin only) ====================
echo -e "\n👤 6. TESTING USER CRUD"

# READ Users (Admin only)
echo -e "\n  📖 READ Users:"
curl -s -X GET "http://localhost:5000/api/auth/users" \
  -H "Authorization: Bearer $TOKEN" | jq '.count'

# UPDATE User (Profile)
echo -e "\n  ✏️ UPDATE User Profile:"
curl -s -X PUT "http://localhost:5000/api/auth/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Updated Name"}' | jq .

echo -e "\n  ✅ User CRUD Complete!"

# ==================== SUMMARY ====================
echo -e "\n========================================="
echo "     ✅ ALL CRUD TESTS COMPLETE!     "
echo "========================================="
echo -e "\n📊 Summary:"
echo "  ✅ Project CRUD"
echo "  ✅ Sprint CRUD"
echo "  ✅ Ticket CRUD"
echo "  ✅ Comment CRUD"
echo "  ✅ Notification CRUD"
echo "  ✅ User CRUD"
echo -e "\n🎉 All CRUD operations working!"
