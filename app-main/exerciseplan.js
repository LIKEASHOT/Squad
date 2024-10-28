
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.post('/generateFitnessPlan', async (req, res) => {
    const { bmi, goal } = req.body;

    // 简单验证
    if (typeof bmi !== 'number' || typeof goal !== 'string') {
        return res.status(400).json({ error: '无效的请求数据' });
    }

    const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    const API_KEY = process.env.API_KEY;

    // 检查 API 密钥
    if (!API_KEY) {
        return res.status(500).json({ error: '缺少 API 密钥' });
    }

    try {
        const response = await axios.post(API_URL, {
            messages: [
                { role: "user", content: `我有一个 BMI 为 ${bmi} 的用户，他的目标是${goal}。请根据此信息生成一个合适的健身计划。` }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status !== 200) {
            throw new Error('API请求失败');
        }

        const fitnessPlan = response.data.choices[0].message.content;
        res.status(200).json({
            message: '健身计划生成成功',
            fitnessPlan
        });
    } catch (error) {
        console.error('生成健身计划出错:', error.message || error);
        res.status(500).json({ error: '生成健身计划失败' });
    }
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
