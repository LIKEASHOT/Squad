// 引入依赖
// 加载环境变量

// nodemon --inspect app.js 用于调试
const express = require("express");
const mysql = require("mysql");
const mysql2 = require("mysql2/promise"); // 使用 mysql2/promise 以支持 async/await
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken"); // 引入 JWT 库
const session = require("express-session");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
//这里不知道为什么用 serverUrl不能替换，下面的返回所有计划信息api请手动替换自己的ip
require("dotenv").config();
const config = {
  // 获取本地IP地址
  localIP: process.env.SERVER_HOST,
  port: process.env.SERVER_PORT,
};

// 创建应用实例
const app = express();
const port = process.env.PORT || 3000;
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
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 创建数据库连接池
const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
const JWT_SECRET = "your_jwt_secret"; // 替换为你的密钥

app.use(
  session({
    secret: "111",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
require("dotenv").config();
const WebSocket = require("ws");

// 在 app 创建后添加 WebSocket 服务器
const wss = new WebSocket.Server({ port: 3001 });

// 存储在线用户的 WebSocket 连接
const clients = new Map();

// WebSocket 连接处理
wss.on("connection", (ws) => {
  ws.username = null;
  ws.userId = null;
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log("收到WebSocket消息:", data);

      switch (data.type) {
        case "auth":
          ws.username = data.username;
          console.log("用户认证:", ws.username);
          ws.userId = await getUserIdByUsername(ws.username);
          clients.set(ws.userId, ws);

          // 更新用户在线状态
          await updateUserStatus(ws.userId, ws.username, true);
          // 广播在线状态
          broadcastStatus(ws.userId, ws.username, "online");

          // 获取并发送离线消息
          try {
            const offlineMessages = await getOfflineMessages(ws.userId);
            console.log("获取到的离线消息:", offlineMessages);

            if (offlineMessages.length > 0) {
              // 将每条离线消息发送给用户
              for (const msg of offlineMessages) {
                const messageData = {
                  type: msg.type,
                  id: msg.id,
                  sender: msg.sender,
                  receiver: msg.receiver,
                  content: msg.content,
                  time: msg.time,
                  user_id: msg.sender_id,
                };

                // 如果消息包含额外数据，解析并添加
                if (msg.message_data) {
                  try {
                    const extraData = JSON.parse(msg.message_data);
                    Object.assign(messageData, extraData);
                  } catch (e) {
                    console.error("解析消息数据失败:", e);
                  }
                }

                ws.send(JSON.stringify(messageData));
              }

              // 不再需要更新消息状态，因为消息已经被删除
              console.log("所有离线消息已发送并删除");
            }
          } catch (error) {
            console.error("处理离线消息失败:", error);
          }

          // 获取该用户的所有好友当前状态并发送
          try {
            const friendsList = await getFriendsList(ws.userId);
            const friendsStatus = [];

            for (const friendId of friendsList) {
              // 查询每个好友的在线状态
              const query = `
                SELECT u.name, us.is_online, us.last_active
                FROM users u
                LEFT JOIN user_status us ON u.id = us.user_id
                WHERE u.id = ?
              `;
              const [rows] = await pool.query(query, [friendId]);
              console.log("好友状态:", rows);
              if (rows.length > 0) {
                friendsStatus.push({
                  type: "status",
                  username: rows[0].name,
                  status: rows[0].is_online ? "online" : "offline",
                  timestamp: rows[0].last_active,
                });
              }
            }

            // 发送所有好友的状态
            if (friendsStatus.length > 0) {
              ws.send(
                JSON.stringify({
                  type: "friends_status",
                  statuses: friendsStatus,
                })
              );
            }
          } catch (error) {
            console.error("获取好友状态失败:", error);
          }
          break;

        case "text":
          // 保存消息到数据库
          // console.log("收到消息:", data);
          const messageId = await saveMessage(data);
          // await updateUnread(data);
          // 转发消息
          forwardMessage({ ...data, id: messageId, user_id: ws.userId });
          break;

        case "read_ack":
          // 处理已读回执
          const friendId_response = await getUserIdByUsername(data.receiver);
          const success = await notifyMessageRead(
            ws.userId,
            friendId_response,
            data
          );
          if (!success) {
            console.error("处理已读回执失败");
          }
          break;
      }
    } catch (error) {
      console.error("处理WebSocket消息失败:", error);
    }
  });

  ws.on("close", async () => {
    console.log("WebSocket 连接关闭");
    console.log("用户名称:", ws.username);
    if (ws.userId) {
      // 更新用户离线状态
      await updateUserStatus(ws.userId, ws.username, false);
      clients.delete(ws.userId);
      // console.log(clients);
      broadcastStatus(ws.userId, ws.username, "offline");
    }
  });
});

// 数据库操作函数
const updateUserStatus = async (userId, username, isOnline) => {
  console.log(`用户 ${username} 状态更新为 ${isOnline ? "在线" : "离线"}`);
  const query = `
    INSERT INTO user_status (user_id, is_online, last_active)
    VALUES (?, ?, NOW())
    ON DUPLICATE KEY UPDATE
    is_online = ?, last_active = NOW()
  `;
  await pool.query(query, [userId, isOnline, isOnline]);
};

const saveMessage = async (message) => {
  // 首先查询发送者和接收者的用户ID
  const getUsersQuery = `
    SELECT id, name FROM users 
    WHERE name IN (?, ?)
  `;

  try {
    const [users] = await new Promise((resolve, reject) => {
      connection.query(
        getUsersQuery,
        [message.sender, message.receiver],
        (err, results) => {
          if (err) reject(err);
          else resolve([results]);
        }
      );
    });

    if (!users || users.length !== 2) {
      throw new Error("发送者或接收者不存在");
    }

    const sender = users.find((u) => u.name === message.sender);
    const receiver = users.find((u) => u.name === message.receiver);
    console.log("发送者:", sender);
    console.log("接收者:", receiver);
    // 然后使用实际的用户ID插入消息
    const insertQuery = `
      INSERT INTO messages (sender_id, receiver_id, sender, receiver, content, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await new Promise((resolve, reject) => {
      connection.query(
        insertQuery,
        [
          sender.id,
          receiver.id,
          sender.name,
          receiver.name,
          message.content,
          message.type,
        ],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    console.log("消息已保存:");
    return result.insertId;
  } catch (error) {
    console.error("保存消息失败:", error);
    throw error;
  }
};
const getUserIdByUsername = async (username) => {
  const query = `
    SELECT id
    FROM users
    WHERE name = ?
  `;
  try {
    const [rows] = await pool.query(query, [username]);
    if (rows.length > 0) {
      return rows[0].id;
    } else {
      throw new Error("用户不存在");
    }
  } catch (error) {
    console.error("查询用户ID失败:", error);
    throw error;
  }
};
const updateofflineMessage = async (message) => {
  var sender = null;
  var receiver = null;
  // 首先查询发送者和接收者的用户ID
  const getUsersQuery = `
  SELECT id, name FROM users 
  WHERE name IN (?, ?)
  `;

  try {
    const [users] = await new Promise((resolve, reject) => {
      connection.query(
        getUsersQuery,
        [message.sender, message.receiver],
        (err, results) => {
          if (err) reject(err);
          else resolve([results]);
        }
      );
    });

    if (!users || users.length !== 2) {
      throw new Error("发送者或接收者不存在");
    }

    sender = users.find((u) => u.name === message.sender);
    receiver = users.find((u) => u.name === message.receiver);
    console.log("发送者:", sender);
    console.log("接收者:", receiver);
  } catch (error) {
    console.error("获取用户id失败:", error);
    throw error;
  }
  const userId = receiver.id;
  const senderId = sender.id;
  const query = `
    INSERT INTO offline_messages (user_id, sender_id, receiver_id, sender, receiver, type, content, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    timestamp = NOW()
  `;
  try {
    await pool.query(query, [
      userId,
      senderId,
      userId,
      sender.name,
      receiver.name,
      message.type,
      message.content,
    ]);
    console.log("离线消息已保存", message);
  } catch (error) {
    console.error("更新离线消息失败:", error);
    throw error;
  }
};

// 消息转发函数
const forwardMessage = async (message) => {
  console.log("接收者名称:", message.receiver);
  const receiverId = await getUserIdByUsername(message.receiver);
  const senderId = message.user_id;
  const receiverWs = clients.get(receiverId);
  console.log("接收者:", receiverId);
  console.log("发送者:", senderId);
  // const receiverWs = clients.get(message.receiver);
  if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
    // 转发消息给接收者
    receiverWs.send(
      JSON.stringify({
        ...message,
        id: message.id,
      })
    );
    console.log(`消息已转发给 ${message.receiver}`);
  } else {
    console.log(`用户 ${message.receiver} 不在线`);
    await updateofflineMessage(message);
  }
};
const getUsernamesByIds = async (userIds) => {
  if (userIds.length === 0) return [];

  const query = `
    SELECT id, name
    FROM users
    WHERE id IN (?)
  `;
  try {
    const [rows] = await pool.query(query, [userIds]);
    return rows;
  } catch (error) {
    console.error("查询用户名失败:", error);
    throw error;
  }
};
// 查询好友列表函数
const getFriendsList = async (userId) => {
  const query = `
    SELECT friend_id AS friendId
    FROM friendships
    WHERE user_id = ? AND status = 'accepted'
    UNION
    SELECT user_id AS friendId
    FROM friendships
    WHERE friend_id = ? AND status = 'accepted'
  `;
  try {
    const [friends] = await pool.query(query, [userId, userId]);
    return friends.map((friend) => friend.friendId);
  } catch (error) {
    console.error("查询好友列表失败:", error);
    throw error;
  }
};
// 广播状态函数
const broadcastStatus = async (userId, username, status) => {
  const statusMessage = {
    type: "status",
    username: username,
    status: status,
    timestamp: new Date().getTime(),
  };

  try {
    // 获取好友列表
    const friendsList = await getFriendsList(userId);
    // 获取好友的用户名
    const friends = await getUsernamesByIds(friendsList);
    console.log(`用户 ${username} 的好友列表:`, friends);
    // 广播给所有在线好友
    friendsList.forEach((friendId) => {
      const ws = clients.get(friendId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(statusMessage));
          console.log(`已向 ${friendId} 发送 ${username} 的状态更新:`, status);
        } catch (error) {
          console.error(`向 ${friendId} 发送状态更新失败:`, error);
        }
      }
    });
  } catch (error) {
    console.error("广播状态更新失败:", error);
  }
};

// 添加心跳检测和状态广播
const heartbeatInterval = 10000; // 10秒一次心跳
const statusBroadcastInterval = 5000; // 5秒一次状态广播

// 心跳检测
setInterval(() => {
  clients.forEach((ws, userId) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clients.delete(userId);
      broadcastStatus(userId, "offline");
    }
  });
}, heartbeatInterval);

// 定期广播在线状态
setInterval(() => {
  clients.forEach((ws, userId) => {
    if (ws.readyState === WebSocket.OPEN) {
      // 查询该用户的所有好友
      const getFriendsQuery = `
        SELECT DISTINCT 
          CASE 
            WHEN f.user_id = (SELECT id FROM users WHERE name = ?) THEN f.friend_id
            ELSE f.user_id 
          END as friend_id,
          u.name as friend_name
        FROM friendships f
        JOIN users u ON (
          CASE 
            WHEN f.user_id = (SELECT id FROM users WHERE name = ?) THEN f.friend_id = u.id
            ELSE f.user_id = u.id
          END
        )
        WHERE (f.user_id = (SELECT id FROM users WHERE name = ?) OR f.friend_id = (SELECT id FROM users WHERE name = ?))
        AND f.status = 'accepted'
      `;

      connection.query(
        getFriendsQuery,
        [userId, userId, userId, userId],
        (err, friends) => {
          if (!err && friends) {
            friends.forEach((friend) => {
              const friendWs = clients.get(friend.friend_name);
              if (friendWs && friendWs.readyState === WebSocket.OPEN) {
                friendWs.send(
                  JSON.stringify({
                    type: "status",
                    username: userId,
                    status: "online",
                    timestamp: new Date().getTime(),
                  })
                );
              }
            });
          }
        }
      );
    }
  });
}, statusBroadcastInterval);

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
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE name = ? AND password = ?";
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "服务器错误" });
    }

    if (results.length > 0) {
      // 登录成功后，查询该用户的所有好友
      const getFriendsQuery = `
        SELECT DISTINCT 
          CASE 
            WHEN f.user_id = ? THEN f.friend_id
            ELSE f.user_id 
          END as friend_id,
          u.name as friend_name
        FROM friendships f
        JOIN users u ON (
          CASE 
            WHEN f.user_id = ? THEN f.friend_id = u.id
            ELSE f.user_id = u.id
          END
        )
        WHERE (f.user_id = ? OR f.friend_id = ?)
        AND f.status = 'accepted'
      `;

      connection.query(
        getFriendsQuery,
        [results[0].id, results[0].id, results[0].id, results[0].id],
        (err, friends) => {
          if (err) {
            console.error("查询好友失败:", err);
          } else {
            // 向所有在线好友广播该用户的在线状态
            friends.forEach((friend) => {
              const friendWs = clients.get(friend.friend_name);
              if (friendWs && friendWs.readyState === WebSocket.OPEN) {
                friendWs.send(
                  JSON.stringify({
                    type: "status",
                    username: username,
                    status: "online",
                    timestamp: new Date().getTime(),
                  })
                );
              }
            });
          }
        }
      );

      res.json({
        message: "登录成功",
        data: results[0],
      });
    } else {
      res.status(401).json({ message: "用户名或密码错误" });
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

//AI生成健身计划
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
                  "请识别这个食物的热量，热量要用准确数值表示，取一个你认为恰当的值即可，前面不需要加上大约等字样，并且严格按照以下JSON格式输出,如果有多种食物，一定要依次输出，仅输出JSON，不要添加其他内容：\n" +
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
      运动类型 AS type 
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
    身高：${height} cm，体重：${weight} kg，年龄：${age} 岁，运动类型：${activityType.replace(
    ",",
    " "
  )}，运动目标：${goal.replace(",", " ")}。
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

  // 从数据库获取用户信息
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

        // console.log("返回的好友列表:", formattedFriends); // 添加日志
        res.json(formattedFriends);
      }
    );
  });
});

// 添加好友接口
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


// 添加标记消息已读的函数
const notifyMessageRead = async (userId, friendId, message) => {
  try {
    // 更新数据库中的消息状态
    const query = `
      UPDATE messages 
      SET is_read = true 
      WHERE sender_id = ? AND receiver_id = ? AND is_read = false
    `;

    await pool.query(query, [friendId, userId]);

    // 获取在线用户的WebSocket连接
    const senderSocket = clients.get(friendId);

    // 如果发送者在线，发送已读回执
    if (senderSocket) {
      senderSocket.send(
        JSON.stringify({
          type: "read_ack",
          sender: message.sender,
          receiver: message.receiver,
          time: Date.now(),
        })
      );
    }

    return true;
  } catch (error) {
    console.error("标记消息已读失败:", error);
    return false;
  }
};

// 添加获取离线消息的函数
const getOfflineMessages = async (userId) => {
  try {
    // 查询所有未读的离线消息
    const query = `
      SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.sender,
        m.receiver,
        m.content,
        m.type,
        m.timestamp as time,
        u.name as sender,
        u2.name as receiver
      FROM offline_messages m
      JOIN users u ON m.sender_id = u.id
      JOIN users u2 ON m.user_id = u2.id
      WHERE m.user_id = ?
      ORDER BY m.timestamp ASC
    `;

    const [messages] = await pool.query(query, [userId]);

    if (messages.length > 0) {
      // 删除已发送的离线消息
      const deleteQuery = `
        DELETE FROM offline_messages 
        WHERE user_id = ?
      `;

      try {
        await pool.query(deleteQuery, [userId]);
        console.log(`已删除 ${messages.length} 条离线消息`);
      } catch (deleteError) {
        console.error("删除离线消息失败:", deleteError);
      }
    }

    return messages;
  } catch (error) {
    console.error("获取离线消息失败:", error);
    return [];
  }
};

// 添加删除好友接口
app.post("/friends/delete", async (req, res) => {
  const { userId, friendUsername } = req.body;
  console.log("收到删除好友请求:", req.body);

  if (!userId || !friendUsername) {
    return res.status(400).json({
      status: "error",
      message: "Missing required parameters"
    });
  }

  try {
    // 先查询要删除的好友的用户ID
    const [friendResults] = await pool.query(
      "SELECT id FROM users WHERE name = ?",
      [friendUsername]
    );

    if (friendResults.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Friend not found"
      });
    }

    // 查询发起删除的用户ID
    const [userResults] = await pool.query(
      "SELECT id FROM users WHERE name = ?",
      [userId]
    );

    if (userResults.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }

    const requesterId = userResults[0].id;
    const friendId = friendResults[0].id;

    // 开始事务
    await pool.query('START TRANSACTION');

    try {
      // 删除好友关系（双向删除）
      const deleteQuery = `
        DELETE FROM friendships 
        WHERE (user_id = ? AND friend_id = ?) 
        OR (user_id = ? AND friend_id = ?)
      `;
      await pool.query(deleteQuery, [requesterId, friendId, friendId, requesterId]);

      // 删除相关的聊天记录
      const deleteMessagesQuery = `
        DELETE FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) 
        OR (sender_id = ? AND receiver_id = ?)
      `;
      await pool.query(deleteMessagesQuery, [requesterId, friendId, friendId, requesterId]);

      // 删除离线消息
      const deleteOfflineMessagesQuery = `
        DELETE FROM offline_messages 
        WHERE (sender_id = ? AND receiver_id = ?) 
        OR (sender_id = ? AND receiver_id = ?)
      `;
      await pool.query(deleteOfflineMessagesQuery, [requesterId, friendId, friendId, requesterId]);

      // 提交事务
      await pool.query('COMMIT');

      // 如果好友在线，发送通知
      const friendSocket = clients.get(friendId);
      if (friendSocket) {
        friendSocket.send(JSON.stringify({
          type: 'friend_deleted',
          username: userId
        }));
      }

      res.json({
        status: "success",
        message: "Friend deleted successfully"
      });
    } catch (error) {
      // 如果出错，回滚事务
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("删除好友失败:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete friend"
    });
  }
});
