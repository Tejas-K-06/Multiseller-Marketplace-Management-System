-- Load database/01_schema_catalog.sql, 02_schema_orders.sql and 03_seed.sql first.
-- Run with: mysql --force -u <user> -p marketplace_db < database/tests/validation.sql
USE marketplace_db;

-- Rule 5: stock quantity cannot be negative.
INSERT INTO offer (variant_id,seller_id,price,stock_quantity) VALUES (2,3,1,-1);
-- Rule 5: offer price must be greater than zero.
INSERT INTO offer (variant_id,seller_id,price,stock_quantity) VALUES (3,2,0,1);
-- Rule 5: SKU must be unique.
INSERT INTO product_variant (product_id,sku) VALUES (1,'NOVA-128-BLK');
-- Rule 1: user email must be unique.
INSERT INTO users (email,full_name,password_hash,role) VALUES ('admin@mkt.com','Duplicate','hash','ADMIN');
-- Rule 5: review rating must be from 1 through 5.
INSERT INTO review (order_id,buyer_id,product_id,rating) VALUES (1,4,2,6);
-- Rule 8: cart-item quantity must be positive.
INSERT INTO cart_item (cart_id,line_no,offer_id,quantity) VALUES (1,99,1,0);
-- Foreign-key rule: an address must reference an existing user.
INSERT INTO address (user_id,line1,city,state,postal_code) VALUES (999999,'x','x','x','000000');
-- Rule 23: only one review is allowed for an order and product.
INSERT INTO review (order_id,buyer_id,product_id,rating) VALUES (1,4,1,5);
-- Rule 7: deleting a category used by products is restricted.
DELETE FROM category WHERE category_id=3;
