 # Finance Tracker Frontend

Next.js frontend for the Finance Tracker application.

---

# Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Axios
- Recharts

---

# Features

- Authentication UI
- Protected Routes
- Dashboard Analytics
- Transactions Management
- Budget Management
- Category Management
- Responsive UI

---

# Project Structure


src/
├── app/
├── components/
├── services/
├── hooks/
├── types/
└── lib/

Install Dependencies
npm install

Install Charts Library
npm install recharts

Run Frontend
npm run dev

Frontend runs on:
http://localhost:3000

Authentication Flow
User registers or logs in
JWT token stored in localStorage
Protected pages require authentication
Logout removes token

Main Pages
Login
User authentication
Register
Create new account

Dashboard
Financial summary
Charts
Budget usage
Recent transactions

Transactions
Add/Edit/Delete transactions
Filter by type/category/date

Categories
Add/Edit/Delete categories

Budgets
Add/Edit/Delete budgets
Budget progress tracking

Dashboard Features
Total Income
Total Expense
Current Balance
Expense Pie Chart
Monthly Income vs Expense Chart
Recent Transactions
Budget Progress
API Integration

Axios is used to connect with the backend API.

Base URL:
http://localhost:8080/api

Future Improvements
Dark mode
Better animations
Mobile optimization
Export reports

Author
Ulindu Dakshitha
