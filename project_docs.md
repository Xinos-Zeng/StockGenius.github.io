# 股票助手(StockGenius)项目设计方案

[产品理念]
主要面向长线价值投资，潜力企业挖掘，不做实时的股市信息

## 整体模块设计
1. 信息收集管道，包括评级机构的研究报告，公司财报，宏观新闻等
2. Agent分析模块，Agent使用工具来对用户所选的某只股票进行分析
3. 数据管理，使用向量数据库管理RAG知识库数据，使用普通数据库管理一些普通应用数据，例如用户数据等
4. 用户管理，允许用户注册登录，并选择感兴趣的A股股票收藏和后续分析

### 前端开发职责

#### 1. 界面设计（以AI分析为核心的简洁设计）

##### 1.1 用户认证模块
- **登录页面** (`/login`)
  - 邮箱 + 密码登录
  - 记住我功能
  - 注册链接
  
- **注册页面** (`/register`)
  - 用户名、邮箱、密码
  - 注册成功后自动登录

##### 1.2 核心功能界面

**首页** (`/`)
- 顶部搜索栏（全局可用）
- 板块新闻卡片（4-6个主要板块）
  - 显示：板块名称、最新一条新闻标题、发布时间
  - 点击：展开该板块最近10条新闻
- 我的关注快捷区
  - 显示关注的股票列表（股票代码+名称）
  - 快速跳转到分析页

**股票搜索页** (`/search`)
- 搜索框（支持代码/名称/拼音首字母）
- 搜索结果列表：
  - 显示：股票代码、股票名称、所属行业
  - 操作：点击查看分析、关注按钮（星标）
- 空状态提示（未搜索时显示热门行业）

**AI分析页** (`/stock/:stockCode/analysis`)
- 股票基本信息头部
  - 股票代码、名称、所属行业、简介
  
- AI分析报告主体（卡片式布局）：
  1. **综合评分区**
     - 投资价值评分（0-100分）
     - 雷达图：基本面、估值、成长性、风险控制
  
  2. **基本面分析**
     - 盈利能力（ROE、净利率等关键指标）
     - 财务健康度（资产负债率、现金流）
     - 行业地位
     - AI文字分析总结
  
  3. **估值分析**
     - 市盈率PE分析（与行业对比）
     - 市净率PB分析
     - 估值合理性判断
     - AI文字分析总结
  
  4. **成长性分析**
     - 营收增长趋势（近3-5年）
     - 利润增长趋势
     - 市场份额变化
     - AI文字分析总结
  
  5. **风险提示**
     - 主要风险点列表
     - 风险等级标识
  
  6. **投资建议**
     - 长期持有建议（买入/观望/回避）
     - 建议理由总结
     - 适合投资者类型
  
- 操作区
  - 关注/取消关注按钮
  - 查看相关研究报告链接
  - 分析时间和数据来源说明
  
**我的关注** (`/watchlist`)
- 关注股票列表（表格或卡片）
  - 显示：代码、名称、行业、添加时间
  - 操作：查看分析、取消关注
  - 支持按添加时间排序
- 空状态提示（引导去搜索）

**研究报告中心** (`/reports`)
- 研究报告列表（按时间倒序）
  - 显示：标题、机构名称、发布日期
  - 点击：新标签页打开报告（外链）
- 简单的日期筛选（最近一周/一月/三月）

**用户中心** (`/user`)
- 个人信息展示和编辑
  - 用户名、邮箱
  - 修改密码
- 我的分析历史
  - 列表显示：股票名称、分析日期、评分
  - 点击跳转到该分析结果

#### 2. 后端接口原型（精简版，聚焦长线分析）

##### 2.1 用户认证
```javascript
// 注册
POST /api/auth/register
Request: { username, email, password }
Response: { success, token, user: { id, username, email } }

// 登录
POST /api/auth/login
Request: { email, password }
Response: { success, token, user: { id, username, email } }

// 获取当前用户信息
GET /api/auth/me
Headers: { Authorization: "Bearer {token}" }
Response: { id, username, email }

// 修改密码
PUT /api/auth/password
Headers: { Authorization: "Bearer {token}" }
Request: { oldPassword, newPassword }
Response: { success, message }
```

##### 2.2 股票搜索
```javascript
// 搜索股票（不返回价格等实时数据）
GET /api/stocks/search?keyword={keyword}&limit=20
Response: { 
  stocks: [{ 
    code, 
    name, 
    industry,
    description 
  }] 
}

// 获取股票基本信息（用于分析页头部）
GET /api/stocks/{stockCode}/info
Response: { 
  code, 
  name, 
  industry, 
  description,
  listDate
}
```

##### 2.3 关注列表
```javascript
// 获取我的关注列表
GET /api/watchlist
Headers: { Authorization: "Bearer {token}" }
Response: { 
  stocks: [{ 
    code, 
    name, 
    industry, 
    addedAt 
  }] 
}

// 添加关注
POST /api/watchlist
Headers: { Authorization: "Bearer {token}" }
Request: { stockCode }
Response: { success, message }

// 取消关注
DELETE /api/watchlist/{stockCode}
Headers: { Authorization: "Bearer {token}" }
Response: { success }

// 检查是否已关注
GET /api/watchlist/check/{stockCode}
Headers: { Authorization: "Bearer {token}" }
Response: { isWatched: true/false }
```

##### 2.4 AI分析（核心功能）
```javascript
// 获取或生成分析报告
// 如果已有最新分析（7天内），直接返回；否则触发生成
GET /api/analysis/{stockCode}
Headers: { Authorization: "Bearer {token}" }
Response: {
  status: "processing" | "completed" | "failed",
  message,
  result: {
    // 基本信息
    stockCode,
    stockName,
    generatedAt,
    
    // 综合评分
    overallScore,        // 0-100
    radarChart: {
      fundamental: 0-100,
      valuation: 0-100,
      growth: 0-100,
      risk: 0-100
    },
    
    // 基本面分析
    fundamentalAnalysis: {
      score: 0-100,
      profitability: {
        roe, netProfitMargin, grossMargin
      },
      financialHealth: {
        debtRatio, currentRatio, cashFlow
      },
      industryPosition: "领先" | "中游" | "落后",
      summary: "AI生成的文字分析"
    },
    
    // 估值分析
    valuationAnalysis: {
      score: 0-100,
      pe: { value, industryAvg, judgment },
      pb: { value, industryAvg, judgment },
      isReasonable: true/false,
      summary: "AI生成的文字分析"
    },
    
    // 成长性分析
    growthAnalysis: {
      score: 0-100,
      revenueTrend: [{ year, value, growthRate }],
      profitTrend: [{ year, value, growthRate }],
      marketShareTrend: "上升" | "稳定" | "下降",
      summary: "AI生成的文字分析"
    },
    
    // 风险提示
    riskWarnings: [
      { level: "高" | "中" | "低", content: "具体风险描述" }
    ],
    
    // 投资建议
    recommendation: {
      suggestion: "买入" | "观望" | "回避",
      reason: "建议理由",
      suitableFor: "稳健型投资者" | "激进型投资者" | ...
    }
  }
}

// 强制重新生成分析
POST /api/analysis/{stockCode}/regenerate
Headers: { Authorization: "Bearer {token}" }
Response: { 
  success,
  message: "分析任务已提交，预计需要30秒",
  estimatedTime: 30
}

// 获取用户的分析历史
GET /api/analysis/history?page=1&limit=20
Headers: { Authorization: "Bearer {token}" }
Response: {
  analyses: [{ 
    stockCode, 
    stockName, 
    overallScore, 
    analyzedAt 
  }],
  total, page
}
```

##### 2.5 板块新闻
```javascript
// 获取板块新闻
GET /api/news/sectors
Response: {
  sectors: [
    {
      name: "科技板块",
      latestNews: {
        title, 
        publishTime,
        source
      },
      newsCount: 10  // 最近一周的新闻数
    }
  ]
}

// 获取某板块的新闻列表
GET /api/news/sector/{sectorName}?limit=10
Response: {
  news: [{ 
    id, 
    title, 
    source, 
    publishTime, 
    summary,
    url
  }]
}
```

##### 2.6 研究报告
```javascript
// 获取研究报告列表（可按股票筛选）
GET /api/reports?stockCode={code}&dateRange=1m&page=1&limit=20
Response: {
  reports: [{
    id, 
    title, 
    institution, 
    publishDate,
    stockCode,
    stockName,
    reportUrl
  }],
  total, page
}
```

#### 3. 界面串联设计（以AI分析为核心）

##### 3.1 核心用户流程
```
未登录用户:
首页 (浏览板块新闻) 
  → 点击搜索/登录按钮 
  → 登录/注册页 
  → 首页

已登录用户核心流程:
首页 
  → 搜索股票 (输入代码/名称)
  → 搜索结果页 (选择股票)
  → AI分析页 (查看深度分析)
  → 添加关注
  → 我的关注列表

辅助流程:
首页 
  → 我的关注快捷区 
  → 直接跳转到某股票的AI分析页

首页 
  → 点击板块新闻 
  → 展开该板块新闻列表 (弹窗或展开)
  → 点击新闻链接 (新标签页打开)
```

##### 3.2 页面导航和跳转

**全局导航栏（顶部固定）**
```
[Logo] [搜索框...] [我的关注] [研究报告] [用户头像▼]
                                              └─ 用户中心
                                              └─ 退出登录
```

- **Logo** → 首页
- **搜索框** 
  - 输入时显示下拉建议
  - 回车 → 搜索结果页
- **我的关注** → `/watchlist`
- **研究报告** → `/reports`
- **用户头像**（已登录）→ 下拉菜单
  - 用户中心 → `/user`
  - 退出登录
- **未登录状态** → 显示"登录"按钮 → `/login`

**首页 (`/`) 跳转逻辑**
- 板块新闻卡片点击 → 弹出该板块新闻列表（Modal）
- 新闻标题点击 → 新标签页打开外部链接
- "我的关注"区域股票点击 → `/stock/{code}/analysis`
- 空状态（未关注）→ 引导去搜索

**搜索页 (`/search`) 跳转逻辑**
- 搜索结果列表：
  - 股票名称点击 → `/stock/{code}/analysis`
  - 星标按钮 → 添加/取消关注（前端同步更新）

**AI分析页 (`/stock/:code/analysis`) 交互**
- 页面加载时自动调用分析接口
- 如果状态是 processing → 显示loading动画
- 如果状态是 completed → 渲染分析结果
- 关注按钮 → 切换关注状态
- "查看相关研究报告" → 跳转到 `/reports?stockCode={code}`

**我的关注页 (`/watchlist`) 跳转**
- 股票行点击 → `/stock/{code}/analysis`
- 取消关注按钮 → 删除该行（带确认）

**研究报告页 (`/reports`) 交互**
- 报告标题点击 → 新标签页打开 reportUrl
- 日期筛选 → 前端刷新列表

**用户中心 (`/user`) 交互**
- 修改信息 → 本页保存
- 分析历史列表点击 → `/stock/{code}/analysis`

##### 3.3 权限控制策略

**受保护的路由**（需要登录）:
- `/watchlist` - 我的关注
- `/stock/:code/analysis` - AI分析页
- `/user` - 用户中心

**权限拦截逻辑**:
```javascript
// 伪代码
if (访问受保护路由 && !已登录) {
  保存当前路径到 redirectUrl
  跳转到 /login
}

if (登录成功 && redirectUrl存在) {
  跳转到 redirectUrl
  清空 redirectUrl
} else if (登录成功) {
  跳转到 /
}
```

**Token管理**:
- Token存储在 localStorage
- 每次API请求自动带上 Authorization header
- 收到401响应 → 清除Token，跳转登录页并提示"登录已过期"
- 退出登录 → 清除Token，跳转首页

##### 3.4 状态管理设计

**方案选择**: 使用 **React Context + React Query**

**全局Context状态**:
```javascript
AuthContext: {
  user: { id, username, email } | null,
  token: string | null,
  login: (email, password) => Promise,
  register: (username, email, password) => Promise,
  logout: () => void
}

WatchlistContext: {
  watchlist: [{ code, name, industry, addedAt }],
  addToWatchlist: (stockCode) => Promise,
  removeFromWatchlist: (stockCode) => Promise,
  isWatched: (stockCode) => boolean,
  refreshWatchlist: () => Promise
}
```

**React Query缓存**:
- 股票搜索结果: 缓存5分钟
- 股票基本信息: 缓存30分钟
- AI分析结果: 缓存1小时（因为7天内不会变化）
- 板块新闻: 缓存10分钟
- 研究报告列表: 缓存30分钟

**本地存储**:
- `localStorage.token` - 用户Token（长期）
- `localStorage.searchHistory` - 搜索历史（最多10条）
- `sessionStorage.lastSearchKeyword` - 当前搜索词（会话级）

##### 3.5 页面布局结构

```
所有页面共享布局:
┌─────────────────────────────────────┐
│  导航栏 (Header)                     │
├─────────────────────────────────────┤
│                                     │
│  页面内容区 (Main Content)           │
│                                     │
│                                     │
└─────────────────────────────────────┘

特殊页面布局:
- 登录/注册页: 居中卡片，无导航栏
- 首页: 两栏布局（左板块新闻，右关注快捷区）
- AI分析页: 单栏布局，卡片式模块堆叠
```

##### 3.6 响应式设计考虑
- **桌面端** (>1024px): 完整布局
- **平板** (768px-1024px): 两栏变一栏，保持功能完整
- **手机** (<768px): 
  - 导航栏收起为汉堡菜单
  - 搜索框可收起
  - 卡片全宽显示
  - 雷达图适配小屏

#### 4. 技术栈建议

##### 4.1 核心框架
- **React 18** - UI框架
- **React Router v6** - 路由管理
- **TypeScript** (可选) - 类型安全

##### 4.2 状态管理与数据请求
- **React Context** - 全局认证和关注列表状态
- **React Query (TanStack Query)** - 服务端状态管理和缓存
- **Axios** - HTTP客户端

##### 4.3 UI组件库
- **Ant Design** 或 **Material-UI** - 提供现成组件
  - 表格、表单、按钮、Modal等
  - 减少开发时间
- **Recharts** 或 **ECharts** - 雷达图等数据可视化

##### 4.4 工具库
- **dayjs** - 日期格式化
- **lodash** - 工具函数（按需引入）

##### 4.5 构建工具
- **Create React App** 或 **Vite** - 快速启动项目
- **ESLint + Prettier** - 代码规范

##### 4.6 部署
- **GitHub Pages** - 静态托管（根据项目名推测）
- 需要配置路由为 HashRouter（或服务器端路由重定向）


# 股票助手(StockGenius)项目前端开发日志

[GUIDANCE] 
1. 开发过程中应保持更新开发日志
2. 你无需进行测试，我会根据交付验收标准来测试
3. 每阶段开发日志只需要包含3块: 总目标、子任务、交付验收标准，每阶段的开发内容都更新到这3块中