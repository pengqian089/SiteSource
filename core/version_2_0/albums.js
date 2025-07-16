/**
 * 相册页面 JavaScript 2.0 版本 - 使用 PhotoSwipe
 * 实现瀑布流布局、自动加载更多、PhotoSwipe 图片预览等功能
 */

(function() {
    'use strict';

    // 全局变量
    let isLoading = false;
    let hasMorePages = true;
    let observerInstance = null;
    let loadingElement = null;
    let noMoreElement = null;
    let masonryContainer = null;
    
    // 事件监听器引用
    let eventListeners = {
        click: null,
        load: null,
        error: null,
        resize: null,
        scroll: null
    };
    
    // 相册数据
    let albumsData = {
        currentPage: 1,
        pageSize: 20,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        pictures: []
    };

    // 配置选项
    const config = {
        loadThreshold: 200, // 距离底部多少像素开始加载
        loadDelay: 500, // 加载延迟（毫秒）
        animationDelay: 100, // 动画延迟（毫秒）
        maxRetries: 3, // 最大重试次数
        retryDelay: 1000, // 重试延迟（毫秒）
        preloadCount: 3, // 预加载图片数量
    };

    // 初始化函数
    function init() {
        try {
            // 检查jQuery依赖
            if (typeof $ === 'undefined') {
                console.error('jQuery is required for albums page');
                return;
            }

            // 检查必要的数据
            if (!albumsData || !albumsData.pictures) {
                console.error('Albums data not properly initialized');
                return;
            }

            // 初始化DOM元素
            initializeElements();
            
            // 初始化事件绑定
            initializeEventDelegation();
            
            // 初始化瀑布流
            initializeMasonry();
            
            // 初始化滚动监听
            initializeScrollListener();
            
            // 初始化图片懒加载
            initializeLazyLoading();
            
            // 初始化图片预加载
            initializeImagePreloading();
            
            // 设置初始状态
            updateLoadingState();
        } catch (error) {
            console.error('Failed to initialize albums page:', error);
        }
    }

    // 初始化DOM元素
    function initializeElements() {
        loadingElement = document.getElementById('albumsLoading');
        noMoreElement = document.getElementById('albumsNoMore');
        masonryContainer = document.getElementById('albumsMasonry');
        
        // 验证必要元素
        if (!masonryContainer) {
            throw new Error('Masonry container not found');
        }
        
        // 初始化数据
        initializeData();
    }

    // 初始化数据
    function initializeData() {
        // 从DOM元素读取初始化数据
        const containerElement = document.querySelector('.albums-container-v2');
        const albumsPicturesElement = document.querySelector('#albums-pictures-data');
        if (!containerElement || !albumsPicturesElement) {
            console.error('Albums container not found');
            return;
        }
        
        // 读取数据属性
        albumsData.currentPage = parseInt(containerElement.dataset.currentPage) || 1;
        albumsData.pageSize = parseInt(containerElement.dataset.pageSize) || 20;
        albumsData.totalPages = parseInt(containerElement.dataset.totalPages) || 1;
        albumsData.totalCount = parseInt(containerElement.dataset.totalCount) || 0;
        albumsData.hasNextPage = containerElement.dataset.hasNextPage === 'true';
        
        // 解析图片数据
        try {
            albumsData.pictures = JSON.parse(albumsPicturesElement.value || '[]');
        } catch (error) {
            console.error('Failed to parse pictures data:', error);
            albumsData.pictures = [];
        }
        
        hasMorePages = albumsData.hasNextPage;
    }

    // 初始化事件委托
    function initializeEventDelegation() {
        // 清理之前的事件监听器
        removeEventListeners();
        
        // 使用原生事件委托处理图片卡片按钮
        eventListeners.click = function(e) {
            const target = e.target.closest('.albums-view-btn, .albums-download-btn, .albums-share-btn');
            if (!target) return;

            e.preventDefault();
            e.stopPropagation();

            if (target.classList.contains('albums-view-btn')) {
                const id = target.getAttribute('data-id');
                const url = target.getAttribute('data-url');
                viewPictureWithPhotoSwipe(id, url);
            } else if (target.classList.contains('albums-download-btn')) {
                const url = target.getAttribute('data-url');
                const id = target.getAttribute('data-id');
                downloadPicture(url, id);
            } else if (target.classList.contains('albums-share-btn')) {
                const url = target.getAttribute('data-url');
                const description = target.getAttribute('data-description');
                sharePicture(url, description);
            }
        };
        document.addEventListener('click', eventListeners.click);

        // 图片加载事件
        eventListeners.load = function(e) {
            if (e.target.classList.contains('albums-picture-image-v2')) {
                albumsImageLoaded(e.target);
            }
        };
        document.addEventListener('load', eventListeners.load, true);

        // 图片错误事件
        eventListeners.error = function(e) {
            if (e.target.classList.contains('albums-picture-image-v2')) {
                albumsImageError(e.target);
            }
        };
        document.addEventListener('error', eventListeners.error, true);
    }

    // 移除事件监听器
    function removeEventListeners() {
        if (eventListeners.click) {
            document.removeEventListener('click', eventListeners.click);
            eventListeners.click = null;
        }
        if (eventListeners.load) {
            document.removeEventListener('load', eventListeners.load, true);
            eventListeners.load = null;
        }
        if (eventListeners.error) {
            document.removeEventListener('error', eventListeners.error, true);
            eventListeners.error = null;
        }
        if (eventListeners.resize) {
            window.removeEventListener('resize', eventListeners.resize);
            eventListeners.resize = null;
        }
        if (eventListeners.scroll) {
            window.removeEventListener('scroll', eventListeners.scroll);
            eventListeners.scroll = null;
        }
    }

    // 初始化瀑布流
    function initializeMasonry() {
        // 为现有的图片卡片添加动画延迟
        const existingCards = masonryContainer.querySelectorAll('.albums-picture-card-v2');
        existingCards.forEach((card, index) => {
            card.style.animationDelay = `${index * config.animationDelay}ms`;
        });
        
        // 监听窗口大小变化，重新调整布局
        let resizeTimeout = null;
        eventListeners.resize = () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(() => {
                adjustMasonryLayout();
            }, 300);
        };
        window.addEventListener('resize', eventListeners.resize);
    }

    // 调整瀑布流布局
    function adjustMasonryLayout() {
        const cards = masonryContainer.querySelectorAll('.albums-picture-card-v2');
        
        // 重新设置动画延迟
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * (config.animationDelay / 2)}ms`;
        });
    }

    // 初始化滚动监听
    function initializeScrollListener() {
        // 使用 Intersection Observer 监听加载更多
        if ('IntersectionObserver' in window) {
            // 创建 sentinel 元素并放在瀑布流容器的末尾
            const sentinel = document.createElement('div');
            sentinel.id = 'albums-sentinel';
            sentinel.style.height = '1px';
            sentinel.style.width = '100%';
            sentinel.style.position = 'relative';
            sentinel.style.clear = 'both';
            sentinel.style.backgroundColor = 'transparent';
            
            // 将 sentinel 放在加载指示器之前
            const loadingElement = document.getElementById('albumsLoading');
            if (loadingElement && loadingElement.parentNode) {
                loadingElement.parentNode.insertBefore(sentinel, loadingElement);
            } else {
                const container = document.querySelector('.albums-container-v2');
                if (container) {
                    container.appendChild(sentinel);
                } else {
                    document.body.appendChild(sentinel);
                }
            }
            
            observerInstance = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && hasMorePages && !isLoading) {
                        loadMoreImages();
                    }
                });
            }, {
                root: null,
                rootMargin: `${config.loadThreshold}px`,
                threshold: 0.01
            });
            
            observerInstance.observe(sentinel);
        } else {
            // 降级到传统滚动监听
            let scrollTimeout = null;
            eventListeners.scroll = () => {
                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }
                scrollTimeout = setTimeout(() => {
                    checkLoadMore();
                }, 100);
            };
            window.addEventListener('scroll', eventListeners.scroll);
        }
    }

    // 检查是否需要加载更多
    function checkLoadMore() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // 计算到底部的距离
        const distanceToBottom = documentHeight - (scrollTop + windowHeight);
        
        if (distanceToBottom <= config.loadThreshold && hasMorePages && !isLoading) {
            loadMoreImages();
        }
    }

    // 更新 sentinel 元素位置
    function updateSentinelPosition() {
        const sentinel = document.getElementById('albums-sentinel');
        if (!sentinel) return;
        
        const loadingElement = document.getElementById('albumsLoading');
        if (loadingElement && loadingElement.parentNode && sentinel.parentNode) {
            if (sentinel.nextSibling !== loadingElement) {
                loadingElement.parentNode.insertBefore(sentinel, loadingElement);
            }
        }
    }

    // 停止观察 sentinel 元素
    function stopObservingSentinel() {
        if (observerInstance) {
            observerInstance.disconnect();
            observerInstance = null;
        }
        
        const sentinel = document.getElementById('albums-sentinel');
        if (sentinel && sentinel.parentNode) {
            sentinel.parentNode.removeChild(sentinel);
        }
    }

    // 加载更多图片
    async function loadMoreImages() {
        if (isLoading || !hasMorePages) return;
        
        isLoading = true;
        showLoadingIndicator();
        
        try {
            const nextPage = albumsData.currentPage + 1;
            const response = await fetch(`/pages/albums?pageIndex=${nextPage}&pageSize=${albumsData.pageSize}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 更新页面数据
            albumsData.currentPage = data.currentPageIndex;
            albumsData.hasNextPage = data.totalPageCount > data.currentPageIndex;
            hasMorePages = data.totalPageCount > data.currentPageIndex;
            
            // 更新统计信息
            updateStatistics(data.totalItemCount, data.currentPageIndex, data.totalPageCount);
            
            // 渲染新图片
            if (data.items.length > 0) {
                await renderNewImages(data.items);
                
                // 更新图片数据
                const newImages = data.items.map(item => ({
                    id: item.Id || item.id,
                    url: item.AccessUrl || item.accessUrl,
                    description: item.Description || item.description,
                    width: item.Width || item.width,
                    height: item.Height || item.height
                }));
                albumsData.pictures = albumsData.pictures.concat(newImages);
            }
            
            // 延迟隐藏加载指示器
            setTimeout(() => {
                hideLoadingIndicator();
                if (!hasMorePages) {
                    showNoMoreIndicator();
                    stopObservingSentinel();
                } else {
                    updateSentinelPosition();
                }
            }, config.loadDelay);
            
        } catch (error) {
            console.error('Failed to load more images:', error);
            hideLoadingIndicator();
            showErrorMessage('加载失败，请稍后重试');
        } finally {
            isLoading = false;
        }
    }

    // 渲染新图片
    async function renderNewImages(pictures) {
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < pictures.length; i++) {
            const picture = pictures[i];
            const cardElement = createPictureCard(picture);
            
            // 设置动画延迟
            cardElement.style.animationDelay = `${i * config.animationDelay}ms`;
            
            fragment.appendChild(cardElement);
        }
        
        masonryContainer.appendChild(fragment);
    }

    // 创建图片卡片元素
    function createPictureCard(picture) {
        const card = document.createElement('div');
        card.className = 'albums-picture-card-v2';
        
        // 统一数据属性访问
        const id = picture.Id || picture.id;
        const accessUrl = picture.AccessUrl || picture.accessUrl;
        const description = picture.Description || picture.description;
        const width = picture.Width || picture.width;
        const height = picture.Height || picture.height;
        const tags = picture.Tags || picture.tags;
        const creator = picture.Creator || picture.creator;
        const length = picture.Length || picture.length;
        const uploadTime = picture.UploadTime || picture.uploadTime;
        
        card.setAttribute('data-id', id);
        
        const tagsHtml = tags && tags.length > 0 
            ? `<div class="albums-picture-tags-v2">
                ${tags.map(tag => `<span class="ds-badge ds-badge-primary albums-tag-v2">#${tag}</span>`).join('')}
               </div>`
            : '';
        
        const descriptionHtml = description 
            ? `<div class="albums-picture-description-v2">
                <p class="ds-text-body">${escapeHtml(description)}</p>
               </div>`
            : '';
        
        const avatarSrc = (creator?.Avatar || creator?.avatar) || '/core/images/default-avatar.png';
        const fileSize = (length / 1024.0 / 1024.0).toFixed(2);
        
        card.innerHTML = `
            <div class="albums-picture-wrapper-v2">
                <img 
                    src="${accessUrl}!albums" 
                    alt="${escapeHtml(description || '')}" 
                    class="albums-picture-image-v2"
                    data-width="${width}"
                    data-height="${height}"
                    loading="lazy"
                />
                <div class="albums-picture-overlay-v2">
                    <div class="albums-picture-actions-v2">
                        <button class="albums-action-btn-v2 albums-view-btn" data-id="${id}" data-url="${accessUrl}">
                            <i class="fa fa-eye"></i>
                        </button>
                        <button class="albums-action-btn-v2 albums-download-btn" data-url="${accessUrl}" data-id="${id}">
                            <i class="fa fa-download"></i>
                        </button>
                        <button class="albums-action-btn-v2 albums-share-btn" data-url="${accessUrl}" data-description="${escapeHtml(description || '')}">
                            <i class="fa fa-share"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="albums-picture-info-v2">
                ${descriptionHtml}
                ${tagsHtml}
                
                <div class="albums-picture-meta-v2">
                    <div class="albums-picture-user-v2">
                        <img 
                            src="${avatarSrc}" 
                            alt="${escapeHtml((creator?.Name || creator?.name) || '')}" 
                            class="albums-user-avatar-v2"
                        />
                        <div class="albums-user-info-v2">
                            <span class="albums-user-name-v2">${escapeHtml((creator?.Name || creator?.name) || '')}</span>
                            <span class="albums-upload-time-v2">${formatDate(uploadTime)}</span>
                        </div>
                    </div>
                    <div class="albums-picture-size-v2">
                        <span class="ds-text-caption">${width} × ${height}</span>
                        <span class="ds-text-caption">${fileSize} MB</span>
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }

    // 更新统计信息
    function updateStatistics(totalCount, currentPage, totalPages) {
        const totalCountElement = document.getElementById('totalCount');
        const currentPageElement = document.getElementById('currentPage');
        
        if (totalCountElement) {
            totalCountElement.textContent = totalCount;
        }
        if (currentPageElement) {
            currentPageElement.textContent = currentPage;
        }
    }

    // 显示加载指示器
    function showLoadingIndicator() {
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
    }

    // 隐藏加载指示器
    function hideLoadingIndicator() {
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    // 显示无更多内容指示器
    function showNoMoreIndicator() {
        if (noMoreElement) {
            noMoreElement.style.display = 'flex';
        }
    }

    // 更新加载状态
    function updateLoadingState() {
        if (hasMorePages) {
            hideLoadingIndicator();
            if (noMoreElement) {
                noMoreElement.style.display = 'none';
            }
        } else {
            hideLoadingIndicator();
            showNoMoreIndicator();
        }
    }

    // 初始化懒加载
    function initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        lazyImageObserver.unobserve(img);
                    }
                });
            }, {
                root: null,
                rootMargin: '50px',
                threshold: 0.1
            });
            
            // 观察所有需要懒加载的图片
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                lazyImageObserver.observe(img);
            });
        }
    }

    // 初始化图片预加载
    function initializeImagePreloading() {
        // 预加载接下来几张图片
        const images = document.querySelectorAll('.albums-picture-image-v2');
        images.forEach((img, index) => {
            if (index < config.preloadCount) {
                const preloadImg = new Image();
                preloadImg.src = img.src;
            }
        });
    }

    // 图片加载完成回调
    function albumsImageLoaded(img) {
        img.style.opacity = '1';
        img.closest('.albums-picture-card-v2').style.opacity = '1';
        img.closest('.albums-picture-card-v2').style.transform = 'translateY(0)';
    }

    // 图片加载错误回调
    function albumsImageError(img) {
        img.style.opacity = '0.5';
        img.alt = '图片加载失败';
        
        // 尝试重新加载
        let retryCount = parseInt(img.dataset.retryCount || '0');
        if (retryCount < config.maxRetries) {
            img.dataset.retryCount = (retryCount + 1).toString();
            setTimeout(() => {
                img.src = img.src + '?retry=' + Date.now();
            }, config.retryDelay);
        } else {
            // 显示默认错误图片
            img.src = '/core/images/image-error.png';
        }
    }

    // 使用 PhotoSwipe 查看图片
    function viewPictureWithPhotoSwipe(clickedId, clickedUrl) {
        // 收集所有图片数据
        const allImages = [];
        let clickedIndex = 0;
        
        // 获取当前页面所有图片
        const imageElements = document.querySelectorAll('.albums-picture-image-v2');
        
        imageElements.forEach((img, index) => {
            const card = img.closest('.albums-picture-card-v2');
            const id = card.getAttribute('data-id');
            const width = parseInt(img.getAttribute('data-width')) || img.naturalWidth;
            const height = parseInt(img.getAttribute('data-height')) || img.naturalHeight;
            const description = img.getAttribute('alt') || '';
            
            // 移除缩略图后缀，获取原图
            const originalSrc = img.src.replace('!albums', '');
            
            allImages.push({
                src: originalSrc,
                w: width,
                h: height,
                title: description
            });
            
            // 找到点击的图片索引
            if (id === clickedId) {
                clickedIndex = index;
            }
        });
        
        // 如果没有找到图片，返回
        if (allImages.length === 0) {
            console.error('No images found for PhotoSwipe');
            return;
        }
        
        // PhotoSwipe 配置选项 - 优化动画效果
        const options = {
            index: clickedIndex,                // 初始显示的图片索引
            
            // 基本视觉设置
            bgOpacity: 0.85,                    // 背景遮罩透明度（0-1）
            showHideOpacity: true,              // 是否在显示/隐藏时使用透明度动画
            history: true,                      // 是否支持浏览器历史记录（可用后退键关闭）
            modal: true,                        // 是否作为模态框显示
            focus: true,                        // 是否自动获取焦点（支持键盘操作）
            
            // UI元素显示控制
            shareEl: false,                     // 是否显示分享按钮
            fullscreenEl: true,                 // 是否显示全屏按钮
            zoomEl: true,                       // 是否显示缩放按钮
            counterEl: true,                    // 是否显示计数器（如：1 / 5）
            arrowEl: true,                      // 是否显示左右切换箭头
            preloaderEl: true,                  // 是否显示加载指示器
            
            // 交互行为设置
            tapToClose: false,                  // 单击图片是否关闭画廊
            tapToToggleControls: true,          // 单击是否切换控制栏显示/隐藏
            clickToCloseNonZoomable: false,     // 单击未缩放图片是否关闭画廊
            closeOnScroll: false,               // 页面滚动时是否关闭画廊
            closeOnVerticalDrag: true,          // 垂直拖拽时是否关闭画廊
            mouseUsed: false,                   // 是否已使用鼠标（影响UI显示逻辑）
            escKey: true,                       // 是否支持ESC键关闭
            arrowKeys: true,                    // 是否支持左右箭头键切换图片
            pinchToClose: true,                 // 是否支持双指捏合关闭
            
            // 动画时长设置
            showAnimationDuration: 400,         // 打开动画时长（毫秒）
            hideAnimationDuration: 350,         // 关闭动画时长（毫秒）
            spacing: 0.08,                      // 图片间距（0-1，数值越小切换越紧密）
            allowPanToNext: true,               // 是否允许拖拽切换到下一张图片
            loop: allImages.length > 2,         // 是否启用循环切换（超过2张图片时启用）
            
            // 滑动手感设置（数值越小手感越丝滑）
            mainScrollEndFriction: 0.25,       // 主滚动结束时的摩擦力（默认0.35）
            panEndFriction: 0.25,              // 平移操作结束时的摩擦力（默认0.35）
            
            // 垂直拖拽设置
            verticalDragRange: 0.8,             // 垂直拖拽的有效范围（0-1）
            
            // 缩放功能设置
            maxSpreadZoom: 2.5,                 // 手指/鼠标滑动缩放的最大倍数
            getDoubleTapZoom: function(isMouseClick, item) {
                // 双击/双指点击的缩放倍数设置函数
                if (isMouseClick) {
                    return 1.8;                 // 鼠标双击的缩放倍数
                } else {
                    return item.initialZoomLevel < 0.7 ? 1.5 : 2.0;  // 触摸双击缩放倍数（根据当前缩放级别动态调整）
                }
            },
            
            // 性能优化设置
            preload: [1, 3],                    // 预加载图片数量：前1张和后3张
            
            closeElClasses: ['item', 'caption', 'zoom-wrap', 'ui', 'top-bar'],  // 点击这些CSS类名的元素时关闭画廊
            
            // 缩略图边界计算函数 - 用于实现从缩略图到大图的平滑过渡动画
            getThumbBoundsFn: function (index) {
                const thumbnail = imageElements[index];
                if (!thumbnail) return null;
                
                const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                const rect = thumbnail.getBoundingClientRect();
                return { 
                    x: rect.left,               // 缩略图左边距
                    y: rect.top + pageYScroll,  // 缩略图顶部距离（包含滚动偏移）
                    w: rect.width               // 缩略图宽度
                };
            }
        };
        
        // 检查 PhotoSwipe 是否可用
        if (typeof PhotoSwipe === 'undefined' || typeof PhotoSwipeUI_Default === 'undefined') {
            console.error('PhotoSwipe library not found');
            return;
        }
        
        // 使用布局页中的 PhotoSwipe 容器
        const galleryElement = document.querySelector('#gallery');
        if (!galleryElement) {
            console.error('PhotoSwipe gallery container not found');
            return;
        }
        
        // 创建 PhotoSwipe 实例
        const gallery = new PhotoSwipe(galleryElement, PhotoSwipeUI_Default, allImages, options);
        
        
        // 动态加载图片尺寸
        gallery.listen('gettingData', function(index, item) {
            if (item.w < 1 || item.h < 1) {
                const img = new Image();
                img.onload = function() {
                    item.w = this.width;
                    item.h = this.height;
                    gallery.updateSize(true);
                };
                img.src = item.src;
            }
        });
        
        // 图片切换时预加载相邻图片
        gallery.listen('afterChange', function() {
            preloadAdjacentImages(gallery.getCurrentIndex(), allImages);
        });
        
        // 优化初始化动画
        gallery.listen('initialZoomIn', function() {
            // 初始缩放动画开始时的优化
            const currentItem = gallery.currItem;
            if (currentItem && currentItem.container) {
                currentItem.container.style.opacity = '0';
                requestAnimationFrame(() => {
                    currentItem.container.style.transition = 'opacity 0.3s ease-out';
                    currentItem.container.style.opacity = '1';
                });
            }
        });
        
        // 优化缩放完成后的处理
        gallery.listen('initialZoomInEnd', function() {
            // 初始缩放动画完成后的清理
            const currentItem = gallery.currItem;
            if (currentItem && currentItem.container) {
                currentItem.container.style.transition = '';
            }
        });
        
        // 改善关闭动画
        gallery.listen('close', function() {
            // 关闭时的平滑动画
            const bg = gallery.bg;
            if (bg) {
                bg.style.transition = 'opacity 0.35s cubic-bezier(0.4, 0, 0.22, 1)';
            }
        });
        
        // 优化拖拽体验
        gallery.listen('beforeChange', function(diff) {
            // 切换前的预处理，让动画更流畅
            if (Math.abs(diff) === 1) {
                // 相邻图片切换时的优化
                const container = gallery.container;
                if (container) {
                    container.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    setTimeout(() => {
                        container.style.transition = '';
                    }, 400);
                }
            }
        });
        
        // 图片加载优化
        gallery.listen('imageLoadComplete', function(index, item) {
            // 图片加载完成后的淡入效果
            if (item.container) {
                const img = item.container.querySelector('img');
                if (img) {
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease-out';
                    requestAnimationFrame(() => {
                        img.style.opacity = '1';
                    });
                }
            }
        });
        
        // 错误处理优化
        gallery.listen('imageLoadError', function(index, item) {
            console.warn('Image load error for item:', index, item.src);
            // 可以在这里添加错误图片的处理逻辑
        });
        
        // 初始化并显示 PhotoSwipe
        gallery.init();
        
        // 预加载当前图片的相邻图片
        preloadAdjacentImages(clickedIndex, allImages);
    }
    
    // 预加载相邻图片
    function preloadAdjacentImages(currentIndex, images) {
        const preloadIndexes = [currentIndex - 1, currentIndex + 1];
        
        preloadIndexes.forEach(index => {
            if (index >= 0 && index < images.length) {
                const img = new Image();
                img.src = images[index].src;
            }
        });
    }

    // 下载图片
    function downloadPicture(url, id) {
        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = `image_${id}_${Date.now()}.jpg`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showSuccessMessage('图片下载开始');
        } catch (error) {
            console.error('Download failed:', error);
            showErrorMessage('下载失败，请稍后重试');
        }
    }

    // 分享图片
    function sharePicture(url, description) {
        try {
            if (navigator.share) {
                navigator.share({
                    title: '分享图片',
                    text: description || '来自相册的精美图片',
                    url: url
                });
            } else {
                // 降级到复制链接
                copyToClipboard(url);
                showSuccessMessage('图片链接已复制到剪贴板');
            }
        } catch (error) {
            console.error('Share failed:', error);
            copyToClipboard(url);
            showSuccessMessage('图片链接已复制到剪贴板');
        }
    }

    // 复制到剪贴板
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                return Promise.resolve();
            } catch (error) {
                return Promise.reject(error);
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }

    // 显示成功消息
    function showSuccessMessage(message) {
        showMessage(message, 'success');
    }

    // 显示错误消息
    function showErrorMessage(message) {
        showMessage(message, 'error');
    }

    // 显示消息
    function showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `albums-message-v2 albums-message-${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(messageElement);
        
        // 显示动画
        setTimeout(() => {
            messageElement.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            messageElement.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }, 3000);
    }

    // 工具函数
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (days === 0) {
                return '今天';
            } else if (days === 1) {
                return '昨天';
            } else if (days < 7) {
                return `${days}天前`;
            } else {
                return date.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch (error) {
            return dateString;
        }
    }

    // 清理函数
    function cleanup() {
        // 清理 Intersection Observer
        if (observerInstance) {
            observerInstance.disconnect();
            observerInstance = null;
        }
        
        // 清理 sentinel 元素
        const sentinel = document.getElementById('albums-sentinel');
        if (sentinel && sentinel.parentNode) {
            sentinel.parentNode.removeChild(sentinel);
        }
        
        // 移除事件监听器
        removeEventListeners();
        
        // 重置全局变量
        isLoading = false;
        hasMorePages = true;
        
        // 重置相册数据
        albumsData = {
            currentPage: 1,
            pageSize: 20,
            totalPages: 1,
            totalCount: 0,
            hasNextPage: false,
            pictures: []
        };
        
        // 重置 DOM 元素引用
        loadingElement = null;
        noMoreElement = null;
        masonryContainer = null;
    }

    // 页面卸载时清理
    window.addEventListener('beforeunload', window.cleanupAlbums);

    // 公开初始化函数以支持 pjax
    window.initAlbums = function() {
        // 检查是否是相册页面
        if (!document.querySelector('.albums-container-v2')) {
            return false;
        }
        
        // 如果已经初始化过，先清理
        if (observerInstance || masonryContainer) {
            cleanup();
        }
        
        try {
            init();
            return true;
        } catch (error) {
            console.error('Failed to initialize albums:', error);
            return false;
        }
    };

    // 公开清理函数以支持 pjax
    window.cleanupAlbums = function() {
        // 只有当相册已初始化时才进行清理
        if (observerInstance || masonryContainer) {
            cleanup();
        }
    };

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initAlbums);
    } else {
        window.initAlbums();
    }

})();
