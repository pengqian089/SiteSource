"use strict";

(function(){
    //侧边导航开关点击事件
    $(document).delegate(".blog-navicon", "click", function () {
        let sear = new RegExp("layui-hide");
        if (sear.test($(".blog-nav-left").attr("class"))) {
            leftIn();
        } else {
            leftOut();
        }
    });

    //侧边导航遮罩点击事件
    $(document).delegate(".blog-mask", "click", function () {
        leftOut();
    });

    //类别导航开关点击事件 - 更新为version 2.0类名
    $(document).delegate(".right-category-toggle-v2", "click", function () {
        categoryToggleV2();
    });

    //类别导航遮罩点击事件 - 关闭类别导航
    $(document).delegate(".right-category-mask-v2", "click", function () {
        categoryOutV2();
    });

    //具体类别点击事件 - 更新为version 2.0类名
    $(document).delegate(".right-category-tag-v2", "click", function () {
        $(".right-category-tag-v2").removeClass("right-category-tag-active-v2");
        $(this).addClass("right-category-tag-active-v2");
    });

    // 检测屏幕尺寸变化，重置移动端分类导航状态
    let resizeTimer;
    $(window).resize(function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            initializeCategoryNavV2(); // 重新初始化状态
        }, 250); // 防抖延迟250ms
    });

    // 页面加载完成后初始化分类导航状态
    $(document).ready(function() {
        initializeCategoryNavV2();
    });
})();

//显示侧边导航
function leftIn() {
    $(".blog-mask").unbind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");
    $(".blog-nav-left").unbind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");

    $(".blog-mask").removeClass("maskOut");
    $(".blog-mask").addClass("maskIn");
    $(".blog-mask").removeClass("layui-hide");
    $(".blog-mask").addClass("layui-show");

    $(".blog-nav-left").removeClass("leftOut");
    $(".blog-nav-left").addClass("leftIn");
    $(".blog-nav-left").removeClass("layui-hide");
    $(".blog-nav-left").addClass("layui-show");
}

//隐藏侧边导航
function leftOut() {
    $(".blog-mask").on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
        function () {
            $(".blog-mask").addClass("layui-hide");
        });
    $(".blog-nav-left").on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
        function () {
            $(".blog-nav-left").addClass("layui-hide");
        });

    $(".blog-mask").removeClass("maskIn");
    $(".blog-mask").addClass("maskOut");
    $(".blog-mask").removeClass("layui-show");

    $(".blog-nav-left").removeClass("leftIn");
    $(".blog-nav-left").addClass("leftOut");
    $(".blog-nav-left").removeClass("layui-show");
}

// Version 2.0 - 切换分类导航显示/隐藏
function categoryToggleV2() {
    const $categoryNav = $(".right-category-nav-v2");
    const $toggleBtn = $(".right-category-toggle-v2");
    const $mask = $(".right-category-mask-v2");
    
    // 检查当前状态
    const isVisible = $categoryNav.hasClass("category-visible-v2");
    
    if (isVisible) {
        categoryOutV2();
    } else {
        categoryInV2();
    }
}

// Version 2.0 - 显示分类导航
function categoryInV2() {
    const $categoryNav = $(".right-category-nav-v2");
    const $toggleBtn = $(".right-category-toggle-v2");
    const $mask = $(".right-category-mask-v2");
    
    // 清除之前的动画事件绑定
    $categoryNav.unbind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");
    
    // 显示遮罩层
    $mask.addClass("mask-visible-v2");
    
    // 显示分类导航并添加进入动画
    $categoryNav.removeClass("category-hidden-v2 category-slide-out-v2");
    $categoryNav.addClass("category-visible-v2 category-slide-in-v2");
    $categoryNav.show();
    
    // 切换按钮状态
    $toggleBtn.addClass("toggle-active-v2");
    
    // 动画结束后清除动画类
    $categoryNav.on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
        $categoryNav.removeClass("category-slide-in-v2");
        $categoryNav.unbind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");
    });
}

// Version 2.0 - 隐藏分类导航
function categoryOutV2() {
    const $categoryNav = $(".right-category-nav-v2");
    const $toggleBtn = $(".right-category-toggle-v2");
    const $mask = $(".right-category-mask-v2");
    
    // 如果不可见，直接返回
    if (!$categoryNav.hasClass("category-visible-v2")) {
        return;
    }
    
    // 隐藏遮罩层
    $mask.removeClass("mask-visible-v2");
    
    // 添加退出动画
    $categoryNav.removeClass("category-slide-in-v2");
    $categoryNav.addClass("category-slide-out-v2");
    
    // 切换按钮状态
    $toggleBtn.removeClass("toggle-active-v2");
    
    // 动画结束后隐藏元素
    $categoryNav.on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
        $categoryNav.removeClass("category-visible-v2 category-slide-out-v2");
        $categoryNav.addClass("category-hidden-v2");
        $categoryNav.hide();
        $categoryNav.unbind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");
    });
}

// Version 2.0 - 初始化分类导航状态
function initializeCategoryNavV2() {
    if ($(window).width() > 768) {
        // 桌面端：确保显示分类导航
        categoryResetToDesktopV2();
    } else {
        // 移动端：确保隐藏分类导航
        const $categoryNav = $(".right-category-nav-v2");
        const $toggleBtn = $(".right-category-toggle-v2");
        const $mask = $(".right-category-mask-v2");
        
        $categoryNav.addClass("category-hidden-v2");
        $categoryNav.hide();
        $toggleBtn.removeClass("toggle-active-v2");
        $mask.removeClass("mask-visible-v2");
    }
}

// Version 2.0 - 重置为桌面端状态
function categoryResetToDesktopV2() {
    const $categoryNav = $(".right-category-nav-v2");
    const $toggleBtn = $(".right-category-toggle-v2");
    const $mask = $(".right-category-mask-v2");
    
    // 清除所有移动端相关的class和动画
    $categoryNav.removeClass("category-hidden-v2 category-visible-v2 category-slide-in-v2 category-slide-out-v2");
    $toggleBtn.removeClass("toggle-active-v2");
    $mask.removeClass("mask-visible-v2");
    
    // 清除内联样式，让CSS媒体查询生效
    $categoryNav.removeAttr("style");
    
    // 确保在桌面端显示
    $categoryNav.show();
    
    // 清除动画事件绑定
    $categoryNav.unbind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");
}

// 保留原有的函数名以保持向后兼容
function categroyIn() {
    categoryInV2();
}

function categoryOut() {
    categoryOutV2();
}