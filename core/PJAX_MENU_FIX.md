# PJAX 菜单修复说明

## 问题描述

在使用pjax进行页面导航后，移动端汉堡菜单按钮（`#blog-nav-toggle-v2`）失效，无法打开/关闭移动端菜单。

## 问题原因

1. **事件监听器丢失**：pjax导航后，原有的事件监听器被清理，但没有正确重新绑定
2. **重复初始化问题**：`menuV2Initialized` 标志位没有正确重置，导致重新初始化被跳过
3. **事件监听器清理不完整**：只清理了桌面端下拉菜单的事件监听器，没有清理移动端菜单的事件监听器

## 修复方案

### 1. 添加事件监听器管理机制

在 `core/version_2_0/init.js` 中添加了事件监听器引用管理：

```javascript
// 存储事件监听器引用以便清理
let menuEventListeners = {
    toggleClick: null,
    maskClick: null,
    submenuToggles: [],
    menuLinks: [],
    resize: null,
    keydown: null
};
```

### 2. 完善清理函数

添加了 `cleanupMenuV2()` 函数，用于清理所有移动端菜单相关的事件监听器：

```javascript
function cleanupMenuV2() {
    // 移除主要事件监听器
    if (navToggle && menuEventListeners.toggleClick) {
        navToggle.removeEventListener('click', menuEventListeners.toggleClick);
    }
    
    // 移除子菜单和菜单链接的事件监听器
    menuEventListeners.submenuToggles.forEach(function(item) {
        if (item.element && item.handler) {
            item.element.removeEventListener('click', item.handler);
        }
    });
    
    // 重置状态和引用
    menuEventListeners = { /* 重置所有引用 */ };
    menuV2Initialized = false;
}
```

### 3. 修改pjax事件处理

在pjax完成后，正确清理和重新初始化菜单：

```javascript
$(document).on('pjax:complete', function() {
    setTimeout(function() {
        // 清理桌面端下拉菜单
        cleanupDesktopDropdowns();
        
        // 清理移动端菜单事件监听器
        cleanupMenuV2();
        
        // 重新初始化
        initMenuV2();
        initDesktopDropdowns();
        updateMenuActiveState();
    }, 100);
});
```

## 修复的文件

- `core/version_2_0/init.js` - 主要修复文件
- `core/pjax_menu_test.html` - 新增测试页面

## 测试方法

1. 打开 `core/pjax_menu_test.html` 测试页面
2. 缩小浏览器窗口到移动端尺寸（宽度 < 992px）
3. 点击汉堡菜单按钮，确认菜单可以正常打开/关闭
4. 点击页面中的PJAX导航链接进行页面切换
5. 再次测试汉堡菜单按钮是否仍然有效

### 测试工具

测试页面提供了以下调试工具：

- **测试汉堡菜单** - 直接测试菜单开关功能
- **模拟PJAX导航** - 模拟pjax事件触发
- **检查事件监听器** - 检查事件监听器绑定状态

## 预期结果

修复后应该达到以下效果：

1. ✅ PJAX导航前后，汉堡菜单按钮都能正常工作
2. ✅ 事件监听器正确清理和重新绑定，无内存泄漏
3. ✅ 控制台不出现重复绑定的警告
4. ✅ 移动端子菜单展开/收起功能正常
5. ✅ 菜单项点击后正确关闭移动端菜单

## 兼容性说明

此修复方案：

- ✅ 保持向后兼容性
- ✅ 不影响桌面端下拉菜单功能
- ✅ 不影响其他pjax功能
- ✅ 支持所有现代浏览器

## 注意事项

1. 确保在pjax配置中正确包含菜单相关的选择器
2. 如果有自定义的菜单事件处理，需要类似的清理机制
3. 建议在开发环境中使用测试页面验证修复效果

## 后续优化建议

1. 考虑使用事件委托减少事件监听器数量
2. 添加更详细的错误处理和日志记录
3. 考虑将菜单功能封装为独立的模块 