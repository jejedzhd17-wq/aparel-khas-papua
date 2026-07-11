-- Aparel Khas Papua Store Database Schema
-- Database: apparel_papua

CREATE DATABASE IF NOT EXISTS apparel_papua;
USE apparel_papua;

-- 1. Table: users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT '🛍️',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category_id INT,
    description TEXT,
    full_description TEXT,
    sizes VARCHAR(255) DEFAULT 'S,M,L,XL,XXL', -- Comma-separated sizes (e.g. S,M,L)
    in_stock TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: product_images
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: cart_items
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    size VARCHAR(20) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_size (user_id, product_id, size)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table: wishlists
CREATE TABLE IF NOT EXISTS wishlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table: orders
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY, -- ORD-{timestamp}
    user_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- qris, bank-transfer, ewallet, cod
    bank_name VARCHAR(50) DEFAULT NULL,
    ewallet_name VARCHAR(50) DEFAULT NULL,
    status ENUM('pending', 'paid', 'shipped', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table: order_items
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    size VARCHAR(20) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Table: payments
CREATE TABLE IF NOT EXISTS payments (
    id_payments INT AUTO_INCREMENT PRIMARY KEY,
    id_order VARCHAR(50) NOT NULL UNIQUE,
    payment_method VARCHAR(50) NOT NULL,
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    total DECIMAL(12, 2) NOT NULL,
    proof_image VARCHAR(255) DEFAULT NULL,
    bank_name VARCHAR(50) DEFAULT NULL,
    ewallet_name VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_order) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Table: shipments
CREATE TABLE IF NOT EXISTS shipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    courier VARCHAR(100) NOT NULL, -- JNE, J&T, SiCepat, Pos Indonesia
    tracking_number VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('pending', 'shipped', 'in_transit', 'delivered') DEFAULT 'pending',
    shipping_date TIMESTAMP NULL DEFAULT NULL,
    estimated_delivery TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Table: reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 12. Table: bank_accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('bank','ewallet') NOT NULL DEFAULT 'bank',
    name VARCHAR(50) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder VARCHAR(100) NOT NULL DEFAULT 'Aparel Papua Store',
    color VARCHAR(20) DEFAULT '#005CA5',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Table: admins
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────
-- SEED DATA AWAL (MOCK DATA)
-- ───────────────────────────────────────────────────────────

-- Seed default user & admin
-- Password untuk admin: admin123 (terenkripsi bcrypt)
-- Password untuk user: customer123 (terenkripsi bcrypt)
INSERT INTO admins (name, email, password) VALUES
('Super Admin', 'admin@nokenpapua.com', '$2b$10$gM.L52P6a/8n1164Eewcbe.NqIex5dYcR/4XvNbeVn4g.J3v7gE2a');

INSERT INTO users (name, email, password, role) VALUES 
('Jeremy Nathanael', 'customer@nokenpapua.com', '$2b$10$9v3r/Fm5v5K6kR6KzG/j1eQG8y1g6V/84e4f71/a5s.9g7f.E5M.J', 'user');

-- Seed Categories
INSERT INTO categories (name, description, slug, icon) VALUES
('Kaos & Atasan', 'Kaos apparel dengan motif desain khas Papua modern', 'kaos-atasan', '👕'),
('Outerwear', 'Hoodie, jaket, dan sweater motif Papua hangat', 'outerwear', '🧥'),
('Tas Tradisional', 'Noken rajutan serat alami khas daerah pegunungan Papua', 'tas-tradisional', '👜'),
('Aksesoris', 'Gelang, kalung, dan ikat kepala khas adat Papua', 'aksesoris', '✨');

-- Seed Products
INSERT INTO products (name, price, stock, category_id, description, full_description, sizes, in_stock) VALUES
('Kaos Raja Ampat Biru', 150000.00, 30, 1, 'Kaos premium katun combed 30s dengan sablon artwork keindahan Raja Ampat.', 'Kaos berkualitas premium terbuat dari katun combed 30s yang sangat lembut, adem, dan menyerap keringat. Dilengkapi dengan cetakan sablon DTF (Direct to Film) berkualitas tinggi yang menampilkan ilustrasi eksklusif pemandangan bawah laut Kepulauan Raja Ampat yang indah.', 'S,M,L,XL,XXL', 1),
('Hoodie Papua Cenderawasih Black', 320000.00, 15, 2, 'Hoodie fleece tebal dengan bordir presisi burung Cenderawasih emas.', 'Hoodie berbahan dasar cotton fleece gramasi 280gsm yang tebal namun tetap adem di kulit. Memiliki motif rajutan ornamen khas burung Cenderawasih berwarna emas di sisi lengan kanan dan kiri, memberikan kesan mewah namun tetap elegan saat digunakan.', 'M,L,XL,XXL', 1),
('Tas Noken Serat Kayu Asli Wamena', 250000.00, 10, 3, 'Tas noken tradisional asli dirajut dari anyaman serat kayu pohon Manduam.', 'Noken tradisional berukuran medium yang diproduksi langsung oleh mama-mama pengrajin di Jayawijaya, Wamena. Terbuat dari serat kulit kayu pilihan yang dikeringkan lalu dipintal secara manual. Sangat kuat, ramah lingkungan, dan sarat akan nilai budaya adat Papua.', 'One Size', 1),
('Gelang Tradisional Manik Papua', 450000.00, 100, 4, 'Gelang etnik khas Papua dari manik-manik kayu dan serat alam.', 'Gelang tangan rajutan khas kerajinan tangan suku Papua. Didesain menggunakan manik-manik kayu berwarna alam (coklat, krem, hitam) dengan pengait serut elastis yang muat di segala jenis ukuran pergelangan tangan.', 'One Size', 1);

-- Seed Product Images
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60', 1),
(2, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60', 1),
(3, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60', 1),
(4, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&auto=format&fit=crop&q=60', 1);

-- Seed Reviews
INSERT INTO reviews (product_id, user_name, rating, comment) VALUES
(1, 'Agus Papua', 5, 'Kualitas bahan kaosnya mantap sekali, adem sekali dipakainya. Gambar sablonnya juga tebal dan tajam!'),
(1, 'Maria Jayapura', 4, 'Bagus sekali kaosnya. Ukuran L pas untuk saya. Pengiriman ke Jayapura cepat.'),
(2, 'Budi Utomo', 5, 'Bordir burung Cenderawasih emasnya kelihatan mewah sekali. Jaketnya tebal cocok buat malam hari.'),
(3, 'Susi Susanti', 5, 'Nokennya asli serat kayu wangi alami. Senang bisa membantu perekonomian mama-mama Papua. Terima kasih!');
