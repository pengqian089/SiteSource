"use strict";

(function(){
    let lazyLoadInstance = new LazyLoad({});

    let $topicComments = $("#topic-comments");
    let topicId = $topicComments.data("topicId");
    let commentSize = parseInt($topicComments.data("commentSize"));
    let startPage = parseInt($topicComments.data("commentStartPage"));
    let totalPage = parseInt($topicComments.data("totalPage"));
    let sort = $topicComments.data("commentSort");
    let paging = false;

    $(document).on("pjax:end", function () {
        // pjax 跳转后热榜滚动翻页数据初始化
        $topicComments = $("#topic-comments");
        topicId = $topicComments.data("topicId");
        commentSize = parseInt($topicComments.data("commentSize"));
        startPage = parseInt($topicComments.data("commentStartPage"));
        totalPage = parseInt($topicComments.data("totalPage"));
        sort = $topicComments.data("commentSort");
        lazyLoadInstance.update();
    });

    // 热榜查看更多
    $(document).delegate(".blog-module.shadow .more a", "click", function () {
        let more = $(this).parents(".more");
        let content = $(this).parents(".blog-module.shadow").find(".topic");
        if (!more.hasClass("show-more")) {
            more.addClass("show-more");
            content.removeClass("hide-content");
            $(this).html("收起<i class=\"layui-icon layui-icon-up\">");
        } else {
            more.removeClass("show-more");
            content.addClass("hide-content");
            $(this).html("查看更多<i class=\"layui-icon layui-icon-down\">");
        }
    });
    // 删除热榜
    $(document).delegate("a[data-topic-delete]", "click", function () {
        let id = $(this).data("topicDelete");
        layer.confirm("删除后不可恢复，是否删除？", function (index) {
            layer.close(index);
            let loadIndex = layer.load();
            $.ajax({
                url: "/topic/deleteTopic",
                data: { id: id },
                type: "post"
            }).done(function (result) {
                if (!result.success) {
                    layer.msg(result.msg, { icon: 2, anim: 6 });
                } else {
                    $.pjax({ url: location.pathname, container: '.blog-main-left', scrollTo: true });
                }
            }).always(function () {
                layer.close(loadIndex);
            }).fail(ajaxFail);
        });
    });

    // 删除热榜中的某个回复
    $(document).delegate("a[data-topic-comment-delete]", "click", function () {
        let id = $(this).data("topicCommentDelete");
        layer.confirm("删除后不可恢复，是否删除？", function (index) {
            layer.close(index);
            let loadIndex = layer.load();
            $.ajax({
                url: "/topic/deleteComment",
                data: { id: id },
                type: "post"
            }).done(function (result) {
                if (!result.success) {
                    layer.msg(result.msg, { icon: 2, anim: 6 });
                } else {
                    $.pjax({ url: location.pathname, container: '.blog-body', scrollTo: true });
                }
            }).always(function () {
                layer.close(loadIndex);
            }).fail(ajaxFail);
        });
    });




    function nextPage() {
        if (paging === true) return;
        paging = true;
        $("#topic-comment-loading").show();
        $.ajax({
            url: "/topic/commentPage",
            data: { id: topicId, pageIndex: startPage, pageSize: commentSize, sort: sort },
            type: "get"
        }).done(function (result) {
            startPage++;
            let $nextResult = $(result);
            $("#topic-comments").append($nextResult);
            $nextResult.find("time.timeago").relativeTime();
            $nextResult.find("pre code").each(function (index, element) {
                Prism.highlightElement(element);
            });
            topicHideMore($nextResult.find(".article-detail-content.topic"));
            lazyLoadInstance.update();
        }).always(function () {
            paging = false;
            $("#topic-comment-loading").hide();
        }).fail(function (data) {
            if (data && data.responseJSON && data.responseJSON.success === false) {
                layer.alert(data.responseJSON.msg);
            }
        });
    }

    let throttleTimer = null;
    let throttleDelay = 100;
    let $window = $(window);
    let $document = $(document);

    $window
        .off('scroll', scrollHandler)
        .on('scroll', scrollHandler);

    function scrollHandler(e) {
        clearTimeout(throttleTimer);
        throttleTimer = setTimeout(function () {
            // 顶部菜单是否开启高斯模糊
            if (window.scrollY > 0) {
                $(".blog-nav").css({ "background-color": "rgba(57,61,73,.5)", "backdrop-filter": "blur(25px)" });
            } else if (window.scrollY === 0) {
                $(".blog-nav").css({ "background-color": "rgb(57,61,73)", "backdrop-filter": "none" })
            }
            // 热榜滚动翻页
            if ($topicComments.length === 0 || startPage > totalPage) return;
            if ($window.scrollTop() + $window.height() > $document.height() - 120) {
                nextPage();
            }

        }, throttleDelay);
    }

    // 评论查看更多
    $(document).delegate(".comments-area .load-more button", "click", function () {
        let $area = $(this).parents(".comments-area");
        let $loadMore = $(this).parent();
        let $commentCount = $(this).parents().find(".comment-count span")
        let src = $(this).parent().data("loadingIco");
        $loadMore.html(`<img src="${src}" class="comment-loading" alt="loading"/>`);
        let pageIndex = parseInt($(this).data("pageIndex"));
        let pageSize = parseInt($(this).data("pageSize"));
        let request = $(this).data("pageRequest");
        let $that = $(this);
        $.ajax({
            url: request,
            type: "get",
            data: { pageIndex: pageIndex + 1, pageSize: pageSize }
        }).done(function (result, _, xhr) {
            $area.append(result);
            $loadMore.remove();
            $commentCount.text(xhr.getResponseHeader("commentCount"));
            $("time.timeago").relativeTime();
            lightCode();
        }).fail(ajaxFail);
    });
})();

function topicHideMore($topic) {
    $topic.each(function (index) {
        let that = this;
        let images = $(this).find("img");
        if (images.length > 0) {
            loadImages(images).finally(() => showMore());
        } else {
            showMore();
        }

        function showMore() {
            let height = $(that).height();
            if (height > 500) {
                $(that).addClass("hide-content");
                $(that).parents(".blog-module.shadow").find(".more").removeClass("hide");
            }
        }
    });
}