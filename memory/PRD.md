# KantongKu — Product Requirement Document (PRD)

## Original Problem Statement
Build a fully functional, production-ready Smart Money Management Web Application named **KantongKu** ("Asisten Keuangan AI") — mobile-first PWA optimized for Android wrap. Features: multi-wallet, transaction timeline, debt tracker, category budgets with progress bars, calendar accumulation grid, interactive pie charts, photo attachments, freemium (2 wallets free vs unlimited Pro at Rp 29.000/bulan), simulated QRIS/bank transfer payment, dark mode toggle with local persistence, reviewer account for Google Play, public privacy policy, PWA manifest + service worker.

## User Personas
1. **Personal finance beginner** — wants a simple daily tracker with visual insights.
2. **Budget-conscious millennial** — needs debt tracking and category budgets to stay disciplined.
3. **Multi-wallet power user** — manages cash + banks + e-wallets + credit + investments (Pro).
4. **Google Play reviewer** — pre-seeded premium account to test all hidden features.

## Architecture
- **Frontend**: React 19 + React Router 7 + TailwindCSS + shadcn/ui + Recharts + Sonner. Mobile-first (max-w-md container). Bricolage Grotesque + Plus Jakarta Sans fonts. Dark/light theming via `.dark` class + `kk_theme` localStorage.
- **Backend**: FastAPI + Motor (async MongoDB) + JWT (30-day access token via httpOnly cookie + Bearer fallback) + bcrypt password hashing. All routes prefixed `/api`.
- **Database**: MongoDB collections — users, wallets, transactions, debts, budgets, payment_logs.
- **PWA**: manifest.json + service-worker.js caching static assets, bypassing `/api/*`.

## Core Requirements (Static)
- Bahasa Indonesia UI throughout
- Mobile-first viewport, max-width 430px, centered container on desktop
- Brand palette: #2C62B5 (blue), #14B8A6 (teal), #F59E0B (gold), #EF4444 (coral)
- Dark mode with persistent state via localStorage
- Reviewer bypass account: reviewer@spendly.com / ReviewerPassword123! (Premium)

## What's Been Implemented (Iteration 1 — Feb 2026)
- [x] Splash / Onboarding with mascot logo (SVG)
- [x] JWT Auth: register, login, logout, `/me`
- [x] Executive Dashboard: balance card, monthly income/expense, timeline grouped by date, quick action tiles
- [x] Add Transaction form: type toggle, amount, category chips, wallet, **shadcn Calendar+Popover (id_locale)**, note, photo (base64)
- [x] Multi-wallet CRUD with freemium 2-wallet cap
- [x] Debt/Receivable Tracker with dual tabs, settle & delete
- [x] Category Budgets with progress bars + "Melebihi Anggaran" pill for over-budget
- [x] Calendar Financial Grid with per-day green/red markers + month totals header
- [x] Interactive donut Pie Chart Analysis — click segments/legend to filter
- [x] KantongKu Pro pricing page — Rp 29.000/bulan
- [x] **Midtrans Snap payment integration** with automatic fallback to simulation when env keys empty
- [x] Simulated QRIS + Bank Transfer checkout modal → toggles user to premium
- [x] Gold PRO badge on Dashboard + Profile after upgrade
- [x] Dark Mode toggle (Sun/Moon icon) in Dashboard header + Profile — persistent
- [x] Public `/privacy-policy` route
- [x] PWA manifest + service worker
- [x] Pre-seeded reviewer account (5 wallets, 15 transactions, 4 debts, 5 budgets)
- [x] **Deployment health check: PASS**

## Backlog / Next Actions (P0 → P2)
- **P1**: Replace native `<input type=datetime-local>` on /tambah with shadcn Calendar+Popover for UI consistency.
- **P1**: Add AI Assistant chatbot ("Asisten Keuangan AI") using Emergent LLM key — user chat about spending patterns, savings suggestions.
- **P1**: Real payment integration (Midtrans/Xendit) to replace simulation.
- **P2**: Explicit CORS origin (currently `*` — works via same-origin ingress but tighter is better).
- **P2**: Export CSV/PDF from Analysis page (Pro).
- **P2**: Recurring transactions & bill reminders.
- **P2**: Split server.py into routers (approaching 700 lines).
- **P3**: Family/shared wallet mode.

## Test Coverage
- Backend: 21/21 pytest tests (auth, wallets, transactions, debts, budgets, freemium enforcement, premium simulation, wallet balance sync).
- Frontend: E2E verified for splash, login (reviewer shortcut), dashboard, bottom nav, add transaction, calendar, analysis (donut + filter), debts (tabs + CRUD), budgets (over-budget pill), wallets (freemium notice), Pro (QRIS mock → PRO badge), theme toggle persistence, register + freemium wallet auto-seed.
