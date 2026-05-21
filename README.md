# Pot — *everyone chips in. The pot fills up.*

A friendly split-bill + payment tracker for groups. Create a bill, share a link, and watch a little pot fill up as friends confirm their payments. No accounts, no chasing — just a satisfying communal vessel.

<p align="center">
  <a href="https://rekaware.a.pinggy.link/bill">
    <img alt="Live demo — rekaware.a.pinggy.link/bill" src="https://img.shields.io/badge/%E2%96%B6%20Live%20Demo-rekaware.a.pinggy.link%2Fbill-C5553D?style=for-the-badge&labelColor=3E2C23">
  </a>
</p>

> [!TIP]
> **Try it now → [https://rekaware.a.pinggy.link/bill](https://rekaware.a.pinggy.link/bill)**
> Create a bill, open the share link on your phone, confirm payment, and watch the pot fill.

## What you can do

- **Organizer** — create a bill (title, total, due date, participants, equal or custom split). Get a public share link + a private dashboard link.
- **Members** — open the share link, see their share, tap their name, confirm payment (with an optional note like *"paid via DuitNow"*).
- **Organizer dashboard** — see who has paid and who hasn't, the pot's fill level, recent activity, and a one-tap reminder generator for WhatsApp.

No real payment gateway is integrated — payment confirmation is manual/simulated, per spec.

## Highlights

- **Pot visualisation** — animated SVG pot whose liquid rises smoothly as the bill fills. Surface shimmer, two wave layers for depth, steam wisps and a warm glow when the pot is full.
- **Celebration** — confetti + warm radial glow when the pot hits 100% (gated by sessionStorage so it fires once).
- **Mobile-first** — designed for 375px first; works beautifully when opened from a WhatsApp link.
- **Light + dark mode** — terracotta / cream / sage palette in light; deep clay in dark.
- **No accounts** — admin access via a secret token embedded in the dashboard URL.
- **QR code + WhatsApp share + native share** — pick whichever you prefer.
- **Reminder composer** — generates a polite copy-paste WhatsApp message for whoever hasn't paid.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** with custom theme tokens
- **Framer Motion** for transitions and the pot's liquid animation
- **better-sqlite3** for persistent local storage (`./data/app.db`)
- **next/font** with **Fraunces** (display) + **Inter** (UI)
- **qrcode** for QR generation, **nanoid** for short URL slugs + admin tokens

## Run it

### Local dev

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

Data lives in `./data/app.db` (created on first run). To start fresh, delete that file.

### Docker + Pinggy (public tunnel)

The included `docker-compose.yml` runs the app behind a [Pinggy](https://pinggy.io) tunnel, so the bill is reachable from any phone — perfect for sharing links from WhatsApp.

```bash
cp .env.example .env       # set PINGGY_TOKEN
docker compose up -d --build
docker compose logs -f pinggy   # shows the public URL
```

You'll get:
- Public: `https://<your-subdomain>.a.pinggy.link` (or whatever URL Pinggy assigns)
- Local:  `http://localhost:8080` (bound to 127.0.0.1 only)

The stack is two services:
- `app` — Node 22 runtime with the Next.js standalone build, listening on port 80 inside the container. SQLite persists to a `./data` volume on the host.
- `pinggy` — minimal `openssh-client` container that shares `app`'s network namespace (`network_mode: "service:app"`) and opens a reverse SSH tunnel to `pro.pinggy.io`.

Why raw `openssh-client` instead of `pinggy/pinggy`? The official image wraps ssh in a TUI that interferes with the response stream when run without an attached terminal — requests would hang with TLS EOF errors. The plain `ssh -R` works perfectly.

To stop:

```bash
docker compose down
```

## Project layout

```
src/
  app/
    page.tsx                  ← landing
    new/page.tsx              ← create a bill
    new/created/page.tsx      ← share link + admin link
    b/[slug]/page.tsx         ← public bill (members confirm here)
    b/[slug]/admin/page.tsx   ← organizer dashboard
    b/[slug]/not-found.tsx    ← friendly 404
  components/
    Pot.tsx                   ← signature liquid pot visualization
    BillForm.tsx              ← create-bill form
    ParticipantRow.tsx        ← member row (public + admin variants)
    ShareSheet.tsx            ← copy link / WhatsApp / native / QR
    ReminderComposer.tsx      ← copy-paste reminder generator
    CelebrationOverlay.tsx    ← confetti + glow at 100%
    DeleteBillButton.tsx      ← confirmation dialog
    SiteHeader.tsx, Brand.tsx, PotLogo.tsx, ThemeToggle.tsx
  lib/
    db.ts                     ← better-sqlite3 singleton + migrations
    bills.ts                  ← domain functions
    actions.ts                ← Next.js server actions
    format.ts                 ← currency + date helpers
    types.ts
```

## Routes

| Path | For | What |
|---|---|---|
| `/` | anyone | Landing |
| `/new` | organizer | Create bill |
| `/new/created?slug=…&token=…` | organizer | Success screen with share + admin links |
| `/b/[slug]` | members (public) | View bill, confirm payment |
| `/b/[slug]/admin?token=…` | organizer | Dashboard |

## Design system

- **Palette** — terracotta `#C5553D`, cream `#F8F1E5`, sage `#7A8B6F`, deep clay `#3E2C23`, amber `#E69A52`
- **Type** — Fraunces (serif, display) + Inter (sans, body)
- **Mood** — warm, communal, cozy, just a little playful
