"use strict";

layui.use(["element", "layer", "carousel", "util", "flow", "form", "upload"],
    function () {
        let layer = layui.layer,
            carousel = layui.carousel,
            element = layui.element,
            flow = layui.flow,
            util = layui.util,
            form = layui.form;
        util.fixbar({
            bar1: "&#xe64a;",
            css: {bottom: 55},
            click: function (type) {
                //console.log(type);
                if (type === "bar1") {
                    let index = layer.load();
                    console.log(event);
                    let thumbnail = event.target || event.srcElement;
                    $.ajax({url: "/Home/TodayWallpaper"})
                        .done(function (result) {
                            let items = [];
                            for (let item of result) {
                                items.push({
                                    src: item["url"].replaceAll("1920x1080", "UHD"),
                                    w: 1920,
                                    h: 1080,
                                    title: item["copyRight"]
                                });
                            }
                            let options = {
                                index: 0,
                                bgOpacity: 0.7,
                                showHideOpacity: true,
                                history: true,
                                getThumbBoundsFn: function (index) {
                                    //let thumbnail = document.querySelectorAll(".layui-fixbar [lay-type=bar1]")[index];
                                    let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                                    let rect = thumbnail.getBoundingClientRect() || {left: 0, top: 0, width: 0};
                                    return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
                                }
                            };
                            let gallery = new PhotoSwipe(document.getElementById("gallery"), PhotoSwipeUI_Default, items, options);
                            gallery.init();
                        })
                        .always(function () {
                            layer.close(index);
                        });
                }
            }
        });
        flow.lazyimg();


        if (layui.device().mobile === false) {
            //雨滴背景
            try {
                const canvas = document.querySelector("#can-back-round");
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;

                const raindropFx = new RaindropFX({
                    canvas: canvas,
                    background:
                        dpzOption.isDark ? `https://cdn.dpangzi.com/wallpaper.jpg` : `${dpzOption.CDNBaseAddress}/../images/background.jpg`,
                });

                window.onresize = () => {
                    const rect = canvas.getBoundingClientRect();
                    raindropFx.resize(rect.width, rect.height);
                }
                raindropFx.start();
            } catch (e) {
                console.log(e);
            }
        }
    }
);