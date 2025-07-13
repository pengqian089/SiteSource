"use strict";

// 测试用菜单修复脚本
// 解决 pjax 切换页面后汉堡菜单按钮无效的问题

(function() {
    console.log('Test menu fix script loaded');
    
    // 全局变量，用于跟踪事件监听器状态
    let menuV2Initialized = false;
    let desktopDropdownsInitialized = false;
    
    // 存储事件监听器引用以便清理
    let menuEventListeners = {
        toggleClick: null,
        maskClick: null,
        submenuToggles: [],
        menuLinks: [],
        resize: null,
        keydown: null
    };

    // 菜单交互功能 - v2版本
    function initMenuV2() {
        console.log('initMenuV2 called, current status:', menuV2Initialized);
        
        const navToggle = document.getElementById('blog-nav-toggle-v2');
        const navMobile = document.getElementById('blog-nav-mobile-v2');
        const navMask = document.getElementById('blog-nav-mask-v2');
        
        console.log('Menu elements found:', {
            navToggle: !!navToggle,
            navMobile: !!navMobile,
            navMask: !!navMask
        });
        
        if (!navToggle || !navMobile || !navMask) {
            console.warn('Menu v2 elements not found');
            return false;
        }
        
        // 强制清理旧的事件监听器（如果存在）
        if (menuEventListeners.toggleClick) {
            console.log('Removing existing toggle click listener');
            navToggle.removeEventListener('click', menuEventListeners.toggleClick);
        }
        
        console.log('Initializing menu v2 events...');

        // 移动端菜单切换
        function handleToggleClick(e) {
            console.log('Toggle button clicked - event triggered successfully');
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = navMobile.classList.contains('show');
            console.log('Current menu state before toggle:', isOpen ? 'open' : 'closed');
            
            if (isOpen) {
                navMobile.classList.remove('show');
                navMask.classList.remove('show');
                document.body.style.overflow = '';
                console.log('Menu closed successfully');
            } else {
                navMobile.classList.add('show');
                navMask.classList.add('show');
                document.body.style.overflow = 'hidden';
                console.log('Menu opened successfully');
            }
            
            // 验证状态更改
            const newState = navMobile.classList.contains('show');
            console.log('Menu state after toggle:', newState ? 'open' : 'closed');
        }

        // 点击遮罩关闭菜单
        function handleMaskClick() {
            console.log('Mask clicked');
            navMobile.classList.remove('show');
            navMask.classList.remove('show');
            document.body.style.overflow = '';
        }

        // 移动端子菜单切换
        function handleSubmenuToggle(e) {
            console.log('Submenu toggle clicked');
            e.preventDefault();
            e.stopPropagation();
            
            const parentItem = this.parentElement;
            const isOpen = parentItem.classList.contains('submenu-open');
            
            // 关闭所有其他子菜单
            document.querySelectorAll('.blog-nav-mobile-item-v2.has-submenu').forEach(function(item) {
                if (item !== parentItem) {
                    item.classList.remove('submenu-open');
                }
            });
            
            // 切换当前子菜单
            if (isOpen) {
                parentItem.classList.remove('submenu-open');
            } else {
                parentItem.classList.add('submenu-open');
            }
        }

        // 点击菜单项关闭移动端菜单
        function handleMenuLinkClick() {
            console.log('Menu link clicked');
            // 延迟关闭以确保导航完成
            setTimeout(function() {
                if (navMobile && navMask) {
                    navMobile.classList.remove('show');
                    navMask.classList.remove('show');
                    document.body.style.overflow = '';
                }
            }, 100);
        }

        // 响应式处理
        function handleResize() {
            if (window.innerWidth >= 992) {
                if (navMobile && navMask) {
                    navMobile.classList.remove('show');
                    navMask.classList.remove('show');
                    document.body.style.overflow = '';
                }
            }
        }
        
        // ESC键关闭菜单
        function handleKeydown(e) {
            if (e.key === 'Escape' && navMobile && navMobile.classList.contains('show')) {
                navMobile.classList.remove('show');
                navMask.classList.remove('show');
                document.body.style.overflow = '';
            }
        }

        // 存储事件监听器引用
        menuEventListeners.toggleClick = handleToggleClick;
        menuEventListeners.maskClick = handleMaskClick;
        menuEventListeners.resize = handleResize;
        menuEventListeners.keydown = handleKeydown;

        // 绑定事件
        console.log('Binding click event to toggle button...');
        navToggle.addEventListener('click', handleToggleClick);
        console.log('Toggle button event listener bound successfully');
        
        // 测试事件监听器是否正确绑定
        console.log('Testing event listener binding...');
        const testEvent = new Event('click', { bubbles: true, cancelable: true });
        let eventFired = false;
        
        // 临时监听器来验证事件是否触发
        function testListener() {
            eventFired = true;
            console.log('Test event fired successfully');
        }
        
        navToggle.addEventListener('click', testListener);
        navToggle.dispatchEvent(testEvent);
        navToggle.removeEventListener('click', testListener);
        
        if (!eventFired) {
            console.error('Event listener test failed - events not firing');
            return false;
        }
        
        navMask.addEventListener('click', handleMaskClick);
        
        // 移动端子菜单切换
        const submenuToggles = document.querySelectorAll('.blog-nav-mobile-item-v2.has-submenu > a');
        console.log('Found submenu toggles:', submenuToggles.length);
        submenuToggles.forEach(function(toggle) {
            toggle.addEventListener('click', handleSubmenuToggle);
            menuEventListeners.submenuToggles.push({
                element: toggle,
                handler: handleSubmenuToggle
            });
        });

        // 点击菜单项关闭移动端菜单
        const menuLinks = document.querySelectorAll('.blog-nav-mobile-v2 a[href]:not(.submenu-toggle)');
        console.log('Found menu links:', menuLinks.length);
        menuLinks.forEach(function(link) {
            link.addEventListener('click', handleMenuLinkClick);
            menuEventListeners.menuLinks.push({
                element: link,
                handler: handleMenuLinkClick
            });
        });

        window.addEventListener('resize', handleResize);
        document.addEventListener('keydown', handleKeydown);
        
        menuV2Initialized = true;
        console.log('Menu v2 initialization completed successfully');
        return true;
    }
    
    // 清理移动端菜单事件监听器
    function cleanupMenuV2() {
        console.log('cleanupMenuV2 called, current status:', menuV2Initialized);
        
        const navToggle = document.getElementById('blog-nav-toggle-v2');
        const navMobile = document.getElementById('blog-nav-mobile-v2');
        const navMask = document.getElementById('blog-nav-mask-v2');
        
        // 移除主要事件监听器
        if (navToggle && menuEventListeners.toggleClick) {
            console.log('Removing toggle click listener');
            navToggle.removeEventListener('click', menuEventListeners.toggleClick);
        }
        
        if (navMask && menuEventListeners.maskClick) {
            navMask.removeEventListener('click', menuEventListeners.maskClick);
        }
        
        if (menuEventListeners.resize) {
            window.removeEventListener('resize', menuEventListeners.resize);
        }
        
        if (menuEventListeners.keydown) {
            document.removeEventListener('keydown', menuEventListeners.keydown);
        }
        
        // 移除子菜单切换事件监听器
        menuEventListeners.submenuToggles.forEach(function(item) {
            if (item.element && item.handler) {
                item.element.removeEventListener('click', item.handler);
            }
        });
        
        // 移除菜单链接事件监听器
        menuEventListeners.menuLinks.forEach(function(item) {
            if (item.element && item.handler) {
                item.element.removeEventListener('click', item.handler);
            }
        });
        
        // 重置事件监听器引用
        menuEventListeners = {
            toggleClick: null,
            maskClick: null,
            submenuToggles: [],
            menuLinks: [],
            resize: null,
            keydown: null
        };
        
        // 重置初始化状态
        menuV2Initialized = false;
        
        // 确保菜单处于关闭状态
        if (navMobile && navMask) {
            navMobile.classList.remove('show');
            navMask.classList.remove('show');
            document.body.style.overflow = '';
        }
        
        console.log('Menu v2 cleanup completed');
    }

    // 桌面端下拉菜单处理
    function initDesktopDropdowns() {
        // 防止重复初始化
        if (desktopDropdownsInitialized) {
            console.log('Desktop dropdowns already initialized, skipping');
            return;
        }
        
        console.log('Initializing desktop dropdowns...');
        
        // 查找所有包含下拉菜单的菜单项
        const dropdownItems = document.querySelectorAll('.blog-nav-item-v2');
        console.log('Found dropdown items:', dropdownItems.length);
        
        dropdownItems.forEach(function(item) {
            const dropdown = item.querySelector('.blog-nav-dropdown-v2');
            
            if (!dropdown) return;
            
            let hoverTimer = null;
            
            // 创建命名函数以便管理事件监听器
            function handleItemEnter() {
                clearTimeout(hoverTimer);
                dropdown.classList.add('dropdown-visible');
                dropdown.style.display = 'block';
                dropdown.style.opacity = '1';
                dropdown.style.visibility = 'visible';
                dropdown.style.transform = 'translateY(0)';
                dropdown.style.pointerEvents = 'auto';
            }
            
            function handleItemLeave() {
                hoverTimer = setTimeout(function() {
                    dropdown.classList.remove('dropdown-visible');
                    dropdown.style.display = 'none';
                    dropdown.style.opacity = '0';
                    dropdown.style.visibility = 'hidden';
                    dropdown.style.transform = 'translateY(-10px)';
                    dropdown.style.pointerEvents = 'none';
                }, 150);
            }
            
            function handleDropdownEnter() {
                clearTimeout(hoverTimer);
                dropdown.classList.add('dropdown-visible');
                dropdown.style.display = 'block';
                dropdown.style.opacity = '1';
                dropdown.style.visibility = 'visible';
                dropdown.style.transform = 'translateY(0)';
                dropdown.style.pointerEvents = 'auto';
            }
            
            function handleDropdownLeave() {
                hoverTimer = setTimeout(function() {
                    dropdown.classList.remove('dropdown-visible');
                    dropdown.style.display = 'none';
                    dropdown.style.opacity = '0';
                    dropdown.style.visibility = 'hidden';
                    dropdown.style.transform = 'translateY(-10px)';
                    dropdown.style.pointerEvents = 'none';
                }, 150);
            }
            
            // 绑定事件监听器
            item.addEventListener('mouseenter', handleItemEnter);
            item.addEventListener('mouseleave', handleItemLeave);
            dropdown.addEventListener('mouseenter', handleDropdownEnter);
            dropdown.addEventListener('mouseleave', handleDropdownLeave);
            
            // 存储事件监听器引用以便清理
            item._dropdownHandlers = {
                itemEnter: handleItemEnter,
                itemLeave: handleItemLeave,
                dropdownEnter: handleDropdownEnter,
                dropdownLeave: handleDropdownLeave
            };
        });
        
        desktopDropdownsInitialized = true;
        console.log('Desktop dropdowns initialization completed');
    }
    
    function cleanupDesktopDropdowns() {
        console.log('Cleaning up desktop dropdowns...');
        
        const dropdownItems = document.querySelectorAll('.blog-nav-item-v2');
        
        dropdownItems.forEach(function(item) {
            const dropdown = item.querySelector('.blog-nav-dropdown-v2');
            
            if (!dropdown || !item._dropdownHandlers) return;
            
            item.removeEventListener('mouseenter', item._dropdownHandlers.itemEnter);
            item.removeEventListener('mouseleave', item._dropdownHandlers.itemLeave);
            dropdown.removeEventListener('mouseenter', item._dropdownHandlers.dropdownEnter);
            dropdown.removeEventListener('mouseleave', item._dropdownHandlers.dropdownLeave);
            
            delete item._dropdownHandlers;
        });
        
        desktopDropdownsInitialized = false;
        console.log('Desktop dropdowns cleanup completed');
    }

    // 强制初始化函数 - 不检查状态，强制重新初始化
    function forceInitialize() {
        console.log('Force initializing menu...');
        
        // 强制重置状态
        menuV2Initialized = false;
        desktopDropdownsInitialized = false;
        
        // 清理现有事件监听器
        cleanupMenuV2();
        cleanupDesktopDropdowns();
        
        // 重新初始化
        const success = initMenuV2();
        initDesktopDropdowns();
        
        console.log('Force initialization completed, success:', success);
        return success;
    }

    // 初始化函数
    function initialize() {
        console.log('Starting menu initialization...');
        const success = initMenuV2();
        initDesktopDropdowns();
        console.log('Menu initialization completed, success:', success);
        return success;
    }

    // 完整的重新初始化函数
    function reinitialize() {
        console.log('Starting menu reinitialization...');
        cleanupDesktopDropdowns();
        cleanupMenuV2();
        const success = initialize();
        console.log('Menu reinitialization completed, success:', success);
        return success;
    }

    // 监听pjax事件
    $(document).on('pjax:complete', function() {
        console.log('pjax:complete event triggered in test script');
        setTimeout(function() {
            reinitialize();
        }, 100);
    });

    // 暴露函数到全局作用域
    window.testMenuInit = initialize;
    window.testMenuReinit = reinitialize;
    window.testMenuForceInit = forceInitialize;
    window.testMenuCleanup = function() {
        cleanupDesktopDropdowns();
        cleanupMenuV2();
    };

    // 页面加载完成后自动初始化
    $(document).ready(function() {
        console.log('Document ready, starting test menu initialization...');
        setTimeout(function() {
            const success = forceInitialize();
            console.log('Test menu auto-initialization completed, success:', success);
        }, 500);
    });

})(); 