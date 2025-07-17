/**
 * 个人中心 JavaScript
 * 支持pjax初始化和响应式设计
 */

class MemberCenter {
    constructor() {
        this.currentPage = 'profile';
        this.currentTheme = 'light';
        this.recording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        // 分页相关
        this.pageSize = 10; // 每页显示数量
        this.currentPageNum = 1; // 当前页码
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUserInfo();
        this.initTheme();
        this.initPageFromHash();
    }

    bindEvents() {
        // 导航切换
        $('.nav-item a').on('click', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).parent().data('page');
            this.switchPage(page);
        });

        // 监听hash变化
        $(window).on('hashchange', () => {
            this.initPageFromHash();
        });

        // 基本设置相关
        $('#saveProfile').on('click', () => this.saveProfile());
        $('#logout').on('click', () => this.logout());
        $('#uploadAvatar').on('click', () => $('#avatarFile').click());
        $('#avatarFile').on('change', (e) => this.handleAvatarUpload(e));
        $('#bindTwoFactor').on('click', () => this.showTwoFactorModal());
        $('#closeTwoFactorModal').on('click', () => this.hideTwoFactorModal());
        $('#confirmTwoFactor').on('click', () => this.confirmTwoFactor());
        $('#copySecretKey').on('click', () => this.copySecretKey());

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

        // 模态框相关
        $('#closeModal').on('click', () => this.hideModal());
        $('#cancelPublish').on('click', () => this.hideModal());
        $('#confirmPublish').on('click', () => this.confirmPublish());

        // 删除确认
        $('#closeDeleteModal').on('click', () => this.hideDeleteModal());
        $('#cancelDelete').on('click', () => this.hideDeleteModal());
        $('#confirmDelete').on('click', () => this.confirmDelete());

        // 键盘事件
        $(document).on('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.hideDeleteModal();
                this.hideTwoFactorModal();
            }
        });

        // 点击模态框背景关闭
        $('.modal-overlay').on('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal();
                this.hideDeleteModal();
                this.hideTwoFactorModal();
            }
        });
    }

    // 页面切换
    switchPage(page) {
        $('.nav-item').removeClass('active');
        $(`.nav-item[data-page="${page}"]`).addClass('active');
        
        $('.content-page').removeClass('active');
        $(`#${page}-page`).addClass('active');
        
        this.currentPage = page;
        this.loadPageData();
        
        // 更新URL锚点
        window.location.hash = page;
    }

    // 从锚点初始化页面
    initPageFromHash() {
        const hash = window.location.hash.substring(1);
        const validPages = ['profile', 'articles', 'mumbles', 'timeline', 'photos'];
        
        if (hash && validPages.includes(hash)) {
            this.switchPage(hash);
        } else {
            // 默认显示profile页面
            this.switchPage('profile');
        }
    }

    // 加载用户信息
    loadUserInfo() {
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

        $('#account').val(userInfo.account);
        $('#nickname').val(userInfo.nickname);
        $('#gender').val(userInfo.gender);
        $('#signature').val(userInfo.signature);
        $('#userName').text(userInfo.nickname);
        $('#userEmail').text(userInfo.email);
        
        if (userInfo.avatar) {
            $('#userAvatar').attr('src', userInfo.avatar);
            $('#avatarPreview').attr('src', userInfo.avatar);
        }

        this.updateTwoFactorStatus(userInfo.twoFactorEnabled);
    }

    // 更新双因素验证状态
    updateTwoFactorStatus(enabled) {
        const statusText = enabled ? '已绑定' : '未绑定';
        const buttonText = enabled ? '解绑双因素验证' : '绑定双因素验证';
        const buttonClass = enabled ? 'btn-danger' : 'btn-success';
        const buttonIcon = enabled ? 'fa-unlock' : 'fa-shield';

        $('.status-text').text(statusText);
        $('#bindTwoFactor')
            .removeClass('btn-success btn-danger')
            .addClass(buttonClass)
            .html(`<i class="fa ${buttonIcon}"></i> ${buttonText}`);
    }

    // 保存个人资料
    saveProfile() {
        const data = {
            nickname: $('#nickname').val(),
            gender: $('#gender').val(),
            signature: $('#signature').val()
        };

        if (!data.nickname.trim()) {
            this.showMessage('请输入昵称', 'warning');
            return;
        }

        this.showLoading();
        
        // 模拟API调用
        setTimeout(() => {
            this.hideLoading();
            this.showMessage('保存成功', 'success');
            $('#userName').text(data.nickname);
        }, 1000);
    }

    // 退出登录
    logout() {
        if (confirm('确定要退出登录吗？')) {
            this.showLoading();
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        }
    }

    // 处理头像上传
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showMessage('请选择图片文件', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            $('#avatarPreview').attr('src', e.target.result);
            $('#userAvatar').attr('src', e.target.result);
        };
        reader.readAsDataURL(file);

        // 模拟上传
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.showMessage('头像上传成功', 'success');
        }, 2000);
    }

    // 显示双因素验证模态框
    showTwoFactorModal() {
        const isEnabled = $('.status-text').text() === '已绑定';
        
        if (isEnabled) {
            // 解绑模式
            $('#modalTitle').text('解绑双因素验证');
            $('.qr-section').hide();
            $('.pin-section label').text('请输入6位PIN码确认解绑：');
            $('#confirmTwoFactor').text('确认解绑');
        } else {
            // 绑定模式
            $('#modalTitle').text('绑定双因素验证');
            $('.qr-section').show();
            $('.pin-section label').text('请输入6位PIN码：');
            $('#confirmTwoFactor').text('确认绑定');
            
            // 生成二维码和密钥
            this.generateTwoFactorData();
        }
        
        $('#twoFactorModal').show();
    }

    // 隐藏双因素验证模态框
    hideTwoFactorModal() {
        $('#twoFactorModal').hide();
        $('#pinCode').val('');
    }

    // 生成双因素验证数据
    generateTwoFactorData() {
        const secretKey = this.generateSecretKey();
        $('#secretKey').val(secretKey);
        
        // 生成二维码（这里使用占位符）
        $('#qrCode').html('<div style="padding: 20px; color: #666;">二维码占位符</div>');
    }

    // 生成密钥
    generateSecretKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // 复制密钥
    copySecretKey() {
        const secretKey = $('#secretKey').val();
        navigator.clipboard.writeText(secretKey).then(() => {
            this.showMessage('密钥已复制到剪贴板', 'success');
        });
    }

    // 确认双因素验证
    confirmTwoFactor() {
        const pinCode = $('#pinCode').val();
        
        if (!pinCode || pinCode.length !== 6) {
            this.showMessage('请输入6位PIN码', 'warning');
            return;
        }

        const isEnabled = $('.status-text').text() === '已绑定';
        
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.hideTwoFactorModal();
            
            if (isEnabled) {
                this.updateTwoFactorStatus(false);
                this.showMessage('双因素验证已解绑', 'success');
            } else {
                this.updateTwoFactorStatus(true);
                this.showMessage('双因素验证已绑定', 'success');
            }
        }, 1000);
    }

    // 加载页面数据
    loadPageData() {
        switch (this.currentPage) {
            case 'articles':
                this.loadArticles();
                break;
            case 'mumbles':
                this.loadMumbles();
                break;
            case 'timeline':
                this.loadTimeline();
                break;
            case 'photos':
                this.loadPhotos();
                break;
        }
    }

    // 加载文章列表
    loadArticles(page = 1) {
        this.showLoading();
        this.currentPageNum = page;
        
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
        const startIndex = (page - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageArticles = allArticles.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allArticles.length / this.pageSize);

        setTimeout(() => {
            this.renderArticlesTable(pageArticles);
            this.renderPagination('articles', totalPages, page);
            this.hideLoading();
        }, 500);
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

        // 上一页
        const prevDisabled = currentPage <= 1 ? 'disabled' : '';
        pagination.append(`
            <li class="page-item ${prevDisabled}">
                <a class="page-link" href="#" onclick="memberCenter.goToPage('${type}', ${currentPage - 1})" ${prevDisabled ? 'tabindex="-1"' : ''}>
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
                    <a class="page-link" href="#" onclick="memberCenter.goToPage('${type}', 1)">1</a>
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
            pagination.append(`
                <li class="page-item ${active}">
                    <a class="page-link" href="#" onclick="memberCenter.goToPage('${type}', ${i})">${i}</a>
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
                    <a class="page-link" href="#" onclick="memberCenter.goToPage('${type}', ${totalPages})">${totalPages}</a>
                </li>
            `);
        }

        // 下一页
        const nextDisabled = currentPage >= totalPages ? 'disabled' : '';
        pagination.append(`
            <li class="page-item ${nextDisabled}">
                <a class="page-link" href="#" onclick="memberCenter.goToPage('${type}', ${currentPage + 1})" ${nextDisabled ? 'tabindex="-1"' : ''}>
                    <i class="fa fa-chevron-right"></i>
                </a>
            </li>
        `);
    }

    // 跳转到指定页面
    goToPage(type, page) {
        switch (type) {
            case 'articles':
                this.loadArticles(page);
                break;
            case 'mumbles':
                this.loadMumbles(page);
                break;
            case 'timeline':
                this.loadTimeline(page);
                break;
            case 'photos':
                this.loadPhotos(page);
                break;
        }
    }

    // 加载碎碎念列表
    loadMumbles(page = 1) {
        this.showLoading();
        this.currentPageNum = page;
        
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
        const startIndex = (page - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageMumbles = allMumbles.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allMumbles.length / this.pageSize);

        setTimeout(() => {
            this.renderMumblesTable(pageMumbles);
            this.renderPagination('mumbles', totalPages, page);
            this.hideLoading();
        }, 500);
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
    loadTimeline(page = 1) {
        this.showLoading();
        this.currentPageNum = page;
        
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
        const startIndex = (page - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageTimeline = allTimeline.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allTimeline.length / this.pageSize);

        setTimeout(() => {
            this.renderTimelineTable(pageTimeline);
            this.renderPagination('timeline', totalPages, page);
            this.hideLoading();
        }, 500);
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
    loadPhotos(page = 1) {
        this.showLoading();
        this.currentPageNum = page;
        
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
        const startIndex = (page - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pagePhotos = allPhotos.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allPhotos.length / this.pageSize);

        setTimeout(() => {
            this.renderPhotosGrid(pagePhotos);
            this.renderPagination('photos', totalPages, page);
            this.hideLoading();
        }, 500);
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
    }

    // 显示碎碎念模态框
    showMumbleModal(mumbleId = null) {
        const isEdit = mumbleId !== null;
        $('#modalTitle').text(isEdit ? '编辑碎碎念' : '发布碎碎念');
        $('#confirmPublish').text(isEdit ? '保存修改' : '发布碎碎念');

        const modalBody = `
            <div class="recording-section">
                <div class="recording-controls">
                    <button type="button" class="btn btn-danger" id="startRecording">
                        <i class="fa fa-microphone"></i> 开始录音
                    </button>
                    <button type="button" class="btn btn-secondary" id="stopRecording" style="display: none;">
                        <i class="fa fa-stop"></i> 停止录音
                    </button>
                    <button type="button" class="btn btn-info" id="playRecording" style="display: none;">
                        <i class="fa fa-play"></i> 试听
                    </button>
                    <button type="button" class="btn btn-success" id="uploadRecording" style="display: none;">
                        <i class="fa fa-upload"></i> 上传
                    </button>
                    <div class="recording-status" id="recordingStatus" style="display: none;">
                        <div class="recording-indicator"></div>
                        <span>录音中...</span>
                    </div>
                </div>
            </div>
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
            <div class="recording-section">
                <div class="recording-controls">
                    <button type="button" class="btn btn-danger" id="startRecording">
                        <i class="fa fa-microphone"></i> 开始录音
                    </button>
                    <button type="button" class="btn btn-secondary" id="stopRecording" style="display: none;">
                        <i class="fa fa-stop"></i> 停止录音
                    </button>
                    <button type="button" class="btn btn-info" id="playRecording" style="display: none;">
                        <i class="fa fa-play"></i> 试听
                    </button>
                    <button type="button" class="btn btn-success" id="uploadRecording" style="display: none;">
                        <i class="fa fa-upload"></i> 上传
                    </button>
                    <div class="recording-status" id="recordingStatus" style="display: none;">
                        <div class="recording-indicator"></div>
                        <span>录音中...</span>
                    </div>
                </div>
            </div>
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

    // 绑定录音事件
    bindRecordingEvents() {
        $('#startRecording').on('click', () => this.startRecording());
        $('#stopRecording').on('click', () => this.stopRecording());
        $('#playRecording').on('click', () => this.playRecording());
        $('#uploadRecording').on('click', () => this.uploadRecording());
    }

    // 开始录音
    startRecording() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    this.mediaRecorder = new MediaRecorder(stream);
                    this.audioChunks = [];

                    this.mediaRecorder.ondataavailable = (event) => {
                        this.audioChunks.push(event.data);
                    };

                    this.mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                        this.audioUrl = URL.createObjectURL(audioBlob);
                    };

                    this.mediaRecorder.start();
                    this.recording = true;
                    
                    $('#startRecording').hide();
                    $('#stopRecording').show();
                    $('#recordingStatus').show();
                })
                .catch(err => {
                    this.showMessage('无法访问麦克风', 'error');
                });
        } else {
            this.showMessage('浏览器不支持录音功能', 'error');
        }
    }

    // 停止录音
    stopRecording() {
        if (this.mediaRecorder && this.recording) {
            this.mediaRecorder.stop();
            this.recording = false;
            
            $('#stopRecording').hide();
            $('#playRecording').show();
            $('#uploadRecording').show();
            $('#recordingStatus').hide();
            $('#startRecording').show();
        }
    }

    // 播放录音
    playRecording() {
        if (this.audioUrl) {
            const audio = new Audio(this.audioUrl);
            audio.play();
        }
    }

    // 上传录音
    uploadRecording() {
        this.showMessage('录音上传功能待实现', 'info');
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
        this.currentDeleteItem = { type, id };
        $('#deleteModal').show();
    }

    // 确认删除
    confirmDelete() {
        if (this.currentDeleteItem) {
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                this.hideDeleteModal();
                this.showMessage('删除成功', 'success');
                this.loadPageData(); // 重新加载数据
            }, 1000);
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
        }, 1000);
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
        }, 1000);
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
        }, 1000);
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
        }, 1000);
    }

    // 模态框控制
    hideModal() {
        $('#publishModal').hide();
        $('#modalBody').empty();
    }

    hideDeleteModal() {
        $('#deleteModal').hide();
        this.currentDeleteItem = null;
    }

    // 显示/隐藏加载
    showLoading() {
        $('#loadingOverlay').show();
    }

    hideLoading() {
        $('#loadingOverlay').hide();
    }

    // 显示消息
    showMessage(message, type = 'info') {
        const alertClass = `alert-${type}`;
        const alert = $(`
            <div class="alert ${alertClass}" style="position: fixed; top: 20px; right: 20px; z-index: 3000; min-width: 300px;">
                ${message}
                <button type="button" class="close-btn" style="float: right; margin-left: 10px;">×</button>
            </div>
        `);
        
        $('body').append(alert);
        
        alert.find('.close-btn').on('click', () => alert.remove());
        
        setTimeout(() => {
            alert.fadeOut(() => alert.remove());
        }, 3000);
    }

    // 初始化主题
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    // 设置主题
    setTheme(theme) {
        this.currentTheme = theme;
        $('html').attr('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    // 切换主题
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }


}

// 初始化个人中心
let memberCenter;

$(document).ready(() => {
    memberCenter = new MemberCenter();
});

// 全局函数供HTML调用
window.memberCenter = memberCenter; 