USE marketplace_db;

-- Q1. Active products with seller, category and cheapest price.
SELECT p.product_id,p.title,c.name AS category,s.store_name,MIN(o.price) AS from_price FROM product p JOIN category c ON c.category_id=p.category_id JOIN seller s ON s.user_id=p.seller_id JOIN product_variant v ON v.product_id=p.product_id JOIN offer o ON o.variant_id=v.variant_id AND o.status='ACTIVE' WHERE p.status='ACTIVE' GROUP BY p.product_id,p.title,c.name,s.store_name;

-- Q2. In-stock offers under Rs. 2000.
SELECT p.title,v.size,v.colour,o.price,o.stock_quantity FROM offer o JOIN product_variant v ON v.variant_id=o.variant_id JOIN product p ON p.product_id=v.product_id WHERE o.stock_quantity>0 AND o.price<2000 ORDER BY o.price;

-- Q3. Categories under Electronics.
WITH RECURSIVE tree AS (SELECT category_id,name FROM category WHERE name='Electronics' UNION ALL SELECT c.category_id,c.name FROM category c JOIN tree t ON c.parent_category_id=t.category_id) SELECT * FROM tree;

-- Q4. Delivered revenue per seller.
SELECT s.store_name,COUNT(DISTINCT so.sub_order_id) AS sub_orders,SUM(sp.seller_payable) AS revenue FROM sub_orders so JOIN v_seller_payable sp ON sp.sub_order_id=so.sub_order_id JOIN seller s ON s.user_id=so.seller_id WHERE so.status='DELIVERED' GROUP BY s.store_name ORDER BY revenue DESC;

-- Q5. Products averaging at least four stars.
SELECT p.title,ROUND(AVG(r.rating),2) AS avg_rating,COUNT(*) AS reviews FROM review r JOIN product p ON p.product_id=r.product_id GROUP BY p.product_id,p.title HAVING AVG(r.rating)>=4;

-- Q6. Buyer 4 order history and computed totals.
SELECT o.order_id,o.order_date,o.status,t.subtotal,t.discount,t.total_amount FROM orders o JOIN v_order_totals t ON t.order_id=o.order_id WHERE o.buyer_id=4 ORDER BY o.order_date DESC;

-- Q7. Lines for order 1.
SELECT oi.item_number,p.title,s.store_name,oi.quantity,oi.unit_price_snapshot,oi.quantity*oi.unit_price_snapshot AS line_total,so.status AS sub_order_status FROM order_item oi JOIN sub_orders so ON so.sub_order_id=oi.sub_order_id JOIN seller s ON s.user_id=so.seller_id JOIN offer f ON f.offer_id=oi.offer_id JOIN product_variant v ON v.variant_id=f.variant_id JOIN product p ON p.product_id=v.product_id WHERE oi.order_id=1;

-- Q8. Low stock for seller 2.
SELECT p.title,v.sku,o.stock_quantity FROM offer o JOIN product_variant v ON v.variant_id=o.variant_id JOIN product p ON p.product_id=v.product_id WHERE o.seller_id=2 AND o.stock_quantity<10;

-- Q9. Buyer spending totals.
SELECT u.full_name,SUM(t.total_amount) AS total_spent FROM orders o JOIN v_order_totals t ON t.order_id=o.order_id JOIN users u ON u.user_id=o.buyer_id WHERE o.status<>'CANCELLED' GROUP BY u.user_id,u.full_name ORDER BY total_spent DESC;

-- Q10. Delivery workload and refunds.
SELECT u.full_name AS agent,COUNT(*) AS deliveries FROM delivery_assignment da JOIN users u ON u.user_id=da.agent_id WHERE da.delivery_status='DELIVERED' GROUP BY u.user_id,u.full_name;
SELECT r.refund_id,r.amount,r.reason,r.status,p.order_id FROM refund r JOIN payment p ON p.payment_id=r.payment_id;
