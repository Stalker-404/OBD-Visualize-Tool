const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// 解析大容量 JSON
app.use(express.json({ limit: '50mb' }));

// 读取 API 配置
const apiConfigPath = path.join(__dirname, 'api.json');
let apiConfig = {};
try {
    apiConfig = JSON.parse(fs.readFileSync(apiConfigPath, 'utf-8'));
} catch (err) {
    console.error('Failed to load api.json:', err.message);
}

app.post('/api/analyze', async (req, res) => {
    const requestId = Date.now().toString().slice(-6);
    console.log(`\n[${requestId}] >>> 收到新的分析请求`);
    
    const { model, messages } = req.body;
    
    // 从配置中获取对应模型的 API_KEY 和 API_URL
    const modelConfig = apiConfig[model];
    if (!modelConfig) {
        console.error(`[${requestId}] ❌ 无效的模型: ${model}`);
        return res.status(400).json({ error: 'Invalid model', detail: `Model '${model}' not found in api.json` });
    }
    
    const API_KEY = modelConfig.API_KEY;
    const API_URL = modelConfig.API_URL;
    
    const payloadSize = JSON.stringify(req.body).length / 1024;
    console.log(`[${requestId}] 模型: ${model}`);
    console.log(`[${requestId}] 消息轮数: ${messages ? messages.length : 0}`);
    console.log(`[${requestId}] 数据体大小: ${payloadSize.toFixed(2)} KB`);
    
    try {
        console.log(`[${requestId}] 正在向 AI 平台发起请求... URL: ${API_URL}`);
        
        const response = await axios({
            method: 'post',
            url: API_URL,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                model: model,
                messages: messages,
                stream: true,
            },
            responseType: 'stream',
            timeout: 30000
        });

        console.log(`[${requestId}] <<< AI 平台已响应! 状态码: ${response.status}`);

        let chunkCount = 0;
        response.data.on('data', (chunk) => {
            chunkCount++;
            if (chunkCount === 1) console.log(`[${requestId}] 开始传输首个数据分片...`);
            
            if (res.writable) {
                res.write(chunk);
            }
        });

        response.data.on('end', () => {
            console.log(`[${requestId}] √ AI 响应流结束，共传输 ${chunkCount} 个分片。`);
            res.end();
        });

        response.data.on('error', (err) => {
            console.error(`[${requestId}] 流传输过程中发生错误:`, err.message);
            if (!res.writableEnded) res.end();
        });

    } catch (error) {
        console.error(`[${requestId}] ❌ 请求处理失败:`);

        if (axios.isCancel(error)) {
            console.error(`[${requestId}] 原因: Axios 请求被主动取消 (通常是前端 AbortController 触发)`);
        } else if (error.response) {
            // API 供应商返回了错误码 (401, 429, 500等)
            console.error(`[${requestId}] 原因: AI 平台返回错误`);
            console.error(`[${requestId}] 状态码: ${error.response.status}`);
            
            // 尝试读取错误流中的详细信息
            error.response.data.on('data', (data) => {
                console.error(`[${requestId}] 错误详情: ${data.toString()}`);
            });
        } else if (error.code === 'ECONNABORTED') {
            console.error(`[${requestId}] 原因: 后端请求 AI 平台超时`);
        } else {
            console.error(`[${requestId}] 原因: ${error.message}`);
        }

        if (!res.headersSent) {
            res.status(500).json({ error: 'Backend Error', detail: error.message });
        } else {
            res.end();
        }
    }
});

app.listen(3000, '0.0.0.0', () => console.log('Debug Server running on port 3000'));