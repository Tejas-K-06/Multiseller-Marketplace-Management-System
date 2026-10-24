# API Design — Multi-Seller Marketplace Management System

Base URL: `http://localhost:5000/api` · JSON only · field names are `camelCase` in the API (database columns are `snake_case`; models convert).

**Conventions**

- Success: `{ "success": true, "data": ... }` · Error: `{ "success": false, "message": "..." }`
- Protected endpoints need `Authorization: Bearer <token>`.
- Roles: **Public** (no login), **Any** (any logged-in user), **Buyer**, **Seller** (approved), **Admin**.
- Errors common to all protected endpoints: 401 (no/invalid token), 403 (wrong role). Validation problems return 400.

These shapes are the **contract** for the frontend mock data and the backend responses. Change them only after agreeing in the team chat and updating this file.

---

## 1. Authentication

| Method & endpoint | Purpose | Role |
|---|---|---|
| `POST /auth/register` | Create buyer or seller account | Public |
| `POST /auth/login` | Log in, get token | Public |
| `GET /auth/me` | Current user from token | Any |

**POST /auth/register** — body:
`{ "email", "password", "fullName", "phone?", "role": "BUYER" | "SELLER", "storeName?" (required for SELLER), "taxId?" }`
→ 201 `{ "userId": 4, "role": "BUYER" }`. 409 if email/store name exists.

**POST /auth/login** — body: `{ "email", "password" }`
→ 200 `{ "token": "<jwt>", "user": { "userId": 4, "fullName": "Rahul Patil", "email": "...", "role": "BUYER", "approvalStatus?": "APPROVED" } }`. 401 on wrong credentials, 403 if blocked.

**GET /auth/me** → 200 same `user` object as above.

## 2. Addresses

| Method & endpoint | Purpose | Role |
|---|---|---|
| `GET /addresses` | List my addresses | Buyer |
| `POST /addresses` | Add address | Buyer |
| `DELETE /addresses/:id` | Remove address (blocked if used by an order) | Buyer |

**POST /addresses** — body: `{ "line1", "city", "state", "postalCode", "isDefault?" }` → 201 `{ "addressId": 3 }`
**GET /addresses** → `[ { "addressId", "line1", "city", "state", "postalCode", "isDefault" } ]`

## 3. Categories and Products (public browsing)

| Method & endpoint | Purpose | Role |
|---|---|---|
| `GET /categories` | All categories (flat list with `parentId`) | Public |
| `POST /categories` | Create category | Admin |
| `GET /products` | Search / list products | Public |
| `GET /products/:id` | Product detail with variants, offers, rating | Public |
| `GET /products/:id/reviews` | Reviews of a product | Public |

**POST /categories** — body `{ "name", "parentId?" }` → 201 `{ "categoryId" }`
**GET /categories** → `[ { "categoryId": 3, "name": "Mobiles", "parentId": 1 } ]`

**GET /products** — query: `q?`, `categoryId?` (includes subcategories), `page?` (default 1), `limit?` (default 12)
→ `{ "items": [ { "productId", "title", "categoryName", "storeName", "fromPrice", "avgRating", "reviewCount" } ], "page", "total" }`

**GET /products/:id** →
```json
{ "productId": 1, "title": "Nova X Smartphone", "description": "...", "categoryName": "Mobiles",
  "storeName": "TechHub", "avgRating": 5.0, "reviewCount": 1,
  "variants": [ { "variantId": 1, "sku": "NOVA-128-BLK", "size": "128GB", "colour": "Black",
                  "offers": [ { "offerId": 1, "sellerId": 2, "price": 14999.00, "stockQuantity": 25, "codEligible": true } ] } ] }
```

**GET /products/:id/reviews** → `[ { "reviewId", "buyerName", "rating", "comment", "isVerifiedPurchase" } ]`

## 4. Seller (inventory and fulfilment)

All endpoints: role **Seller** (approved). They only touch the seller's own data.

| Method & endpoint | Purpose |
|---|---|
| `GET /seller/products` | My products with variants and offers |
| `POST /seller/products` | Create product |
| `PUT /seller/products/:id` | Edit title/description/category/status |
| `POST /seller/products/:id/variants` | Add variant |
| `POST /seller/variants/:variantId/offers` | Create offer (price, stock) |
| `PUT /seller/offers/:offerId` | Update price, stock, status |
| `GET /seller/sub-orders` | My sub-orders (optional `?status=`) |
| `PUT /seller/sub-orders/:id/status` | Move sub-order to next status |

- `POST /seller/products` body `{ "categoryId", "title", "description?" }` → 201 `{ "productId" }`
- `PUT /seller/products/:id` body any of `{ "categoryId", "title", "description", "status": "ACTIVE" | "INACTIVE" }` → `{ "updated": true }`
- `POST /seller/products/:id/variants` body `{ "sku", "size?", "colour?", "weightKg?" }` → 201 `{ "variantId" }` (409 if SKU exists)
- `POST /seller/variants/:variantId/offers` body `{ "price", "stockQuantity", "codEligible?" }` → 201 `{ "offerId" }`
- `PUT /seller/offers/:offerId` body any of `{ "price", "stockQuantity", "status", "codEligible" }` → `{ "updated": true }`
- `GET /seller/sub-orders` →
  `[ { "subOrderId": 1, "orderId": 1, "status": "PENDING", "buyerName", "city", "sellerPayable": 14999.00, "orderDate", "items": [ { "title", "sku", "quantity", "unitPrice" } ], "trackingNumber": null } ]`
- `PUT /seller/sub-orders/:id/status` body `{ "status": "CONFIRMED" | "SHIPPED" | "DELIVERED" }` → `{ "subOrderId", "status", "trackingNumber?" }`. 400 if the transition is not the next step.

## 5. Cart

All endpoints: role **Buyer**.

| Method & endpoint | Purpose |
|---|---|
| `GET /cart` | My cart with items and estimated total |
| `POST /cart/items` | Add offer (adds to quantity if already present) |
| `PUT /cart/items/:lineNo` | Set quantity |
| `DELETE /cart/items/:lineNo` | Remove item |

- `POST /cart/items` body `{ "offerId", "quantity" }` → 201 returns the updated cart
- `PUT /cart/items/:lineNo` body `{ "quantity" }` → updated cart (400 if above stock)
- `GET /cart` →
  `{ "cartId": 1, "items": [ { "lineNo": 1, "offerId": 3, "title", "size", "colour", "storeName", "price", "quantity", "stockQuantity", "lineTotal" } ], "estimatedTotal": 998.00 }`

## 6. Wishlist

All endpoints: role **Buyer**.

| Method & endpoint | Purpose |
|---|---|
| `GET /wishlists` | My wishlists with items |
| `POST /wishlists` | Create wishlist |
| `POST /wishlists/:id/items` | Add variant |
| `DELETE /wishlists/:id/items/:variantId` | Remove variant |

- `POST /wishlists` body `{ "name" }` → 201 `{ "wishlistId" }`
- `POST /wishlists/:id/items` body `{ "variantId" }` → 201 `{ "added": true }` (409 if already there)
- `GET /wishlists` → `[ { "wishlistId", "name", "items": [ { "variantId", "productId", "title", "size", "colour", "fromPrice", "addedAt" } ] } ]`

## 7. Coupons

| Method & endpoint | Purpose | Role |
|---|---|---|
| `GET /coupons/validate?code=WELCOME10` | Check a coupon before checkout | Buyer |
| `GET /coupons` | List all coupons | Admin |
| `POST /coupons` | Create coupon | Admin |

- Validate → `{ "code", "discountType": "PERCENT", "discountValue": 10, "validUntil": "2027-12-31" }` (404 if unknown, 400 if expired)
- `POST /coupons` body `{ "code", "discountType": "PERCENT" | "FLAT", "discountValue", "validUntil" }` → 201 `{ "couponId" }`

## 8. Orders and Payment

| Method & endpoint | Purpose | Role |
|---|---|---|
| `POST /orders/checkout` | Place order from cart | Buyer |
| `GET /orders` | My orders | Buyer |
| `GET /orders/:id` | Order detail (sub-orders, items, payment, shipments) | Buyer (owner) / Admin |
| `PUT /orders/:id/cancel` | Cancel order | Buyer (owner) |
| `POST /orders/:id/pay` | Simulate online payment | Buyer (owner) |

**POST /orders/checkout** — body: `{ "addressId", "couponCode?", "paymentMethod": "COD" | "UPI" | "CARD" | "NETBANKING" }`
→ 201 `{ "orderId": 3, "subtotal": 998.00, "discount": 99.80, "totalAmount": 898.20, "paymentId": 3, "paymentStatus": "PENDING" }`
Errors: 400 empty cart / invalid or expired coupon / COD not allowed; 409 insufficient stock (message names the product).

**GET /orders** → `[ { "orderId", "orderDate", "status", "totalAmount", "paymentStatus", "itemCount" } ]`

**GET /orders/:id** →
```json
{ "orderId": 1, "orderDate": "2026-10-01", "status": "DELIVERED",
  "address": { "line1": "...", "city": "...", "state": "...", "postalCode": "..." },
  "subtotal": 15997.00, "discount": 1599.70, "totalAmount": 14397.30,
  "payment": { "paymentId": 1, "method": "UPI", "status": "SUCCESS", "paidAt": "..." },
  "subOrders": [ { "subOrderId": 1, "storeName": "TechHub", "status": "DELIVERED", "trackingNumber": "TRK1001",
                   "items": [ { "itemNumber": 1, "productId": 1, "title": "Nova X Smartphone", "quantity": 1,
                                "unitPrice": 14999.00, "lineTotal": 14999.00, "reviewed": true } ] } ] }
```

**PUT /orders/:id/cancel** → `{ "orderId", "status": "CANCELLED" }` (400 if any sub-order is already confirmed/shipped)

**POST /orders/:id/pay** — body `{ "outcome?": "SUCCESS" | "FAIL" }` (default `SUCCESS`) → `{ "paymentId", "status": "SUCCESS" | "FAILED", "paidAt" }`. 400 for COD or already paid.

## 9. Reviews

| Method & endpoint | Purpose | Role |
|---|---|---|
| `POST /reviews` | Review a purchased product | Buyer |

Body `{ "orderId", "productId", "rating": 1-5, "comment?" }` → 201 `{ "reviewId" }`. 400 if the product is not in a delivered order of this buyer; 409 if already reviewed. (Reading reviews: `GET /products/:id/reviews`.)

## 10. Admin

All endpoints: role **Admin**.

| Method & endpoint | Purpose |
|---|---|
| `GET /admin/sellers?status=PENDING` | List sellers by approval status |
| `PUT /admin/sellers/:id/approval` | Approve or reject a seller |
| `GET /admin/orders` | All orders (summary) |
| `GET /admin/stats` | Dashboard numbers |

- `GET /admin/sellers` → `[ { "userId", "storeName", "email", "taxId", "approvalStatus" } ]`
- `PUT /admin/sellers/:id/approval` body `{ "status": "APPROVED" | "REJECTED" }` → `{ "userId", "approvalStatus" }`
- `GET /admin/orders` → `[ { "orderId", "buyerName", "orderDate", "status", "totalAmount" } ]`
- `GET /admin/stats` → `{ "users": 6, "sellers": 2, "products": 3, "orders": 2, "revenue": 14397.30, "topSellers": [ { "storeName", "revenue" } ] }`

---

**Not exposed as APIs (database only):** delivery agents, delivery assignments, refunds. Shipments are created automatically by `PUT /seller/sub-orders/:id/status` and shown inside order details.

**Endpoint count:** 3 + 3 + 5 + 8 + 4 + 4 + 3 + 5 + 1 + 4 = **40**.
