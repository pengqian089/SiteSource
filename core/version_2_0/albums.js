/**
 * 相册页面 JavaScript 2.0 版本
 * 实现瀑布流布局、自动加载更多、图片预览等功能
 */

(function() {
    'use strict';

    // 全局变量
    let isLoading = false;
    let hasMorePages = true;
    let currentImageIndex = 0;
    let allImages = [];
    let observerInstance = null;
    let loadingElement = null;
    let noMoreElement = null;
    let masonryContainer = null;
    let modal = null;
    let modalImage = null;
    let modalPrevBtn = null;
    let modalNextBtn = null;
    
    // 图片缩放和拖拽相关变量
    let currentScale = 1;
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartTranslateX = 0;
    let dragStartTranslateY = 0;
    let lastTouchDistance = 0;
    let imageContainer = null;
    
    // 缩放配置
    const zoomConfig = {
        minScale: 0.5,
        maxScale: 5,
        zoomStep: 0.2,
        touchZoomSensitivity: 0.005,
        wheelZoomSensitivity: 0.001
    };

    // 配置选项
    const config = {
        loadThreshold: 200, // 距离底部多少像素开始加载
        loadDelay: 500, // 加载延迟（毫秒）
        animationDelay: 100, // 动画延迟（毫秒）
        imageQuality: 0.8, // 图片质量
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
            if (!window.albumsData) {
                console.error('Albums data not found');
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
            
            // 初始化模态框
            initializeModal();
            
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
        modal = document.getElementById('albumsModal');
        modalImage = document.getElementById('albumsModalImage');
        modalPrevBtn = document.getElementById('albumsModalPrev');
        modalNextBtn = document.getElementById('albumsModalNext');
        imageContainer = document.querySelector('.albums-modal-image-container-v2');
        
        // 收集所有图片信息，并统一数据结构
        allImages = (window.albumsData.pictures || []).map(picture => ({
            id: picture.id,
            url: picture.url,
            description: picture.description,
            width: picture.width,
            height: picture.height
        }));
        hasMorePages = window.albumsData.hasNextPage;
        
        // 验证必要元素
        if (!masonryContainer) {
            throw new Error('Masonry container not found');
        }
        if (!modal) {
            throw new Error('Modal element not found');
        }
        if (!imageContainer) {
            throw new Error('Image container not found');
        }
    }

    // 初始化原生JavaScript事件
    function initializeEventDelegation() {
        // 使用原生事件委托处理图片卡片按钮
        document.addEventListener('click', function(e) {
            const target = e.target.closest('.albums-view-btn, .albums-download-btn, .albums-share-btn');
            if (!target) return;

            e.preventDefault();
            e.stopPropagation();

            if (target.classList.contains('albums-view-btn')) {
                const id = target.getAttribute('data-id');
                const url = target.getAttribute('data-url');
                viewPicture(id, url);
            } else if (target.classList.contains('albums-download-btn')) {
                const url = target.getAttribute('data-url');
                const id = target.getAttribute('data-id');
                downloadPicture(url, id);
            } else if (target.classList.contains('albums-share-btn')) {
                const url = target.getAttribute('data-url');
                const description = target.getAttribute('data-description');
                sharePicture(url, description);
            }
        });

        // 图片加载事件
        document.addEventListener('load', function(e) {
            if (e.target.classList.contains('albums-picture-image-v2')) {
                albumsImageLoaded(e.target);
            }
        }, true);

        // 图片错误事件
        document.addEventListener('error', function(e) {
            if (e.target.classList.contains('albums-picture-image-v2')) {
                albumsImageError(e.target);
            }
        }, true);
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
        window.addEventListener('resize', () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(() => {
                adjustMasonryLayout();
            }, 300);
        });
    }

    // 调整瀑布流布局
    function adjustMasonryLayout() {
        // 这里可以根据窗口大小调整瀑布流的列数
        const containerWidth = masonryContainer.offsetWidth;
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
            const sentinel = document.createElement('div');
            sentinel.style.height = '1px';
            sentinel.style.position = 'absolute';
            sentinel.style.bottom = `${config.loadThreshold}px`;
            sentinel.style.left = '0';
            sentinel.style.width = '100%';
            document.body.appendChild(sentinel);
            
            observerInstance = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && hasMorePages && !isLoading) {
                        loadMoreImages();
                    }
                });
            }, {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            });
            
            observerInstance.observe(sentinel);
        } else {
            // 降级到传统滚动监听
            let scrollTimeout = null;
            window.addEventListener('scroll', () => {
                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }
                scrollTimeout = setTimeout(() => {
                    checkLoadMore();
                }, 100);
            });
        }
    }

    // 检查是否需要加载更多
    function checkLoadMore() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (scrollTop + windowHeight >= documentHeight - config.loadThreshold && hasMorePages && !isLoading) {
            loadMoreImages();
        }
    }

    // 加载更多图片
    async function loadMoreImages() {
        if (isLoading || !hasMorePages) return;
        
        isLoading = true;
        showLoadingIndicator();
        
        try {
            const nextPage = window.albumsData.currentPage + 1;
            const response = await fetch(`/pages/albums?pageIndex=${nextPage}&pageSize=${window.albumsData.pageSize}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
                         // 更新页面数据
             window.albumsData.currentPage = data.currentPageIndex;
             window.albumsData.hasNextPage = data.totalPageCount > data.currentPageIndex;
             hasMorePages = data.totalPageCount > data.currentPageIndex;
            
            // 更新统计信息
            updateStatistics(data.totalItemCount, data.currentPageIndex, data.PageCount);
            
            // 渲染新图片
            if (data.items.length > 0) {
                await renderNewImages(data.items);
                
                // 更新所有图片列表，确保数据结构一致
                const newImages = data.items.map(item => ({
                    id: item.Id || item.id,
                    url: item.AccessUrl || item.accessUrl,
                    description: item.Description || item.description,
                    width: item.Width || item.width,
                    height: item.Height || item.height
                }));
                allImages = allImages.concat(newImages);
            }
            
            // 延迟隐藏加载指示器
            setTimeout(() => {
                hideLoadingIndicator();
                if (!hasMorePages) {
                    showNoMoreIndicator();
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

    // 初始化模态框
    function initializeModal() {
        if (!modal || !imageContainer || !modalImage) return;
        
        // 阻止模态框内容区域的点击事件冒泡
        const modalContent = modal.querySelector('.albums-modal-content-v2');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        // 初始化缩放和拖拽功能
        initializeZoomAndDrag();
        
        // 更新导航按钮状态
        updateModalNavigation();
    }

    // 初始化缩放和拖拽功能
    function initializeZoomAndDrag() {
        // 鼠标滚轮缩放
        imageContainer.addEventListener('wheel', handleWheel, { passive: false });
        
        // 鼠标拖拽
        modalImage.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // 触摸事件（双指缩放和拖拽）
        imageContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
        imageContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        imageContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // 双击重置缩放
        modalImage.addEventListener('dblclick', resetZoom);
    }

    // 滚轮事件节流器
    let wheelTimeout = null;
    
    // 鼠标滚轮缩放处理
    function handleWheel(e) {
        e.preventDefault();
        
        // 清除之前的超时
        if (wheelTimeout) {
            clearTimeout(wheelTimeout);
        }
        
        wheelTimeout = setTimeout(() => {
            const rect = imageContainer.getBoundingClientRect();
            
            // 计算鼠标相对于容器的位置
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // 计算缩放因子
            const delta = e.deltaY * -zoomConfig.wheelZoomSensitivity;
            const scaleFactor = Math.exp(delta);
            
            zoomImage(scaleFactor, mouseX, mouseY);
        }, 16); // 约60fps
    }

    // 缩放图片
    function zoomImage(scaleFactor, centerX, centerY) {
        const newScale = Math.max(zoomConfig.minScale, Math.min(zoomConfig.maxScale, currentScale * scaleFactor));
        
        if (newScale !== currentScale) {
            // 计算缩放中心点
            const scaleChange = newScale / currentScale;
            const rect = imageContainer.getBoundingClientRect();
            
            // 如果没有指定中心点，使用图片中心
            if (centerX === undefined || centerY === undefined) {
                centerX = rect.width / 2;
                centerY = rect.height / 2;
            }
            
            // 计算新的位移
            const newTranslateX = centerX - (centerX - currentTranslateX) * scaleChange;
            const newTranslateY = centerY - (centerY - currentTranslateY) * scaleChange;
            
            currentScale = newScale;
            currentTranslateX = newTranslateX;
            currentTranslateY = newTranslateY;
            
            updateImageTransform();
            updateZoomState();
        }
    }

    // 更新图片变换
    function updateImageTransform() {
        modalImage.style.transform = `scale(${currentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
    }

    // 更新缩放状态
    function updateZoomState() {
        if (currentScale > 1) {
            modalImage.classList.add('zoomed');
            imageContainer.classList.add('zoomed');
        } else {
            modalImage.classList.remove('zoomed');
            imageContainer.classList.remove('zoomed');
        }
    }

    // 鼠标按下处理
    function handleMouseDown(e) {
        if (currentScale <= 1) return;
        
        e.preventDefault();
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartTranslateX = currentTranslateX;
        dragStartTranslateY = currentTranslateY;
        
        imageContainer.classList.add('dragging');
    }

    // 鼠标移动处理
    function handleMouseMove(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        
        currentTranslateX = dragStartTranslateX + deltaX / currentScale;
        currentTranslateY = dragStartTranslateY + deltaY / currentScale;
        
        updateImageTransform();
    }

    // 鼠标松开处理
    function handleMouseUp(e) {
        if (!isDragging) return;
        
        isDragging = false;
        imageContainer.classList.remove('dragging');
    }

    // 触摸开始处理
    function handleTouchStart(e) {
        if (e.touches.length === 1) {
            // 单指拖拽
            if (currentScale > 1) {
                isDragging = true;
                dragStartX = e.touches[0].clientX;
                dragStartY = e.touches[0].clientY;
                dragStartTranslateX = currentTranslateX;
                dragStartTranslateY = currentTranslateY;
            }
        } else if (e.touches.length === 2) {
            // 双指缩放
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            lastTouchDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
        }
    }

    // 触摸移动处理
    function handleTouchMove(e) {
        if (e.touches.length === 1 && isDragging) {
            // 单指拖拽
            e.preventDefault();
            const deltaX = e.touches[0].clientX - dragStartX;
            const deltaY = e.touches[0].clientY - dragStartY;
            
            currentTranslateX = dragStartTranslateX + deltaX / currentScale;
            currentTranslateY = dragStartTranslateY + deltaY / currentScale;
            
            updateImageTransform();
        } else if (e.touches.length === 2) {
            // 双指缩放
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            
            if (lastTouchDistance > 0) {
                const scaleFactor = distance / lastTouchDistance;
                const centerX = (touch1.clientX + touch2.clientX) / 2;
                const centerY = (touch1.clientY + touch2.clientY) / 2;
                const rect = imageContainer.getBoundingClientRect();
                
                zoomImage(scaleFactor, centerX - rect.left, centerY - rect.top);
            }
            
            lastTouchDistance = distance;
        }
    }

    // 触摸结束处理
    function handleTouchEnd(e) {
        isDragging = false;
        lastTouchDistance = 0;
    }

    // 重置缩放
    function resetZoom() {
        currentScale = 1;
        currentTranslateX = 0;
        currentTranslateY = 0;
        updateImageTransform();
        updateZoomState();
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

    // 查看图片
    function viewPicture(id, url) {
        currentImageIndex = allImages.findIndex(img => img.id === id);
        
        if (currentImageIndex === -1) {
            currentImageIndex = 0;
        }
        
        showModal(url);
    }

            // 模态框事件监听器引用（用于清理）
    let modalEventListeners = {
        closeBtn: null,
        prevBtn: null,
        nextBtn: null,
        backdrop: null,
        keyboard: null
    };

    // 显示模态框
    function showModal(imageUrl) {
        if (!modal || !modalImage) {
            console.error('Modal or modalImage not found');
            return;
        }
        
        // 显示加载状态
        showModalLoading();
        
        // 预加载图片
        const img = new Image();
        img.onload = function() {
            // 图片加载完成后显示
            modalImage.src = imageUrl;
            modalImage.classList.add('fade-in');
            
            // 延迟隐藏加载状态
            setTimeout(() => {
                hideModalLoading();
            }, 200);
            
            // 动画完成后清理类名
            setTimeout(() => {
                modalImage.classList.remove('fade-in');
            }, 300);
        };
        
        img.onerror = function() {
            // 图片加载失败时直接显示
            modalImage.src = imageUrl;
            hideModalLoading();
        };
        
        img.src = imageUrl;
        
        // 显示模态框
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        
        // 使用 requestAnimationFrame 确保动画流畅
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
        
        // 绑定模态框事件监听器
        bindModalEvents();
        
        // 预加载前后图片
        preloadAdjacentImages();
        
        // 更新导航按钮
        updateModalNavigation();
        
        // 禁用页面滚动
        document.body.style.overflow = 'hidden';
    }

    // 绑定模态框事件监听器
    function bindModalEvents() {
        const closeBtn = document.querySelector('.albums-modal-close-v2');
        const prevBtn = document.getElementById('albumsModalPrev');
        const nextBtn = document.getElementById('albumsModalNext');
        const backdrop = document.querySelector('.albums-modal-backdrop-v2');

        // 清理之前的事件监听器
        unbindModalEvents();

        // 关闭按钮事件
        if (closeBtn) {
            modalEventListeners.closeBtn = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 添加按钮点击效果
                closeBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    closeBtn.style.transform = '';
                }, 150);
                
                // 延迟关闭以显示点击效果
                setTimeout(() => {
                    closeModal();
                }, 100);
            };
            closeBtn.addEventListener('click', modalEventListeners.closeBtn);
        }

        // 上一张按钮事件（添加防抖逻辑）
        let prevBtnTimeout = null;
        if (prevBtn) {
            modalEventListeners.prevBtn = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 防止频繁点击
                if (prevBtnTimeout) {
                    clearTimeout(prevBtnTimeout);
                }
                
                // 添加按钮点击效果
                prevBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    prevBtn.style.transform = '';
                }, 150);
                
                prevBtnTimeout = setTimeout(() => {
                    showPreviousImage();
                }, 100);
            };
            prevBtn.addEventListener('click', modalEventListeners.prevBtn);
        }

        // 下一张按钮事件（添加防抖逻辑）
        let nextBtnTimeout = null;
        if (nextBtn) {
            modalEventListeners.nextBtn = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 防止频繁点击
                if (nextBtnTimeout) {
                    clearTimeout(nextBtnTimeout);
                }
                
                // 添加按钮点击效果
                nextBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    nextBtn.style.transform = '';
                }, 150);
                
                nextBtnTimeout = setTimeout(() => {
                    showNextImage();
                }, 100);
            };
            nextBtn.addEventListener('click', modalEventListeners.nextBtn);
        }

        // 背景点击关闭
        if (backdrop) {
            modalEventListeners.backdrop = function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            };
            backdrop.addEventListener('click', modalEventListeners.backdrop);
        }

        // 键盘事件（添加防抖逻辑）
        let keyboardTimeout = null;
        modalEventListeners.keyboard = function(e) {
            if (modal && modal.style.display !== 'none') {
                // 清除之前的超时
                if (keyboardTimeout) {
                    clearTimeout(keyboardTimeout);
                }
                
                switch(e.key) {
                    case 'Escape':
                        closeModal();
                        break;
                    case 'ArrowLeft':
                        // 防止频繁切换
                        keyboardTimeout = setTimeout(() => {
                            showPreviousImage();
                        }, 50);
                        break;
                    case 'ArrowRight':
                        // 防止频繁切换
                        keyboardTimeout = setTimeout(() => {
                            showNextImage();
                        }, 50);
                        break;
                }
            }
        };
        document.addEventListener('keydown', modalEventListeners.keyboard);

        // 触摸事件（移动设备滑动切换）
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        const minSwipeDistance = 50;
        
        modalEventListeners.touchStart = function(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };
        
        modalEventListeners.touchMove = function(e) {
            e.preventDefault(); // 防止页面滚动
        };
        
        modalEventListeners.touchEnd = function(e) {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // 只有横向滑动距离大于纵向滑动距离时才切换图片
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    // 向右滑动，显示上一张
                    showPreviousImage();
                } else {
                    // 向左滑动，显示下一张
                    showNextImage();
                }
            }
        };
        
        if (modal) {
            modal.addEventListener('touchstart', modalEventListeners.touchStart);
            modal.addEventListener('touchmove', modalEventListeners.touchMove);
            modal.addEventListener('touchend', modalEventListeners.touchEnd);
        }
    }

    // 清理模态框事件监听器
    function unbindModalEvents() {
        const closeBtn = document.querySelector('.albums-modal-close-v2');
        const prevBtn = document.getElementById('albumsModalPrev');
        const nextBtn = document.getElementById('albumsModalNext');
        const backdrop = document.querySelector('.albums-modal-backdrop-v2');

        if (closeBtn && modalEventListeners.closeBtn) {
            closeBtn.removeEventListener('click', modalEventListeners.closeBtn);
        }
        if (prevBtn && modalEventListeners.prevBtn) {
            prevBtn.removeEventListener('click', modalEventListeners.prevBtn);
        }
        if (nextBtn && modalEventListeners.nextBtn) {
            nextBtn.removeEventListener('click', modalEventListeners.nextBtn);
        }
        if (backdrop && modalEventListeners.backdrop) {
            backdrop.removeEventListener('click', modalEventListeners.backdrop);
        }
        if (modalEventListeners.keyboard) {
            document.removeEventListener('keydown', modalEventListeners.keyboard);
        }
        
        // 清理触摸事件监听器
        if (modal) {
            if (modalEventListeners.touchStart) {
                modal.removeEventListener('touchstart', modalEventListeners.touchStart);
            }
            if (modalEventListeners.touchMove) {
                modal.removeEventListener('touchmove', modalEventListeners.touchMove);
            }
            if (modalEventListeners.touchEnd) {
                modal.removeEventListener('touchend', modalEventListeners.touchEnd);
            }
        }

        // 重置引用
        modalEventListeners = {
            closeBtn: null,
            prevBtn: null,
            nextBtn: null,
            backdrop: null,
            keyboard: null,
            touchStart: null,
            touchMove: null,
            touchEnd: null
        };
    }

    // 关闭模态框
    function closeModal() {
        if (!modal) {
            console.error('Modal not found');
            return;
        }
        
        // 清理事件监听器
        unbindModalEvents();
        
        // 重置缩放状态
        resetZoom();
        
        // 添加关闭动画
        modal.classList.remove('show');
        modal.classList.add('closing');
        
        // 动画完成后隐藏模态框
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('closing');
            
            // 清理图片状态
            modalImage.classList.remove('fade-in', 'slide-in-left', 'slide-in-right', 'fading', 'loading', 'zoomed');
            imageContainer.classList.remove('zoomed', 'dragging');
            hideModalLoading();
        }, 300);
        
        // 恢复页面滚动
        document.body.style.overflow = '';
    }

    // 显示上一张图片
    function showPreviousImage() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            switchImage(allImages[currentImageIndex].url, 'left');
        }
    }

    // 显示下一张图片
    function showNextImage() {
        if (currentImageIndex < allImages.length - 1) {
            currentImageIndex++;
            switchImage(allImages[currentImageIndex].url, 'right');
        }
    }

    // 切换图片动画
    function switchImage(newImageUrl, direction) {
        // 防止频繁切换
        if (modalImage.classList.contains('fading') || modalImage.classList.contains('loading')) {
            return;
        }
        
        // 重置缩放状态
        resetZoom();
        
        // 显示加载状态
        showModalLoading();
        
        // 预加载新图片
        const img = new Image();
        img.onload = function() {
            // 开始切换动画
            modalImage.classList.add('fading');
            
            setTimeout(() => {
                // 更新图片源
                modalImage.src = newImageUrl;
                
                // 添加进入动画
                modalImage.classList.remove('fading');
                modalImage.classList.add(direction === 'left' ? 'slide-in-left' : 'slide-in-right');
                
                // 隐藏加载状态
                hideModalLoading();
                
                // 动画完成后清理类名
                setTimeout(() => {
                    modalImage.classList.remove('slide-in-left', 'slide-in-right');
                }, 300);
            }, 150);
        };
        
        img.onerror = function() {
            // 图片加载失败时直接切换
            modalImage.src = newImageUrl;
            hideModalLoading();
        };
        
        img.src = newImageUrl;
        
        // 更新导航按钮
        updateModalNavigation();
        
        // 预加载前后图片
        preloadAdjacentImages();
    }

    // 更新模态框导航
    function updateModalNavigation() {
        if (!modalPrevBtn || !modalNextBtn) {
            console.error('Navigation buttons not found');
            return;
        }
        
        modalPrevBtn.disabled = currentImageIndex <= 0;
        modalNextBtn.disabled = currentImageIndex >= allImages.length - 1;
    }

    // 预加载相邻图片
    function preloadAdjacentImages() {
        // 预加载当前图片的前后各2张图片
        const preloadIndexes = [
            currentImageIndex - 2, 
            currentImageIndex - 1, 
            currentImageIndex + 1, 
            currentImageIndex + 2
        ];
        
        preloadIndexes.forEach(index => {
            if (index >= 0 && index < allImages.length) {
                const img = new Image();
                img.src = allImages[index].url;
                
                // 设置图片加载优先级
                if (Math.abs(index - currentImageIndex) === 1) {
                    // 相邻图片设置高优先级
                    img.loading = 'eager';
                } else {
                    // 其他图片设置低优先级
                    img.loading = 'lazy';
                }
            }
        });
    }

    // 显示模态框加载状态
    function showModalLoading() {
        const loadingElement = document.getElementById('albumsModalLoading');
        if (loadingElement) {
            loadingElement.classList.add('show');
        }
    }

    // 隐藏模态框加载状态
    function hideModalLoading() {
        const loadingElement = document.getElementById('albumsModalLoading');
        if (loadingElement) {
            loadingElement.classList.remove('show');
        }
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
                    day: 'numeric'
                });
            }
        } catch (error) {
            return dateString;
        }
    }

    // 清理函数
    function cleanup() {
        if (observerInstance) {
            observerInstance.disconnect();
        }
        
        // 清理模态框事件监听器
        unbindModalEvents();
        
        // 移除事件监听器
        window.removeEventListener('resize', adjustMasonryLayout);
        window.removeEventListener('scroll', checkLoadMore);
    }

    // 页面卸载时清理
    window.addEventListener('beforeunload', cleanup);



    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
