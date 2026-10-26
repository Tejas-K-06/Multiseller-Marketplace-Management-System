# Multi-Seller Marketplace Management System

A college DBMS mini project for a marketplace where multiple sellers list products, buyers place orders across sellers, and an admin manages sellers, categories, coupons and platform statistics. Orders are split into seller sub-orders so each seller can fulfil their own items.

## Tech stack

- Frontend: React, Vite, React Router and plain CSS
- Backend: Node.js, Express and JWT authentication
- Database: MySQL 8+ with InnoDB tables, constraints, views and transactions

## Main features

Buyer registration and login, catalog search and category filters, product variants and offers, cart, wishlists, addresses, coupon checkout, simulated payments, order tracking, reviews, seller inventory and fulfilment, and admin seller approval and reporting.

## Prerequisites

- Node.js 18 or newer
- MySQL 8 or newer
- Git

## Setup

1. Clone the repository and enter it:

   ```bash
   git clone <repository-url>
   cd "Marketplace Management System"
   ```

2. Create the database from the scripts, in this order, from the repository root:

   ```bash
   mysql -u <mysql-user> -p < database/01_schema_catalog.sql
   mysql -u <mysql-user> -p < database/02_schema_orders.sql
   mysql -u <mysql-user> -p < database/03_seed.sql
   ```

3. Install backend dependencies. The seed file already contains the bcrypt hash for
   `Password@123`:

   ```bash
   cd backend
   npm install
   ```

   Do not commit `backend/.env`, `frontend/.env`, passwords or generated dependency folders.

4. Copy the environment examples and fill in local values:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

   Keep `VITE_USE_MOCK=false` when using the real backend and database.

5. Start the backend:

   ```bash
   cd backend
   npm start
   ```

6. In another terminal, install and start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. Open `http://localhost:5173`.

## Seed accounts

All seed accounts use `Password@123` after the bcrypt hash is applied.

| Role | Email |
| --- | --- |
| Admin | `admin@mkt.com` |
| Seller | `techhub@mkt.com` |
| Seller | `fashionly@mkt.com` |
| Buyer | `rahul@mkt.com` |
| Buyer | `sneha@mkt.com` |

The delivery-agent seed account is `ravi@mkt.com`; it has no frontend screen.

## Project structure

```text
docs/       design, API and team documentation
database/   MySQL schema, seed data, queries and validation
backend/    Express API, controllers, models and middleware
frontend/   React pages, API wrappers, mock data and styles
```

## Documentation

- [High-Level Design](docs/HLD.md)
- [Low-Level Design](docs/LLD.md)
- [Database Design](docs/DATABASE_DESIGN.md)
- [API Design](docs/API_DESIGN.md)
- [Visual Design](docs/DESIGN.md)
- [Team Plan](docs/TEAM_PLAN.md)

## Team and branches

| Student | Area | Branch |
| --- | --- | --- |
| Tejas Kadam | Frontend and project lead | `dev_tejas` |
| Kanak Reshi | Backend | `dev_kanak` |
| Varad Kale | Database | `dev_varad` |

Git workflow: work only on your own branch; sync approved changes from `main`; use a pull request for review; only the project lead merges pull requests; use approved commit prefixes such as `feat:`, `fix:`, `docs:` and `chore:`.

## Troubleshooting

- MySQL not running: start the MySQL service, then retry the `mysql` commands.
- Access denied: check `DB_HOST`, `DB_USER`, `DB_PASSWORD` and `DB_NAME` in `backend/.env`.
- Port 5000 in use: stop the other process or change `PORT` and update the frontend proxy.
- Blank page or proxy errors: confirm the backend is running, `VITE_USE_MOCK=false`, and restart Vite after changing `.env`.
- Unknown database: run `database/01_schema_catalog.sql` first; it creates `marketplace_db`.
