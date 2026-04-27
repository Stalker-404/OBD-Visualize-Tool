# 车辆OBD数据流可视化工具

## 声明：本软件由Vibe Coding开发
特别鸣谢：Github Copilot, CodeX, Cursor, Google Gemini 

## 截图
| 折线图 | 2D散点图 | 3D散点图 | AI辅助分析 |
|  ---- | ---- | ---- | ---- |
| <img src="image/screenshot-1.png" alt="折线图" style="width: 300px; height: auto;">  | <img src="image/screenshot-2.png" alt="2D散点图" style="width: 300px; height: auto;"> | <img src="image/screenshot-3.png" alt="3D散点图" style="width: 300px; height: auto;"> | <img src="image/screenshot-4.png" alt="AI辅助分析" style="width: 300px; height: auto;"> |

## 功能
- [x] 读取OBD记录的csv终端数据流
- [x] 绘制折线图
- [x] 绘制2D散点图
- [x] 绘制3D散点图
- [x] 导出透明背景图片
- [x] 将图窗数据导入AI大模型辅助分析

## TODO
- [ ] AI辅助数据清洗

## 软件架构
1. **前端：** 静态HTML网页，Nginx 驱动（**默认12315端口**）
2. **后端：** 大模型API，Node.js驱动 + Nginx 反向代理

## Docker部署
### 拉取仓库

```bash
git clone https://github.com/Stalker-404/OBD-Visualize-Tool.git
cd OBD-Visualize-Tool 
```
### 前端配置
1. **建立配置文件：** 建立`config.json`配置文件，格式参考`frontend/config.json.example`

```bash
cp frontend/config.json.example frontend/config.json
vim frontend/config.json
```

2. `config.json`配置文件全文参考如下

```JavaScript
{
    //配置AI分析中可供选择的大模型列表
    "LLMmodels": [
        {
            //模型名称，需与后端api.json保持一致
            "value": "deepseek-v3-2-251201",
            //显示在网页上的模型名称
            "label": "DeepSeek V3.2",
            //上下文长度限制
            "tokenLimit": 128000
        },
        {
            "value": "doubao-seed-2-0-lite-260215",
            "label": "豆包2.0 Lite",
            "tokenLimit": 128000
        }
    ],
    //配置网页显示的标题
    "Branding": {
        //浏览器标题
        "pageTitle": "OBD数据可视化工具",
        //网页Header主标题
        "appTitle": "OBD数据可视化工具",
        //网页Headr副标题
        "appSubtitle": "V1.0"
    },
    //配置文件模板，方便快速解析csv数据
    "FileTemplate": [
        {
            // 模板id
            "value": "carscanner",
            // 网页上显示的下拉选项名称
            "label": "CarScanner",
            // csv表头所在行
            "headerRow": 1,
            // csv有效数据起始行
            "dataRow": 2,
            // csv时间所在列
            "timeColumn": 1,
            // csv编码格式
            "headerEncode": "UTF-8"
        },
        {
            "value": "ha",
            "label": "Hybrid Assistant",
            "headerRow": 1,
            "dataRow": 2,
            "timeColumn": 2,
            "headerEncode": "UTF-8"
        }
    ],
    //网页访问密码，留空则跳过密码验证
    "password": "password"
}
```
1. **导入LOGO：** 将希望显示在网页Header左上角的PNG格式图片放入 `frontend/src/icon` 文件夹，命名logo.png,也可以使用默认的logo


```bash
cp frontend/src/icon/logo.png.example frontend/src/icon/logo.png
```

### 后端配置
1. **建立配置文件：** 建立`api.json`配置文件，格式参考`backend/api.json.example`

```bash
cp backend/api.json.example backend/api.json
vim frontend/config.json
```

2. `api.json`配置文件全文参考如下

```JavaScript
{
    //大模型的model参数，与前端config.json中LLMmodels里的value保持一致
    "deepseek-v3-2-251201": {
        //API密钥
        "API_KEY": "YOUR_API_KEY_HERE",
        //API地址
        "API_URL": "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
    },
    "doubao-seed-2-0-lite-260215": {
        "API_KEY": "YOUR_API_KEY_HERE",
        "API_URL": "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
    }
}
```
### Docker运行

1. **读取权限：** 为确保前端能被Nginx正常驱动，请赋予frontend文件夹读写权限

```bash
chmod -R 755 frontend
```

2. **配置证书：** 如需HTTPS访问请自行配置`nginx\default.conf`，这里不再赘述

3. **通过compose运行容器**

```bash
docker-compose up -d
```

4. **访问地址:** 网址+12315端口，如 [192.168.31.99:12315](192.168.31.99:12315)
