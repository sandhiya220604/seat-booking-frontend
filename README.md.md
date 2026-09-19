# Seat Booking — Frontend

A React interface for the [seat-booking backend](../../seat-booking) —
a theater-style seat map that lets users select and book seats in real
time, backed by a concurrency-safe API.

## What it does

- Fetches live seat availability from the backend on load
- Renders seats grouped by row, with an aisle gap and row labels, styled
  like a real theater booking screen
- Supports multi-select: pick several seats, then confirm all at once via
  a bottom booking bar showing seat count and total price
- Applies row-based pricing tiers (Premium vs Regular)
- Reflects real backend responses — a seat that's already been booked by
  another request correctly shows as unavailable after a refresh, since
  all state is re-fetched from the server rather than assumed locally

## Tech stack

- React (Vite)
- Plain CSS (no UI framework) — all seat states, tiers, and the booking
  bar are hand-styled

## Why this matters alongside the backend

The backend's core work is preventing double-booking under concurrent
load. This frontend exists to demonstrate that work end-to-end — a real
user flow, a real network call, a real database write — rather than just
proving the API works in isolation via Postman.

## Running locally

Requires the [backend](../../seat-booking) running on `http://localhost:6060`
first (CORS is configured there to allow this frontend's origin).

```
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Project structure

```
src/
  App.jsx     — main component: fetch, seat selection, booking flow
  App.css     — theater layout, seat states, booking bar styling
```

This is intentionally a single-component app — the scope here is a
functional, presentable demo of the backend's capabilities, not a
production-scale frontend architecture.
