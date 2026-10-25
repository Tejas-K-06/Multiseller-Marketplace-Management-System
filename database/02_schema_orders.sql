USE marketplace_db;

-- ========== ORDERS ==========

-- Stores discount codes that can be applied to orders.
CREATE TABLE coupon (
  coupon_id      INT AUTO_INCREMENT PRIMARY KEY,
  code           VARCHAR(30) NOT NULL UNIQUE,
  discount_type  ENUM('PERCENT','FLAT') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  valid_until    DATE NOT NULL,
  CHECK (discount_value > 0)
) ENGINE=InnoDB;

-- Stores orders placed by buyers.
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

-- Stores the seller-specific portions of each order.
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
-- Stores individual purchased offers within an order.
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

-- Stores shipment tracking details for sub-orders.
CREATE TABLE shipment (
  shipment_id     INT AUTO_INCREMENT PRIMARY KEY,
  sub_order_id    INT NOT NULL,
  tracking_number VARCHAR(30) NOT NULL UNIQUE,
  carrier         VARCHAR(50),
  status          ENUM('CREATED','IN_TRANSIT','DELIVERED') NOT NULL DEFAULT 'CREATED',
  shipped_at      TIMESTAMP NULL,
  FOREIGN KEY (sub_order_id) REFERENCES sub_orders(sub_order_id)
) ENGINE=InnoDB;

-- Stores delivery-agent assignments for shipments.
CREATE TABLE delivery_assignment (
  assignment_id   INT AUTO_INCREMENT PRIMARY KEY,
  shipment_id     INT NOT NULL,
  agent_id        INT NOT NULL,
  assigned_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivery_status ENUM('ASSIGNED','PICKED_UP','DELIVERED','FAILED') NOT NULL DEFAULT 'ASSIGNED',
  FOREIGN KEY (shipment_id) REFERENCES shipment(shipment_id),
  FOREIGN KEY (agent_id)    REFERENCES delivery_agent(user_id)
) ENGINE=InnoDB;

-- Stores payments made or pending for orders.
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

-- Stores refund requests and their processing status.
CREATE TABLE refund (
  refund_id  INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  amount     DECIMAL(10,2) NOT NULL,
  reason     VARCHAR(255),
  status     ENUM('REQUESTED','APPROVED','REJECTED','PROCESSED') NOT NULL DEFAULT 'REQUESTED',
  CHECK (amount > 0),
  FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
) ENGINE=InnoDB;

-- Stores buyer ratings and comments on purchased products.
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

-- ========== DERIVED-VALUE VIEWS ==========

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
