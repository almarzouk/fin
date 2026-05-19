# FinanceOS

Personal finance management app with Next.js, MongoDB, NextAuth, shadcn/ui, and Recharts.

## Features

- Single-user authentication (credentials + bcrypt)
- Salary allocation planning
- Expense tracking with smart alerts
- Investment portfolio tracking
- Monthly reports with charts
- **Bilingual UI**: German (Deutsch) and Arabic (العربية) with RTL support for Arabic
- Dark mode

## Setup

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Generate a bcrypt password hash:

```bash
npx tsx scripts/hash-password.ts your_password
```

3. Set `.env.local`:

```
MONGODB_URI=mongodb://localhost:27017/finance-os
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<paste hash here>
```

4. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

## Language

Use the globe icon in the navbar to switch between **Deutsch** and **العربية**. Arabic enables RTL layout automatically.

## Tech stack

- Next.js 16 (App Router)
- Tailwind CSS + shadcn/ui
- MongoDB + Mongoose
- NextAuth.js (JWT, credentials)
- Recharts
- TypeScript

## Money storage

All amounts are stored in **cents** (integer) to avoid floating-point errors. The UI displays values divided by 100.
