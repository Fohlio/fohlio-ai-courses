## Getting Started

### Database setup

Spin up PostgreSQL in Docker, then sync Prisma and seed the default admin + migrated legacy course:

```bash
# Create .env with these values:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5433/fohlio_courses
# JWT_SECRET=super-secret-dev-key-change-in-prod
# BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

docker compose up db -d
npx prisma generate
npx prisma db push
npx tsx scripts/create-admin.ts   # creates seed admin user + backfills legacy course
```

### Test credentials

| Role  | Login        | Password   |
|-------|--------------|------------|
| Admin | `ivanbunin`  | `admin123` |

### Run the dev server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Helpful scripts

```bash
npm run db:generate   # regenerate Prisma client
npm run db:push       # push schema changes to Postgres
npm run db:seed       # ensure admin user + legacy course backfill
npm run db:backfill   # re-run only the legacy course backfill
npm run e2e:install   # install Playwright Chromium
npm run e2e           # run end-to-end tests
```

### Uploads

- Image and video uploads in the course constructor use Vercel Blob.
- If `BLOB_READ_WRITE_TOKEN` is missing, the studio still works, but asset uploads are disabled and show a clear error.

### E2E test accounts

- Playwright setup creates or reuses `e2e-student` with password `e2e-student-123` by default.
- Override with `E2E_GITHUB_NICKNAME` and `E2E_PASSWORD` if needed.
- The setup project also ensures one draft course named `E2E Course` exists for studio tests.
