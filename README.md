# SipQuest

SipQuest is a personal drink log app for tracking and revisiting tasting notes for sake, highballs, beer, wine, and more.

## Stack

- Next.js (App Router)
- TypeScript
- Prisma
- SQLite
- PWA basics (manifest + service worker)

## Setup

1. Install dependencies:

```bash
nvm use
npm install
```

2. Apply the initial database migration:

```bash
npm run db:migrate
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000).

## Useful commands

```bash
npm run lint
npm run db:generate
npm run db:studio
```

## Notes

- Uploaded photos are stored under `public/uploads/`.
- SQLite file is created at `prisma/dev.db`.
