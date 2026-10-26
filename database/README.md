# Marketplace database

## Load the database

Run the scripts in order from the repository root. The first script recreates
`marketplace_db`, so it deletes any existing database with that name.

```bash
mysql -u <user> -p < database/01_schema_catalog.sql
mysql -u <user> -p < database/02_schema_orders.sql
mysql -u <user> -p < database/03_seed.sql
```

## Seed password

The seed data already contains a bcrypt hash for `Password@123`. All seed
accounts use this password:

| Role | Email |
| --- | --- |
| Admin | `admin@mkt.com` |
| Seller | `techhub@mkt.com` |
| Seller | `fashionly@mkt.com` |
| Buyer | `rahul@mkt.com` |
| Buyer | `sneha@mkt.com` |
| Delivery agent | `ravi@mkt.com` |

## Tables

| Area | Tables |
| --- | --- |
| Users and roles | `users`, `address`, `buyer`, `seller`, `delivery_agent` |
| Catalog | `category`, `product`, `product_variant`, `offer` |
| Buyer lists | `cart`, `cart_item`, `wishlist`, `wishlist_item` |
| Orders | `coupon`, `orders`, `sub_orders`, `order_item`, `shipment`, `delivery_assignment`, `payment`, `refund`, `review` |
