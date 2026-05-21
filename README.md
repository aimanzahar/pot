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
