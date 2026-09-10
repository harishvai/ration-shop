# 🌾 Smart Ration — Digital Ration Shop Management System

A complete, production-grade **Digital Ration Shop Management Application** connecting Beneficiaries, Fair Price Shop Salesmen, and the Civil Supplies Directorate under a single unified, secure, role-isolated architecture.

Built with **React, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Node.js, Express, and PostgreSQL** (supporting both native PostgreSQL and embedded PGlite for universal portability).

---

## 🚀 Key Features

### 👤 1. Public Portal (Ration Card Holder)
* **Secure Ration Card Authentication**: Database lookup for valid ration card numbers (e.g. `RC-TN-2024-1001`).
* **Quota & Entitlement Dashboard**: Shows customer name, card number, assigned shop (`SHOP-101`), family members count, and monthly allocated vs claimed items (Rice, Wheat, Sugar, Dal, Oil).
* **Entitlement-Bounded Cart**: Real-time quantity selectors `[-] [qty] [+]` that strictly prevent exceeding government quota allowances.
* **Safe Sandbox Payment**: Mock payment supporting UPI, Card, and Counter Cash. No real card numbers stored.
* **Instant Digital Token Generation**: Generates official state token format (e.g. `RS-2026-001245`) bound to assigned shop with `READY` status.
* **Live Token Tracking**: "My Token" page displays live status badges (🟡 `READY` or 🟢 `DELIVERED`). When the salesman delivers the order, status automatically updates to `DELIVERED`.

---

### 🏪 2. Salesman Portal (Ration Shop Employee)
* **Shop-Isolated Login**: Authenticates by Shop Number, Employee ID, and Password (e.g. `SHOP-101`, `EMP-101`, `salesman123`).
* **Shop Dashboard**: Shows ONLY the shop assigned to that salesman. Displays 5 main operational metric cards:
  - Today's Orders
  - Pending Tokens
  - Delivered Orders
  - Current Stock (Total kg)
  - Today's Sales (₹)
* **Token Management Table**: Search and filter today's tokens by token number or customer name.
* **Physical Handover & Delivery Flow**:
  - Accessible confirmation modal: *"Are you sure you want to mark this order as delivered?"*
  - Automatically marks token & order as `DELIVERED`.
  - Atomically deducts commodities from shop inventory.
  - Logs timestamp, employee ID, and stock dispatch transaction.
  - **Double-delivery prevention**: Blocks duplicate deliveries.
* **"My Shop Stock" & Ledger**:
  - Live stock ledger: `Current Stock = Opening Stock + Received Stock - Distributed Stock`.
  - Configurable safety thresholds with real-time **Low Stock Warnings**.
  - Restock module: Salesman can record warehouse replenishment shipments.
  - **Strict Shop Isolation**: Backend middleware prevents Salesman at `SHOP-101` from accessing `SHOP-102` inventory or orders.
* **Sales & Distribution Reports**: Daily, weekly, and monthly totals, order fulfillment rates, and commodity breakdown charts.

---

### 🏢 3. Head of Department Portal (Civil Supplies Directorate)
* **State Directorate Login**: Officer clearance with `HEAD-001` and password `head123`.
* **State-Wide Dashboard**: Aggregated overview covering ALL 5 ration shops:
  - Total Shops (5)
  - Total Customers (6)
  - Today's Orders & Today's Sales
  - Total Stock across all shops
  - Low Stock Shops (alerting when any shop falls below safety buffer)
  - Pending Orders & Delivered Orders
* **"All Ration Shops" Directory**: Complete grid of `SHOP-101` through `SHOP-105` with assigned salesmen, live stock, sales figures, and status badges.
* **"Search by Shop Number" (Drill-Down Audit)**:
  - Deep-drill into any shop (e.g. `SHOP-101`).
  - Audits Shop details, Salesman details, Current stock breakdown, Stock audit history, Sales timeline, Recent customer orders, and Distribution volume.
* **Multi-Shop Comparative Analytics**:
  - Shop-wise Sales Comparison (Bar Chart)
  - Commodity Stock Distribution across shops (Bar Chart)
  - Total Distributed Commodities Volume (Pie Chart)
  - Order Fulfillment Status (Donut Chart)
  - Sales & Demand Timeline (Line Chart) with filters: *Today*, *7 Days*, *This Month*, *Custom*.

---

## 🔑 Demo Login Credentials

For quick evaluation, use the interactive **"Demo Credentials"** button located on the welcome screen, or enter the credentials manually:

### 👤 Public Beneficiaries
| Customer Name | Ration Card Number | Assigned Shop | Category |
| :--- | :--- | :--- | :--- |
| **Rajesh Kumar** | `RC-TN-2024-1001` | `SHOP-101` | PHH (Priority) |
| **Priya Sharma** | `RC-TN-2024-1002` | `SHOP-101` | AAY (Antyodaya) |
| **Murugan S** | `RC-TN-2024-1003` | `SHOP-102` | PHH |
| **Anitha Devi** | `RC-TN-2024-1004` | `SHOP-103` | PHH |
| **Karthik V** | `RC-TN-2024-1005` | `SHOP-104` | NPHH |

---

### 🏪 Ration Shop Salesmen
| Shop Number | Employee ID | Password | Shop Name / Location |
| :--- | :--- | :--- | :--- |
| `SHOP-101` | `EMP-101` | `salesman123` | Anna Nagar Central (Chennai Central) |
| `SHOP-102` | `EMP-102` | `salesman123` | T. Nagar West (Chennai South) |
| `SHOP-103` | `EMP-103` | `salesman123` | Adyar South (Chennai South) |
| `SHOP-104` | `EMP-104` | `salesman123` | Mylapore North (*Low Stock Alert Demo*) |
| `SHOP-105` | `EMP-105` | `salesman123` | Velachery Hub (Chennai South) |

---

### 🏢 Head of Department
| Head ID | Password | Designation |
| :--- | :--- | :--- |
| `HEAD-001` | `head123` | Chief Director, Food & Civil Supplies |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite.
- **Backend**: Node.js, Express, TypeScript, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Morgan.
- **Database**: PostgreSQL with 14 fully relational tables (`users`, `ration_shops`, `customers`, `ration_cards`, `shop_employees`, `ration_items`, `ration_entitlements`, `shop_inventory`, `orders`, `order_items`, `payments`, `tokens`, `deliveries`, `stock_transactions`).
  - *Dual-Engine Support*: Connects to native PostgreSQL if `DATABASE_URL` is set, or automatically boots embedded `@electric-sql/pglite` (WASM Postgres 16 with file persistence) for instant, zero-configuration portability!
- **Security**: JWT Authentication, Role Guards (`PUBLIC`, `SALESMAN`, `HEAD`), and Shop-Level Isolation Guard (`requireShopAccess`).

---

## 📦 Installation & Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher, tested on Node v24)
- npm (v9+)

### 2. Install Dependencies
Run the following from the project root directory:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Initialize & Seed Database
The backend will automatically initialize tables and seed demo data on first start. You can also trigger it manually:
```bash
cd backend
npm run db:seed
```

### 4. Running the Application
Open two terminal windows:

**Terminal 1 — Start Backend Server (Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Start Frontend Client (Port 3000):**
```bash
cd frontend
npm run dev
```

Open your browser and navigate to: **`http://localhost:3000`**

---

## 🧪 Testing the 3 Complete Workflows

### Workflow 1: Public Citizen End-to-End Shopping & Token
1. Open `http://localhost:3000` and select **Continue as Public**.
2. Enter Ration Card: `RC-TN-2024-1001` and click **Continue**.
3. View your allocated quota (Rice 20kg, Wheat 5kg, Sugar 2kg, Dal 2kg).
4. Select commodities (e.g. 10 kg Rice, 1 kg Sugar) using `[-] [+]` controls.
5. Click **View Cart** / **Proceed to Payment**.
6. Select **UPI (Demo)** or **Card (Mock)** and click **Confirm & Generate Token**.
7. Observe token generated: `RS-2026-XXXXXX` for `SHOP-101` with status 🟡 **READY**.
8. Click **Track in "My Token"** to view live token card.

### Workflow 2: Salesman Verification, Delivery & Stock Deduction
1. Click **Log out** (or open a private window) and select **Continue as Salesman**.
2. Enter Shop Number `SHOP-101`, Employee ID `EMP-101`, Password `salesman123`.
3. Notice your dashboard displays **SHOP-101** metrics and pending tokens.
4. Click **Today's Tokens** -> Find the customer's token `RS-2026-XXXXXX`.
5. Click **Mark Delivered** -> Confirm dialog pops up: *"Are you sure you want to mark this order as delivered?"*.
6. Click **Confirm Delivery**.
7. Observe token status turns 🟢 **DELIVERED**.
8. Go to **My Shop Stock** -> Verify that Rice and Sugar quantities have been deducted and a `DISPATCH_DELIVERY` transaction is recorded.
9. Switch back to the Public portal -> Notice Public token status is now 🟢 **DELIVERED** with timestamp!

### Workflow 3: Head of Department Oversight & Analytics
1. Open Welcome screen and click **Continue as Head**.
2. Enter Head ID: `HEAD-001`, Password: `head123`.
3. View the **Head of Department Dashboard** with cross-shop metrics (5 shops, total stock, low stock alert).
4. Click **All Ration Shops** -> Audit `SHOP-101` to `SHOP-105`. Notice `SHOP-104` has a low-stock alert flag!
5. Click **Search Shop (Drill-Down)** -> Enter `SHOP-101` -> View complete shop breakdown (Salesman, current stock, sales ledger, order list).
6. Click **State Analytics** -> Review comparative bar charts, commodity distribution pie chart, and timeline filters (*Today*, *7 Days*, *This Month*).
