# SAF SHIKAN Mission Profitability - BI Application

A production-grade Business Intelligence (BI) and financial margin analytics platform engineered for **SAF SHIKAN**. This application sits directly above the SAF SHIKAN operational and operator SaaS portals to transform agricultural drone mission data into deterministic profitability margins, itemized cost leakages, and executive AI insights.

---

## 🌟 Key Capabilities & 8 Production Routes

1. **`/` (Executive Overview)**
   - High-level KPI summary cards (Gross Revenue, Total Costs, Net Margin %, Active Fleet Utilization).
   - Interactive Recharts comparing gross contract revenue vs total operational expenditure across recent missions.
   - Crop sector comparison (Cotton vs Wheat vs Rice vs Sugarcane) and top leakage identification.

2. **`/missions` (Mission Profitability Directory)**
   - Multi-dimensional filtering by **Province** (`Punjab`, `Sindh`), **Crop Type**, and **Profitability Band** (`excellent`, `good`, `average`, `poor`, `critical`).
   - Live search input and dynamically recalculated KPI cards reflecting active filter subsets.

3. **`/missions/:id` (Mission Detail Audit & AI Briefing)**
   - Complete ledger itemizing the 6 cost vectors: `travel` (transit), `battery_wear` (depreciation), `chemical_loading` (mixes), `operator_labor` (fees), `maintenance_reserve` (buffers), and `retry_fuel` (drift waste).
   - Deterministic penalty breakdown explaining score deductions and actionable leadership recommendations.
   - **AI Executive Briefing Box**: Live synthesis generator connecting to OpenAI/Anthropic (or deterministic executive fallback) to deliver crisp 2–3 sentence summaries.

4. **`/fleet` (Fleet Utilization & Maintenance Matrix)**
   - Agras T40 Pro, Agras T20P Plus, and SS-Falcon Heavy duty cycles, status tracking (`active`, `maintenance`, `grounded`), hourly depreciation, and comprehensive repair log ledger.

5. **`/operators` (Pakistani Operator Efficiency Ranking)**
   - Performance evaluation across regional field crews (`Tariq Mehmood`, `Hamza Tariq`, etc.), tracking total volume vs spraying retry rates and experience tiers.

6. **`/leakage` (Margin Leakage & Friction Deep-Dive)**
   - Recharts visual breakdowns isolating remote sector travel friction (`Sukkur`, `Hyderabad` >28% travel ratio) and Falcon-X nozzle retry waste, plus an executive remediation roadmap.

7. **`/rules` (BI Scoring Rules Sandbox)**
   - Interactive slider simulation dashboard allowing leadership to adjust parameter weights (`Net Margin`, `Travel Penalty`, `Retry Friction`, `Delay Overhead`) and immediately project portfolio score shifts.

8. **`/reports` (Executive Report Generation Hub)**
   - Board-ready export simulator allowing multi-criteria selection by template, province, and crop, rendering formatted tabular previews and simulated PDF/CSV export packages.

---

## 🛠️ Technology Stack & Architecture

- **Frontend Framework**: React 18 + TypeScript + Vite
- **Styling & UI**: Tailwind CSS v4 (`@tailwindcss/postcss`) with custom B2B dark slate design tokens
- **Data Visualizations**: Recharts
- **Database & Auth**: Supabase PostgreSQL (`@supabase/supabase-js`)
- **AI Synthesis Layer**: Multi-provider client (`OpenAI gpt-4o-mini`, `Anthropic claude-3-haiku`, plus deterministic executive fallback)

---

## 🚀 Zero-Config Deployment (Vercel & Supabase)

### 1. Vercel Zero-Config Deployment
This repository is engineered to deploy out-of-the-box on **Vercel** with zero environment variables needed:
- If environment variables (`VITE_SUPABASE_URL`) are omitted, the application transparently runs in **Seeded Intelligence Mode**, utilizing high-fidelity deterministic client datasets (`mockData.ts` & `src/lib/ai.ts`) for instant demo execution.

### 2. Live Supabase PostgreSQL Integration
When ready to connect to live Supabase Postgres:
1. Execute the SQL schema migration located in `supabase/migrations/20260718000000_initial_schema.sql` inside your Supabase SQL Editor.
2. Run the seed dataset script located in `supabase/seed.sql` to populate historical mission ledgers.
3. Add your environment variables to Vercel (or `.env.local` for local development):
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_OPENAI_API_KEY=your_openai_key_optional
   VITE_ANTHROPIC_API_KEY=your_anthropic_key_optional
   ```

---

## 💻 Local Development & Verification

To run the application locally:
```bash
npm install
npm run dev
```

To run the production bundle verification:
```bash
npm run build
```
