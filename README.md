# DRIPEON — A New Era of Fashion

DRIPEON is a premium full-stack Worldwiden fashion e-commerce storefront showcasing fluid weft silhouettes, military side-buckle waist structures and bespoke zippered shackets. 

* **Brand Slogan**: DRIPEON — A new era of fashion
* **Contact Channel**: DRIPEON@gmail.com
* **Artisanal Ateliers**: New York, New York

---

## 🛠️ Tech Architecture & Design Topology

* **Frontend Engine**: React 19 + TypeScript + React Router DOM v6
* **Typography Palette**: Inter (Sans-serif) & Google Playfair Display (Serif)
* **Animation & Motion**: Tailwind CSS CSS3 micro-animations
* **Backend Gate**: Node.js + Express.js Full REST API Router
* **Database Persisting**: Simulated file-persistent JSON database with file-level transactional writes.
* **Security Shield**: Bcrypt password hashing, JWT Access Tokens, rate-limiting, and input text sanitizing.

---

## 🚀 Rapid Local Deployment

Before starting, install the standard repository dependencies:

```bash
npm install
```

### 1. Standard Development Server
Runs both the high-performance Express server and Vite bundler in parallel:

```bash
npm run dev
```
Open **`http://localhost:3000`** in browser viewports.

### 2. Standalone Production Bundles
Builds the core React layout files into static directories, bundles the background Express controllers using `esbuild`, and initiates standalone processes:

```bash
npm run build
npm start
```

### 3. Containerized Deploying (Docker Compose)
Spins up production containers instantly over port `3000`:

```bash
docker-compose up --build -d
```

---

## 🔐 Credentials Ledger & Administration

The local database persists credentials in standard JSON tables. The following administrative accounts are pre-seeded on first run:

### 👤 Customer Lookbook Profile
* **Email**: `customer@DRIPEON.com`
* **Password**: `customer`

### 🔑 Master Tailor / Administrator Panel
* **Email**: `DRIPEON@gmail.com`
* **Password**: `admin`
* **Control Center**: Access via `/admin/login`

Admins have full visibility over:
1. **Atelier Stats**: Total order conversions and gross revenue computations.
2. **Looms Stock levels**: Fast-adjusting variant counts (S / M / L / XL).
3. **Dispatch Carriage**: Staging, shipping, or canceling package delivery pathways.
4. **Returns Center**: Reviewing, signing, and annotating exchange requests.
5. **CMS controls**: Toggle announcement bar banners, configure shipping rates, and rewrite hero descriptions.
