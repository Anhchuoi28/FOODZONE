const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối cơ sở dữ liệu MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_food'
});

db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối MySQL:', err);
        return;
    }
    console.log('Đã kết nối thành công với cơ sở dữ liệu MySQL!');
});

// ==========================================
// API 1: Lấy danh sách sản phẩm từ CSDL
// ==========================================
app.get('/api/products', (req, res) => {
    // Dùng dấu * để lấy tất cả các cột có sẵn trong bảng products, tránh lỗi do thiếu cột
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi truy vấn sản phẩm:', err);
            return res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm' });
        }
        res.json(results);
    });
});

// ==========================================
// API 2: Nhận đơn hàng và lưu vào CSDL
// ==========================================
app.post('/api/orders', (req, res) => {
    const { studentName, studentPhone, deliveryArea, detailedAddress, paymentMethod, notes, items, totalAmount } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Giỏ hàng trống!' });
    }

    const orderQuery = `INSERT INTO orders (student_name, student_phone, delivery_area, detailed_address, payment_method, notes, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(orderQuery, [studentName, studentPhone, deliveryArea, detailedAddress, paymentMethod, notes, totalAmount], (err, orderResult) => {
        if (err) {
            console.error('Lỗi lưu đơn hàng:', err);
            return res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
        }

        const orderId = orderResult.insertId;
        const itemsValues = items.map(item => [orderId, item.id, item.name, item.price, item.quantity]);
        const itemsQuery = `INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES ?`;

        db.query(itemsQuery, [itemsValues], (err2) => {
            if (err2) {
                console.error('Lỗi lưu chi tiết đơn hàng:', err2);
                return res.status(500).json({ message: 'Lỗi khi lưu chi tiết món ăn' });
            }

            res.status(201).json({ message: 'Đặt hàng thành công!', orderId: orderId });
        });
    });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});