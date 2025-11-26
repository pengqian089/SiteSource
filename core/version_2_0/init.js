"use strict";

const dpzOption = {
    /**
     * webapi地址
     */
    webApiBaseAddress: document.querySelector("meta[name=web-api-base-address]").content,
    /**
     * cdn地址
     */
    CDNBaseAddress: document.querySelector("meta[name=cdn-base-address]").content,
    /**
     * 是否为 dark模式
     */
    isDark: window.matchMedia('(prefers-color-scheme: dark)').matches
};

if (dpzOption.isDark) {
    document
        .querySelector('#layui_theme_css')
        .setAttribute(
            'href',
            `${dpzOption.CDNBaseAddress}/lib/layui/css/layui-theme-dark.css`
        );
}

(async function () {
    let userResponse = await fetch("/account/GetUserInfo");
    let userResult = await userResponse.json();
    if (userResult["success"]) {
        $(".blog-user")
            .attr("href", "/account")
            .find("img")
            .attr({"src": `${userResult.data.avatar}`, "title": userResult.data.name});
    }

    let viewImages = ".article.shadow .article-left img,.mumble-list .mumble-item .mumble-content img,.article-detail-content img,#cd-timeline .content img";
    //图片查看
    $(document).delegate(viewImages, "click", function () {
        let index = layer.load(1);
        let images = $(viewImages);
        loadImages(images).then(x => {
            let items = [];
            for (let i = 0; i < x.length; i++) {
                let img = x[i];
                items.push({
                    src: img.src,
                    w: img.naturalWidth,
                    h: img.naturalHeight,
                    title: img.alt
                });
            }
            let imageIndex = images.index(this);
            let options = {
                index: imageIndex,
                bgOpacity: 0.7,
                showHideOpacity: true,
                history: true,
                getThumbBoundsFn: function (index) {
                    let thumbnail = document.querySelectorAll(viewImages)[index];
                    let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                    let rect = thumbnail.getBoundingClientRect();
                    return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
                }
            };
            let gallery = new PhotoSwipe(document.getElementById("gallery"), PhotoSwipeUI_Default, items, options);
            gallery.init();
        }).finally(() => layer.close(index));
    });

    // search
    $(document).delegate("#i-search", "submit", function () {
        const keyword = $("#i-keyword").val();
        let q = $(this).find("[name=q]");
        $(this).find("[name=q]").val(q.data("default") + " " + keyword);
    });

    $(document).delegate("#i-keyword", "keyup", function (e) {
        if (e.keyCode === 13) {
            $(this).parents("form").submit();
        }
    });

    $(document).delegate("#i-search a.search-btn", "click", function () {
        $(this).parents("form").submit();
    });

    // $(document).delegate("[data-tips]", "touchend", function () {
    //     let tips = $(this).data("tips");
    //     layer.tips(tips, this, { tips: 3 });
    // });

    $(document).delegate("[title]:not(.react-jinke-music-player-main *)", "touchend", function () {
        let title = $(this).attr("title");
        layer.tips(title, this, {tips: 3});
    });

    // $(document).delegate("[title]", "touchstart", function () {
    //     let current = $(this);
    //     setTimeout(() => {
    //         current.touchend(() => {
    //             let title = $(this).attr("title");
    //             layer.tips(title, this, {tips: 3});
    //         });
    //     }, 1000);
    //
    // });

    // const ap = new APlayer({
    //     container: document.getElementById("aplayer"),
    //     lrcType: 3,
    //     fixed: true
    // });

    let musicResponse = await fetch("/Music/Recommend/v2");
    let musics = await musicResponse.json();

    ReactJkMusicPlayer.defaultProps.quietUpdate = true;
    ReactJkMusicPlayer.defaultProps.locale = "zh_CN";
    ReactJkMusicPlayer.defaultProps.defaultPosition = {bottom: 0, left: 0};
    ReactJkMusicPlayer.defaultProps.preload = true;
    ReactJkMusicPlayer.defaultProps.glassBg = true;
    ReactJkMusicPlayer.defaultProps.autoPlay = false;
    ReactJkMusicPlayer.defaultProps.remove = false;
    ReactJkMusicPlayer.defaultProps.showMiniProcessBar = true;
    ReactJkMusicPlayer.defaultProps.showDownload = false;
    ReactJkMusicPlayer.defaultProps.showLyric = true;
    ReactJkMusicPlayer.defaultProps.showMediaSession = true;
    ReactJkMusicPlayer.defaultProps.showDestroy = false;
    ReactJkMusicPlayer.defaultProps.showReload = false;
    ReactJkMusicPlayer.defaultProps.volumeFade = {fadeIn: 300, fadeOut: 300};
    ReactJkMusicPlayer.defaultProps.sortableOptions = {disabled: true, forceFallback: true};
    ReactJkMusicPlayer.defaultProps.audioLists = musics;
    ReactDOM.render(
        React.createElement(ReactJkMusicPlayer),
        document.getElementById('music-player'),
    )

    let throttleTimer = null;
    let throttleDelay = 100;
    let $window = $(window);

    $window
        .off('scroll', scrollHandler)
        .on('scroll', scrollHandler);

    function scrollHandler(e) {
        clearTimeout(throttleTimer);
        throttleTimer = setTimeout(function () {
            // 顶部菜单滚动效果 - v2版本
            const navElement = document.querySelector('.blog-nav-v2');
            if (navElement) {
                if (window.scrollY > 0) {
                    navElement.classList.add('scrolled');
                } else {
                    navElement.classList.remove('scrolled');
                }
            }
        }, throttleDelay);
    }

    // 菜单激活状态管理
    function updateMenuActiveState() {
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const currentUrl = currentPath + currentSearch;
        
        // 清除所有激活状态
        document.querySelectorAll('.blog-nav-item-v2, .blog-nav-dropdown-item-v2, .blog-nav-mobile-item-v2, .blog-nav-mobile-submenu-item-v2').forEach(item => {
            item.classList.remove('nav-active-v2');
        });
        
        // 桌面端和移动端菜单项选择器
        const menuSelectors = [
            '.blog-nav-item-v2 > a[data-pjax]',
            '.blog-nav-dropdown-item-v2 > a[data-pjax]',
            '.blog-nav-mobile-item-v2 > a[data-pjax]',
            '.blog-nav-mobile-submenu-item-v2 > a[data-pjax]'
        ];
        
        let activeFound = false;
        
        // 遍历所有菜单项
        menuSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(link => {
                const href = link.getAttribute('href');
                if (href && (href === currentPath || href === currentUrl)) {
                    const parentLi = link.closest('li');
                    if (parentLi) {
                        parentLi.classList.add('nav-active-v2');
                        activeFound = true;
                        
                        // 如果是子菜单项，也激活父菜单
                        const parentDropdown = parentLi.closest('.blog-nav-item-v2');
                        if (parentDropdown) {
                            parentDropdown.classList.add('nav-active-v2');
                        }
                        
                        const parentMobileDropdown = parentLi.closest('.blog-nav-mobile-item-v2.has-submenu');
                        if (parentMobileDropdown) {
                            parentMobileDropdown.classList.add('nav-active-v2');
                            // 展开移动端子菜单
                            parentMobileDropdown.classList.add('submenu-open');
                        }
                    }
                }
            });
        });
        
        // 如果没有找到精确匹配，尝试部分匹配
        if (!activeFound) {
            menuSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && href !== '/' && currentPath.startsWith(href)) {
                        const parentLi = link.closest('li');
                        if (parentLi) {
                            parentLi.classList.add('nav-active-v2');
                            
                            // 如果是子菜单项，也激活父菜单
                            const parentDropdown = parentLi.closest('.blog-nav-item-v2');
                            if (parentDropdown) {
                                parentDropdown.classList.add('nav-active-v2');
                            }
                            
                            const parentMobileDropdown = parentLi.closest('.blog-nav-mobile-item-v2.has-submenu');
                            if (parentMobileDropdown) {
                                parentMobileDropdown.classList.add('nav-active-v2');
                                parentMobileDropdown.classList.add('submenu-open');
                            }
                        }
                    }
                });
            });
        }
    }

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
        
        // 防止重复初始化
        if (menuV2Initialized) {
            console.log('Menu v2 already initialized, skipping');
            return;
        }
        
        const navToggle = document.getElementById('blog-nav-toggle-v2');
        const navMobile = document.getElementById('blog-nav-mobile-v2');
        const navMask = document.getElementById('blog-nav-mask-v2');
        
        if (!navToggle || !navMobile || !navMask) {
            console.warn('Menu v2 elements not found', {
                navToggle: !!navToggle,
                navMobile: !!navMobile,
                navMask: !!navMask
            });
            return;
        }
        
        console.log('Initializing menu v2 events...');

        // 移动端菜单切换
        function handleToggleClick(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = navMobile.classList.contains('show');
            
            if (isOpen) {
                navMobile.classList.remove('show');
                navMask.classList.remove('show');
                document.body.style.overflow = '';
            } else {
                navMobile.classList.add('show');
                navMask.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        }

        // 点击遮罩关闭菜单
        function handleMaskClick() {
            navMobile.classList.remove('show');
            navMask.classList.remove('show');
            document.body.style.overflow = '';
        }

        // 移动端子菜单切换
        function handleSubmenuToggle(e) {
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
        navToggle.addEventListener('click', handleToggleClick);
        navMask.addEventListener('click', handleMaskClick);
        
        // 移动端子菜单切换
        const submenuToggles = document.querySelectorAll('.blog-nav-mobile-item-v2.has-submenu > a');
        submenuToggles.forEach(function(toggle) {
            toggle.addEventListener('click', handleSubmenuToggle);
            menuEventListeners.submenuToggles.push({
                element: toggle,
                handler: handleSubmenuToggle
            });
        });

        // 点击菜单项关闭移动端菜单
        const menuLinks = document.querySelectorAll('.blog-nav-mobile-v2 a[href]:not(.submenu-toggle)');
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
    }
    
    // 清理移动端菜单事件监听器
    function cleanupMenuV2() {
        console.log('cleanupMenuV2 called, current status:', menuV2Initialized);
        
        const navToggle = document.getElementById('blog-nav-toggle-v2');
        const navMobile = document.getElementById('blog-nav-mobile-v2');
        const navMask = document.getElementById('blog-nav-mask-v2');
        
        // 移除主要事件监听器
        if (navToggle && menuEventListeners.toggleClick) {
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
            return;
        }
        
        // 查找所有包含下拉菜单的菜单项
        const dropdownItems = document.querySelectorAll('.blog-nav-item-v2');
        
        dropdownItems.forEach(function(item) {
            const dropdown = item.querySelector('.blog-nav-dropdown-v2');
            
            if (!dropdown) return;
            
            let hoverTimer = null;
            
            // 创建命名函数以便管理事件监听器
            function handleItemEnter() {
                clearTimeout(hoverTimer);
                dropdown.classList.add('dropdown-visible');
                // 确保下拉菜单可见
                dropdown.style.display = 'block';
                dropdown.style.opacity = '1';
                dropdown.style.visibility = 'visible';
                dropdown.style.transform = 'translateY(0)';
                dropdown.style.pointerEvents = 'auto';
            }
            
            function handleItemLeave() {
                hoverTimer = setTimeout(function() {
                    dropdown.classList.remove('dropdown-visible');
                    // 隐藏下拉菜单
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
                // 确保下拉菜单可见
                dropdown.style.display = 'block';
                dropdown.style.opacity = '1';
                dropdown.style.visibility = 'visible';
                dropdown.style.transform = 'translateY(0)';
                dropdown.style.pointerEvents = 'auto';
            }
            
            function handleDropdownLeave() {
                hoverTimer = setTimeout(function() {
                    dropdown.classList.remove('dropdown-visible');
                    // 隐藏下拉菜单
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
    }
    
    // 清理桌面端下拉菜单事件监听器
    function cleanupDesktopDropdowns() {
        const dropdownItems = document.querySelectorAll('.blog-nav-item-v2');
        
        dropdownItems.forEach(function(item) {
            const dropdown = item.querySelector('.blog-nav-dropdown-v2');
            
            if (!dropdown || !item._dropdownHandlers) return;
            
            // 移除事件监听器
            item.removeEventListener('mouseenter', item._dropdownHandlers.itemEnter);
            item.removeEventListener('mouseleave', item._dropdownHandlers.itemLeave);
            dropdown.removeEventListener('mouseenter', item._dropdownHandlers.dropdownEnter);
            dropdown.removeEventListener('mouseleave', item._dropdownHandlers.dropdownLeave);
            
            // 清理引用
            delete item._dropdownHandlers;
        });
        
        desktopDropdownsInitialized = false;
    }

    // 初始化菜单
    initMenuV2();
    initDesktopDropdowns();
    
    // 页面加载时更新菜单状态
    updateMenuActiveState();
    
    // 暴露函数到全局作用域以便调试和测试
    window.initMenuV2 = initMenuV2;
    window.cleanupMenuV2 = cleanupMenuV2;
    window.initDesktopDropdowns = initDesktopDropdowns;
    window.cleanupDesktopDropdowns = cleanupDesktopDropdowns;
    window.updateMenuActiveState = updateMenuActiveState;
    
        // 监听pjax事件，在导航完成后更新菜单状态
    $(document).on('pjax:complete', function() {
        console.log('pjax:complete event triggered');
        
        // 清理旧的事件监听器，重新初始化菜单功能
        setTimeout(function() {
            console.log('Starting menu reinitialization after pjax...');
            
            // 清理桌面端下拉菜单
            cleanupDesktopDropdowns();
            
            // 清理移动端菜单事件监听器
            cleanupMenuV2();
            
            // 重新初始化
            initMenuV2();
            initDesktopDropdowns();
            updateMenuActiveState();
            
            console.log('Menu reinitialization completed after pjax');
        }, 100);
    });

    // 监听popstate事件（浏览器前进后退）
    window.addEventListener('popstate', function() {
        setTimeout(updateMenuActiveState, 100);
    });

})();