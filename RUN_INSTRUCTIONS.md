# How to Run the AML Compliance Dashboard

## Prerequisites

- **Node.js** (v18 or later) — [Download](https://nodejs.org/)
- **npm** (comes bundled with Node.js)

Verify installation:

```bash
node -v
npm -v
```

---

## Quick Start

```bash
# 1. Clone the repository (if not already done)
git clone <repo-url>
cd ComplianceMonitor

# 2. Navigate to the dashboard app
cd aml-dashboard

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## Available Scripts

| Command           | Description                                |
|-------------------|--------------------------------------------|
| `npm run dev`     | Start the Vite dev server (hot reload)     |
| `npm run build`   | Build for production into `dist/`          |
| `npm run preview` | Preview the production build locally       |
| `npm test`        | Run the Vitest test suite once             |
| `npm run test:watch` | Run tests in watch mode                 |

---

## Dependencies Installed via `npm install`

### Runtime

| Package                  | Purpose                                  |
|--------------------------|------------------------------------------|
| react, react-dom         | UI framework                             |
| chart.js, react-chartjs-2 | Charts (doughnut, line, bar)           |
| cytoscape                | Transaction network graph                |
| cytoscape-cose-bilkent   | Graph layout algorithm                   |
| date-fns                 | Date formatting and relative time        |

### Development

| Package                  | Purpose                                  |
|--------------------------|------------------------------------------|
| vite                     | Dev server and build tool                |
| @vitejs/plugin-react     | React Fast Refresh for Vite              |
| tailwindcss, @tailwindcss/vite | Utility-first CSS framework        |
| vitest                   | Unit test runner                         |
| jsdom                    | DOM environment for tests                |
| @testing-library/react   | React component testing utilities        |
| @testing-library/jest-dom | Custom DOM matchers for tests           |

> All dependencies are declared in `aml-dashboard/package.json`. Running `npm install` downloads everything — no manual installs needed.

---

## Project Structure

```
ComplianceMonitor/
├── data/                          # JSON data files (served by Vite middleware)
│   ├── accounts.json              # 50 accounts with AML flags
│   ├── aml-flags.json             # 34 AML flag records
│   ├── transaction-edges.json     # 40 transaction edges
│   └── transactions.json          # 40 transaction records
├── aml-dashboard/                 # React application
│   ├── src/
│   │   ├── services/              # Data loading & business logic
│   │   ├── hooks/                 # React hooks (useData, usePagination, useFilters)
│   │   ├── context/               # App-wide state (AppContext)
│   │   ├── components/
│   │   │   ├── layout/            # Header, Sidebar, TabNav
│   │   │   ├── graph/             # Cytoscape transaction graph
│   │   │   ├── transactions/      # Transaction table, filters, detail drawer
│   │   │   ├── aml/               # AML flag cards, charts, typology legend
│   │   │   ├── compliance/        # Priority queue, actions, threshold alerts
│   │   │   └── common/            # Spinner, error banner, empty state, toast
│   │   └── utils/                 # Constants, CSV export
│   ├── package.json
│   ├── vite.config.js
│   └── vitest.config.js
└── README.md
```

---

## Troubleshooting

| Problem                          | Solution                                           |
|----------------------------------|-----------------------------------------------------|
| `npm install` fails              | Ensure Node.js v18+ is installed                    |
| Port 5173 already in use         | Kill the process or run `npx vite --port 3000`      |
| Data files return 404            | Run `npm run dev` from the `aml-dashboard/` folder  |
| Blank page / JS errors           | Clear browser cache and restart `npm run dev`        |
