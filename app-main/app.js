// 引入依赖
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken"); // 引入 JWT 库
const session = require("express-session");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dayjs = require('dayjs');
const serverUrl = "http://192.168.56.1:3000"; // 服务器地址
//这里不知道为什么用 serverUrl不能替换，下面的返回所有计划信息api请手动替换自己的ip
const config = {
  // 获取本地IP地址
  localIP: "192.168.56.1",
  port: 3000,
};
require("dotenv").config();
const WebSocket = require("ws");

// 在 app 创建后添加 WebSocket 服务器
const wss = new WebSocket.Server({ port: 3001 });

// 存储在线用户的 WebSocket 连接
const clients = new Map();

// WebSocket 连接处理
wss.on("connection", (ws) => {
  let userId = null;

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "auth":
          // 用户认证，存储连接
          userId = data.username;
          clients.set(userId, ws);
          // 广播用户在线状态
          broadcastStatus(userId, "online");
          break;

        case "text":
          // 处理普通文本消息
          await handleTextMessage(data);
          // 转发消息给接收者
          forwardMessage(data);
          break;

        case "invitation":
          // 处理打卡邀请
          await handleInvitation(data);
          // 转发邀请给接收者
          forwardMessage(data);
          break;

        case "invitation_response":
          // 处理邀请响应
          await handleInvitationResponse(data);
          // 转发响应给发送者
          forwardMessage(data);
          break;

        case "checkin":
          // 处理打卡记录
          await handleCheckin(data);
          // 广播打卡进度
          broadcastProgress(data);
          break;
      }
    } catch (error) {
      console.error("WebSocket消息处理错误:", error);
    }
  });

  ws.on("close", () => {
    if (userId) {
      clients.delete(userId);
      // 广播用户离线状态
      broadcastStatus(userId, "offline");
    }
  });
});

// 消息转发函数
const forwardMessage = (message) => {
  const receiverWs = clients.get(message.receiver);
  if (receiverWs) {
    receiverWs.send(JSON.stringify(message));
  }
};

// 广播状态函数
const broadcastStatus = (userId, status) => {
  const statusMessage = {
    type: "status",
    username: userId,
    status: status,
  };

  for (const ws of clients.values()) {
    ws.send(JSON.stringify(statusMessage));
  }
};

// 广播进度函数
const broadcastProgress = (data) => {
  const progressMessage = {
    type: "progress_update",
    challengeId: data.challengeId,
    userId: data.userId,
    progress: data.progress,
  };

  for (const ws of clients.values()) {
    ws.send(JSON.stringify(progressMessage));
  }
};

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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
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
    const insertQuery =
      "INSERT INTO users (name, password, permission) VALUES (?, ?, 2)";
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
    const insertQuery =
      "INSERT INTO users (name, password, permission) VALUES (?, ?, 1)";
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
      const updateLoginTimeQuery =
        "UPDATE users SET lastLogin = NOW() WHERE name = ?";
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
          permission: user.Permission,
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

  //  JWT 中获取用户名
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

//AI成健身计划
app.post("/generateFitnessPlan", async (req, res) => {
  const { aiInput, username } = req.body;
  // 验证输入
  if (typeof aiInput !== "string" || aiInput.trim() === "") {
    return res.status(400).json({ error: "无效的输入" });
  }

  // 从数据库获取用户的其他数据
  connection.query(
    "SELECT * FROM users WHERE name = ?",
    [username],
    async (err, results) => {
      if (err) {
        console.error("数据库查询失败:", err);
        return res.status(500).json({ error: "数据库查询失败" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "用户未找到" });
      }

      const user = results[0];

      // 获取用户的其他数据
      const { gender, age, height, weight, bmi, fitnessGoal, exerciseType } =
        user;

      const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
      const API_KEY = process.env.API_KEY;

      if (!API_KEY) {
        console.error("API 密钥未设置");
        return res.status(500).json({ error: "缺少 API 密钥" });
      }

      const model = "GLM-4-Flash"; // 替换为实际模型ID

      try {
        console.log("请求数据:", {
          messages: [
            {
              role: "user",
              content: `用户需求：${aiInput}。根据以下信息生成一个健身计划：
              性别：${gender}, 年龄：${age}, 身高：${height}米, 体重：${weight}公斤,
              BMI：${bmi}, 目标：${fitnessGoal}, 运动类型：${exerciseType}`,
            },
          ],
        });

        // 发送请求到 AI API
        const response = await axios.post(
          API_URL,
          {
            model, // 模型ID
            messages: [
              {
                role: "user",
                content: `用户需求：${aiInput}。根据以下信息生成一个健身计划：
                性别：${gender}, 年龄：${age}, 身高：${height}米, 体重：${weight}公斤,
                BMI：${bmi}, 目标：${fitnessGoal}, 运动类型：${exerciseType}`,
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        // 检查响应
        if (
          response.status === 200 &&
          response.data.choices &&
          response.data.choices.length > 0
        ) {
          const fitnessPlan = response.data.choices[0].message.content;
          res.status(200).json({
            message: "健身计划生成成功",
            fitnessPlan,
          });
        } else {
          console.error("AI 返回数据无效:", response.data);
          res.status(500).json({ error: "AI 返回数据无效" });
        }
      } catch (error) {
        console.error("生成健身计划出错:", error.message || error);
        // 增加请求返回的错误详情
        if (error.response) {
          console.error("AI API 错误响应:", error.response.data);
          console.error("AI API 错误状态:", error.response.status);
        }
        res.status(500).json({ error: "生成健身计划失败" });
      }
    }
  );
});

// 设置 multer 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath); // 如果文件夹不存在则创建
    }
    cb(null, uploadPath); // 保存径
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname); // 使用时间戳命名文件
    cb(null, filename);
  },
});

// 配置 multer
const upload = multer({ storage: storage });

// 修改食物热量识别路由
app.post("/foodCalorie", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "请上传图片" });
    }

    const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      console.error("API 密钥未设置");
      return res.status(500).json({ error: "缺少 API 密钥" });
    }

    // 读取图片并转换为 base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");

    // 发送请求到智谱 AI
    const response = await axios.post(
      API_URL,
      {
        model: "GLM-4v-plus",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                },
              },
              {
                type: "text",
                text:
                  "识别��个食物的热量，热量要用准确数值表示，取一个你认为恰当的值即可，前面不需要加上大约等字样，并且严格按照以下JSON格式输出,如果有多种食物，一定要依次输出仅输出JSON，不要添加其他内容：\n" +
                  "{\n" +
                  '  "食物名称": "xxx",\n' +
                  '  "热量": "yyy kcal/100g"\n' +
                  "}",
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 删除临时文件
    fs.unlinkSync(req.file.path);

    // 处理响应
    if (
      response.status === 200 &&
      response.data.choices &&
      response.data.choices.length > 0
    ) {
      const aiResponse = response.data.choices[0].message.content;
      res.status(200).json({
        message: "食物识别成功",
        result: aiResponse,
      });
      console.log("AI 返回数据:", aiResponse);
    } else {
      console.error("AI 返回数据无效:", response.data);
      res.status(500).json({ error: "AI 返回数据无效" });
    }
  } catch (error) {
    console.error("食物识别出错:", error.message || error);
    // 清理临时文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.response) {
      console.error("AI API 错误响应:", error.response.data);
      console.error("AI API 错误状态:", error.response.status);
    }
    res.status(500).json({ error: "食物识别失败" });
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

  let query =
    "SELECT 名称, 运动次数, 时间, 难度, 卡路里, image_url, video_url FROM goal";
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
app.post("/get-user-goals", (req, res) => {
  const { username } = req.body; // 从请求体中获取 username

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  // 查询用户的 goalid
  connection.query(
    "SELECT goalid FROM users WHERE name = ?",
    [username],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const goalidString = results[0].goalid; // 获取 goalid 字符串
      const goalidArray = JSON.parse(goalidString); // 解析为数组

      // 使用 goalid 查询 goal 表
      const query =
        "SELECT 名称, 运动次数, 时间, 难度, 卡路里, image_url, video_url FROM goal WHERE id IN (?)";
      connection.query(query, [goalidArray], (err, goals) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Database error while fetching goals" });
        }

        res.status(200).json({ goals });
      });
    }
  );
});

// 添加用户目标 API
app.post("/add-user-goals", (req, res) => {
  const { username, goalNames } = req.body;
  if (
    !username ||
    !goalNames ||
    !Array.isArray(goalNames) ||
    goalNames.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Username and goal names are required" });
  }

  // 查询目标名称对应的 id
  const placeholders = goalNames.map(() => "?").join(",");
  const query = `SELECT id FROM goal WHERE 名称 IN (${placeholders})`;

  connection.query(query, goalNames, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database error while fetching goals" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "No goals found for the provided names" });
    }

    // 获取目标 ID 列表
    const goalIds = results.map((result) => result.id);

    // 更新用户的 goalid
    connection.query(
      "UPDATE users SET goalid = ? WHERE name = ?",
      [JSON.stringify(goalIds), username],
      (err) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Database error while updating user goals" });
        }
        res.status(200).json({ message: "User goals updated successfully" });
      }
    );
  });
});

// 返回所有计划信息（SELECT 名称, 时间, 运动次数, 难度, 卡路里, video_url, image_url, 目标, 运动类型）
app.get("/goals", (req, res) => {
  console.log("请求所有计划信息");
  console.log("ip地址", config.localIP);
  const sql = `
    SELECT 
      名称 AS title, 
      时间 AS duration, 
      运动次数 AS times, 
      难度 AS difficulties, 
      卡路里 AS calorie, 
      CONCAT('http://${config.localIP}:${config.port}/', image_url) AS image_url, 
      目标 AS goal, 
      运动类型 AS type,
      B站连接 as videoUrl
    FROM goal
  `;

  connection.query(sql, (error, results) => {
    if (error) {
      console.error("查询失败:", error); // 添加错误日志
      return res.status(500).json({ message: "查询失败", error });
    }

    // console.log("查询结果:", results);  // 添加调试输出
    return res.json(results.length > 0 ? results : []);
  });
});

const ZHIPU_API_URL =
  "https://open.bigmodel.cn/api/paas/v4/async/chat/completions";
const RESULT_URL = "https://open.bigmodel.cn/api/paas/v4/async-result";
const API_KEY = process.env.API_KEY;

// 构造问题并向智谱AI发送请求
async function getDailyCalories(height, weight, age, activityType, goal) {
  const question = `
    请根据以下信息计算每日所需热量摄取量：
    身高：${height} cm，体重：${weight} kg，年龄：${age} 岁，运动类型${activityType.replace(
    ",",
    " "
  )}，运动目标：${goal.replace(",", " ")}。
    请返回每日热量摄取量。
    请隐藏计算过程，仅返回结果。
    ！！！！！！！注意只返回数字，不要包含任何其他文字！！！！！！！！！！！！！！！！！！！！！！！！！
    单位为千卡，格式：xxx 千卡。
  `;

  try {
    const response = await axios.post(
      ZHIPU_API_URL,
      {
        model: "glm-4-plus",
        messages: [{ role: "user", content: question }],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const taskId = response.data.id;
    console.log("AI 请求成功, 任务ID:", taskId);

    // 轮询获取 AI 结果
    const getAIResult = async (taskId) => {
      const maxRetries = 10; // 增加最大重试次数
      const delay = 3000; // 增加每次重试的间隔时间到3秒

      for (let i = 0; i < maxRetries; i++) {
        const resultResponse = await axios.get(`${RESULT_URL}/${taskId}`, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        });

        if (resultResponse.data.task_status === "SUCCESS") {
          return resultResponse.data.choices[0].message.content.trim();
        } else if (resultResponse.data.task_status === "FAILED") {
          throw new Error("AI 任务失败");
        }
        await new Promise((resolve) => setTimeout(resolve, delay)); // 等待一段时间再重试
      }
      throw new Error("AI 任务超时");
    };

    // 获取最终 AI 结果
    const dailyCalories = await getAIResult(taskId);
    console.log("AI 计算结果:", dailyCalories);

    return dailyCalories;
  } catch (error) {
    console.error("调用智谱 AI 失败:", error);
    throw new Error("计算每日热量摄取量失败");
  }
}

// API 路由，处理前端请求
app.post("/api/calculateCalories", async (req, res) => {
  const { username } = req.body;

  // 验证用户名是否提供
  if (!username) {
    return res.status(400).json({ error: "用户名未提供" });
  }

  // 从数据库获用户信息
  connection.query(
    "SELECT * FROM users WHERE name = ?",
    [username],
    async (err, results) => {
      if (err) {
        console.error("数据库查询失败:", err);
        return res.status(500).json({ error: "数据库查询失败" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "用户未找到" });
      }

      const user = results[0];
      const { height, weight, age, exerciseType, fitnessGoal } = user;

      if (!height || !weight || !age || !exerciseType || !fitnessGoal) {
        return res.status(400).json({ error: "用户健康信息不完整" });
      }

      try {
        // 调用 AI 模型计算每日热量摄取量
        const dailyCalories = await getDailyCalories(
          height,
          weight,
          age,
          exerciseType,
          fitnessGoal
        );
        console.log("Daily Calories:", dailyCalories); // 打印计算出的热量

        // 返回计算结果并指定状态码 200
        res.status(200).json({ dailyCalories: dailyCalories });
      } catch (error) {
        console.error("计算每日热量摄取量失败:", error);
        res.status(500).json({ error: "计算每日摄入热量失败" });
      }
    }
  );
});

const uploadedFiles = new Set();
app.post("/upload", upload.single("file"), (req, res) => {
  if (req.file) {
    const fileName = req.file.filename;

    if (uploadedFiles.has(fileName)) {
      return res.status(400).json({ success: false, message: "重复上传" });
    }
    uploadedFiles.add(fileName);

    const imageUrl = "uploads/" + fileName;
    res.json({ success: true, imageUrl: imageUrl });
  } else {
    res.status(400).json({ success: false, message: "上传失败" });
  }
});

// 提交每日饮食记录
app.post("/submitDailyFoods", async (req, res) => {
  const { username, date, foods } = req.body;

  if (!username || !date || !Array.isArray(foods)) {
    return res.status(400).json({ success: false, message: "缺少参数" });
  }

  connection.beginTransaction((err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "数据库事务开始失败" });
    }

    try {
      // 查询用户ID
      connection.query(
        "SELECT id FROM users WHERE name = ?",
        [username],
        (err, userRows) => {
          if (err) {
            return connection.rollback(() => {
              res
                .status(500)
                .json({ success: false, message: "数据库查询失败" });
            });
          }

          if (userRows.length === 0) {
            return connection.rollback(() => {
              res.status(404).json({ success: false, message: "用户不存在" });
            });
          }
          const userId = userRows[0].id;

          // 插入食物记录
          const insertPromises = foods.map(
            (food) =>
              new Promise((resolve, reject) => {
                const baseFoodName = food.食物名称;

                // 检查数据库中是否存在重名食物
                const checkNameQuery = `
              SELECT COUNT(*) AS count 
              FROM food_records 
              WHERE user_id = ? AND record_date = ? AND food_name LIKE ?
            `;
                connection.query(
                  checkNameQuery,
                  [userId, date, `${baseFoodName}%`],
                  (err, results) => {
                    if (err) return reject(err);

                    let uniqueFoodName = baseFoodName;
                    const count = results[0].count;

                    // 如果有重名，则加后缀
                    if (count > 0) {
                      uniqueFoodName = `${baseFoodName} (${count})`;
                    }

                    // 插入记录
                    const insertQuery = `
                  INSERT INTO food_records 
                  (user_id, record_date, food_name, base_calories, amount, current_calories, image_url, time)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;
                    connection.query(
                      insertQuery,
                      [
                        userId,
                        date,
                        uniqueFoodName,
                        food.baseCalories,
                        food.amount,
                        food.currentCalories,
                        food.imageUrl,
                        new Date().toLocaleTimeString("en-GB", {
                          hour12: false,
                        }),
                      ],
                      (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                      }
                    );
                  }
                );
              })
          );

          // 等待所有插入操作完成
          Promise.all(insertPromises)
            .then(() => {
              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    res
                      .status(500)
                      .json({ success: false, message: "事务提交失败" });
                  });
                }

                res.json({ success: true, message: "记录上传成功" });
              });
            })
            .catch((error) => {
              connection.rollback(() => {
                console.error("插入失败:", error);
                res
                  .status(500)
                  .json({ success: false, message: "插入食物记录失败" });
              });
            });
        }
      );
    } catch (error) {
      console.error("数据库操作失败:", error);
      connection.rollback(() => {
        res.status(500).json({ success: false, message: "服务器错误" });
      });
    }
  });
});

// 获取用户某日饮食记录
app.post("/getDailyFoods", async (req, res) => {
  const { username, date } = req.body;

  if (!username || !date) {
    return res.status(400).json({ success: false, message: "缺少参数" });
  }

  try {
    // 查询用户ID
    connection.query(
      "SELECT id FROM users WHERE name = ?",
      [username],
      (err, userRows) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "数据库查询失败" });
        }

        if (userRows.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "用户不存在" });
        }
        const userId = userRows[0].id;

        // 查询饮食记录
        connection.query(
          `SELECT food_name AS 食物名称, base_calories AS 基础热量, amount AS 食用量, 
                current_calories AS 当前热量, image_url AS 图片路径, time AS 时间
         FROM food_records 
         WHERE user_id = ? AND record_date = ?`,
          [userId, date],
          (err, foodRows) => {
            if (err) {
              return res
                .status(500)
                .json({ success: false, message: "数据库查询失败" });
            }

            res.json({ success: true, foods: foodRows });
          }
        );
      }
    );
  } catch (error) {
    console.error("数据库查询失败:", error);
    res.status(500).json({ success: false, message: "服务器错误" });
  }
});

// 删除用户饮食记录
app.post("/deleteFood", async (req, res) => {
  const { username, foodName, date } = req.body;

  if (!username || !foodName || !date) {
    return res.status(400).json({ success: false, message: "缺少参数" });
  }

  try {
    // 查询用户ID
    connection.query(
      "SELECT id FROM users WHERE name = ?",
      [username],
      (err, userRows) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "数据库查询失败" });
        }

        if (userRows.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "用户不存在" });
        }

        const userId = userRows[0].id;

        // 查询并删除指定的食物记录
        connection.query(
          `SELECT current_calories AS 当前热量 
         FROM food_records 
         WHERE user_id = ? AND record_date = ? AND food_name = ?`,
          [userId, date, foodName],
          (err, foodRows) => {
            if (err) {
              return res
                .status(500)
                .json({ success: false, message: "数据库查询失败" });
            }

            if (foodRows.length === 0) {
              return res
                .status(404)
                .json({ success: false, message: "记录不存在" });
            }

            const deletedCalories = foodRows[0].当前热量;

            // 删除记录
            connection.query(
              `DELETE FROM food_records 
             WHERE user_id = ? AND record_date = ? AND food_name = ?`,
              [userId, date, foodName],
              (err) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ success: false, message: "删除失败" });
                }

                res.json({
                  success: true,
                  message: "删除成功",
                  deletedCalories,
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error("删除记录失败:", error);
    res.status(500).json({ success: false, message: "服务器错误" });
  }
});
//更新饮食记录
app.post("/updateFood", async (req, res) => {
  const { username, foodName, amount, currentCalories } = req.body;

  if (!username || !foodName || !amount || !currentCalories) {
    return res.status(400).json({ success: false, message: "缺少参数" });
  }

  try {
    // 查询用户ID
    connection.query(
      "SELECT id FROM users WHERE name = ?",
      [username],
      (err, userRows) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "数据库查询失败" });
        }

        if (userRows.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "用户不存在" });
        }

        const userId = userRows[0].id;

        // 更新数据库中的食物数据
        connection.query(
          `UPDATE food_records 
         SET amount = ?, current_calories = ? 
         WHERE user_id = ? AND food_name = ?`,
          [amount, currentCalories, userId, foodName],
          (err, result) => {
            if (err) {
              return res
                .status(500)
                .json({ success: false, message: "更新失败" });
            }

            if (result.affectedRows > 0) {
              res.json({ success: true, message: "更新成功" });
            } else {
              res.status(404).json({ success: false, message: "记录未找到" });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error("更新失败:", error);
    res.status(500).json({ success: false, message: "服务器错误" });
  }
});

app.put("/goals", (req, res) => {
  let {
    名称,
    运动次数,
    时间,
    卡路里,
    运动类型,
    目标,
    难度,
    image_url,
    video_url,
  } = req.body;

  console.log("接收到的更新数据:", req.body);
  // 修改时间字段的提取逻辑
  if (typeof 时间 === "string") {
    const timeMatch = 时间.match(/\d+/); // 提取字符串中的数字部分
    时间 = timeMatch ? parseInt(timeMatch[0], 10) : 0; // 只保留数字部分，转换为整数
  } else {
    时间 = parseInt(时间, 10) || 0; // 如果时间本身是数字，直接使用
  }
  // 只保留 `uploads` 之后的部分
  if (image_url && image_url.includes("uploads/")) {
    image_url = image_url.substring(image_url.indexOf("uploads"));
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

  const params = [
    运动次数,
    时间,
    卡路里,
    运动类型,
    目标,
    难度,
    image_url,
    video_url,
    名称,
  ];

  console.log("执行的SQL:", sql);
  console.log("传入的参数:", params);

  connection.query(sql, params, (error, results) => {
    if (error) {
      console.error("数据库更新失败:", error);
      return res.status(500).json({ message: "更新失败", error });
    }
    if (results.affectedRows > 0) {
      return res.json({ message: "更新成功" });
    } else {
      return res.json({ message: "未找到相关数据" });
    }
  });
});

app.post("/goals/add", (req, res) => {
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
    B站连接,
  } = req.body;

  if (!名称) return res.status(400).json({ message: "计划名称不能为空" });

  const sql = `
    INSERT INTO goal 
    (名称, 运动次数, 难度, 卡路里, 目标, 运动类型, 时间, image_url, video_url, B站连接) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(
    sql,
    [
      名称,
      运动次数,
      难度,
      卡路里,
      目标,
      运动类型,
      时间,
      image_url,
      video_url,
      B站连接,
    ],
    (error, results) => {
      if (error) return res.status(500).json({ message: "添加失败", error });
      res.json({ message: "添加成功" });
    }
  );
});
// 获取好友列表接口
app.get("/friends", (req, res) => {
  const { userId } = req.query;
  console.log("获取好友列表请求:", userId); // 添加日志

  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "Missing userId",
    });
  }

  // 先查询用户ID
  const userQuery = "SELECT id FROM users WHERE name = ?";
  connection.query(userQuery, [userId], (err, userResults) => {
    if (err) {
      console.error("查询用户失败:", err);
      return res.status(500).json({
        status: "error",
        message: "Database error",
      });
    }

    if (userResults.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const userDbId = userResults[0].id;

    // 查询好友列表
    const friendsQuery = `
      SELECT 
        u.id as friendId,
        u.name as friendName,
        u.avatar as friendAvatar,
        f.created_at as friendshipSince,
        f.status
      FROM friendships f
      JOIN users u ON (
        CASE 
          WHEN f.user_id = ? THEN f.friend_id = u.id
          WHEN f.friend_id = ? THEN f.user_id = u.id
        END
      )
      WHERE (f.user_id = ? OR f.friend_id = ?)
      AND f.status = 'accepted'
    `;

    connection.query(
      friendsQuery,
      [userDbId, userDbId, userDbId, userDbId],
      (err, friends) => {
        if (err) {
          console.error("查询好友列表失败:", err);
          return res.status(500).json({
            status: "error",
            message: "Failed to get friends list",
          });
        }

        // 格式化好友列表数据
        const formattedFriends = friends.map((friend) => ({
          id: friend.friendId,
          username: friend.friendName,
          avatar: friend.friendAvatar || "/static/avatar/default.png",
          status: "离线", // 默认离线状态
          friendshipSince: friend.friendshipSince,
        }));

        console.log("返回的好友列表:", formattedFriends); // 添加日志
        res.json(formattedFriends);
      }
    );
  });
});

// 添加好友接���
app.post("/friends/add", (req, res) => {
  const { userId, friendUsername } = req.body;
  console.log("收到添加好友请求:", req.body); // 添加日志

  if (!userId || !friendUsername) {
    return res.status(400).json({
      status: "error",
      message: "Missing required parameters",
    });
  }

  // 不能添加自己为好友
  if (userId === friendUsername) {
    return res.status(400).json({
      status: "error",
      message: "Cannot add yourself as friend",
    });
  }

  // 先查询要添加的好友的用户ID
  const findFriendQuery = "SELECT id FROM users WHERE name = ?";
  connection.query(findFriendQuery, [friendUsername], (err, friendResults) => {
    if (err) {
      console.error("查询好友失败:", err);
      return res.status(500).json({
        status: "error",
        message: "Database error",
      });
    }

    if (friendResults.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Friend not found",
      });
    }

    const friendId = friendResults[0].id;

    // 查询发起请求的用户ID
    connection.query(
      "SELECT id FROM users WHERE name = ?",
      [userId],
      (err, userResults) => {
        if (err) {
          console.error("查询用户失败:", err);
          return res.status(500).json({
            status: "error",
            message: "Database error",
          });
        }

        if (userResults.length === 0) {
          return res.status(404).json({
            status: "error",
            message: "User not found",
          });
        }

        const requesterId = userResults[0].id;

        // 检查是否已经是好友
        const checkFriendshipQuery = `
          SELECT * FROM friendships 
          WHERE (user_id = ? AND friend_id = ?) 
          OR (user_id = ? AND friend_id = ?)
        `;
        connection.query(
          checkFriendshipQuery,
          [requesterId, friendId, friendId, requesterId],
          (err, existingFriends) => {
            if (err) {
              console.error("检查好友关系失败:", err);
              return res.status(500).json({
                status: "error",
                message: "Database error",
              });
            }

            if (existingFriends.length > 0) {
              return res.status(400).json({
                status: "error",
                message: "Already friends",
              });
            }

            // 添加好友关系
            const addFriendQuery = `
              INSERT INTO friendships (user_id, friend_id, status) 
              VALUES (?, ?, 'accepted')
            `;
            connection.query(addFriendQuery, [requesterId, friendId], (err) => {
              if (err) {
                console.error("添加好友失败:", err);
                return res.status(500).json({
                  status: "error",
                  message: "Failed to add friend",
                });
              }

              res.json({
                status: "success",
                message: "Friend added successfully",
              });
            });
          }
        );
      }
    );
  });
});

// 获取聊天历史记录
app.post("/chat/history", (req, res) => {
  const { userId, friendId } = req.body;

  if (!userId || !friendId) {
    return res.status(400).json({
      status: "error",
      message: "Missing userId or friendId",
    });
  }

  const query = `
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) 
    OR (sender_id = ? AND receiver_id = ?) 
    ORDER BY timestamp DESC
  `;

  connection.query(
    query,
    [userId, friendId, friendId, userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Database error",
        });
      }

      res.json({
        status: "success",
        data: { messages: results },
      });
    }
  );
});

// 修改发送消息接口
app.post("/chat/send", (req, res) => {
  const { senderId, receiverId, content } = req.body;
  console.log('收到发送消息请求:', { senderId, receiverId, content }); // 添加请求日志

  if (!senderId || !receiverId || !content) {
    console.log('缺少必要参数');
    return res.status(400).json({
      status: "error",
      message: "Missing required parameters"
    });
  }

  // 先查询发送者ID
  const senderQuery = "SELECT id FROM users WHERE name = ?";
  connection.query(senderQuery, [senderId], (err, senderResults) => {
    if (err) {
      console.error('查询发送者失败:', err);
      return res.status(500).json({
        status: "error",
        message: "Failed to find sender"
      });
    }

    if (senderResults.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Sender not found"
      });
    }

    const senderDbId = senderResults[0].id;

    // 查询接收者ID
    connection.query(senderQuery, [receiverId], (err, receiverResults) => {
      if (err) {
        console.error('查询接收者失败:', err);
        return res.status(500).json({
          status: "error",
          message: "Failed to find receiver"
        });
      }

      if (receiverResults.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Receiver not found"
        });
      }

      const receiverDbId = receiverResults[0].id;

      // 插入消息
      const insertQuery = `
        INSERT INTO messages (sender_id, receiver_id, content, is_read) 
        VALUES (?, ?, ?, FALSE)
      `;

      connection.query(insertQuery, [senderDbId, receiverDbId, content], (err, result) => {
        if (err) {
          console.error('插入消息失败:', err);
          return res.status(500).json({
            status: "error",
            message: "Failed to send message"
          });
        }

        // 插入未读消息记录
        const unreadQuery = `
          INSERT INTO unread_messages (user_id, sender_id, content)
          VALUES (?, ?, ?)
        `;

        connection.query(unreadQuery, [receiverDbId, senderDbId, content], (err) => {
          if (err) {
            console.error('插入未读消息失败:', err);
            return res.status(500).json({
              status: "error",
              message: "Failed to create unread message"
            });
          }

          console.log('消息发送成功:', result.insertId);
          res.json({
            status: "success",
            messageId: result.insertId
          });
        });
      });
    });
  });
});

// 获取未读消息数
app.get("/chat/unread", (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "Missing userId",
    });
  }

  const query = `
    SELECT sender_id, COUNT(*) as count 
    FROM messages 
    WHERE receiver_id = ? AND is_read = FALSE 
    GROUP BY sender_id
  `;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Database error",
      });
    }

    res.json({
      status: "success",
      unreadMessages: results,
    });
  });
});

// 标记消息为已读
app.post("/chat/mark-read", (req, res) => {
  const { userId, friendId } = req.body;

  if (!userId || !friendId) {
    return res.status(400).json({
      status: "error",
      message: "Missing parameters",
    });
  }

  const query = `
    UPDATE messages 
    SET is_read = TRUE 
    WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE
  `;

  connection.query(query, [friendId, userId], (err) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Database error",
      });
    }

    res.json({
      status: "success",
      message: "Messages marked as read",
    });
  });
});
app.post("/getTargets", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: "用户名不能为空" });
  }

  const query = `
    SELECT sport_time_goal, calories_goal, avatar 
    FROM users 
    WHERE name = ?;
  `;

  connection.query(query, [username], (error, results) => {
    if (error) {
      console.error("查询用户目标失败:", error);
      return res.status(500).json({ success: false, message: "服务器错误" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "用户不存在" });
    }

    const { sport_time_goal, calories_goal, avatar } = results[0];
    res.json({
      success: true,
      data: {
        sport_time_goal,
        calories_goal,
        avatar,
      },
    });
  });
});

// 更新用户目标
app.post("/updateTargets", (req, res) => {
  const { username, calories_goal, sport_time_goal } = req.body;

  if (!username || calories_goal == null || sport_time_goal == null) {
    return res.json({ success: false, message: "参数缺失" });
  }

  const query =
    "UPDATE users SET calories_goal = ?, sport_time_goal = ? WHERE name = ?";
  connection.query(
    query,
    [calories_goal, sport_time_goal, username],
    (err, results) => {
      if (err) {
        console.error("更新用户目标失败:", err);
        return res.json({ success: false, message: "服务器错误" });
      }

      if (results.affectedRows > 0) {
        res.json({ success: true });
      } else {
        res.json({ success: false, message: "用户目标更新失败" });
      }
    }
  );
});
app.post("/updateAvatar", (req, res) => {
  const { username, avatar } = req.body;

  if (!username || !avatar) {
    return res.status(400).json({ success: false, message: "参数不完整" });
  }

  const query = `
    UPDATE users 
    SET avatar = ? 
    WHERE name = ?;
  `;

  connection.query(query, [avatar, username], (error, results) => {
    if (error) {
      console.error("更新头像失败:", error);
      return res.status(500).json({ success: false, message: "服务器错误" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "用户不存在" });
    }

    res.json({ success: true, message: "头像更新成功" });
  });
});
// 新增接口：获取用户信息
app.post("/getUserInfo", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: "用户名不能为空" });
  }

  const query = "SELECT name, height, weight, age, gender FROM users WHERE name = ?";
  connection.query(query, [username], (error, results) => {
    if (error) {
      console.error("获取用户信息失败:", error);
      return res.status(500).json({ success: false, message: "服务器错误" });
    }

    if (results.length > 0) {
      res.json({ success: true, data: results[0] });
    } else {
      res.status(404).json({ success: false, message: "用户不存在" });
    }
  });
});
// 更新用户信息接口
app.post("/updateUserInfo", (req, res) => {
  const { oldUsername, username, height, weight, age, gender } = req.body;

  // 检查旧用户名是否存在
  if (!oldUsername || !username) {
    return res.status(400).json({ success: false, message: "用户名不能为空" });
  }

  // 定义 SQL 语句
  const query = `
    UPDATE users 
    SET name = ?, height = ?, weight = ?, age = ?, gender = ?
    WHERE name = ?
  `;

  // 执行 SQL 更新语句
  connection.query(
    query,
    [username, height, weight, age, gender, oldUsername],
    (error, results) => {
      if (error) {
        console.error("更新用户信息失败:", error);
        return res.status(500).json({ success: false, message: "服务器错误" });
      }

      if (results.affectedRows > 0) {
        res.json({ success: true, message: "用户信息更新成功" });
      } else {
        res.status(404).json({ success: false, message: "用户不存在" });
      }
    }
  );
});

app.post("/changePassword", (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  if (!username || !oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "参数不完整" });
  }

  const querySelect = "SELECT password FROM users WHERE name = ?";
  const queryUpdate = "UPDATE users SET password = ? WHERE name = ?";

  connection.query(querySelect, [username], (error, results) => {
    if (error) {
      console.error("查询用户密码失败:", error);
      return res.status(500).json({ success: false, message: "服务器错误" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "用户不存在" });
    }

    const currentPassword = results[0].password;

    if (currentPassword !== oldPassword) {
      return res.status(400).json({ success: false, message: "原密码错误" });
    }

    // 更新密码
    connection.query(queryUpdate, [newPassword, username], (err, updateResults) => {
      if (err) {
        console.error("更新密码失败:", err);
        return res.status(500).json({ success: false, message: "服务器错误" });
      }

      if (updateResults.affectedRows > 0) {
        res.json({ success: true, message: "密码修改成功" });
      } else {
        res.status(500).json({ success: false, message: "密码修改失败" });
      }
    });
  });
});
// 获取用户运动数据
app.post("/getSportData", (req, res) => {
  const { username } = req.body;

  const query = `SELECT fitnessGoal, exerciseType FROM users WHERE name = ?`;

  connection.query(query, [username], (error, results) => {
    if (error) {
      console.error("获取运动数据失败:", error);
      return res.status(500).json({ success: false, message: "服务器错误" });
    }

    if (results.length > 0) {
      const data = results[0];
      res.json({ success: true, data });
    } else {
      res.status(404).json({ success: false, message: "用户不存在" });
    }
  });
});

// 更新用户运动数据
app.post("/updateSportData", (req, res) => {
  const { username, fitnessGoal, exerciseType } = req.body;

  const query = `
    UPDATE users 
    SET fitnessGoal = ?, exerciseType = ?
    WHERE name = ?
  `;

  connection.query(query, [fitnessGoal, exerciseType, username], (error, results) => {
    if (error) {
      console.error("更新运动数据失败:", error);
      return res.status(500).json({ success: false, message: "服务器错误" });
    }

    if (results.affectedRows > 0) {
      res.json({ success: true, message: "数据更新成功" });
    } else {
      res.status(404).json({ success: false, message: "用户不存在" });
    }
  });
});
//获取目标运动时长
app.get("/sport-time-goal", (req, res) => {
  const username = req.query.username; // 前端传递用户名
  if (!username) {
    return res.status(400).json({ success: false, message: "用户名缺失" });
  }

  // 数据库查询
  const query = `SELECT sport_time_goal FROM users WHERE name = ?`;
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "数据库查询失败" });
    }

    if (results.length > 0) {
      res.json({
        success: true,
        data: { sport_time_goal: results[0].sport_time_goal },
      });
    } else {
      res.status(404).json({ success: false, message: "用户未找到" });
    }
  });
});
//获取用户的今日运动时长
app.get("/exercise-duration", (req, res) => {
  const username = req.query.username; // 获取前端传递的用户名
  const today = dayjs().format("YYYY-MM-DD"); // 获取今天的日期

  if (!username) {
    return res.status(400).json({ success: false, message: "用户名缺失" });
  }

  const query = `
    SELECT exercise_duration FROM exercise_logs WHERE username = ? AND date = ?
  `;
  connection.query(query, [username, today], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "数据库查询失败" });
    }

    if (results.length > 0) {
      res.json({
        success: true,
        data: { exercise_duration: results[0].exercise_duration },
      });
    } else {
      res.json({ success: true, data: { exercise_duration: 0 } }); // 没有记录时返回0
    }
  });
});
//保存运动时长
app.post("/save-exercise-duration", (req, res) => {
  const { username, date, exercise_duration } = req.body;

  // 检查必需的参数
  if (!username || !date || exercise_duration == null) {
    return res.status(400).json({ success: false, message: "缺少必要参数" });
  }

  // 查询是否已存在当天的记录
  const checkQuery = `SELECT * FROM exercise_logs WHERE username = ? AND date = ?`;

  connection.query(checkQuery, [username, date], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "数据库查询失败" });
    }

    if (results.length > 0) {
      // 如果当天已有记录，执行更新操作
      const updateQuery = `UPDATE exercise_logs SET exercise_duration = ? WHERE username = ? AND date = ?`;
      connection.query(updateQuery, [exercise_duration, username, date], (err, updateResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: "更新数据失败" });
        }

        res.json({ success: true, message: "运动时长更新成功" });
      });
    } else {
      // 如果当天没有记录，执行插入操作
      const insertQuery = `
        INSERT INTO exercise_logs (username, date, exercise_duration)
        VALUES (?, ?, ?)
      `;
      connection.query(insertQuery, [username, date, exercise_duration], (err, insertResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: "插入数据失败" });
        }

        res.json({ success: true, message: "运动时长保存成功" });
      });
    }
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

