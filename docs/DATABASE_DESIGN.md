# Database Design — Multi-Seller Marketplace Management System

Database: `marketplace_db` · MySQL 8.0+ · all tables InnoDB.

## 0. Changes from the ER diagram (read first)

| # | Change | Reason |
|---|---|---|
| 1 | Table names `users` and `orders` (diagram: USER, ORDER) | `USER` and `ORDER` are reserved words in MySQL, so only these two tables are renamed. |
| 2 | Added column `users.role` (BUYER / SELLER / DELIVERY_AGENT / ADMIN) | Login needs one place to read the role. The diagram has no ADMIN entity; admins exist only as `users` rows with role `ADMIN`. |
| 3 | Derived attributes **not stored**: `estimated_total`, `total_amount`, `seller_payable`, `line_total`, `seller_rating`, `is_verified_purchase` | Derived values are computed with views (section 6). Storing them would create redundancy. `buyer_rating` and `agent_rating` have no source data in the diagram (nothing rates buyers or agents), so they are not implemented. |
| 4 | Cart → Order "converts_to 1:0..1" has no foreign key | The diagram's ORDER has no `cart_id`. The conversion is a process: cart items are copied to order items and the cart is emptied. |
| 5 | `review`: unique on **(order_id, product_id)** | Diagram says ORDER verifies REVIEW as 1:0..1, but one order can hold several products. We read it as "at most one review per product per order". Confirm with your instructor if a strict one-review-per-order is required (then use `UNIQUE (order_id)`). |
| 6 | `cart.buyer_id` is `UNIQUE` (BUYER owns CART 1:1) | Preserves 1:1. After checkout the cart is emptied and reused. |
| 7 | Offers are created only by the seller who owns the product | Keeps the business rule simple (PRODUCT.seller_id = OFFER.seller_id). The schema itself allows several sellers to offer one variant. |

## 1. Entities and Attributes

PK = primary key, FK = foreign key, UK = unique key. Italic = derived (not stored).

| Entity (table) | Attributes |
|---|---|
| USER (`users`) | **user_id** PK, email UK, full_name, phone, password_hash, role, status, created_at |
| ADDRESS | **address_id** PK, user_id FK, line1, city, state, postal_code, is_default |
| BUYER | **user_id** PK/FK, loyalty_points, *buyer_rating* |
| SELLER | **user_id** PK/FK, store_name UK, tax_id, approval_status, *seller_rating* |
| DELIVERY_AGENT | **user_id** PK/FK, vehicle_type, availability_status, *agent_rating* |
| CATEGORY | **category_id** PK, parent_category_id FK (self), name |
| PRODUCT | **product_id** PK, category_id FK, seller_id FK, title, description, status |
| PRODUCT_VARIANT | **variant_id** PK, product_id FK, sku UK, size, colour, weight_kg |
| OFFER | **offer_id** PK, variant_id FK, seller_id FK, price, stock_quantity, cod_eligible, status |
| CART | **cart_id** PK, buyer_id FK (UK), status, *estimated_total* |
| CART_ITEM (weak) | **cart_id** PK/FK, **line_no** PK (partial key), offer_id FK, quantity |
| WISHLIST | **wishlist_id** PK, buyer_id FK, name |
| WISHLIST_ITEM (weak) | **wishlist_id** PK/FK, **variant_id** PK/FK, added_at |
| COUPON | **coupon_id** PK, code UK, discount_type, discount_value, valid_until |
| ORDER (`orders`) | **order_id** PK, buyer_id FK, address_id FK, coupon_id FK (nullable), order_date, status, *total_amount* |
| SUB_ORDER | **sub_order_id** PK, order_id FK, seller_id FK, status, *seller_payable* |
| ORDER_ITEM (weak) | **order_id** PK/FK, **item_number** PK (partial key), sub_order_id FK, offer_id FK, quantity, unit_price_snapshot, *line_total* |
| SHIPMENT | **shipment_id** PK, sub_order_id FK, tracking_number UK, carrier, status, shipped_at |
| DELIVERY_ASSIGNMENT | **assignment_id** PK, shipment_id FK, agent_id FK, assigned_at, delivery_status |
| PAYMENT | **payment_id** PK, order_id FK, amount, method, status, paid_at |
| REFUND | **refund_id** PK, payment_id FK, amount, reason, status |
| REVIEW | **review_id** PK, order_id FK, buyer_id FK, product_id FK, rating, comment, *is_verified_purchase* |

## 2. Relationships and Cardinalities

| Relationship | Between | Cardinality | Implemented as |
|---|---|---|---|
| has | USER – ADDRESS | 1 : N | `address.user_id` |
| is_a | USER – BUYER / SELLER / DELIVERY_AGENT | 1 : 1 (each) | subtype PK = FK to `users` |
| owns | BUYER – CART | 1 : 1 | `cart.buyer_id` UNIQUE |
| places | BUYER – ORDER | 1 : N | `orders.buyer_id` |
| ships_to | ADDRESS – ORDER | 1 : N | `orders.address_id` |
| applied_to | COUPON – ORDER | 1 : 0..N | `orders.coupon_id` NULL allowed |
| curates | BUYER – WISHLIST | 1 : N | `wishlist.buyer_id` |
| lists | WISHLIST – WISHLIST_ITEM | 1 : N | composite PK |
| wished_as | PRODUCT_VARIANT – WISHLIST_ITEM | 1 : N | `wishlist_item.variant_id` |
| lists | SELLER – PRODUCT | 1 : N | `product.seller_id` |
| classifies | CATEGORY – PRODUCT | 1 : N | `product.category_id` |
| parent_of | CATEGORY – CATEGORY | 1 : N (recursive) | `category.parent_category_id` |
| sold_as | PRODUCT – PRODUCT_VARIANT | 1 : N | `product_variant.product_id` |
| offered_as | PRODUCT_VARIANT – OFFER | 1 : N | `offer.variant_id` |
| sells | SELLER – OFFER | 1 : N | `offer.seller_id` |
| contains | CART – CART_ITEM | 1 : N | composite PK |
| added_as | OFFER – CART_ITEM | 1 : N | `cart_item.offer_id` |
| converts_to | CART – ORDER | 1 : 0..1 | process, no FK (change 4) |
| split_into | ORDER – SUB_ORDER | 1 : N | `sub_order.order_id` |
| fulfils | SELLER – SUB_ORDER | 1 : N | `sub_order.seller_id` |
| contains | ORDER – ORDER_ITEM | 1 : N | composite PK |
| groups | SUB_ORDER – ORDER_ITEM | 1 : N | `order_item.sub_order_id` |
| purchased_as | OFFER – ORDER_ITEM | 1 : N | `order_item.offer_id` |
| dispatched_as | SUB_ORDER – SHIPMENT | 1 : N | `shipment.sub_order_id` |
| aggregated | SHIPMENT – DELIVERY_ASSIGNMENT | 1 : N | `delivery_assignment.shipment_id` |
| executes | DELIVERY_AGENT – DELIVERY_ASSIGNMENT | 1 : N | `delivery_assignment.agent_id` |
| paid_by | ORDER – PAYMENT | 1 : N | `payment.order_id` |
| refunded_by | PAYMENT – REFUND | 1 : 0..N | `refund.payment_id` |
| writes | BUYER – REVIEW | 1 : N | `review.buyer_id` |
| reviewed_in | PRODUCT – REVIEW | 1 : N | `review.product_id` |
| verifies | ORDER – REVIEW | 1 : 0..1 per product | `review.order_id` + unique (change 5) |

## 3. Relational Schemas

Primary keys are in **bold**, foreign keys in *italics*.

```
users(**user_id**, email, full_name, phone, password_hash, role, status, created_at)
address(**address_id**, *user_id*, line1, city, state, postal_code, is_default)
buyer(**user_id**, loyalty_points)                       -- user_id FK -> users
seller(**user_id**, store_name, tax_id, approval_status) -- user_id FK -> users
delivery_agent(**user_id**, vehicle_type, availability_status)
category(**category_id**, *parent_category_id*, name)
product(**product_id**, *category_id*, *seller_id*, title, description, status)
product_variant(**variant_id**, *product_id*, sku, size, colour, weight_kg)
offer(**offer_id**, *variant_id*, *seller_id*, price, stock_quantity, cod_eligible, status)
cart(**cart_id**, *buyer_id*, status)
cart_item(**cart_id**, **line_no**, *offer_id*, quantity)
wishlist(**wishlist_id**, *buyer_id*, name)
wishlist_item(**wishlist_id**, **variant_id**, added_at)
coupon(**coupon_id**, code, discount_type, discount_value, valid_until)
orders(**order_id**, *buyer_id*, *address_id*, *coupon_id*, order_date, status)
sub_orders(**sub_order_id**, *order_id*, *seller_id*, status)
order_item(**order_id**, **item_number**, *sub_order_id*, *offer_id*, quantity, unit_price_snapshot)
shipment(**shipment_id**, *sub_order_id*, tracking_number, carrier, status, shipped_at)
delivery_assignment(**assignment_id**, *shipment_id*, *agent_id*, assigned_at, delivery_status)
payment(**payment_id**, *order_id*, amount, method, status, paid_at)
refund(**refund_id**, *payment_id*, amount, reason, status)
review(**review_id**, *order_id*, *buyer_id*, *product_id*, rating, comment)
```

## 4. MySQL `CREATE TABLE` Statements

Run in this order (it respects foreign-key dependencies). The repository splits them into `database/01_schema_catalog.sql` (users → wishlist_item) and `database/02_schema_orders.sql` (coupon → views).

```sql
CREATE DATABASE IF NOT EXISTS marketplace_db CHARACTER SET utf8mb4;
USE marketplace_db;

-- ========== USERS AND ROLES ==========
CREATE TABLE users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(100) NOT NULL UNIQUE,
  full_name     VARCHAR(100) NOT NULL,
  phone         VARCHAR(15),
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('BUYER','SELLER','DELIVERY_AGENT','ADMIN') NOT NULL,
  status        ENUM('ACTIVE','BLOCKED') NOT NULL DEFAULT 'ACTIVE',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE address (
  address_id  INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  line1       VARCHAR(150) NOT NULL,
  city        VARCHAR(60)  NOT NULL,
  state       VARCHAR(60)  NOT NULL,
  postal_code VARCHAR(10)  NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE buyer (
  user_id        INT PRIMARY KEY,
  loyalty_points INT NOT NULL DEFAULT 0,
  CHECK (loyalty_points >= 0),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE seller (
  user_id         INT PRIMARY KEY,
  store_name      VARCHAR(100) NOT NULL UNIQUE,
  tax_id          VARCHAR(20),
  approval_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE delivery_agent (
  user_id             INT PRIMARY KEY,
  vehicle_type        VARCHAR(30),
  availability_status ENUM('AVAILABLE','BUSY','OFFLINE') NOT NULL DEFAULT 'AVAILABLE',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ========== CATALOG ==========
CREATE TABLE category (
  category_id        INT AUTO_INCREMENT PRIMARY KEY,
  parent_category_id INT NULL,
  name               VARCHAR(80) NOT NULL,
  UNIQUE (parent_category_id, name),
  FOREIGN KEY (parent_category_id) REFERENCES category(category_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE product (
  product_id  INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  seller_id   INT NOT NULL,
  title       VARCHAR(150) NOT NULL,
  description TEXT,
  status      ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  FOREIGN KEY (category_id) REFERENCES category(category_id),
  FOREIGN KEY (seller_id)   REFERENCES seller(user_id),
  INDEX idx_product_category (category_id),
  INDEX idx_product_seller (seller_id)
) ENGINE=InnoDB;

CREATE TABLE product_variant (
  variant_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  sku        VARCHAR(40) NOT NULL UNIQUE,
  size       VARCHAR(20),
  colour     VARCHAR(30),
  weight_kg  DECIMAL(6,3),
  CHECK (weight_kg IS NULL OR weight_kg >= 0),
  FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE offer (
  offer_id       INT AUTO_INCREMENT PRIMARY KEY,
  variant_id     INT NOT NULL,
  seller_id      INT NOT NULL,
  price          DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  cod_eligible   BOOLEAN NOT NULL DEFAULT TRUE,
  status         ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  CHECK (price > 0),
  CHECK (stock_quantity >= 0),
  UNIQUE (variant_id, seller_id),
  FOREIGN KEY (variant_id) REFERENCES product_variant(variant_id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id)  REFERENCES seller(user_id)
) ENGINE=InnoDB;

-- ========== CART AND WISHLIST ==========
CREATE TABLE cart (
  cart_id  INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL UNIQUE,                       -- 1:1 with buyer
  status   ENUM('ACTIVE','CHECKED_OUT') NOT NULL DEFAULT 'ACTIVE',
  FOREIGN KEY (buyer_id) REFERENCES buyer(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- line_no is computed by the backend: COALESCE(MAX(line_no),0)+1 for that cart
-- (AUTO_INCREMENT cannot be the 2nd column of a composite key in InnoDB)
CREATE TABLE cart_item (
  cart_id  INT NOT NULL,
  line_no  INT NOT NULL,
  offer_id INT NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY (cart_id, line_no),
  CHECK (quantity > 0),
  UNIQUE (cart_id, offer_id),
  FOREIGN KEY (cart_id)  REFERENCES cart(cart_id) ON DELETE CASCADE,
  FOREIGN KEY (offer_id) REFERENCES offer(offer_id)
) ENGINE=InnoDB;

CREATE TABLE wishlist (
  wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id    INT NOT NULL,
  name        VARCHAR(80) NOT NULL,
  FOREIGN KEY (buyer_id) REFERENCES buyer(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE wishlist_item (
  wishlist_id INT NOT NULL,
  variant_id  INT NOT NULL,
  added_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (wishlist_id, variant_id),
  FOREIGN KEY (wishlist_id) REFERENCES wishlist(wishlist_id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id)  REFERENCES product_variant(variant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ========== ORDERS ==========
CREATE TABLE coupon (
  coupon_id      INT AUTO_INCREMENT PRIMARY KEY,
  code           VARCHAR(30) NOT NULL UNIQUE,
  discount_type  ENUM('PERCENT','FLAT') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  valid_until    DATE NOT NULL,
  CHECK (discount_value > 0)
) ENGINE=InnoDB;

CREATE TABLE orders (
  order_id   INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id   INT NOT NULL,
  address_id INT NOT NULL,
  coupon_id  INT NULL,
  order_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  status     ENUM('PLACED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PLACED',
  FOREIGN KEY (buyer_id)   REFERENCES buyer(user_id),
  FOREIGN KEY (address_id) REFERENCES address(address_id),
  FOREIGN KEY (coupon_id)  REFERENCES coupon(coupon_id),
  INDEX idx_orders_buyer (buyer_id)
) ENGINE=InnoDB;

CREATE TABLE sub_orders (
  sub_order_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  seller_id    INT NOT NULL,
  status       ENUM('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED')
               NOT NULL DEFAULT 'PENDING',
  UNIQUE (order_id, seller_id),
  FOREIGN KEY (order_id)  REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES seller(user_id),
  INDEX idx_sub_orders_seller (seller_id)
) ENGINE=InnoDB;

-- item_number is computed by the backend (1,2,3... within the order)
CREATE TABLE order_item (
  order_id            INT NOT NULL,
  item_number         INT NOT NULL,
  sub_order_id        INT NOT NULL,
  offer_id            INT NOT NULL,
  quantity            INT NOT NULL,
  unit_price_snapshot DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (order_id, item_number),
  CHECK (quantity > 0),
  CHECK (unit_price_snapshot >= 0),
  FOREIGN KEY (order_id)     REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (sub_order_id) REFERENCES sub_orders(sub_order_id) ON DELETE CASCADE,
  FOREIGN KEY (offer_id)     REFERENCES offer(offer_id)
) ENGINE=InnoDB;

CREATE TABLE shipment (
  shipment_id     INT AUTO_INCREMENT PRIMARY KEY,
  sub_order_id    INT NOT NULL,
  tracking_number VARCHAR(30) NOT NULL UNIQUE,
  carrier         VARCHAR(50),
  status          ENUM('CREATED','IN_TRANSIT','DELIVERED') NOT NULL DEFAULT 'CREATED',
  shipped_at      TIMESTAMP NULL,
  FOREIGN KEY (sub_order_id) REFERENCES sub_orders(sub_order_id)
) ENGINE=InnoDB;

CREATE TABLE delivery_assignment (
  assignment_id   INT AUTO_INCREMENT PRIMARY KEY,
  shipment_id     INT NOT NULL,
  agent_id        INT NOT NULL,
  assigned_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivery_status ENUM('ASSIGNED','PICKED_UP','DELIVERED','FAILED') NOT NULL DEFAULT 'ASSIGNED',
  FOREIGN KEY (shipment_id) REFERENCES shipment(shipment_id),
  FOREIGN KEY (agent_id)    REFERENCES delivery_agent(user_id)
) ENGINE=InnoDB;

CREATE TABLE payment (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT NOT NULL,
  amount     DECIMAL(10,2) NOT NULL,
  method     ENUM('COD','UPI','CARD','NETBANKING') NOT NULL,
  status     ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  paid_at    TIMESTAMP NULL,
  CHECK (amount >= 0),
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
) ENGINE=InnoDB;

CREATE TABLE refund (
  refund_id  INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  amount     DECIMAL(10,2) NOT NULL,
  reason     VARCHAR(255),
  status     ENUM('REQUESTED','APPROVED','REJECTED','PROCESSED') NOT NULL DEFAULT 'REQUESTED',
  CHECK (amount > 0),
  FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
) ENGINE=InnoDB;

CREATE TABLE review (
  review_id  INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT NOT NULL,
  buyer_id   INT NOT NULL,
  product_id INT NOT NULL,
  rating     TINYINT NOT NULL,
  comment    TEXT,
  CHECK (rating BETWEEN 1 AND 5),
  UNIQUE (order_id, product_id),
  FOREIGN KEY (order_id)   REFERENCES orders(order_id),
  FOREIGN KEY (buyer_id)   REFERENCES buyer(user_id),
  FOREIGN KEY (product_id) REFERENCES product(product_id),
  INDEX idx_review_product (product_id)
) ENGINE=InnoDB;
```

Status values: `orders.status` is `PLACED` until all sub-orders are delivered (then `DELIVERED`) or the buyer cancels (`CANCELLED`). Per-seller progress lives in `sub_orders.status`.

### Transactions (where the backend must use them)

| Operation | Why |
|---|---|
| Register user | `users` + role table (+ `cart`) must all succeed or none |
| Checkout | order, sub-orders, items, stock decrement, payment, cart clearing — all or nothing |
| Cancel order | restore stock + update statuses together |
| Mark sub-order SHIPPED | status update + shipment insert together |

Checkout pattern: `START TRANSACTION` → `SELECT ... FROM offer WHERE offer_id IN (...) FOR UPDATE` (locks rows so two buyers cannot oversell) → check stock → inserts/updates → `COMMIT` (or `ROLLBACK` on any error).

## 5. Functional Dependencies and Normalization (up to 3NF)

### 5.1 Functional dependencies per table

| Table | Functional dependencies |
|---|---|
| users | user_id → email, full_name, phone, password_hash, role, status, created_at; email → user_id |
| address | address_id → user_id, line1, city, state, postal_code, is_default |
| buyer | user_id → loyalty_points |
| seller | user_id → store_name, tax_id, approval_status; store_name → user_id |
| delivery_agent | user_id → vehicle_type, availability_status |
| category | category_id → parent_category_id, name |
| product | product_id → category_id, seller_id, title, description, status |
| product_variant | variant_id → product_id, sku, size, colour, weight_kg; sku → variant_id |
| offer | offer_id → variant_id, seller_id, price, stock_quantity, cod_eligible, status; (variant_id, seller_id) → offer_id |
| cart | cart_id → buyer_id, status; buyer_id → cart_id |
| cart_item | (cart_id, line_no) → offer_id, quantity; (cart_id, offer_id) → line_no |
| wishlist | wishlist_id → buyer_id, name |
| wishlist_item | (wishlist_id, variant_id) → added_at |
| coupon | coupon_id → code, discount_type, discount_value, valid_until; code → coupon_id |
| orders | order_id → buyer_id, address_id, coupon_id, order_date, status |
| sub_orders | sub_order_id → order_id, seller_id, status; (order_id, seller_id) → sub_order_id |
| order_item | (order_id, item_number) → sub_order_id, offer_id, quantity, unit_price_snapshot; sub_order_id → order_id |
| shipment | shipment_id → sub_order_id, tracking_number, carrier, status, shipped_at; tracking_number → shipment_id |
| delivery_assignment | assignment_id → shipment_id, agent_id, assigned_at, delivery_status |
| payment | payment_id → order_id, amount, method, status, paid_at |
| refund | refund_id → payment_id, amount, reason, status |
| review | review_id → order_id, buyer_id, product_id, rating, comment; (order_id, product_id) → review_id |

### 5.2 Normalization argument

**1NF:** every column holds one atomic value; there are no repeating groups (repeating data such as cart lines, order lines, variants and wishlist entries are in their own tables).

**2NF:** the tables with composite keys are `cart_item`, `wishlist_item`, `order_item`. In each, every non-key attribute depends on the *whole* key: `quantity`/`offer_id` need both `cart_id` and `line_no`; `added_at` needs both wishlist and variant; `quantity`, `unit_price_snapshot` need both `order_id` and `item_number`. All other tables have single-column keys, so partial dependency is impossible.

**3NF:** for every FD `X → A`, either X is a superkey or A is a prime attribute.

- In each table above, every determinant (`user_id`, `email`, `sku`, `code`, …) is a candidate key, so 3NF holds.
- `order_item`: `sub_order_id → order_id` has a non-superkey determinant, but `order_id` is part of the primary key (a prime attribute), so the table is in **3NF** (it is not in BCNF; this is acceptable and is kept so that an item can be located by order directly).
- **Why derived attributes are not stored:** `total_amount`, `seller_payable`, `line_total`, `estimated_total` are functions of other columns (e.g. `line_total = quantity × unit_price_snapshot`). Storing them would add transitive dependencies and update anomalies, so they are computed by views.
- **Why `unit_price_snapshot` is stored:** it is not derived from `offer.price` — the price may change later, and the order must keep the price actually paid. It depends only on the order item's key.
- `address(postal_code → city, state)`: in the real world a postal code implies a city, but our system lets the user type city and state freely, so this FD is **not assumed to hold** and `address` stays in 3NF. If your instructor requires it, split out `postal_area(postal_code PK, city, state)`.

Result: all 22 relations are in 3NF.

## 6. Views for Derived Attributes

```sql
-- cart.estimated_total
CREATE VIEW v_cart_total AS
SELECT c.cart_id, COALESCE(SUM(ci.quantity * o.price), 0) AS estimated_total
FROM cart c
LEFT JOIN cart_item ci ON ci.cart_id = c.cart_id
LEFT JOIN offer o      ON o.offer_id = ci.offer_id
GROUP BY c.cart_id;

-- order_item.line_total
CREATE VIEW v_order_item_total AS
SELECT order_id, item_number, quantity * unit_price_snapshot AS line_total
FROM order_item;

-- orders.total_amount (subtotal - coupon discount, never below 0)
CREATE VIEW v_order_totals AS
SELECT t.order_id, t.subtotal, t.discount,
       GREATEST(t.subtotal - t.discount, 0) AS total_amount
FROM (
  SELECT o.order_id,
         s.subtotal,
         CASE WHEN c.coupon_id IS NULL THEN 0
              WHEN c.discount_type = 'PERCENT' THEN ROUND(s.subtotal * c.discount_value / 100, 2)
              ELSE c.discount_value END AS discount
  FROM orders o
  JOIN (SELECT order_id, SUM(quantity * unit_price_snapshot) AS subtotal
        FROM order_item GROUP BY order_id) s ON s.order_id = o.order_id
  LEFT JOIN coupon c ON c.coupon_id = o.coupon_id
) t;

-- sub_order.seller_payable (no commission in this project)
CREATE VIEW v_seller_payable AS
SELECT sub_order_id, SUM(quantity * unit_price_snapshot) AS seller_payable
FROM order_item
GROUP BY sub_order_id;

-- seller.seller_rating (average rating of reviews on the seller's products)
CREATE VIEW v_seller_rating AS
SELECT p.seller_id, ROUND(AVG(r.rating), 2) AS seller_rating, COUNT(*) AS review_count
FROM review r
JOIN product p ON p.product_id = r.product_id
GROUP BY p.seller_id;

-- review.is_verified_purchase
CREATE VIEW v_review_verified AS
SELECT r.*,
       EXISTS (
         SELECT 1
         FROM orders o
         JOIN order_item oi      ON oi.order_id = o.order_id
         JOIN offer f            ON f.offer_id = oi.offer_id
         JOIN product_variant v  ON v.variant_id = f.variant_id
         WHERE o.order_id = r.order_id AND o.buyer_id = r.buyer_id
           AND v.product_id = r.product_id AND o.status = 'DELIVERED'
       ) AS is_verified_purchase
FROM review r;
```

## 7. Sample SQL Queries

```sql
-- Q1. JOIN: active products with seller, category and cheapest price
SELECT p.product_id, p.title, c.name AS category, s.store_name, MIN(o.price) AS from_price
FROM product p
JOIN category c        ON c.category_id = p.category_id
JOIN seller s          ON s.user_id = p.seller_id
JOIN product_variant v ON v.product_id = p.product_id
JOIN offer o           ON o.variant_id = v.variant_id AND o.status = 'ACTIVE'
WHERE p.status = 'ACTIVE'
GROUP BY p.product_id, p.title, c.name, s.store_name;

-- Q2. FILTER: offers in stock under Rs. 2000, cheapest first
SELECT p.title, v.size, v.colour, o.price, o.stock_quantity
FROM offer o
JOIN product_variant v ON v.variant_id = o.variant_id
JOIN product p         ON p.product_id = v.product_id
WHERE o.stock_quantity > 0 AND o.price < 2000
ORDER BY o.price;

-- Q3. RECURSIVE: all categories under "Electronics" (MySQL 8 CTE)
WITH RECURSIVE tree AS (
  SELECT category_id, name FROM category WHERE name = 'Electronics'
  UNION ALL
  SELECT c.category_id, c.name FROM category c JOIN tree t ON c.parent_category_id = t.category_id
)
SELECT * FROM tree;

-- Q4. GROUP BY: revenue per seller from delivered sub-orders
SELECT s.store_name, COUNT(DISTINCT so.sub_order_id) AS sub_orders, SUM(sp.seller_payable) AS revenue
FROM sub_orders so
JOIN v_seller_payable sp ON sp.sub_order_id = so.sub_order_id
JOIN seller s            ON s.user_id = so.seller_id
WHERE so.status = 'DELIVERED'
GROUP BY s.store_name
ORDER BY revenue DESC;

-- Q5. AGGREGATION + HAVING: products with average rating >= 4 and at least 1 review
SELECT p.title, ROUND(AVG(r.rating), 2) AS avg_rating, COUNT(*) AS reviews
FROM review r JOIN product p ON p.product_id = r.product_id
GROUP BY p.product_id, p.title
HAVING AVG(r.rating) >= 4;

-- Q6. Order history of one buyer with computed totals
SELECT o.order_id, o.order_date, o.status, t.subtotal, t.discount, t.total_amount
FROM orders o JOIN v_order_totals t ON t.order_id = o.order_id
WHERE o.buyer_id = 4
ORDER BY o.order_date DESC;

-- Q7. Order lines of one order with seller and sub-order status
SELECT oi.item_number, p.title, s.store_name, oi.quantity, oi.unit_price_snapshot,
       oi.quantity * oi.unit_price_snapshot AS line_total, so.status AS sub_order_status
FROM order_item oi
JOIN sub_orders so     ON so.sub_order_id = oi.sub_order_id
JOIN seller s          ON s.user_id = so.seller_id
JOIN offer f           ON f.offer_id = oi.offer_id
JOIN product_variant v ON v.variant_id = f.variant_id
JOIN product p         ON p.product_id = v.product_id
WHERE oi.order_id = 1;

-- Q8. Low-stock alert for a seller
SELECT p.title, v.sku, o.stock_quantity
FROM offer o
JOIN product_variant v ON v.variant_id = o.variant_id
JOIN product p         ON p.product_id = v.product_id
WHERE o.seller_id = 2 AND o.stock_quantity < 10;

-- Q9. Buyers who spent the most (uses nested aggregation)
SELECT u.full_name, SUM(t.total_amount) AS total_spent
FROM orders o
JOIN v_order_totals t ON t.order_id = o.order_id
JOIN users u          ON u.user_id = o.buyer_id
WHERE o.status <> 'CANCELLED'
GROUP BY u.user_id, u.full_name
ORDER BY total_spent DESC;

-- Q10. Delivery agent workload and refunds (tables with no UI)
SELECT u.full_name AS agent, COUNT(*) AS deliveries
FROM delivery_assignment da JOIN users u ON u.user_id = da.agent_id
WHERE da.delivery_status = 'DELIVERED'
GROUP BY u.user_id, u.full_name;

SELECT r.refund_id, r.amount, r.reason, r.status, p.order_id
FROM refund r JOIN payment p ON p.payment_id = r.payment_id;
```

## 8. Seed Data (`database/03_seed.sql`)

Password hashes below are placeholders. After loading, generate a real bcrypt hash once and update all seed users (all seed accounts then log in with `Password@123`):

```bash
node -e "console.log(require('bcryptjs').hashSync('Password@123', 10))"
# then: UPDATE users SET password_hash = '<paste hash>';
```

```sql
USE marketplace_db;
SET @pw = '$2b$10$REPLACE_WITH_BCRYPT_HASH';

INSERT INTO users (user_id, email, full_name, phone, password_hash, role) VALUES
 (1,'admin@mkt.com',   'Admin User',   '9000000001', @pw, 'ADMIN'),
 (2,'techhub@mkt.com', 'TechHub Owner','9000000002', @pw, 'SELLER'),
 (3,'fashionly@mkt.com','Fashionly Owner','9000000003', @pw, 'SELLER'),
 (4,'rahul@mkt.com',   'Rahul Patil',  '9000000004', @pw, 'BUYER'),
 (5,'sneha@mkt.com',   'Sneha Joshi',  '9000000005', @pw, 'BUYER'),
 (6,'ravi@mkt.com',    'Ravi Kumar',   '9000000006', @pw, 'DELIVERY_AGENT');

INSERT INTO address (address_id, user_id, line1, city, state, postal_code, is_default) VALUES
 (1,4,'12 MG Road','Pune','Maharashtra','411001',TRUE),
 (2,5,'45 FC Road','Pune','Maharashtra','411004',TRUE);

INSERT INTO buyer (user_id, loyalty_points) VALUES (4,50),(5,0);
INSERT INTO seller (user_id, store_name, tax_id, approval_status) VALUES
 (2,'TechHub','27AAAAA0000A1Z5','APPROVED'),
 (3,'Fashionly','27BBBBB0000B1Z5','APPROVED');
INSERT INTO delivery_agent (user_id, vehicle_type, availability_status) VALUES (6,'Bike','AVAILABLE');

INSERT INTO category (category_id, parent_category_id, name) VALUES
 (1,NULL,'Electronics'),(2,NULL,'Fashion'),(3,1,'Mobiles'),(4,2,'T-Shirts');

INSERT INTO product (product_id, category_id, seller_id, title, description) VALUES
 (1,3,2,'Nova X Smartphone','6.5 inch display, 5000 mAh battery'),
 (2,4,3,'Cotton Round Neck T-Shirt','100% cotton, regular fit'),
 (3,1,2,'Wireless Earbuds','Bluetooth 5.3, 20 hour battery');

INSERT INTO product_variant (variant_id, product_id, sku, size, colour, weight_kg) VALUES
 (1,1,'NOVA-128-BLK','128GB','Black',0.180),
 (2,1,'NOVA-256-BLU','256GB','Blue',0.190),
 (3,2,'TSH-M-RED','M','Red',0.200),
 (4,2,'TSH-L-BLK','L','Black',0.210),
 (5,3,'EAR-STD-WHT','Standard','White',0.050);

INSERT INTO offer (offer_id, variant_id, seller_id, price, stock_quantity, cod_eligible) VALUES
 (1,1,2,14999.00,25,TRUE),
 (2,2,2,17999.00,15,TRUE),
 (3,3,3,499.00,100,TRUE),
 (4,4,3,499.00,80,TRUE),
 (5,5,2,1999.00,50,TRUE);

INSERT INTO cart (cart_id, buyer_id) VALUES (1,4),(2,5);
INSERT INTO cart_item (cart_id, line_no, offer_id, quantity) VALUES (1,1,3,2);

INSERT INTO wishlist (wishlist_id, buyer_id, name) VALUES (1,5,'Gift ideas');
INSERT INTO wishlist_item (wishlist_id, variant_id) VALUES (1,2);

INSERT INTO coupon (coupon_id, code, discount_type, discount_value, valid_until) VALUES
 (1,'WELCOME10','PERCENT',10.00,'2027-12-31'),
 (2,'FLAT100','FLAT',100.00,'2027-12-31');

-- Order 1: delivered, two sellers, coupon WELCOME10
INSERT INTO orders (order_id, buyer_id, address_id, coupon_id, order_date, status) VALUES
 (1,4,1,1,'2026-10-01','DELIVERED');
INSERT INTO sub_orders (sub_order_id, order_id, seller_id, status) VALUES
 (1,1,2,'DELIVERED'),(2,1,3,'DELIVERED');
INSERT INTO order_item (order_id, item_number, sub_order_id, offer_id, quantity, unit_price_snapshot) VALUES
 (1,1,1,1,1,14999.00),
 (1,2,2,3,2,499.00);
INSERT INTO shipment (shipment_id, sub_order_id, tracking_number, carrier, status, shipped_at) VALUES
 (1,1,'TRK1001','BlueDart','DELIVERED','2026-10-02 10:00:00'),
 (2,2,'TRK1002','Delhivery','DELIVERED','2026-10-02 11:00:00');
INSERT INTO delivery_assignment (assignment_id, shipment_id, agent_id, delivery_status) VALUES
 (1,1,6,'DELIVERED'),(2,2,6,'DELIVERED');
INSERT INTO payment (payment_id, order_id, amount, method, status, paid_at) VALUES
 (1,1,14397.30,'UPI','SUCCESS','2026-10-01 12:00:00');
INSERT INTO review (review_id, order_id, buyer_id, product_id, rating, comment) VALUES
 (1,1,4,1,5,'Great phone, fast delivery');
INSERT INTO refund (refund_id, payment_id, amount, reason, status) VALUES
 (1,1,500.00,'Damaged packaging','REQUESTED');

-- Order 2: just placed, cash on delivery
INSERT INTO orders (order_id, buyer_id, address_id, coupon_id, order_date, status) VALUES
 (2,5,2,NULL,'2026-10-20','PLACED');
INSERT INTO sub_orders (sub_order_id, order_id, seller_id, status) VALUES (3,2,2,'PENDING');
INSERT INTO order_item (order_id, item_number, sub_order_id, offer_id, quantity, unit_price_snapshot) VALUES
 (2,1,3,5,1,1999.00);
INSERT INTO payment (payment_id, order_id, amount, method, status) VALUES
 (2,2,1999.00,'COD','PENDING');
```

Check: order 1 total = 14999 + 2 × 499 = 15997; a 10 % coupon gives **14397.30**, which matches payment 1. Seed stock values are starting stock and are not reduced for the two sample orders.
