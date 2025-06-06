# SDCKL Student Attendance Management System

## Overview

This is a student attendance management system with biometric attendance integration, student and class management, reports, and user authentication.

## Prerequisites

- Node.js and npm installed
- MySQL database set up with the provided schema
- Backend dependencies installed (`npm install` in `sdckl-attendance-backend`)

## Starting the Backend Server

1. Navigate to the backend directory:

```bash
cd sdckl-attendance-backend
```

2. Install dependencies (if not done already):

```bash
npm install
```

3. Start the backend server:

```bash
node server.js
```

The backend server will run on port 3001 by default.

## Serving the Frontend

To serve the frontend files, run a simple HTTP server in the `sdckl-attendance` directory:

```bash
python3 -m http.server 8000 -d sdckl-attendance
```

This will serve the frontend on port 8000.

## Accessing the System

Open your browser and navigate to:

- Login page: [http://localhost:8000/login.html](http://localhost:8000/login.html)
- Dashboard: [http://localhost:8000/dashboard.html](http://localhost:8000/dashboard.html)
- Students management: [http://localhost:8000/students.html](http://localhost:8000/students.html)
- Classes management: [http://localhost:8000/classes.html](http://localhost:8000/classes.html)
- Biometric attendance: [http://localhost:8000/biometric.html](http://localhost:8000/biometric.html)
- Reports: [http://localhost:8000/reports.html](http://localhost:8000/reports.html)

## Notes

- Ensure the backend server is running before accessing the frontend pages.
- The frontend communicates with the backend API at `http://localhost:3001/api`.
- Use the login page to authenticate and obtain access to the system.
- For any issues, check the backend server logs and browser console for errors.

## Database Schema

The database schema files are located in the backend directory (`database-schema.sql`).

---

If you need further assistance, please let me know.
