/**
 * 移动端搜索功能
 * 处理搜索框的显示/隐藏和搜索功能
 */

'use strict';

function log(...args) {
    // 调试模式开关
    const DEBUG = true;
    if (DEBUG) {
        console.log('[移动端搜索]', ...args);
    }
}

// 初始化移动端搜索功能
function initMobileSearch() {
    // 检查是否为移动端
    if (window.innerWidth > 768) {
        log('当前为桌面端，跳过移动端搜索初始化');
        return;
    }

    const blogMainLeft = document.querySelector('.blog-main-left,.home-main-left-v2');
    if (!blogMainLeft) {
        log('未找到 .blog-main-left 或 .home-main-left-v2，跳过移动端搜索初始化');
        return;
    }

    log('当前为移动端，开始初始化移动端搜索功能');

    // 创建移动端搜索元素
    createMobileSearchElements();

    // 绑定事件
    bindMobileSearchEvents();
}

// 创建移动端搜索元素
function createMobileSearchElements() {
    // 检查是否已经存在
    if (document.querySelector('.mobile-search-trigger')) {
        log('移动端搜索触发器已存在，跳过创建');
        return;
    }

    log('开始创建移动端搜索元素...');

    // 创建搜索触发按钮
    const trigger = document.createElement('div');
    trigger.className = 'mobile-search-trigger';
    trigger.innerHTML = `
            <div class="mobile-search-trigger-content">
                <i class="fa fa-search mobile-search-trigger-icon"></i>
                <span class="mobile-search-trigger-text">搜索文章、标签或内容...</span>
                <span class="mobile-search-trigger-shortcut">⌘K</span>
            </div>
        `;
    trigger.setAttribute('aria-label', '打开搜索');
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');

    // 创建搜索覆盖层
    const overlay = document.createElement('div');
    overlay.className = 'mobile-search-overlay';

    // 创建搜索容器
    const container = document.createElement('div');
    container.className = 'mobile-search-container';
    container.innerHTML = `
            <button class="mobile-search-close" aria-label="关闭搜索">
                <i class="fa fa-times"></i>
            </button>
            <form class="mobile-search-form" action="/Article/Search" method="get">
                <input type="text" class="mobile-search-input" name="keyword" placeholder="搜索文章、标签、内容..." autocomplete="off">
                <button type="submit" class="mobile-search-btn" aria-label="搜索">
                    <i class="fa fa-search"></i>
                </button>
            </form>
        `;

    // 将搜索触发器插入到文章列表顶部
    const blogMainLeft = document.querySelector('.blog-main-left,.home-main-left-v2');
    log('找到 .blog-main-left:', !!blogMainLeft);

    if (blogMainLeft) {
        // 查找第一个文章元素
        const firstArticle = blogMainLeft.querySelector('.article');
        // 查找桌面版搜索框
        const blogSearch = blogMainLeft.querySelector('.blog-search');

        log('找到 .blog-search:', !!blogSearch);
        log('找到 .article:', !!firstArticle);

        let insertTarget = null;

        // 如果存在桌面版搜索框，尝试插入在其后
        if (blogSearch && blogSearch.parentNode === blogMainLeft) {
            const nextSibling = blogSearch.nextElementSibling;
            if (nextSibling && nextSibling.parentNode === blogMainLeft) {
                insertTarget = nextSibling;
                log('插入位置：桌面搜索框后的元素', nextSibling.tagName);
            }
        }

        // 如果找不到合适位置且有文章，插入在第一篇文章前
        if (!insertTarget && firstArticle && firstArticle.parentNode === blogMainLeft) {
            insertTarget = firstArticle;
            log('插入位置：第一篇文章前');
        }

        // 执行插入操作
        if (insertTarget) {
            blogMainLeft.insertBefore(trigger, insertTarget);
            log('成功插入移动端搜索触发器');
        } else {
            // 如果找不到合适的位置，直接追加到末尾
            blogMainLeft.appendChild(trigger);
            log('追加移动端搜索触发器到末尾');
        }
    } else {
        // 备用方案：插入到主容器或body
        log('未找到 .blog-main-left，使用备用方案');
        const blogMain = document.querySelector('.blog-main');
        if (blogMain) {
            const blogMainFirstChild = blogMain.firstElementChild;
            if (blogMainFirstChild) {
                blogMain.insertBefore(trigger, blogMainFirstChild);
                log('插入到 .blog-main 开头');
            } else {
                blogMain.appendChild(trigger);
                log('追加到 .blog-main');
            }
        } else {
            document.body.appendChild(trigger);
            log('插入到 body');
        }
    }

    // 插入覆盖层和容器到 body
    document.body.appendChild(overlay);
    document.body.appendChild(container);

    // 确保初始状态是隐藏的
    overlay.style.display = 'none';
    overlay.style.visibility = 'hidden';
    container.style.display = 'none';
    container.style.visibility = 'hidden';

    log('移动端搜索元素创建完成并设置为隐藏状态');
}

// 绑定移动端搜索事件
function bindMobileSearchEvents() {
    const trigger = document.querySelector('.mobile-search-trigger');
    const overlay = document.querySelector('.mobile-search-overlay');
    const container = document.querySelector('.mobile-search-container');
    const closeBtn = document.querySelector('.mobile-search-close');
    const input = document.querySelector('.mobile-search-input');
    const form = document.querySelector('.mobile-search-form');

    if (!trigger || !overlay || !container || !closeBtn || !input || !form) {
        return;
    }

    // 打开搜索
    function openSearch() {
        // 先显示元素
        overlay.style.display = 'block';
        overlay.style.visibility = 'visible';
        container.style.display = 'block';
        container.style.visibility = 'visible';

        // 添加动画类
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            container.classList.add('active');

            // 聚焦输入框
            setTimeout(() => {
                input.focus();
            }, 300);
        });

        // 阻止页面滚动
        document.body.style.overflow = 'hidden';
        log('搜索框已打开');
    }

    // 关闭搜索
    function closeSearch() {
        overlay.classList.remove('active');
        container.classList.remove('active');

        // 恢复页面滚动
        document.body.style.overflow = '';

        // 延迟隐藏元素
        setTimeout(() => {
            if (!overlay.classList.contains('active')) {
                overlay.style.display = 'none';
                overlay.style.visibility = 'hidden';
                container.style.display = 'none';
                container.style.visibility = 'hidden';
                input.value = '';
                input.blur();
            }
        }, 300);

        log('搜索框已关闭');
    }

    // 搜索功能
    function performSearch(e) {
        e.preventDefault();
        const keywords = input.value.trim();

        if (!keywords) {
            input.focus();
            // 添加震动效果
            input.style.animation = 'shake 0.5s';
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
            return;
        }

        // 执行搜索
        const searchUrl = form.action + '?keyword=' + encodeURIComponent(keywords);
        window.location.href = searchUrl;
    }

    // 绑定事件监听器
    trigger.addEventListener('click', openSearch);
    closeBtn.addEventListener('click', closeSearch);
    overlay.addEventListener('click', closeSearch);
    form.addEventListener('submit', performSearch);

    // 键盘事件
    document.addEventListener('keydown', function (e) {
        // ESC 键关闭搜索
        if (e.key === 'Escape' && container.classList.contains('active')) {
            closeSearch();
        }

        // Ctrl/Cmd + K 打开搜索
        if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !container.classList.contains('active')) {
            e.preventDefault();
            openSearch();
        }
    });

    // 防止容器点击时关闭
    container.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    // 窗口大小改变时处理
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            // 如果切换到桌面端，关闭搜索并隐藏移动端搜索触发器
            if (container.classList.contains('active')) {
                closeSearch();
            }
            const mobileTrigger = document.querySelector('.mobile-search-trigger');
            if (mobileTrigger) {
                mobileTrigger.style.display = 'none';
            }
            log('切换到桌面端，隐藏移动端搜索功能');
        } else {
            // 如果切换到移动端，显示移动端搜索触发器
            const mobileTrigger = document.querySelector('.mobile-search-trigger');
            if (mobileTrigger) {
                mobileTrigger.style.display = 'block';
            }
            log('切换到移动端，显示移动端搜索功能');
        }
    });
}

// 添加震动动画CSS
function addShakeAnimation() {
    if (document.querySelector('#mobile-search-animations')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'mobile-search-animations';
    style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
                20%, 40%, 60%, 80% { transform: translateX(3px); }
            }
            
            .mobile-search-input {
                will-change: transform;
            }
        `;
    document.head.appendChild(style);
}

(function () {
    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            addShakeAnimation();
            initMobileSearch();
        });
    } else {
        addShakeAnimation();
        initMobileSearch();
    }

    // 窗口大小改变时重新初始化
    window.addEventListener('resize', function () {
        clearTimeout(window.mobileSearchResizeTimer);
        window.mobileSearchResizeTimer = setTimeout(function () {
            if (window.innerWidth <= 768) {
                initMobileSearch();
            }
        }, 250);
    });

})(); 