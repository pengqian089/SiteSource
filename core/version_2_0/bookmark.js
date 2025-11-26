"use strict";


(function(){
    // 检测无图片书签并添加类名（用于兼容性）
    function detectNoImageBookmarks() {
        $('.bookmark-item .bookmark-card').each(function() {
            const $card = $(this);
            // 查找直接子级的图片元素，排除图标
            const $mainImages = $card.children('img').filter(':not(.bookmark-icon)');
            
            // 或者查找懒加载的图片（可能有data-src属性）
            const $lazyImages = $card.find('img[data-src]:not(.bookmark-icon)');
            
            const hasMainImage = $mainImages.length > 0 || $lazyImages.length > 0;
            
            if (!hasMainImage) {
                $card.addClass('no-image');
            } else {
                $card.removeClass('no-image');
            }
        });
    }

    // 页面加载时执行检测
    $(document).ready(function() {
        detectNoImageBookmarks();
    });

    // PJAX加载后重新检测
    $(document).on('pjax:complete', function() {
        setTimeout(detectNoImageBookmarks, 100); // 延迟一点执行，确保DOM更新完成
    });

    // 监听懒加载图片加载完成后重新检测
    $(document).on('load', '.bookmark-card img:not(.bookmark-icon)', function() {
        detectNoImageBookmarks();
    });

    // 监听懒加载库（如果使用）的图片加载事件
    $(document).on('lazyloaded', '.bookmark-card img:not(.bookmark-icon)', function() {
        detectNoImageBookmarks();
    });
    let bookmarkSearchValue = "";
    // 书签搜索框输入
    $(document).delegate(".bookmark .search-box input[type=search]", "input", function () {
        bookmarkSearchValue = $(this).val();
        let categories = [];
        $(".bookmark .category-box .category.active").each(function () {
            categories.push($(this).text());
        });

        $.ajax({
            type: "get",
            url: "/bookmark/search",
            traditional: true,
            data: { title: bookmarkSearchValue, categories }
        }).done(function (result) {
            if (result.success) {
                $(".bookmark .search-box .search-result").show();
                let list = [];
                for (const item of result.data) {
                    list.push(`<li>${item}</li>`);
                }
                $(".bookmark .search-box .search-result ul").html(list.join(""));
            }
        });
    });

    // 书签搜索框回车
    $(document).delegate(".bookmark .search-box input[type=search]", "keyup", function (e) {
        if (e.keyCode === 13) {
            let value = $(this).val();
            let categories = [];
            $(".bookmark .category-box .category.active").each(function () {
                categories.push(`categories=${encodeURIComponent($(this).text())}`);
            });
            if (value.trim() === "" && categories.length === 0) {
                $.pjax({ url: "/bookmark.html", container: '.blog-body' });
            } else if (value.trim() === "" && categories.length !== 0) {
                $.pjax({ url: `/bookmark.html?${categories.join("&")}`, container: '.blog-body' });
            } else if (value.trim() !== "" && categories.length === 0) {
                $.pjax({ url: `/bookmark.html?title=${encodeURIComponent(value)}`, container: '.blog-body' });
            } else {
                $.pjax({ url: `/bookmark.html?title=${encodeURIComponent(value)}&${categories.join("&")}`, container: '.blog-body' });
            }
        }
    });

    // 书签搜索列表点击
    $(document).delegate(".bookmark .search-box .search-result ul li", "click", function () {
        let value = $(this).text();
        let categories = [];
        $(".bookmark .category-box .category.active").each(function () {
            categories.push(`categories=${encodeURIComponent($(this).text())}`);
        });
        if (categories.length === 0) {
            $.pjax({ url: `/bookmark.html?title=${encodeURIComponent(value)}`, container: '.blog-body' });
        } else {
            $.pjax({ url: `/bookmark.html?title=${encodeURIComponent(value)}&${categories.join("&")}`, container: '.blog-body' });
        }

    });

    // 书签搜索框失去焦点，隐藏搜索列表
    $(document).delegate(".bookmark .search-box input[type=search]", "blur", function () {
        setTimeout(function () {
            $(".bookmark .search-box .search-result").hide();
        }, 300);
    });

    // 书签搜索框获得焦点，显示搜索列表
    $(document).delegate(".bookmark .search-box input[type=search]", "focus ", function () {
        if($(".bookmark .search-box .search-result ul li").length > 0){
            $(".bookmark .search-box .search-result").show();
        }
    });

    // 书签栏搜索框键盘上下移动
    $(document).delegate(".bookmark .search-box input[type=search]", "keydown", function (e) {
        let $searchResult = $(".bookmark .search-box .search-result ul li");
        let $selected = $(".bookmark .search-box .search-result ul li.selected")

        if (e.keyCode === 40) {
            e.preventDefault();
            if ($selected.length === 0) {
                let $first = $searchResult.first();
                $first.addClass("selected");
                $(this).val($first.text());
            } else if ($(".bookmark .search-box .search-result ul li:last").hasClass("selected")) {
                $searchResult.removeClass("selected");
                $(this).val(bookmarkSearchValue);
            } else {
                let $next = $selected.next();
                $searchResult.removeClass("selected");
                if ($next.length > 0) {
                    $next.addClass("selected");
                    $(this).val($next.text());
                }
            }
        } else if (e.keyCode === 38) {
            e.preventDefault();
            if ($selected.length === 0) {
                let $last = $searchResult.last();
                $last.addClass("selected");
                $(this).val($last.text());
            } else if ($(".bookmark .search-box .search-result ul li:first").hasClass("selected")) {
                $searchResult.removeClass("selected");
                $(this).val(bookmarkSearchValue);
            } else {
                let $prev = $selected.prev();
                $searchResult.removeClass("selected");
                if ($prev.length > 0) {
                    $prev.addClass("selected");
                    $(this).val($prev.text());
                }
            }
        }
    });

    // 点击书签分类
    $(document).delegate(".bookmark .category-box .category", "click", function () {
        if ($(this).hasClass("active")) {
            $(this).removeClass("active")
        } else {
            $(this).addClass("active")
        }
    });

    // 新增书签
    $(document).delegate("form.bookmark-create", "submit", function () {
        let fomData = new FormData(this);
        let $that = $(this);
        $(this)
            .find("button[lay-submit]")
            .addClass("layui-btn-disabled")
            .attr("disabled", "disabled")
            .html(`<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop layui-font-12"></i> 正在提交`);
        $.ajax({
            url: $that.attr("action"),
            processData: false,
            contentType: false,
            data: fomData,
            type: "post"
        }).done(function (result, _, __) {
            if (result.success) {
                $that[0].reset();
                layer.closeAll();
                $.pjax({ url: "/bookmark.html", container: '.blog-body' });
            } else {
                layer.alert(result.msg);
            }
        }).fail(ajaxFail);
        return false;
    });

    layui.use(["element", "layer", "carousel", "util", "flow", "form", "upload"],function(){
        let form = layui.form;

        // 点击设置
        $(document).delegate(".bookmark-setting[data-id]", "click", function () {
            let id = $(this).data("id");
            let index = layer.load();
            let width = $(window).width() > 600 ? "600px" : "100%";
            $.ajax({
                url: `/bookmark/update/${id}`,
                type: "get",
            }).done(function (result) {
                if (typeof (result) === "object") {
                    if (!result.success) {
                        layer.msg(result.msg);
                    }
                    return;
                }
                layer.open({
                    type: 1,
                    content: result,
                    area: width,
                    success: function () {
                        form.render();
                    }
                });
            }).always(function () {
                layer.close(index);
            }).fail(ajaxFail);
        });

    });

    // 删除书签
    $(document).delegate("form.bookmark-create button[data-delete]", "click", function () {
        let index = layer.load();
        $.ajax({
            url: `/bookmark/delete`,
            type: "post",
            data: { id: $(this).data("delete") }
        }).done(function () {
            layer.closeAll();
            $.pjax({ url: "/bookmark.html", container: '.blog-body' });
        }).always(function () {
            layer.close(index);
        });
    });

})();})();
