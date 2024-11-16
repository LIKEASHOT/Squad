// 引入依赖
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken"); // 引入 JWT 库
const session = require("express-session");
const cors = require("cors");
const axios = require('axios');
const multer = require('multer');
const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');  // 用来处理图片
const fs = require('fs');  // 文件操作
const mobilenet = require('@tensorflow-models/mobilenet');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const serverUrl = "http://192.168.56.1:3000"; // 服务器地址
//这里不知道为什么用 serverUrl不能替换，下面的返回所有计划信息api请手动替换自己的ip

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
  password: "123123",
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

//图片识别食物热量
const upload = multer({
  dest: 'uploads/',  // 图片上传目录
  limits: { fileSize: 10 * 1024 * 1024 },  // 设置文件大小限制为10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('只允许上传图片文件'));
    }
    cb(null, true); // 文件验证通过
  }
});

// 配置智谱AI API 请求
const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';  // 替换为实际API接口
const API_KEY1 = process.env.API_KEY;   // 替换为你的API密钥

// 通过智谱AI查询食物的平均热量（每份）
async function getFoodAverageCaloriesFromGLM(foodName) {
  try {
    const response = await axios.post(GLM_API_URL, {
      headers: {
        'Authorization': `Bearer ${API_KEY1}`,
      },
      data: {
        input: `请提供食物“${foodName}”的平均每份热量是多少？`,
      },
    });

    // 这里假设模型返回的是热量数据，确保正确解析
    const answer = response.data.result;  
    const averageCaloriesPerPortion = parseFloat(answer); // 假设返回的是数字

    if (isNaN(averageCaloriesPerPortion)) {
      throw new Error('无法解析热量数据');
    }

    console.log(`查询到的食物：${foodName}，平均热量：${averageCaloriesPerPortion}`);
    return averageCaloriesPerPortion;
  } catch (error) {
    console.error("查询热量时出错:", error);
    throw error;
  }
}


// 加载并使用 MobileNet 进行图片识别
async function loadModel() {
  const model = await mobilenet.load();
  console.log('MobileNet 模型加载成功');
  return model;
}
// 预测图像
async function predictFood(imagePath) {
  const image = await loadImage(imagePath); // 使用 canvas 加载图像
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const model = await loadModel();

  // 将 canvas 直接转换为 Tensor
  const imageTensor = tf.browser.fromPixels(canvas);

  // 进行预测
  const predictions = await model.classify(imageTensor);
  console.log('预测结果:', predictions);
  res.json({
    食物名称: foodName,
    平均每份热量: averageCaloriesPerPortion,
  });
  console.log("返回的数据:", {
  食物名称: foodName,
  平均每份热量: averageCaloriesPerPortion,
});
  return predictions;
}

// 处理上传的图片并识别食物热量
app.post('/predict', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('未上传文件');
    }
    console.log('Uploaded file:', req.file); // 检查是否正确上传
    // 使用食物识别模型预测食物名称
    const model = await loadModel();  // 加载食物识别模型
    const predictions = await predictFood(req.file.path, model);
    const foodName = predictions[0].className;  // 假设识别结果为第一项

    console.log(`识别出的食物：${foodName}`);
    console.log('响应数据:', {
      食物名称: foodName,
      平均每份热量: averageCaloriesPerPortion,
    });
    // 使用智谱AI获取食物的平均热量信息
    const averageCaloriesPerPortion = await getFoodAverageCaloriesFromGLM(foodName);

    // 返回响应数据
    res.json({
      食物名称: foodName,
      平均每份热量: averageCaloriesPerPortion,
    });
  } catch (error) {
    console.error('处理时出错:', error);
    res.status(500).send('处理图片时出错');
  }
});

// //每日摄入热量api
// // 配置智谱AI API
// const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/async/chat/completions'; 
// const API_KEY2 = process.env.API_KEY; 

// // 构造问题并向智谱AI发送请求
// async function getDailyCalories(height, weight, age, activityType, goal) {
//   const question = `
//     请根据以下信息计算每日所需热量摄取量：
//     身高：${height} cm，体重：${weight} kg，年龄：${age} 岁，运动类型：${activityType.replace(',', ' ')}，运动目标：${goal.replace(',', ' ')}。
//     请返回每日热量摄取量。
//   `;
  
//   console.log('AI 请求内容:', question);  // 打印请求内容

//   try {
//     const response = await axios.post(ZHIPU_API_URL, {
//       prompt: question,
//       max_tokens: 100,
//       temperature: 0.7,
//     }, {
//       headers: {
//         'Authorization': `Bearer ${API_KEY2}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     console.log('AI 响应:', response.data);  // 打印 AI 响应内容
//     return response.data.text.trim();
//   } catch (error) {
//     console.error('调用智谱AI失败:', error);
//     throw new Error('AI 调用失败');
//   }
// }


// // API 路由，处理前端请求
// app.post('/api/calculateCalories', async (req, res) => {
//   const { username } = req.body;

//   // // 验证用户名
//   // if (typeof username !== 'string' || username.trim() === '') {
//   //   return res.status(400).json({ error: '无效的用户名' });
//   // }

//   // 从数据库获取用户信息
//   connection.query('SELECT * FROM users WHERE name = ?', [username], async (err, results) => {
//     if (err) {
//       console.error('数据库查询失败:', err);
//       return res.status(500).json({ error: '数据库查询失败' });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ error: '用户未找到' });
//     }
//     console.log('数据库查询结果:', results);  // 打印查询到的结果
//     const user = results[0];
//     const { height, weight, age, exerciseType, fitnessGoal } = user;

//     try {
//       // 调用 AI 模型计算每日热量摄取量
//       const dailyCalories = await getDailyCalories(height, weight, age, exerciseType, fitnessGoal);
//       console.log('Daily Calories:', dailyCalories);  // 打印计算出的热量

//       // 返回计算结果并指定状态码 200
//       res.status(200).json({ dailyCalories: dailyCalories });
//     } catch (error) {
//       console.error('计算每日热量摄取量失败:', error);
//       res.status(500).json({ error: '计算每日摄入热量失败' });
//     }
//   });
// });


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
  db.query('SELECT goalid FROM users WHERE name = ?', [username], (err, results) => {
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
    db.query(query, [goalidArray], (err, goals) => {
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

  db.query(query, goalNames, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error while fetching goals" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No goals found for the provided names" });
    }

    // 获取目标 ID 列表
    const goalIds = results.map(result => result.id);

    // 更新用户的 goalid
    db.query('UPDATE users SET goalid = ? WHERE name = ?', [JSON.stringify(goalIds), username], (err) => {
      if (err) {
        return res.status(500).json({ error: "Database error while updating user goals" });
      }
      res.status(200).json({ message: "User goals updated successfully" });
    });
  });
});


// 返回所有计划信息（SELECT 名称, 时间, 运动次数, 难度, 卡路里, video_url, image_url, 目标, 运动类型）
app.get('/goals', (req, res) => {
  const sql = `
    SELECT 
      名称 AS title, 
      时间 AS duration, 
      运动次数 AS times, 
      难度 AS difficulties, 
      卡路里 AS calorie, 
      CONCAT('http://192.168.56.1:3000/', image_url) AS image_url, 
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


//API：修改封面对应的信息（需要  名称, 运动次数, 难度, 卡路里, B站连接, 目标, 运动类型, 时间, video_url)
app.put('/api/goals', (req, res) => {
  const { 名称, 运动次数, 难度, 卡路里, B站连接, 目标, 运动类型, 时间, video_url } = req.body;

  // SQL 更新语句
  const sql = `
      UPDATE goal 
      SET 
          运动次数 = ?, 
          难度 = ?, 
          卡路里 = ?, 
          B站连接 = ?, 
          目标 = ?, 
          运动类型 = ?, 
          时间 = ?, 
          video_url = ? 
      WHERE 
          名称 = ?`;

  // 执行更新
  db.query(sql, [运动次数, 难度, 卡路里, B站连接, 目标, 运动类型, 时间, video_url, 名称], (error, results) => {
      if (error) {
          return res.status(500).json({ message: '更新失败', error });
      }
      if (results.affectedRows > 0) {
          return res.json({ message: '更新成功' });
      } else {
          return res.json({ message: '未找到相关数据' });
      }
  });
});




// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});