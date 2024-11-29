-- 1. 数据库创建和初始化
CREATE DATABASE Squad_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Squad_db;

-- 2. 用户相关表
-- 2.1 用户主表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    permission int NOT NULL,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    lastLogin DATETIME,
    -- 用户基本信息
    gender VARCHAR(10),
    age INT,
    height FLOAT,
    weight FLOAT,
    bmi FLOAT,
    -- 健身相关信息
    fitnessGoal VARCHAR(255),
    exerciseType VARCHAR(255),
    goalid VARCHAR(255), 
    calories_goal int DEFAULT 100,                        --目标热量,默认100卡
    sport_time_goal int DEFAULT 20,                 BIGINT      --目标运动时间,默认20min
    avatar VARCHAR(255),                 -- 头像 URL，最大长度 255
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 注册时间，默认当前时间
);
--记录运动时长
CREATE TABLE exercise_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  exercise_duration INT DEFAULT 0,
  daily_calories INT DEFAULT 0
);

-- 2.2 用户在线状态表
CREATE TABLE user_status (
    user_id INT PRIMARY KEY,
    is_online BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. 社交相关表
-- 3.1 消息表
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    sender VARCHAR(50) NOT NULL,
    receiver VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text',
    message_data json,
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender_receiver (sender_id, receiver_id),
    INDEX idx_timestamp (timestamp)
);

-- 3.2 离线消息表
DROP TABLE IF EXISTS offline_messages;
CREATE TABLE offline_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender VARCHAR(50) NOT NULL,
    receiver VARCHAR(50) NOT NULL,
    type VARCHAR(20) DEFAULT 'text',
    content TEXT NOT NULL,
    message_data json,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3.3 好友关系表
CREATE TABLE friendships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'blocked') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_user_friend (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3.4 好友请求表
CREATE TABLE friend_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. 运动健身相关表
-- 4.1 运动目标表
CREATE TABLE goal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `名称` VARCHAR(100) NOT NULL,
    `运动次数` VARCHAR(255),
    `难度` VARCHAR(255) NOT NULL,
    `卡路里` FLOAT NOT NULL,
    `B站连接` VARCHAR(255),
    `目标` VARCHAR(100),
    `运动类型` VARCHAR(100),
    `时间` INT,
    `image_url` varchar(255) NOT NULL,
    `video_url` varchar(255) NOT NULL DEFAULT 'https://www.bilibili.com'
);

-- 4.2 食物记录表
CREATE TABLE food_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    record_date DATE NOT NULL,
    food_name VARCHAR(255) NOT NULL,
    base_calories FLOAT NOT NULL,
    amount FLOAT NOT NULL DEFAULT 100,
    current_calories FLOAT NOT NULL,
    image_url VARCHAR(255),
    time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- 记录运动时长
CREATE TABLE exercise_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  exercise_duration INT DEFAULT 0
);
-- 挑战记录
CREATE TABLE challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invitation_id BIGINT NOT NULL, -- 邀请信息ID
  challenger_id INT NOT NULL, -- 邀请者ID
  challenged_id INT NOT NULL, -- 接受者ID
  start_time BIGINT NOT NULL, -- 挑战开始时间（使用时间戳）
  duration INT NOT NULL, -- 挑战持续时间（天数）
  goal_minutes INT NOT NULL, -- 每天目标分钟数
  goal_calories INT NOT NULL, -- 每天目标卡路里数
  status ENUM('active', 'completed', 'failed') NOT NULL, -- 挑战状态
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 记录创建时间
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 记录更新时间
  FOREIGN KEY (challenger_id) REFERENCES users(id), -- 假设有一个 users 表
  FOREIGN KEY (challenged_id) REFERENCES users(id) -- 假设有一个 users 表
);
-- 5. 创建索引
CREATE INDEX idx_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_timestamp ON messages(timestamp);
CREATE INDEX idx_status ON friendships(status);
CREATE INDEX idx_user_id ON offline_messages(user_id);
CREATE INDEX idx_sender_id ON offline_messages(sender_id);
CREATE INDEX idx_timestamp ON offline_messages(timestamp);

-- 6. 初始数据插入
-- 6.1 添加管理员账号
INSERT INTO users (id, Permission, name, password) 
VALUES (1, 0, 'admin', '123');

-- 6.2 添加运动目标数据
INSERT INTO goal (id, `名称`, `运动次数`, `难度`, `卡路里`, `B站连接`, `目标`, `运动类型`, `时间` ,`image_url`)
VALUES 
(1, '有氧拳击HIIT', '两天一次', '适中', 145, 'BV1Hh4y1i73e', '减脂, 耐力, 综合健身', '徒手', 15 ,"uploads/1.jpg"),
(2, '强化核心力量', '两天一次', '困难', 87, 'BV1k94y1f7Vr', '减脂, 增肌, 耐力, 柔韧性', '徒手', 8.5,"uploads/2.jpg"),
(3, '大臂增粗', '两天一次', '适中', 96, 'BV1tP4y137Fc', '增肌, 减脂, 耐力', '撸铁', 10,"uploads/3.jpg"),
(4, '八段锦', '每天一次', '简单', 68, 'BV1ak4y1g79j', '柔韧性, 综合健身', '瑜伽', 12,"uploads/4.jpg"),
(5, '哑铃全身训练', '每天一次', '简单', 88, 'BV1fv41167Bt', '增肌, 耐力, 综合健身', '撸铁', 7,"uploads/5.jpg"),
(6, '小臂增粗', '两天一次', '适中', 87, 'BV1Qg411k7TD', '增肌, 耐力', '撸铁', 10,"uploads/6.jpg"),
(7, '轰炸腿臀肌肉', '两天一次', '困难', 156, 'BV11g4y1j7Ma', '减脂, 增肌, 耐力', '徒手', 18,"uploads/7.jpg"),
(8, '弹力带训练', '每天一次', '适中', 98, 'BV1ZT4y1U7vX', '减脂, 耐力, 柔韧性, 综合健身', '徒手', 20,"uploads/8.jpg"),
(9, '高效跳绳减脂', '每天一次', '简单', 119, 'BV11m4y1d7xy', '减脂, 耐力, 综合健身', '徒手', 17,"uploads/9.jpg"),
(10, '俯卧撑训练', '两天一次', '困难', 112, 'BV1LL411V7XF', '增肌, 减脂, 耐力', '徒手', 10,"uploads/10.jpg"),
(11, '腹部减脂', '每天一次', '简单', 75, 'BV1uA411378Z', '减脂, 耐力, 柔韧性', '徒手', 10,"uploads/11.jpg"),
(12, '哑铃全身增肌', '每天一次', '困难', 198, 'BV1Um4y1u7jk', '增肌, 耐力, 综合健身', '撸铁', 36,"uploads/12.jpg"),
(13, '哑铃肩部增肌', '两天一次', '简单', 78, 'BV1ft4y1H7jS', '增肌, 柔韧性', '撸铁', 10,"uploads/13.jpg"),
(14, '哑铃全身减脂', '两天一次', '适中', 99, 'BV1Ea4y1c7B2', '增肌, 减脂, 耐力, 综合健身', '撸铁', 20,"uploads/14.jpg"),
(15, '轰炸腹肌瑜伽', '每天一次', '简单', 42, 'BV1N54y1y7RW', '柔韧性, 综合健身', '瑜伽', 21,"uploads/15.jpg"),
(16, '缓解酸痛瑜伽', '每天一次', '适中', 69, 'BV1ch41197gd', '耐力, 柔韧性, 综合健身', '瑜伽', 17,"uploads/16.jpg"),
(17, '缓解久坐瑜伽', '每天一次', '适中', 70, 'BV17V411y7Eh', '柔韧性, 综合健身', '瑜伽', 15,"uploads/17.jpg"),
(18, '改善驼背瑜伽', '每天一次', '适中', 65, 'BV1AU4y1K7Qq', '柔韧性, 综合健身', '瑜伽', 12,"uploads/18.jpg"),
(19, '燃脂跑', '两天一次', '困难', 378, 'BV1pV411M7vr', '减脂, 耐力, 综合健身', '跑步', 30,"uploads/19.jpg"),
(20, '30分钟超慢跑', '每天一次', '简单', 198, 'BV1Nj411j7s5', '减脂, 耐力, 综合健身', '跑步', 30,"uploads/20.jpg"),
(21, '40分钟舒缓跑', '两天一次', '适中', 245, 'BV141421k7Fs', '减脂, 耐力, 综合健身', '跑步', 40,"uploads/21.jpg"),
(22, '30分钟舒缓跑', '两天一次', '困难', 297, 'BV1of421B7Bd', '减脂, 耐力, 综合健身', '跑步', 30,"uploads/22.jpg"),
(23, '20分钟舒缓跑', '每天一次', '简单', 166, 'BV1D4421f7vr', '减脂, 耐力, 综合健身', '跑步', 20,"uploads/23.jpg"),
(24, '10分钟运球训练', '每天一次', '简单', 78, 'BV1rT1dY1ERh', '耐力, 柔韧性, 综合健身', '篮球', 10,"uploads/24.jpg"),
(25, '后卫得分训练', '每天一次', '简单', 56, 'BV1eb4y1U74m', '耐力, 柔韧性, 综合健身', '篮球', 6,"uploads/25.jpg"),
(26, '进阶运球训练', '每天一次', '适中', 123, 'BV1UG41137Ru', '耐力, 柔韧性, 综合健身', '篮球', 12,"uploads/26.jpg"),
(27, '篮球综合计划', '每天一次', '困难', 165, 'BV12b4y1y71y', '耐力, 柔韧性, 减脂, 综合健身', '篮球', 16,"uploads/27.jpg"),
(28, '脚步训练', '每天一次', '适中', 134, 'BV1Fu4y117YJ', '耐力, 柔韧性, 减脂, 综合健身', '篮球', 11,"uploads/28.jpg"),
(29, '篮下终结训练', '每天一次', '简单', 43, 'BV1y94y1e7uc', '耐力, 柔韧性, 综合健身', '篮球', 5,"uploads/29.jpg"),
(30, '精英防守训练', '每天一次', '困难', 167, 'BV1Sh411G746', '耐力, 柔韧性, 减脂, 综合健身', '篮球', 15,"uploads/30.jpg");