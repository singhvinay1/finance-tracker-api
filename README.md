# Financial Records API

A production-grade RESTful API for managing financial records with Role-Based Access Control (RBAC), aggregation analytics, and clean layered architecture.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js + Express | Fast, readable, minimal boilerplate |
| Database | PostgreSQL | Relational model suits financial aggregations and integrity |
| ORM | Prisma | Type-safe queries, clean migrations, excellent DX |
| Auth | JWT (Bearer) | Stateless, scalable |
| Validation | Zod | Schema-first, composable, TypeScript-compatible |
| Docs | Swagger / OpenAPI 3 | Self-documenting, testable in browser |

---

## Architecture

```
src/
├── config/         # Prisma singleton, Swagger spec
├── controllers/    # HTTP layer — parse request, call service, return response
├── middleware/     # authenticate, authorize (RBAC), validate (Zod)
├── routes/         # Express routers + JSDoc Swagger annotations
├── services/       # Business logic — all DB calls live here
├── utils/          # response helpers, JWT wrapper, AppError
└── validators/     # Zod schemas per domain
```

### Key Design Decisions

- **Controller → Service split** — controllers never touch Prisma directly; services own all DB logic. Makes unit testing trivial.
- **Soft delete** — `isDeleted: true` instead of physical delete. Financial records need an audit trail.
- **`Decimal(12,2)` for amounts** — avoids floating-point rounding errors in financial calculations.
- **Factory RBAC middleware** — `authorize('ANALYST', 'ADMIN')` is composable and reads like a permission table.
- **Uniform JSON envelope** — every response is `{ error, message, data }`. Frontend never guesses the shape.
- **Pagination capped at 100** — prevents accidental full-table scans from the query layer.

---

## Role Permissions

| Action | VIEWER | ANALYST | ADMIN |
|---|:---:|:---:|:---:|
| View records | ✓ | ✓ | ✓ |
| Create record | | | ✓ |
| Update record | | | ✓ |
| Delete record | | | ✓ |
| View dashboard / analytics | | ✓ | ✓ |
| Manage users | | | ✓ |

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register — role optional (defaults to VIEWER) |
| POST | `/api/auth/login` | Login — returns JWT |

### Users _(Admin only)_
| Method | Path | Description |
|---|---|---|
| GET | `/api/users` | List all users (paginated) |
| PATCH | `/api/users/:id/status` | Set ACTIVE / INACTIVE |
| PATCH | `/api/users/:id/role` | Change role |

### Records
| Method | Path | Roles |
|---|---|---|
| POST | `/api/records` | Admin |
| GET | `/api/records` | All |
| PUT | `/api/records/:id` | Admin |
| DELETE | `/api/records/:id` | Admin |

**GET /api/records query params:** `page`, `limit`, `type` (INCOME\|EXPENSE), `category`, `startDate`, `endDate`

### Dashboard _(Analyst + Admin)_
| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | totalIncome, totalExpense, netBalance, category breakdown |
| GET | `/api/dashboard/trends` | Month-over-month totals grouped by type |

---

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Install & run

```bash
git clone <repo>
cd Assignment_Backend

npm install

cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET

npx prisma migrate dev --name init
npx prisma generate

# Optional: seed demo data
npm run prisma:seed

npm run dev
```

| URL | Purpose |
|---|---|
| `http://localhost:3000/api-docs` | Swagger UI |
| `http://localhost:3000/health` | Health check |

### Demo credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@example.com | admin123 |
| ANALYST | analyst@example.com | analyst123 |
| VIEWER | viewer@example.com | viewer123 |

---

## Sample Requests

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123","role":"ADMIN"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
# Copy the token from the response
```

### Create a record
```bash
curl -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"type":"INCOME","category":"Salary","date":"2024-01-15","note":"Jan salary"}'
```

### Filter records
```bash
curl "http://localhost:3000/api/records?type=INCOME&category=Salary&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Dashboard summary
```bash
curl http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "error": false,
  "message": "Dashboard summary",
  "data": {
    "totalIncome": 17000,
    "totalExpense": 3520,
    "netBalance": 13480,
    "categoryBreakdown": [
      { "category": "Salary",     "type": "INCOME",  "total": 15000 },
      { "category": "Investment", "type": "INCOME",  "total": 2000  },
      { "category": "Rent",       "type": "EXPENSE", "total": 2400  }
    ]
  }
}
```

### Monthly trends
```bash
curl http://localhost:3000/api/dashboard/trends \
  -H "Authorization: Bearer <token>"
```

---

## Tests

```bash
npm test                # run all tests
npm run test:coverage   # with coverage report
```

Tests use mocked Prisma — no live database required.

---

## Assumptions

1. **Open registration** — any caller can register with any role. In a real system, ADMIN creation would require an existing admin's token.
2. **Soft delete only** — `isDeleted: true`; records are never physically removed to preserve financial audit trails.
3. **Rate limit** — 100 requests per 15 min per IP on all `/api` routes. Configurable via env.
4. **Password hashing** — bcrypt with salt rounds = 12 (deliberately slow).
5. **Amount as Decimal string in JSON** — Prisma serializes `Decimal` values as strings (e.g. `"5000.00"`) to preserve precision. The dashboard summary converts to `Number` for arithmetic.
6. **Trends endpoint requires PostgreSQL** — uses a `DATE_TRUNC` raw query not portable to SQLite.
