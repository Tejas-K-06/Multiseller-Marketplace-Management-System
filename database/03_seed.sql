USE marketplace_db;
-- Seed accounts use the documented password: Password@123
SET @pw = '$2b$10$f7j2UjqUoS6fiCQYaQPPtOlNSdk6yOAMSsxImX5kgt1K15MnT4uoi';

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
