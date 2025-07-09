"use strict";

layui.use(["element"], function () {
    let element = layui.element,
        form = layui.form;

    $.pjax.defaults.timeout = 20000;
    $(document).pjax("nav.blog-nav ul.layui-nav>li>a,a[data-pjax]", ".blog-body");
    //文章翻页
    $(document).pjax("#blog-list a,.tags a", ".blog-main-left");
    $(document).pjax("#articl-comment a", "#blog-comment", { scrollTo: false });
    //碎碎念翻页
    $(document).pjax("#talk-pager a", ".mumble-list");
    //今日热榜翻页
    $(document).pjax("#topic-list a", ".blog-main-left");
    //书签类别选择
    $(document).pjax(".bookmark .category-box a.category", ".blog-body");
    $(document).pjax(".code-box .box-rows .row .header a", ".code-box .box-rows");
    if ($.support.pjax) {
        $(".tags a").on("click",
            function (event) {
                $(".tags a").removeClass("tag-this");
                $(this).addClass("tag-this");
                let containerSelector = ".blog-main-left";
                $.pjax.click(event, { container: containerSelector });
            });
    }
    pjaxCompleteInit();

    $(document).on("pjax:send", function () {
        NProgress.start();
    });

    let titleValue = "";
    $(document).on("pjax:complete", function (event, xhr) {
        titleValue = xhr.getResponseHeader("title")
        if (titleValue === "" || titleValue === null) {
            document.title = "（；´д｀）ゞ标题不见啦 - 叫我阿胖";
        } else {
            document.title = Base64.decode(titleValue);
        }
        element.render();
        form.render();
        categoryOut();
        leftOut();
        pjaxCompleteInit();
        NProgress.done();
    });

    let lazyLoadInstance = new LazyLoad({});
    $(document).on("pjax:end", function () {
        lazyLoadInstance.update();
    });
});

/**
 * pjax 请求完成
 */
function pjaxCompleteInit() {
    lightCode();
    generateToc();
    $("time.timeago").relativeTime();
    initVideoPlayer().catch(x => console.log(x));
    initFetchContent().catch(x => console.log(x));
    if (window.innerWidth <= 768) {
        initMobileSearch();
    }
}