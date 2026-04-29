// 全局变量定义
let rawData = [];              // 存储原始CSV数据
let headers = [];              // 存储CSV列名
let chart = null;              // Chart.js实例
let activeTab = 'line';        // 当前活动标签页
let firstTimestamp = 0;        // 第一个时间戳
let totalTimeRange = { min: 0, max: 0 }; // 总时间范围
let isChartRst = false;        //是否重置绘图窗口
let previousCount = 0;         //记录上一时刻折线图勾选的数量
let chatHistory = [];          //历史消息结构体
let selectedModel = null;        // 当前选择的AI模型
let config = null;             // 配置文件
const refs = {};
const uiState = {
    importSettings: {
        headerRow: 1,
        dataRow: 2,
        timeColumn: 1,
        fileEncoding: "UTF-8"
    },
    attachDataEnabled: true,
    selectedFileName: "未选择文件"
};

// 初始化页面控件引用缓存，避免在业务逻辑中重复查询 DOM
function initRefs() {
    refs.headerRow = document.getElementById('headerRow'); // 表头所在行输入框
    refs.dataRow = document.getElementById('dataRow'); // 数据起始行输入框
    refs.timeColumn = document.getElementById('timeColumn'); // 时间列输入框
    refs.fileEncoding = document.getElementById('fileEncoding'); // 文件编码下拉框
    refs.enableCursor = document.getElementById('enableCursor'); // 光标线开关复选框
    refs.btnLine = document.getElementById('btnLine'); // 折线图标签按钮
    refs.btnScatter = document.getElementById('btnScatter'); // 散点图标签按钮
    refs.btnScatter3D = document.getElementById('btnScatter3D'); // 3D散点图标签按钮
    refs.lineControls = document.getElementById('lineControls'); // 折线图控制面板
    refs.scatterControls = document.getElementById('scatterControls'); // 2D散点图控制面板
    refs.scatter3DControls = document.getElementById('scatter3DControls'); // 3D散点图控制面板
    refs.sliderContainer = document.getElementById('sliderContainer'); // 时间滑块容器
    refs.cursorValuePanel = document.getElementById('cursorValuePanel'); // 光标悬停数值面板
    refs.csvFile = document.getElementById('csvFile'); // CSV 文件选择输入框
    refs.columnList = document.getElementById('columnList'); // 列选择列表容器
    refs.scatterX = document.getElementById('scatterX'); // 2D散点图 X 轴列下拉框
    refs.scatterY = document.getElementById('scatterY'); // 2D散点图 Y 轴列下拉框
    refs.scatterStatsTitle = document.getElementById('scatterStatsTitle'); // 2D散点图统计标题
    refs.scatterStatMean = document.getElementById('scatterStatMean'); // 2D散点图 Y 轴平均值
    refs.scatterStatMedian = document.getElementById('scatterStatMedian'); // 2D散点图 Y 轴中位数
    refs.scatterStatP75 = document.getElementById('scatterStatP75'); // 2D散点图 Y 轴75%分位数
    refs.scatterStatP25 = document.getElementById('scatterStatP25'); // 2D散点图 Y 轴25%分位数
    refs.scatterStatMax = document.getElementById('scatterStatMax'); // 2D散点图 Y 轴最大值
    refs.scatterStatMin = document.getElementById('scatterStatMin'); // 2D散点图 Y 轴最小值
    refs.scatter3DX = document.getElementById('scatter3DX'); // 3D散点图 X 轴列下拉框
    refs.scatter3DY = document.getElementById('scatter3DY'); // 3D散点图 Y 轴列下拉框
    refs.scatter3DZ = document.getElementById('scatter3DZ'); // 3D散点图 Z 轴列下拉框
    refs.scatter3DColorScale = document.getElementById('scatter3DColorScale'); // 3D散点图颜色系列下拉框
    refs.columnSearch = document.getElementById('columnSearch'); // 列筛选搜索输入框
    refs.filterList = document.getElementById('filterList'); // 2D散点图过滤条件列表容器
    refs.filterList3D = document.getElementById('filterList3D'); // 3D散点图过滤条件列表容器
    refs.mainChart = document.getElementById('mainChart'); // 主图表 Canvas
    refs.mainChart3D = document.getElementById('mainChart3D'); // 3D散点图渲染容器
    refs.leftAxisName = document.getElementById('leftAxisName'); // 左轴名称输入框
    refs.rightAxisName = document.getElementById('rightAxisName'); // 右轴名称输入框
    refs.separateCurves = document.getElementById('separateCurves'); // 分离曲线显示开关
    refs.absTime = document.getElementById('absTime'); // 相对时间/绝对时间开关
    refs.yMin = document.getElementById('yMin'); // 左轴最小值输入框
    refs.yMax = document.getElementById('yMax'); // 左轴最大值输入框
    refs.y1Min = document.getElementById('y1Min'); // 右轴最小值输入框
    refs.y1Max = document.getElementById('y1Max'); // 右轴最大值输入框
    refs.timeSlider = document.getElementById('timeSlider'); // 时间范围滑块
    refs.timeStart = document.getElementById('timeStart'); // 时间起点标签
    refs.timeEnd = document.getElementById('timeEnd'); // 时间终点标签
    refs.aiPrompt = document.getElementById('aiPrompt'); // AI 指令输入框
    refs.aiOutput = document.getElementById('aiOutput'); // AI 输出展示区域
    refs.aiStatus = document.getElementById('aiStatus'); // AI 状态文本
    refs.sendBtn = document.getElementById('sendBtn'); // 发送分析按钮
    refs.stopBtn = document.getElementById('stopBtn'); // 停止生成按钮
    refs.clearBtn = document.getElementById('clearBtn'); // 清空对话按钮
    refs.aiResponseContainer = document.getElementById('aiResponseContainer'); // AI 输出容器
    refs.aiModelSelect = document.getElementById('aiModelSelect'); // AI 模型选择下拉框
    refs.attachDataState = document.getElementById('attachDataState'); // 附带数据开关复选框
    refs.attachIcon = document.getElementById('attachIcon'); // 附带数据开关图标
    refs.attachText = document.getElementById('attachText'); // 附带数据开关文本
    refs.fileNameDisplay = document.getElementById('fileNameDisplay'); // 选中文件名显示文本
    refs.templateSelector = document.getElementById('templateSelector'); // 文件模板下拉菜单
    refs.appTitle = document.getElementById('appTitle'); // 页面主标题
    refs.appSubtitle = document.getElementById('appSubtitle'); // 页面副标题
}

// 将导入配置状态写回界面（表头行、数据起始行、编码）
function renderImportSettings() {
    refs.headerRow.value = uiState.importSettings.headerRow;
    refs.dataRow.value = uiState.importSettings.dataRow;
    refs.timeColumn.value = uiState.importSettings.timeColumn;
    refs.fileEncoding.value = uiState.importSettings.fileEncoding;
}

// 从界面读取导入配置，回写到状态对象
function syncImportSettingsFromView() {
    uiState.importSettings.headerRow = parseInt(refs.headerRow.value) || 1;
    uiState.importSettings.dataRow = parseInt(refs.dataRow.value) || 2;
    uiState.importSettings.timeColumn = parseInt(refs.timeColumn.value) || 1;
    uiState.importSettings.fileEncoding = refs.fileEncoding.value || "UTF-8";
}

// 根据状态渲染“附带数据”开关及其图标/文字样式
function renderAttachDataState() {
    refs.attachDataState.checked = uiState.attachDataEnabled;
    refs.attachIcon.classList.toggle('text-blue-600', uiState.attachDataEnabled);
    refs.attachIcon.classList.toggle('text-slate-400', !uiState.attachDataEnabled);
    refs.attachText.classList.toggle('text-blue-600', uiState.attachDataEnabled);
    refs.attachText.classList.toggle('text-slate-400', !uiState.attachDataEnabled);
}

// 根据状态渲染已选文件名与其颜色状态
function renderFileNameState() {
    refs.fileNameDisplay.textContent = uiState.selectedFileName;
    refs.fileNameDisplay.classList.toggle('text-slate-700', uiState.selectedFileName !== "未选择文件");
    refs.fileNameDisplay.classList.toggle('text-slate-500', uiState.selectedFileName === "未选择文件");
}

// 应用页面品牌信息（标题、主标题、副标题）
function applyBranding(config) {
    const branding = config.Branding || {};
    const pageTitle = branding.pageTitle || 'OBD数据可视化工具';
    const appTitle = branding.appTitle || 'OBD数据可视化工具';
    const appSubtitle = branding.appSubtitle || '测试版本';

    document.title = pageTitle;
    if (refs.appTitle) refs.appTitle.textContent = appTitle;
    if (refs.appSubtitle) refs.appSubtitle.textContent = appSubtitle;
}

// 加载配置文件并填充下拉菜单
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        // 填充 AI 模型选项
        const aiSelect = refs.aiModelSelect;
        aiSelect.innerHTML = '';
        config.LLMmodels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.label;
            option.dataset.tokenLimit = model.tokenLimit || 128000;
            aiSelect.appendChild(option);
        });
        // 填充文件模板选项
        refs.templateSelector.innerHTML = '<option value="" disabled selected>套用数据模板</option>';
        config.FileTemplate.forEach(template => {
            const option = document.createElement('option');
            option.value = template.value;
            option.textContent = template.label;
            refs.templateSelector.appendChild(option);
        });
        applyBranding(config);
        return config;
    } catch (error) {
        console.error('Failed to load config:', error);
        return null;
    }
}

// 页面初始化入口
initRefs();                                              //初始化控件引用
syncImportSettingsFromView();                            //同步导入设置状态
uiState.attachDataEnabled = refs.attachDataState.checked;//同步附带数据开关状态
renderAttachDataState();                                 //渲染附带数据开关状态
renderFileNameState();                                   //渲染文件名显示状态

// 异步加载配置并检查密码
(async () => {
    await loadConfig();
    checkPassword();
})();

// 密码验证函数
function checkPassword() {
    const passwordModal = document.getElementById('passwordModal');
    const mainContent = document.getElementById('mainContent');
    const passwordInput = document.getElementById('passwordInput');
    const passwordSubmit = document.getElementById('passwordSubmit');
    const passwordError = document.getElementById('passwordError');

    if (!config || !config.password || config.password.trim() === '') {
        // 密码为空，跳过验证
        passwordModal.classList.add('hidden');
        mainContent.classList.remove('hidden');
        return;
    }

    // 显示密码界面
    passwordModal.classList.remove('hidden');
    mainContent.classList.add('hidden');

    // 绑定提交事件
    passwordSubmit.onclick = () => {
        const enteredPassword = passwordInput.value.trim();
        if (enteredPassword === config.password) {
            passwordModal.classList.add('hidden');
            mainContent.classList.remove('hidden');
        } else {
            passwordError.classList.remove('hidden');
            passwordInput.value = '';
            passwordInput.focus();
        }
    };

    // 回车键提交
    passwordInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            passwordSubmit.click();
        }
    };
}

//计算复选框的数量并决定是否完全重绘
function countCharts(){
    const currentCount = document.querySelectorAll('.col-check:checked').length;

    //从有到无或从无到有时重置图表，避免残留痕迹
    if (currentCount < previousCount && currentCount === 0) {
        rstCharts();
        } 
    else if (currentCount > previousCount && currentCount === 1) {
        rstCharts();
        }
    //其他情况只更新数据，不重置图表
    else{updateCharts();
        }
    previousCount = currentCount;
}

//需要完全重绘时激活此函数
function rstCharts(){
    isChartRst = true;
    updateCharts();
    isChartRst = false;
}

function resetOrRefreshChart() {
    if (activeTab === 'line') {
        rstCharts();
    } else {
        updateCharts();
    }
}

// 根据选择的数据模板自动设置配置
function handleSelectionChange(mode) {
    const template = config.FileTemplate.find(t => t.value === mode);
    if (template) {
        uiState.importSettings.headerRow = template.headerRow;
        uiState.importSettings.dataRow = template.dataRow;
        uiState.importSettings.timeColumn = template.timeColumn;
        uiState.importSettings.fileEncoding = template.headerEncode;
        renderImportSettings();
    }
}

// 自定义插件：绘制光标线
const cursorPlugin = {
    id: 'cursorPlugin',
    afterDraw: (chart) => {
        // 检查是否启用光标和当前是否为折线图模式
        if (!refs.enableCursor.checked || activeTab !== 'line' || !chart.cursorX) return;
        const {ctx, chartArea: {top, bottom}} = chart;
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 2; ctx.strokeStyle = '#ef4444'; ctx.setLineDash([6, 4]);
        ctx.moveTo(chart.cursorX, top); ctx.lineTo(chart.cursorX, bottom);
        ctx.stroke(); ctx.restore();
    }
};

// 切换标签页，根据选择显示不同的图表和控制面板
function switchTab(tab) {
    const prevTab = activeTab;
    activeTab = tab;
    refs.btnLine.classList.toggle('active', tab === 'line');
    refs.btnScatter.classList.toggle('active', tab === 'scatter');
    refs.btnScatter3D.classList.toggle('active', tab === 'scatter3d');
    refs.lineControls.classList.toggle('hidden', tab !== 'line');
    refs.scatterControls.classList.toggle('hidden', tab !== 'scatter');
    refs.scatter3DControls.classList.toggle('hidden', tab !== 'scatter3d');
    refs.sliderContainer.classList.toggle('hidden', tab !== 'line');
    refs.cursorValuePanel.classList.add('hidden');

    if (tab === 'line' && prevTab !== 'line') {
        rstCharts();
        return;
    }
    updateCharts();
}

// 解析时间字符串支持多种格式（纯秒数、HH:mm:ss.SSS、带单位的时间字符串等）
function parseTimeString(str) {
    if (str === null || str === undefined) return 0;// 处理 null 或 undefined 输入
    let cleanStr = String(str).replace(/"/g, '').trim();// 去除引号和两端空白
    
    // 如果字符串中包含空格，取最后一个部分（假设是时间部分）
    if (cleanStr.includes(' ')) {
        cleanStr = cleanStr.split(/\s+/)[1]; 
    }
    
    // 如果字符串中不包含冒号，尝试直接解析数字后的单位(s/ms/m/h)，无单位默认为秒
    if (!cleanStr.includes(':')) {

        let unit = null;
        let value = null;
        
        // 如果表头包含时间单位提示，优先按照表头单位解析,例如表头为 "Time_ms" 则解析 "150" 为 0.15 秒
        if (headers.length > 0) {
        const unitHeaderMatch = headers[0].match(/(_ms|_s|m|_h|\(s\)|\(ms\)|\(m\)|\(h\))$/);
            if (unitHeaderMatch) {
                unit = unitHeaderMatch[1].toLowerCase();
            }
        }

        // 尝试匹配时间列中的纯数字字符串，如果表头有单位则按照表头单位解析，否则默认为秒
        const pureNumberMatch = cleanStr.match(/^[0-9]+(?:\.[0-9]+)?/);
        if (pureNumberMatch) {
            value = parseFloat(pureNumberMatch[0]) || 0; // 解析数值部分，如果解析失败则默认为0
            if (unit === 'ms' || unit === '(ms)') return value / 1000;
            if (unit === 's'  || unit === '(s)')  return value;
            if (unit === 'm'  || unit === '(m)')  return value * 60;
            if (unit === 'h'  || unit === '(h)')  return value * 3600;
        }

        // 尝试匹配时间列中的数值+单位格式，例如 "150ms"、"2.5s"、"1m"、"0.5h"，提取单位并转换为秒
        const unitMatch = cleanStr.match(/(ms|s|m|h)$/i);
        if (unitMatch) {
            // 优先使用表头单位，如果表头没有单位再使用时间字符串中的单位进行转换
            if(!unit){
                unit = unitMatch[1].toLowerCase();
                console.warn(`时间字符串单位提取成功`);
                if (unit === 'ms') return value / 1000;
                if (unit === 's')  return value;
                if (unit === 'm')  return value * 60;
                if (unit === 'h')  return value * 3600;
            }
                return parseFloat(cleanStr) || 0; // 如果无法识别单位，尝试直接解析数值部分
        }
    }

    const parts = cleanStr.split(':');
    if (parts.length < 3) {
        return parseFloat(cleanStr) || 0;
    }

    const h = parseFloat(parts[0]) || 0; // 小时部分,如果解析失败则默认为0
    const m = parseFloat(parts[1]) || 0; // 分钟部分,如果解析失败则默认为0
    const sParts = parts[2].split('.');  // 秒和毫秒部分,如果没有小数点则秒部分为整个字符串
    const s = parseFloat(sParts[0]) || 0;// 秒部分,如果解析失败则默认为0
    let ms = 0;

    // 如果存在毫秒部分，解析并转换为秒，如果解析失败则默认为0
    if (sParts.length > 1) {
        ms = parseFloat(sParts[1]) / Math.pow(10, sParts[1].length);
    }

    // 将小时、分钟、秒和毫秒转换为总秒数
    return h * 3600 + m * 60 + s + ms;
}

// 格式化时间显示，根据当前是相对时间还是绝对时间切换显示格式
function formatTime(value) {
    if (refs.absTime.checked) {
        return value.toFixed(3) + 's';
    } else {
        const hours = Math.floor(value / 3600);             // 小时部分
        const minutes = Math.floor((value % 3600) / 60);    // 分钟部分
        const seconds = Math.floor(value % 60);             // 秒部分
        const milliseconds = Math.floor((value % 1) * 1000);// 毫秒部分
        // 格式化为 HH:mm:ss.SSS 格式，确保各部分位数正确
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
}

// 解析时间范围输入框中的值；相对时间模式下默认按秒处理，避免被表头单位推断影响
function parseTimeRangeInput(value) {
    const text = String(value ?? '').trim();
    if (!text) return NaN;

    if (!refs.absTime.checked) {
        return parseTimeString(text);
    }

    if (text.includes(':')) {
        return parseTimeString(text);
    }

    const unitMatch = text.match(/^(-?\d+(?:\.\d+)?)(ms|s|m|h)?$/i);
    if (!unitMatch) return NaN;

    const amount = parseFloat(unitMatch[1]);
    const unit = (unitMatch[2] || 's').toLowerCase();

    if (!Number.isFinite(amount)) return NaN;
    if (unit === 'ms') return amount / 1000;
    if (unit === 'm') return amount * 60;
    if (unit === 'h') return amount * 3600;
    return amount;
}

function clampTimeRangeValue(value) {
    return Math.min(totalTimeRange.max, Math.max(totalTimeRange.min, value));
}

function applyTimeRangeInputs() {
    if (!chart || activeTab !== 'line' || !chart.scales.x) return;

    const parsedStart = parseTimeRangeInput(refs.timeStart.value);
    const parsedEnd = parseTimeRangeInput(refs.timeEnd.value);

    if (!Number.isFinite(parsedStart) || !Number.isFinite(parsedEnd)) {
        updateTimeLabels();
        return;
    }

    let newMin = clampTimeRangeValue(parsedStart);
    let newMax = clampTimeRangeValue(parsedEnd);

    if (newMin > newMax) {
        [newMin, newMax] = [newMax, newMin];
    }

    if (newMin === newMax) {
        updateTimeLabels();
        return;
    }

    chart.options.scales.x.min = newMin;
    chart.options.scales.x.max = newMax;
    chart.update('none');
    syncSliderToChart();
}

// 解析CSV文件
function parseCSV() {
    syncImportSettingsFromView();
    const file = refs.csvFile.files[0];
    const headerRowSetting = uiState.importSettings.headerRow;
    const headerIndex = (headerRowSetting > 0 ? headerRowSetting : 1) - 1; 
    const dataRowSetting = uiState.importSettings.dataRow;
    const dataIndex = (dataRowSetting > headerRowSetting ? dataRowSetting : headerRowSetting + 1) - 1;
    const timeColumnSetting = uiState.importSettings.timeColumn;
    const timeColumnIndex = (timeColumnSetting > 0 ? timeColumnSetting : 1) - 1; 
    if (!file) return alert("请先选择文件");

    Papa.parse(file, {
        header: false,
        dynamicTyping: true,
        skipEmptyLines: true,
        encoding: uiState.importSettings.fileEncoding, 
        complete: function(results) {
            const allData = results.data;
            if (allData.length <= headerIndex) {
                return alert("读取到的行数不足，请检查表头行设置是否正确");
            }
            // 提取表头并去除多余空白
            headers = allData[headerIndex].map(h => h ? String(h).trim() : "");
            // 提取数据行
            rawData = allData.slice(dataIndex).filter(row => row.length > 0);
            // 重新排列 headers 和 rawData，将 timeColumnIndex 列移到首列
            if (timeColumnIndex > 0) {
                // 移动 headers
                const timeHeader = headers.splice(timeColumnIndex, 1)[0];
                headers.unshift(timeHeader);
                // 移动 rawData 的每一行
                rawData.forEach(row => {
                    const timeValue = row.splice(timeColumnIndex, 1)[0];
                    row.unshift(timeValue);
                });
            }
            if (rawData.length > 0) {
                try {
                    // 解析第一个时间戳以确定时间基准
                    firstTimestamp = parseTimeString(rawData[0][0]);
                    initControls();
                    switchTab('line');
                } catch (e) {
                    alert("时间数据解析失败");
                }
            } else {
                alert("解析到的数据行为空");
            }
        }
    });
}

// 初始化列控件
function initControls() {
    const colList = refs.columnList;
    const sX = refs.scatterX;
    const sY = refs.scatterY;
    const s3DX = refs.scatter3DX;
    const s3DY = refs.scatter3DY;
    const s3DZ = refs.scatter3DZ;
    colList.innerHTML = ''; sX.innerHTML = ''; sY.innerHTML = ''; s3DX.innerHTML = ''; s3DY.innerHTML = ''; s3DZ.innerHTML = '';
    
    headers.forEach((h, i) => {
        if (i === 0) return; 
        const div = document.createElement('div');
        // 添加 search-item 类和 data-name 属性
        div.className = 'search-item flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition border border-transparent';
        div.setAttribute('data-name', h); 
        
        div.innerHTML = `
            <input type="checkbox" class="col-check w-4 h-4 rounded text-blue-600" value="${i}" onchange="countCharts()">
            <span class="column-text text-xs font-medium text-slate-700 flex-1 truncate" title="${h}">${h}</span>
            <select class="axis-select bg-white border text-[10px] px-1 py-1 rounded" onchange="updateCharts()">
                <option value="y">左轴</option><option value="y1">右轴</option>
            </select>`;
        colList.appendChild(div);
        
        const opt = `<option value="${i}">${h}</option>`;
        if(sX) sX.innerHTML += opt; 
        if(sY) sY.innerHTML += opt;
        if(s3DX) s3DX.innerHTML += opt;
        if(s3DY) s3DY.innerHTML += opt;
        if(s3DZ) s3DZ.innerHTML += opt;
    });
}

// 折线图列过滤
function filterColumns() {
    const keyword = refs.columnSearch.value.trim().toLowerCase();
    const items = document.querySelectorAll('.search-item');

    items.forEach(item => {
        const originalText = item.getAttribute('data-name');
        const textElement = item.querySelector('.column-text');
        
        if (keyword === '') {
            // 搜索框为空：显示全部，取消高亮
            item.classList.remove('hidden');
            textElement.innerHTML = originalText;
        } else {
            if (originalText.toLowerCase().includes(keyword)) {
                // 包含关键字：显示并高亮
                item.classList.remove('hidden');
                
                // 使用正则表达式进行不区分大小写的高亮替换
                const regex = new RegExp(`(${keyword})`, 'gi');
                textElement.innerHTML = originalText.replace(regex, `<mark class="bg-yellow-200 text-slate-900 p-0 rounded-sm">$1</mark>`);
            } else {
                // 不包含关键字：隐藏
                item.classList.add('hidden');
            }
        }
    });
}

// 添加过滤条件
function addFilter() {
    const id = Date.now(); // 使用时间戳作为唯一ID
    const div = document.createElement('div');
    div.id = `filter-${id}`;
    div.className = 'bg-slate-50 p-2 rounded border border-slate-200 text-[11px] mb-2 shadow-sm';
    let colOpts = headers.map((h, i) => `<option value="${i}">${h}</option>`).join('');
    // 构建过滤条件的HTML结构
    div.innerHTML = `
        <select class="f-col axis-input mb-1">${colOpts}</select>
        <div class="flex gap-1">
            <select class="f-op axis-input">
                <option value=">">></option><option value="<"><</option>
                <option value=">=">>=</option><option value="<="><=</option>
                <option value="!=">!=</option>
            </select>
            <input type="number" class="f-val axis-input" placeholder="值">
            <button onclick="removeFilter(${id})" class="text-red-500 font-bold px-1 text-lg">×</button>
        </div>`;
    // 将新过滤条件添加到列表中
        refs.filterList.appendChild(div);
    // 为新添加的过滤条件绑定输入事件，任何输入变化都触发图表更新
    div.querySelectorAll('select, input').forEach(el => el.oninput = updateCharts);
}

// 添加3D散点图过滤条件
function addFilter3D() {
    const id = Date.now(); // 使用时间戳作为唯一ID
    const div = document.createElement('div');
    div.id = `filter3d-${id}`;
    div.className = 'bg-slate-50 p-2 rounded border border-slate-200 text-[11px] mb-2 shadow-sm';
    let colOpts = headers.map((h, i) => `<option value="${i}">${h}</option>`).join('');
    // 构建过滤条件的HTML结构
    div.innerHTML = `
        <select class="f-col axis-input mb-1">${colOpts}</select>
        <div class="flex gap-1">
            <select class="f-op axis-input">
                <option value=">">></option><option value="<"><</option>
                <option value=">=">>=</option><option value="<="><=</option>
                <option value="!=">!=</option>
            </select>
            <input type="number" class="f-val axis-input" placeholder="值">
            <button onclick="removeFilter3D(${id})" class="text-red-500 font-bold px-1 text-lg">×</button>
        </div>`;
    // 将新过滤条件添加到列表中
        refs.filterList3D.appendChild(div);
    // 为新添加的过滤条件绑定输入事件，任何输入变化都触发图表更新
    div.querySelectorAll('select, input').forEach(el => el.oninput = updateCharts);
}

// 删除过滤条件
function removeFilter(id) {
    const target = refs.filterList.querySelector(`#filter-${id}`);
    if (target) target.remove();
    updateCharts();
}

// 删除3D散点图过滤条件
function removeFilter3D(id) {
    const target = refs.filterList3D.querySelector(`#filter3d-${id}`);
    if (target) target.remove();
    updateCharts();
}

// 折线图 case：构建数据集与动态轴配置
function applyLineChartConfig(config, customL, customR, isSeparated) {
    const isAbs = refs.absTime.checked;
    
    // 计算时间数据并更新总时间范围
    const timeData = rawData.map(row => {
        const t = parseTimeString(row[0]);
        return isAbs ? t - firstTimestamp : t;
    });

    // 更新全局时间范围，供时间滑块使用
    totalTimeRange.min = Math.min(...timeData);
    totalTimeRange.max = Math.max(...timeData);

    document.querySelectorAll('.col-check:checked').forEach((chk, idx) => {
        const colIdx = chk.value;
        let axisId = 'y';

        if (isSeparated) {
            axisId = `y_sep_${idx}`;
            config.options.scales[axisId] = {
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: headers[colIdx], font: { weight: 'bold' } },
                grid: { drawOnChartArea: false }
            };
        } else {
            const axis = chk.parentElement.querySelector('.axis-select').value;
            axisId = axis;
            if (axis === 'y1') {
                config.options.scales.y1.title.text = customR || "右轴数值";
                config.options.scales.y1.display = true;
            } else {
                config.options.scales.y.title.text = customL || "左轴数值";
            }
        }

        // 在非分离模式下，图例显示为"数据名称 + 轴标识"
        let dataLabel = headers[colIdx];
        if (!isSeparated) {
            const axisLabel = axisId === 'y1' ? '右轴' : '左轴';
            dataLabel = `[${axisLabel}] ${dataLabel}`;
        }

        config.data.datasets.push({
            label: dataLabel,
            data: timeData.map((t, i) => ({ x: t, y: rawData[i][colIdx] })),
            borderColor: `hsl(${idx * 137}, 70%, 50%)`,
            borderWidth: 2,
            pointRadius: 0,
            yAxisID: axisId
        });
    });
}

// 散点图 case：构建过滤后的点数据集
function applyScatterChartConfig(config) {
    const xIdx = refs.scatterX.value;
    const yIdx = refs.scatterY.value;
    const filtered = getFilteredRawData();

    config.data.datasets.push({
        label: `${headers[yIdx]}`,
        data: filtered.map(row => ({ x: row[xIdx], y: row[yIdx] })),
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
        pointRadius: 4,
        hitRadius: 10
    });
}

// 读取“维度与过滤”面板中的过滤条件并应用到原始数据
function getFilteredRawData() {
    const filterItems = Array.from(document.querySelectorAll('#filterList > div')).map(div => ({
        col: parseInt(div.querySelector('.f-col').value),
        op: div.querySelector('.f-op').value,
        val: parseFloat(div.querySelector('.f-val').value)
    })).filter(f => !isNaN(f.val));

    return rawData.filter(row => {
        return filterItems.every(f => {
            const v = row[f.col];
            if (f.op === '>') return v > f.val;
            if (f.op === '<') return v < f.val;
            if (f.op === '>=') return v >= f.val;
            if (f.op === '<=') return v <= f.val;
            if (f.op === '!=') return v != f.val;
            return true;
        });
    });
}

function getFilteredScatterYValues() {
    const yIdx = parseInt(refs.scatterY?.value, 10);
    if (!rawData.length || Number.isNaN(yIdx)) return [];

    return getFilteredRawData()
        .map(row => Number(row[yIdx]))
        .filter(value => Number.isFinite(value));
}

function getQuantile(sortedValues, quantile) {
    if (!sortedValues.length) return null;
    if (sortedValues.length === 1) return sortedValues[0];

    const position = (sortedValues.length - 1) * quantile;
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.ceil(position);
    const weight = position - lowerIndex;

    if (lowerIndex === upperIndex) {
        return sortedValues[lowerIndex];
    }

    return sortedValues[lowerIndex] + (sortedValues[upperIndex] - sortedValues[lowerIndex]) * weight;
}

function formatScatterStatValue(value) {
    if (!Number.isFinite(value)) return '--';
    return value.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
    });
}

function renderScatterStats() {
    const statElements = [
        refs.scatterStatMean,
        refs.scatterStatMedian,
        refs.scatterStatP75,
        refs.scatterStatP25,
        refs.scatterStatMax,
        refs.scatterStatMin
    ];

    if (statElements.some(el => !el)) return;

    const yIdx = parseInt(refs.scatterY?.value, 10);
    const yLabel = Number.isNaN(yIdx) ? '' : headers[yIdx];
    if (refs.scatterStatsTitle) {
        refs.scatterStatsTitle.textContent = yLabel ? `${yLabel} 数据统计` : '当前 Y 轴数据统计';
    }

    const yValues = getFilteredScatterYValues();
    if (!yValues.length) {
        statElements.forEach(el => {
            el.textContent = '--';
        });
        return;
    }

    const sortedValues = [...yValues].sort((a, b) => a - b);
    const sum = yValues.reduce((total, value) => total + value, 0);

    refs.scatterStatMean.textContent = formatScatterStatValue(sum / yValues.length);
    refs.scatterStatMedian.textContent = formatScatterStatValue(getQuantile(sortedValues, 0.5));
    refs.scatterStatP75.textContent = formatScatterStatValue(getQuantile(sortedValues, 0.75));
    refs.scatterStatP25.textContent = formatScatterStatValue(getQuantile(sortedValues, 0.25));
    refs.scatterStatMax.textContent = formatScatterStatValue(sortedValues[sortedValues.length - 1]);
    refs.scatterStatMin.textContent = formatScatterStatValue(sortedValues[0]);
}

// 读取3D散点图的过滤条件并应用到原始数据
function getFilteredRawData3D() {
    const filterItems = Array.from(document.querySelectorAll('#filterList3D > div')).map(div => ({
        col: parseInt(div.querySelector('.f-col').value),
        op: div.querySelector('.f-op').value,
        val: parseFloat(div.querySelector('.f-val').value)
    })).filter(f => !isNaN(f.val));

    return rawData.filter(row => {
        return filterItems.every(f => {
            const v = row[f.col];
            if (f.op === '>') return v > f.val;
            if (f.op === '<') return v < f.val;
            if (f.op === '>=') return v >= f.val;
            if (f.op === '<=') return v <= f.val;
            if (f.op === '!=') return v != f.val;
            return true;
        });
    });
}

// 3D散点图 case：使用 Plotly 在主图窗渲染 3D 散点图
function apply3DScatterChartConfig() {
    const xIdx = refs.scatter3DX.value;
    const yIdx = refs.scatter3DY.value;
    const zIdx = refs.scatter3DZ.value;
    const colorScale = refs.scatter3DColorScale.value || 'Viridis';
    const filtered = getFilteredRawData3D();
    
    // 解析时间数据并根据相对/绝对时间设置调整显示
    const isAbs = refs.absTime.checked;
    const timeData = filtered.map(row => {
        const t = parseTimeString(row[0]);
        return isAbs ? t - firstTimestamp : t;
    });
    
    const trace = {
        x: filtered.map(row => row[xIdx]),
        y: filtered.map(row => row[yIdx]),
        z: filtered.map(row => row[zIdx]),
        customdata: timeData.map(t => formatTime(t)),
        mode: 'markers',
        type: 'scatter3d',
        marker: {
            size: 4, // 固定点大小
            color: filtered.map(row => row[zIdx]), // 根据Z轴值着色
            colorscale: colorScale, // 使用选择的颜色系列
            opacity: 0.8 // 设置点的透明度
        },
        name: `${headers[yIdx]} vs ${headers[xIdx]} vs ${headers[zIdx]}`,
        hovertemplate:
            `${headers[xIdx]}: %{x}<br>` +
            `${headers[yIdx]}: %{y}<br>` +
            `${headers[zIdx]}: %{z}<br>` +
            `${headers[0] || '时间'}: %{customdata}<extra></extra>`
    };

    const layout = {
        margin: { l: 0, r: 0, b: 0, t: 24 },
        title: { text: '3D散点图', x: 0.5, xanchor: 'center', font: { size: 14 } },
        scene: {
            xaxis: { title: headers[xIdx] || 'X轴' },
            yaxis: { title: headers[yIdx] || 'Y轴' },
            zaxis: { title: headers[zIdx] || 'Z轴' }
        }
    };
    // 配置项：响应式布局，隐藏Plotly水印
    const config = { responsive: true, displaylogo: false };
    Plotly.react(refs.mainChart3D, [trace], layout, config);
}

// 更新图表
function updateCharts() {
    renderScatterStats();

    //保存当前缩放
    let currentMin = null;
    let currentMax = null;

    // 如果图表已存在，且当前是折线图模式，尝试获取当前的X轴范围
    if (chart && activeTab === 'line' && chart.scales.x) {
        currentMin = chart.scales.x.min;
        currentMax = chart.scales.x.max;
    }
    // 销毁现有图表实例，清理3D图表容器
    if (chart) {
        chart.destroy();
        chart = null;
    }
    if (window.Plotly && refs.mainChart3D) {
        Plotly.purge(refs.mainChart3D);
    }
    // 根据当前活动标签决定显示哪个图表容器
    const is3DTab = activeTab === 'scatter3d';
    refs.mainChart.classList.toggle('hidden', is3DTab);
    refs.mainChart3D.classList.toggle('hidden', !is3DTab);
    // 3D散点图使用 Plotly 处理，直接调用专用函数配置并渲染
    if (is3DTab) {
        apply3DScatterChartConfig();
        refs.cursorValuePanel.classList.add('hidden');
        return;
    }

    // 2D图表（折线图和散点图）使用 Chart.js 处理，构建配置后实例化
    const ctx = refs.mainChart.getContext('2d');
    const customL = refs.leftAxisName.value;
    const customR = refs.rightAxisName.value;
    const isCursorEnabled = refs.enableCursor?.checked;
    
    // 根据分离模式调整轴标题和显示逻辑
    const isSeparated = refs.separateCurves?.checked && activeTab === 'line';

    let xAxisTitle = activeTab === 'line' ? (refs.absTime.checked ? "时间 (s)" : "时间 (HH:mm:ss.SSS)") : (headers[refs.scatterX.value] || "X轴数据");
    // 分离模式下，左轴标题可以显示通用名称，或者保持原样
    let yAxisTitle = activeTab === 'line'
        ? (isSeparated ? "数值" : (customL || "左轴数值"))
        : (headers[refs.scatterY.value] || "Y轴数据");

    // 基础配置，后续根据不同图表类型进行调整
    const config = {
        type: activeTab === 'line' ? 'line' : 'scatter',
        data: { datasets: [] },
        plugins: [cursorPlugin],
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            onHover: (e) => handleChartHover(e),
            scales: {
                x: { 
                    type: 'linear', 
                    title: { display: true, text: xAxisTitle, font: { weight: 'bold' } },
                    // 根据当前时间显示模式动态调整X轴刻度标签格式
                    ticks: {
                        callback: function(value) {
                            if (activeTab === 'line') {
                                if (!refs.absTime.checked) {
                                    const hours = Math.floor(value / 3600);
                                    const minutes = Math.floor((value % 3600) / 60);
                                    const seconds = Math.floor(value % 60);
                                    const milliseconds = Math.floor((value % 1) * 1000);
                                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
                                }
                                return value;
                            }
                            return value;
                        }
                    }
                },
                // 基础Y轴配置 (仅在非分离模式下作为默认显示)
                y: { 
                    position: 'left', 
                    display: !isSeparated, // 如果分离，则隐藏默认Y轴，由动态生成的轴代替
                    title: { display: true, text: yAxisTitle, font: { weight: 'bold' } },
                    min: refs.yMin.value !== "" ? parseFloat(refs.yMin.value) : undefined,
                    max: refs.yMax.value !== "" ? parseFloat(refs.yMax.value) : undefined
                },
                y1: { 
                    position: 'right', 
                    display: (!isSeparated && activeTab === 'line'), // 分离模式下不显示默认右轴
                    title: { display: true, text: customR || "右轴数值", font: { weight: 'bold' } },
                    grid: { drawOnChartArea: false },
                    min: refs.y1Min.value !== "" ? parseFloat(refs.y1Min.value) : undefined,
                    max: refs.y1Max.value !== "" ? parseFloat(refs.y1Max.value) : undefined
                }
            },
            plugins: {
                // 图例显示在底部
                legend: {
                    display: true,
                    position: 'bottom'
                },
                // 只有在折线图和散点图模式下启用缩放和平移功能
                zoom: {
                    zoom: { wheel: { enabled: true, modifierKey: 'ctrl' }, mode: 'x', onZoom: syncSliderToChart },
                    pan: {
                        enabled: (activeTab === 'line' || activeTab === 'scatter'),
                        mode: 'x',
                        modifierKey: null,
                        threshold: 0,
                        onPan: syncSliderToChart
                    }
                },
                // 根据当前模式和光标状态调整工具提示显示逻辑
                tooltip: { 
                    enabled: (activeTab === 'scatter' || !isCursorEnabled),
                    mode: 'nearest', intersect: activeTab === 'scatter'
                }
            }
        }
    };
    // 根据当前活动标签应用不同的配置逻辑
    switch (activeTab) {
        case 'line':
            applyLineChartConfig(config, customL, customR, isSeparated);
            break;
        case 'scatter':
            applyScatterChartConfig(config);
            break;
        case 'scatter3d':
            apply3DScatterChartConfig();
            break;
        default:
            console.warn(`未支持的图表类型: ${activeTab}`);
            break;
    }
    chart = new Chart(ctx, config);
    if (activeTab === 'line') syncSliderToChart();
    //修改：取消勾选光标线后光标面板直接消失
    if (!isCursorEnabled) refs.cursorValuePanel.classList.add('hidden');
    //折线图恢复缩放状态
    if (activeTab === 'line' && currentMin !== null && currentMax !== null && !isChartRst) {
        // 只有当记录的范围有效，且不是全量范围时才强制应用
        // 防止刚加载时因为数据未更新导致的闪烁
        if (currentMin !== totalTimeRange.min || currentMax !== totalTimeRange.max) {
            chart.options.scales.x.min = currentMin;
            chart.options.scales.x.max = currentMax;
            chart.update('none'); // 'none' 模式避免动画干扰，直接跳转
            syncSliderToChart();
        }
    }
}

// 处理图表悬停事件（用于光标功能）
function handleChartHover(e) {
    if (!chart || activeTab !== 'line' || !refs.enableCursor.checked) return;
    if (e.native.buttons !== 1 && e.type !== 'click' && e.type !== 'mousemove') return;
    const xValue = chart.scales.x.getValueForPixel(e.x);
    chart.cursorX = e.x;
    chart.draw();
    const panel = refs.cursorValuePanel;
    panel.classList.remove('hidden');
    let html = `<div class="font-bold border-b border-slate-600 mb-2 pb-1 text-blue-400">时间: ${formatTime(xValue)}</div>`;
    chart.data.datasets.forEach(ds => {
        const data = ds.data;
        let low = 0, high = data.length - 1;
        // 使用二分查找找到最接近的x值
        while (low < high) {
            let mid = Math.floor((low + high) / 2);
            if (data[mid].x < xValue) low = mid + 1; else high = mid;
        }
        const val = data[low] ? data[low].y : 'N/A';
        html += `<div class="flex justify-between gap-4"><span>${ds.label}:</span><span class="font-mono text-emerald-400">${typeof val === 'number' ? val.toFixed(3) : val}</span></div>`;
    });
    panel.innerHTML = html;
}

// 时间轴滑块控制
const slider = refs.timeSlider;
slider.oninput = function() {
    if (!chart || activeTab !== 'line') return;
    const viewRange = chart.scales.x.max - chart.scales.x.min;
    const totalWidth = totalTimeRange.max - totalTimeRange.min;
    if (viewRange >= totalWidth) return;
    const newMin = totalTimeRange.min + (totalWidth - viewRange) * (this.value / 1000);
    chart.options.scales.x.min = newMin;
    chart.options.scales.x.max = newMin + viewRange;
    chart.update('none');
    updateTimeLabels();
};

// 同步滑块与图表视图
function syncSliderToChart() {
    if (!chart || activeTab !== 'line' || !chart.scales.x) return;
    const scale = chart.scales.x;
    const totalWidth = totalTimeRange.max - totalTimeRange.min;
    const viewRange = scale.max - scale.min;
    if (totalWidth > viewRange) {
        slider.value = ((scale.min - totalTimeRange.min) / (totalWidth - viewRange)) * 1000;
    } else {
        slider.value = 0;
    }
    updateTimeLabels();
}

// 更新时间标签
function updateTimeLabels() {
    if (!chart || !chart.scales.x) return;
    const scale = chart.scales.x;
    refs.timeStart.value = formatTime(scale.min || 0);
    refs.timeEnd.value = formatTime(scale.max || 0);
}

refs.timeStart.addEventListener('change', applyTimeRangeInputs);
refs.timeEnd.addEventListener('change', applyTimeRangeInputs);
refs.timeStart.addEventListener('blur', applyTimeRangeInputs);
refs.timeEnd.addEventListener('blur', applyTimeRangeInputs);
refs.timeStart.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') applyTimeRangeInputs();
});
refs.timeEnd.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') applyTimeRangeInputs();
});

// 导出PNG图像
function exportPNG() {
    if (activeTab === 'scatter3d') {
        const filename = `OBD_Data_${Date.now()}`;
        Plotly.downloadImage(refs.mainChart3D, { format: 'png', filename: filename });
        return;
    }
    if (!chart) return;

    let imageUrl = chart.toBase64Image();
    if (activeTab === 'line' && refs.enableCursor.checked && !refs.cursorValuePanel.classList.contains('hidden')) {
        imageUrl = getChartImageWithCursorPanel(chart, refs.cursorValuePanel);
    }

    const link = document.createElement('a');
    link.download = `OBD_Data_${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
}

// 获取包含光标面板的图表图像
function getChartImageWithCursorPanel(chart, panel) {
    const chartCanvas = chart.canvas;
    const chartRect = chartCanvas.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const scale = chartCanvas.width / chartRect.width;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = chartCanvas.width;
    tempCanvas.height = chartCanvas.height;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(chartCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

    const x = Math.max(0, (panelRect.left - chartRect.left) * scale);
    const y = Math.max(0, (panelRect.top - chartRect.top) * scale);
    const width = Math.min(tempCanvas.width - x, panelRect.width * scale);
    const height = Math.min(tempCanvas.height - y, panelRect.height * scale);

    const panelStyle = getComputedStyle(panel);
    const bgColor = panelStyle.backgroundColor || 'rgba(15, 23, 42, 0.95)';
    const borderColor = panelStyle.borderColor || '#334155';
    const borderRadius = parseFloat(panelStyle.borderRadius || 8) * scale;
    const padding = parseFloat(panelStyle.paddingTop || 16) * scale;
    const fontSize = parseFloat(panelStyle.fontSize || 11) * scale;
    const lineHeight = Math.max(fontSize * 1.5, 16 * scale);

    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
    ctx.shadowBlur = 20 * scale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10 * scale;
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    drawRoundedRect(ctx, x, y, width, height, borderRadius);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.stroke();
    ctx.restore();

    const rows = Array.from(panel.children).filter(child => child.tagName === 'DIV');
    ctx.textBaseline = 'top';
    const startX = x + padding;
    let textY = y + padding;

    rows.forEach((child, index) => {
        if (index === 0) {
            ctx.fillStyle = 'rgb(96, 165, 250)';
            ctx.font = `bold ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif`;
            const text = child.textContent.trim().replace(/\s+/g, ' ');
            ctx.fillText(text, startX, textY, width - padding * 2);
            textY += fontSize + 8 * scale;

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.64)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(startX, textY + 2 * scale);
            ctx.lineTo(x + width - padding, textY + 2 * scale);
            ctx.stroke();
            textY += 10 * scale;
            return;
        }

        const leftText = child.querySelector('span:first-child')?.textContent.trim() || '';
        const rightText = child.querySelector('span:last-child')?.textContent.trim() || '';

        ctx.font = `${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(leftText, startX, textY, width - padding * 2);

        ctx.fillStyle = 'rgb(52, 211, 153)';
        ctx.font = `${fontSize}px "Courier New", monospace`;
        const rightWidth = ctx.measureText(rightText).width;
        ctx.fillText(rightText, x + width - padding - rightWidth, textY, rightWidth);
        textY += lineHeight;
    });

    return tempCanvas.toDataURL('image/png');
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// 统一切换 AI 输出区域错误样式
function setAiOutputState(outBox, isError) {
    outBox.classList.toggle('ai-response-error', isError);
}

// 准备折线图分析输入数据
function prepareLineChartDataForAI(prompt, status, tokenlmt) {
    const xMin = chart.scales.x.min;
    const xMax = chart.scales.x.max;
    const isAbs = refs.absTime.checked;
    let sampledData = [];

    const checkedIndices = new Set(
        Array.from(document.querySelectorAll('.col-check:checked'))
            .map(chk => parseInt(chk.value))
    );
    checkedIndices.add(0);

    sampledData = rawData.filter(row => {
        const t = parseTimeString(row[0]);
        const currentTime = isAbs ? t - firstTimestamp : t;
        return currentTime >= xMin && currentTime <= xMax;
    }).map(row => {
        let obj = {};
        headers.forEach((h, i) => {
            if (checkedIndices.has(i)) {
                obj[h] = row[i];
            }
        });
        return obj;
    });

    if (sampledData.length === 0) {
        throw new Error("当前图表范围内没有可用数据，请调整缩放。");
    }

    sampledData = sampledData.map(row => {
        const firstKey = Object.keys(row)[0];
        const parsedTime = parseTimeString(row[firstKey]);
        const newValue = isAbs ? parsedTime - firstTimestamp : formatTime(parsedTime);
        return {
            ...row,
            [firstKey]: newValue
        };
    });

    const tokencount = GPTTokenizer_o200k_base.encode(JSON.stringify(sampledData)).length;
    if (tokencount > tokenlmt) {
        sampledData = getCompressedData(sampledData, tokenlmt);
        status.innerText = `输入数据token长度 ${(tokencount * 0.001).toFixed(2)}K ，限值 ${tokenlmt * 0.001 }K，压缩数据...`;
    } else {
        status.innerText = `输入数据token长度 ${(tokencount * 0.001).toFixed(2)}K ，分析生成报告...`;
    }

    const timeDesc = isAbs ? "单位为秒(s)，从0开始的相对时间" : "格式为HH:mm:ss.SSS的绝对时间字符串";

    return {
        syscont: "你是一个专业的车辆OBD数据分析专家。用户会提供CSV格式的部分采样数据，请根据这些数据回答用户的分析需求。请侧重于寻找异常值、趋势关系和性能表现，省去自我介绍，直接说分析结果。",
        usrcont: `数据列定义，: ${headers.join(', ')}\n\n采样数据: ${JSON.stringify(sampledData)}，其中每个数据组中的第一个数据代表着时间戳（一般会有time相关的标签），${timeDesc}\n\n用户的分析需求: ${prompt}`
    };
}

// 准备散点图分析输入数据
function prepareScatterDataForAI(prompt, status, tokenlmt) {
    const xIdx = refs.scatterX.value;
    const yIdx = refs.scatterY.value;
    let sampledData = [];

    const filterItems = Array.from(document.querySelectorAll('#filterList > div')).map(div => ({
        col: parseInt(div.querySelector('.f-col').value),
        op: div.querySelector('.f-op').value,
        val: parseFloat(div.querySelector('.f-val').value)
    })).filter(f => !isNaN(f.val));

    sampledData = rawData.filter(row => {
        return filterItems.every(f => {
            const v = row[f.col];
            if (f.op === '>') return v > f.val;
            if (f.op === '<') return v < f.val;
            if (f.op === '>=') return v >= f.val;
            if (f.op === '<=') return v <= f.val;
            if (f.op === '!=') return v != f.val;
            return true;
        });
    });

    if (sampledData.length === 0) {
        throw new Error("当前图表范围内没有可用数据，请调整缩放。");
    }

    sampledData = sampledData.map(row => ({
        [headers[xIdx]]: row[xIdx],
        [headers[yIdx]]: row[yIdx]
    }));

    const tokencount = GPTTokenizer_o200k_base.encode(JSON.stringify(sampledData)).length;
    if (tokencount > tokenlmt) {
        sampledData = getCompressedData(sampledData, tokenlmt);
        status.innerText = `输入数据token长度 ${(tokencount * 0.001).toFixed(2)}K ，限值 ${tokenlmt * 0.001 }K，压缩数据...`;
    } else {
        status.innerText = `输入数据token长度 ${(tokencount * 0.001).toFixed(2)}K ，分析生成报告...`;
    }

    return {
        syscont: "你是一个专业的车辆OBD数据分析专家。用户会提供CSV格式的散点图，散点图的请根据这些数据回答用户的分析需求。请侧重于寻找异常值、趋势关系和性能表现，省去自我介绍，直接说分析结果。",
        usrcont: `X轴标签为: ${headers[xIdx]}\n\nY轴数据的标签为: ${headers[yIdx]}\n\nXY轴的数据点为${JSON.stringify(sampledData)}\n\n\用户的分析需求: ${prompt}`
    };
}

// 准备3D散点图分析输入数据
function prepare3DScatterDataForAI(prompt, status, tokenlmt) {
    const xIdx = refs.scatter3DX.value;
    const yIdx = refs.scatter3DY.value;
    const zIdx = refs.scatter3DZ.value;
    let sampledData = getFilteredRawData3D().map(row => ({
        [headers[xIdx]]: row[xIdx],
        [headers[yIdx]]: row[yIdx],
        [headers[zIdx]]: row[zIdx]
    }));

    if (sampledData.length === 0) {
        throw new Error("当前图表范围内没有可用数据，请调整缩放。");
    }

    const tokencount = GPTTokenizer_o200k_base.encode(JSON.stringify(sampledData)).length;
    if (tokencount > tokenlmt) {
        sampledData = getCompressedData(sampledData, tokenlmt);
        status.innerText = `输入数据token长度 ${(tokencount * 0.001).toFixed(2)}K ，限值 ${tokenlmt * 0.001 }K，压缩数据...`;
    } else {
        status.innerText = `输入数据token长度 ${(tokencount * 0.001).toFixed(2)}K ，分析生成报告...`;
    }

    return {
        syscont: "你是一个专业的车辆OBD数据分析专家。用户会提供CSV格式的3D散点图数据，请根据这些数据回答用户的分析需求。请侧重于寻找异常值、趋势关系和性能表现，省去自我介绍，直接说分析结果。",
        usrcont: `X轴标签为: ${headers[xIdx]}\n\nY轴标签为: ${headers[yIdx]}\n\nZ轴标签为: ${headers[zIdx]}\n\nXYZ轴的数据点为${JSON.stringify(sampledData)}\n\n用户的分析需求: ${prompt}`
    };
}

// 构建请求消息（含历史上下文裁剪）
function buildAiMessages(syscont, usrcont, tokenlmt) {
    trimChatHistory(tokenlmt);
    return [
        {
            role: "system",
            content: syscont
        },
        ...chatHistory,
        {
            role: "user",
            content: usrcont
        }
    ];
}

// 发送请求并处理流式返回与中断
async function streamAnalyzeWithAbort(messages, model, outBox, status, stopBtn, isAttachEnabled, usrcont) {
    
    // 创建新的 AbortController 实例用于本次请求的中断控制
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;
    stopBtn.classList.remove('hidden');
    let tokenCount = 0;
    try {
        tokenCount = GPTTokenizer_o200k_base.encode(JSON.stringify(messages)).length;
    } catch (e) {
        tokenCount = Math.ceil(JSON.stringify(messages).length * 1.2);
    }
    status.innerText = `处理后的输入token长度 ${(tokenCount / 1000).toFixed(2)}K，生成分析报告中...`;

    // 发送 POST 请求到后端分析接口，包含消息内容和模型选择，同时传递中断信号
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: messages,
            model: model
        }),
        signal: signal
    });

    // 检查响应状态，如果请求失败则抛出错误
    if (!response.ok) throw new Error("服务器请求失败");
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullMarkdown = "";

    // 逐行读取流式响应，处理增量数据并更新界面
    while (true) {
        const { done, value } = await reader.read(); 
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;

            const jsonStr = trimmed.replace(/^data: /, "");
            try {
                const json = JSON.parse(jsonStr);
                const content = json.choices[0].delta?.content;
                if (content) {
                    fullMarkdown += content;
                    setAiOutputState(outBox, false);
                    outBox.innerHTML = marked.parse(fullMarkdown);
                    outBox.scrollTop = outBox.scrollHeight;
                }
            } catch (e) {
                // 忽略不完整的 JSON 分片
            }
        }
    }

    // 最终结果处理：将完整 Markdown 转换为 HTML 并更新界面，同时将本次对话加入历史记录
    chatHistory.push({ role: "user", content: isAttachEnabled ? "原始数据已经省略，请根据对数据的分析结果继续进行对话分析" : usrcont });
    chatHistory.push({ role: "assistant", content: fullMarkdown });
    status.innerText = "分析完成";
}

// AI分析功能
async function sendToAI() {
    // 获取用户输入的分析指令和相关界面元素的引用，同时检查必要的前提条件（如数据是否已加载，图表是否初始化等）
    const prompt = refs.aiPrompt.value.trim();// AI 输出框、状态显示、按钮等元素的引用
    const outBox = refs.aiOutput;// 是否附带数据的状态
    const status = refs.aiStatus;// 模型选择下拉框的引用
    const sendBtn = refs.sendBtn;// 停止按钮、清空按钮和AI响应容器的引用
    const stopBtn = refs.stopBtn;// 当前是否附带数据的状态
    const clearBtn = refs.clearBtn;// AI响应容器的引用
    const container = refs.aiResponseContainer;
    const isAttachEnabled = uiState.attachDataEnabled;// 根据 UI 状态决定是否将当前图表数据附带在分析请求中
    let syscont = " ";
    let usrcont = ' ';
    const selectedModelOption = refs.aiModelSelect.selectedOptions[0];
    const tokenlmt = selectedModelOption ? parseInt(selectedModelOption.dataset.tokenLimit, 10) || 128000 : 128000;
    outBox.innerText = "";
    

    // 将图窗数据压入提示词
    if (isAttachEnabled) {
        try {
            switch (activeTab) {
                case 'line': {
                    const linePayload = prepareLineChartDataForAI(prompt, status, tokenlmt);
                    syscont = linePayload.syscont;
                    usrcont = linePayload.usrcont;
                    break;
                }
                case 'scatter': {
                    const scatterPayload = prepareScatterDataForAI(prompt, status, tokenlmt);
                    syscont = scatterPayload.syscont;
                    usrcont = scatterPayload.usrcont;
                    break;
                }
                case 'scatter3d': {
                    const scatter3DPayload = prepare3DScatterDataForAI(prompt, status, tokenlmt);
                    syscont = scatter3DPayload.syscont;
                    usrcont = scatter3DPayload.usrcont;
                    break;
                }
                default:
                    throw new Error(`未支持的图表模式: ${activeTab}`);
            }

        } catch (err) {
            setAiOutputState(outBox, true);
            outBox.textContent = `错误: ${err.message}`;
            status.innerText = "执行失败";
            sendBtn.disabled = false;
            return;
        }
    
    // 纯对话，仅包含提示词
    }else{
        usrcont = prompt;
    }

    const messages = buildAiMessages(syscont, usrcont, tokenlmt);

    setAiOutputState(outBox, false);
    clearBtn.classList.add('hidden');
    sendBtn.disabled = true;

    try{     
        refs.aiResponseContainer.classList.remove('hidden');
        const model  = refs.aiModelSelect.value;
        await streamAnalyzeWithAbort(messages, model, outBox, status, stopBtn, isAttachEnabled, usrcont);
    } catch (err) {            
        if (err.name === 'AbortError') {
            setAiOutputState(outBox, true);
            refs.aiResponseContainer.classList.remove('hidden');
            status.innerText = "执行中止";
        } else {
            refs.aiResponseContainer.classList.remove('hidden');
            setAiOutputState(outBox, true);
            outBox.textContent = `错误: ${err.message}`;
            status.innerText = "执行失败";
        }
    } finally {
        sendBtn.disabled = false;// 恢复“发送”按钮
        clearBtn.classList.remove('hidden');// 显示“清空对话”按钮
        stopBtn.classList.add('hidden'); // 隐藏“停止”按钮
        if (isAttachEnabled) toggleAttachData();// 关闭附带数据开关，避免用户误操作
        currentAbortController = null; // 重置中断控制器状态
    }
}


//动态采样算法：根据 Token 阈值自动缩减数据规模
function getCompressedData(data, limit) {
    if (!data || data.length === 0) return [];

    // 1. 初始估算：计算当前全部数据的 Token 长度
    // 提示：此处必须确保 GPTTokenizer 已加载，否则使用兜底估算
    let currentString = JSON.stringify(data);
    let currentTokenCount = 0;
    
    try {
        currentTokenCount = GPTTokenizer_o200k_base.encode(currentString).length;
    } catch (e) {
        // 如果库没加载好，用字符数 * 1.2 粗略预估
        currentTokenCount = Math.ceil(currentString.length * 1.2);
    }

    // 2. 如果没超限，直接返回原数据
    if (currentTokenCount <= limit) {
        return data;
    }

    // 3. 计算采样间隔 N (计算倍数)
    // 为了保险起见，我们在计算 N 时多留 10% 的余量 (limit * 0.9)
    const safetyLimit = limit * 0.9;
    const n = Math.ceil(currentTokenCount / safetyLimit);
    
    console.log(`Token超限(${currentTokenCount})，正在执行 ${n} 倍采样压缩...`);

    // 4. 执行每隔 N 行取一行的逻辑
    const sampledData = data.filter((_, index) => index % n === 0);

    // 5. 递归校验（可选）：如果采样后依然微弱超限，再跑一次（通常一次即可解决）
    return sampledData;
}

// 切换“附带数据”开关的状态和样式
function toggleAttachData() {
    uiState.attachDataEnabled = !uiState.attachDataEnabled;
    renderAttachDataState();
}

// 更新选择文件名显示
function handleFileChange(input) {
    const file = input.files[0];
    uiState.selectedFileName = file ? file.name : "未选择文件";
    renderFileNameState();
}

//自动裁剪历史记录以符合 Token 限值
function trimChatHistory(limit) {
    if (!chatHistory || chatHistory.length === 0) return;

    // 1. 计算当前历史记录的 Token 总数
    // 注意：messages 数组需要序列化成字符串才能计算
    let currentTokenCount = GPTTokenizer_o200k_base.encode(JSON.stringify(chatHistory)).length;

    // 2. 循环检查，如果超标则删除最早的一条（通常是一问一答，所以删两条）
    while (currentTokenCount > limit && chatHistory.length > 0) {
        console.warn(`当前上下文 Token (${currentTokenCount}) 超过限值 (${limit})，正在清理...`);
        
        // 移除数组第一项（最早的消息）
        chatHistory.shift(); 
        
        // 重新计算长度
        currentTokenCount = GPTTokenizer_o200k_base.encode(JSON.stringify(chatHistory)).length;
    }
    
    if (chatHistory.length === 0) {
        console.log("历史记录已清空以尝试匹配 Token 限制");
    }
}

// 清空对话
function clearChat() {
    if (confirm("确定要清空所有对话历史吗？")) {
        chatHistory = [];
        refs.aiOutput.innerHTML = "";
        refs.aiOutput.innerText = "对话已清空";
        refs.aiOutput.classList.remove('ai-response-error');
        refs.clearBtn.classList.add('hidden');
    }
}

//中止生成
function stopAI(){
        if (currentAbortController) {
        currentAbortController.abort();
        console.log("已中断生成")
        };
}
