# 个人中心系统 v2.0

一套现代化的会员个人中心管理系统，支持响应式设计和深色模式。

## 功能特性

### 🎯 基本设置
- **账号管理**：账号信息显示（只读）
- **个人信息**：昵称、性别、签名设置
- **头像管理**：头像上传与预览功能
- **安全设置**：双因素验证绑定/解绑
- **退出登录**：安全退出功能

### 📝 我的文章
- **文章列表**：展示所有文章，包含标题、简介、标签等信息
- **搜索功能**：支持按标题和标签搜索
- **发布文章**：完整的文章发布功能
- **编辑功能**：修改现有文章内容
- **删除确认**：安全的删除确认机制
- **数据统计**：查看量和评论量显示

### 💬 我的碎碎念
- **内容管理**：碎碎念列表展示和管理
- **搜索功能**：按内容搜索碎碎念
- **录音功能**：开始录音、停止录音、试听、上传
- **发布编辑**：发布新碎碎念和编辑现有内容
- **互动统计**：点赞数和评论数显示

### ⏰ 我的时间轴
- **时间轴管理**：时间轴列表展示
- **搜索功能**：按标题/内容搜索
- **录音支持**：集成录音功能
- **日期设置**：时间轴节点日期配置
- **链接管理**：更多链接配置
- **内容编辑**：完整的发布和编辑功能

### 📸 我的相册
- **照片展示**：网格布局展示照片
- **搜索功能**：按标签和描述搜索
- **上传功能**：照片上传和预览
- **标签管理**：照片标签分类
- **描述编辑**：照片描述管理
- **操作功能**：照片预览和删除

### 📱 响应式设计
- **多设备适配**：PC、平板、手机完美适配
- **触摸优化**：移动端触摸友好界面
- **自适应布局**：根据屏幕尺寸自动调整
- **流畅动画**：现代化的交互动画效果

### 🌙 深色模式
- **主题切换**：支持浅色/深色模式切换
- **自动保存**：主题偏好自动保存
- **完整适配**：所有组件都支持深色模式

### 🔗 锚点导航
- **URL锚点**：支持通过URL锚点直接访问特定页面
- **F5刷新**：刷新页面时自动切换到对应锚点页面并加载数据
- **浏览器前进后退**：支持浏览器的前进后退功能
- **书签支持**：可以将特定页面添加为书签
- **数据加载**：切换到锚点时自动加载对应页面的初始数据

## 文件结构

```
member_version_2_0/
├── index.html          # 主页面
├── demo.html           # 演示页面
├── test-modal.html     # 模态框测试页面
├── test-anchor.html    # 锚点功能测试页面
├── test-no-pjax.html   # 无PJAX功能测试页面
├── test-contrast.html  # 对比度测试页面
├── README.md           # 说明文档
├── css/
│   ├── member.css      # 主要样式文件
│   └── dark-mode.css   # 深色模式样式
└── js/
    └── member.js       # JavaScript功能文件
```

## 技术栈

- **HTML5**：语义化标签和现代HTML特性
- **CSS3**：Grid布局、Flexbox、CSS变量、动画
- **JavaScript ES6+**：类、箭头函数、模板字符串
- **jQuery**：DOM操作和事件处理
- **Font Awesome**：图标库
- **响应式设计**：移动优先的设计理念
- **锚点导航**：基于URL锚点的页面切换机制

## 数据结构

### VmArticleMini（文章）
```csharp
public class VmArticleMini : IMapFrom<Article>
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Introduction { get; set; }
    public string MainImage { get; set; }
    public int CommentCount { get; set; }
    public int ViewCount { get; set; }
    public List<string> ImagesAddress { get; set; }
    public List<string> Tags { get; set; }
    public VmUserInfo Author { get; set; }
    public string From { get; set; }
    public DateTime CreateTime { get; set; }
    public DateTime LastUpdateTime { get; set; }
}
```

### VmMumble（碎碎念）
```csharp
public class VmMumble : IMapFrom<Mumble>
{
    public string Id { get; set; }
    public string Markdown { get; set; }
    public string HtmlContent { get; set; }
    public DateTime CreateTime { get; set; }
    public DateTime LastUpdateTime { get; set; }
    public int Like { get; set; }
    public int CommentCount { get; set; }
    public VmUserInfo Author { get; set; }
}
```

### VmTimeline（时间轴）
```csharp
public class VmTimeline : IMapFrom<Timeline>
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public DateTime Date { get; set; }
    public string More { get; set; }
    public VmUserInfo Author { get; set; }
    public DateTime CreateTime { get; set; }
    public DateTime LastUpdateTime { get; set; }
}
```

### VmPictureRecord（相册）
```csharp
public class VmPictureRecord : IMapFrom<PictureRecord>
{
    public string Id { get; set; }
    public VmUserInfo Creator { get; set; }
    public DateTime UploadTime { get; set; }
    public List<string> Tags { get; set; }
    public string Description { get; set; }
    public PictureCategory Category { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public string AccessUrl { get; set; }
    public long Length { get; set; }
    public string Md5 { get; set; }
    public DateTime ObjectStorageUploadTime { get; set; }
}
```

## 使用方法

### 1. 基本使用
1. 打开 `demo.html` 查看功能演示
2. 点击"开始体验个人中心"进入主界面
3. 使用左侧导航切换不同功能模块

### 2. 主题切换
- 点击右上角的主题切换按钮
- 主题偏好会自动保存到本地存储

### 3. 响应式测试
- 在浏览器中调整窗口大小
- 或使用开发者工具的设备模拟功能

### 4. 锚点功能测试
- 打开 `test-anchor.html` 测试锚点功能
- 点击导航项查看URL变化
- 刷新页面验证锚点保持
- 使用浏览器前进后退按钮测试

### 5. 无PJAX功能测试
- 打开 `test-no-pjax.html` 测试无PJAX功能
- 验证切换到锚点时自动加载对应页面数据
- 观察数据加载状态变化
- 测试页面切换和数据加载的流畅性

### 6. 对比度测试
- 打开 `test-contrast.html` 测试对比度
- 切换浅色/深色模式
- 观察左侧菜单文字清晰度
- 验证所有状态下文字都清晰可见

### 7. 锚点URL示例
- 基本设置：`#profile`
- 我的文章：`#articles`
- 我的碎碎念：`#mumbles`
- 我的时间轴：`#timeline`
- 我的相册：`#photos`

## 自定义配置

### 修改主题色彩
在 `css/member.css` 中修改CSS变量：

```css
:root {
    --primary-color: #8b5cf6;      /* 主色调 */
    --primary-hover: #7c3aed;      /* 主色调悬停 */
    --success-color: #10b981;      /* 成功色 */
    --danger-color: #ef4444;       /* 危险色 */
    /* 更多变量... */
}
```

### 添加新功能模块
1. 在 `index.html` 中添加导航项和内容页面
2. 在 `css/member.css` 中添加样式
3. 在 `js/member.js` 中添加功能逻辑

### 集成到现有项目
1. 复制相关文件到项目目录
2. 修改API接口地址
3. 调整样式以匹配项目主题
4. 集成用户认证系统

## API接口

### 用户信息
```javascript
// 获取用户信息
GET /api/user/profile

// 更新用户信息
PUT /api/user/profile

// 上传头像
POST /api/user/avatar

// 双因素验证
POST /api/user/2fa/bind
POST /api/user/2fa/unbind
```

### 文章管理
```javascript
// 获取文章列表
GET /api/articles?page=1&size=10&title=&tags=

// 创建文章
POST /api/articles

// 更新文章
PUT /api/articles/{id}

// 删除文章
DELETE /api/articles/{id}
```

### 碎碎念管理
```javascript
// 获取碎碎念列表
GET /api/mumbles?page=1&size=10&content=

// 创建碎碎念
POST /api/mumbles

// 更新碎碎念
PUT /api/mumbles/{id}

// 删除碎碎念
DELETE /api/mumbles/{id}
```

### 时间轴管理
```javascript
// 获取时间轴列表
GET /api/timeline?page=1&size=10&keyword=

// 创建时间轴
POST /api/timeline

// 更新时间轴
PUT /api/timeline/{id}

// 删除时间轴
DELETE /api/timeline/{id}
```

### 相册管理
```javascript
// 获取照片列表
GET /api/photos?page=1&size=10&tags=&description=

// 上传照片
POST /api/photos

// 更新照片信息
PUT /api/photos/{id}

// 删除照片
DELETE /api/photos/{id}
```

## 浏览器兼容性

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+
- **移动端浏览器** 支持

## 性能优化

- **CSS优化**：使用CSS变量减少重复代码
- **JavaScript优化**：事件委托和防抖处理
- **图片优化**：懒加载和压缩
- **缓存策略**：本地存储主题偏好

## 安全考虑

- **XSS防护**：输入内容转义处理
- **CSRF防护**：API请求添加token
- **文件上传**：文件类型和大小限制
- **权限控制**：用户身份验证

## 开发计划

- [ ] 添加分页功能
- [ ] 支持文件拖拽上传
- [ ] 添加数据导出功能
- [ ] 支持多语言
- [ ] 添加数据统计图表
- [ ] 支持主题自定义

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱：your-email@example.com
- 项目地址：https://github.com/your-username/member-center

---

**注意**：这是一个演示版本，实际使用时需要根据具体项目需求进行调整和优化。