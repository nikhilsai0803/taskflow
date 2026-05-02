# ⬡ TaskFlow – Team Task Manager

A full-stack project management app with role-based access control.

## Tech Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | React 18, React Router v6, Axios          |
| Backend  | Node.js, Express.js                       |
| Database | MongoDB + Mongoose ODM                    |
| Auth     | JWT (jsonwebtoken) + bcryptjs             |
| Validation | express-validator                       |

---

## Project Structure

```
taskflow/
├── backend/           # Express REST API
│   ├── config/        # DB connection
│   ├── controllers/   # Route handlers
│   ├── middleware/    # Auth, validation
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   └── server.js      # Entry point
│
└── frontend/          # React SPA
    ├── public/
    └── src/
        ├── components/ # Reusable UI (Modal, Badges, Buttons…)
        ├── context/    # AuthContext
        ├── pages/      # Dashboard, Projects, Tasks, Team, Admin
        └── utils/      # Axios API service
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
cp .env.example .env        # Fill in your MONGO_URI and JWT_SECRET
npm install
npm run dev                 # Runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env        # Set REACT_APP_API_URL if needed
npm install
npm start                   # Runs on http://localhost:3000
```

---

## API Reference

### Auth
| Method | Endpoint                  | Access  | Description         |
|--------|---------------------------|---------|---------------------|
| POST   | /api/auth/register        | Public  | Register user       |
| POST   | /api/auth/login           | Public  | Login, get JWT      |
| GET    | /api/auth/me              | Private | Get current user    |
| PUT    | /api/auth/update-password | Private | Change password     |

### Projects
| Method | Endpoint               | Access       | Description               |
|--------|------------------------|--------------|---------------------------|
| GET    | /api/projects          | Private      | List accessible projects  |
| POST   | /api/projects          | Private      | Create project            |
| GET    | /api/projects/:id      | Member/Admin | Get project details       |
| PUT    | /api/projects/:id      | Owner/Admin  | Update project            |
| DELETE | /api/projects/:id      | Owner/Admin  | Delete project + tasks    |
| GET    | /api/projects/:id/stats| Member/Admin | Task stats breakdown      |

### Tasks
| Method | Endpoint                  | Access       | Description            |
|--------|---------------------------|--------------|------------------------|
| GET    | /api/tasks                | Private      | List tasks (filtered)  |
| GET    | /api/tasks/my             | Private      | My assigned tasks      |
| GET    | /api/tasks/dashboard-stats| Private      | Dashboard counts       |
| POST   | /api/tasks                | Member/Admin | Create task            |
| GET    | /api/tasks/:id            | Private      | Get task detail        |
| PUT    | /api/tasks/:id            | Creator/Admin| Update task            |
| DELETE | /api/tasks/:id            | Creator/Admin| Delete task            |

### Users (Admin only)
| Method | Endpoint      | Access | Description     |
|--------|---------------|--------|-----------------|
| GET    | /api/users    | Admin  | List all users  |
| GET    | /api/users/:id| Private| Get user        |
| PUT    | /api/users/:id| Self/Admin | Update user |
| DELETE | /api/users/:id| Admin  | Remove user     |

---

## Role-Based Access Control

| Feature                       | Member | Admin |
|-------------------------------|--------|-------|
| View own projects & tasks     | ✅     | ✅    |
| Create projects               | ✅     | ✅    |
| Edit/Delete own projects      | ✅     | ✅    |
| Edit/Delete any project       | ❌     | ✅    |
| Create tasks in joined project| ✅     | ✅    |
| Update own tasks              | ✅     | ✅    |
| Update any task               | ❌     | ✅    |
| View all users                | ❌     | ✅    |
| Change user roles             | ❌     | ✅    |
| Delete users                  | ❌     | ✅    |
| Admin Panel access            | ❌     | ✅    |

---

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Features

- **Authentication** — JWT-based signup/login with bcrypt password hashing
- **Projects** — Create, manage, archive projects with color labels and team members
- **Tasks** — Full CRUD with status, priority, assignee, due dates, overdue detection
- **Dashboard** — Stats overview, my tasks, project progress bars, overdue alerts
- **Team** — View all team members and their task loads
- **Role-Based Access** — Admin vs Member permissions enforced on API level
- **Admin Panel** — Manage users (change roles, remove), delete any project
