# Low-Level Design (LLD) — Multi-Seller Marketplace Management System

## 1. Repository and Folder Structure

One repository, three top-level code folders. **Each folder (or sub-folder) has exactly one owner** so branches rarely touch the same file.

```
marketplace/
├── README.md                      (lead)
├── .gitignore                     (lead)
├── docs/                          (lead)  HLD, LLD, DATABASE_DESIGN, API_DESIGN, TEAM_PLAN
├── database/                      (Varad)
│   ├── 01_schema_catalog.sql
│   ├── 02_schema_orders.sql       (also contains the views)
│   ├── 03_seed.sql
│   ├── queries/sample_queries.sql
│   └── tests/validation.sql
├── backend/
│   ├── package.json  .env.example           (Kanak)
│   ├── server.js                            (Kanak)  starts the app on PORT
│   └── src/
│       ├── app.js                           (Kanak)  express(), cors, json, routes, errorHandler
│       ├── config/db.js                     (Varad)  mysql2 pool + withTransaction helper
│       ├── routes/                          (Kanak)  index.js + one file per module
│       ├── controllers/                     (Kanak)  one file per module
│       ├── middleware/                      (Kanak)  auth.js, errorHandler.js, validate.js
│       ├── models/                          (Varad)  data-access functions (SQL lives here)
│       └── utils/                           (Kanak)  response.js, asyncHandler.js, httpError.js
└── frontend/                                (Tejas)
    ├── package.json  vite.config.js  index.html
    └── src/
        ├── main.jsx  App.jsx                routes live only in App.jsx
        ├── api/        client.js + one file per module (authApi.js, productApi.js, …)
        ├── mock/       mock data used until backend is ready
        ├── context/    AuthContext.jsx
        ├── components/ Navbar, Footer, ProtectedRoute, ProductCard, QuantityInput, StatusBadge, FormField, Message
        ├── pages/
        │   ├── auth/    LoginPage, RegisterPage
        │   ├── buyer/   HomePage, ProductListPage, ProductDetailPage, CartPage, WishlistPage,
        │   │            CheckoutPage, OrdersPage, OrderDetailPage, AddressPage
        │   ├── seller/  SellerDashboard, SellerProductsPage, ProductFormPage, SellerOrdersPage
        │   └── admin/   AdminSellersPage, AdminCategoriesPage, AdminCouponsPage, AdminOrdersPage
        └── styles/     global.css
```

## 2. Frontend Design

### 2.1 Pages and access

| Route | Page | Role |
|---|---|---|
| `/` , `/products` | Home / Product list (search + category filter) | Public |
| `/products/:id` | Product detail (variants, offers, reviews, add to cart / wishlist) | Public |
| `/login`, `/register` | Auth pages | Public |
| `/cart`, `/wishlist`, `/checkout` | Cart, wishlists, checkout | Buyer |
| `/orders`, `/orders/:id` | Order history, detail, pay, cancel, review form | Buyer |
| `/addresses` | Manage addresses | Buyer |
| `/seller` | Dashboard (counts, low stock) | Seller |
| `/seller/products`, `/seller/products/new`, `/seller/products/:id/edit` | Product, variants, offers, stock | Seller |
| `/seller/orders` | Own sub-orders + status buttons | Seller |
| `/admin/sellers`, `/admin/categories`, `/admin/coupons`, `/admin/orders` | Admin screens | Admin |

### 2.2 Reusable components

`Navbar` (links change by role), `ProtectedRoute({role})`, `ProductCard`, `QuantityInput`, `StatusBadge`, `FormField`, `Message` (success/error banner).

### 2.3 State and API communication

- State: `useState` / `useEffect` inside pages; only **one** context, `AuthContext` (`user`, `token`, `login()`, `logout()`).
- `src/api/client.js` wraps `fetch`: adds `Authorization: Bearer <token>`, sets JSON headers, parses `{success, data, message}`, throws an `Error(message)` when `success` is false.
- Vite dev proxy: `/api` → `http://localhost:5000` (no CORS problems in development).
- **Mock mode:** each API file checks `import.meta.env.VITE_USE_MOCK === 'true'` and returns data from `src/mock/*.js` with the same shape as the real API (shapes are fixed in `API_DESIGN.md`). Tejas's last commit switches the default to real APIs.
- Token stored in `localStorage`; `AuthContext` reads it on start and calls `GET /api/auth/me`.

## 3. Backend Design

### 3.1 Layers (one direction only)

```
route  →  middleware (auth, role, validate)  →  controller  →  model (SQL)  →  MySQL
```

- **Routes:** map URL + method to a controller function and attach middleware.
- **Controllers:** read `req.body/params/query`, validate, apply business rules, call models, send response. No SQL here.
- **Models:** run parameterized SQL (`pool.execute(sql, [params])`) and return plain objects. No `req/res` here.
- **Transactions:** models that need them take a connection via `withTransaction(async (conn) => {...})` from `config/db.js` (begins, commits, rolls back on error).

### 3.2 Routes and controllers

| Route file (base path) | Controller | Main responsibility |
|---|---|---|
| `authRoutes` (`/api/auth`) | `authController` | register, login, me |
| `addressRoutes` (`/api/addresses`) | `addressController` | buyer addresses |
| `categoryRoutes` (`/api/categories`) | `categoryController` | list tree, admin create |
| `productRoutes` (`/api/products`) | `productController` | public listing, detail, reviews list |
| `sellerRoutes` (`/api/seller`) | `sellerController` | products, variants, offers/stock, sub-orders |
| `cartRoutes` (`/api/cart`) | `cartController` | cart CRUD |
| `wishlistRoutes` (`/api/wishlists`) | `wishlistController` | wishlist CRUD |
| `orderRoutes` (`/api/orders`) | `orderController` | checkout, list, detail, cancel, pay |
| `reviewRoutes` (`/api/reviews`) | `reviewController` | create review |
| `couponRoutes` (`/api/coupons`) | `couponController` | validate (buyer), manage (admin) |
| `adminRoutes` (`/api/admin`) | `adminController` | seller approval, all orders, stats |

`routes/index.js` registers **all** route files from the first backend commit (empty stubs), so nobody else edits it later.

### 3.3 Data-access contract (Varad's models, used by Kanak's controllers)

These names are fixed now so both can work in parallel. Every function is `async` and returns plain rows/objects (or `insertId`).

| Model file | Functions |
|---|---|
| `userModel.js` | `createUserWithRole(conn, {email, fullName, phone, passwordHash, role, storeName?, taxId?})`, `findByEmail(email)`, `findById(id)` |
| `addressModel.js` | `listByUser(userId)`, `create(userId, data)`, `remove(addressId, userId)`, `findForUser(addressId, userId)` |
| `categoryModel.js` | `listAll()`, `create({name, parentId})` |
| `productModel.js` | `search({q, categoryId, limit, offset})` (includes subcategories), `getDetail(productId)` (product + variants + active offers + rating), `listReviews(productId)` |
| `sellerModel.js` | `getApproval(sellerId)`, `listProducts(sellerId)`, `createProduct(sellerId, data)`, `updateProduct(productId, sellerId, data)`, `addVariant(productId, sellerId, data)`, `upsertOffer(variantId, sellerId, data)`, `updateOffer(offerId, sellerId, {price, stock, status})`, `listSubOrders(sellerId)`, `getSubOrder(subOrderId, sellerId)`, `updateSubOrderStatus(subOrderId, sellerId, status)` (creates the shipment when `SHIPPED`; refreshes parent order status) |
| `cartModel.js` | `getCart(buyerId)` (items + `estimated_total`), `addItem(buyerId, offerId, qty)`, `setQuantity(buyerId, lineNo, qty)`, `removeItem(buyerId, lineNo)` |
| `wishlistModel.js` | `listByBuyer(buyerId)`, `create(buyerId, name)`, `addItem(wishlistId, buyerId, variantId)`, `removeItem(wishlistId, buyerId, variantId)` |
| `couponModel.js` | `findValidByCode(code)`, `create(data)`, `listAll()` |
| `orderModel.js` | `checkout({buyerId, addressId, couponCode, paymentMethod})` (full transaction), `listByBuyer(buyerId)`, `getDetail(orderId)`, `cancel(orderId, buyerId)` |
| `paymentModel.js` | `simulatePay(orderId, buyerId, outcome)` |
| `reviewModel.js` | `create({orderId, buyerId, productId, rating, comment})` (checks delivered purchase) |
| `adminModel.js` | `listSellers(status)`, `setSellerApproval(sellerId, status)`, `listOrders()`, `stats()` |

## 4. Authentication and Role-Based Access

- Passwords hashed with `bcryptjs` (10 rounds); plain passwords are never stored or logged.
- Login returns a JWT (`{userId, role}`, expiry 1 day) signed with `JWT_SECRET` from `.env`.
- `middleware/auth.js` exports:
  - `verifyToken` — reads `Authorization: Bearer <token>`, sets `req.user = {userId, role}`; responds 401 if missing/invalid.
  - `requireRole('BUYER' | 'SELLER' | 'ADMIN', ...)` — responds 403 if `req.user.role` is not allowed.
- Frontend `ProtectedRoute` hides pages by role, but **the backend is the real check**.
- The first admin is created by the seed script only; registration accepts only `BUYER` and `SELLER`.
- A `BLOCKED` user cannot log in. A `PENDING`/`REJECTED` seller can log in but all `/api/seller/*` write endpoints return 403 until approved.
- `.env.example` (committed) lists `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`. The real `.env` is git-ignored.

## 5. Standard Response and Errors

```json
{ "success": true,  "data": { } }
{ "success": false, "message": "Insufficient stock for 'Nova X Smartphone'" }
```

Status codes: 200 OK, 201 created, 400 validation error, 401 not logged in, 403 wrong role, 404 not found, 409 conflict (duplicate email / stock), 500 server error. `httpError(status, message)` is thrown in controllers/models; `errorHandler` converts it to the JSON above. `asyncHandler` wraps controllers so errors reach `errorHandler`.

## 6. Business Rules and Validations

**Users**
1. Email must be unique and valid; password at least 6 characters; phone 10 digits (optional).
2. Seller registration needs `storeName` (unique); seller starts `PENDING`.
3. Only one default address per buyer (setting a new default clears the old one).

**Catalog and inventory**
4. A seller may create products, variants and offers only for **own** products.
5. `price > 0`, `stock_quantity >= 0`, SKU unique, `rating` 1–5 (also enforced by `CHECK`).
6. Public listing shows only `ACTIVE` products with at least one `ACTIVE` offer.
7. Categories can be nested; a category with products or children cannot be deleted (FK RESTRICT).

**Cart and wishlist**
8. Only `ACTIVE` offers with stock can be added; quantity ≥ 1 and ≤ current stock.
9. Adding an offer already in the cart increases its quantity (no duplicate line).
10. A wishlist item is a **variant**; the same variant cannot be added twice to one wishlist.

**Checkout (single transaction)**
11. Cart must not be empty; address must belong to the buyer.
12. Lock offer rows (`FOR UPDATE`); if any item has `quantity > stock_quantity`, rollback with 409.
13. Coupon (optional) must exist and `valid_until >= today`; percent or flat discount applies to the whole order subtotal; total never below 0.
14. COD is allowed only if **every** offer in the order has `cod_eligible = TRUE`.
15. Create `orders`, then **one `sub_orders` row per seller** found in the cart, then `order_item` rows with `unit_price_snapshot = offer.price` and `item_number` = 1, 2, 3…
16. Decrease `stock_quantity`; insert `payment` (`amount` = discounted total; `PENDING`); delete the cart items.

**Payment simulation**
17. COD: payment stays `PENDING` and is set `SUCCESS` when the last sub-order is `DELIVERED`.
18. Online methods: buyer presses "Pay now"; backend marks `SUCCESS` (sets `paid_at`) or `FAILED` if the request says `outcome: "FAIL"`. A failed payment can be retried while the order is `PLACED`.

**Order status**
19. Sub-order transitions only forward: `PENDING → CONFIRMED → SHIPPED → DELIVERED`. A seller can change only their own sub-orders.
20. When a sub-order becomes `SHIPPED`, create a `shipment` with a generated tracking number (`TRK` + timestamp).
21. When every sub-order is `DELIVERED`, set `orders.status = 'DELIVERED'`.
22. Buyer can cancel only while **all** sub-orders are `PENDING`; cancelling restores stock and sets sub-orders and order to `CANCELLED` (online payment marked `REFUNDED`).

**Reviews**
23. A buyer can review a product only if it is in one of their `DELIVERED` orders; one review per (order, product).

**Admin**
24. Admin approves/rejects sellers, creates categories and coupons (unique code, future `valid_until`).
