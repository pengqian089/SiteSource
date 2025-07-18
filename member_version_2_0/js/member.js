'use strict';

/**
 * 个人中心 JavaScript
 * 支持pjax初始化和响应式设计
 * @version 2.0
 * @author 系统管理员
 */

// 常量配置
const CONSTANTS = {
    // 页面类型
    PAGES: {
        PROFILE: 'profile',
        ARTICLES: 'articles',
        MUMBLES: 'mumbles',
        TIMELINE: 'timeline',
        PHOTOS: 'photos'
    },
    
    // 分页配置
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        DEFAULT_PAGE_NUM: 1
    },
    
    // 响应式断点
    BREAKPOINTS: {
        MOBILE: 480,
        TABLET: 768,
        DESKTOP: 1024
    },
    
    // 延迟时间
    DELAYS: {
        LOADING: 500,
        API_MOCK: 1000,
        UPLOAD: 2000,
        TOAST_AUTO_HIDE: 4000,
        TOAST_HIDE_ANIMATION: 300
    },
    
    // 录音相关配置
    RECORDING: {
        MAX_DURATION: 600, // 最大录音时长（秒）
        MIN_DURATION: 1,   // 最小录音时长（秒）
        AUDIO_TYPE: 'audio/webm;codecs=opus', // 音频格式
        FALLBACK_TYPE: 'audio/wav', // 降级音频格式
        UPDATE_INTERVAL: 100 // 进度更新间隔（毫秒）
    },
    
    // 消息类型配置
    MESSAGE_TYPES: {
        SUCCESS: {
            type: 'success',
            icon: 'fa-check-circle',
            color: '#059669',
            bgColor: '#ffffff',
            borderColor: '#10b981',
            textColor: '#065f46'
        },
        ERROR: {
            type: 'error',
            icon: 'fa-times-circle',
            color: '#dc2626',
            bgColor: '#ffffff',
            borderColor: '#ef4444',
            textColor: '#7f1d1d'
        },
        WARNING: {
            type: 'warning',
            icon: 'fa-exclamation-triangle',
            color: '#d97706',
            bgColor: '#ffffff',
            borderColor: '#f59e0b',
            textColor: '#92400e'
        },
        INFO: {
            type: 'info',
            icon: 'fa-info-circle',
            color: '#2563eb',
            bgColor: '#ffffff',
            borderColor: '#3b82f6',
            textColor: '#1e40af'
        }
    },
    
    // 页面名称映射
    PAGE_NAMES: {
        profile: '基本设置',
        articles: '我的文章',
        mumbles: '我的碎碎念',
        timeline: '我的时间轴',
        photos: '我的相册'
    },
    
    // 选择器缓存
    SELECTORS: {
        // 导航相关
        navItem: '.nav-item',
        navItemLink: '.nav-item a',
        contentPage: '.content-page',
        currentPageTitle: '#currentPageTitle',
        
        // 布局相关
        menuToggle: '#menuToggle',
        sidebarOverlay: '#sidebarOverlay',
        memberSidebar: '.member-sidebar',
        tableContainer: '.table-container',
        photosGrid: '.photos-grid',
        mobileCards: '.mobile-cards',
        mobilePhotosGrid: '.mobile-photos-grid',
        
        // 模态框相关
        publishModal: '#publishModal',
        deleteModal: '#deleteModal',
        twoFactorModal: '#twoFactorModal',
        modalBody: '#modalBody',
        modalTitle: '#modalTitle',
        confirmPublish: '#confirmPublish',
        
        // 加载相关
        loadingOverlay: '#loadingOverlay',
        toastContainer: '#toast-container'
    }
};

/**
 * 个人中心主类
 * 管理用户个人中心的所有功能
 */
class MemberCenter {
    /**
     * 构造函数
     * 初始化个人中心实例
     */
    constructor() {
        // 状态管理
        this.state = {
            currentPage: CONSTANTS.PAGES.PROFILE,
            currentTheme: 'light',
            currentPageNum: CONSTANTS.PAGINATION.DEFAULT_PAGE_NUM,
            pageSize: CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE,
            recording: false,
            currentDeleteItem: null
        };
        
        // 媒体录制相关
        this.media = {
            mediaRecorder: null,
            audioChunks: [],
            audioUrl: null,
            audioBlob: null,
            stream: null,
            audioElement: null
        };
        
        // 录音状态管理
        this.recordingState = {
            isRecording: false,
            isPaused: false,
            isPlaying: false,
            duration: 0,           // 录音总时长
            currentTime: 0,        // 当前播放时间
            startTime: null,       // 录音开始时间
            recordingTimer: null,  // 录音计时器
            playbackTimer: null,   // 播放计时器
            hasRecording: false    // 是否有录音文件
        };
        
        // 数据缓存
        this.dataCache = {
            lastLoadedData: {},
            userInfo: null
        };
        
        // 初始化
        this.initialize();
    }
    
    /**
     * 初始化方法
     * 按顺序执行各种初始化操作
     */
    initialize() {
        try {
            this.bindEvents();
            this.loadUserInfo();
            this.initTheme();
            this.initPageFromHash();
            this.initLayoutVisibility();
        } catch (error) {
            console.error('初始化失败:', error);
            this.showMessage('系统初始化失败，请刷新页面重试', 'error');
        }
    }
    
    /**
     * 初始化布局显示状态
     * 根据设备类型显示对应的布局
     */
    initLayoutVisibility() {
        if (this.isMobile()) {
            // 移动端：显示卡片，隐藏表格
            $(CONSTANTS.SELECTORS.tableContainer + ', ' + CONSTANTS.SELECTORS.photosGrid).hide();
            $(CONSTANTS.SELECTORS.mobileCards + ', ' + CONSTANTS.SELECTORS.mobilePhotosGrid).show();
        } else {
            // 桌面端：显示表格，隐藏卡片
            $(CONSTANTS.SELECTORS.tableContainer + ', ' + CONSTANTS.SELECTORS.photosGrid).show();
            $(CONSTANTS.SELECTORS.mobileCards + ', ' + CONSTANTS.SELECTORS.mobilePhotosGrid).hide();
        }
    }
    
    /**
     * 绑定所有事件处理器
     * 统一管理事件绑定
     */
    bindEvents() {
        this.bindNavigationEvents();
        this.bindMobileMenuEvents();
        this.bindWindowEvents();
        this.bindProfileEvents();
        this.bindContentEvents();
        this.bindModalEvents();
        this.bindKeyboardEvents();
    }
    
    /**
     * 绑定导航相关事件
     */
    bindNavigationEvents() {
        // 导航切换
        $(CONSTANTS.SELECTORS.navItemLink).on('click', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).parent().data('page');
            this.switchPage(page);
            this.closeMobileMenu();
        });
        
        // 监听hash变化
        $(window).on('hashchange', () => {
            this.handleHashChange();
        });
    }
    
    /**
     * 绑定移动端菜单事件
     */
    bindMobileMenuEvents() {
        $(CONSTANTS.SELECTORS.menuToggle).on('click', () => this.toggleMobileMenu());
        $(CONSTANTS.SELECTORS.sidebarOverlay).on('click', () => this.closeMobileMenu());
    }
    
    /**
     * 绑定窗口事件
     */
    bindWindowEvents() {
        $(window).on('resize', () => this.handleResize());
    }
    
    /**
     * 绑定个人资料相关事件
     */
    bindProfileEvents() {
        $('#saveProfile').on('click', () => this.saveProfile());
        $('#logout').on('click', () => this.logout());
        $('#uploadAvatar').on('click', () => $('#avatarFile').click());
        $('#avatarFile').on('change', (e) => this.handleAvatarUpload(e));
        $('#bindTwoFactor').on('click', () => this.showTwoFactorModal());
        $('#closeTwoFactorModal').on('click', () => this.hideTwoFactorModal());
        $('#confirmTwoFactor').on('click', () => this.confirmTwoFactor());
        $('#copySecretKey').on('click', () => this.copySecretKey());
    }
    
    /**
     * 绑定内容相关事件
     */
    bindContentEvents() {
        // 文章相关
        $('#newArticle').on('click', () => this.showArticleModal());
        $('#searchArticles').on('click', () => this.searchArticles());
        
        // 碎碎念相关
        $('#newMumble').on('click', () => this.showMumbleModal());
        $('#searchMumbles').on('click', () => this.searchMumbles());
        
        // 时间轴相关
        $('#newTimeline').on('click', () => this.showTimelineModal());
        $('#searchTimeline').on('click', () => this.searchTimeline());
        
        // 相册相关
        $('#uploadPhoto').on('click', () => this.showPhotoModal());
        $('#searchPhotos').on('click', () => this.searchPhotos());
    }
    
    /**
     * 绑定模态框相关事件
     */
    bindModalEvents() {
        // 发布模态框
        $('#closeModal').on('click', () => this.hideModal());
        $('#cancelPublish').on('click', () => this.hideModal());
        $(CONSTANTS.SELECTORS.confirmPublish).on('click', () => this.confirmPublish());
        
        // 删除确认模态框
        $('#closeDeleteModal').on('click', () => this.hideDeleteModal());
        $('#cancelDelete').on('click', () => this.hideDeleteModal());
        $('#confirmDelete').on('click', () => this.confirmDelete());
        
        // 点击背景关闭模态框
        $('.modal-overlay').on('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal();
                this.hideDeleteModal();
                this.hideTwoFactorModal();
            }
        });
    }
    
    /**
     * 绑定键盘事件
     */
    bindKeyboardEvents() {
        $(document).on('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.hideDeleteModal();
                this.hideTwoFactorModal();
            }
        });
    }
    
    /**
     * 处理Hash变化
     */
    handleHashChange() {
        try {
            // 解析新的URL参数
            const hash = window.location.hash.substring(1);
            const [page, queryString] = hash.split('?');
            const params = this.parseQueryString(queryString);
            
            // 检查是否需要重新加载页面或数据
            const newPageIndex = parseInt(params.pageIndex) || 1;
            const newPageSize = parseInt(params.pageSize) || CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE;
            
            const pageChanged = page !== this.state.currentPage;
            const pageIndexChanged = newPageIndex !== this.state.currentPageNum;
            const pageSizeChanged = newPageSize !== this.state.pageSize;
            
            if (pageChanged || pageIndexChanged || pageSizeChanged) {
                // 更新分页参数
                this.state.currentPageNum = newPageIndex;
                this.state.pageSize = newPageSize;
                
                if (pageChanged) {
                    // 页面类型变化，完全重新初始化
                    this.initPageFromHash();
                } else {
                    // 只是分页参数变化，只重新加载数据
                    this.loadPageData();
                }
            }
        } catch (error) {
            console.error('处理Hash变化失败:', error);
        }
    }
    
    /**
     * 页面切换
     * @param {string} page - 页面标识
     */
    switchPage(page) {
        if (!this.isValidPage(page)) {
            console.warn('无效的页面标识:', page);
            return;
        }
        
        try {
            // 更新导航状态
            $(CONSTANTS.SELECTORS.navItem).removeClass('active');
            $(`.nav-item[data-page="${page}"]`).addClass('active');
            
            // 更新页面显示状态
            $(CONSTANTS.SELECTORS.contentPage).removeClass('active');
            $(`#${page}-page`).addClass('active');
            
            // 更新状态
            this.state.currentPage = page;
            
            // 更新面包屑和数据
            this.updateBreadcrumb(page);
            this.loadPageData();
            
            // 更新URL
            this.updateURL(page, this.state.currentPageNum, this.state.pageSize);
        } catch (error) {
            console.error('页面切换失败:', error);
            this.showMessage('页面切换失败', 'error');
        }
    }
    
    /**
     * 检查页面标识是否有效
     * @param {string} page - 页面标识
     * @returns {boolean} 是否有效
     */
    isValidPage(page) {
        return Object.values(CONSTANTS.PAGES).includes(page);
    }
    
    /**
     * 更新面包屑导航
     * @param {string} page - 页面标识
     */
    updateBreadcrumb(page) {
        const currentPageName = CONSTANTS.PAGE_NAMES[page] || CONSTANTS.PAGE_NAMES.profile;
        $(CONSTANTS.SELECTORS.currentPageTitle).text(currentPageName);
    }
    
    /**
     * 从锚点初始化页面
     */
    initPageFromHash() {
        try {
            const hash = window.location.hash.substring(1);
            const validPages = Object.values(CONSTANTS.PAGES);
            
            // 解析URL参数
            const [page, queryString] = hash.split('?');
            const params = this.parseQueryString(queryString);
            
            if (page && validPages.includes(page)) {
                // 更新分页参数
                if (params.pageIndex) {
                    this.state.currentPageNum = parseInt(params.pageIndex) || CONSTANTS.PAGINATION.DEFAULT_PAGE_NUM;
                }
                if (params.pageSize) {
                    this.state.pageSize = parseInt(params.pageSize) || CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE;
                }
                
                this.switchPage(page);
            } else {
                // 默认显示profile页面
                this.switchPage(CONSTANTS.PAGES.PROFILE);
            }
        } catch (error) {
            console.error('从Hash初始化页面失败:', error);
            this.switchPage(CONSTANTS.PAGES.PROFILE);
        }
    }
    
    /**
     * 解析查询字符串
     * @param {string} queryString - 查询字符串
     * @returns {Object} 解析后的参数对象
     */
    parseQueryString(queryString) {
        const params = {};
        if (!queryString) return params;
        
        try {
            const pairs = queryString.split('&');
            for (const pair of pairs) {
                const [key, value] = pair.split('=');
                if (key && value) {
                    params[decodeURIComponent(key)] = decodeURIComponent(value);
                }
            }
        } catch (error) {
            console.warn('解析查询字符串失败:', error);
        }
        
        return params;
    }
    
    /**
     * 构建查询字符串
     * @param {Object} params - 参数对象
     * @returns {string} 查询字符串
     */
    buildQueryString(params) {
        const pairs = [];
        for (const [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined && value !== '') {
                pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            }
        }
        return pairs.length > 0 ? `?${pairs.join('&')}` : '';
    }
    
    /**
     * 更新URL
     * @param {string} page - 页面标识
     * @param {number|null} pageIndex - 页码
     * @param {number|null} pageSize - 页面大小
     */
    updateURL(page, pageIndex = null, pageSize = null) {
        const params = {};
        // 只有当pageIndex不是默认值1时才添加
        if (pageIndex !== null && pageIndex !== CONSTANTS.PAGINATION.DEFAULT_PAGE_NUM) {
            params.pageIndex = pageIndex;
        }
        // 只有当pageSize不是默认值10时才添加
        if (pageSize !== null && pageSize !== CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE) {
            params.pageSize = pageSize;
        }
        
        const queryString = this.buildQueryString(params);
        const newHash = `${page}${queryString}`;
        
        // 避免触发hashchange事件的死循环
        if (window.location.hash.substring(1) !== newHash) {
            history.replaceState(null, null, `#${newHash}`);
        }
    }

    /**
     * 加载用户信息
     * 从API获取用户信息并更新界面
     */
    loadUserInfo() {
        try {
            // 模拟加载用户信息
            const userInfo = {
                account: 'user123',
                nickname: '测试用户',
                gender: 'male',
                signature: '这是一个测试签名',
                avatar: '../core/images/laola.png',
                email: 'user@example.com',
                twoFactorEnabled: false
            };

            // 缓存用户信息
            this.dataCache.userInfo = userInfo;

            // 更新界面
            this.updateUserInterface(userInfo);
            this.updateTwoFactorStatus(userInfo.twoFactorEnabled);
        } catch (error) {
            console.error('加载用户信息失败:', error);
            this.showMessage('加载用户信息失败', 'error');
        }
    }

    /**
     * 更新用户界面信息
     * @param {Object} userInfo - 用户信息对象
     */
    updateUserInterface(userInfo) {
        const elements = {
            '#account': userInfo.account,
            '#nickname': userInfo.nickname,
            '#gender': userInfo.gender,
            '#signature': userInfo.signature,
            '#userName': userInfo.nickname,
            '#userEmail': userInfo.email
        };

        // 批量更新表单元素
        Object.entries(elements).forEach(([selector, value]) => {
            const $element = $(selector);
            if ($element.is('input, textarea, select')) {
                $element.val(value);
            } else {
                $element.text(value);
            }
        });

        // 更新头像
        if (userInfo.avatar) {
            $('#userAvatar, #avatarPreview').attr('src', userInfo.avatar);
        }
    }

    /**
     * 更新双因素验证状态
     * @param {boolean} enabled - 是否已启用双因素验证
     */
    updateTwoFactorStatus(enabled) {
        const config = {
            enabled: {
                statusText: '已绑定',
                buttonText: '解绑双因素验证',
                buttonClass: 'btn-danger',
                buttonIcon: 'fa-unlock'
            },
            disabled: {
                statusText: '未绑定',
                buttonText: '绑定双因素验证',
                buttonClass: 'btn-success',
                buttonIcon: 'fa-shield'
            }
        };

        const currentConfig = enabled ? config.enabled : config.disabled;

        $('.status-text').text(currentConfig.statusText);
        $('#bindTwoFactor')
            .removeClass('btn-success btn-danger')
            .addClass(currentConfig.buttonClass)
            .html(`<i class="fa ${currentConfig.buttonIcon}"></i> ${currentConfig.buttonText}`);
    }

    /**
     * 保存个人资料
     * 验证并提交用户资料信息
     */
    saveProfile() {
        try {
            const formData = this.collectProfileFormData();
            
            if (!this.validateProfileData(formData)) {
                return;
            }

            this.showLoading();

            // 模拟API调用
            this.mockApiCall(() => {
                this.hideLoading();
                this.showMessage('保存成功', 'success');
                $('#userName').text(formData.nickname);
                
                // 更新缓存
                if (this.dataCache.userInfo) {
                    Object.assign(this.dataCache.userInfo, formData);
                }
            }, CONSTANTS.DELAYS.API_MOCK);
        } catch (error) {
            console.error('保存个人资料失败:', error);
            this.hideLoading();
            this.showMessage('保存失败，请重试', 'error');
        }
    }

    /**
     * 收集个人资料表单数据
     * @returns {Object} 表单数据对象
     */
    collectProfileFormData() {
        return {
            nickname: $('#nickname').val().trim(),
            gender: $('#gender').val(),
            signature: $('#signature').val().trim()
        };
    }

    /**
     * 验证个人资料数据
     * @param {Object} data - 待验证的数据
     * @returns {boolean} 验证是否通过
     */
    validateProfileData(data) {
        if (!data.nickname) {
            this.showMessage('请输入昵称', 'warning');
            return false;
        }

        if (data.nickname.length > 20) {
            this.showMessage('昵称不能超过20个字符', 'warning');
            return false;
        }

        return true;
    }

    /**
     * 模拟API调用
     * @param {Function} callback - 成功回调
     * @param {number} delay - 延迟时间
     */
    mockApiCall(callback, delay = CONSTANTS.DELAYS.API_MOCK) {
        setTimeout(callback, delay);
    }

    /**
     * 退出登录
     * 确认后跳转到登录页面
     */
    logout() {
        if (confirm('确定要退出登录吗？')) {
            this.showLoading();
            this.mockApiCall(() => {
                window.location.href = '/login';
            }, CONSTANTS.DELAYS.API_MOCK);
        }
    }

    /**
     * 处理头像上传
     * @param {Event} event - 文件选择事件
     */
    handleAvatarUpload(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;

            if (!this.validateImageFile(file)) {
                return;
            }

            this.previewImage(file);
            this.uploadImage(file);
        } catch (error) {
            console.error('头像上传失败:', error);
            this.showMessage('头像上传失败', 'error');
        }
    }

    /**
     * 验证图片文件
     * @param {File} file - 文件对象
     * @returns {boolean} 验证是否通过
     */
    validateImageFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showMessage('请选择图片文件', 'error');
            return false;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            this.showMessage('图片文件不能超过5MB', 'error');
            return false;
        }

        return true;
    }

    /**
     * 预览图片
     * @param {File} file - 文件对象
     */
    previewImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            $('#avatarPreview, #userAvatar').attr('src', e.target.result);
        };
        reader.readAsDataURL(file);
    }

    /**
     * 上传图片
     * @param {File} file - 文件对象
     */
    uploadImage(file) {
        this.showLoading();
        
        // 模拟上传
        this.mockApiCall(() => {
            this.hideLoading();
            this.showMessage('头像上传成功', 'success');
        }, CONSTANTS.DELAYS.UPLOAD);
    }

    /**
     * 显示双因素验证模态框
     * 根据当前绑定状态显示相应的操作界面
     */
    showTwoFactorModal() {
        try {
            const isEnabled = $('.status-text').text() === '已绑定';
            const modalConfig = this.getTwoFactorModalConfig(isEnabled);
            
            this.setupTwoFactorModal(modalConfig, isEnabled);
            $(CONSTANTS.SELECTORS.twoFactorModal).show();
        } catch (error) {
            console.error('显示双因素验证模态框失败:', error);
            this.showMessage('无法打开双因素验证设置', 'error');
        }
    }

    /**
     * 获取双因素验证模态框配置
     * @param {boolean} isEnabled - 是否已启用
     * @returns {Object} 模态框配置
     */
    getTwoFactorModalConfig(isEnabled) {
        return isEnabled ? {
            title: '解绑双因素验证',
            pinLabel: '请输入6位PIN码确认解绑：',
            confirmText: '确认解绑',
            showQrSection: false
        } : {
            title: '绑定双因素验证',
            pinLabel: '请输入6位PIN码：',
            confirmText: '确认绑定',
            showQrSection: true
        };
    }

    /**
     * 设置双因素验证模态框
     * @param {Object} config - 模态框配置
     * @param {boolean} isEnabled - 是否已启用
     */
    setupTwoFactorModal(config, isEnabled) {
        $('#modalTitle').text(config.title);
        $('.pin-section label').text(config.pinLabel);
        $('#confirmTwoFactor').text(config.confirmText);
        
        if (config.showQrSection) {
            $('.qr-section').show();
            this.generateTwoFactorData();
        } else {
            $('.qr-section').hide();
        }
    }

    /**
     * 隐藏双因素验证模态框
     */
    hideTwoFactorModal() {
        $(CONSTANTS.SELECTORS.twoFactorModal).hide();
        $('#pinCode').val('');
    }

    /**
     * 生成双因素验证数据
     * 生成密钥和二维码
     */
    generateTwoFactorData() {
        try {
            const secretKey = this.generateSecretKey();
            $('#secretKey').val(secretKey);

            // 生成二维码（这里使用占位符）
            $('#qrCode').html('<div style="padding: 20px; color: #666;">二维码占位符</div>');
        } catch (error) {
            console.error('生成双因素验证数据失败:', error);
            this.showMessage('生成验证数据失败', 'error');
        }
    }

    /**
     * 生成密钥
     * @returns {string} 32位随机密钥
     */
    generateSecretKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * 复制密钥到剪贴板
     */
    copySecretKey() {
        try {
            const secretKey = $('#secretKey').val();
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(secretKey).then(() => {
                    this.showMessage('密钥已复制到剪贴板', 'success');
                });
            } else {
                // 降级处理
                this.fallbackCopyText(secretKey);
            }
        } catch (error) {
            console.error('复制密钥失败:', error);
            this.showMessage('复制失败，请手动复制', 'error');
        }
    }

    /**
     * 降级复制文本方法
     * @param {string} text - 要复制的文本
     */
    fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showMessage('密钥已复制到剪贴板', 'success');
        } catch (error) {
            this.showMessage('复制失败，请手动复制', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    /**
     * 确认双因素验证操作
     * 处理绑定或解绑操作
     */
    confirmTwoFactor() {
        try {
            const pinCode = $('#pinCode').val().trim();

            if (!this.validatePinCode(pinCode)) {
                return;
            }

            const isEnabled = $('.status-text').text() === '已绑定';

            this.showLoading();
            this.mockApiCall(() => {
                this.hideLoading();
                this.hideTwoFactorModal();

                if (isEnabled) {
                    this.updateTwoFactorStatus(false);
                    this.showMessage('双因素验证已解绑', 'success');
                } else {
                    this.updateTwoFactorStatus(true);
                    this.showMessage('双因素验证已绑定', 'success');
                }
            }, CONSTANTS.DELAYS.API_MOCK);
        } catch (error) {
            console.error('双因素验证操作失败:', error);
            this.hideLoading();
            this.showMessage('操作失败，请重试', 'error');
        }
    }

    /**
     * 验证PIN码
     * @param {string} pinCode - PIN码
     * @returns {boolean} 验证是否通过
     */
    validatePinCode(pinCode) {
        if (!pinCode) {
            this.showMessage('请输入PIN码', 'warning');
            return false;
        }

        if (pinCode.length !== 6) {
            this.showMessage('PIN码必须是6位数字', 'warning');
            return false;
        }

        if (!/^\d{6}$/.test(pinCode)) {
            this.showMessage('PIN码只能包含数字', 'warning');
            return false;
        }

        return true;
    }

    // 加载页面数据
    loadPageData() {
        switch (this.state.currentPage) {
            case CONSTANTS.PAGES.ARTICLES:
                this.loadArticles();
                break;
            case CONSTANTS.PAGES.MUMBLES:
                this.loadMumbles();
                break;
            case CONSTANTS.PAGES.TIMELINE:
                this.loadTimeline();
                break;
            case CONSTANTS.PAGES.PHOTOS:
                this.loadPhotos();
                break;
        }
    }

    // 加载文章列表
    loadArticles(page = null) {
        this.showLoading();
        // 如果没有传入页码，使用当前页码
        if (page !== null) {
            this.state.currentPageNum = page;
        }
        page = this.state.currentPageNum;

        // 模拟数据 - 生成50篇文章
        const allArticles = [];
        const titles = [
            'JavaScript高级编程技巧',
            'React Hooks深度解析',
            'Vue3 Composition API实战',
            'TypeScript类型系统详解',
            'Node.js性能优化指南',
            'Docker容器化部署',
            '微服务架构设计',
            '数据库索引优化',
            '前端工程化实践',
            '移动端适配方案',
            'Web安全防护策略',
            '算法与数据结构',
            '设计模式实战',
            'Git工作流管理',
            'CI/CD自动化部署',
            '云原生应用开发',
            '大数据处理技术',
            '人工智能入门',
            '区块链技术解析',
            '物联网应用开发',
            '5G技术发展趋势',
            '边缘计算实践',
            'DevOps最佳实践',
            '测试驱动开发',
            '代码重构技巧',
            '性能监控系统',
            '日志分析工具',
            '缓存策略优化',
            '负载均衡配置',
            '高可用架构设计',
            '分布式系统设计',
            '消息队列应用',
            '搜索引擎优化',
            'SEO技术指南',
            '用户体验设计',
            '产品经理技能',
            '项目管理方法',
            '团队协作工具',
            '敏捷开发实践',
            'Scrum方法论',
            '看板管理',
            '持续集成实践',
            '自动化测试',
            '单元测试编写',
            '集成测试策略',
            '端到端测试',
            '性能测试方法',
            '安全测试工具',
            '代码审查流程',
            '技术文档编写',
        ];

        const tags = ['技术', '编程', '生活', '随笔', '教程', '分享'];

        for (let i = 1; i <= 50; i++) {
            allArticles.push({
                id: i.toString(),
                title: titles[i - 1] || `示例文章${i}`,
                introduction: `这是第${i}篇示例文章的简介，包含了丰富的技术内容和实践经验...`,
                tags: [tags[Math.floor(Math.random() * tags.length)]],
                viewCount: Math.floor(Math.random() * 10000) + 100,
                commentCount: Math.floor(Math.random() * 200) + 10,
                createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString()
            });
        }

        // 分页处理
        const startIndex = (page - 1) * this.state.pageSize;
        const endIndex = startIndex + this.state.pageSize;
        const pageArticles = allArticles.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allArticles.length / this.state.pageSize);

        setTimeout(() => {
            // 缓存数据
            this.dataCache.lastLoadedData['articles'] = pageArticles;
            
            this.renderArticlesData(pageArticles);
            this.renderPagination('articles', totalPages, page);
            this.hideLoading();
        }, CONSTANTS.DELAYS.LOADING);
    }

    // 智能渲染文章数据
    renderArticlesData(articles) {
        if (this.isMobile()) {
            this.renderArticlesMobileCards(articles);
            // 隐藏桌面端表格，显示移动端卡片
            $(CONSTANTS.SELECTORS.tableContainer).hide();
            $(CONSTANTS.SELECTORS.mobileCards).show();
        } else {
            this.renderArticlesTable(articles);
            // 显示桌面端表格，隐藏移动端卡片
            $(CONSTANTS.SELECTORS.tableContainer).show();
            $(CONSTANTS.SELECTORS.mobileCards).hide();
        }
    }

    // 渲染文章表格
    renderArticlesTable(articles) {
        const tbody = $('#articlesTableBody');
        tbody.empty();

        articles.forEach(article => {
            const row = `
                <tr>
                    <td class="cell-title">${article.title}</td>
                    <td class="cell-long-text">${article.introduction}</td>
                    <td>${article.tags.map(tag => `<span class="photo-tag">${tag}</span>`).join('')}</td>
                    <td class="cell-status">${article.viewCount}</td>
                    <td class="cell-status">${article.commentCount}</td>
                    <td>${article.createTime}</td>
                    <td class="cell-actions">
                        <div class="table-actions">
                            <button class="btn btn-sm btn-primary" onclick="memberCenter.editArticle('${article.id}')">
                                <i class="fa fa-edit"></i> 修改
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="memberCenter.deleteItem('article', '${article.id}')">
                                <i class="fa fa-trash"></i> 删除
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    // 渲染分页
    renderPagination(type, totalPages, currentPage) {
        const paginationId = `${type}Pagination`;
        const pagination = $(`#${paginationId}`);
        pagination.empty();

        if (totalPages <= 1) return;

        // 生成分页链接URL
        const generatePageUrl = (pageNum) => {
            const params = {};
            // 只有当pageIndex不是默认值1时才添加
            if (pageNum !== 1) {
                params.pageIndex = pageNum;
            }
            // 只有当pageSize不是默认值10时才添加
            if (this.state.pageSize !== CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE) {
                params.pageSize = this.state.pageSize;
            }
            const queryString = this.buildQueryString(params);
            return `#${type}${queryString}`;
        };

        // 上一页
        const prevDisabled = currentPage <= 1 ? 'disabled' : '';
        const prevUrl = prevDisabled ? '#' : generatePageUrl(currentPage - 1);
        pagination.append(`
            <li class="page-item ${prevDisabled}">
                <a class="page-link" href="${prevUrl}" ${prevDisabled ? 'tabindex="-1"' : ''}>
                    <i class="fa fa-chevron-left"></i>
                </a>
            </li>
        `);

        // 页码
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            pagination.append(`
                <li class="page-item">
                    <a class="page-link" href="${generatePageUrl(1)}">1</a>
                </li>
            `);
            if (startPage > 2) {
                pagination.append(`
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const active = i === currentPage ? 'active' : '';
            const pageUrl = active ? '#' : generatePageUrl(i);
            pagination.append(`
                <li class="page-item ${active}">
                    <a class="page-link" href="${pageUrl}">${i}</a>
                </li>
            `);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pagination.append(`
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `);
            }
            pagination.append(`
                <li class="page-item">
                    <a class="page-link" href="${generatePageUrl(totalPages)}">${totalPages}</a>
                </li>
            `);
        }

        // 下一页
        const nextDisabled = currentPage >= totalPages ? 'disabled' : '';
        const nextUrl = nextDisabled ? '#' : generatePageUrl(currentPage + 1);
        pagination.append(`
            <li class="page-item ${nextDisabled}">
                <a class="page-link" href="${nextUrl}" ${nextDisabled ? 'tabindex="-1"' : ''}>
                    <i class="fa fa-chevron-right"></i>
                </a>
            </li>
        `);
    }

    // 跳转到指定页面 (保留用于向后兼容，但推荐使用URL导航)
    goToPage(type, page) {
        this.state.currentPageNum = page;
        this.updateURL(type, page, this.state.pageSize);
        
        switch (type) {
            case CONSTANTS.PAGES.ARTICLES:
                this.loadArticles(page);
                break;
            case CONSTANTS.PAGES.MUMBLES:
                this.loadMumbles(page);
                break;
            case CONSTANTS.PAGES.TIMELINE:
                this.loadTimeline(page);
                break;
            case CONSTANTS.PAGES.PHOTOS:
                this.loadPhotos(page);
                break;
        }
    }

    // 加载碎碎念列表
    loadMumbles(page = null) {
        this.showLoading();
        // 如果没有传入页码，使用当前页码
        if (page !== null) {
            this.state.currentPageNum = page;
        }
        page = this.state.currentPageNum;

        // 模拟数据 - 生成30条碎碎念
        const allMumbles = [];
        const contents = [
            '今天天气真好，适合出去走走',
            '刚写完一篇技术文章，感觉很有成就感',
            '学习新技术总是让人兴奋',
            '代码调试了一整天，终于解决了问题',
            '和同事讨论技术方案，收获很多',
            '周末计划学习一个新的框架',
            '项目上线了，心情很激动',
            '遇到一个有趣的bug，记录一下',
            '技术分享会准备中，有点紧张',
            '重构代码后性能提升了很多',
            '新买的键盘手感不错',
            '今天加班到很晚，但很有收获',
            '和产品经理讨论需求，沟通很重要',
            '代码review发现了一些问题',
            '学习设计模式，感觉豁然开朗',
            '团队协作真的很重要',
            '技术选型需要考虑很多因素',
            '性能优化是一个持续的过程',
            '用户体验设计需要用心思考',
            '技术文档的编写也很重要',
            '自动化测试节省了很多时间',
            '持续集成让开发更高效',
            '代码规范很重要',
            '技术债务要及时处理',
            '学习新技术要保持好奇心',
            '技术分享是很好的学习方式',
            '开源项目贡献很有意义',
            '技术社区交流收获很多',
            '保持学习的心态很重要',
            '技术之路永无止境',
        ];

        for (let i = 1; i <= 30; i++) {
            allMumbles.push({
                id: i.toString(),
                content: contents[i - 1] || `这是第${i}条示例碎碎念内容...`,
                like: Math.floor(Math.random() * 100) + 5,
                commentCount: Math.floor(Math.random() * 20) + 1,
                createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString()
            });
        }

        // 分页处理
        const startIndex = (page - 1) * this.state.pageSize;
        const endIndex = startIndex + this.state.pageSize;
        const pageMumbles = allMumbles.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allMumbles.length / this.state.pageSize);

        setTimeout(() => {
            // 缓存数据
            this.dataCache.lastLoadedData['mumbles'] = pageMumbles;
            
            this.renderMumblesData(pageMumbles);
            this.renderPagination('mumbles', totalPages, page);
            this.hideLoading();
        }, CONSTANTS.DELAYS.LOADING);
    }

    // 智能渲染碎碎念数据
    renderMumblesData(mumbles) {
        if (this.isMobile()) {
            this.renderMumblesMobileCards(mumbles);
            // 隐藏桌面端表格，显示移动端卡片
            $('#mumbles-page .table-container').hide();
            $('#mumbles-page .mobile-cards').show();
        } else {
            this.renderMumblesTable(mumbles);
            // 显示桌面端表格，隐藏移动端卡片
            $('#mumbles-page .table-container').show();
            $('#mumbles-page .mobile-cards').hide();
        }
    }

    // 渲染碎碎念表格
    renderMumblesTable(mumbles) {
        const tbody = $('#mumblesTableBody');
        tbody.empty();

        mumbles.forEach(mumble => {
            const row = `
                <tr>
                    <td class="cell-long-text">${mumble.content}</td>
                    <td class="cell-status">${mumble.like}</td>
                    <td class="cell-status">${mumble.commentCount}</td>
                    <td>${mumble.createTime}</td>
                    <td class="cell-actions">
                        <div class="table-actions">
                            <button class="btn btn-sm btn-primary" onclick="memberCenter.editMumble('${mumble.id}')">
                                <i class="fa fa-edit"></i> 修改
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="memberCenter.deleteItem('mumble', '${mumble.id}')">
                                <i class="fa fa-trash"></i> 删除
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    // 加载时间轴列表
    loadTimeline(page = null) {
        this.showLoading();
        // 如果没有传入页码，使用当前页码
        if (page !== null) {
            this.state.currentPageNum = page;
        }
        page = this.state.currentPageNum;

        // 模拟数据 - 生成25条时间轴
        const allTimeline = [];
        const titles = [
            '项目启动', '第一个里程碑', '技术选型完成', '架构设计确定',
            '开发环境搭建', '第一个功能完成', '代码审查开始', '测试用例编写',
            '集成测试', '性能测试', '安全测试', '用户验收测试',
            '部署准备', '生产环境部署', '监控系统上线', '用户培训',
            '正式上线', '用户反馈收集', '问题修复', '功能优化',
            '版本迭代', '新功能开发', '技术分享', '团队建设',
            '项目总结',
        ];

        const contents = [
            '项目正式启动，团队组建完成',
            '完成第一个重要里程碑',
            '技术栈选型确定，开始技术调研',
            '系统架构设计完成，开始详细设计',
            '开发环境搭建完成，开始编码',
            '核心功能开发完成',
            '代码审查流程建立',
            '自动化测试用例编写完成',
            '系统集成测试开始',
            '性能测试完成，系统性能达标',
            '安全测试通过，无重大安全漏洞',
            '用户验收测试完成',
            '生产环境部署准备就绪',
            '系统成功部署到生产环境',
            '监控和告警系统上线',
            '用户培训完成',
            '系统正式对外提供服务',
            '收集用户反馈，整理需求',
            '修复发现的问题',
            '根据反馈优化系统功能',
            '开始下一个版本开发',
            '新功能开发完成',
            '技术分享会举办',
            '团队建设活动',
            '项目总结会议',
        ];

        for (let i = 1; i <= 25; i++) {
            allTimeline.push({
                id: i.toString(),
                title: titles[i - 1] || `时间轴${i}`,
                content: contents[i - 1] || `这是第${i}条时间轴的内容...`,
                date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                more: Math.random() > 0.5 ? `https://example.com/timeline/${i}` : null,
                createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString()
            });
        }

        // 分页处理
        const startIndex = (page - 1) * this.state.pageSize;
        const endIndex = startIndex + this.state.pageSize;
        const pageTimeline = allTimeline.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allTimeline.length / this.state.pageSize);

        setTimeout(() => {
            // 缓存数据
            this.dataCache.lastLoadedData['timeline'] = pageTimeline;
            
            this.renderTimelineData(pageTimeline);
            this.renderPagination('timeline', totalPages, page);
            this.hideLoading();
        }, CONSTANTS.DELAYS.LOADING);
    }

    // 智能渲染时间轴数据
    renderTimelineData(timeline) {
        if (this.isMobile()) {
            this.renderTimelineMobileCards(timeline);
            // 隐藏桌面端表格，显示移动端卡片
            $('#timeline-page .table-container').hide();
            $('#timeline-page .mobile-cards').show();
        } else {
            this.renderTimelineTable(timeline);
            // 显示桌面端表格，隐藏移动端卡片
            $('#timeline-page .table-container').show();
            $('#timeline-page .mobile-cards').hide();
        }
    }

    // 渲染时间轴表格
    renderTimelineTable(timeline) {
        const tbody = $('#timelineTableBody');
        tbody.empty();

        timeline.forEach(item => {
            const row = `
                <tr>
                    <td class="cell-title">${item.title}</td>
                    <td class="cell-long-text">${item.content}</td>
                    <td>${item.date}</td>
                    <td>${item.more ? `<a href="${item.more}" target="_blank">链接</a>` : '-'}</td>
                    <td>${item.createTime}</td>
                    <td class="cell-actions">
                        <div class="table-actions">
                            <button class="btn btn-sm btn-primary" onclick="memberCenter.editTimeline('${item.id}')">
                                <i class="fa fa-edit"></i> 修改
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="memberCenter.deleteItem('timeline', '${item.id}')">
                                <i class="fa fa-trash"></i> 删除
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    // 加载照片列表
    loadPhotos(page = null) {
        this.showLoading();
        // 如果没有传入页码，使用当前页码
        if (page !== null) {
            this.state.currentPageNum = page;
        }
        page = this.state.currentPageNum;

        // 模拟数据 - 生成40张照片
        const allPhotos = [];
        const titles = [
            '美丽的风景', '城市夜景', '自然风光', '建筑艺术',
            '人物肖像', '美食摄影', '旅行记录', '生活瞬间',
            '工作环境', '学习时光', '运动健身', '休闲娱乐',
            '节日庆祝', '家庭聚会', '朋友聚会', '户外活动',
            '室内设计', '艺术创作', '技术展示', '产品展示',
            '活动记录', '会议现场', '培训现场', '展览现场',
            '演出表演', '比赛现场', '颁奖典礼', '毕业典礼',
            '婚礼现场', '生日派对', '纪念日', '特殊时刻',
            '日常记录', '工作成果', '学习成果', '创作成果',
            '旅行足迹', '生活点滴', '美好回忆', '精彩瞬间',
        ];

        const descriptions = [
            '这是一张美丽的风景照片，展现了自然的魅力',
            '城市夜景灯火辉煌，展现了都市的繁华',
            '自然风光让人心旷神怡，感受大自然的美好',
            '建筑艺术展现了人类的智慧和创造力',
            '人物肖像记录了珍贵的瞬间',
            '美食摄影让人垂涎欲滴',
            '旅行记录留下了美好的回忆',
            '生活瞬间记录了日常的点点滴滴',
            '工作环境展现了专业的工作氛围',
            '学习时光记录了知识的积累过程',
            '运动健身展现了健康的生活方式',
            '休闲娱乐让人放松心情',
            '节日庆祝充满了欢乐的气氛',
            '家庭聚会温馨和睦',
            '朋友聚会热闹非凡',
            '户外活动让人亲近自然',
            '室内设计展现了空间的魅力',
            '艺术创作充满了创意和灵感',
            '技术展示展现了科技的力量',
            '产品展示突出了产品的特点',
            '活动记录留下了难忘的回忆',
            '会议现场展现了专业的氛围',
            '培训现场充满了学习的热情',
            '展览现场展现了丰富的文化内涵',
            '演出表演精彩纷呈',
            '比赛现场紧张刺激',
            '颁奖典礼庄重隆重',
            '毕业典礼充满了感动',
            '婚礼现场浪漫温馨',
            '生日派对欢乐热闹',
            '纪念日意义非凡',
            '特殊时刻值得珍藏',
            '日常记录真实自然',
            '工作成果令人自豪',
            '学习成果让人欣慰',
            '创作成果充满成就感',
            '旅行足迹遍布各地',
            '生活点滴温馨美好',
            '美好回忆永远珍藏',
            '精彩瞬间值得回味',
        ];

        const tags = ['风景', '自然', '人物', '建筑', '城市', '生活', '美食', '旅行'];
        const images = ['../core/images/laola.png', '../core/images/default-avatar.png'];

        for (let i = 1; i <= 40; i++) {
            allPhotos.push({
                id: i.toString(),
                title: titles[i - 1] || `照片${i}`,
                description: descriptions[i - 1] || `这是第${i}张照片的描述`,
                tags: [tags[Math.floor(Math.random() * tags.length)]],
                uploadTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString(),
                accessUrl: images[Math.floor(Math.random() * images.length)]
            });
        }

        // 分页处理
        const startIndex = (page - 1) * this.state.pageSize;
        const endIndex = startIndex + this.state.pageSize;
        const pagePhotos = allPhotos.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allPhotos.length / this.state.pageSize);

        setTimeout(() => {
            // 缓存数据
            this.dataCache.lastLoadedData['photos'] = pagePhotos;
            
            this.renderPhotosData(pagePhotos);
            this.renderPagination('photos', totalPages, page);
            this.hideLoading();
        }, CONSTANTS.DELAYS.LOADING);
    }

    // 智能渲染相册数据
    renderPhotosData(photos) {
        if (this.isMobile()) {
            this.renderPhotosMobileGrid(photos);
            // 隐藏桌面端网格，显示移动端网格
            $('#photos-page .photos-grid').hide();
            $('#photos-page .mobile-photos-grid').show();
        } else {
            this.renderPhotosGrid(photos);
            // 显示桌面端网格，隐藏移动端网格
            $('#photos-page .photos-grid').show();
            $('#photos-page .mobile-photos-grid').hide();
        }
    }

    // 渲染照片网格
    renderPhotosGrid(photos) {
        const grid = $('#photosGrid');
        grid.empty();

        photos.forEach(photo => {
            const card = `
                <div class="photo-card">
                    <img src="${photo.accessUrl}" alt="${photo.title}" class="photo-image">
                    <div class="photo-info">
                        <div class="photo-title">${photo.title}</div>
                        <div class="photo-meta">${photo.uploadTime}</div>
                        <div class="photo-tags">
                            ${photo.tags.map(tag => `<span class="photo-tag">${tag}</span>`).join('')}
                        </div>
                        <div class="photo-actions">
                            <button class="btn btn-sm btn-primary" onclick="memberCenter.editPhoto('${photo.id}')">
                                <i class="fa fa-edit"></i> 修改
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="memberCenter.deleteItem('photo', '${photo.id}')">
                                <i class="fa fa-trash"></i> 删除
                            </button>
                        </div>
                    </div>
                </div>
            `;
            grid.append(card);
        });
    }

    // 显示文章模态框
    showArticleModal(articleId = null) {
        const isEdit = articleId !== null;
        $('#modalTitle').text(isEdit ? '编辑文章' : '发布文章');
        $('#confirmPublish').text(isEdit ? '保存修改' : '发布文章');

        const modalBody = `
            ${this.generateRecordingSection()}
            <div class="form-group">
                <label>标题 <span class="required">*</span></label>
                <input type="text" class="form-control" id="articleTitle" placeholder="请输入文章标题" value="${isEdit ? '示例标题' : ''}">
            </div>
            <div class="form-group">
                <label>选择标签</label>
                <select class="form-control" id="articleTags" multiple>
                    <option value="技术">技术</option>
                    <option value="编程">编程</option>
                    <option value="生活">生活</option>
                </select>
            </div>
            <div class="form-group">
                <label>补充标签</label>
                <input type="text" class="form-control" id="articleExtraTags" placeholder="请输入补充标签，用逗号分隔">
            </div>
            <div class="form-group">
                <label>文章简介 <span class="required">*</span></label>
                <textarea class="form-control" id="articleIntroduction" rows="3" placeholder="请输入文章简介">${isEdit ? '示例简介' : ''}</textarea>
            </div>
            <div class="form-group">
                <label>文章内容 <span class="required">*</span></label>
                <textarea class="form-control" id="articleContent" rows="10" placeholder="请输入文章内容">${isEdit ? '示例内容' : ''}</textarea>
            </div>
        `;

        $('#modalBody').html(modalBody);
        $('#publishModal').show();

        // 绑定录音相关事件
        this.bindRecordingEvents();
    }

    // 显示碎碎念模态框
    showMumbleModal(mumbleId = null) {
        const isEdit = mumbleId !== null;
        $('#modalTitle').text(isEdit ? '编辑碎碎念' : '发布碎碎念');
        $('#confirmPublish').text(isEdit ? '保存修改' : '发布碎碎念');

        const modalBody = `
            ${this.generateRecordingSection()}
            <div class="form-group">
                <label>内容 <span class="required">*</span></label>
                <textarea class="form-control" id="mumbleContent" rows="6" placeholder="请输入碎碎念内容">${isEdit ? '示例内容' : ''}</textarea>
            </div>
        `;

        $('#modalBody').html(modalBody);
        $('#publishModal').show();

        // 绑定录音相关事件
        this.bindRecordingEvents();
    }

    // 显示时间轴模态框
    showTimelineModal(timelineId = null) {
        const isEdit = timelineId !== null;
        $('#modalTitle').text(isEdit ? '编辑时间轴' : '发布时间轴');
        $('#confirmPublish').text(isEdit ? '保存修改' : '发布时间轴');

        const modalBody = `
            ${this.generateRecordingSection()}
            <div class="form-group">
                <label>标题 <span class="required">*</span></label>
                <input type="text" class="form-control" id="timelineTitle" placeholder="请输入时间轴标题" value="${isEdit ? '示例标题' : ''}">
            </div>
            <div class="form-group">
                <label>更多链接</label>
                <input type="url" class="form-control" id="timelineMore" placeholder="请输入链接地址" value="${isEdit ? 'https://example.com' : ''}">
            </div>
            <div class="form-group">
                <label>时间轴日期 <span class="required">*</span></label>
                <input type="date" class="form-control" id="timelineDate" value="${isEdit ? '2024-01-15' : ''}">
            </div>
            <div class="form-group">
                <label>内容 <span class="required">*</span></label>
                <textarea class="form-control" id="timelineContent" rows="6" placeholder="请输入时间轴内容">${isEdit ? '示例内容' : ''}</textarea>
            </div>
        `;

        $('#modalBody').html(modalBody);
        $('#publishModal').show();

        // 绑定录音相关事件
        this.bindRecordingEvents();
    }

    // 显示照片模态框
    showPhotoModal(photoId = null) {
        const isEdit = photoId !== null;
        $('#modalTitle').text(isEdit ? '编辑照片' : '上传照片');
        $('#confirmPublish').text(isEdit ? '保存修改' : '上传照片');

        const modalBody = `
            ${!isEdit ? `
            <div class="form-group">
                <label>选择照片 <span class="required">*</span></label>
                <input type="file" class="form-control" id="photoFile" accept="image/*">
            </div>
            ` : ''}
            <div class="form-group">
                <label>照片预览</label>
                <div class="photo-preview">
                    <img src="${isEdit ? '../core/images/default-avatar.png' : ''}" alt="照片预览" id="photoPreview" style="max-width: 100%; max-height: 300px; ${!isEdit ? 'display: none;' : ''}">
                </div>
            </div>
            <div class="form-group">
                <label>选择标签</label>
                <select class="form-control" id="photoTags" multiple>
                    <option value="风景">风景</option>
                    <option value="自然">自然</option>
                    <option value="人物">人物</option>
                </select>
            </div>
            <div class="form-group">
                <label>补充标签</label>
                <input type="text" class="form-control" id="photoExtraTags" placeholder="请输入补充标签，用逗号分隔">
            </div>
            <div class="form-group">
                <label>描述</label>
                <textarea class="form-control" id="photoDescription" rows="3" placeholder="请输入照片描述">${isEdit ? '示例描述' : ''}</textarea>
            </div>
        `;

        $('#modalBody').html(modalBody);
        $('#publishModal').show();

        // 绑定照片上传事件
        if (!isEdit) {
            $('#photoFile').on('change', (e) => this.handlePhotoPreview(e));
        }
    }

    // 处理照片预览
    handlePhotoPreview(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            $('#photoPreview').attr('src', e.target.result).show();
        };
        reader.readAsDataURL(file);
    }

    /**
     * 生成录音组件HTML
     * @returns {string} 录音组件的HTML字符串
     */
    generateRecordingSection() {
        return `
            <div class="recording-section">
                <div class="recording-controls">
                    <button type="button" class="btn btn-danger" id="startRecording">
                        <i class="fa fa-microphone"></i> 开始录音
                    </button>
                    <button type="button" class="btn btn-secondary" id="stopRecording" style="display: none;">
                        <i class="fa fa-stop"></i> 停止录音
                    </button>
                    <button type="button" class="btn btn-info" id="playRecording" style="display: none;">
                        <i class="fa fa-play"></i> 播放
                    </button>
                    <button type="button" class="btn btn-warning" id="pauseRecording" style="display: none;">
                        <i class="fa fa-pause"></i> 暂停
                    </button>
                    <button type="button" class="btn btn-secondary" id="clearRecording" style="display: none;">
                        <i class="fa fa-trash"></i> 清除
                    </button>
                    <button type="button" class="btn btn-success" id="uploadRecording" style="display: none;">
                        <i class="fa fa-upload"></i> 上传
                    </button>
                </div>
                <div class="recording-status" id="recordingStatus" style="display: none;">
                    <div class="recording-indicator"></div>
                    <span id="recordingStatusText">准备录音...</span>
                    <span id="recordingTime">00:00</span>
                </div>
                <div class="recording-player" id="recordingPlayer" style="display: none;">
                    <div class="audio-progress-container">
                        <div class="audio-progress" id="audioProgress">
                            <div class="audio-progress-bar" id="audioProgressBar"></div>
                            <div class="audio-progress-handle" id="audioProgressHandle"></div>
                        </div>
                    </div>
                    <div class="audio-time-info">
                        <span id="currentTime">00:00</span>
                        <span class="time-separator">/</span>
                        <span id="totalTime">00:00</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定录音相关事件
     */
    bindRecordingEvents() {
        // 重置录音状态
        this.resetRecordingState();
        
        // 绑定按钮事件
        $('#startRecording').on('click', () => this.startRecording());
        $('#stopRecording').on('click', () => this.stopRecording());
        $('#playRecording').on('click', () => this.togglePlayback());
        $('#pauseRecording').on('click', () => this.pausePlayback());
        $('#clearRecording').on('click', () => this.clearRecording());
        $('#uploadRecording').on('click', () => this.uploadRecording());
        
        // 绑定进度条事件
        this.bindProgressBarEvents();
    }

    /**
     * 重置录音状态
     */
    resetRecordingState() {
        // 停止所有录音和播放
        this.stopRecording();
        this.stopPlayback();
        
        // 重置状态
        this.recordingState = {
            isRecording: false,
            isPaused: false,
            isPlaying: false,
            duration: 0,
            currentTime: 0,
            startTime: null,
            recordingTimer: null,
            playbackTimer: null,
            hasRecording: false
        };
        
        // 清理媒体资源
        this.cleanupMediaResources();
        
        // 更新UI
        this.updateRecordingUI();
    }

    /**
     * 清理媒体资源
     */
    cleanupMediaResources() {
        // 停止媒体流
        if (this.media.stream) {
            this.media.stream.getTracks().forEach(track => track.stop());
            this.media.stream = null;
        }
        
        // 清理URL对象
        if (this.media.audioUrl) {
            URL.revokeObjectURL(this.media.audioUrl);
            this.media.audioUrl = null;
        }
        
        // 重置媒体对象
        this.media.mediaRecorder = null;
        this.media.audioChunks = [];
        this.media.audioBlob = null;
        this.media.audioElement = null;
    }

    /**
     * 开始录音
     */
    async startRecording() {
        try {
            // 检查浏览器支持
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.showMessage('浏览器不支持录音功能', 'error');
                return;
            }

            // 清理之前的录音
            this.cleanupMediaResources();

            // 获取麦克风权限
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            this.media.stream = stream;

            // 检查支持的音频格式
            const mimeType = MediaRecorder.isTypeSupported(CONSTANTS.RECORDING.AUDIO_TYPE) 
                ? CONSTANTS.RECORDING.AUDIO_TYPE 
                : CONSTANTS.RECORDING.FALLBACK_TYPE;

            // 创建录音器
            this.media.mediaRecorder = new MediaRecorder(stream, { mimeType });
            this.media.audioChunks = [];

            // 设置事件处理器
            this.setupMediaRecorderEvents();

            // 开始录音
            this.media.mediaRecorder.start();
            this.recordingState.isRecording = true;
            this.recordingState.startTime = Date.now();

            // 开始计时
            this.startRecordingTimer();

            // 更新UI
            this.updateRecordingUI();
            this.showMessage('开始录音', 'success');

        } catch (error) {
            console.error('开始录音失败:', error);
            this.handleRecordingError(error);
        }
    }

    /**
     * 设置MediaRecorder事件处理器
     */
    setupMediaRecorderEvents() {
        this.media.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.media.audioChunks.push(event.data);
            }
        };

        this.media.mediaRecorder.onstop = () => {
            this.processRecordedAudio();
        };

        this.media.mediaRecorder.onerror = (event) => {
            console.error('录音错误:', event.error);
            this.showMessage('录音过程中出现错误', 'error');
        };
    }

    /**
     * 处理录制的音频
     */
    processRecordedAudio() {
        try {
            // 创建音频Blob
            const mimeType = this.media.mediaRecorder.mimeType;
            this.media.audioBlob = new Blob(this.media.audioChunks, { type: mimeType });
            this.media.audioUrl = URL.createObjectURL(this.media.audioBlob);

            // 创建音频元素用于播放和获取时长
            this.media.audioElement = new Audio(this.media.audioUrl);
            
            this.media.audioElement.onloadedmetadata = () => {
                this.recordingState.duration = this.media.audioElement.duration;
                this.recordingState.hasRecording = true;
                this.updateRecordingUI();
            };

            // 检查录音时长
            const recordingDuration = this.recordingState.duration;
            if (recordingDuration < CONSTANTS.RECORDING.MIN_DURATION) {
                this.showMessage(`录音时长太短，至少需要${CONSTANTS.RECORDING.MIN_DURATION}秒`, 'warning');
                this.clearRecording();
                return;
            }

            this.showMessage('录音完成', 'success');

        } catch (error) {
            console.error('处理录音失败:', error);
            this.showMessage('处理录音失败', 'error');
        }
    }

    /**
     * 停止录音
     */
    stopRecording() {
        try {
            if (this.media.mediaRecorder && this.recordingState.isRecording) {
                this.media.mediaRecorder.stop();
                this.recordingState.isRecording = false;
                
                // 停止录音计时器
                this.stopRecordingTimer();
                
                // 停止媒体流
                if (this.media.stream) {
                    this.media.stream.getTracks().forEach(track => track.stop());
                }
                
                this.updateRecordingUI();
            }
        } catch (error) {
            console.error('停止录音失败:', error);
            this.showMessage('停止录音失败', 'error');
        }
    }

    /**
     * 开始录音计时器
     */
    startRecordingTimer() {
        this.recordingState.recordingTimer = setInterval(() => {
            if (this.recordingState.isRecording) {
                const elapsed = (Date.now() - this.recordingState.startTime) / 1000;
                
                // 检查最大录音时长
                if (elapsed >= CONSTANTS.RECORDING.MAX_DURATION) {
                    this.stopRecording();
                    this.showMessage(`已达到最大录音时长${CONSTANTS.RECORDING.MAX_DURATION}秒`, 'warning');
                    return;
                }
                
                this.updateRecordingTime(elapsed);
            }
        }, CONSTANTS.RECORDING.UPDATE_INTERVAL);
    }

    /**
     * 停止录音计时器
     */
    stopRecordingTimer() {
        if (this.recordingState.recordingTimer) {
            clearInterval(this.recordingState.recordingTimer);
            this.recordingState.recordingTimer = null;
        }
    }

    /**
     * 切换播放/暂停
     */
    togglePlayback() {
        if (!this.recordingState.hasRecording || !this.media.audioElement) {
            this.showMessage('没有可播放的录音', 'warning');
            return;
        }

        if (this.recordingState.isPlaying) {
            this.pausePlayback();
        } else {
            this.startPlayback();
        }
    }

    /**
     * 开始播放
     */
    startPlayback() {
        try {
            this.media.audioElement.currentTime = this.recordingState.currentTime;
            this.media.audioElement.play();
            this.recordingState.isPlaying = true;
            this.recordingState.isPaused = false;
            
            this.startPlaybackTimer();
            this.updateRecordingUI();
            
        } catch (error) {
            console.error('播放失败:', error);
            this.showMessage('播放失败', 'error');
        }
    }

    /**
     * 暂停播放
     */
    pausePlayback() {
        try {
            if (this.media.audioElement) {
                this.media.audioElement.pause();
                this.recordingState.isPlaying = false;
                this.recordingState.isPaused = true;
                this.recordingState.currentTime = this.media.audioElement.currentTime;
                
                this.stopPlaybackTimer();
                this.updateRecordingUI();
            }
        } catch (error) {
            console.error('暂停失败:', error);
        }
    }

    /**
     * 停止播放
     */
    stopPlayback() {
        try {
            if (this.media.audioElement) {
                this.media.audioElement.pause();
                this.media.audioElement.currentTime = 0;
            }
            
            this.recordingState.isPlaying = false;
            this.recordingState.isPaused = false;
            this.recordingState.currentTime = 0;
            
            this.stopPlaybackTimer();
            this.updateRecordingUI();
            
        } catch (error) {
            console.error('停止播放失败:', error);
        }
    }

    /**
     * 开始播放计时器
     */
    startPlaybackTimer() {
        this.recordingState.playbackTimer = setInterval(() => {
            if (this.recordingState.isPlaying && this.media.audioElement) {
                this.recordingState.currentTime = this.media.audioElement.currentTime;
                this.updatePlaybackProgress();
                
                // 检查是否播放完成
                if (this.recordingState.currentTime >= this.recordingState.duration) {
                    this.stopPlayback();
                }
            }
        }, CONSTANTS.RECORDING.UPDATE_INTERVAL);
    }

    /**
     * 停止播放计时器
     */
    stopPlaybackTimer() {
        if (this.recordingState.playbackTimer) {
            clearInterval(this.recordingState.playbackTimer);
            this.recordingState.playbackTimer = null;
        }
    }

    /**
     * 清除录音
     */
    clearRecording() {
        try {
            // 停止播放
            this.stopPlayback();
            
            // 清理资源
            this.cleanupMediaResources();
            
            // 重置状态
            this.recordingState.hasRecording = false;
            this.recordingState.duration = 0;
            this.recordingState.currentTime = 0;
            
            // 更新UI
            this.updateRecordingUI();
            
            this.showMessage('录音已清除', 'info');
            
        } catch (error) {
            console.error('清除录音失败:', error);
            this.showMessage('清除录音失败', 'error');
        }
    }

    /**
     * 上传录音
     */
    async uploadRecording() {
        try {
            if (!this.recordingState.hasRecording || !this.media.audioBlob) {
                this.showMessage('没有可上传的录音', 'warning');
                return;
            }

            this.showLoading('正在上传录音...');

            // 模拟上传过程
            const formData = new FormData();
            formData.append('audio', this.media.audioBlob, 'recording.webm');
            formData.append('duration', this.recordingState.duration);

            // 模拟API调用
            await this.mockApiCall(() => {
                this.hideLoading();
                this.showMessage('录音上传成功', 'success');
                
                // 可以在这里处理上传成功后的逻辑
                // 比如将录音URL添加到表单数据中
                
            }, CONSTANTS.DELAYS.UPLOAD);

        } catch (error) {
            console.error('上传录音失败:', error);
            this.hideLoading();
            this.showMessage('上传录音失败', 'error');
        }
    }

    /**
     * 处理录音错误
     * @param {Error} error - 错误对象
     */
    handleRecordingError(error) {
        let message = '录音失败';
        
        if (error.name === 'NotAllowedError') {
            message = '请允许访问麦克风';
        } else if (error.name === 'NotFoundError') {
            message = '未找到麦克风设备';
        } else if (error.name === 'NotSupportedError') {
            message = '浏览器不支持录音功能';
        }
        
        this.showMessage(message, 'error');
        this.resetRecordingState();
    }

    /**
     * 更新录音UI状态
     */
    updateRecordingUI() {
        const { isRecording, hasRecording, isPlaying, isPaused } = this.recordingState;
        
        // 录音控制按钮
        $('#startRecording').toggle(!isRecording && !hasRecording);
        $('#stopRecording').toggle(isRecording);
        $('#playRecording').toggle(hasRecording && !isRecording);
        $('#pauseRecording').toggle(isPlaying);
        $('#clearRecording').toggle(hasRecording && !isRecording);
        $('#uploadRecording').toggle(hasRecording && !isRecording);
        
        // 录音状态显示
        $('#recordingStatus').toggle(isRecording);
        $('#recordingPlayer').toggle(hasRecording && !isRecording);
        
        // 更新播放按钮状态
        if (hasRecording) {
            const playBtn = $('#playRecording');
            if (isPlaying) {
                playBtn.html('<i class="fa fa-pause"></i> 暂停');
            } else if (isPaused) {
                playBtn.html('<i class="fa fa-play"></i> 继续');
            } else {
                playBtn.html('<i class="fa fa-play"></i> 播放');
            }
        }
        
        // 更新时间显示
        this.updateTimeDisplay();
    }

    /**
     * 更新录音时间显示
     * @param {number} seconds - 时间（秒）
     */
    updateRecordingTime(seconds) {
        const timeStr = this.formatTime(seconds);
        $('#recordingTime').text(timeStr);
        $('#recordingStatusText').text(`录音中... ${timeStr}`);
    }

    /**
     * 更新时间显示
     */
    updateTimeDisplay() {
        const currentTimeStr = this.formatTime(this.recordingState.currentTime);
        const totalTimeStr = this.formatTime(this.recordingState.duration);
        
        $('#currentTime').text(currentTimeStr);
        $('#totalTime').text(totalTimeStr);
    }

    /**
     * 更新播放进度
     */
    updatePlaybackProgress() {
        const { currentTime, duration } = this.recordingState;
        
        if (duration > 0) {
            const progress = (currentTime / duration) * 100;
            $('#audioProgressBar').css('width', `${progress}%`);
            $('#audioProgressHandle').css('left', `${progress}%`);
        }
        
        this.updateTimeDisplay();
    }

    /**
     * 格式化时间显示
     * @param {number} seconds - 时间（秒）
     * @returns {string} 格式化的时间字符串 (MM:SS)
     */
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return '00:00';
        }
        
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 绑定进度条事件
     */
    bindProgressBarEvents() {
        const progressBar = $('#audioProgress');
        const progressHandle = $('#audioProgressHandle');
        
        let isDragging = false;
        
        // 点击进度条跳转
        progressBar.on('click', (e) => {
            if (!this.recordingState.hasRecording) return;
            
            const rect = progressBar[0].getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const progress = clickX / rect.width;
            const newTime = progress * this.recordingState.duration;
            
            this.seekTo(newTime);
        });
        
        // 进度条拖拽
        progressHandle.on('mousedown', (e) => {
            if (!this.recordingState.hasRecording) return;
            
            isDragging = true;
            e.preventDefault();
            
            const startX = e.clientX;
            const progressRect = progressBar[0].getBoundingClientRect();
            const handleRect = progressHandle[0].getBoundingClientRect();
            const startLeft = (handleRect.left - progressRect.left) / progressRect.width;
            
            const handleMouseMove = (moveEvent) => {
                if (!isDragging) return;
                
                const deltaX = moveEvent.clientX - startX;
                const deltaProgress = deltaX / progressRect.width;
                const newProgress = Math.max(0, Math.min(1, startLeft + deltaProgress));
                const newTime = newProgress * this.recordingState.duration;
                
                // 实时更新显示但不实际跳转
                this.recordingState.currentTime = newTime;
                this.updatePlaybackProgress();
            };
            
            const handleMouseUp = () => {
                if (isDragging) {
                    isDragging = false;
                    this.seekTo(this.recordingState.currentTime);
                }
                $(document).off('mousemove', handleMouseMove);
                $(document).off('mouseup', handleMouseUp);
            };
            
            $(document).on('mousemove', handleMouseMove);
            $(document).on('mouseup', handleMouseUp);
        });
        
        // 触摸设备支持
        progressHandle.on('touchstart', (e) => {
            if (!this.recordingState.hasRecording) return;
            
            const touch = e.originalEvent.touches[0];
            const progressRect = progressBar[0].getBoundingClientRect();
            
            const handleTouchMove = (moveEvent) => {
                const moveTouch = moveEvent.originalEvent.touches[0];
                const progress = Math.max(0, Math.min(1, 
                    (moveTouch.clientX - progressRect.left) / progressRect.width));
                const newTime = progress * this.recordingState.duration;
                
                this.recordingState.currentTime = newTime;
                this.updatePlaybackProgress();
            };
            
            const handleTouchEnd = () => {
                this.seekTo(this.recordingState.currentTime);
                $(document).off('touchmove', handleTouchMove);
                $(document).off('touchend', handleTouchEnd);
            };
            
            $(document).on('touchmove', handleTouchMove);
            $(document).on('touchend', handleTouchEnd);
        });
    }

    /**
     * 跳转到指定时间
     * @param {number} time - 目标时间（秒）
     */
    seekTo(time) {
        if (!this.recordingState.hasRecording || !this.media.audioElement) return;
        
        this.recordingState.currentTime = Math.max(0, Math.min(time, this.recordingState.duration));
        
        if (this.media.audioElement) {
            this.media.audioElement.currentTime = this.recordingState.currentTime;
        }
        
        this.updatePlaybackProgress();
    }

    // 编辑功能
    editArticle(id) {
        this.showArticleModal(id);
    }

    editMumble(id) {
        this.showMumbleModal(id);
    }

    editTimeline(id) {
        this.showTimelineModal(id);
    }

    editPhoto(id) {
        this.showPhotoModal(id);
    }

    // 删除项目
    deleteItem(type, id) {
        this.state.currentDeleteItem = {type, id};
        $('#deleteModal').show();
    }

    // 确认删除
    confirmDelete() {
        if (this.state.currentDeleteItem) {
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                this.hideDeleteModal();
                this.showMessage('删除成功', 'success');
                this.loadPageData(); // 重新加载数据
            }, CONSTANTS.DELAYS.LOADING);
        }
    }

    // 搜索功能
    searchArticles() {
        const title = $('#articleTitleSearch').val();
        const tags = $('#articleTagSearch').val();
        this.showMessage(`搜索文章：标题="${title}"，标签="${tags}"`, 'info');
    }

    searchMumbles() {
        const content = $('#mumbleContentSearch').val();
        this.showMessage(`搜索碎碎念：内容="${content}"`, 'info');
    }

    searchTimeline() {
        const keyword = $('#timelineSearch').val();
        this.showMessage(`搜索时间轴：关键词="${keyword}"`, 'info');
    }

    searchPhotos() {
        const tags = $('#photoTagSearch').val();
        const desc = $('#photoDescSearch').val();
        this.showMessage(`搜索照片：标签="${tags}"，描述="${desc}"`, 'info');
    }

    // 确认发布
    confirmPublish() {
        const modalTitle = $('#modalTitle').text();

        if (modalTitle.includes('文章')) {
            this.publishArticle();
        } else if (modalTitle.includes('碎碎念')) {
            this.publishMumble();
        } else if (modalTitle.includes('时间轴')) {
            this.publishTimeline();
        } else if (modalTitle.includes('照片')) {
            this.publishPhoto();
        }
    }

    // 发布文章
    publishArticle() {
        const title = $('#articleTitle').val();
        const introduction = $('#articleIntroduction').val();
        const content = $('#articleContent').val();

        if (!title || !introduction || !content) {
            this.showMessage('请填写必填字段', 'warning');
            return;
        }

        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.hideModal();
            this.showMessage('文章发布成功', 'success');
            this.loadArticles();
        }, CONSTANTS.DELAYS.LOADING);
    }

    // 发布碎碎念
    publishMumble() {
        const content = $('#mumbleContent').val();

        if (!content) {
            this.showMessage('请输入内容', 'warning');
            return;
        }

        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.hideModal();
            this.showMessage('碎碎念发布成功', 'success');
            this.loadMumbles();
        }, CONSTANTS.DELAYS.LOADING);
    }

    // 发布时间轴
    publishTimeline() {
        const title = $('#timelineTitle').val();
        const date = $('#timelineDate').val();
        const content = $('#timelineContent').val();

        if (!title || !date || !content) {
            this.showMessage('请填写必填字段', 'warning');
            return;
        }

        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.hideModal();
            this.showMessage('时间轴发布成功', 'success');
            this.loadTimeline();
        }, CONSTANTS.DELAYS.LOADING);
    }

    // 发布照片
    publishPhoto() {
        const description = $('#photoDescription').val();

        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.hideModal();
            this.showMessage('照片上传成功', 'success');
            this.loadPhotos();
        }, CONSTANTS.DELAYS.LOADING);
    }

    /**
     * 模态框控制方法
     * 统一管理各种模态框的显示和隐藏
     */
    
    /**
     * 隐藏发布模态框
     */
    hideModal() {
        $(CONSTANTS.SELECTORS.publishModal).hide();
        $(CONSTANTS.SELECTORS.modalBody).empty();
    }

    /**
     * 隐藏删除确认模态框
     */
    hideDeleteModal() {
        $(CONSTANTS.SELECTORS.deleteModal).hide();
        this.state.currentDeleteItem = null;
    }

    /**
     * 显示加载提示
     * @param {string} message - 加载提示文字
     */
    showLoading(message = '加载中...') {
        const loadingText = $('.loading-spinner p');
        if (loadingText.length > 0) {
            loadingText.text(message);
        }
        $(CONSTANTS.SELECTORS.loadingOverlay).show();
    }

    /**
     * 隐藏加载提示
     */
    hideLoading() {
        $(CONSTANTS.SELECTORS.loadingOverlay).hide();
    }

    /**
     * 显示消息提示
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (success|error|warning|info)
     */
    showMessage(message, type = 'info') {
        try {
            // 消息类型配置
            const messageConfig = CONSTANTS.MESSAGE_TYPES;
            const config = messageConfig[type.toUpperCase()] || messageConfig.INFO;
            
            // 生成唯一ID
            const messageId = `message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            const alert = this.createToastElement(messageId, type, message, config);
            this.appendToastToContainer(alert);
            this.animateToast(alert, messageId);
        } catch (error) {
            console.error('显示消息失败:', error);
        }
    }

    /**
     * 创建Toast元素
     * @param {string} messageId - 消息ID
     * @param {string} type - 消息类型
     * @param {string} message - 消息内容
     * @param {Object} config - 配置对象
     * @returns {jQuery} Toast元素
     */
    createToastElement(messageId, type, message, config) {
        const alert = $(`
            <div class="toast-message" id="${messageId}" data-type="${type}">
                <div class="toast-content">
                    <div class="toast-icon">
                        <i class="fa ${config.icon}"></i>
                    </div>
                    <div class="toast-text">
                        <div class="toast-message-text">${message}</div>
                    </div>
                    <button type="button" class="toast-close">
                        <i class="fa fa-times"></i>
                    </button>
                </div>
                <div class="toast-progress">
                    <div class="toast-progress-bar"></div>
                </div>
            </div>
        `);

        // 动态设置样式
        alert.css({
            '--toast-color': config.color,
            '--toast-bg-color': config.bgColor,
            '--toast-border-color': config.borderColor,
            '--toast-text-color': config.textColor
        });

        return alert;
    }

    /**
     * 将Toast添加到容器
     * @param {jQuery} alert - Toast元素
     */
    appendToastToContainer(alert) {
        let container = $(CONSTANTS.SELECTORS.toastContainer);
        if (container.length === 0) {
            container = $('<div id="toast-container"></div>');
            $('body').append(container);
        }
        container.append(alert);
    }

    /**
     * 添加Toast动画效果
     * @param {jQuery} alert - Toast元素
     * @param {string} messageId - 消息ID
     */
    animateToast(alert, messageId) {
        // 触发入场动画
        setTimeout(() => {
            alert.addClass('toast-show');
        }, 10);

        // 开始进度条动画
        setTimeout(() => {
            alert.find('.toast-progress-bar').addClass('toast-progress-active');
        }, 100);

        // 绑定关闭事件
        alert.find('.toast-close').on('click', () => {
            this.hideMessage(messageId);
        });

        // 自动关闭
        setTimeout(() => {
            this.hideMessage(messageId);
        }, CONSTANTS.DELAYS.TOAST_AUTO_HIDE);
    }

    /**
     * 隐藏消息
     * @param {string} messageId - 消息ID
     */
    hideMessage(messageId) {
        try {
            const alert = $(`#${messageId}`);
            if (alert.length === 0) return;

            alert.addClass('toast-hide');
            setTimeout(() => {
                alert.remove();
                
                // 如果没有消息了，移除容器
                const container = $(CONSTANTS.SELECTORS.toastContainer);
                if (container.children().length === 0) {
                    container.remove();
                }
            }, CONSTANTS.DELAYS.TOAST_HIDE_ANIMATION);
        } catch (error) {
            console.error('隐藏消息失败:', error);
        }
    }

    /**
     * 主题管理相关方法
     */
    
    /**
     * 初始化主题
     * 根据系统偏好或本地存储设置主题
     */
    initTheme() {
        try {
            const savedTheme = localStorage.getItem('theme') || 
                             (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            this.setTheme(savedTheme);
        } catch (error) {
            console.error('初始化主题失败:', error);
            this.setTheme('light'); // 默认使用浅色主题
        }
    }

    /**
     * 设置主题
     * @param {string} theme - 主题名称 (light|dark)
     */
    setTheme(theme) {
        try {
            if (!['light', 'dark'].includes(theme)) {
                theme = 'light';
            }
            
            this.state.currentTheme = theme;
            $('html').attr('data-theme', theme);
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.error('设置主题失败:', error);
        }
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const newTheme = this.state.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    /**
     * 移动端菜单控制相关方法
     */
    
    /**
     * 切换移动端菜单显示状态
     */
    toggleMobileMenu() {
        $(CONSTANTS.SELECTORS.memberSidebar).toggleClass('active');
        $(CONSTANTS.SELECTORS.sidebarOverlay).toggleClass('active');
    }

    /**
     * 关闭移动端菜单
     */
    closeMobileMenu() {
        $(CONSTANTS.SELECTORS.memberSidebar).removeClass('active');
        $(CONSTANTS.SELECTORS.sidebarOverlay).removeClass('active');
    }

    /**
     * 响应式处理相关方法
     */
    
    /**
     * 处理窗口大小改变
     * 响应式调整布局和数据显示
     */
    handleResize() {
        try {
            const width = $(window).width();
            
            // 大屏幕时自动关闭移动端菜单
            if (width > CONSTANTS.BREAKPOINTS.TABLET) {
                this.closeMobileMenu();
            }
            
            // 重新渲染当前页面数据以适应新的屏幕尺寸
            this.rerenderCurrentPageData();
        } catch (error) {
            console.error('处理窗口大小改变失败:', error);
        }
    }

    /**
     * 检查是否为移动端
     * @returns {boolean} 是否为移动端
     */
    isMobile() {
        return $(window).width() <= CONSTANTS.BREAKPOINTS.MOBILE;
    }

    /**
     * 检查是否为平板端
     * @returns {boolean} 是否为平板端
     */
    isTablet() {
        const width = $(window).width();
        return width > CONSTANTS.BREAKPOINTS.MOBILE && width <= CONSTANTS.BREAKPOINTS.TABLET;
    }

    /**
     * 重新渲染当前页面数据
     * 根据屏幕尺寸重新渲染数据显示
     */
    rerenderCurrentPageData() {
        try {
            // 获取当前页面的最后加载的数据
            if (this.dataCache.lastLoadedData && this.dataCache.lastLoadedData[this.state.currentPage]) {
                const data = this.dataCache.lastLoadedData[this.state.currentPage];
                this.renderPageData(this.state.currentPage, data);
            }
        } catch (error) {
            console.error('重新渲染页面数据失败:', error);
        }
    }

    /**
     * 统一的数据渲染方法
     * @param {string} pageType - 页面类型
     * @param {Array} data - 数据数组
     */
    renderPageData(pageType, data) {
        try {
            switch (pageType) {
                case CONSTANTS.PAGES.ARTICLES:
                    this.renderArticlesData(data);
                    break;
                case CONSTANTS.PAGES.MUMBLES:
                    this.renderMumblesData(data);
                    break;
                case CONSTANTS.PAGES.TIMELINE:
                    this.renderTimelineData(data);
                    break;
                case CONSTANTS.PAGES.PHOTOS:
                    this.renderPhotosData(data);
                    break;
                default:
                    console.warn('未知的页面类型:', pageType);
            }
        } catch (error) {
            console.error('渲染页面数据失败:', error);
        }
    }

    // 渲染手机端文章卡片
    renderArticlesMobileCards(articles) {
        const container = $('#articlesMobileCards');
        container.empty();

        articles.forEach(article => {
            const card = `
                <div class="mobile-card">
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">标题</div>
                        <div class="mobile-card-content">${article.title}</div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">简介</div>
                        <div class="mobile-card-content">${article.introduction}</div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">标签</div>
                        <div class="mobile-card-content">
                            ${article.tags.map(tag => `<span class="photo-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">查看量</div>
                        <div class="mobile-card-content">${article.viewCount}</div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">评论量</div>
                        <div class="mobile-card-content">${article.commentCount}</div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">发布时间</div>
                        <div class="mobile-card-content">${article.createTime}</div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">操作</div>
                        <div class="mobile-card-actions">
                            <button class="btn btn-sm btn-primary" onclick="memberCenter.editArticle('${article.id}')">
                                <i class="fa fa-edit"></i> 修改
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="memberCenter.deleteItem('article', '${article.id}')">
                                <i class="fa fa-trash"></i> 删除
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.append(card);
        });
    }

    // 渲染手机端碎碎念卡片
    renderMumblesMobileCards(mumbles) {
        const container = $('#mumblesMobileCards');
        container.empty();

        mumbles.forEach(mumble => {
            const card = `
                <div class="mobile-card">
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">内容</div>
                        <div class="mobile-card-content">${mumble.content}</div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">点赞数</div>
                        <div class="mobile-card-content">${mumble.like}</div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">评论数</div>
                        <div class="mobile-card-content">${mumble.commentCount}</div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">发布时间</div>
                        <div class="mobile-card-content">${mumble.createTime}</div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">操作</div>
                        <div class="mobile-card-actions">
                            <button class="btn btn-sm btn-primary" onclick="memberCenter.editMumble('${mumble.id}')">
                                <i class="fa fa-edit"></i> 修改
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="memberCenter.deleteItem('mumble', '${mumble.id}')">
                                <i class="fa fa-trash"></i> 删除
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.append(card);
        });
    }

    // 渲染手机端时间轴卡片
    renderTimelineMobileCards(timeline) {
        const container = $('#timelineMobileCards');
        container.empty();

        timeline.forEach(item => {
            const card = `
                <div class="mobile-card">
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">标题</div>
                        <div class="mobile-card-content">${item.title}</div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">内容</div>
                        <div class="mobile-card-content">${item.content}</div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">时间轴日期</div>
                        <div class="mobile-card-content">${item.date}</div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">更多链接</div>
                        <div class="mobile-card-content">
                            ${item.more ? `<a href="${item.more}" target="_blank">查看详情</a>` : '-'}
                        </div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">发布时间</div>
                        <div class="mobile-card-content">${item.createTime}</div>
                    </div>
                    <div class="mobile-card-row">
                        <div class="mobile-card-label">操作</div>
                        <div class="mobile-card-actions">
                            <button class="btn btn-sm btn-primary" onclick="memberCenter.editTimeline('${item.id}')">
                                <i class="fa fa-edit"></i> 修改
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="memberCenter.deleteItem('timeline', '${item.id}')">
                                <i class="fa fa-trash"></i> 删除
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.append(card);
        });
    }

    // 渲染手机端相册网格
    renderPhotosMobileGrid(photos) {
        const container = $('#photosMobileGrid');
        container.empty();

        photos.forEach(photo => {
            const card = `
                <div class="mobile-photo-card">
                    <img src="${photo.accessUrl}" alt="${photo.title}" class="mobile-photo-image">
                    <div class="mobile-photo-info">
                        <div class="mobile-photo-title">${photo.title}</div>
                        <div class="mobile-photo-meta">${photo.uploadTime}</div>
                        <div class="mobile-photo-tags">
                            ${photo.tags.map(tag => `<span class="photo-tag">${tag}</span>`).join('')}
                        </div>
                        <div class="mobile-photo-actions">
                            <button class="btn btn-sm btn-primary" onclick="memberCenter.editPhoto('${photo.id}')">
                                <i class="fa fa-edit"></i> 修改
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="memberCenter.deleteItem('photo', '${photo.id}')">
                                <i class="fa fa-trash"></i> 删除
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.append(card);
        });
    }
}

/**
 * 全局初始化和暴露
 * 确保个人中心在DOM准备好后正确初始化
 */

// 个人中心实例
let memberCenter = null;

/**
 * DOM准备就绪后初始化
 */
$(document).ready(() => {
    try {
        // 创建个人中心实例
        memberCenter = new MemberCenter();
        
        // 暴露到全局作用域，供HTML内联事件使用
        window.memberCenter = memberCenter;
        
        console.log('个人中心初始化成功');
    } catch (error) {
        console.error('个人中心初始化失败:', error);
        
        // 显示用户友好的错误信息
        const errorMessage = '系统初始化失败，请刷新页面重试';
        if (typeof memberCenter?.showMessage === 'function') {
            memberCenter.showMessage(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
    }
});

/**
 * 页面卸载前的清理工作
 */
$(window).on('beforeunload', () => {
    try {
        // 清理定时器、事件监听器等
        if (memberCenter) {
            // 停止录音和播放
            memberCenter.resetRecordingState();
            
            // 清理定时器
            if (memberCenter.recordingState.recordingTimer) {
                clearInterval(memberCenter.recordingState.recordingTimer);
            }
            if (memberCenter.recordingState.playbackTimer) {
                clearInterval(memberCenter.recordingState.playbackTimer);
            }
        }
    } catch (error) {
        console.error('页面清理失败:', error);
    }
});

/**
 * 全局错误处理
 */
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    
    // 避免因为错误处理本身出错
    try {
        if (memberCenter && typeof memberCenter.showMessage === 'function') {
            memberCenter.showMessage('系统出现错误，请刷新页面', 'error');
        }
    } catch (e) {
        console.error('错误处理失败:', e);
    }
});

/**
 * 全局未捕获的Promise拒绝处理
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    
    try {
        if (memberCenter && typeof memberCenter.showMessage === 'function') {
            memberCenter.showMessage('系统出现异步错误', 'error');
        }
    } catch (e) {
        console.error('Promise拒绝处理失败:', e);
    }
    
    // 阻止默认的错误处理
    event.preventDefault();
}); 