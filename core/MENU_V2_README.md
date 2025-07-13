# 菜单 2.0 版本使用说明

## 概述

菜单 2.0 版本是基于 `_design_system.css` 设计系统的全新菜单组件，提供了现代化、美观大气的用户界面和交互体验。

## 主要特性

### 🎨 现代化设计
- 毛玻璃效果（backdrop-filter）
- 渐变背景和边框
- 精美的悬停动画
- 彩色顶部装饰条

### 📱 响应式布局
- 桌面端：Logo居左、菜单居中、头像居右的优化布局 + 下拉子菜单
- 移动端：侧边滑出菜单 + 折叠子菜单
- 完美适配各种设备尺寸

### 🌙 暗色主题支持
- 自动适配系统暗色主题
- 独立的暗色配色方案
- 保持良好的对比度

### ⚡ 性能优化
- GPU 加速动画
- 节制动画模式支持
- 高效的 JavaScript 交互

### ♿ 无障碍访问
- 高对比度模式支持
- 键盘导航（ESC 键关闭菜单）
- 语义化 HTML 结构

## 文件结构

```
core/
├── css/version_2_0/
│   ├── _design_system.css          # 设计系统基础
│   └── menu_version_2_0.css        # 菜单样式
├── Views/Shared/Menu/
│   ├── _MenuPartial.cshtml         # 桌面端菜单
│   └── _LeftMenuPartial.cshtml     # 移动端菜单
├── version_2_0/
│   └── init.js                     # 菜单交互逻辑
└── menu_v2_demo.html               # 演示页面
```

## 使用方法

### 1. 引入样式文件

在 `_IncludeCssFilePartial.cshtml` 中确保引入：

```html
<link href="@baseAddress/css/version_2_0/menu_version_2_0.css" rel="stylesheet">
```

### 2. 更新 HTML 结构

桌面端菜单（`_MenuPartial.cshtml`）：
```html
<nav class="blog-nav-v2" id="blog-nav-v2">
    <div class="blog-nav-container-v2">
        <!-- 用户头像 -->
        <a class="blog-user-v2" href="#">
            <img src="..." alt="avatar"/>
        </a>
        
        <!-- Logo -->
        <a class="blog-logo-v2" href="/">
            <img src="..." alt="logo"/>
            <span>网站名称</span>
        </a>
        
        <!-- 导航菜单 -->
        <ul class="blog-nav-menu-v2">
            <li class="blog-nav-item-v2">
                <a href="/">
                    <i class="fa fa-home"></i>
                    <span>首页</span>
                </a>
            </li>
            <!-- 更多菜单项... -->
        </ul>
        
        <!-- 移动端切换按钮 -->
        <button class="blog-nav-toggle-v2" id="blog-nav-toggle-v2">
            <i class="fa fa-navicon"></i>
        </button>
    </div>
</nav>
```

移动端菜单（`_LeftMenuPartial.cshtml`）：
```html
<ul class="blog-nav-mobile-v2" id="blog-nav-mobile-v2">
    <li class="blog-nav-mobile-item-v2">
        <a href="/">
            <i class="fa fa-home"></i>
            <span>首页</span>
        </a>
    </li>
    <!-- 更多菜单项... -->
</ul>
```

### 3. 初始化 JavaScript

在 `init.js` 中调用 `initMenuV2()` 函数初始化菜单交互功能。

## CSS 类名说明

### 主要容器类
- `.blog-nav-v2` - 主导航容器
- `.blog-nav-container-v2` - 导航内容容器
- `.blog-nav-menu-v2` - 桌面端菜单列表
- `.blog-nav-mobile-v2` - 移动端菜单列表

### 菜单项类
- `.blog-nav-item-v2` - 桌面端菜单项
- `.blog-nav-mobile-item-v2` - 移动端菜单项
- `.blog-nav-dropdown-v2` - 下拉菜单容器
- `.blog-nav-dropdown-item-v2` - 下拉菜单项

### 状态类
- `.layui-this` - 激活状态
- `.show` - 显示状态（移动端菜单）
- `.scrolled` - 滚动状态（导航栏）
- `.submenu-open` - 子菜单展开状态

### 交互类
- `.blog-nav-toggle-v2` - 移动端切换按钮
- `.blog-nav-mask-v2` - 移动端遮罩层
- `.has-submenu` - 有子菜单的项目
- `.submenu-toggle` - 子菜单切换按钮

## 自定义配置

### 颜色配置
在 `_design_system.css` 中修改设计令牌：

```css
:root {
    --ds-primary-600: #8b5cf6;  /* 主色调 */
    --ds-primary-500: #a855f7;  /* 主色调变体 */
    /* 更多颜色配置... */
}
```

### 动画配置
```css
:root {
    --ds-duration-300: 300ms;   /* 动画持续时间 */
    --ds-easing-out: cubic-bezier(0, 0, 0.2, 1);  /* 动画缓动 */
}
```

### 间距配置
```css
:root {
    --ds-space-4: 1rem;        /* 16px */
    --ds-space-6: 1.5rem;      /* 24px */
    /* 更多间距配置... */
}
```

## 响应式断点

- **桌面端**: `>= 992px` - 显示水平菜单，Logo居左、菜单居中、头像居右
- **平板端**: `768px - 991px` - 显示移动端菜单按钮
- **手机端**: `< 768px` - 优化的移动端菜单体验

## 重要更新

### v2.1 (最新)
- **布局优化**: 重新设计桌面端布局，Logo移到左侧，用户头像移到右侧，菜单居中显示
- **样式冲突修复**: 使用 `nav-active-v2` 替代 `layui-this` 避免与Layui样式冲突
- **pjax支持**: 改进pjax导航时的菜单状态管理，自动更新激活状态
- **下拉菜单修复**: 修复桌面端下拉菜单的鼠标悬停问题
- **移动端优化**: 改进移动端菜单的交互逻辑和响应速度

## 浏览器支持

- Chrome 88+
- Firefox 94+
- Safari 14+
- Edge 88+

## 注意事项

1. **CSS 引入顺序**: 确保 `_design_system.css` 在 `menu_version_2_0.css` 之前引入
2. **JavaScript 依赖**: 需要 jQuery 和现代浏览器支持
3. **Font Awesome**: 确保引入 Font Awesome 图标字体
4. **z-index 层级**: 菜单使用 z-index: 1000，注意与其他组件的层级关系

## 迁移指南

从旧版菜单迁移到 2.0 版本：

1. 更新 HTML 结构中的 class 名称
2. 引入新的 CSS 文件
3. 更新 JavaScript 初始化代码
4. 测试响应式表现和交互功能

## 演示页面

查看 `menu_v2_demo.html` 了解完整的使用示例和效果展示。

## 技术支持

如有问题，请检查：
1. CSS 文件是否正确引入
2. JavaScript 是否正确初始化
3. HTML 结构是否符合要求
4. 浏览器控制台是否有错误信息 