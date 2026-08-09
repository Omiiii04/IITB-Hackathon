# IITB-Hackathon
Problem Statement 3: Smart Multi-Vendor E-Commerce & Inventory Management Platform.

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js >= 20.x
- Docker & Docker Compose

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Default local database credentials configured in `docker-compose.yml` and `.env.example`:
- **User**: `omii`
- **Password**: `omii0123`
- **Database**: `ecommerce_db`
- **Port**: `5432`

### 3. Start Local PostgreSQL Database
Start the PostgreSQL container in the background:
```bash
npm run docker:db
# or: docker compose up postgres -d
```

### 4. Run Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Docker Commands

| Command | Description |
|---|---|
| `npm run docker:db` | Starts local PostgreSQL container in background (`omii` / `omii0123`) |
| `npm run docker:db:down` | Stops and removes local PostgreSQL container |
| `npm run docker:up` | Builds and runs full stack (App + PostgreSQL) |
| `npm run docker:down` | Stops full stack containers |
| `npm run docker:logs` | Streams container logs |

---

## Production Build & Tests

```bash
# Run unit & integration tests
npm test

# Run build verification
npm run build
```
