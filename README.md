# SIH 26002 — SACHET Fix

This version fixes the browser CORS problem by routing SACHET requests through a Node/Express backend.

## Requirements
- Node.js 18+ (Node 20+ recommended)

## Run

Open a terminal in this folder:

```bash
npm install
npm start
```

Then open:

http://localhost:3000

Do NOT double-click `index.html`. It must be served by the Node server.

## Test the proxy

Open:

http://localhost:3000/api/health

Then:

http://localhost:3000/api/sachet

If `/api/health` works but `/api/sachet` returns HTTP 502, the problem is upstream SACHET access/endpoint availability rather than browser CORS.

## Important production note

NDMA's current CAP integration guide says external consumers should use the CAP XML feed with ETag caching and correctly handle HTTP 200/304 responses. For a production SIH deployment, replace the prototype all-alert JSON proxy with the permitted CAP feed integration and ETag caching where applicable.
