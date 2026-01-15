## Product Inventory Management App – Intern Assignment

A React application that fetches product data, stores it locally, exposes mock API functions, and renders a filterable, editable products table.

### 🎯 Assignment Mapping

- **Fetch dummy data from API**: Uses `https://dummyjson.com/products?limit=100` in `api.js`.
- **Store data locally & use mock APIs**: Data is stored in a local array (`productData`) and exposed via Promise-based functions with `setTimeout` for latency.
- **Show data in a table**: Table displays **Title (editable)**, **brand**, **category**, **price**, **rating**, plus row actions.
- **Editable Title field**: Clicking the product name turns it into an input; blur / Enter saves through `updateProductAPI`.
- **Deletable rows**: Each row has a remove button wired to `deleteProductAPI`.
- **Filters for each column**:
  - Brand dropdown
  - Category dropdown
  - Price range dropdown (predefined ranges)
  - Rating dropdown (dynamic “X+ Stars” options)
- **Dynamic filter values**: Each dropdown’s options are computed from the **currently available products with other filters applied**.
- **Bonus items implemented**:
  - Reset/clear filters button
  - Loading state and basic error handling
  - “No results match your filters” message when nothing is found

---

## 🛠 Tech Stack

- **Frontend**: React (Vite)
- **Language**: JavaScript (ES Modules)
- **Styling**: Custom CSS (`App.css`, `index.css`)
- **Build Tool**: Vite
- **Data Source**: `dummyjson.com` products API
- **State & Logic**: React Hooks (`useState`, `useEffect`, `useMemo`)

---

## 📁 Project Structure

```text
product-intern-app/
├── src/
│   ├── App.jsx       # Main app: API wiring, filters, table, editable rows
│   ├── App.css       # Branded UI styles
│   ├── api.js        # DummyJSON fetch + local mock API (Promise + setTimeout)
│   ├── index.css     # Global/base styles and font setup
│   ├── main.jsx      # React entry point
│   └── assets/       # Static assets (if any)
├── index.html        # Root HTML
├── vite.config.js    # Vite configuration
├── package.json      # Scripts and dependencies
└── README.md         # This file
```

---

## 🚀 Local Setup & Running

### 1. Clone repository

```bash
git clone <your-repo-url>
cd product-intern-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

By default, Vite will show the exact localhost URL in the terminal (for example `http://localhost:5174`). Open that in your browser.

### 4. Build & preview production bundle

```bash
npm run build
npm run preview
```

This serves the built app locally so you can verify the production build.

---

## 🌐 Deployment

You can deploy this app to any static hosting that supports Vite builds, for example **Vercel** or **Netlify**.

### Example: Deploy to Vercel

```bash
# From the project root
npm install -g vercel
vercel
```

Follow the CLI prompts and select the `product-intern-app` folder. Vercel will build the app using `npm run build` and give you a public URL.

### Deployed URL (to fill in)

- **Live App**: `https://your-deployed-app-url.com`  
  (Replace this line with your actual deployed URL before submitting.)

> No environment variables are required for this project; the public DummyJSON API is called directly from the browser.

---

## 📊 Application Behaviour

### Data Flow

1. `App.jsx` calls `fetchAndStoreData()` once on mount.
2. `api.js` fetches products from DummyJSON and stores them in a local `productData` array.
3. `getProducts()` returns a Promise that resolves to a copy of `productData` after a short delay.
4. The UI reads from React state (backed by `productData`) and never calls DummyJSON again after the first load.

### Filters

- All filters operate on the same in-memory dataset.
- Each filter dropdown:
  - Computes its options from the **current dataset with other filters already applied**.
  - Brand options depend on category, price, and rating filters.
  - Category options depend on brand, price, and rating filters.
  - Price ranges depend on brand, category, and rating filters.
  - Rating options are generated from available rating values under brand, category, and price filters.
- The table always shows the final intersection of all active filters.

### Editing & Deleting

- **Editing title**:
  - Click the product name to toggle an inline text input.
  - On blur or Enter, the title is updated in React state and via `updateProductAPI`.
- **Deleting row**:
  - Click “Remove” to optimistically delete.
  - If `deleteProductAPI` fails, the previous list is restored.

### Loading, Errors, and Empty States

- On first load, a centered spinner and message are shown.
- If the initial fetch fails, an error banner is shown instead of the table.
- When filters match no products, a “No products match your filters” row is shown in the table.

---

## 🧠 Development Approach & Notes

**Architecture**
- Kept everything in a single top-level `App` component to keep the assignment easy to read.
- Split responsibilities:
  - `api.js` for data fetching and mock API simulation.
  - `App.jsx` for UI state, filter computations, and table rendering.

**State & Performance**
- Used `useState` for:
  - Raw product list
  - Filter state
  - Form input values
  - Loading/error flags
- Used `useEffect` once (on mount) for the initial API call.
- Used `useMemo` to:
  - Derive filtered products.
  - Build the four filter dropdown option lists from the current state.

**Dynamic Filters**
- The main challenge was making each dropdown depend on **other** filters without causing confusion:
  - For example, brand options should respect category, price, and rating filters, but ignore the current brand filter itself.
  - This was solved by reusing the same filtering rules while selectively skipping the filter being configured.
- Rating options are built from the integer part of existing ratings, then converted to “X+ Stars” thresholds.

**Edge Cases & Error Handling**
- Network errors on the initial fetch surface as a friendly error message instead of a blank screen.
- Deletion is optimistic but restores previous state if the mock API fails.
- Form submission validates required fields before calling `addProductAPI`.
- Price and rating filters correctly handle the “infinite” upper bound by encoding it as a string (`inf`) in the `<select>` value.

You can include this README and the deployed URL in your GitHub repo to satisfy the assignment deliverables.
