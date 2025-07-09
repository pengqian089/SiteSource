"use strict";

const dpzOption = {
    /**
     * webapi地址
     */
    webApiBaseAddress: document.querySelector("meta[name=web-api-base-address]").content,
    /**
     * cdn地址
     */
    CDNBaseAddress: document.querySelector("meta[name=cdn-base-address]").content,
    /**
     * 是否为 dark模式
     */
    isDark: window.matchMedia('(prefers-color-scheme: dark)').matches
};

if (dpzOption.isDark) {
    document
        .querySelector('#layui_theme_css')
        .setAttribute(
            'href',
            `${dpzOption.CDNBaseAddress}/lib/layui/css/layui-theme-dark.css`
        );
}

(async function () {
    let userResponse = await fetch("/account/GetUserInfo");
    let userResult = await userResponse.json();
    if (userResult["success"]) {
        $(".blog-user")
            .attr("href", "/account")
            .find("img")
            .attr({"src": `${userResult.data.avatar}`, "title": userResult.data.name});
    }

    let viewImages = ".article.shadow .article-left img,.mumble-list .mumble-item .mumble-content img,.article-detail-content img,#cd-timeline .content img";
    //图片查看
    $(document).delegate(viewImages, "click", function () {
        let index = layer.load(1);
        let images = $(viewImages);
        loadImages(images).then(x => {
            let items = [];
            for (let i = 0; i < x.length; i++) {
                let img = x[i];
                items.push({
                    src: img.src,
                    w: img.naturalWidth,
                    h: img.naturalHeight,
                    title: img.alt
                });
            }
            let imageIndex = images.index(this);
            let options = {
                index: imageIndex,
                bgOpacity: 0.7,
                showHideOpacity: true,
                history: true,
                getThumbBoundsFn: function (index) {
                    let thumbnail = document.querySelectorAll(viewImages)[index];
                    let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                    let rect = thumbnail.getBoundingClientRect();
                    return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
                }
            };
            let gallery = new PhotoSwipe(document.getElementById("gallery"), PhotoSwipeUI_Default, items, options);
            gallery.init();
        }).finally(() => layer.close(index));
    });

    // search
    $(document).delegate("#i-search", "submit", function () {
        const keyword = $("#i-keyword").val();
        let q = $(this).find("[name=q]");
        $(this).find("[name=q]").val(q.data("default") + " " + keyword);
    });

    $(document).delegate("#i-keyword", "keyup", function (e) {
        if (e.keyCode === 13) {
            $(this).parents("form").submit();
        }
    });

    $(document).delegate("#i-search a.search-btn", "click", function () {
        $(this).parents("form").submit();
    });

    // $(document).delegate("[data-tips]", "touchend", function () {
    //     let tips = $(this).data("tips");
    //     layer.tips(tips, this, { tips: 3 });
    // });

    $(document).delegate("[title]:not(.react-jinke-music-player-main *)", "touchend", function () {
        let title = $(this).attr("title");
        layer.tips(title, this, {tips: 3});
    });

    // $(document).delegate("[title]", "touchstart", function () {
    //     let current = $(this);
    //     setTimeout(() => {
    //         current.touchend(() => {
    //             let title = $(this).attr("title");
    //             layer.tips(title, this, {tips: 3});
    //         });
    //     }, 1000);
    //
    // });

    // const ap = new APlayer({
    //     container: document.getElementById("aplayer"),
    //     lrcType: 3,
    //     fixed: true
    // });

    let musicResponse = await fetch("/Music/Recommend/v2");
    let musics = await musicResponse.json();

    ReactJkMusicPlayer.defaultProps.quietUpdate = true;
    ReactJkMusicPlayer.defaultProps.locale = "zh_CN";
    ReactJkMusicPlayer.defaultProps.defaultPosition = {bottom: 0, left: 0};
    ReactJkMusicPlayer.defaultProps.preload = true;
    ReactJkMusicPlayer.defaultProps.glassBg = true;
    ReactJkMusicPlayer.defaultProps.autoPlay = false;
    ReactJkMusicPlayer.defaultProps.remove = false;
    ReactJkMusicPlayer.defaultProps.showMiniProcessBar = true;
    ReactJkMusicPlayer.defaultProps.showDownload = false;
    ReactJkMusicPlayer.defaultProps.showLyric = true;
    ReactJkMusicPlayer.defaultProps.showMediaSession = true;
    ReactJkMusicPlayer.defaultProps.showDestroy = false;
    ReactJkMusicPlayer.defaultProps.showReload = false;
    ReactJkMusicPlayer.defaultProps.volumeFade = {fadeIn: 300, fadeOut: 300};
    ReactJkMusicPlayer.defaultProps.sortableOptions = {disabled: true, forceFallback: true};
    ReactJkMusicPlayer.defaultProps.audioLists = musics;
    ReactDOM.render(
        React.createElement(ReactJkMusicPlayer),
        document.getElementById('music-player'),
    )

    let throttleTimer = null;
    let throttleDelay = 100;
    let $window = $(window);

    $window
        .off('scroll', scrollHandler)
        .on('scroll', scrollHandler);

    function scrollHandler(e) {
        clearTimeout(throttleTimer);
        throttleTimer = setTimeout(function () {
            // 顶部菜单是否开启高斯模糊
            if (window.scrollY > 0) {
                $(".blog-nav").css({"background-color": "rgba(57,61,73,.5)", "backdrop-filter": "blur(25px)"});
            } else if (window.scrollY === 0) {
                $(".blog-nav").css({"background-color": "rgb(57,61,73)", "backdrop-filter": "none"})
            }

        }, throttleDelay);
    }

})();