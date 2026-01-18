const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();

// Sử dụng process.env.PORT cho Render (bắt buộc)
const PORT = process.env.PORT || 5000;

// Cấu hình CORS - cho phép Vercel và localhost
app.use(cors({
  origin: [
    'http://localhost:3000',               // dev React/Vite
    'http://localhost:5173',               // Vite default
    'https://your-frontend-domain.vercel.app',  // thay bằng domain Vercel thật của bạn
    // Nếu dùng preview branches: process.env.NODE_ENV === 'development' ? '*' : [...]
  ],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Health check route (Render dùng để kiểm tra service live)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend huyhieunongtrai đang chạy trên Render',
    env: process.env.NODE_ENV || 'development',
  });
});

// Cấu hình kết nối MySQL từ environment variables (Render sẽ inject)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'xunongtrai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Nếu DB yêu cầu SSL (PlanetScale, Aiven, v.v. thường bắt buộc)
  // ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null,
});

// Test kết nối khi start server
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
  }
})();

// API lấy tất cả dữ liệu hành trình
app.get('/api/hanhtrinh', async (req, res) => {
  try {
    const [days] = await pool.query(`
      SELECT h.id, h.ngay, h.tong_xu
      FROM hanhtrinh h
      ORDER BY h.ngay DESC
    `);

    const records = {};

    for (const day of days) {
      const [luotRows] = await pool.query(`
        SELECT 
          id,
          so_xu,
          thoi_gian,
          created_at
        FROM luot_thu_hoach
        WHERE ngay_id = ?
        ORDER BY created_at ASC
      `, [day.id]);

      records[day.ngay] = luotRows.map(row => ({
        id: row.id,
        so_xu: row.so_xu,
        thoi_gian: row.thoi_gian,
        created_at: row.created_at,
      }));
    }

    res.json(records);
  } catch (err) {
    console.error('Lỗi khi lấy hành trình:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
});

// API thêm lượt mới
app.post('/api/luot', async (req, res) => {
  const { ngay, so_xu, thoi_gian } = req.body;

  if (!ngay || !so_xu || !thoi_gian) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }

  try {
    let [rows] = await pool.query('SELECT id FROM hanhtrinh WHERE ngay = ?', [ngay]);
    let ngayId;

    if (rows.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO hanhtrinh (ngay, tong_xu) VALUES (?, 0)',
        [ngay]
      );
      ngayId = result.insertId;
    } else {
      ngayId = rows[0].id;
    }

    await pool.query(
      'INSERT INTO luot_thu_hoach (ngay_id, so_xu, thoi_gian) VALUES (?, ?, ?)',
      [ngayId, so_xu, thoi_gian]
    );

    await pool.query(`
      UPDATE hanhtrinh h
      SET tong_xu = (
        SELECT SUM(so_xu) FROM luot_thu_hoach l WHERE l.ngay_id = h.id
      )
      WHERE h.id = ?
    `, [ngayId]);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Lỗi thêm lượt:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
});

// API xóa lượt
app.delete('/api/luot/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM luot_thu_hoach WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lượt' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Lỗi xóa lượt:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
});

// Khởi động server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server chạy tại http://0.0.0.0:${PORT} (Render port: ${process.env.PORT || 'local'})`);
});