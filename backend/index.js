const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// ✅ ROUTE ROOT (để Railway không báo Cannot GET /)
app.get("/", (req, res) => {
  res.send("Server Railway chạy OK 🚀");
});



// Cấu hình kết nối MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',           // thay bằng user của bạn
  password: '',           // thay bằng password
  database: 'xunongtrai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test kết nối
pool.getConnection()
  .then(conn => {
    console.log('MySQL connected successfully');
    conn.release();
  })
  .catch(err => console.error('MySQL connection failed:', err));

// API lấy tất cả dữ liệu
// API lấy tất cả dữ liệu
app.get('/api/hanhtrinh', async (req, res) => {
  try {
    // Lấy tất cả các ngày và tổng xu trước
    const [days] = await pool.query(`
      SELECT h.id, h.ngay, h.tong_xu
      FROM hanhtrinh h
      ORDER BY h.ngay DESC
    `);

    const records = {};

    // Với mỗi ngày, lấy riêng các lượt thu hoạch và xây dựng mảng JSON thủ công
    for (const day of days) {
      const [luotRows] = await pool.query(`
        SELECT 
          id,
          so_xu,
          thoi_gian,
          created_at
        FROM luot_thu_hoach
        WHERE ngay_id = ?
        ORDER BY created_at ASC  -- hoặc theo thứ tự bạn muốn
      `, [day.id]);

      // Chuyển thành mảng object JSON bằng JS (an toàn và tương thích)
      const luot = luotRows.map(row => ({
        id: row.id,
        so_xu: row.so_xu,
        thoi_gian: row.thoi_gian,
        created_at: row.created_at
      }));

      records[day.ngay] = luot;
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

  try {
    // Tìm hoặc tạo ngày
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

    // Thêm lượt
    await pool.query(
      'INSERT INTO luot_thu_hoach (ngay_id, so_xu, thoi_gian) VALUES (?, ?, ?)',
      [ngayId, so_xu, thoi_gian]
    );

    // Cập nhật tổng xu trong ngày
    await pool.query(`
      UPDATE hanhtrinh h
      SET tong_xu = (
        SELECT SUM(so_xu) FROM luot_thu_hoach l WHERE l.ngay_id = h.id
      )
      WHERE h.id = ?
    `, [ngayId]);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API xóa lượt
app.delete('/api/luot/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM luot_thu_hoach WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});