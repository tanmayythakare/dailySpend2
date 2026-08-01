# 💸 DailySpend — Personal Finance Tracker

> A full-stack web application to track your daily expenses, income, recurring transactions, and money lent/borrowed — built with Spring Boot and Angular.

---

## 📖 Description

**DailySpend** is a personal finance tracking app designed to help you take control of your money. Whether you're recording a grocery bill, tracking money you lent to a friend, or monitoring your monthly income, DailySpend keeps it all organized in one place.

The app is built for everyday use — it's simple enough for beginners yet powerful enough to give you real financial insights through charts and reports.

**Why does it exist?**
Most people struggle to keep track of where their money goes. DailySpend solves this by giving you a clean dashboard, smart categorization, and a people ledger so you always know who owes you (and who you owe).

---

## ✨ Features

- 🔐 **User Authentication** — Secure registration and login with JWT tokens
- 🏦 **Account Management** — Create and manage multiple accounts (Cash, Bank, Credit)
- 💳 **Transaction Tracking** — Record three types of transactions:
  - **Expense** — Money you spent
  - **Money Given** — Money you lent to someone
  - **Money Taken** — Money you received from someone
- 👥 **People Ledger** — Track balances with individual people (who owes whom)
- 🗂️ **Categories** — Organize expenses with built-in and custom categories
- 📊 **Reports & Analytics** — Visual spending trends, category breakdowns, and date-range summaries
- 🔁 **Recurring Transactions** — Set up daily/weekly/monthly/quarterly/yearly auto-entries
- 💸 **Bill Splitter** — Split expenses across multiple people
- 🌙 **Dark Mode** — Full dark theme support
- 🔍 **Filter & Search** — Filter transactions by type, account, and date range
- 📥 **Export to CSV** — Download your transaction history
- 📱 **Responsive Design** — Works on desktop and mobile

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 17 | Programming language |
| Spring Boot 3.x | Backend framework |
| Spring Security | Authentication & authorization |
| Spring Data JPA | Database access layer |
| PostgreSQL | Primary database |
| Flyway | Database migrations (version control for DB) |
| JWT (jjwt) | Secure token-based authentication |
| Maven | Build tool |

### Frontend
| Technology | Purpose |
|---|---|
| Angular 17 | Frontend framework |
| TypeScript | Programming language |
| Angular Material | UI component library |
| ApexCharts | Interactive charts |
| SCSS | Styling |

---

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your computer:

- [Java 17+](https://adoptium.net/) — Download and install JDK 17 or higher
- [Node.js 18+](https://nodejs.org/) — Includes npm (needed for Angular)
- [PostgreSQL 14+](https://www.postgresql.org/download/) — The database
- [Git](https://git-scm.com/) — To clone the project
- A code editor like [VS Code](https://code.visualstudio.com/) (recommended)

---

## 🚀 Installation & Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/dailyspend.git
cd dailyspend
```

---

### Step 2 — Set Up the Database

1. Open your PostgreSQL client (e.g., pgAdmin or the terminal).
2. Create a new database:

```sql
CREATE DATABASE dailyspend;
```

> Flyway will automatically create all tables when the backend starts — you don't need to create them manually!

---

### Step 3 — Configure the Backend

1. Navigate to the backend folder:

```bash
cd dailyspend-backend
```

2. Create a local configuration file to store your secrets. Create the file:

```
src/main/resources/application-local.yml
```

3. Paste the following content and update the values:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/dailyspend
    username: your_postgres_username      # e.g., postgres
    password: your_postgres_password      # e.g., postgres

jwt:
  secret: your_super_secret_key_at_least_32_characters_long
  expiration: 864000000   # 10 days in milliseconds
```

> ⚠️ **Never commit this file to Git!** It's already listed in `.gitignore`.

---

### Step 4 — Run the Backend

From inside the `dailyspend-backend` folder, run:

```bash
# On Mac/Linux
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# On Windows
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

You should see the server start on **http://localhost:8080**

> The first run will take a few minutes as Maven downloads all dependencies.

---

### Step 5 — Run the Frontend

Open a **new terminal** and navigate to the frontend folder:

```bash
cd dailyspend-frontend
```

Install dependencies (first time only):

```bash
npm install
```

Start the development server:

```bash
npm start
```

The app will open at **http://localhost:4200** 🎉

---

## 🐳 Docker Setup (Backend + Database)

> Use Docker Compose to spin up the backend and PostgreSQL together — no manual DB setup required.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Steps

1. **Copy the environment template** and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your preferred database password and a strong JWT secret.

2. **Build and start backend + database:**

```bash
docker compose up --build
```

The backend will be available at **http://localhost:8080** once the database health check passes.

3. **Run the frontend separately** (in a new terminal):

```bash
cd dailyspend-frontend
npm install
npm start
```

The app will open at **http://localhost:4200** 🎉

4. **Stop everything:**

```bash
docker compose down
```

> To also remove the database volume (reset all data): `docker compose down -v`

---

## 🖥️ Usage

1. **Register** — Go to `http://localhost:4200/register` and create an account.

2. **Login** — Sign in with your username and password.

3. **Create an Account** — On the Dashboard, add your first financial account (e.g., "My Wallet" → CASH, "SBI Savings" → BANK).

4. **Add Transactions** — Go to Transactions → Add Transaction:
   - Choose **Expense** to record spending
   - Choose **Money Given** to record money you lent someone
   - Choose **Money Taken** to record money you received

5. **Manage People** — Go to the People section to see balances with each person you've transacted with.

6. **View Reports** — Go to Reports to see charts showing your spending trends and category breakdowns.

---

## 📁 Folder Structure

```
dailyspend/
│
├── dailyspend-backend/          # Spring Boot backend
│   ├── src/main/java/com/example/dailyspend/
│   │   ├── controller/          # REST API endpoints
│   │   ├── service/             # Business logic
│   │   ├── repository/          # Database queries
│   │   ├── entity/              # Database table models
│   │   ├── dto/                 # Data transfer objects
│   │   ├── config/              # Security & app configuration
│   │   ├── exception/           # Error handling
│   │   └── util/                # Helper utilities
│   ├── src/main/resources/
│   │   ├── application.yaml     # Main configuration
│   │   └── db/migration/        # Flyway SQL migration files (V1–V13)
│   ├── Dockerfile               # Multi-stage Docker image for backend
│   └── pom.xml                  # Maven dependencies
│
├── dailyspend-frontend/         # Angular frontend
│   ├── src/app/
│   │   ├── core/                # Services, interceptors, guards
│   │   ├── features/            # Pages (dashboard, transactions, people, reports, schedules, split, settings)
│   │   ├── layout/              # App shell / sidebar
│   │   ├── models/              # TypeScript interfaces
│   │   └── shared/              # Reusable components & imports
│   └── package.json             # Node dependencies
│
├── docs/                        # Architecture and rules documentation
│   └── Screenshots/             # App screenshots
├── docker-compose.yml           # Docker Compose (backend + PostgreSQL)
└── .env.example                 # Environment variables template
```

---

## 📸 Screenshots

| Page | Preview |
|---|---|
| Dashboard | ![Dashboard](docs/Screenshots/dashboard.png) |
| Transactions | ![Transactions](docs/Screenshots/transaction.png) |
| People Ledger | ![People](docs/Screenshots/people.png) |
| Reports | ![Reports](docs/Screenshots/reports.png) |

---

## 🔌 API Overview

The backend exposes a REST API. Here are the main endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT token |
| GET | `/api/v1/accounts` | List all accounts |
| POST | `/api/v1/accounts` | Create a new account |
| POST | `/api/v1/transactions/expense` | Record an expense |
| POST | `/api/v1/transactions/money-given` | Record money given |
| POST | `/api/v1/transactions/money-taken` | Record money taken |
| GET | `/api/v1/transactions/filter` | Filter transactions with pagination |
| GET | `/api/v1/people/with-balances` | List people with balances |
| GET | `/api/v1/reports/monthly` | Monthly financial summary |

> All endpoints (except auth) require a `Bearer <token>` header.

---

## 🔮 Future Improvements

Here are some features planned for future versions:

- [ ] 📧 Email notifications for large transactions
- [ ] 📱 Mobile app (React Native or Flutter)
- [ ] 💱 Multi-currency support
- [ ] 🔔 Budget alerts when spending exceeds a limit
- [ ] 👨‍👩‍👧 Shared accounts for families
- [ ] 🤖 AI-powered spending advisor

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/dailyspend.git
   ```
3. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and commit them:
   ```bash
   git commit -m "Add: description of your change"
   ```
5. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a **Pull Request** on GitHub

### Guidelines
- Follow the existing code style
- Write clear commit messages
- Test your changes before submitting
- For database changes, always add a new Flyway migration file — **never edit existing ones**
- Keep pull requests focused on one feature or fix

---

## 🐛 Known Issues / Troubleshooting

**"Cannot connect to server" on login**
→ Make sure the backend is running on port 8080 and PostgreSQL is running.

**"Access Denied" errors**
→ Your JWT token may have expired. Log out and log back in.

**Build fails with Java version error**
→ Make sure you have Java 17 or higher installed. Run `java -version` to check.

**npm install fails**
→ Try deleting the `node_modules` folder and running `npm install` again.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this project for personal or commercial use.

---

## 👤 Author

**Tanmay Thakare**

- GitHub: [@tanmaythakare](https://github.com/tanmaythakare)
- Email: tanmayrthakare@gmail.com
- LinkedIn: www.linkedin.com/in/tanmaythakare

---

<div align="center">

Made with ❤️ and ☕ | If you find this project useful, please ⭐ star the repository!

</div>


