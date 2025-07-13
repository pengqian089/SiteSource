# 菜单测试指南

## 概述

本指南提供了多种测试页面和方法来验证菜单系统（特别是 pjax 切换后的菜单功能）是否正常工作。

## 测试页面

### 1. 简化菜单测试页面 (`simple_menu_test.html`)

**推荐使用** - 这是最可靠的测试页面，使用内联脚本避免异步加载问题。

#### 特点
- ✅ 使用内联脚本，避免异步加载问题
- ✅ 完整的菜单结构（桌面端和移动端）
- ✅ 详细的调试日志
- ✅ 实时状态反馈
- ✅ 自动初始化和测试

#### 使用方法
1. 打开 `/core/simple_menu_test.html`
2. 将浏览器窗口缩小到移动端尺寸（宽度 < 992px）
3. 观察页面自动初始化菜单
4. 点击"测试汉堡菜单"按钮
5. 查看调试日志和状态反馈

#### 测试功能
- **检查菜单元素** - 验证所有菜单元素是否存在
- **初始化菜单** - 手动初始化菜单功能
- **测试汉堡菜单** - 测试菜单开关功能
- **清空日志** - 清理调试信息

### 2. PJAX 菜单测试页面 (`pjax_menu_test.html`)

用于测试 pjax 导航后的菜单功能，需要配合测试脚本使用。

#### 特点
- 🔄 模拟 pjax 导航
- 📊 事件监听器检查
- 🔧 强制重新初始化功能
- 📝 详细的调试信息

#### 使用方法
1. 确保 `test_menu_fix.js` 已加载
2. 打开 `/core/pjax_menu_test.html`
3. 等待页面初始化完成
4. 测试 pjax 导航和菜单功能

### 3. 菜单演示页面 (`menu_v2_demo.html`)

纯演示页面，展示菜单的视觉效果和基本交互。

## 测试步骤

### 基本功能测试

1. **桌面端下拉菜单测试**
   - 将浏览器窗口调整到桌面端尺寸（宽度 ≥ 992px）
   - 将鼠标悬停在"其它内容"菜单项上
   - 验证下拉菜单是否正确显示
   - 检查下拉菜单项是否可点击

2. **移动端汉堡菜单测试**
   - 将浏览器窗口缩小到移动端尺寸（宽度 < 992px）
   - 点击汉堡菜单按钮（三条横线图标）
   - 验证侧边菜单是否滑出
   - 点击遮罩层或菜单项，验证菜单是否关闭

3. **移动端子菜单测试**
   - 在移动端菜单中，点击"其它内容"项
   - 验证子菜单是否展开
   - 再次点击验证子菜单是否收起

### PJAX 功能测试

1. **初始状态测试**
   - 打开测试页面
   - 验证菜单功能是否正常

2. **PJAX 导航后测试**
   - 点击页面中的 pjax 链接进行导航
   - 等待页面内容更新
   - 再次测试菜单功能是否仍然正常

3. **重复导航测试**
   - 多次进行 pjax 导航
   - 每次导航后都测试菜单功能
   - 检查是否有内存泄漏或重复绑定问题

## 故障排除

### 常见问题

#### 1. 汉堡菜单按钮无反应

**症状**：点击汉堡菜单按钮，移动端菜单不出现

**可能原因**：
- 事件监听器未正确绑定
- JavaScript 脚本加载失败
- 元素 ID 不匹配

**解决方法**：
1. 使用 `simple_menu_test.html` 进行测试
2. 检查浏览器控制台是否有错误
3. 点击"检查菜单元素"按钮验证元素存在
4. 点击"初始化菜单"按钮重新初始化

#### 2. PJAX 导航后菜单失效

**症状**：pjax 导航完成后，菜单功能停止工作

**可能原因**：
- 事件监听器在 pjax 导航后丢失
- 重新初始化逻辑未正确执行
- 时序问题导致初始化失败

**解决方法**：
1. 使用 `pjax_menu_test.html` 进行诊断
2. 点击"强制重新初始化"按钮
3. 检查控制台日志中的初始化信息
4. 验证 `test_menu_fix.js` 是否正确加载

#### 3. 桌面端下拉菜单不显示

**症状**：鼠标悬停在"其它内容"上，下拉菜单不出现

**可能原因**：
- CSS z-index 层级问题
- 容器 overflow 设置问题
- CSS 变量未正确加载

**解决方法**：
1. 检查浏览器开发者工具中的元素样式
2. 验证 `--ds-*` CSS 变量是否已定义
3. 检查容器元素的 overflow 属性
4. 使用"切换调试模式"功能强制显示下拉菜单

### 调试技巧

#### 1. 使用浏览器开发者工具

- **Elements 面板**：检查菜单元素的 HTML 结构和 CSS 样式
- **Console 面板**：查看 JavaScript 错误和调试日志
- **Network 面板**：验证 CSS 和 JS 文件是否正确加载

#### 2. 检查事件监听器

```javascript
// 在控制台中执行，检查汉堡菜单按钮的事件监听器
const toggleBtn = document.getElementById('blog-nav-toggle-v2');
console.log('Toggle button:', toggleBtn);
console.log('Has onclick:', toggleBtn.onclick !== null);

// 检查是否有 addEventListener 绑定的事件
if (toggleBtn) {
    // 手动触发点击事件测试
    toggleBtn.click();
}
```

#### 3. 强制初始化菜单

```javascript
// 在控制台中强制初始化菜单（如果测试脚本已加载）
if (typeof window.testMenuForceInit === 'function') {
    window.testMenuForceInit();
} else {
    console.log('测试脚本未加载');
}
```

#### 4. 检查 CSS 变量

```javascript
// 检查 CSS 变量是否正确加载
const testEl = document.createElement('div');
document.body.appendChild(testEl);
const computed = window.getComputedStyle(testEl);
const bgPrimary = computed.getPropertyValue('--ds-bg-primary');
console.log('CSS 变量 --ds-bg-primary:', bgPrimary);
document.body.removeChild(testEl);
```

## 测试清单

### 功能测试清单

- [ ] 桌面端下拉菜单正常显示和隐藏
- [ ] 移动端汉堡菜单正常开关
- [ ] 移动端子菜单正常展开和收起
- [ ] 点击遮罩层关闭移动端菜单
- [ ] 点击菜单项关闭移动端菜单
- [ ] ESC 键关闭移动端菜单
- [ ] 窗口大小变化时菜单正确响应

### PJAX 测试清单

- [ ] 初始页面加载后菜单功能正常
- [ ] PJAX 导航后菜单功能仍然正常
- [ ] 多次 PJAX 导航后菜单功能稳定
- [ ] 控制台无重复绑定警告
- [ ] 控制台无内存泄漏警告

### 兼容性测试清单

- [ ] Chrome 浏览器测试通过
- [ ] Firefox 浏览器测试通过
- [ ] Safari 浏览器测试通过
- [ ] Edge 浏览器测试通过
- [ ] 移动端 Chrome 测试通过
- [ ] 移动端 Safari 测试通过

## 性能监控

### 监控指标

1. **事件监听器数量**：确保没有重复绑定
2. **内存使用**：检查是否存在内存泄漏
3. **DOM 操作频率**：避免不必要的 DOM 操作
4. **CSS 重绘次数**：优化动画性能

### 监控方法

```javascript
// 监控事件监听器数量
function countEventListeners() {
    const elements = document.querySelectorAll('*');
    let count = 0;
    elements.forEach(el => {
        const events = getEventListeners(el);
        if (events) {
            Object.keys(events).forEach(type => {
                count += events[type].length;
            });
        }
    });
    console.log('Total event listeners:', count);
}

// 在 pjax 导航前后调用此函数比较
```

## 结论

通过使用本指南中的测试方法和故障排除技巧，您应该能够：

1. ✅ 验证菜单系统的所有功能是否正常工作
2. ✅ 诊断和修复 pjax 导航相关的菜单问题
3. ✅ 确保菜单系统在不同浏览器和设备上的兼容性
4. ✅ 监控和优化菜单系统的性能

如果遇到本指南未涵盖的问题，请检查浏览器控制台的错误信息，并参考相关的修复文档。 