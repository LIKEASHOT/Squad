// 引入依赖
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken"); // 引入 JWT 库
const session = require("express-session");
const cors = require("cors");
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const serverUrl = "http://10.133.80.141.1:3000"; // 服务器地址
//这里不知道为什么用 serverUrl不能替换，下面的返回所有计划信息api请手动替换自己的ip
const config = {
  // 获取本地IP地址
  localIP: 'localhost',
  port: 3000
};
require('dotenv').config();

// 创建应用实例
const app = express();
const port = 3000;
// 配置 CORS
app.use(
  cors({
    origin: "*", // 允许所有源
    methods: ["GET", "POST", "PUT", "DELETE"], // 允许的 HTTP 方法
    allowedHeaders: ["Content-Type", "Authorization"], // 允许的请求头
  })
);
app.use(express.json());
// 解析 JSON 请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // 解析 URL 编码的请求体
// 提供静态文件访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 创建数据库连接
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "my_database",
});

const JWT_SECRET = "your_jwt_secret"; // 替换为你的密钥

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ error: "Unauthorized: No token provided" }); // 没有提供 token
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden: Invalid token" }); // token 无效
    }
    req.user = user; // 将用户信息存入 req.user
    next(); // 继续执行下一个中间件
  });
}

app.use(
  session({
    secret: "111",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);


// 注册 API
app.post("/register", (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Passwords do not match", success: false });
  }

  const checkQuery = "SELECT * FROM users WHERE name = ?";
  connection.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error("查询用户名时出错:", err);
      return res
        .status(500)
        .json({ message: "Database error", success: false });
    }

    if (results.length > 0) {
      return res
        .status(400)
        .json({ message: "Username already exists", success: false });
    }

    // 插入用户并设置 permission 为 2
    const insertQuery = "INSERT INTO users (name, password, permission) VALUES (?, ?, 2)";
    connection.query(insertQuery, [username, password], (err) => {
      if (err) {
        console.error("插入用户时出错:", err);
        return res
          .status(500)
          .json({ message: "Database error", success: false });
      }

      // 设置 session
      req.session.username = username;
      console.log("Session set for user:", req.session);

      res
        .status(201)
        .json({ message: "User registered successfully", success: true });
    });
  });
});


// 次级管理员 注册 API（有根级管理员注册）
app.post("/register-admin", (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Passwords do not match", success: false });
  }

  const checkQuery = "SELECT * FROM users WHERE name = ?";
  connection.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error("查询用户名时出错:", err);
      return res
        .status(500)
        .json({ message: "Database error", success: false });
    }

    if (results.length > 0) {
      return res
        .status(400)
        .json({ message: "Username already exists", success: false });
    }

    // 插入用户并设置 permission 为 1
    const insertQuery = "INSERT INTO users (name, password, permission) VALUES (?, ?, 1)";
    connection.query(insertQuery, [username, password], (err) => {
      if (err) {
        console.error("插入用户时出错:", err);
        return res
          .status(500)
          .json({ message: "Database error", success: false });
      }

      // 设置 session
      req.session.username = username;
      console.log("Session set for user:", req.session);

      res
        .status(201)
        .json({ message: "User registered successfully", success: true });
    });
  });
});


//登录API，输入值：账号密码，返回值有（登陆成功信号和对应用户的权限）
app.post("/login", (req, res) => {
  const { username, password } = req.body; // 从请求体中获取用户名和密码
  
  const query = "SELECT * FROM users WHERE name = ? AND password = ?";

  connection.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length > 0) {
      const user = results[0];
      
      // 登录成功，更新 lastLogin
      const updateLoginTimeQuery = "UPDATE users SET lastLogin = NOW() WHERE name = ?";
      connection.query(updateLoginTimeQuery, [username], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: "Database error" });
        }

        // 生成 JWT
        const token = jwt.sign({ username: username }, JWT_SECRET);
        
        // 返回登录成功消息、token 和用户的权限
        res.json({ 
          message: "Login successful", 
          token, 
          permission: user.Permission 
        });
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
});


// 输入性别和年龄 API
app.post("/updateGenderAge", (req, res) => {
  if (!req.session || !req.body.username) {
    return res.status(401).json({ error: "Unauthorized: Please log in first" });
  }
  const { gender, age, username } = req.body;

  if (!username) {
    return res.status(401).json({ error: "Unauthorized: Please log in first" });
  }

  // 更新用户的性别和年龄
  const updateQuery = "UPDATE users SET gender = ?, age = ? WHERE name = ?";
  connection.query(updateQuery, [gender, age, username], (err) => {
    if (err) {
      console.error("更新性别和年龄时出错:", err); // 打印错误信息
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ message: "Gender and age updated successfully" });
  });
});

// 身高体重更新
app.post("/updateHealthInfo", (req, res) => {
  console.log(req.body);

  if (!req.session || !req.body.username) {
    return res.status(401).json({ error: "Unauthorized: Please log in first" });
  }

  const { height, weight, username } = req.body;

  // 计算 BMI
  const heightInMeters = height / 100; // 假设输入的是厘米
  const bmi = weight / (heightInMeters * heightInMeters);

  // 更新用户的身高、体重和 BMI
  const updateQuery =
    "UPDATE users SET height = ?, weight = ?, bmi = ? WHERE name = ?";
  connection.query(updateQuery, [height, weight, bmi, username], (err) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ message: "Health info updated successfully", bmi });
  });
});



// 输入运动目标 API
app.post("/updateFitnessGoal", (req, res) => {
  const { fitnessGoal, username } = req.body;

  // 从 JWT 中获取用户名
  console.log(fitnessGoal); // 打印运动目标
  // 更新用户的运动目标
  const updateQuery = "UPDATE users SET fitnessGoal = ? WHERE name = ?";
  connection.query(updateQuery, [fitnessGoal, username], (err) => {
    if (err) {
      console.error("更新运动目标时出错:", err); // 打印错误信息
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ message: "Fitness goal updated successfully" });
  });
});



// 输入运动方式 API
app.post("/updateExerciseType", (req, res) => {
  const { exerciseType, username } = req.body;

  // 从 JWT 中获取用户名

  console.log(exerciseType); // 打印运动方式
  // 更新用户的运动方式
  const updateQuery = "UPDATE users SET exerciseType = ? WHERE name = ?";
  connection.query(updateQuery, [exerciseType, username], (err) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ message: "Exercise type updated successfully" });
  });
});

// 查询上一次登录时间 API
app.get("/last-login", (req, res) => {
  // 从 JWT 中获取用户名
  const username = req.body.username;

  // 查询用户的上一次登录时间
  const query = "SELECT lastLogin FROM users WHERE name = ?";
  connection.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      const lastLogin = results[0].lastLogin;
      res.status(200).json({ lastLogin });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });
});

//AI生成健身计划
app.post('/generateFitnessPlan', async (req, res) => {
  const { aiInput, username } = req.body;
  // 验证输入
  if (typeof aiInput !== 'string' || aiInput.trim() === '') {
    return res.status(400).json({ error: '无效的输入' });
  }

  // 从数据库获取用户的其他数据
  connection.query('SELECT * FROM users WHERE name = ?', [username], async (err, results) => {
    if (err) {
      console.error('数据库查询失败:', err);
      return res.status(500).json({ error: '数据库查询失败' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: '用户未找到' });
    }

    const user = results[0];

    // 获取用户的其他数据
    const { gender, age, height, weight, bmi, fitnessGoal, exerciseType } = user;

    const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      console.error('API 密钥未设置');
      return res.status(500).json({ error: '缺少 API 密钥' });
    }

    const model = 'GLM-4-Flash'; // 替换为实际模型ID

    try {
      console.log('请求数据:', {
        messages: [
          {
            role: 'user',
            content: `用户需求：${aiInput}。根据以下信息生成一个健身计划：
              性别：${gender}, 年龄：${age}, 身高：${height}米, 体重：${weight}公斤,
              BMI：${bmi}, 目标：${fitnessGoal}, 运动类型：${exerciseType}`
          }
        ]
      });

      // 发送请求到 AI API
      const response = await axios.post(
        API_URL,
        {
          model,  // 模型ID
          messages: [
            {
              role: 'user',
              content: `用户需求：${aiInput}。根据以下信息生成一个健身计划：
                性别：${gender}, 年龄：${age}, 身高：${height}米, 体重：${weight}公斤,
                BMI：${bmi}, 目标：${fitnessGoal}, 运动类型：${exerciseType}`
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 检查响应
      if (response.status === 200 && response.data.choices && response.data.choices.length > 0) {
        const fitnessPlan = response.data.choices[0].message.content;
        res.status(200).json({
          message: '健身计划生成成功',
          fitnessPlan
        });
      } else {
        console.error('AI 返回数据无效:', response.data);
        res.status(500).json({ error: 'AI 返回数据无效' });
      }
    } catch (error) {
      console.error('生成健身计划出错:', error.message || error);
      // 增加请求返回的错误详情
      if (error.response) {
        console.error('AI API 错误响应:', error.response.data);
        console.error('AI API 错误状态:', error.response.status);
      }
      res.status(500).json({ error: '生成健身计划失败' });
    }
  });
});


// 设置 multer 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath); // 如果文件夹不存在则创建
    }
    cb(null, uploadPath); // 保存路径
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname); // 使用时间戳命名文件
    cb(null, filename);
  },
});

// 配置 multer
const upload = multer({ storage: storage });

// 修改食物热量识别路由
app.post('/foodCalorie', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }

    const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      console.error('API 密钥未设置');
      return res.status(500).json({ error: '缺少 API 密钥' });
    }

    // 读取图片并转换为 base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    // 发送请求到智谱 AI
    const response = await axios.post(
      API_URL,
      {
        model: 'GLM-4v-plus',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                },
              },
              {
                type: 'text',
                text: '请识别这个食物的热量，热量要用准确数值表示，取一个你认为恰当的值即可，前面不需要加上大约等字样，并且严格按照以下JSON格式输出,如果有多种食物，一定要依次输出，仅输出JSON，不要添加其他内容：\n' +
                     '{\n' +
                     '  "食物名称": "xxx",\n' +
                     '  "热量": "yyy kcal/100g"\n' +
                     '}',
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 删除临时文件
    fs.unlinkSync(req.file.path);

    // 处理响应
    if (response.status === 200 && response.data.choices && response.data.choices.length > 0) {
      const aiResponse = response.data.choices[0].message.content;
      res.status(200).json({
        message: '食物识别成功',
        result: aiResponse
      });
      console.log('AI 返回数据:', aiResponse);
    } else {
      console.error('AI 返回数据无效:', response.data);
      res.status(500).json({ error: 'AI 返回数据无效' });
    }

  } catch (error) {
    console.error('食物识别出错:', error.message || error);
    // 清理临时文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.response) {
      console.error('AI API 错误响应:', error.response.data);
      console.error('AI API 错误状态:', error.response.status);
    }
    res.status(500).json({ error: '食物识别失败' });
  }
});

// 模糊查询API
app.post("/searchGoals", (req, res) => {
  const { name, target, type, difficulty } = req.body;
  const conditions = [];
  const params = [];
  
  if (name) {
    conditions.push("名称 LIKE ?");
    params.push(`%${name}%`);
  }
  if (target) {
    conditions.push("目标 LIKE ?");
    params.push(`%${target}%`);
  }
  if (type) {
    conditions.push("运动类型 LIKE ?");
    params.push(`%${type}%`);
  }
  if (difficulty) {
    conditions.push("难度 LIKE ?");
    params.push(`%${difficulty}%`);
  }

  let query = "SELECT 名称, 运动次数, 时间, 难度, 卡路里, image_url, video_url FROM goal";
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("查询目标时出错:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      res.status(200).json({ goals: results });
    } else {
      res.status(404).json({ message: "No goals found" });
    }
  });
});


// 获取用户的健身目标信息 API
app.post('/get-user-goals', (req, res) => {
  const { username } = req.body; // 从请求体中获取 username

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  // 查询用户的 goalid
  connection.query('SELECT goalid FROM users WHERE name = ?', [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const goalidString = results[0].goalid; // 获取 goalid 字符串
    const goalidArray = JSON.parse(goalidString); // 解析为数组

    // 使用 goalid 查询 goal 表
    const query = 'SELECT 名称, 运动次数, 时间, 难度, 卡路里, image_url, video_url FROM goal WHERE id IN (?)';
    connection.query(query, [goalidArray], (err, goals) => {
      if (err) {
        return res.status(500).json({ error: "Database error while fetching goals" });
      }

      res.status(200).json({ goals });
    });
  });
});


// 添加用户目标 API
app.post('/add-user-goals', (req, res) => {
  const { username, goalNames } = req.body; 
  if (!username || !goalNames || !Array.isArray(goalNames) || goalNames.length === 0) {
    return res.status(400).json({ error: "Username and goal names are required" });
  }

  // 查询目标名称对应的 id
  const placeholders = goalNames.map(() => '?').join(',');
  const query = `SELECT id FROM goal WHERE 名称 IN (${placeholders})`;

  connection.query(query, goalNames, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error while fetching goals" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No goals found for the provided names" });
    }

    // 获取目标 ID 列表
    const goalIds = results.map(result => result.id);

    // 更新用户的 goalid
    connection.query('UPDATE users SET goalid = ? WHERE name = ?', [JSON.stringify(goalIds), username], (err) => {
      if (err) {
        return res.status(500).json({ error: "Database error while updating user goals" });
      }
      res.status(200).json({ message: "User goals updated successfully" });
    });
  });
});


// 返回所有计划信息（SELECT 名称, 时间, 运动次数, 难度, 卡路里, video_url, image_url, 目标, 运动类型）
app.get('/goals', (req, res) => {
  console.log('请求所有计划信息');
  console.log('ip地址',config.localIP);
  const sql = `
    SELECT 
      名称 AS title, 
      时间 AS duration, 
      运动次数 AS times, 
      难度 AS difficulties, 
      卡路里 AS calorie, 
      CONCAT('http://${config.localIP}:${config.port}/', image_url) AS image_url, 
      目标 AS goal, 
      运动类型 AS type 
    FROM goal
  `;
  
  connection.query(sql, (error, results) => {
    if (error) {
      console.error("查询失败:", error);  // 添加错误日志
      return res.status(500).json({ message: '查询失败', error });
    }
    
    // console.log("查询结果:", results);  // 添加调试输出
    return res.json(results.length > 0 ? results : []);
  });
});

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/async/chat/completions';
const RESULT_URL = 'https://open.bigmodel.cn/api/paas/v4/async-result';
const API_KEY = process.env.API_KEY;

// 构造问题并向智谱AI发送请求
async function getDailyCalories(height, weight, age, activityType, goal) {
  const question = `
    请根据以下信息计算每日所需热量摄取量：
    身高：${height} cm，体重：${weight} kg，年龄：${age} 岁，运动类型：${activityType.replace(',', ' ')}，运动目标：${goal.replace(',', ' ')}。
    请返回每日热量摄取量。
    请隐藏计算过程，仅返回结果。
    ！！！！！！！注意只返回数字，不要包含任何其他文字！！！！！！！！！！！！！！！！！！！！！！！！！
    单位为千卡，格式：xxx 千卡。
  `;

  try {
    const response = await axios.post(ZHIPU_API_URL, {
      model: 'glm-4-plus',
      messages: [{ role: 'user', content: question }],
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const taskId = response.data.id;
    console.log('AI 请求成功, 任务ID:', taskId);

    // 轮询获取 AI 结果
    const getAIResult = async (taskId) => {
      const maxRetries = 10; // 增加最大重试次数
      const delay = 3000; // 增加每次重试的间隔时间到3秒

      for (let i = 0; i < maxRetries; i++) {
        const resultResponse = await axios.get(`${RESULT_URL}/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
          },
        });

        if (resultResponse.data.task_status === 'SUCCESS') {
          return resultResponse.data.choices[0].message.content.trim();
        } else if (resultResponse.data.task_status === 'FAILED') {
          throw new Error('AI 任务失败');
        }
        await new Promise(resolve => setTimeout(resolve, delay)); // 等待一段时间再重试
      }
      throw new Error('AI 任务超时');
    };

    // 获取最终 AI 结果
    const dailyCalories = await getAIResult(taskId);
    console.log('AI 计算结果:', dailyCalories);

    return dailyCalories;

  } catch (error) {
    console.error('调用智谱 AI 失败:', error);
    throw new Error('计算每日热量摄取量失败');
  }
}

// API 路由，处理前端请求
app.post('/api/calculateCalories', async (req, res) => {
  const { username } = req.body;

  // 验证用户名是否提供
  if (!username) {
    return res.status(400).json({ error: '用户名未提供' });
  }

  // 从数据库获取用户信息
  connection.query('SELECT * FROM users WHERE name = ?', [username], async (err, results) => {
    if (err) {
      console.error('数据库查询失败:', err);
      return res.status(500).json({ error: '数据库查询失败' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: '用户未找到' });
    }

    const user = results[0];
    const { height, weight, age, exerciseType, fitnessGoal } = user;

    if (!height || !weight || !age || !exerciseType || !fitnessGoal) {
      return res.status(400).json({ error: '用户健康信息不完整' });
    }

    try {
      // 调用 AI 模型计算每日热量摄取量
      const dailyCalories = await getDailyCalories(height, weight, age, exerciseType, fitnessGoal);
      console.log('Daily Calories:', dailyCalories);  // 打印计算出的热量

      // 返回计算结果并指定状态码 200
      res.status(200).json({ dailyCalories: dailyCalories });
    } catch (error) {
      console.error('计算每日热量摄取量失败:', error);
      res.status(500).json({ error: '计算每日摄入热量失败' });
    }
  });
});
// API: 添加健身封面（需要 名称, 运动次数, 难度, 卡路里, B站连接, 目标, 运动类型, 时间, 图片文件）
// app.post('/addGoal', upload.single('image'), (req, res) => {
//   // 获取前端发送的数据
//   const { 名称, 运动次数, 难度, 卡路里, B站连接, 目标, 运动类型, 时间, video_url } = req.body;

//   // 确保图片文件存在
//   if (!req.file) {
//     return res.status(400).json({ error: "请上传一张图片" });
//   }

//   // 获取上传的文件路径和文件名
//   const imagePath = path.join(__dirname, 'uploads', req.file.filename);
//   const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`; // 假设你的服务器在这个 URL 下提供文件

//   // 将数据插入数据库
//   const insertQuery = `
//     INSERT INTO goal (名称, 运动次数, 难度, 卡路里, B站连接, 目标, 运动类型, 时间, image_url, video_url) 
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//   connection.query(insertQuery, [名称, 运动次数, 难度, 卡路里, B站连接, 目标, 运动类型, 时间, imageUrl, video_url], (err) => {
//     if (err) {
//       return res.status(500).json({ error: "Database error" });
//     } 
//     res.status(200).json({ message: "Goal added successfully", imageUrl });
//   });
// });

// 图片上传接口
app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    console.log("上传的文件:", req.file);  // 调试输出文件信息
    const imageUrl = 'uploads/' + req.file.filename;
    res.json({
      success: true,
      imageUrl: imageUrl,  // 返回上传的图片路径
    });
  } else {
    res.status(400).json({ success: false, message: '上传失败' });
  }
});

app.put('/goals', (req, res) => {
  let { 名称, 运动次数, 时间, 卡路里, 运动类型, 目标, 难度, image_url, video_url } = req.body;

  console.log('接收到的更新数据:', req.body);
   // 修改时间字段的提取逻辑
  if (typeof 时间 === 'string') {
    const timeMatch = 时间.match(/\d+/); // 提取字符串中的数字部分
    时间 = timeMatch ? parseInt(timeMatch[0], 10) : 0; // 只保留数字部分，转换为整数
  } else {
    时间 = parseInt(时间, 10) || 0; // 如果时间本身是数字，直接使用
  }
  // 只保留 `uploads` 之后的部分
  if (image_url && image_url.includes('uploads/')) {
    image_url = image_url.substring(image_url.indexOf('uploads'));
  }
  const sql = `
    UPDATE goal 
    SET 
      运动次数 = ?, 
      时间 = ?, 
      卡路里 = ?, 
      运动类型 = ?, 
      目标 = ?, 
      难度 = ?, 
      image_url = ?, 
      video_url = ? 
    WHERE 名称 = ?`;

  const params = [运动次数, 时间, 卡路里, 运动类型, 目标, 难度, image_url, video_url, 名称];

  console.log('执行的SQL:', sql);
  console.log('传入的参数:', params); 

  connection.query(sql, params, (error, results) => {
    if (error) {
      console.error('数据库更新失败:', error);
      return res.status(500).json({ message: '更新失败', error });
    }
    if (results.affectedRows > 0) {
      return res.json({ message: '更新成功' });
    } else {
      return res.json({ message: '未找到相关数据' });
    }
  });
});

app.post('/goals/add', (req, res) => {
  const {
    名称,
    运动次数,
    难度,
    卡路里,
    目标,
    运动类型,
    时间,
    image_url,
    video_url,
    B站连接
  } = req.body;

  if (!名称) return res.status(400).json({ message: '计划名称不能为空' });

  const sql = `
    INSERT INTO goal 
    (名称, 运动次数, 难度, 卡路里, 目标, 运动类型, 时间, image_url, video_url, B站连接) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(sql, [名称, 运动次数, 难度, 卡路里, 目标, 运动类型, 时间, image_url, video_url, B站连接], (error, results) => {
    if (error) return res.status(500).json({ message: '添加失败', error });
    res.json({ message: '添加成功' });
  });
});


// 获取好友列表接口
app.get("/friends", async (req, res) => {
  const { userId } = req.query; // 从查询参数获取 userId

  if (!userId) {
    return res.status(400).json({ error: "userId 参数是必需的。" });
  }

  try {
    // SQL 查询：获取好友列表
    const query = `
      SELECT 
        f.friend_id AS friendId, 
        u.username AS friendName, 
        u.avatar AS friendAvatar, 
        f.created_at AS friendshipSince
      FROM 
        friendships f
      JOIN 
        users u ON f.friend_id = u.id
      WHERE 
        f.user_id = ? AND f.status = 'accepted'
      UNION
      SELECT 
        f.user_id AS friendId, 
        u.username AS friendName, 
        u.avatar AS friendAvatar, 
        f.created_at AS friendshipSince
      FROM 
        friendships f
      JOIN 
        users u ON f.user_id = u.id
      WHERE 
        f.friend_id = ? AND f.status = 'accepted';
    `;

    const [results] = await db.query(query, [userId, userId]); // 执行查询

    res.status(200).json(results); // 返回好友列表
  } catch (error) {
    console.error("数据库查询失败：", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

 
// 查找聊天记录并标记为已读
app.post('/chat/history', (req, res) => {
  const { userId, friendId, page = 1, limit = 20 } = req.body;

  if (!userId || !friendId) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing userId or friendId'
    });
  }

  const offset = (page - 1) * limit;

  const query = `
    SELECT id, sender_id AS senderId, receiver_id AS receiverId, content, timestamp, is_read AS isRead
    FROM messages
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?;
  `;

  db.query(query, [userId, friendId, friendId, userId, parseInt(limit), parseInt(offset)], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
      });
    }

    // 更新未读消息为已读
    const updateQuery = `
      UPDATE messages
      SET is_read = TRUE
      WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE;
    `;
    db.query(updateQuery, [userId, friendId], (updateErr) => {
      if (updateErr) {
        console.error(updateErr);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to mark messages as read'
        });
      }

      // 删除未读表中的消息
      const deleteUnreadQuery = `
        DELETE FROM unread_messages
        WHERE user_id = ? AND sender_id = ?;
      `;
      db.query(deleteUnreadQuery, [userId, friendId], (deleteErr) => {
        if (deleteErr) {
          console.error(deleteErr);
          return res.status(500).json({
            status: 'error',
            message: 'Failed to delete unread messages'
          });
        }

        // 获取总记录数
        const countQuery = `
          SELECT COUNT(*) AS total
          FROM messages
          WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?);
        `;

        db.query(countQuery, [userId, friendId, friendId, userId], (countErr, countResults) => {
          if (countErr) {
            console.error(countErr);
            return res.status(500).json({
              status: 'error',
              message: 'Internal Server Error'
            });
          }

          const total = countResults[0].total;

          res.json({
            status: 'success',
            data: {
              messages: results,
              pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total
              }
            }
          });
        });
      });
    });
  });
});




// 发送消息
app.post('/chat/send', async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ status: 'error', message: 'Invalid parameters.' });
  }

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    // 插入消息
    const [messageResult] = await connection.execute(
      `INSERT INTO messages (sender_id, receiver_id, content, is_read)
       VALUES (?, ?, ?, FALSE)`,
      [senderId, receiverId, content]
    );

    // 插入未读消息
    await connection.execute(
      `INSERT INTO unread_messages (user_id, sender_id, content)
       VALUES (?, ?, ?)`,
      [receiverId, senderId, content]
    );

    // 获取插入的消息时间戳
    const [timestampRows] = await connection.execute(
      `SELECT timestamp FROM messages WHERE id = ?`,
      [messageResult.insertId]
    );

    await connection.commit();
    connection.release();

    return res.json({
      status: 'success',
      messageId: messageResult.insertId,
      timestamp: timestampRows[0]?.timestamp || null
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Database error.' });
  }
});



//获取未读消息数
app.get('/chat/unread', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ status: 'error', message: 'Invalid parameters.' });
  }

  try {
    // 查询未读消息数量并按照发送者分组
    const [unreadMessages] = await pool.execute(
      `SELECT sender_id, COUNT(*) AS unreadCount
       FROM unread_messages
       WHERE user_id = ?
       GROUP BY sender_id`,
      [userId]
    );

    return res.json({
      status: 'success',
      unreadMessages: unreadMessages
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Database error.' });
  }
});


// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
