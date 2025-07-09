// noinspection t

"use strict";

(async function () {
    // 代码块工具
    //codeBlockTools();
    // 时间本地化
    moment.locale("zh-cn");
    // 延迟加载图片
    new LazyLoad({});
    // 通知授权
    if (Notification.permission !== "granted") {
        let result = await Notification.requestPermission(function (permission) {
            if (permission === "granted") {
                console.info("通知已授权");
            }
        });
        console.log(result);
    }
})();

$.fn.relativeTime = function () {
    this.each(function (index) {
        let status = $(this).data("timeStatus");
        if (typeof (status) === "undefined") {
            let datetime = $(this).attr("datetime");
            let text = $(this).text();
            let str = moment(datetime, "YYYY/MM/DD HH:mm:ss").fromNow();
            $(this).text(str).attr("title", text).data("timeStatus", "loaded");
        }
    });
}

function loadImages(images) {
    let promises = [];
    for (let i = 0; i < images.length; i++) {
        let img = images[i];
        let promise = new Promise((resolve, reject) => {
            if (img.complete) {
                resolve(img);
                return;
            }
            img.addEventListener("load", function () {
                if (img.complete) {
                    resolve(img);
                } else {
                    reject(img);
                }
            });
            img.addEventListener("error", function () {
                console.warn(`the image [${img.src}] loaded error.`);
                reject(img);
            });
        });
        promises.push(promise);
    }
    return Promise.all(promises);
}

/**
 * 高亮显示代码块
 */
function lightCode() {
    document.querySelectorAll("pre code").forEach((block) => {
        Prism.highlightElement(block);
    });
    codeBlockTools();
}

/**
 * 代码块工具栏
 */
function processBlockTools($preCode) {
    if($preCode.length === 0 || $preCode.parent().hasClass("code-area")){
        return;
    }
    $preCode.wrap('<div class="code-area" style="position: relative"></div>');
    let $codeArea = $preCode.parent();

    // 代码收缩
    let $codeExpand = $('<i class="fa fa-angle-up fa-fw code-expand" aria-hidden="true" title="折叠"></i>');
    $codeArea.prepend($codeExpand);
    $codeExpand.on('click', function () {
        if ($codeArea.hasClass('code-closed')) {
            $preCode.find('code').show();
            $preCode.find('.line-highlight').show();
            $(this).parent().removeClass('code-closed');
        } else {
            $preCode.find('code').hide();
            $preCode.find('.line-highlight').hide();
            $codeArea.addClass('code-closed');
        }
    });

    // 复制
    let $copyIcon = $('<i class="fa fa-copy fa-fw code_copy" title="复制代码" aria-hidden="true"></i>')
    let $notice = $('<div class="codecopy_notice"></div>')
    $codeArea.prepend($copyIcon)
    $codeArea.prepend($notice)

    // 复制
    $copyIcon.on('click', function () {
        let selection = window.getSelection()
        let range = document.createRange()
        range.selectNodeContents($preCode.find("code")[0])
        selection.removeAllRanges()
        selection.addRange(range)
        let text = selection.toString()
        copy(text, this)
        selection.removeAllRanges()
    });

    // 显示代码语言
    let $highlightLang = $('<div class="code_lang" title="代码语言"></div>');
    $preCode.before($highlightLang);
    $preCode.each(function () {
        // let codeLanguage = $(this).attr('class');
        // if (!codeLanguage) {
        //     return true;
        // };
        let classes = $(this).prop("class").split(/\s+/);
        for (let item of classes) {
            if (item.startsWith("language")) {
                let languageName = item.replace("language-", "").trim();
                $(this).siblings(".code_lang").text(languageName);
                break;
            }
        }
        //let langName = codeLanguage.replace("line-numbers", "").trim().replace("language-", "").trim();

    });
}

function codeBlockTools(){
    let $preCode = $('pre[class*=language-]');
    for(let item of $preCode){
        processBlockTools($(item));
    }
}

function copy(text, ctx) {
    if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
        try {
            document.execCommand('copy') // Security exception may be thrown by some browsers.
            layer.msg("复制成功");
        } catch (ex) {
            layer.msg("复制失败");
            return false;
        }
    } else {
        layer.msg("浏览器不支持");
    }
}

/**
 * 控制台输出成功信息
 * @param {string} message 输出消息
 */
function outPutSuccess(message) {
    console.log(`%c Success %c [${moment().format('YYYY-MM-DD HH:mm:ss')}]  %c ${message}`,
        'color: #bb0662; background: #030307; padding:5px 0;',
        'color: #fadfa3; background: #393d49; padding:5px 0',
        'font-weight:bold; color: black; background: #77f2e1; padding:5px 0;');
}

function outPutInfo(message) {
    console.log(`%c Info %c [${moment().format('YYYY-MM-DD HH:mm:ss')}]  %c ${message}`,
        'color: #bb0662; background: #030307; padding:5px 0;',
        'color: #fadfa3; background: #393d49; padding:5px 0',
        'font-weight:bold; color: black; background: #fadfa3; padding:5px 0;');
}

function outPutError(message) {
    console.log(`%c Error %c [${moment().format('YYYY-MM-DD HH:mm:ss')}]  %c ${message}`,
        'color: #bb0662; background: #030307; padding:5px 0;',
        'color: #fadfa3; background: #393d49; padding:5px 0',
        'font-weight:bold; color: black; background: red; padding:5px 0;');
}

/**
 * ajax 请求错误处理
 * @param {jqXHR} xhr
 * @param {string} textStatus
 * @param {any} errorThrown
 * */
function ajaxFail(xhr, textStatus, errorThrown) {
    console.log(xhr);
    console.log(textStatus);
    console.log(errorThrown);
    if (xhr.hasOwnProperty("responseJSON")
        && xhr["responseJSON"].hasOwnProperty("success")
        && xhr["responseJSON"].hasOwnProperty("msg")
        && xhr["responseJSON"]["success"] === false) {
        layer.alert(xhr["responseJSON"].msg);
    } else {
        layer.msg(`error:${xhr.status}`)
    }
}

let videoItems = [];

async function initVideoPlayer() {
    const playerId = "video-player";
    const mPlayerId = "m-video-player";
    const playerElement = document.getElementById(playerId) || document.getElementById(mPlayerId);

    if (playerElement !== null) {
        if (videoItems.length === 0) {
            let response = await fetch(`${dpzOption.webApiBaseAddress}/api/Video`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
                mode: 'cors'
            });
            videoItems = await response.json();
        }
        playerElement.style.marginBottom = "1em";
        if (window.innerWidth <= 550){
            playerElement.style.marginBottom = "4em";
        }
        playerElement.style.aspectRatio = "16/9";
        let index = Math.floor(Math.random() * videoItems.length);
        videoPlayer(playerElement, videoItems[index]["m3u8"], videoItems[index]["id"]);
    }

    const video = document.querySelector("[data-watch-video]");
    if (video !== null) {
        const data2 = JSON.parse(video.dataset.watchVideo);
        video.style.marginBottom = "1em";
        video.style.aspectRatio = "16/9";
        videoPlayer(video, data2["url"], data2["id"]);
    }
}

/**
 * 播放器
 * @param {Element} element
 * @param {String} videoSrc
 * @param {String} videoId
 * */
function videoPlayer(element, videoSrc, videoId) {
    const art = new Artplayer({
        container: element,
        url: videoSrc,
        type: "m3u8",
        fullscreenWeb: true,
        fullscreen: true,
        customType: {
            m3u8: playM3u8
        },
        plugins: [
            artplayerPluginDanmuku({
                danmuku: async function () {
                    let danmakuResponse = await fetch(`/history/danmaku/v2/${videoId}`);
                    return await danmakuResponse.json();
                }
            })
        ],
        controls: [],
    });

    art.on('artplayerPluginDanmuku:emit', async (danmaku) => {
        danmaku["id"] = videoId;
        await fetch(`/send/danmaku/v2`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(danmaku)
        });
    });

    function playM3u8(video, url, art) {
        if (Hls.isSupported()) {
            if (art.hls) art.hls.destroy();
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            art.hls = hls;
            art.on('destroy', () => hls.destroy());
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else {
            art.notice.show = 'Unsupported playback format: m3u8';
        }
    }
}


async function initFetchContent() {
    let fetchContents = document.querySelectorAll("[data-request]");
    for (let item of fetchContents) {
        let loaded = item.dataset["status"];
        if(loaded === "loaded"){
            continue;
        }
        let response = await fetch(item.dataset.request, {
            method: 'GET'
        });
        item.dataset["status"] = "loaded";
        item.innerHTML = await response.text();
        $("time.timeago").relativeTime();
        lightCode();
    }
}

function generateToc() {
    let toc = $(".js-toc");
    if (toc.length === 0) return;
    if ($(".article-detail-content").find("h1,h2,h3").length === 0) {
        tocbot.destroy();
        $("label.toc-icon.menu").hide();
        toc.hide();
        return;
    }
    tocbot.init({
        tocSelector: '.js-toc',
        contentSelector: '.article-detail-content',
        headingSelector: 'h1, h2, h3',
        hasInnerContainers: true,
    });
}