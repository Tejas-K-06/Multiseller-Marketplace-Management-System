DROP DATABASE IF EXISTS marketplace_db;
CREATE DATABASE marketplace_db CHARACTER SET utf8mb4;
USE marketplace_db;

-- ========== USERS AND ROLES ==========

-- Stores every account and its application role.
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

-- Stores addresses saved by users.
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

-- Stores buyer-specific account details.
CREATE TABLE buyer (
  user_id        INT PRIMARY KEY,
  loyalty_points INT NOT NULL DEFAULT 0,
  CHECK (loyalty_points >= 0),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Stores seller-specific account and approval details.
CREATE TABLE seller (
  user_id         INT PRIMARY KEY,
  store_name      VARCHAR(100) NOT NULL UNIQUE,
  tax_id          VARCHAR(20),
  approval_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Stores delivery-agent-specific account and availability details.
CREATE TABLE delivery_agent (
  user_id             INT PRIMARY KEY,
  vehicle_type        VARCHAR(30),
  availability_status ENUM('AVAILABLE','BUSY','OFFLINE') NOT NULL DEFAULT 'AVAILABLE',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ========== CATALOG ==========

-- Stores product categories in a parent-child hierarchy.
CREATE TABLE category (
  category_id        INT AUTO_INCREMENT PRIMARY KEY,
  parent_category_id INT NULL,
  name               VARCHAR(80) NOT NULL,
  UNIQUE (parent_category_id, name),
  FOREIGN KEY (parent_category_id) REFERENCES category(category_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Stores catalog products listed by sellers.
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

-- Stores the purchasable variants of each product.
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

-- Stores seller offers, prices, and available stock for variants.
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

-- Stores each buyer's reusable shopping cart.
CREATE TABLE cart (
  cart_id  INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL UNIQUE,                       -- 1:1 with buyer
  status   ENUM('ACTIVE','CHECKED_OUT') NOT NULL DEFAULT 'ACTIVE',
  FOREIGN KEY (buyer_id) REFERENCES buyer(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- line_no is computed by the backend: COALESCE(MAX(line_no),0)+1 for that cart
-- (AUTO_INCREMENT cannot be the 2nd column of a composite key in InnoDB)
-- Stores individual offer quantities in a cart.
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

-- Stores named wishlists created by buyers.
CREATE TABLE wishlist (
  wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id    INT NOT NULL,
  name        VARCHAR(80) NOT NULL,
  FOREIGN KEY (buyer_id) REFERENCES buyer(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Stores product variants saved in wishlists.
CREATE TABLE wishlist_item (
  wishlist_id INT NOT NULL,
  variant_id  INT NOT NULL,
  added_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (wishlist_id, variant_id),
  FOREIGN KEY (wishlist_id) REFERENCES wishlist(wishlist_id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id)  REFERENCES product_variant(variant_id) ON DELETE CASCADE
) ENGINE=InnoDB;
