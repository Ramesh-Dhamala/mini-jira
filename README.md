# Mini Jira – Agile Project Management System

A modern full-stack project management application inspired by Jira, built to manage projects, sprints, tickets, and team collaboration workflows.

This project is being developed as a portfolio-grade application to demonstrate full-stack development skills, including authentication, role-based access control, real-time updates, and agile project management features.

---

## Project Overview

Mini Jira is designed to help teams organize their work using agile methodologies. It provides functionality for managing projects, sprints, tasks, comments, attachments, notifications, and real-time collaboration.

The goal of this project is not only to recreate core Jira features but also to build a scalable, production-ready application using modern web technologies.

---

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Socket.io Client
- Framer Motion
- DnD Kit

### Backend
- Node.js
- Express.js
- Prisma ORM
- SQLite (development)
- JWT Authentication
- Socket.io
- Multer

### Database
- SQLite (current)
- Easily configurable for PostgreSQL/MySQL

---

## Features Implemented

### Authentication & Authorization
- User registration
- User login/logout
- JWT authentication
- Protected routes
- Role-based access control

### Project Management
- Create projects
- Update projects
- Project ownership
- Project listing

### Sprint Management
- Create sprints
- Sprint planning
- Sprint status tracking

### Ticket Management
- Create tickets
- Update tickets
- Delete tickets
- Ticket priorities
- Ticket types
- Ticket status workflow

### Kanban Board
- Drag and drop tickets
- Real-time ticket movement
- Multiple status columns
- List and board views

### Collaboration
- Ticket comments
- Activity logs
- File attachments
- Notifications

### Real-time Features
- Socket.io integration
- Live ticket updates
- Live comments
- Live notifications

---

## Features Currently In Progress

- Dashboard analytics
- Advanced search and filters
- User profile management
- Team management
- Sprint reports
- Burndown charts
- Email notifications
- Production deployment
- Automated testing

---

## Project Structure

```bash
mini-jira/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── prisma/
│   ├── services/
│   └── uploads/
│
└── frontend/
    ├── components/
    ├── pages/
    ├── routes/
    ├── services/
    ├── context/
    └── utils/
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/your-username/mini-jira.git
cd mini-jira
```

### Backend Setup

```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the backend directory:

```env
PORT=5000

DATABASE_URL="file:./mini-jira.db"

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

---

## API Features

- Authentication API
- Project API
- Sprint API
- Ticket API
- Comment API
- Attachment API
- Notification API
- Activity Log API

---

## Future Improvements

Planned improvements include:

- AI-powered ticket suggestions
- Team chat
- Calendar view
- Sprint analytics
- Reporting dashboard
- CI/CD pipeline
- Docker support
- Cloud deployment
- Unit and integration testing

---

## Current Status

This project is actively being developed and continuously improved. New features and enhancements are added regularly as part of the development process.

---

## Author

**Ramesh Dhamala**

Computer Engineering Student | Machine Learning enthusiast | Full Stack Developer | Open Source Learner

---

## License

This project is licensed under the MIT License.
