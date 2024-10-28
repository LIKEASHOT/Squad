// 引入依赖
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken'); // 引入 JWT 库
const session = require('express-session');
// 创建应用实例
const app = express();
const port = 3000;

// 解析 JSON 请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // 解析 URL 编码的请求体
// 创建数据库连接
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123123',
  database: 'my_database'
});

const JWT_SECRET = 'your_jwt_secret'; // 替换为你的密钥

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' }); // 没有提供 token
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid token' }); // token 无效
    }
    req.user = user; // 将用户信息存入 req.user
    next(); // 继续执行下一个中间件
  });
}

app.use(session({
  secret: '111',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
// 注册 API
app.post('/register', (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match', success: false });
  }

  const checkQuery = 'SELECT * FROM users WHERE name = ?';
  connection.query(checkQuery, [username], (err, results) => {
      if (err) {
          console.error('查询用户名时出错:', err);
          return res.status(500).json({ message: 'Database error', success: false });
      }

      if (results.length > 0) {
          return res.status(400).json({ message: 'Username already exists', success: false });
      }

      const insertQuery = 'INSERT INTO users (name, password) VALUES (?, ?)';
      connection.query(insertQuery, [username, password], (err) => {
          if (err) {
              console.error('插入用户时出错:', err);
              return res.status(500).json({ message: 'Database error', success: false });
          }

          // 设置 session
          req.session.username = username; // 确保这里设置了 username
          console.log('Session set for user:', req.session); // 调试信息

          res.status(201).json({ message: 'User registered successfully', success: true });
      });
  });
});

// 登录 API
app.post('/login', (req, res) => {
  const { username, password } = req.body; // 从请求体中获取用户名和密码
  const query = 'SELECT * FROM users WHERE name = ? AND password = ?';

  connection.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length > 0) {
      // 登录成功，更新 lastLogin
      const updateLoginTimeQuery = 'UPDATE users SET lastLogin = NOW() WHERE name = ?';
      connection.query(updateLoginTimeQuery, [username], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: 'Database error' });
        }
        // 生成 JWT
        const token = jwt.sign({ username: username }, JWT_SECRET);
        res.json({ message: 'Login successful', token }); // 登录成功，返回 token
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// 输入性别和年龄 API
app.post('/updateGenderAge', (req, res) => {
  if (!req.session || !req.session.username) {
    return res.status(401).json({ error: 'Unauthorized: Please log in first' });
}
  const { gender, age } = req.body;

  // 从 session 中获取当前登录的用户名
  const username = req.session.username; // 修改为 req.session.username

  if (!username) {
    return res.status(401).json({ error: 'Unauthorized: Please log in first' });
  }

  // 更新用户的性别和年龄
  const updateQuery = 'UPDATE users SET gender = ?, age = ? WHERE name = ?';
  connection.query(updateQuery, [gender, age, username], (err) => {
    if (err) {
      console.error('更新性别和年龄时出错:', err); // 打印错误信息
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Gender and age updated successfully' });
  });
});

// 身高体重更新 
app.post('/updateHealthInfo', (req, res) => {
    if (!req.session || !req.session.username) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    const username = req.session.username;
    const { height, weight } = req.body;

    // 计算 BMI
    const heightInMeters = height / 100; // 假设输入的是厘米
    const bmi = weight / (heightInMeters * heightInMeters);

    // 更新用户的身高、体重和 BMI
    const updateQuery = 'UPDATE users SET height = ?, weight = ?, bmi = ? WHERE name = ?';
    connection.query(updateQuery, [height, weight, bmi, username], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: 'Health info updated successfully', bmi });
    });
});

// 输入运动目标 API
app.post('/updateFitnessGoal', authenticateToken, (req, res) => {
  const { fitnessGoal } = req.body;

  // 从 JWT 中获取用户名
  const username = req.user.username; // 假设在登录时已将用户名存储在 JWT 中

  // 更新用户的运动目标
  const updateQuery = 'UPDATE users SET fitnessGoal = ? WHERE name = ?';
  connection.query(updateQuery, [fitnessGoal, username], (err) => {
    if (err) {
      console.error('更新运动目标时出错:', err); // 打印错误信息
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Fitness goal updated successfully' });
  });
});

// 输入运动方式 API
app.post('/updateExerciseType', authenticateToken, (req, res) => {
  const { exerciseType } = req.body;

  // 从 JWT 中获取用户名
  const username = req.user.username; // 假设在登录时已将用户名存储在 JWT 中

  // 更新用户的运动方式
  const updateQuery = 'UPDATE users SET exerciseType = ? WHERE name = ?';
  connection.query(updateQuery, [exerciseType, username], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Exercise type updated successfully' });
  });
});

// 查询上一次登录时间 API
app.get('/last-login', authenticateToken, (req, res) => {
  // 从 JWT 中获取用户名
  const username = req.user.username;

  // 查询用户的上一次登录时间
  const query = 'SELECT lastLogin FROM users WHERE name = ?';
  connection.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length > 0) {
      const lastLogin = results[0].lastLogin;
      res.status(200).json({ lastLogin });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
