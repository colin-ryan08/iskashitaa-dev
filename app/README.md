# Iskashitaa Harvest Lead App

Field data-capture app for Harvest Leads, built from the design doc one level up in this project
(`Iskashitaa Harvest App - Design Doc v2.docx`).

## Status

Early scaffold. Today's Stops and Field Entry work end-to-end against local offline storage
(IndexedDB via Dexie). Day Setup, Review Queue, Export, Archive, and Admin are placeholders.

## Seeing it run

This project isn't run locally as part of the normal workflow. Once it's connected to Vercel,
every push to GitHub produces a live preview link that opens in any browser — no installation
needed.

## For developers

Standard Vite + React + TypeScript + Tailwind project.

```
npm install
npm run dev
```

The data model lives in `src/db/schema.ts`, matching Section 4 of the design doc. Local storage
is Dexie (IndexedDB) for now; a Supabase-backed sync layer will connect to this without changing
the schema, per the design doc's External ID / Last Synced At fields.
