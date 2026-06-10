# Flow

An online web-based workspace built for any kind of work. Flow lets teams organize their work across multiple workspaces and task boards, where each task can be assigned to a specific team member — keeping everyone aligned and projects moving.

---

## Tech Stack

**Frontend**
- React
- React Router
- CSS / Tailwind CSS

**Backend**
- Node.js
- Express.js
- REST APIs
- JWT Authentication

**Database**
- MySQL

**Security & Validation**
- Zod (request validation)
- bcrypt (password hashing)
- Middleware
- Role-Based Access Control

**Tools**
- Git & GitHub
- Docker & Docker Compose
- Postman
- VS Code

---

## Features

- 🗂️ **Multiple Workspaces** — Create separate workspaces for different teams or projects
- 📌 **Task Boards** — Organize tasks visually across boards within each workspace
- 👤 **Task Assignment** — Assign tasks to specific team members with clear ownership
- 🔐 **JWT Authentication** — Secure login and protected routes
- 🛡️ **Role-Based Access** — Different permissions for workspace owners and members
- ✅ **Zod Validation** — All API inputs are validated server-side
- 🔒 **bcrypt Password Hashing** — User passwords are securely hashed before storage

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/flow.git
   cd flow
   ```

2. **Set up environment variables**

   Create a `.env` file in the root folder:
   ```env
   DB_HOST=db
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=flow
   JWT_SECRET=your_jwt_secret
   ```

3. **Start the app**
   ```bash
   docker compose up
   ```

   This starts the frontend, backend, and database in one command. No separate installs needed.

4. Open `http://localhost:5173` in your browser.

### Stopping the app
```bash
docker compose down
```

---

## Project Structure

```
flow/
├── client/          # React frontend
│   ├── frontend/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
├── backend/          # Express backend
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── index.js
├── docker-compose.yml
└── README.md
```

---

## Author

**Symmon Jared Gagaring**
- GitHub: [@ySyJared](https://github.com/SyJared)