"use strict";

(function () {
    
    // 展开收起功能
    $(document).delegate('.category-toggle', 'click', function (e) {
        const $toggle = $(this);
        const $section = $toggle.closest('.achievement-category-section');
        const $content = $section.find('.category-content');
        const $icon = $toggle.find('.toggle-icon');
        const category = $section.attr('data-category');

        // 切换展开/收起状态
        if ($content.hasClass('collapsed')) {
            // 展开
            $content.removeClass('collapsed');
            $toggle.removeClass('collapsed');
            $icon.removeClass('layui-icon-right').addClass('layui-icon-down');
            localStorage.setItem(`steam-achievements-${category}`, 'expanded');
        } else {
            // 收起
            $content.addClass('collapsed');
            $toggle.addClass('collapsed');
            $icon.removeClass('layui-icon-down').addClass('layui-icon-right');
            localStorage.setItem(`steam-achievements-${category}`, 'collapsed');
        }
    });
})();

function initSteamAchievements() {

    const $categoryToggle = $('.category-toggle');
    if($categoryToggle.length === 0){
        return;
    }

    // 恢复之前的展开/收起状态，如果没有保存的状态则使用默认设置
    $categoryToggle.each(function () {
        const $toggle = $(this);
        const $section = $toggle.closest('.achievement-category-section');
        const category = $section.attr('data-category');
        const savedState = localStorage.getItem(`steam-achievements-${category}`);
        const $content = $section.find('.category-content');
        const $icon = $toggle.find('.toggle-icon');

        // 如果有保存的状态，使用保存的状态
        if (savedState !== null) {
            if (savedState === 'collapsed') {
                $content.addClass('collapsed');
                $toggle.addClass('collapsed');
                $icon.removeClass('layui-icon-down').addClass('layui-icon-right');
            } else {
                $content.removeClass('collapsed');
                $toggle.removeClass('collapsed');
                $icon.removeClass('layui-icon-right').addClass('layui-icon-down');
            }
        } else {
            // 如果没有保存的状态，使用默认设置
            // 已解锁成就默认展开，其他默认收起
            if (category === 'unlocked') {
                $content.removeClass('collapsed');
                $toggle.removeClass('collapsed');
                $icon.removeClass('layui-icon-right').addClass('layui-icon-down');
                localStorage.setItem(`steam-achievements-${category}`, 'expanded');
            } else {
                $content.addClass('collapsed');
                $toggle.addClass('collapsed');
                $icon.removeClass('layui-icon-down').addClass('layui-icon-right');
                localStorage.setItem(`steam-achievements-${category}`, 'collapsed');
            }
        }
    });
}