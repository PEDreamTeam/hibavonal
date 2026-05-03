# HibaVonal

A full-stack application with a Flask backend and a React frontend.

## Project Structure

- **hibavonal-be**: Backend server built with Flask
- **hibavonal-fe**: Frontend application built with Vite

## Getting Started

### Backend

See [hibavonal-be/README.md](hibavonal-be/README.md) for setup instructions.

### Frontend

See [hibavonal-fe/README.md](hibavonal-fe/README.md) for setup instructions.

## Requirements

- Python 3
- Node.js and npm

## Legutóbbi változások

- Backend: a `tool_orders` Flask blueprint-ben naplózás bevezetése az API kérésekhez.
- Backend: a `create_tool_order` végpont részletes kérésellenőrzéssel és a felhasználói adatokkal kiegészített `logger.info` naplózással készült.
- Backend: a `GET /tool-orders` és `GET /tool-orders/list` végpontok szerepalapú hozzáférés, státusz szerinti szűrés és rendezési opciók támogatását kapták.
- Backend: a `update_tool_order` végpont hibakezelése és validációja javult.
- Backend: `format_tool_order` segédfüggvény hozzáadva az API válaszok egységes formázásához.
- Backend: modell- és migrációs módosítások érintették a `created_by` és `created_at` mezőket.
- Frontend: új `useToolOrdersList` hook és `ToolOrdersList` oldal a tool order lista lekéréséhez és megjelenítéséhez.
- Frontend: a `fetcher`, `Layout.jsx` és `App.jsx` frissítve lett az új tool order funkciókhoz.

## License

Open source project
