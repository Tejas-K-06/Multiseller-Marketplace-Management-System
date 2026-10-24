# Team Plan — Work Division, Commits, Git Rules and Roadmap

## 1. Team, Roles and Branches

| Student | Branch | Area | Folders owned |
|---|---|---|---|
| Tejas Kadam — **Frontend Lead** and **Project Lead** | `dev_tejas` | Frontend | `frontend/`, plus `docs/`, `README.md`, `.gitignore` (committed once on `main`) |
| Kanak Reshi — **Backend Lead** | `dev_kanak` | Backend API | `backend/package.json`, `server.js`, `.env.example`, `src/app.js`, `src/routes/`, `src/controllers/`, `src/middleware/`, `src/utils/` |
| Varad Kale — **Database Lead** | `dev_varad` | Database and data access | `database/`, `backend/src/config/`, `backend/src/models/` |

**Project lead = Tejas Kadam** (merges into `main`). Only the lead merges pull requests into `main`. The lead also reviews every PR (at least one teammate comment before merge) and runs the final integration test.

## 2. File Ownership and Shared Files

Rule: **you edit only files you own.** If you need a change in someone else's file, ask the owner (or open a GitHub issue).

Files that usually cause conflicts and how we avoid them:

| Shared file | Owner | How conflicts are avoided |
|---|---|---|
| `backend/package.json` | Kanak | Kanak installs **all** dependencies in his first commit (`express mysql2 cors dotenv bcryptjs jsonwebtoken`). Nobody else runs `npm install` in `backend/`. |
| `backend/src/app.js`, `src/routes/index.js` | Kanak | First commit registers every route file as an empty stub. Later commits only fill the stubs. |
| `backend/src/config/db.js` | Varad | Kanak imports `{ pool, withTransaction }` from it; the interface is fixed in LLD §3.1. |
| `backend/src/models/*.js` | Varad | Function names and signatures fixed in LLD §3.3. Kanak only *imports* them. |
| `frontend/package.json`, `src/App.jsx` | Tejas | Tejas's first commit creates every route (pages as placeholders), so later commits only edit page files. |
| `docs/*`, `README.md`, `.gitignore` | Tejas (lead) | Teammates propose doc changes through the lead. |
| `package-lock.json` (both folders) | Same owner as `package.json` | Never edited by others. |

**Working in parallel**

- Frontend uses mock data (`VITE_USE_MOCK=true`) until the backend is merged.
- Backend controllers are written against the model contract; until Varad's model commit is merged Kanak tests with temporary stubs kept **outside** git (or just waits for the merged models — the checkpoints below are arranged so this is short).
- Database scripts are standalone `.sql` files, so Varad never blocks anyone for long: the schema is merged first.

## 3. Planned Commits (21 total, 7 per student)

Each student's 7 commits all go on their own branch. Documentation (`docs/`) is committed by the lead on `main` before the branches start, and is **not** counted among the 21.

### Tejas Kadam — branch `dev_tejas` (frontend)

| # | Commit message | Description | Files / modules | Depends on | Done when |
|---|---|---|---|---|---|
| F1 | `chore: set up react app with vite and routing` | Vite + React project, `react-router-dom`, proxy to `/api`, route table with placeholder pages, `api/client.js`, mock-mode switch, base CSS | `frontend/package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/api/client.js`, `src/styles/global.css`, placeholder `src/pages/**` | `docs/API_DESIGN.md` agreed | `npm run dev` opens the app; every route shows its placeholder |
| F2 | `feat: add common layout and authentication pages` | Navbar (role-aware), Footer, `AuthContext`, `ProtectedRoute`, Login and Register forms (buyer/seller) | `components/Navbar.jsx`, `Footer.jsx`, `ProtectedRoute.jsx`, `FormField.jsx`, `Message.jsx`, `context/AuthContext.jsx`, `pages/auth/*`, `api/authApi.js`, `mock/users.js` | F1 | With mock mode: login redirects by role and protected routes block other roles |
| F3 | `feat: add product listing and product details pages` | Home, product list with search + category filter, product card, detail page with variants/offers/reviews | `pages/buyer/HomePage.jsx`, `ProductListPage.jsx`, `ProductDetailPage.jsx`, `components/ProductCard.jsx`, `StatusBadge.jsx`, `api/productApi.js`, `mock/products.js` | F1, F2 | Search, filter and detail work on mock data |
| F4 | `feat: add cart and wishlist pages` | Cart table with quantity change/remove/total; wishlist with create/add/remove; "add to cart/wishlist" buttons on detail page | `pages/buyer/CartPage.jsx`, `WishlistPage.jsx`, `components/QuantityInput.jsx`, `api/cartApi.js`, `api/wishlistApi.js`, `mock/cart.js` | F3 | Quantity change updates total; wishlist items can be removed |
| F5 | `feat: add checkout and order history pages` | Address page, checkout (address, coupon, payment method), pay-now step, order list and detail, cancel, review form | `pages/buyer/AddressPage.jsx`, `CheckoutPage.jsx`, `OrdersPage.jsx`, `OrderDetailPage.jsx`, `api/orderApi.js`, `api/addressApi.js`, `api/reviewApi.js`, `mock/orders.js` | F4 | Mock checkout shows order success; order detail lists sub-orders and review form |
| F6 | `feat: add seller and admin dashboard pages` | Seller dashboard, product form with variants/offers/stock, sub-order status buttons; admin pages for seller approval, categories, coupons, orders | `pages/seller/*`, `pages/admin/*`, `api/sellerApi.js`, `api/adminApi.js`, `mock/seller.js` | F2 | Seller can add product and change stock on mock data; admin can approve a mock seller |
| F7 | `fix: connect frontend to backend apis and fix ui issues` | Turn mock mode off by default, adapt to real responses, handle loading/error states, fix layout bugs | `src/api/*`, `src/pages/**`, `.env.example` (frontend) | Checkpoint 3 merged (B1–B6, D1–D6) | Full buyer flow (register → buy → review) and seller flow work against the real backend |

### Kanak Reshi — branch `dev_kanak` (backend)

| # | Commit message | Description | Files / modules | Depends on | Done when |
|---|---|---|---|---|---|
| B1 | `chore: set up express server with error handling` | Express app, CORS, JSON, all route stubs, `errorHandler`, `asyncHandler`, `httpError`, `response` helper, `.env.example`, health route | `backend/package.json`, `server.js`, `src/app.js`, `src/routes/*` (stubs), `src/middleware/errorHandler.js`, `src/utils/*`, `.env.example` | — | `GET /api/health` returns `{success:true}`; unknown route returns JSON 404 |
| B2 | `feat: implement authentication and address apis` | Register, login, me, JWT, `verifyToken`, `requireRole`, address CRUD, seller-approved check | `routes/authRoutes.js`, `addressRoutes.js`, `controllers/authController.js`, `addressController.js`, `middleware/auth.js` | B1; D4 (user/address models) | Register/login return token; wrong role gets 403 (checked with Postman/REST client) |
| B3 | `feat: implement product, category and seller inventory apis` | Category list/create, public product list/detail/reviews, seller product/variant/offer endpoints | `routes/categoryRoutes.js`, `productRoutes.js`, `sellerRoutes.js` (products part), matching controllers | B2; D4, D5 | Seller creates product → it appears in `GET /products` |
| B4 | `feat: implement cart and wishlist apis` | Cart CRUD with stock checks; wishlist CRUD | `routes/cartRoutes.js`, `wishlistRoutes.js`, matching controllers | B2; D5 | Add/update/remove cart item and wishlist item return the contract JSON |
| B5 | `feat: implement checkout and order apis` | Checkout, order list/detail, cancel, seller sub-order list and status update (creates shipment), coupon validation | `routes/orderRoutes.js`, `couponRoutes.js` (validate), `sellerRoutes.js` (sub-order part), `controllers/orderController.js`, `couponController.js`, `sellerController.js` (sub-order functions) | B3, B4; D5, D6 | Checkout creates one sub-order per seller; stock decreases; cart is empty |
| B6 | `feat: implement payment simulation, review and admin apis` | `POST /orders/:id/pay`, `POST /reviews`, admin sellers/orders/stats, coupon create/list | `routes/reviewRoutes.js`, `adminRoutes.js`, `controllers/reviewController.js`, `adminController.js`, `orderController.js` (pay) | B5; D6 | Pay changes payment status; review only allowed after delivery; admin can approve a seller |
| B7 | `fix: validate api inputs and resolve backend test issues` | `validate.js` middleware (required fields, types, ranges), consistent status codes/messages, REST-client test file covering every endpoint, bug fixes found by testing | `middleware/validate.js`, `controllers/*` (fixes), `backend/tests/api.http` | B6 | Every endpoint in `API_DESIGN.md` is exercised in `api.http` with a pass/fail note; bad input returns 400 |

### Varad Kale — branch `dev_varad` (database and data access)

| # | Commit message | Description | Files / modules | Depends on | Done when |
|---|---|---|---|---|---|
| D1 | `feat: create marketplace database tables` | Database, users/roles, address, category, product, variant, offer, cart, cart_item, wishlist, wishlist_item (InnoDB, PK/FK/UK, CHECKs) | `database/01_schema_catalog.sql` | `DATABASE_DESIGN.md` agreed | Script runs on an empty MySQL 8 with no errors; `SHOW TABLES` lists 13 tables |
| D2 | `feat: add order, payment and review tables with constraints` | coupon, orders, sub_orders, order_item, shipment, delivery_assignment, payment, refund, review, indexes, and the six derived-value views | `database/02_schema_orders.sql` | D1 | All 22 tables + 6 views exist; FK diagram matches the ER diagram |
| D3 | `feat: add seed data for testing` | Admin, 2 sellers, 2 buyers, 1 agent, categories, products, variants, offers, coupons, two sample orders with shipment, payment, review, refund | `database/03_seed.sql`, `database/README.md` (how to load, bcrypt step) | D2 | Loading seed after schema succeeds; sample queries Q1–Q10 return rows |
| D4 | `feat: add database connection and user, address, category and product models` | `mysql2` pool, `withTransaction`, user/address/category/product-search models (via contract) | `backend/src/config/db.js`, `models/userModel.js`, `addressModel.js`, `categoryModel.js`, `productModel.js` | D3; B1 merged (for `package.json`) | A small `node` script calls `productModel.search({})` and prints seed products |
| D5 | `feat: add seller inventory, cart and wishlist models` | Seller product/variant/offer/stock operations, seller sub-order list and status update (creates the shipment when `SHIPPED`), cart and wishlist operations | `models/sellerModel.js`, `cartModel.js`, `wishlistModel.js` | D4 | Script adds a cart item and updates stock; wrong-seller updates affect 0 rows; marking a seed sub-order `SHIPPED` creates a shipment |
| D6 | `feat: add order, payment, review and admin models with transactions` | `checkout` transaction (row locks, sub-orders, items, stock, payment, clear cart), cancel with stock restore, payment simulation, review rule, coupon model, admin queries (seller approval, all orders, stats) | `models/orderModel.js`, `paymentModel.js`, `reviewModel.js`, `couponModel.js`, `adminModel.js` | D5 | Checkout on seed data works; forcing an error leaves no partial rows (rollback proven); `adminModel.stats()` returns numbers |
| D7 | `feat: add reporting queries and database validation scripts` | Sample queries file (Q1–Q10 from `DATABASE_DESIGN.md`), validation script that proves constraints (negative stock, duplicate SKU, bad rating, FK violations are rejected), schema/model fixes found in integration | `database/queries/sample_queries.sql`, `database/tests/validation.sql`, fixes in `database/*`, `models/*` | D6; integration findings from B5–B6 | `validation.sql` shows every bad insert failing as expected; all sample queries run on the seeded database |

Check: F1–F7 = 7, B1–B7 = 7, D1–D7 = 7 → **21 commits**. Integration bugs found late are fixed inside the owner's last commit (F7, B7, D7) rather than adding commits.

## 4. Merge Strategy and Final Integration

**Rules**

- Each student works only on their branch (`dev_tejas`, `dev_kanak`, `dev_varad`). **Nobody pushes to `main`.**
- Work reaches `main` through GitHub pull requests; **only the lead (Tejas) merges**.
- Use **"Rebase and merge"** or **"Create a merge commit"**, **never "Squash and merge"** — squashing would collapse each student's 7 commits into one.
- Protect `main` on GitHub (Settings → Branches → require a pull request before merging).
- No `.env`, `node_modules/`, `dist/`, or credentials in git (`.gitignore` is set up by the lead; `.env.example` files are committed instead).

**Merge checkpoints** (a PR is opened when the listed commits are ready; all of a student's pending commits go in one PR)

| Checkpoint | Contents merged into `main` | Order inside the checkpoint |
|---|---|---|
| 0 | Docs, repo skeleton, `.gitignore`, `README.md` (lead, commit on `main`) | — |
| 1 | D1, D2, D3 · B1 · F1, F2 | B1 → D1–D3 → F1–F2 |
| 2 | D4, D5 · B2, B3, B4 · F3, F4 | D4–D5 → B2–B4 → F3–F4 |
| 3 | D6 · B5, B6 · F5, F6 | D6 → B5–B6 → F5–F6 |
| 4 (final) | D7 · B7 · F7 | D7 → B7 → F7 |

Because each person owns different folders, these merges should be conflict-free. After each checkpoint everybody runs the "sync" commands below.

**Final integration steps**

1. After checkpoint 3, the lead creates the database from `database/*.sql`, copies `.env.example` → `.env`, runs backend and frontend, and posts a bug list.
2. Owners fix bugs in their own areas inside F7 / B7 / D7.
3. After checkpoint 4, all three run the end-to-end demo script (below) on a clean database.
4. Lead tags the final version: `git tag v1.0 && git push origin v1.0`.

**End-to-end demo script:** register seller → admin approves → seller adds product, variant, offer → register buyer → add address → add to cart + wishlist → checkout with coupon `WELCOME10` → pay (simulated) → seller confirms, ships, delivers → buyer writes review → admin views stats.

## 5. Git Rules

**Commit message prefixes** (lowercase, imperative, no full stop):

| Prefix | Use |
|---|---|
| `feat:` | New functionality |
| `fix:` | Bug fix |
| `style:` | UI/format change without logic change |
| `refactor:` | Restructure code, same behaviour |
| `docs:` | Documentation |
| `chore:` | Setup and maintenance |

Examples: `feat: add product listing page`, `feat: implement product APIs`, `fix: correct cart quantity update`, `docs: document database relationships`.

**Before every work session**

1. Check you are on **your** branch: `git branch --show-current`
2. Bring in the latest approved `main` (commands below).
3. Never commit `.env`, passwords, tokens or `node_modules/`. Check with `git status` before committing.

**Essential commands** (replace `dev_kanak` with your branch)

```bash
# one-time: get the project and create your branch
git clone <repo-url> marketplace && cd marketplace
git switch -c dev_kanak                 # or: git switch dev_kanak if it already exists
git push -u origin dev_kanak

# before starting new work: verify branch and sync with latest main
git branch --show-current
git fetch origin
git merge origin/main                   # brings approved work into your branch

# make a commit (only your own files)
git status
git add backend/src/routes/authRoutes.js backend/src/controllers/authController.js
git commit -m "feat: implement authentication and address apis"

# publish your branch
git push origin dev_kanak

# create a pull request (GitHub website: "Compare & pull request", base = main)
# or with GitHub CLI:
gh pr create --base main --head dev_kanak --title "Checkpoint 2: backend auth, products, cart" --body "Commits B2-B4"
```

If `git merge origin/main` reports a conflict: stop, do not guess — run `git status`, tell the file owner, resolve together, then `git add <file>` and `git commit`.

**Pull request checklist:** app starts, no secrets committed, only own folders changed (`git diff --stat origin/main`), commit messages use the approved prefixes, description lists the commit numbers.

## 6. Implementation Roadmap

| Phase | Work | Who |
|---|---|---|
| 1. Finalize | Agree scope, ER-based schema, API contract (these docs). Confirm the two open points: `review` uniqueness and the `users.role` column | All |
| 2. Repo setup | Create GitHub repo, add team, protect `main`, commit docs + skeleton + `.gitignore` (checkpoint 0), everyone creates their branch | Lead |
| 3. Foundations | Database schema + seed (D1–D3); Express skeleton (B1); React skeleton, layout, auth pages (F1–F2) → checkpoint 1 | All, in parallel |
| 4. Core features | Models for users/catalog/cart (D4–D5); auth, product, cart APIs (B2–B4); listing, detail, cart, wishlist pages (F3–F4) → checkpoint 2 | All, in parallel |
| 5. Order workflow | Checkout transaction and order models (D6); checkout, order, payment, review, admin APIs (B5–B6); checkout, order history, seller, admin pages (F5–F6) → checkpoint 3 | All, in parallel |
| 6. Integration | Remove mock mode, fix bugs, validation, constraint tests (F7, B7, D7) → checkpoint 4 | All |
| 7. Testing and demo data | Run the end-to-end script on a clean database, take screenshots of every form | All |
| 8. Submission | **File 1:** GitHub link (or a folder named `612415076_612415074_612415080` with code + screenshots). **File 2:** report (below) | Lead uploads |

**Report (File 2) — where each section comes from**

| Report section | Source |
|---|---|
| 1 Problem statement, 2 Objectives | `HLD.md` §1 |
| 3 Functional requirements | `HLD.md` §2–3 (modules table) |
| 4 ER diagram | The supplied ER diagram PDF |
| 5 Relational schemas | `DATABASE_DESIGN.md` §3 |
| 6 Functional dependencies | `DATABASE_DESIGN.md` §5.1 |
| 7 Normalization to 3NF | `DATABASE_DESIGN.md` §5.2 |
