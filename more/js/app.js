'use strict';

let lazyLoadInstance;
$(function(){
    lazyLoadInstance = new LazyLoad({});
    
    $(document).delegate(".blogs img,.news-con img,.content-detail .content img","click",function(){
        let promises = [];
        let $images = $(".blogs img,.news-con img,.content-detail .content img");
        $images.each(function(index,img){
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
        });
        Promise.all(promises).then(x => {
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
            let options = {
                index: $images.index(this),
                mouseUsed: true,
                history: true
            };
            let gallery = new PhotoSwipe(document.getElementById("gallery"), PhotoSwipeUI_Default, items, options);
            gallery.init();
        }).finally(() => {});
    });

    // const canvas = document.querySelector("#wallpaper");
    // const rect = canvas.getBoundingClientRect();
    // canvas.width = rect.width;
    // canvas.height = rect.height;
    // const raindropFx = new RaindropFX({
    //     canvas: canvas,
    //     background: "https://cn.bing.com/th?id=OHR.CorkscrewSwamp_ZH-CN2637396790_1920x1080.jpg",
    // });
    // window.onresize = () => {
    //     const rect = canvas.getBoundingClientRect();
    //     raindropFx.resize(rect.width, rect.height);
    // }
    // raindropFx.start();
});
function showLazyImage(){
    lazyLoadInstance.update();
}
let isInitBanner = false; 
function initIndex(){
    if(!isInitBanner){
        
        isInitBanner = true;
    }
    $('#banner').easyFader();

    // let elm = jQuery('#gd');
    // let startPos = jQuery(elm).offset().top;
    // jQuery.event.add(window, "scroll", function () {
    //     let p = jQuery(window).scrollTop();
    //     jQuery(elm).css('position', ((p) > startPos) ? 'fixed' : '');
    //     jQuery(elm).css('top', ((p) > startPos) ? '0' : '');
    // });
}

function appInit(){
    new scrollReveal({ reset: true });
    
    let new_scroll_position = 0;
    let last_scroll_position;
    let header = document.getElementById("header");

    window.addEventListener('scroll', function (e) {
        last_scroll_position = window.scrollY;

        if (new_scroll_position < last_scroll_position && last_scroll_position > 80) {
            header.classList.remove("slideDown");
            header.classList.add("slideUp");

        } else if (new_scroll_position > last_scroll_position) {
            header.classList.remove("slideUp");
            header.classList.add("slideDown");
        }

        new_scroll_position = last_scroll_position;
    });
}

function articleInit(){
    new scrollReveal({ reset: true });
}

function topicInit(){
    new scrollReveal({ reset: true });
}
let ap = null;
function playerInit(){
    ap = new APlayer({
        container: document.getElementById("music-player"),
        lrcType: 3,
        fixed: true
    });
}
function playerAddList(list){
    if(ap !== null)
        ap.list.add(list);
}